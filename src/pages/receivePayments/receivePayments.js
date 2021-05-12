import React from 'react';
import { IoAddCircle, IoSearch } from 'react-icons/io5';
import { BsFillCaretUpFill, BsFillCaretDownFill } from 'react-icons/bs';

import Sidebar from '../../components/Sidebar/Sidebar';

import styles from './receivePayments.module.scss';


export default function ReceivePayments() {
  return (
    <>
      <Sidebar index={2} node_address={"192.168.0.1:5555"} />
      <div className={styles.mainContent}>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search" />
          <IoSearch
            id="searchIcon"
            size="24px"
            color="#3c3c3c"
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price - USD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span>0</span>
              </td>
              <td>
                <span>Bacon Burger</span>
              </td>
              <td>
                <span>9.90$</span>
              </td>
              <td className={styles.iconContainer}>
                <BsFillCaretDownFill 
                  size="32px"
                  color="#e63946"
                 />
                <span>0</span>
                <BsFillCaretUpFill 
                  size="32px"
                  color="#40b64c"
                 />
              </td>
            </tr>
            <tr>
              <td>
                <span>1</span>
              </td>
              <td>
                <span>Mega Burger</span>
              </td>
              <td>
                <span>19.90$</span>
              </td>
              <td className={styles.iconContainer}>
                <BsFillCaretDownFill 
                  size="32px"
                  color="#e63946"
                 />
                <span>0</span>
                <BsFillCaretUpFill 
                  size="32px"
                  color="#40b64c"
                 />
              </td>
            </tr>
            <tr>
              <td>
                <span>2</span>
              </td>
              <td>
                <span>French Fries</span>
              </td>
              <td>
                <span>4.90$</span>
              </td>
              <td className={styles.iconContainer}>
                <BsFillCaretDownFill 
                  size="32px"
                  color="#e63946"
                 />
                <span>0</span>
                <BsFillCaretUpFill 
                  size="32px"
                  color="#40b64c"
                 />
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <div className={styles.receiversContent}>
          <div className={styles.priceContent}>
            <span>47.70$</span>
            <br />
            <span>4.77 Nano</span>
          </div>
          <hr />
          <button>Wait for payment</button>
        </div>
      </div>
    </>
  )
}