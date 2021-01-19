import axios from "axios";
import config from './config';

const parameters = {
    headers:  {
        "Content-Type": "application/json"
    }
}

export const loadThanks = async (param) =>{
    const payload  = {
        "ProposerID":param.proposerID,
        "encryptedProposerId": param.encryptedProposerId,
        "SourceTypeID":0
    }
    let res =''
    let url = config.baseUrl+'ThankYou/getthankyoudata';
    res = await axios.post(url,payload,parameters);
    return res.data;
}

export const feedbackApi = async (param) => {
    const payload = {
        "ProposerID":param.proposerID,
        "ExperienceTypeID":param.expTypeId,
        "EncryptedProposerID":null,
        "SourceTypeID":null
    }
    let res = ''
    let url = config.baseUrl+'misc/ShareExperience';
    res = await axios.post(url,payload,parameters);
    return res.data
}