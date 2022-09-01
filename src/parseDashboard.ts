import ParseDashboard from 'parse-dashboard';
import config from './config';

// @ts-ignore
export const parseDashboard = new ParseDashboard(
  {
    apps: [
      {
        appId: config.APPLICATION_ID,
        masterKey: config.MASTER_KEY,
        serverURL: config.SERVER_URL,
        appName: config.APP_NAME,
      },
    ],
  },
  config.ALLOW_INSECURE_HTTP
);
