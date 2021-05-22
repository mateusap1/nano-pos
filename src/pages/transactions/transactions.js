import React, { useState } from 'react';

import Sidebar from '../../components/Sidebar/Sidebar';
import { useTransactions } from '../../contexts/TransactionsContext';

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import styles from './transactions.module.scss';


export default function Transactions() {
  const {
    info
  } = useTransactions();

  return (
    <>
      <Sidebar index={0} node_address={"192.168.0.1:5555"} />
      <div className={styles.mainContent}>
        { (info.loading) ? (
          <div className={styles.voidContent}>
            <AiOutlineLoading3Quarters 
              className={styles.rotate}
              color="#3c3c3c"
              size="32px"
            />
          </div>
         ) : (
          (info.prettyTransactions.length === 0) ? (
            <div className={styles.voidContent}>
              <span>Empty account</span>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {info.prettyTransactions.map(
                  (transaction, index) => (
                    <tr key={transaction.hash}>
                      <td>
                        <span>{ transaction.date.date }</span>
                          <br />
                        <span>{ transaction.date.hour }</span>
                      </td>
                      <td>
                        <span>{transaction.amount.nano} Nano</span>
                        <br />
                        <span>{transaction.amount.currency}</span>
                      </td>
                      <td>
                        <span>{ transaction.type }</span>
                      </td>
                      <td><button>Details</button></td>
                    </tr>
                  )
                )}
              </tbody>
            </table> 
          )
        )}
      </div>
    </>
  )
}