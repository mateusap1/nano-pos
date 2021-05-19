'use strict';

const nanoRPC = jest.createMockFromModule('../getNanoPrice');

async function getNanoPrice(currency, date) {
  return new Promise((resolve, reject) => {
    return resolve(9.8);
  });
}

nanoRPC.getNanoPrice = getNanoPrice;

module.exports = nanoRPC;