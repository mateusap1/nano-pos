import React, { useState, useEffect } from 'react';
import { IoSearch } from 'react-icons/io5';
import { BsFillCaretUpFill, BsFillCaretDownFill } from 'react-icons/bs';
import { AiOutlineLoading3Quarters, AiFillCheckCircle } from "react-icons/ai";

import Sidebar from '../../components/Sidebar/Sidebar';
import { useTransactions } from '../../contexts/TransactionsContext';
import { message2Background } from '../../utils/messageToBackground';

import styles from './receivePayments.module.scss';

const electron = require('electron');
const { ipcRenderer } = electron;


export default function ReceivePayments() {
  const {
    info
  } = useTransactions();

  let [filteredItems, setFilteredItems] = useState(info?.prettyItems || []);

  let [itemsMap, setItems] = useState(
    (info?.rawItems || []).map(item => ({
      amount: 0,
      price: item.price
    }
  )));
  
  let [total, setTotal] = useState(0);
  let [state, setState] = useState('default');
  let [waitingAmount, setWaitingAmount] = useState(0);
  let [receivedAmount, setReceivedAmount] = useState(0);

  useEffect(() => {
    setFilteredItems(info?.prettyItems || []);
    setItems(
      (info?.rawItems || []).map(item => {
        return {
          amount: 0,
          price: item.price
        };
      })
    );
  }, [info]);

  const addNum = (id => {
    let itemsMapCopy = {...itemsMap};
    itemsMapCopy[id]['amount']++;

    let currency = total + itemsMapCopy[id]['price'];

    setItems(itemsMapCopy);
    setTotal(currency);
  });

  const subtractNum = (id => {
    let itemsMapCopy = {...itemsMap};

    if (itemsMapCopy[id]['amount'] > 0) {
      itemsMapCopy[id]['amount']--;

      let currency = total - itemsMapCopy[id]['price'];

      setItems(itemsMapCopy);
      setTotal(currency);
    }
  });

  ipcRenderer.on('message-from-worker', (_, arg) => {
    const command = arg.command;
    const payload = arg.payload;

    switch (command) {
      case 'receive-transaction':
        if (state === 'waiting') {
          const { amount } = payload;

          if (amount >= waitingAmount) {
            setState('received');
          } else {
            setState('failure');
          }

          setReceivedAmount(amount);
        }
        break;

      default:
        
    }
  });

  return (
    <>
      <Sidebar index={2} node_address={"192.168.0.1:5555"} />
      <div className={styles.mainContent}>
        {
          (info.loading) ? (
            <div className={styles.voidContent}>
              <AiOutlineLoading3Quarters 
                className={styles.rotate}
                color="#3c3c3c"
                size="32px"
              />
            </div>
          ) : (
            <>
              <div className={styles.searchBar}>
              <input 
                type="text" 
                placeholder="Search"
                onChange={(el) => {
                  const searchString = el.target.value.toLowerCase();
                  setFilteredItems(info.prettyItems.filter(item => {
                    return (
                      item.name.toLowerCase().includes(searchString) ||
                      item.id.toString().toLowerCase().includes(searchString) ||
                      item.price.includes(searchString)
                    );
                  }))
                }}
              />
              <IoSearch
                id="searchIcon"
                size="24px"
                color="#3c3c3c"
              />
            </div>
            
              {filteredItems.length === 0 ? (
                <div className={styles.emptyContainer}>
                  <span>Empty</span>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(
                        (item) => (
                          <tr key={item.id}>
                            <td>
                              <span>{item.id}</span>
                            </td>
                            <td>
                              <span>{item.name}</span>
                            </td>
                            <td>
                              <span>{item.price}$</span>
                            </td>
                            <td className={styles.iconContainer}>
                              <BsFillCaretDownFill 
                                size="32px"
                                color="#e63946"
                                onClick={() => subtractNum(item.id)}
                              />
                              <span>{itemsMap[item.id]['amount']}</span>
                              <BsFillCaretUpFill 
                                size="32px"
                                color="#40b64c"
                                onClick={() => addNum(item.id)}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <br />

              {
                (state === 'default') &&
                  <div className={styles.receiversContent}>
                    <div className={styles.priceContent}>
                      <span>
                        {total.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          minimumIntegerDigits: 2
                        })}$
                      </span>
                      <br />
                      <span>
                        {(total / info.currentNanoPrice).toLocaleString(undefined, { 
                          minimumFractionDigits: 2
                        })} Nano
                      </span>
                    </div>
                    <hr />
                    <button
                      onClick={() => {
                        setWaitingAmount(total / info.currentNanoPrice);
                        setState('waiting');
                        message2Background('watch', {address: info.settings.address});
                      }}
                    >Wait for payment</button>
                  </div>
              }
              {
                (state === 'waiting') &&
                  <div className={styles.receiversContent}>
                    <div className={styles.priceContent}>
                      <AiOutlineLoading3Quarters 
                        className={styles.rotate}
                        color="#3c3c3c"
                        size="32px"
                      />
                    </div>
                    <hr />
                    <button
                      onClick={() => {
                        message2Background('stop-watch', {});
                        setState('default');
                      }}
                    >Cancel</button>
                  </div>  
              }
              {
                (state === 'received') &&
                  <div className={styles.receiversContent}>
                    <div className={styles.priceContent}>
                      <AiFillCheckCircle 
                        color="#40b64c"
                        size="32px"
                      />
                      {(receivedAmount > waitingAmount) ? (
                        <>
                          <br />
                          <span>
                            Thank your costumer for an extra {receivedAmount - waitingAmount} Nano!
                          </span>
                        </>
                      ) : null}
                    </div>
                    <hr />
                    <button>Confirm</button>
                  </div>  
              }
            </>
          )
        }
      </div>
    </>
  )
}