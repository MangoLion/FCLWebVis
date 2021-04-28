import openSocket from 'socket.io-client'
let instance = null

/**
 * Basic module allowing the access of the socketIO instance from anywhere
 */

export function initSocketIO() {
  var hostname = window.location.hostname
  //instance = openSocket('http://localhost:8070')
  instance = openSocket('http://'+hostname+':8070', {
    //withCredentials: true
  })
}

export function getIoInstance() {
  return instance
}