import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = swaggerJsDoc({
	definition: {
		openapi: '3.0.0',
		info: {
			version: '1.0.0',
			title: 'Metatree AI API Doc'
		}
	},
	apis: ['src/controllers/*.ts']
});

export default swaggerOptions;
