/* eslint-disable */

import axios from 'axios';
import config from './config';
import {default as quotes} from "../lib/quotesDummy.json";

const parameters = {
    headers:  {
        "Content-Type": "application/json"
    }
}

export const getCheckout = async(data) =>{

    try{
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.getCheckoutData}`, 
            data, 
            parameters
        );

        if(res.status === 200){
            return res.data;
        }

    }catch(err){
        return {
            errors: 'Checkout Service Not Working',
            // data: {}
        }
    }
}

export const getInsurerProposal = async(data) =>{

    try{
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.getInsurerProposal}`, 
            data, 
            parameters
        );

        if(res.status === 200 && !res.data.hasError){
            // await initiatePg(data)
            return res.data;
        }

    }catch(err){
        return {
            errors: 'Get Insurer Service Not Working',
            // data: {}
        }
    }
}

export const initiatePg = async(data) =>{

    try{
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.initiatePG}`, 
            data, 
            parameters
        );

        if(res.status === 200){
            return res.data;
        }

    }catch(err){
        return {
            errors: 'Get Insurer Service Not Working',
            // data: {}
        }
    }
}
