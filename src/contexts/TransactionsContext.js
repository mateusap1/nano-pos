import React, { createContext, useState, useContext, useEffect } from 'react';

import { message2Background } from '../utils/messageToBackground';

export const TransactionsContext = createContext({});

const electron = require('electron');
const { ipcRenderer } = electron;


export function TransactionsContextProvider({ children }) {
  let [info, setInfo] = useState(
    JSON.parse(localStorage.getItem('info')) ? (
      JSON.parse(localStorage.getItem('info'))
    ) : {
      loading: true,
      settings: {rpcNode: "", wssServer: "", currency: "usd"},
      balance: { total: null, today: null },
      prettyTransactions: [],
      rawTransactions: [],
      prettyItems: [],
      rawItems: []
    }
  );

  ipcRenderer.on('message-from-worker', (_, arg) => {
    const command = arg.command;
    const payload = arg.payload;

    switch (command) {
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
  });

  function updateInfo() {
    message2Background('update-info', {});
  }

  function changeInfo(info) {
    setInfo(info);
    localStorage.setItem('info', JSON.stringify(info));
  }

  return (
    <TransactionsContext.Provider
      value={{
        info,
        changeInfo,
        updateInfo
      }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export const useTransactions = () => {
  return useContext(TransactionsContext);
}