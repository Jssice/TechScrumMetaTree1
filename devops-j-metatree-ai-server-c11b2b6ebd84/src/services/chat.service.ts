import { NextFunction, Request, Response } from 'express';
import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseMemory } from 'langchain/memory';
import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate
} from 'langchain/prompts';

import { DEFAULT_CHAT_SYSTEM_MESSAGE, DEFAULT_CHAT_TTL } from '@/constants/chat';
import chatHistoryCache from '@/loaders/nodeCache';
import AppError from '@/utils/appError';
import generateChatHistoryBufferMemory from '@/utils/generateChatHistoryBufferMemory';

export const sendChatMessage = async (_req: Request, res: Response, next: NextFunction) => {
	const {
		config = {},
		chatSessionId,
		message,
		chatHistory,
		systemMessage = DEFAULT_CHAT_SYSTEM_MESSAGE,
		hasChatHistory
	} = _req.body;
	try {
		const userId = res.locals.auth?.id;
		// ====== Chat History Memory ======
		const memoryKey = `langchain_${userId}_${chatSessionId}`;
		let memory: BaseMemory | undefined = chatHistoryCache.get(memoryKey);
		// update chat history memory if needed
		if (chatHistory) {
			memory = generateChatHistoryBufferMemory(memoryKey, chatHistory);
		} else {
			if (hasChatHistory) {
				if (!memory) {
					// indicate that chat history is not found
					return {
						code: 404,
						message: 'Chat history not found'
					};
				}
			} else {
				// set empty chat history memory
				memory = generateChatHistoryBufferMemory(memoryKey);
			}
		}
		if (hasChatHistory && !chatHistory && !memory) {
			// indicate that chat history is not found
			return {
				code: 404,
				message: 'Chat history not found'
			};
		}
		// ====== Chat ======
		const chat = new ChatOpenAI({
			...config,
			temperature: 0.9
		});
		const chatPrompt = ChatPromptTemplate.fromPromptMessages([
			SystemMessagePromptTemplate.fromTemplate(systemMessage),
			HumanMessagePromptTemplate.fromTemplate('{input}')
		]);
		const chain = new ConversationChain({
			memory,
			prompt: chatPrompt,
			llm: chat
		});
		const response = await chain.call({ input: message });

		// update chat history memory
		chatHistoryCache.set(memoryKey, chain.memory, DEFAULT_CHAT_TTL);

		return response;
	} catch (err) {
		if (err instanceof Error) {
			return next(new AppError('Server error', 500, err));
		}
	}
};
