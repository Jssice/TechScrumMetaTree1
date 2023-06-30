interface ISendChatMessageData {
	chatHistory?: IChatMessage[];
	message: string;
	config?: Partial<IChatConfig>;
}

interface IChatMessage {
	role: 'human' | 'ai';
	content: string;
}

interface IChatConfig {
	maxTokens: number;
	max_tokens: number;
	temperature: number;
	stream: boolean;
}

interface IChatCompletionMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface ISendChatCompletionMessageData {
	messages: IChatCompletionMessage[];
}
