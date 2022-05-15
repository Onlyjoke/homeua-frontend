import React from 'react';
import ReactDOM from 'react-dom';
import { MoralisProvider } from "react-moralis";

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
      <MoralisProvider serverUrl="https://xqxoxrfixsiy.usemoralis.com:2053/server" appId="my8SHR82ZkZWENAJOMrQeLv7cMF4KBDt2Ysd7bsb">
        <App />
      </MoralisProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
