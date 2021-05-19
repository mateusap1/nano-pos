import React, { useEffect, useState } from 'react';
import { IoAddCircle, IoCloseCircle } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import Sidebar from '../../components/Sidebar/Sidebar';
import { useTransactions } from '../../contexts/TransactionsContext';
import { message2Background } from '../../utils/messageToBackground';

import styles from './productsAndServices.module.scss';

const electron = require('electron');
const { ipcRenderer } = electron;


export default function ProductsAndServices() {
  const {
    info,
    changeInfo
  } = useTransactions();

  let [items, setItems] = useState(info.prettyItems);

  const idRef = React.createRef();
  const nameRef = React.createRef();
  const priceRef = React.createRef();

  const insertItem = (id, name, price) => {
    if (id != '' && name != '' && price != '') {
      message2Background('insert-item', {id, name, price});
      message2Background('update-info', {});
      resetInputs();

      let prettyItemsCopy = [...items];
      prettyItemsCopy.push({
        id, 
        name, 
        price: parseFloat(price).toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        minimumIntegerDigits: 2
        }
      )});

      let rawItemsCopy = [...info.rawItems];
      rawItemsCopy.push({id, name, price});

      let infoCopy = {...info};
      infoCopy.prettyItems = prettyItemsCopy;
      infoCopy.rawItems = rawItemsCopy;

      changeInfo(infoCopy);
      setItems(prettyItemsCopy);
    }
  }

  const deleteItem = (id) => {
    message2Background('delete-item', { id });

    let prettyItemsCopy = [...items];
    let rawItemsCopy = [...info.rawItems];

    const index = prettyItemsCopy.findIndex((x) => x.id === id);
    if (index > -1) {
      prettyItemsCopy.splice(index, 1);
      rawItemsCopy.splice(index, 1);

      let infoCopy = {...info};
      infoCopy.prettyItems = prettyItemsCopy;
      infoCopy.rawItems = rawItemsCopy;

      changeInfo(infoCopy);
      setItems(prettyItemsCopy);
    }
  }

  const resetInputs = () => {
    idRef.current.value = '';
    nameRef.current.value = '';
    priceRef.current.value = '';
  }

  return (
    <>
      <Sidebar index={1} node_address={"192.168.0.1:5555"} />
      <div className={styles.mainContent}>
        {(info.loading) ? (
          <div className={styles.voidContent}>
            <AiOutlineLoading3Quarters 
              className={styles.rotate}
              color="#3c3c3c"
              size="32px"
            />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price - {info.settings.currency.toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input ref={idRef} type="number" min={0} />
                </td>
                <td>
                  <input ref={nameRef} type="text" />
                </td>
                <td>
                  <input ref={priceRef} type="number" min={0} step="any" />
                </td>
                <td className={styles.iconContainer}>
                  <IoAddCircle
                    size="32px"
                    color="#40b64c"
                    onClick={() => {
                      insertItem(
                        idRef.current.value,
                        nameRef.current.value,
                        priceRef.current.value
                      );
                    }}
                  />
                </td>
              </tr>
              {items.map(
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
                      <IoCloseCircle
                        size="32px"
                        color="#e63946"
                        onClick={() => {
                          deleteItem(item.id);
                        }}
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}