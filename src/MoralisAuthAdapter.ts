
async function validateAuthData(authData) {
  console.log('Validate auth data');
  console.log(process.env.MORALIS_API_KEY);
  console.log({ message: authData.message });
  console.log({ signature: authData.signature });
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-KEY': 'uw4HKRsp2yKyiKKnJkY8fEKE9o0LcGY7nC6zYmFaV3yM9t5gOclTvsRYM8o6wV5r'
    },
    body: JSON.stringify({message: authData.message, signature: authData.signature})
  };
  const {default: fetch} = await import("node-fetch");

  return await fetch('https://authapi.moralis.io/challenge/verify/evm', options)
    .then(async result => {
      console.log('results');

      // @ts-ignore
        const data: {
          chainId: string,
          nonce: number,
          address: string,
          version: string,
          domain: string,
          expirationTime: string,
          notBefore: string,
          resources: string,
          statement: string,
          uri: string
      } = await result.json()
        authData.chainId = data.chainId;
        authData.nonce = data.nonce;
        authData.address = data.address.toLowerCase();
        authData.version = data.version;
        authData.domain = data.domain;
        authData.expirationTime = data.expirationTime;
        authData.notBefore = data.notBefore;
        authData.resources = data.resources;
        authData.statement = data.statement;
        authData.uri = data.uri;
      return authData
    })
    .then(response => console.log(response))
    .catch(err => console.error(err));
}

function validateAppId() {
  return Promise.resolve();
}

module.exports = {
  validateAuthData,
  validateAppId,
};
