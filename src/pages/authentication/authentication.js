import React from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import styles from './authentication.module.scss';

export default function Authentication() {
  const addressRef = React.createRef();
  const history = useHistory();

  const updateInput = () => {
    addressRef.current.style.height = "1px";
    addressRef.current.style.height = (addressRef.current.scrollHeight)+"px";
  }

  const submitAddress = () => {
    if (addressRef.current.value !== '') {
      localStorage.setItem('address', addressRef.current.value);
      history.push('/transactions');
    }
  }

  return (
    <>
      <div className={styles.mainContent}>
        <div>
          <label htmlFor="address"><b>Nano address</b></label>
          <div>
            <textarea
              name="address" 
              ref={addressRef}
              rows={1}
              onKeyUp={updateInput}
            />
            <button onClick={submitAddress}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
}