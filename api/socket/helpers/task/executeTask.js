const { TASK_FUNCS } = require('../constants/task')

const executeTask = ({ name, id,params, data }, socket) => {
  socket && socket.emit('progress', {
    sending: 100,
    processing: 100,
    receiving: 0
  })

  const result = TASK_FUNCS[name](params, data)

  socket && socket.emit('results', result)
  socket && socket.emit('progress', {
    sending: 100,
    processing: 100,
    receiving: 100,
  })

  return result

  //console.log(result.fileContent)
}

module.exports = executeTask
