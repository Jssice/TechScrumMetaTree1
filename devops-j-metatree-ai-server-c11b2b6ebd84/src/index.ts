import { config } from '@/configs';
import { express } from '@/loaders';
import { logger } from '@/utils/logger';

// Boot express
const port = config.port;

// Start server
express.listen(port, () => logger.info(`Metatree AI Server is listening on port ${port}!`));
