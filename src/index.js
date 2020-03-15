import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { StoreProvider, useStoreActions, useStoreState } from 'easy-peasy'
import store from './redux/store'

ReactDOM.render(
    <StoreProvider store={store}>
        <App />
    </StoreProvider>,
    document.getElementById('root'));