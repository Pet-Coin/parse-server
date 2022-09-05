interface VerifyEvmData {
  chainId: string,
  nonce: string,
  address: string,
  version: string,
  domain: string,
  expirationTime: string,
  notBefore: string,
  resources: string,
  statement: string,
  uri: string
}
async function validateAuthData (authData: any) {
  console.log('Validate auth data')
  console.log(process.env.MORALIS_API_KEY)
  console.log({ message: authData.message })
  console.log({ signature: authData.signature })
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-KEY': 'uw4HKRsp2yKyiKKnJkY8fEKE9o0LcGY7nC6zYmFaV3yM9t5gOclTvsRYM8o6wV5r'
    },
    body: JSON.stringify({ message: authData.message, signature: authData.signature })
  }
  const { default: fetch } = await import('node-fetch')

  return await fetch('https://authapi.moralis.io/challenge/verify/evm', options)
    .then(async result => {
      console.log('results')

      const data = (await result.json()) as VerifyEvmData
      authData = {
        ...authData,
        chainId: data.chainId,
        nonce: data.nonce,
        address: data.address.toLowerCase(),
        version: data.version,
        domain: data.domain,
        expirationTime: data.expirationTime,
        notBefore: data.notBefore,
        resources: data.resources,
        statement: data.statement,
        uri: data.uri
      }

      return authData
    })
    .then(response => console.log(response))
    .catch(err => console.error(err))
}

function validateAppId () {
  return Promise.resolve()
}

module.exports = {
  validateAuthData,
  validateAppId
}
