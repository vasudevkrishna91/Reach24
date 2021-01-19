import axios from "axios";
import config from './config';

const parameters = {
    headers:  {
        "Content-Type": "application/json"
    }
}

export const sendOTP = async (param) =>{
    const payload  = {
        MobileNo : param.mobile,
        Email : "",
        CountryCode : param.CountryCode,
        ProposerID : param.proposerID
    } 
    let res =''
    let url = config.baseUrl+'quote/SendOTP';
    res = await axios.post(url,payload,parameters);
    return res.data;
}

export const verifyOTP = async (param) => {
    const payload = {
        "MobileNo" : param.mobile,
        "OTP" : param.otp,
        "VerificationCode" : param.VCode,
        "ProposerID" : param.proposerID
        } 
        
    let res = ''
    let url = config.baseUrl+'quote/VerifyOTP';
    res = await axios.post(url,payload,parameters);
    return res.data
}