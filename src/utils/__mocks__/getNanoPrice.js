'use strict';

const nanoRPC = jest.createMockFromModule('../getNanoPrice');

async function getNanoPrice(currency, date) {
  return new Promise((resolve, reject) => {
    return resolve(9.8);
  });
}

async function getCurrentNanoPrice(currency) {
  return new Promise((resolve, reject) => {
    return resolve(9.8);
  });
}

nanoRPC.getNanoPrice = getNanoPrice;
nanoRPC.getCurrentNanoPrice = getCurrentNanoPrice;

module.exports = nanoRPC;