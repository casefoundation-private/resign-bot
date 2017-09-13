import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { compose, applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import {createLogger} from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import {persistStore, autoRehydrate} from 'redux-persist';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css'

const logger = createLogger();

const store = createStore(
  rootReducer,
  undefined,
  compose(
    applyMiddleware(thunk,logger),
    autoRehydrate()
  )
);

persistStore(store,{},() => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );
  registerServiceWorker();
});
