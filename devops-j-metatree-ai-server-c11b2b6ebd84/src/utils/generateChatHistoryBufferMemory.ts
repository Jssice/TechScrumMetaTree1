import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { AIChatMessage, HumanChatMessage } from 'langchain/schema';

const generateChatHistoryBufferMemory = (
	memoryKey: string,
	chatHistory: IChatHistoryMessage[] = []
) => {
	const chatHistoryMemory = new BufferMemory({
		memoryKey,
		chatHistory: new ChatMessageHistory(
			chatHistory.map(message => {
				switch (message.role) {
					case 'ai':
						return new AIChatMessage(message.content || '');
					default:
						return new HumanChatMessage(message.content || '');
				}
			})
		),
		returnMessages: true
	});
	return chatHistoryMemory;
};

export default generateChatHistoryBufferMemory;
