import axios from 'axios';

import { DEV } from '../constants/env';
import createToken from '../utils/createToken';

enum EMapLangChainRoleToOpenAI {
	human = 'user',
	ai = 'assistant'
}
interface IChatHistoryMessage {
	role: 'human' | 'ai';
	content: string;
}
const DEFAULT_CHAT_SYSTEM_MESSAGE =
	'The following is a friendly conversation between a human and an AI. The AI are a friendly assistant. If the AI does not know the answer to a question, it truthfully says it does not know. When asked the name of AI, the AI must respond with its name with "Metatree AI". The AI is built and developed by "Metatree AI Lab".';

export const sendChatMessage = async (data: ISendChatMessageData, userId: string) => {
	if (process.env.NODE_ENV === DEV) {
		const authorization = createToken({
			id: userId
		});
		return await axios({
			method: 'post',
			headers: {
				authorization
			},
			url: `${process.env.METATREE_AI_SERVER_URL}/api/v1/metatreeai/chat/completions?stream=true`,
			responseType: 'stream',
			data
		});
	} else {
		const { config = {}, message, chatHistory } = data;
		return await axios({
			method: 'post',
			url: 'https://api.openai.com/v1/chat/completions',
			headers: {
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
			},
			data: {
				model: 'gpt-3.5-turbo',
				temperature: 0.9,
				user: userId,
				stream: true,
				...config,
				messages: [
					{
						role: 'system',
						content: DEFAULT_CHAT_SYSTEM_MESSAGE
					},
					...(chatHistory as IChatHistoryMessage[]).map(message => ({
						role: EMapLangChainRoleToOpenAI[message.role],
						content: message.content
					})),
					{
						role: 'user',
						content: message
					}
				]
			},
			responseType: 'stream'
		});
	}
};

export default sendChatMessage;
