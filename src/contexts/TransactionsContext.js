import React, { createContext, useState, useContext, useEffect } from 'react';

import { message2Background } from '../utils/messageToBackground';

export const TransactionsContext = createContext({});

const electron = require('electron');
const { ipcRenderer } = electron;
const nano = Math.pow(10, 30);

export function TransactionsContextProvider({ children }) {
  let [info, setInfo] = useState(initializeInfo());
  let [receivingState, setReceivingState] = useState({
    name: 'default', // Can be default, waiting, received and fail
    waitingAmount: null,
    receivedAmount: null
  });

  useEffect(() => {
    return () => {
       ipcRenderer.removeListener('message-from-worker', messageHandler);
    }
  }, [messageHandler]);

  function messageHandler(_, arg) {
    const command = arg.command;
    const payload = arg.payload;
  
    switch (command) {
      case 'cancel-payment':
        setReceivingState({
          ...receivingState,
          name: 'default'
        });
  
        break
  
      case 'receive-payment':
        const { amount } = payload;
        const threshold = 0.01;
        let tempRcvState = {...receivingState};
  
        tempRcvState.receivedAmount = amount;

        console.log(tempRcvState.waitingAmount, tempRcvState.receivedAmount)
  
        if (receivingState.waitingAmount === null) {
          error('Payment received unexpectedly');
        } else if ((amount + threshold) >= tempRcvState.waitingAmount) {
          tempRcvState.name = 'received';
        } else {
          tempRcvState.name = 'fail';
        }
  
        setReceivingState(tempRcvState);
  
        break;
  
      case 'set-loading':
        const { value } = payload;
        let tempInfo = {...info};
  
        tempInfo.loading = value;
        changeInfo(tempInfo);
  
        break;
  
      case 'update-info':
        const { info } = payload;
  
        setInfo(info);
        localStorage.setItem('info', JSON.stringify(info));
  
        break;
  
      case 'print':
        const { message } = payload;
  
        console.log(message);
        break;
  
      default:
        console.error("Command not found!");
    }
  };

  ipcRenderer.on('message-from-worker', messageHandler);

  function initializeInfo() {
    let tempInfo = JSON.parse(localStorage.getItem('info')) ? (
      JSON.parse(localStorage.getItem('info'))
    ) : {
      loading: true,
      settings: {rpcNode: "", wssServer: "", currency: "usd"},
      balance: { total: null, today: null },
      prettyTransactions: [],
      rawTransactions: [],
      prettyItems: [],
      rawItems: []
    };

    tempInfo.loading = true;
    return tempInfo;
  }

  function updateInfo() {
    message2Background('update-info', {});
  }

  function changeInfo(info) {
    setInfo(info);
    localStorage.setItem('info', JSON.stringify(info));
  }

  function error(message) {
    ipcRenderer.invoke('renderer-error', { message });
  }

  return (
    <TransactionsContext.Provider
      value={{
        info,
        changeInfo,
        updateInfo,
        receivingState,
        setReceivingState
      }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export const useTransactions = () => {
  return useContext(TransactionsContext);
}