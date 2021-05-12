const insertTransaction = require('./manageDB').insertTransaction;
const WebSocket = require('ws');

WSS_SERVER='wss://ws.mynano.ninja/';
NANO_ADDRESS='nano_11g7sktw95wxhq65zoo3xzjyodazi8d889abtzjs1cd7c8rnxazmqqxprdr7'

function startWatch(server=WSS_SERVER, address) {
  // Setup WebSocket
  const socket = new WebSocket(server);

  // Called when WebSocket is opened successfully
  socket.onopen = function() {
    console.log('WebSocket is now open');
    
    ping();
    unsubscribe_addresses();
    subscribe_addresses([address]);
  }

  // Called when WebSocket fails to open
  socket.onerror = function(e) {
    console.error('Unable to set up WebSocket');
      console.error(e);
  }

  // Called with each new inbound WebSocket message
  socket.onmessage = function(response) {
    let data = JSON.parse(response.data);

    if (data['topic'] == 'confirmation' ) {
      const hash = data['message']['hash'];
      const account = data['message']['account'];
      const amount = data['message']['amount'];
      const date = Math.floor(new Date().getTime() / 1000);
      const type = data['message']['block']['subtype'];

      insertTransaction(hash, account, amount, date, type);
    } 
    
    console.log(data);
  }

  // Action to subscribe to a particular address
  const subscribe_addresses = function(addresses) {
    let input = {
      action: 'subscribe',
      topic: 'confirmation',
      ack: true,
      options: {
        accounts: addresses
      }
    }

    return socket.send(JSON.stringify(input));
  }

  // Action to subscribe to a particular address
  const unsubscribe_addresses = function(addresses) {
    let input = {
      action: 'unsubscribe',
      topic: 'confirmation',
      ack: true,
      options: {
        accounts: addresses
      }
    }

    return socket.send(JSON.stringify(input));
  }

  // Action to send ping
  const ping = function() {
    let input = {
      action: 'ping'
    }

    return socket.send(JSON.stringify(input));
  }
}