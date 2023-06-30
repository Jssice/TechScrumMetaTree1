import { OpenAI } from 'langchain/llms/openai';

import { config } from '@/configs';

const openaiApiKey = config.open_api_key;

const langChainOpenai = new OpenAI({
	modelName: 'gpt-3.5-turbo',
	openAIApiKey: openaiApiKey
});

export default langChainOpenai;
