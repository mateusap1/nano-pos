const { insertTransaction, getConfigs } = require('./manageDB');
const WebSocket = require('ws');

const WSS_SERVER='wss://ws.mynano.ninja/';
const NANO_ADDRESS='nano_11g7sktw95wxhq65zoo3xzjyodazi8d889abtzjs1cd7c8rnxazmqqxprdr7'

// Action to subscribe to a particular address
const subscribe_addresses = function(socket, addresses) {
  let input = {
    action: 'subscribe',
    topic: 'confirmation',
    ack: true,
    options: {
      accounts: addresses
    }
  }

  socket.send(JSON.stringify(input));
}

// Action to subscribe to a particular address
const unsubscribe_addresses = function(socket, addresses) {
  let input = {
    action: 'unsubscribe',
    topic: 'confirmation',
    ack: true,
    options: {
      accounts: addresses
    }
  }

  socket.send(JSON.stringify(input));
}

// Action to send ping
const ping = function(socket) {
  let input = {
    action: 'ping'
  }

  socket.send(JSON.stringify(input));
}

async function startWatch(db, socket, callback) {
  const configs = await getConfigs(db);
  const address = configs.address;

  var intervalId = setInterval(function(){
    ping(socket);
  }, 5000);

  // Called when WebSocket is opened successfully
  socket.onopen = function() {
    console.log('WebSocket is now open');
    
    unsubscribe_addresses(socket);
    subscribe_addresses(socket, [address]);
  }

  // Called when WebSocket fails to open
  socket.onerror = function(error) {
    console.error('Unable to set up WebSocket');

    callback({
      success: false,
      message: error
    })
  }

  // Called with each new inbound WebSocket message
  socket.onmessage = function(response) {
    const data = JSON.parse(response.data);

    console.log(data);

    if (data['topic'] === 'confirmation') {
      const hash = data['message']['hash'];
      const account = data['message']['account'];
      const amount = data['message']['amount'];
      const date = Math.floor(new Date().getTime() / 1000);
      const type = data['message']['block']['subtype'];

      insertTransaction(hash, account, amount, date, type === 'send' ? 0 : 1);
      callback({
        success: true,
        amount
      });
    } 
  }
}

module.exports = { startWatch };