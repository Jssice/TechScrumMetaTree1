import openai from '@/loaders/openai';

export const getModelList = async () => {
	try {
		const response = await openai.listModels();

		return response?.data?.data;
	} catch (err) {
		throw err;
	}
};

export const getModelByName = async (modelName: string) => {
	try {
		const response = await openai.retrieveModel(modelName);

		return response?.data;
	} catch (err) {
		throw err;
	}
};
