// Note: do not import Parse dependency. see https://github.com/parse-community/parse-server/issues/6467
const Moralis = require('moralis').default

async function validateAuthData(authData) {
  const { message, signature, id, authId } = authData;
  console.log('authData')
  console.log(authData)

  await Moralis.start({apiKey: process.env.MORALIS_API_KEY})

  return await Moralis.Auth.verify({
    message,
    signature,
    network: 'evm',
  })
    .then(result => {
      console.log('results')
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
    .catch((e) => {
      // @ts-ignore (see note at top of file)
      throw new Error(e);
    });
}

function validateAppId() {
  return Promise.resolve();
}

module.exports = {
  validateAuthData,
  validateAppId,
};
