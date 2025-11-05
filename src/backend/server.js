require('dotenv').config();
const App = require('./app');
const database = require('./config/database');
const appConfig = require('./config/app');
const Logger = require('./utils/Logger');

const logger = new Logger('Server');

/**
 * شروع سرور
 */
async function startServer() {
  try {
    // اتصال به پایگاه داده
    logger.info('Connecting to database...');
    await database.connect();
    logger.info('Database connected successfully');

    // ایجاد اپلیکیشن
    const appInstance = new App();
    const app = appInstance.getApp();

    // شروع سرور
    const server = app.listen(appConfig.port, () => {
      logger.info(`Server is running on port ${appConfig.port}`);
      logger.info(`Environment: ${appConfig.env}`);
      logger.info(`API Base Path: ${appConfig.getApiPath()}`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await database.disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await database.disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// شروع سرور
startServer();

