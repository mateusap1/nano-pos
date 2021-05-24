import React from 'react';
import { Link } from 'react-router-dom';

import { useTransactions } from '../../contexts/TransactionsContext';

import styles from './styles.module.scss';


export default function({ index, node_address }) {
  const {
    info
  } = useTransactions();

  return (
    <div className={styles.sidebar}>
      <h1>Nano Point Of Sale</h1>
      <div>
        <div className={styles.sidebarContent}>
          {info.loading ? (
            <div className={styles.loading}></div>
          ) : (
            <>
              <span>Current Balance</span>
              <br />
              <span>{info.balance.total} Nano</span>
            </>
          )}
        </div>
        <div className={styles.sidebarContent}>
          {info.loading ? (
            <div className={styles.loading}></div>
          ) : (
            <>
              <span>Today's profit</span>
              <br />
              <span>{info.balance.today} Nano</span>
            </>
          )}
        </div>
      </div>
      <ul>
          <li className={index == 0 ? styles.selected : ''}>
            <Link to="/transactions" replace>Transactions</Link>
          </li>
          <li className={index == 1 ? styles.selected : ''}>
            <Link to="/products-and-services" replace>Products / Services</Link>
          </li>
          <li className={index == 2 ? styles.selected : ''}>
            <Link to="/receive-payments" replace>Receive Payments</Link>
          </li>
          <li className={index == 3 ? styles.selected : ''}>
            <Link to="/settings" replace>Settings</Link>
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