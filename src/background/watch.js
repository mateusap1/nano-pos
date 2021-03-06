const { insertTransaction } = require('./manageDB');

// Action to subscribe to a particular address
const subscribe_addresses = function(socket, addresses) {

  let input = {
    action: 'subscribe',
    topic: 'confirmation',
    ack: true,
    options: {
      all_local_accounts: false,
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

async function startWatch(db, socket, address, callback) {
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

    if (data['topic'] === 'confirmation') {
      const hash = data['message']['hash'];
      const account = data['message']['account'];
      const amount = data['message']['amount'];
      const date = Math.floor(new Date().getTime() / 1000);
      const type = data['message']['block']['subtype'];

      console.log(JSON.stringify(data));

      if (type === 'send' || account !== address) return;

      insertTransaction(db, hash, account, amount, date, 1);
      callback({
        success: true,
        hash,
        amount
      });
    } 
  }
}

module.exports = { startWatch };