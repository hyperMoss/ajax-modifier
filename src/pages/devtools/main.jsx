import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../../App';
import './index.css';

const DEFAULT_SETTING = {
  ajaxInterceptor_switchOn: false,
  ajaxInterceptor_rules: [],
};
if (chrome.storage) {
  chrome.storage.local.get(
    ['ajaxInterceptor_switchOn', 'ajaxInterceptor_rules'],
    (result) => {
      // if (result.ajaxInterceptor_switchOn) {
      //   this.set('ajaxInterceptor_switchOn', result.ajaxInterceptor_switchOn, false);
      // }
      // if (result.ajaxInterceptor_rules) {
      //   this.set('ajaxInterceptor_rules', result.ajaxInterceptor_rules, false);
      // }
      window.setting = {
        ...DEFAULT_SETTING,
        ...result,
      };
      console.log(window.setting, DEFAULT_SETTING, '213123');

      ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
  );
} else {
  window.setting = DEFAULT_SETTING;
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
