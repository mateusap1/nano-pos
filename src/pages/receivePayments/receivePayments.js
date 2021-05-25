import React, { useState, useEffect } from 'react';
import { IoSearch } from 'react-icons/io5';
import { BsFillCaretUpFill, BsFillCaretDownFill } from 'react-icons/bs';
import { AiOutlineLoading3Quarters, AiFillCheckCircle } from "react-icons/ai";
import { IoCloseCircle } from 'react-icons/io5';

import Sidebar from '../../components/Sidebar/Sidebar';
import { useTransactions } from '../../contexts/TransactionsContext';
import { message2Background } from '../../utils/messageToBackground';

import styles from './receivePayments.module.scss';


export default function ReceivePayments() {
  const {
    info,
    receivingState,
    setReceivingState
  } = useTransactions();

  let [filteredItems, setFilteredItems] = useState(info?.prettyItems || []);

  let [itemsMap, setItems] = useState(
    (info?.rawItems || []).map(item => ({
      id: item.id,
      amount: 0,
      price: item.price
    }))
  );
  
  let [total, setTotal] = useState(0);
  let [tip, setTip] = useState('');

  useEffect(() => {    
    setFilteredItems(info?.prettyItems || []);
    setItems(
      (info?.rawItems || []).map(item => {
        return {
          id: item.id,
          amount: 0,
          price: item.price
        };
      })
    );
  }, [info]);

  useEffect(() => {
    const { receivedAmount, waitingAmount } = receivingState;

    if (![receivedAmount, waitingAmount].includes(null)) {
      const tipValue = receivedAmount - waitingAmount;

      setTip(tipValue.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        minimumIntegerDigits: 2
      }));
    }
  }, [receivingState])

  const addNum = (id => {    
    let itemsMapCopy = [...itemsMap];
    const idIndex = itemsMapCopy.findIndex(value => value.id === id);

    itemsMapCopy[idIndex]['amount']++;

    let currency = total + itemsMapCopy[idIndex]['price'];

    setItems(itemsMapCopy);
    setTotal(currency);
  });

  const subtractNum = (id => {
    let itemsMapCopy = [...itemsMap];

    const idIndex = itemsMapCopy.findIndex(value => value.id === id);

    if (itemsMapCopy[idIndex]['amount'] > 0) {
      itemsMapCopy[idIndex]['amount']--;

      let currency = total - itemsMapCopy[idIndex]['price'];

      setItems(itemsMapCopy);
      setTotal(currency);
    }
  });

  const waitForPayment = () => {
    let ids = [];
    itemsMap.forEach((item) => {
      for (let i = 0; i < item.amount; i++) {
        ids.push(item.id);
      }
    });

    if (ids.length > 0) {
      setReceivingState({
        ...receivingState,
        name: 'waiting',
        waitingAmount: Number((total / info.currentNanoPrice).toLocaleString(undefined, { 
          minimumFractionDigits: 2
        }))
      });
  
      message2Background('watch', {itemsId: ids});
    }
  }

  return (
    <>
      <Sidebar index={2} />
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
                        (item, index) => (
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
                              <span>{itemsMap[index]['amount']}</span>
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
                (receivingState.name === 'default') &&
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
                    <button onClick={waitForPayment}>Wait for payment</button>
                  </div>
              }
              {
                (receivingState.name === 'waiting') &&
                  <div className={styles.receiversContent}>
                    <div className={styles.priceContent}>
                      <AiOutlineLoading3Quarters 
                        className={styles.rotate}
                        color="#3c3c3c"
                        size="32px"
                      />
                      <hr />
                      <span>
                        Waiting for {(total / info.currentNanoPrice).toLocaleString(undefined, { 
                          minimumFractionDigits: 2
                        })} Nano
                      </span>
                    </div>
                    <hr />
                    <button
                      onClick={() => {
                        message2Background('stop-watch', {});
                        setReceivingState({
                          ...receivingState,
                          name: 'default',
                          waitingAmount: null
                        });
                      }}
                    >Cancel</button>
                  </div>  
              }
              {
                (receivingState.name === 'received') &&
                  <div className={styles.receiversContent}>
                    <div className={styles.priceContent}>
                      <AiFillCheckCircle 
                        color="#40b64c"
                        size="32px"
                      />
                      {(tip !== '00.00') ? (
                        <>
                          <br />
                          <br />
                          <p>Thank your costumer for a ${tip} Nanos tip</p>
                          <br />
                          <br />
                        </>
                      ) : null}
                    </div>
                    <hr />
                    <button
                      onClick={() => {
                        setReceivingState({
                          name: 'default',
                          waitingAmount: null,
                          receivedAmount: null
                        });
                        message2Background('update-info', {});
                      }}
                    >Confirm</button>
                  </div>  
              }
              {
                (receivingState.name === 'fail') &&
                  <div className={styles.receiversContent}>
                    <div className={styles.priceContent}>
                      <IoCloseCircle 
                        size="32px"
                        color="#e63946"
                      />
                      <p>Received {
                        receivingState.waitingAmount - receivingState.receivedAmount
                      } Nano less than the expected amount</p>
                    </div>
                    <hr />
                    <button
                      onClick={() => {
                        setReceivingState({
                          name: 'default',
                          waitingAmount: null,
                          receivedAmount: null
                        });
                        message2Background('update-info', {});
                      }}
                    >Ok</button>
                  </div>
              }
            </>
          )
        }
      </div>
    </>
  )
}