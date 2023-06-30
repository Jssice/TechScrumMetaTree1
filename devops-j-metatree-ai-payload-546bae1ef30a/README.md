# metatree-ai-payload

This project was created using create-payload-app (Payload CMS) with MongoDB and TypeScript.

## How to Use

Launch Metatree AI server
(node.js: version **16.x**)

```bash
$ git clone https://username@bitbucket.org/jiang_ren/metatree-ai-payload.git
$ cd metatree-ai-payload
$ npm run copy:env    # make a .env copy in your local, and put in your secrets
$ npm install
$ npm run dev    # visit http://localhost:3000
```

# Type generator, remember to run this command before commit if you change any schema

```
$ npm run generate:types
```

### Docker

If you have docker and docker-compose installed, you can run `docker-compose up`

To build the docker image, run `docker build -t my-tag .`

Ensure you are passing all needed environment variables when starting up your container via `--env-file` or setting them with your deployment.

The 3 typical env vars will be `MONGODB_URI`, `PAYLOAD_SECRET`, and `PAYLOAD_CONFIG_PATH`

`docker run --env-file .env -p 3000:3000 my-tag`

### Admin Account

email: admin@metatreeai.com
password: admin
