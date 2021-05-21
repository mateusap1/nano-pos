import React, { useEffect } from 'react';

import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';

import { TransactionsContextProvider } from '../contexts/TransactionsContext';
import { message2Background } from '../utils/messageToBackground';

import Authentication from './authentication/authentication';
import Transactions from './transactions/transactions';
import ProductsAndServices from './productsAndServices/productsAndServices';
import ReceivePayments from './receivePayments/receivePayments';
import Settings from './settings/settings';

import '../styles/global.scss';

export default function() {
  useEffect(() => {
    message2Background('update-info', {});
  }, []);
  
  return (
    <TransactionsContextProvider>
      <HashRouter>
        <Switch>
          <Redirect from="/" exact to={localStorage.getItem(
            'address') === null ? "/authentication" : "/transactions"} />
          <Route path="/authentication" exact component={ Authentication } />
          <Route path="/transactions" exact component={ Transactions } />
          <Route path="/products-and-services" exact component={ ProductsAndServices } />
          <Route path="/receive-payments" exact component={ ReceivePayments } />
          <Route path="/settings" exact component={ Settings } />
        </Switch>
      </HashRouter>
    </TransactionsContextProvider>
  )
}