interface IChatConfig {
	modelName: string;
	max_tokens: number;
	temperature: number;
}

interface IChatHistoryMessage {
	role: 'human' | 'ai';
	content: string;
}

interface IChatMemory {
	memoryKey: string;
	messages: IChatHistoryMessage[];
}
