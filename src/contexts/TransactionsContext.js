import React, { createContext, useState, useContext, useEffect } from 'react';

export const TransactionsContext = createContext({});

const electron = require('electron');
const { ipcRenderer } = electron;

export function TransactionsContextProvider({ children }) {
  const [storedTransactions, setStoredTransactions] = useState([]);

  useEffect(() => {
    ipcRenderer.send('main-renderer-ready');
    ipcRenderer.send('update-transactions');

    ipcRenderer.on('message-from-worker', (event, arg) => {
      const payload = arg.payload;
      const { success } = payload;
      const command = arg.command;

      if (command === 'update-transactions' && success) {
        const { transactions } = payload;
        setStoredTransactions(transactions);
        console.log(transactions);
      } else if (command === 'print' && success) {
        const { message } = payload;
        console.log(message);
      }
    });
  }, []);

  function updateTransactions() {
    getTransactions(transactions => {
      setStoredTransactions(transactions);
    });
  }

  return (
    <TransactionsContext.Provider 
      value={{ 
        storedTransactions,
        updateTransactions
      }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export const useTransactions = () => {
  return useContext(TransactionsContext);
}