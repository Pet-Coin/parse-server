// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import * as MoralisAuthAdapter from './src/MoralisAuthAdapter'
const express = require('express')
const ParseServer = require('parse-server').ParseServer
const ParseDashboard = require('parse-dashboard')
const path = require('path')
const { cleanEnv, num, str } = require('envalid')
const dotenv = require('dotenv')
const args = process.argv || []
const test = args.some(arg => arg.includes('jasmine'))
const Moralis = require('moralis').default

const port = process.env.PORT || 1337

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express()
// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')))

dotenv.config()
const config = cleanEnv(process.env, {
  PORT: num(),
  MORALIS_API_KEY: str(),

  DATABASE_URI_STAGING: str(),
  DATABASE_URI_PRODUCTION: str(),

  CLOUD_PATH: str(),

  MASTER_KEY_STAGING: str(),
  MASTER_KEY_PRODUCTION: str(),

  SERVER_URL_STAGING: str(),
  SERVER_URL_PRODUCTION: str()
})

// Serve the Parse API on the /parse URL prefix
if (!test) {
  const parseServerStaging = new ParseServer({
    databaseURI: config.DATABASE_URI_STAGING,
    cloud: config.CLOUD_PATH,
    appId: 'pets-staging',
    masterKey: config.MASTER_KEY_STAGING,
    serverURL: config.SERVER_URL_STAGING,
    sessionLength: 60 * 60 * 24 * 30,
    auth: {
      moralis: {
        module: MoralisAuthAdapter
      }
    }
  })

  const parseServerProduction = new ParseServer({
    databaseURI: config.DATABASE_URI_PRODUCTION,
    cloud: config.CLOUD_PATH,
    appId: 'pets-production',
    masterKey: config.MASTER_KEY_PRODUCTION,
    serverURL: config.SERVER_URL_PRODUCTION,
    sessionLength: 60 * 60 * 24 * 30,
    auth: {
      moralis: {
        module: MoralisAuthAdapter
      }
    }
  })
  const parseDashboard = new ParseDashboard(
    {
      trustProxy: true,
      apps: [
        {
          appId: 'pets-staging',
          masterKey: config.MASTER_KEY_STAGING,
          serverURL: config.SERVER_URL_STAGING,
          appName: 'Staging Pets'
        },
        {
          appId: 'pets-production',
          masterKey: config.MASTER_KEY_PRODUCTION,
          serverURL: config.SERVER_URL_PRODUCTION,
          appName: 'Production Pets',
          production: true
        }
      ],
      users: [
        { user: 'frozies', pass: '$2a$10$XvrnZ7bm7Pb9A1UmphnQweVMSUyzxFZ3b7b8VPgOOqg4OnXwnPCQu' },
        { user: 'bigdickmcgee', pass: '$2a$10$wMPUmp7Pnn7iYqpCXPxCh.jsdHv6IH45qcK.YLYPsv.h0d2lU1CvG' },
        { user: 'justin', pass: '$2a$10$ipiHlX3Y3nTq8c82okH.0OYcinSdMmYk2NoQHkd1vL.fWxRiycQze' }
      ],
      useEncryptedPasswords: true
    }
  )
  Moralis.start({ apiKey: process.env.MORALIS_API_KEY })

  app.use('/production', parseServerProduction)
  app.use('/staging', parseServerStaging)
  app.use('/', parseDashboard)
}

const httpServer = require('http').createServer(app)
httpServer.listen(port, function () {
  console.log('parse-server-example running on port ' + port + '.')
})
// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer)

module.exports = {
  app,
  config
}
