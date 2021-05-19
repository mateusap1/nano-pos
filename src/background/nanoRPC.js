const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

/* A good part of this code was taken from https://medium.com/nanocurrency/
getting-started-developing-with-nano-currency-part-2-interacting-with-public-
and-private-nano-adb98ef57fbf*/

// https://nault.nanos.cc/proxy/
const RPC_SERVER='https://mynano.ninja/api/node/';
const REQUEST_TIMEOUT=10*1000; // 10 seconds

// Send a POST request and return a Promise
async function post(url, params) {
  return new Promise((resolve, reject) => {
    let xhttp = new XMLHttpRequest();
    xhttp.timeout = REQUEST_TIMEOUT;
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        try {
          resolve(JSON.parse(this.responseText));
          return;
        } catch(e) {
          console.error('Failed to parse response from node');
          console.error(this.responseText);
          reject(e);
          return;
        }
      } else if (this.readyState == 4 && this.status != 200) {
        console.error('Failed to connect to '+ url);
        reject(`Error ${this.status} while trying to connect to ${url}`);
        return;
      }
    };
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(params));
  });
}

async function accountBalance(address, rpcServer) {
  input = {
    action: 'account_balance',
    account: address
  }

  return new Promise((resolve, reject) => {
    post(rpcServer, input)
      .then(info => {
        resolve(info);
      })
      .catch(e => {
        reject(e);
      });
  });
}

async function accountHistory(address, rpcServer, head=null) {
  if (head === null) {
    input = {
      action: 'account_history',
      account: address,
      count: -1
    }
  } else {
    input = {
      action: 'account_history',
      account: address,
      head: head,
      count: -1
    }
  }
  
  return new Promise((resolve, reject) => {
    post(rpcServer, input)
      .then(info => {
        resolve(info);
      })
      .catch(e => {
        reject(e);
      });
  });
}

async function accountInfo(address, rpcServer) {
  input = {
    action: 'account_info',
    account: address
  }

  return new Promise((resolve, reject) => {
    post(rpcServer, input)
      .then(info => {
        resolve(info);
      })
      .catch(e => {
        reject(e);
      });
  });
}

async function test() {
  const address = 'nano_11g7sktw95wxhq65zoo3xzjyodazi8d889abtzjs1cd7c8rnxazmqqxprdr7';
  accountInfo(address, RPC_SERVER).then((response) => console.log(response));
}

module.exports = { accountBalance, accountHistory, accountInfo };