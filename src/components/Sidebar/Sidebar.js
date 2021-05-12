import React from 'react';

import { Link } from 'react-router-dom';
import styles from './styles.module.scss';


export default function({ index, node_address }) {
  return (
    <div className={styles.sidebar}>
      <h1>Nano Point Of Sale</h1>
      <div>
        <div className={styles.sidebarContent}>
          <span>Current Balance</span>
          <br />
          <span>00.00 nano</span>
        </div>
        <div className={styles.sidebarContent}>
          <span>Today's Profit</span>
          <br />
          <span>00.00 nano</span>
        </div>
      </div>
      <ul>
          <li className={index == 0 ? styles.selected : ''}>
            <Link to="/transactions">Transactions</Link>
          </li>
          <li className={index == 1 ? styles.selected : ''}>
            <Link to="/products-and-services">Products / Services</Link>
          </li>
          <li className={index == 2 ? styles.selected : ''}>
            <Link to="/receive-payments">Receive Payments</Link>
          </li>
          <li className={index == 3 ? styles.selected : ''}>
            <Link to="/settings">Settings</Link>
          </li>
      </ul> 
      <div className={styles.node}>
          {node_address ? (
            <p><span className={styles.connected}>Connected</span> to {node_address}</p>
          ) : (
            <p><span className={styles.notConnected}>Not Connected</span></p>
          )}
      </div>
    </div>
  );
}