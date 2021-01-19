import axios from 'axios';
import config from './config';

export const GetTripSummary = async (proposerID, encryptedProposerId) => {

    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    let body = {
        ProposerID: proposerID,
        encryptedProposerId: encryptedProposerId
    }


    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.GetTripSummary}`,
        body,
        parameters
    );

    return res.data;
}


export const continueCj = async (encryptedProposerId) =>{

    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    let body = {
        // ProposerID: proposerID,
        encryptedProposerId: encryptedProposerId
    }


    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.continueCJ}`,
        body,
        parameters
    );

    return res.data;
}

export const savePageTracker = async({ProposerID, PageID, IPAddress, encryptedProposerId}) =>{
    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    let body = {
        ProposerID,
        PageID,
        IPAddress,
        encryptedProposerId
     }


    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.savePageTracker}`,
        body,
        parameters
    );

    return res.data;
}
