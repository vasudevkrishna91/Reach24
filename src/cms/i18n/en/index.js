import {default as preQuote } from './preQuote';
import{default as proposal} from './proposal'
import {default as quote} from './quote';
import {default as checkout} from './checkout';
import {default as thanks} from './thanks';


export const lang =  {
    ...preQuote,
    ...proposal,
    ...quote,
	...checkout,
	...thanks
}