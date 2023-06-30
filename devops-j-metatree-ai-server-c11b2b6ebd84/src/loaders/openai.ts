import { Configuration, OpenAIApi } from 'openai';

import { config } from '@/configs';

const openaiApiKey = config.open_api_key;

const configuration = new Configuration({
	apiKey: openaiApiKey
});

const openai = new OpenAIApi(configuration);

export default openai;
