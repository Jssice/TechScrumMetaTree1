import { pick } from 'lodash';
import payload from 'payload';
import { CollectionConfig } from 'payload/types';

import { MAX_CONVERSATION_ONE_RESPONSE_TOKENS, MAX_CONVERSATION_TOKENS } from '../constants/chat';
import { EMessageRole } from '../constants/roles';
import { sendChatMessage } from '../services/chat';
import { adminOrOwner } from './access/adminOrOwner';
import { admins } from './access/admins';
import { isLoggedIn } from './access/isLoggedIn';
import { setUserBeforeCreate } from './hooks/setUserBeforeCreate';

const Conversations: CollectionConfig = {
	slug: 'conversations',
	labels: {
		singular: {
			en: 'Conversation',
			zh: '对话'
		},
		plural: {
			en: 'Conversations',
			zh: '对话'
		}
	},
	access: {
		read: adminOrOwner({
			isDeleted: {
				equals: false
			}
		}),
		create: isLoggedIn,
		update: adminOrOwner({
			isDeleted: {
				equals: false
			}
		}),
		delete: admins,
		admin: admins
	},
	hooks: {
		// Insert user id into req body from JWT
		beforeChange: [setUserBeforeCreate]
	},
	fields: [
		{
			name: 'title',
			type: 'text',
			label: {
				en: 'Title',
				zh: '标题'
			},
			required: true
		},
		{
			name: 'messages',
			type: 'array',
			label: {
				en: 'Messages',
				zh: '消息'
			},
			defaultValue: [],
			fields: [
				{
					name: 'role',
					type: 'select',
					required: true,
					options: [
						{
							label: 'Human',
							value: EMessageRole.HUMAN
						},
						{
							label: 'AI',
							value: EMessageRole.AI
						}
					]
				},
				{
					name: 'content',
					type: 'text',
					required: true
				}
			]
		},
		{
			name: 'isDeleted',
			type: 'checkbox',
			label: {
				en: 'Is Deleted',
				zh: '已删除'
			},
			defaultValue: false,
			access: {
				read: admins
			}
		},
		{
			name: 'user',
			type: 'relationship',
			label: {
				en: 'User',
				zh: '用户'
			},
			relationTo: 'users',
			required: true,
			access: {
				read: admins
			}
		},
		{
			name: 'chatCacheUpdatedAt',
			type: 'date',
			label: {
				en: 'Chat Cache Updated At',
				zh: '聊天缓存更新时间'
			},
			access: {
				read: admins
			}
		},
		{
			name: 'tokenUsage',
			type: 'number',
			label: {
				en: 'Token Usage',
				zh: '令牌使用量'
			},
			defaultValue: 0,
			access: {
				read: admins
			}
		}
	],
	endpoints: [
		{
			path: '/mine',
			method: 'get',
			handler: async (req, res) => {
				try {
					const { user } = req;
					const conversations = await payload.find({
						collection: 'conversations',
						where: {
							user: {
								equals: user?.id
							},
							isDeleted: {
								equals: false
							}
						},
						sort: '-updatedAt',
						depth: 0,
						pagination: false
					});

					res.status(200).json({
						...conversations,
						docs: conversations.docs.map(conversation =>
							pick(conversation, ['id', 'title', 'updatedAt'])
						)
					});
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		},
		{
			path: '/:id',
			method: 'delete',
			handler: async (req, res) => {
				try {
					const { user } = req;
					if (!user) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}

					const { id } = req.params;
					// If the user is admin, then delete the conversation
					// If the user is not admin and messages of the conversation is empty, then delete the conversation
					const deletedConversation = await payload.delete({
						collection: 'conversations',
						where: {
							and: [
								{
									id: {
										equals: id
									}
								},
								...(admins({
									req: {
										user: req.user
									}
								})
									? []
									: [
											{
												user: {
													equals: req.user.id
												}
											},
											{
												messages: {
													equals: []
												}
											}
									  ])
							]
						}
					});
					if (deletedConversation.docs.length > 0) {
						res.status(200).send({
							success: true
						});
					} else {
						// If messages of the conversation is not empty, then mark the conversation as deleted
						const updatedConversation = await payload.update({
							collection: 'conversations',
							where: {
								and: [
									{
										id: {
											equals: id
										}
									},
									{
										user: {
											equals: req.user?.id
										}
									},
									{
										isDeleted: {
											equals: false
										}
									}
								]
							},
							data: {
								isDeleted: true
							}
						});

						if (updatedConversation.docs.length > 0) {
							res.status(200).send({
								success: true
							});
						} else {
							res.status(404).json({
								error: 'Conversation not found'
							});
						}
					}
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		},
		{
			path: '/:id/sendMessage',
			method: 'post',
			handler: async (req, res) => {
				let sendMessageResponse;
				try {
					const { user } = req;
					if (!user) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}
					// License validation check
					const licenses = await payload.find({
						collection: 'licenses',
						where: {
							assignee: {
								equals: req.user.id
							}
						},
						depth: 0,
						pagination: false
					});
					if (!licenses.docs[0] || !licenses.docs[0].isValid) {
						return res.status(425).json({
							error: 'License is invalid'
						});
					}

					const { id } = req.params;
					const { message } = req.body;
					const { id: messageId, content } = message;

					// check if the user's conversation exists
					const conversation = await findValidConversation(id, user.id);
					if (!conversation) {
						res.status(404).json({
							error: 'Conversation not found'
						});
						return;
					}

					// check token usage
					const maxTokens = MAX_CONVERSATION_TOKENS - conversation.tokenUsage;
					if (maxTokens < 50) {
						res.status(424).json({
							error: 'Conversation token usage exceeded'
						});
						return;
					}

					// chat history
					let chatHistory = conversation.messages || [];
					// regenerate messages if messageId is provided
					if (messageId) {
						// slice messages before the human message to regenerate
						const messageIndex = chatHistory.findIndex(
							message =>
								message.id === messageId && message.role === EMessageRole.HUMAN
						);
						if (messageIndex < 0) {
							res.status(404).json({
								error: 'Human message not found'
							});
							return;
						}
						chatHistory = chatHistory.slice(0, messageIndex);
					}

					// update conversation with human message
					await payload.update({
						collection: 'conversations',
						id: conversation.id,
						data: {
							messages: [
								...chatHistory,
								{
									role: EMessageRole.HUMAN,
									content
								}
							]
						}
					});

					// send message to Metatree AI server
					const sendMessagePayload = {
						config: {
							stream: true,
							max_tokens:
								maxTokens > MAX_CONVERSATION_ONE_RESPONSE_TOKENS
									? MAX_CONVERSATION_ONE_RESPONSE_TOKENS
									: maxTokens
						},
						chatHistory,
						message: content
					};
					sendMessageResponse = await sendChatMessage(sendMessagePayload, req.user.id);

					sendMessageResponse.data.pipe(res);
					sendMessageResponse.data.on('end', () => {
						return res.end();
					});
				} catch (error) {
					if (sendMessageResponse) {
						sendMessageResponse.data.pipe(res);
						sendMessageResponse.data.on('end', () => {
							return res.end();
						});
					} else if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		},
		{
			path: '/:id/messages',
			method: 'patch',
			handler: async (req, res) => {
				try {
					const { user } = req;
					if (!user) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}

					const { id } = req.params;
					const { messages = [], tokenUsage = 0 } = req.body;
					// check if the user's conversation exists
					const conversation = await findValidConversation(id, user.id);
					if (!conversation) {
						res.status(404).json({
							error: 'Conversation not found'
						});
						return;
					}

					// update conversation
					const updatedConversation = await payload.update({
						collection: 'conversations',
						id: conversation.id,
						data: {
							messages: [...conversation.messages, ...messages],
							tokenUsage: conversation.tokenUsage + Math.abs(tokenUsage)
						}
					});

					// update license token usage
					if (tokenUsage) {
						const licenses = await payload.find({
							collection: 'licenses',
							where: {
								assignee: {
									equals: req.user.id
								}
							},
							depth: 0,
							pagination: false
						});
						const license = licenses.docs[0];
						if (license) {
							await payload.update({
								collection: 'licenses',
								id: license.id,
								data: {
									tokenUsage: license.tokenUsage + Math.abs(tokenUsage)
								}
							});
						}
					}

					res.status(200).json(updatedConversation);
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		},
		{
			path: '/:id/messages/:messageId',
			method: 'delete',
			handler: async (req, res) => {
				try {
					const { user } = req;
					if (!user) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}

					const { id, messageId } = req.params;
					// check if the conversation exists
					const conversations = await payload.find({
						collection: 'conversations',
						where: {
							and: [
								{
									id: {
										equals: id
									}
								},
								{
									user: {
										equals: user.id
									}
								},
								{
									isDeleted: {
										equals: false
									}
								}
							]
						}
					});
					const conversation = conversations.docs[0];
					if (!conversation) {
						res.status(404).json({
							error: 'Conversation not found'
						});
						return;
					}
					// delete message
					const messageIndex = conversation.messages.findIndex(
						message => message.id === messageId && message.role === EMessageRole.HUMAN
					);
					if (messageIndex < 0) {
						res.status(404).json({
							error: 'Human message not found'
						});
						return;
					}
					const messages = conversation.messages.slice(0, messageIndex);
					const updatedConversation = await payload.update({
						collection: 'conversations',
						id: conversation.id,
						data: {
							messages
						}
					});
					res.status(200).json(updatedConversation);
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		}
	]
};

export default Conversations;

const findValidConversation = async (id: string, userId: string) => {
	const conversations = await payload.find({
		collection: 'conversations',
		where: {
			and: [
				{
					id: {
						equals: id
					}
				},
				{
					user: {
						equals: userId
					}
				},
				{
					isDeleted: {
						equals: false
					}
				}
			]
		}
	});
	return conversations.docs[0];
};
