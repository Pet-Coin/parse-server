interface VerifyEvmData {
  chainId: string,
  nonce: string,
  address: string,
  version: string,
  domain: string,
  expirationTime: string,
  statement: string,
  uri: string
}
export async function validateAuthData (authData: any) {
  console.log('Validate auth data')
  console.log({ message: authData.message })
  console.log({ signature: authData.signature })
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.MORALIS_API_KEY
    },
    body: JSON.stringify({ message: authData.message, signature: authData.signature })
  }
  const { default: fetch } = await import('node-fetch')

  return await fetch('https://authapi.moralis.io/challenge/verify/evm', options)
    .then(async result => {
      console.log('results')

      const data = (await result.json()) as VerifyEvmData

      // @ts-ignore
      if (data.statusCode === 400) {
        throw new Error('Failed validating Signature.')
      }
      console.log(data)
      authData = {
        ...authData,
        chainId: data.chainId,
        nonce: data.nonce,
        address: data.address.toLowerCase(),
        version: data.version,
        domain: data.domain,
        expirationTime: data.expirationTime,
        statement: data.statement,
        uri: data.uri
      }

      return authData
    })
    .then(response => console.log(response))
    .catch(err => console.error(err))
}

export function validateAppId () {
  return Promise.resolve()
}
