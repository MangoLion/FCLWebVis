const SOCKET_EVENTS = {
  SUBMIT: 'task submit',
  FILE_SUBMIT: 'file submit'
}

const uniqueObjValues = require('../../../helpers/uniqueObjValues')
uniqueObjValues(SOCKET_EVENTS)

module.exports = {
  SOCKET_EVENTS,
}
