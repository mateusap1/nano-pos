import React from 'react';

import { IoAddCircle, IoCloseCircle } from 'react-icons/io5';
import styles from './styles.module.scss';


export default function({ children, active, deactivate, addItem }) {
  return (
    <div className={styles.overlay} style={{display: active ? 'flex' : 'none'}}>
      <div className={styles.overlayContent}>
        <div className={styles.topButtons}>
          <IoAddCircle 
            size="32px"
            color="#40b64c"
            onClick={() => {
              addItem();
              console.log('beep');
            }}
          />

          <IoCloseCircle 
            size="32px"
            color="#e63946"
            onClick={() => deactivate()}
          />
        </div>
        <div className={styles.mainContent}>
          {children}
        </div>
      </div>
    </div>
  );
}