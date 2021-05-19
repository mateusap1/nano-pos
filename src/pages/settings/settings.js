import React from 'react';

import Sidebar from '../../components/Sidebar/Sidebar';
import { useTransactions } from '../../contexts/TransactionsContext';
import { message2Background } from '../../utils/messageToBackground';

import styles from './settings.module.scss';


export default function Settings() {
  const {
    info
  } = useTransactions();

  const rpcNodeRef = React.createRef();
  const wssServerRef = React.createRef();
  const currencyRef = React.createRef();

  return (
    <>
      <Sidebar index={3} node_address={"192.168.0.1:5555"} />
      <div className={styles.mainContent}>
        <div className={styles.container} id="rpcNode">
          <div className={styles.containerItem}>
            <label htmlFor="node-name">RPC Node</label>
            <input 
              name="node-name" 
              defaultValue={info.settings.rpcNode}
              ref={rpcNodeRef}
            />
          </div>
          <br />
          <div className={styles.containerItem} id="wssServer">
            <label htmlFor="wss-server">WebSocket Server</label>
            <input 
              name="wss-server" 
              defaultValue={info.settings.wssServer} 
              ref={wssServerRef}
            />
          </div>
          <br />
          <div className={styles.containerItem} id="wssServer">
            <label htmlFor="currency">Currency</label>
            <select 
              name="currency" 
              defaultValue={info.settings.currency}
              ref={currencyRef}>
              <option value="brl">BRL</option>
              <option value="usd">USD</option>
            </select>
          </div>
          <br />
          <div className={styles.bottom}>
            <button onClick={() => {
              message2Background('save-changes', {
                changes: [
                  {setting: 'rpcNode', value: rpcNodeRef.current.value},
                  {setting: 'wssServer', value: wssServerRef.current.value},
                  {setting: 'currency', value: currencyRef.current.value}
                ]
              });
              
              message2Background('update-info', {});
            }}>Save Changes</button>
          </div>
        </div>
      </div>
    </>
  )
}