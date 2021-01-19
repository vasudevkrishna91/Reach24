/* eslint-disable */

import axios from 'axios';
import config from './config';
import {default as quotes} from "../lib/quotesDummy.json";

const parameters = {
    headers:  {
        "Content-Type": "application/json"
    }
}

export const getQuotes = async(data) =>{

    const body = {
        ...data,
    }



    try{
        const res = await axios.post(
            `${config.tempUrl}${config.endpoints.getQuotes}`, 
            body, 
            parameters
        );

        if(res.status === 200){
            if(!_.isEmpty(res.data.quote)){
                return {
                    errors: '',
                    data: res.data
                }
            }else{
                return {
                    errors: 'Quotes Service Not Working',
                    data: {}
                } 
            }
        }else{
            return {
                errors: 'Quotes Service Not Working',
                data: {}
            }
        }

    }catch(err){
        return {
            errors: 'Quotes Service Not Working',
            data: {}
        }
    }
    
}

export const logActiveQuotesService = async (data) =>{
    try{
        const res =await axios.post(
            `${config.baseUrl}${config.endpoints.logActiveQuotes}`, 
            data, 
            parameters
        );
    }catch(err){
        // console.log('Service error');
    }
}

export const saveQuoteSelection = async (data) =>{
    try{
        const res = await axios.post(
            `${config.tempUrl}${config.endpoints.saveQuotesSelection}`, 
            data, 
            parameters
        );

        if(res.status === 200){
            if(res.data.msg === 'success'){
                return {
                    errors: '',
                    data: res.data
                }
            }else{
                return {
                    errors: res.data.msg,
                    data: {}
                } 
            }
        }else{
            return {
                errors: 'Save Quotes Service Not Working',
                data: {}
            }
        }

    }catch(err){
        return {
            errors: 'Quotes Service Not Working',
            data: {}
        }
    }
}

export const saveQuote = async(data) => {
    try {

        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.saveQuotes}`, 
            data, 
            parameters
        );
        
        return res;
    } catch (err) {

    }
    
}

export const getQuoteData = async(ProposerID, encryptedProposerId) =>{
    try{
        const requestBody = {
            ProposerID: ProposerID,
            // EncryptedProposerID:"",
            encryptedProposerId,
            SourcTypeID:2
        }
        
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.getQuoteData}`,
            requestBody,
            parameters
        )

        return res
    }catch(err){

    }
}

export const EmailQuote = async(data) => {
    try{
       
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.emailQuote}`,
            data,
            parameters
        )
        return res;
    }catch(err){

    }
}

export const SaveFilters = async(data) => {
    try{
       
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.saveFilters}`,
            data,
            parameters
        )
        return res;
    }catch(err){

    }
}

export const CreateBookings = async(data) => {
    try{
       
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.createBookings}`,
            data,
            parameters
        )
        return res;
    }catch(err){

    }
}