import React from 'react';
import { Link } from 'react-router-dom';

import styles from './authentication.module.scss';

export default function Authentication() {
  const addressRef = React.createRef();

  const updateInput = () => {
    addressRef.current.style.height = "1px";
    addressRef.current.style.height = (addressRef.current.scrollHeight)+"px";
  }

  const submitAddress = () => {
    localStorage.setItem('address', addressRef.current.value);
  }

  return (
    <>
      <div className={styles.mainContent}>
        <div>
          <label htmlFor="address"><b>Nano address</b></label>
          <textarea
            name="address" 
            ref={addressRef}
            rows={1}
            onKeyUp={updateInput}
          />
          <button>
            <Link onClick={submitAddress} to="/transactions">Next</Link>
          </button>
        </div>
      </div>
    </>
  );
}