import React, { useEffect, useState, useRef } from 'react';
import { AiOutlineLoading3Quarters, AiFillInfoCircle } from "react-icons/ai";
import { IoCloseCircle } from 'react-icons/io5';

import Sidebar from '../../components/Sidebar/Sidebar';
import Overlay from '../../components/Overlay/Overlay';

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

  const idRef = useRef(null);
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const barcodeRef = useRef(null);
  const categoryRef = useRef(null);
  const extraRef = useRef(null);

  let [items, setItems] = useState(info?.prettyItems || []);
  let [overlayState, setOverlayState] = useState('deactivated');
  let [overlayContent, setOverlayContent] = useState(<></>);

  useEffect(() => {
    setItems(info?.prettyItems || []);
  }, [info]);

  const insertItem = () => {
    const id = idRef.current.value;
    const name = nameRef.current.value;
    const price = priceRef.current.value;
    const description = descriptionRef.current.value;
    const barcode = barcodeRef.current.value;
    const category = categoryRef.current.value;
    const extra = extraRef.current.value;

    if (![id, name, price, description, barcode, category].some(
      x => x === '')) {

      const prettyItemsDict = {
        id: id,
        name: name,
        price: parseFloat(price).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          minimumIntegerDigits: 2
        }),
        description,
        barcode,
        category,
        extra
      };

      const rawItemsDict = {
        id, name, price, description, barcode, category, extra
      };

      message2Background('insert-item', rawItemsDict);
      message2Background('update-info', {});
      resetInputs();
      setOverlayState('deactivated');

      let prettyItemsCopy = [...items];
      prettyItemsCopy.push(prettyItemsDict);

      let rawItemsCopy = [...info.rawItems];
      rawItemsCopy.push(rawItemsDict);

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
    descriptionRef.current.value = '';
    barcodeRef.current.value = '';
    categoryRef.current.value = '';
    extraRef.current.value = '';
  };

  return (
    <>
      <Sidebar index={1} />
      <Overlay 
        state={overlayState} 
        deactivate={() => setOverlayState('deactivated')}
        addItem={() => (insertItem())}
      >
        {overlayContent}
      </Overlay>
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
          <>
            <div className={styles.buttonsContainer}>
              <button
                onClick={() => {
                  setOverlayContent((
                    <>
                      <div className={styles.overlayElement}>
                        <label htmlFor="id"><b>ID</b></label>
                        <span>
                          <input 
                            ref={idRef}
                            type="number"
                            name="id"
                            min={0}
                            step="1"
                          />
                        </span>
                      </div>
                      <br />
                      <div className={styles.overlayElement}>
                        <label htmlFor="name"><b>Name</b></label>
                        <span>
                          <input
                            ref={nameRef}
                            type="text"
                            name="name"
                          />
                        </span>
                      </div>
                      <br />
                      <div className={styles.overlayElement}>
                        <label htmlFor="price"><b>Price</b></label>
                        <span>
                          <input 
                            ref={priceRef}
                            type="number"
                            name="price"
                            min={0}
                            step="any"
                          />
                        </span>
                      </div>
                      <br />
                      <div className={styles.overlayElement}>
                        <label htmlFor="description"><b>Description</b></label>
                        <span>
                          <input
                            ref={descriptionRef}
                            type="text"
                            name="description"
                          />
                        </span>
                      </div>
                      <br />
                      <div className={styles.overlayElement}>
                        <label htmlFor="barcode"><b>Barcode</b></label>
                        <span>
                          <input
                            ref={barcodeRef}
                            type="text"
                            name="barcode"
                          />
                        </span>
                      </div>
                      <br />
                      <div className={styles.overlayElement}>
                        <label htmlFor="category"><b>Category</b></label>
                        <span>
                          <input
                            ref={categoryRef}
                            type="text"
                            name="category"
                          />
                        </span>
                      </div>
                      <br />
                      <div className={styles.overlayElement}>
                        <label htmlFor="extra"><b>Extra</b></label>
                        <span>
                          <input
                            ref={extraRef}
                            type="text"
                            name="extra"
                          />
                        </span>
                      </div>
                    </>
                  ));
                  setOverlayState('add-item');
                }}
              >Add Item</button>
              <button
                onClick={() => {               
                  ipcRenderer.invoke('show-files', {
                    options: {
                      properties: ['openFile'],
                      filters: [{ name: 'csv', extensions: ['csv'] }]
                    }
                  });
                }}
              >Import CSV</button>
            </div>
            <hr />
            {items.length === 0 ? (
              <>
                <div className={styles.voidContent}>
                  <span>Empty</span>
                </div>
              </>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
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
                          <AiFillInfoCircle
                            size="32px"
                            color="#457b9d"
                            onClick={() => {
                              setOverlayContent(
                                <>
                                  <div key={item.id}>
                                    <div className={styles.overlayElement}>
                                      <span><b>ID</b></span>
                                      <span>{item.id}</span>
                                    </div>
                                    <br />
                                    <div className={styles.overlayElement}>
                                      <span><b>Name</b></span>
                                      <span>{item.name}</span>
                                    </div>
                                    <br />
                                    <div className={styles.overlayElement}>
                                      <span><b>Price</b></span>
                                      <span>{item.price}$ USD</span>
                                    </div>
                                    <br />
                                    <div className={styles.overlayElement}>
                                      <span><b>Description</b></span>
                                      <span>{item.description}</span>
                                    </div>
                                    <br />
                                    <div className={styles.overlayElement}>
                                      <span><b>Barcode</b></span>
                                      <span>{item.barcode}</span>
                                    </div>
                                    <br />
                                    <div className={styles.overlayElement}>
                                      <span><b>Category</b></span>
                                      <span>{item.category}</span>
                                    </div>
                                    <br />
                                    <div className={styles.overlayElement}>
                                      <span><b>Extra</b></span>
                                      <span>{item.extra}</span>
                                    </div>
                                  </div>
                                </>
                              );
                              setOverlayState('get-info');
                            }}
                          />
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
          </>
        )}
      </div>
    </>
  )
}