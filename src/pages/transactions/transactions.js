import React, { useState } from 'react';

import Sidebar from '../../components/Sidebar/Sidebar';
import Overlay from '../../components/Overlay/Overlay';

import { useTransactions } from '../../contexts/TransactionsContext';

import { AiOutlineLoading3Quarters, AiFillInfoCircle } from "react-icons/ai";
import styles from './transactions.module.scss';


export default function Transactions() {
  const {
    info
  } = useTransactions();

  let [overlayState, setOverlayState] = useState('deactivated');
  let [overlayContent, setOverlayContent] = useState(<></>);

  return (
    <>
      <Sidebar index={0} />
      <Overlay 
        state={overlayState} 
        deactivate={() => setOverlayState('deactivated')}
      >
        {overlayContent}
      </Overlay>
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
                      <td className={styles.iconContainer}>
                        {info.rawTransactions[index].details ? (
                          <AiFillInfoCircle
                            size="32px"
                            color="#457b9d"
                            onClick={() => {
                              setOverlayContent(
                                <div>
                                  {info.rawTransactions[index].details.map(item => (
                                    <table key={item.id}>
                                      <thead>
                                        <tr>
                                          <th>Name</th>
                                          <th>Amount</th>
                                          <th>Price</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>{item.name}</td>
                                          <td>{item.amount}</td>
                                          <td>{item.price * item.amount}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  ))}
                                </div>
                              );
                              setOverlayState('get-info');
                            }}
                          />
                        ) : null}
                      </td>
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