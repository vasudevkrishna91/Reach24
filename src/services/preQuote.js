import axios from 'axios';
import config from './config';

import { removeEmptyKeys } from '../utils/helper';

var isPed = false;

const tranformDateForApi = (date) => {
    var datearray = date.split("-");
    var newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
    return newdate;
}

export const initEnquiryID = (ipAddress) => {

    const parameters = {
        params: {
            "UtmSource": config.UtmSource,
            "UtmMedium": config.UtmMedium,
            "UtmTerm": config.UtmTerm,
            "UtmCampaign": config.UtmCampaign,
            "LeadSource": config.LeadSource,
            "Key": "VisitProfileCookie",
            "value": "",
            "visitorId": "0",
            "VisitorToken": "null",
            "IpAddress": ipAddress
        }
    }

    const params = removeEmptyKeys(parameters);
    return axios.post(config.apiEnquiryId, null, params);
}


const tranformTravellerData = (travellerData) => {
    const transformedData = travellerData.map((obj, i) => {
        if (!isPed && obj.ped) {
            isPed = obj.ped;
        }

        return {
            Age: obj.age,
            RelationTypeID: 1,
            TemporaryID: obj.TemporaryID,
            isPED: obj.ped,
            // MemberID: 0
        }
    });
    return transformedData;
}

const tranformDestinationData = (destinations) => {
    const transformedDestinationArray = destinations.map(dest => {
        return {
            CountryID: dest.CountryID,
            CountryName: dest.CountryName
        }
    })

    return transformedDestinationArray;
}


export const savePreQuotes = async (reqBody) => {
    let reqData = { ...reqBody }

    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    let customer = {
        fullName: reqData.getPrequoteResponseData? reqData.getPrequoteResponseData.data.data.customer.fullName :null,
        mobileNo: reqData.MobileNo,
        emailID: reqData.getPrequoteResponseData?reqData.getPrequoteResponseData.data.data.customer.emailID:null,
        countryID: reqData.getPrequoteResponseData?reqData.getPrequoteResponseData.data.data.customer.countryID:392,
        countryCode: reqData.getPrequoteResponseData?reqData.getPrequoteResponseData.data.data.customer.countryCode:null,
    }

    let members = []
    reqData.travellerData && reqData.travellerData.map(member => {

        const {
            proposerID,
            fullName,
            dateOfBirth,
            visaTypeID,
            nationalityID,
            relationTypeID,
            relationType,
            profileID,
            proposerRelationID,
            proposerRelation,
            parentIM,
            denoteTraveller,
            temporaryProfileID,
            isActive,
            ped,
            TemporaryID,
            age,
            InsuredMemberID,
        } = member

        members.push({
            proposerID:proposerID?proposerID: reqData.proposerId,
            insuredMemberID: InsuredMemberID,
            fullName:fullName?fullName:null,
            dateOfBirth:dateOfBirth?dateOfBirth:null,
            age,
            visaTypeID:visaTypeID?visaTypeID:0,
            nationalityID:nationalityID?nationalityID:0,
            relationTypeID:relationTypeID?relationTypeID:1,
            relationType:relationType?relationType:null,
            isPED: ped?ped:false,
            profileID:profileID?profileID:0,
            proposerRelationID:proposerRelationID?proposerRelationID:1,
            proposerRelation:proposerRelation?proposerRelation:null,
            parentIM:parentIM?parentIM:0,
            denoteTraveller:denoteTraveller?denoteTraveller:null,
            temporaryID: TemporaryID,
            temporaryProfileID:temporaryProfileID?temporaryProfileID:null,
            isActive:isActive?isActive:true
        });

    })

    let tripCountries=[]
    reqData.destinationsData && reqData.destinationsData.map(country=>{
        const {
            CountryID,
            CountryName
        }=country
        tripCountries.push({
            countryID:CountryID,
            countryName:CountryName
        })

    })


    let data = {
        tripTypeID: reqData.getPrequoteResponseData? reqData.getPrequoteResponseData.data.data.tripTypeID: 1,
        maxTripDuration:reqData.getPrequoteResponseData? reqData.getPrequoteResponseData.data.data.maxTripDuration:0,
        customer,
        tripCountries,
        members,
        geographyID: 0,
        isLeadCreated: false,
        isPED: reqData.isPed===0?false:true,
        tripStartDate: reqData.tripStartDate,
        tripEndDate: reqData.tripEndDate
    }

    let body = {
        data,
        utmDetail: reqData.utmDetail,
        proposerID: reqData.proposerId,
        encryptedProposerID:reqData.encryptedProposerId ? reqData.encryptedProposerId : null,
        sourceTypeID: 0,
        version:'',
        pageID: 0,
        ipAddress: reqData.ipAddress,
        browser: reqData.browser,
        cjTypeID: 1
    }


    body = JSON.stringify(body);
    const res = await axios.post(`${config.baseUrl}${config.endpoints.savePreQuote}`, body, parameters);

    return res.data;
}

export const getIpAddress = () => {
    return axios.get(config.apiIpLocator);
}

export const getPreQuote = async (ProposerID, encryptedProposerId) => {

    try {
        const parameters = {
            headers: {
                "Content-Type": "application/json"
            }
        }
        const requestBody = {
            ProposerID,
            encryptedProposerId: encryptedProposerId,
            SourceTypeID: 1
        }
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.getPreQuote}`,
            requestBody,
            parameters
        )
        return res
    } catch (err) {

    }
}


export const initPreQuote = async (data, encryptedProposerId) => {
    try {
        let {
            Utm_Source,
            Utm_Medium,
            Utm_Term,
            Utm_Campaign,
            Utm_Content,
            LeadSource,
            gaClientID,
            proposerId,
            VisitID,
            EnquiryID,
            IPAddress,
            CJTypeID,
            Browser
        } = JSON.parse(JSON.stringify(data))
        const parameters = {
            headers: {
                "Content-Type": "application/json"
            }
        }

        const isVisitCookie = getCookie('visitorToken') || false
        const isLogCookie = getCookie('Cookie_VisitLog') || false

        console.log('getCokkiee---', isVisitCookie, isLogCookie);

        let utmDetail = {
            utm_Source: Utm_Source,
            utm_Medium: Utm_Medium,
            utm_Term: Utm_Term,
            utm_Campaign: Utm_Campaign,
            utm_Content: Utm_Content,
            leadSource: LeadSource,
            source: "source",
            gclid: gaClientID
        }

        let requestBody = {
            proposerID: proposerId,
            visitID: isLogCookie ? isLogCookie : 0,
            enquiryID: EnquiryID,
            ipAddress: IPAddress,
            cjTypeID: CJTypeID,
            browser: Browser,
            utmDetail,
            encryptedProposerID: encryptedProposerId || ''
        }
        requestBody = JSON.stringify(requestBody);
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.init}`,
            requestBody,
            parameters
        )

        if(res && res.data) {

            const {
                visitCookieName,
                visitID,
                expiredIn,
                visitorToken
            } = res.data;

            (!isVisitCookie || isVisitCookie !== visitorToken) && setCookie(visitCookieName, visitorToken, expiredIn)
            !isLogCookie && setCookie('Cookie_VisitLog', visitID, 30 )
        }

        return res
    } catch (err) {

    }
}

export const setCookie = (cname, cvalue, expiredIn) => {
    var d = new Date();
    d.setTime(d.getTime() + (expiredIn * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    var domain = ".policybazaar.com"
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/; domain="+domain;
}
  
export const getCookie = (cname) => {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}