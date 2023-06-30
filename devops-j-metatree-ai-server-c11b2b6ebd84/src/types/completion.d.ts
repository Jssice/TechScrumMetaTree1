// Reference: https://platform.openai.com/docs/api-reference/chat/create
// Reference: https://platform.openai.com/docs/models

interface IChatCompletionConfig {
	user: string; // A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
	model: string;
	max_tokens: number;
	temperature: number;
	stream?: boolean;
}

interface IChatMessageRequest {
	role: 'system' | 'user' | 'assistant';
	content: string;
	name?: string;
}
