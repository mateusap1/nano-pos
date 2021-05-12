import React from 'react';
import { IoAddCircle, IoCloseCircle } from 'react-icons/io5';

import Sidebar from '../../components/Sidebar/Sidebar';

import styles from './productsAndServices.module.scss';


export default function ProductsAndServices() {
  return (
    <>
      <Sidebar index={1} node_address={"192.168.0.1:5555"} />
      <div className={styles.mainContent}>
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
                <IoCloseCircle
                  size="32px"
                  color="#e63946"
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
                <IoCloseCircle
                  size="32px"
                  color="#e63946"
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
                <IoCloseCircle
                  size="32px"
                  color="#e63946"
                />
              </td>
            </tr>

            <tr>
              <td>
              </td>
              <td>
                <input type="text" />
              </td>
              <td>
                <input type="number" min={0} step="any" />
              </td>
              <td className={styles.iconContainer}>
                <IoAddCircle
                  size="32px"
                  color="#40b64c"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}