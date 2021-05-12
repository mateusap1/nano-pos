import React from 'react';

import Sidebar from '../../components/Sidebar/Sidebar';

import styles from './settings.module.scss';


export default function Settings() {
  return (
    <>
      <Sidebar index={3} node_address={"192.168.0.1:5555"} />
      <div className={styles.mainContent}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span>May 10, 2021</span>
                  <br />
                <span>10:49 PM</span>
              </td>
              <td>
                <span>27 USD</span>
                <br />
                <span>2.73 Nano</span>
              </td>
              <td>
                <span>Received</span>
              </td>
              <td><button>Details</button></td>
            </tr>
            <tr>
              <td>
                <span>May 10, 2021</span>
                  <br />
                <span>10:49 PM</span>
              </td>
              <td>
                <span>27 USD</span>
                <br />
                <span>2.73 Nano</span>
              </td>
              <td>
                <span>Received</span>
              </td>
              <td><button>Details</button></td>
            </tr>
            <tr>
              <td>
                <span>May 10, 2021</span>
                  <br />
                <span>10:49 PM</span>
              </td>
              <td>
                <span>27 USD</span>
                <br />
                <span>2.73 Nano</span>
              </td>
              <td>
                <span>Received</span>
              </td>
              <td><button>Details</button></td>
            </tr>
          </tbody>
        </table> 
      </div>
    </>
  )
}