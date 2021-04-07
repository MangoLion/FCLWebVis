const { server } = require('./app')
require('./socket') // init sockets

// Start listening
const PORT = process.env.PORT || 8070
server.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})