'use strict';

const nanoRPC = jest.createMockFromModule('../nanoRPC');


async function accountBalance(address, rpcServer) {
  return new Promise((resolve, reject) => {
    return resolve({ 
      balance: '10000000000000000000000000000',
      pending: '10000000000000000000000000000'
    });
  });
}

async function accountHistory(address, rpcServer, head=null) {
  let history = [{
    type: 'receive',
    account: 'nano_17qhnokx3zazyyh5ss3sk8zi3oqm5ffosszjpmn7ndy1bmd97gkhatc8otoo',
    amount: '10000000000000000000000000000',
    local_timestamp: '1620498274',
    height: '1',
    hash: '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B'
  }];

  if (head === null) {
    history.unshift({
      type: 'receive',
      account: 'nano_17qhnokx3zazyyh5ss3sk8zi3oqm5ffosszjpmn7ndy1bmd97gkhatc8otoo',
      amount: '10000000000000000000000000000',
      local_timestamp: '1620498343',
      height: '2',
      hash: '22D25DA25CCEFDE0E261DD9011C1AA2748753100AABCF059FB5DA75F0314B391'
    });
  }

  const output = {
    account: address,
    history
  };
  
  return new Promise((resolve, reject) => {
    return resolve(output);
  });
}

async function accountInfo(address, rpcServer) {
  const output = {
    frontier: '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
    open_block: '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
    representative_block: '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
    balance: '10000000000000000000000000000',
    modified_timestamp: '1620498274',
    block_count: '2',
    account_version: '2',
    confirmation_height: '1',
    confirmation_height_frontier: '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B'
  }

  return new Promise((resolve, reject) => {
    resolve(output);
  });
}

nanoRPC.accountInfo = accountInfo;
nanoRPC.accountHistory = accountHistory;
nanoRPC.accountBalance = accountBalance;

module.exports = nanoRPC;