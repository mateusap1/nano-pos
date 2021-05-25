import React from 'react';

import { IoAddCircle, IoCloseCircle } from 'react-icons/io5';
import styles from './styles.module.scss';


export default function({ children, state, deactivate, addItem }) {
  return (
    <div
      className={styles.overlay}
      style={{display: state !== 'deactivated' ? 'flex' : 'none'}}
    >
      <div className={styles.overlayContent}>
        <div className={styles.topButtons}>
          {state === 'add-item' ? (
            <IoAddCircle 
              size="32px"
              color="#40b64c"
              onClick={() => {
                addItem();
                console.log('beep');
              }}
            />
          ) : (<></>)}

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