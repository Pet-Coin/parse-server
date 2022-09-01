// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const Moralis = require('moralis');
const {cleanEnv, num, str, bool} = require("envalid");
const dotenv = require('dotenv');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));

const port = process.env.PORT || 1337;

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));
function validateAuthData(authData) {
  const { message, signature, network, id, authId } = authData;

  return Moralis.Auth.verify({
    message,
    signature,
    network,
  })
    .then(result => {
      const data = result.toJSON();

      if (id === data.profileId && authId === data.id) {
        authData.chainId = result.result.chain.decimal;
        authData.nonce = data.nonce;
        authData.address = result.result.address.checksum;
        authData.version = data.version;
        authData.domain = data.domain;
        authData.expirationTime = data.expirationTime;
        authData.notBefore = data.notBefore;
        authData.resources = data.resources;
        authData.statement = data.statement;
        authData.uri = data.uri;
        return;
      }

      // @ts-ignore (see note at top of file)
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Moralis auth failed, invalid data');
    })
    .catch(() => {
      // @ts-ignore (see note at top of file)
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Moralis auth failed, invalid data');
    });
}

function validateAppId() {
  return Promise.resolve();
}
dotenv.config();
const config = cleanEnv(process.env, {
  PORT: num(),
  MORALIS_API_KEY: str(),

  DATABASE_URI: str(),

  CLOUD_PATH: str(),
  APP_NAME: str(),

  MASTER_KEY: str(),
  APPLICATION_ID: str(),

  ALLOW_INSECURE_HTTP: bool({ default: false }),
});

const SERVER_URL = `http://localhost:${port}/server`

// Serve the Parse API on the /parse URL prefix
if (!test) {
  const parseServer = new ParseServer({
    databaseURI: config.DATABASE_URI,
    cloud: config.CLOUD_PATH,
    appId: config.APPLICATION_ID,
    masterKey: config.MASTER_KEY,
    serverURL: SERVER_URL,
    auth: {
      moralis: {
        module: {
          validateAuthData,
          validateAppId,
        },
      },
    },
  });
  const parseDashboard = new ParseDashboard(
    {
      apps: [
        {
          appId: config.APPLICATION_ID,
          masterKey: config.MASTER_KEY,
          serverURL: SERVER_URL,
          appName: config.APP_NAME,
        },
      ],
      allowInsecureHTTP: true,
      users: [
        {
          user: 'davin',
          pass: 'pass'
        }
      ]
    },
  );

  app.use('/server', parseServer);
  app.use('/dashboard', parseDashboard);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
