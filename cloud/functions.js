Parse.Cloud.define('hello', req => {
  req.log.info(req)
  return 'Hi'
})

Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  req.log.info(req)
  return 'Hi async'
})

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.')
})

Parse.Cloud.define('getServerTime', (request) => {
  const dateToday = new Date()
  return dateToday.valueOf()
})

// Add admin read and write to a user on a new entry
Parse.Cloud.beforeSave(Parse.User, async (request) => {
    const user = request.object
    const acl = new Parse.ACL()
    acl.setRole(true)
    acl.setRoleReadAccess('admin', true)
    acl.setRoleWriteAccess('admin', true)
    user.setACL(acl)
    return user.save(null, { useMasterKey: true })
    },
)