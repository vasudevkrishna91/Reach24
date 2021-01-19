import promise from 'redux-promise';
import { createStore, applyMiddleware, compose } from 'redux';
import preQuoteReducers from './reducers/preQuoteReducer';

const store = createStore(
    preQuoteReducers,
    compose(
        applyMiddleware(promise)
    )
);


export default store;