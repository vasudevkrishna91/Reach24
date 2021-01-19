import _ from 'lodash';
import { Actions } from '../../utils/actions';
import { getQuotes } from '../../services/quotes';

const moment = require('moment');

/* eslint-disable no-param-reassign */

const initTravellerData = (members = 1) => {
    const travellersData = [];
    while (members) {
        travellersData.push({
            TemporaryID: 1,
            InsuredMemberID: 0,
            relationTypeID:11
        });
        members--;
    }
    return travellersData;
}



const validatePed = (travellerData) => {
    const ped = travellerData.some(el => el.ped === true);
    return ped;
}

const checkForTemporaryID = (travellerData) =>{
    let count = 1; 
    const travellers = travellerData.map(traveller =>{
        const obj = {
            ...traveller,
            TemporaryID: traveller.TemporaryID ? traveller.TemporaryID: count
        }
        count = traveller.TemporaryID ? count: ++count
        return obj
    })
    return travellers
} 

const getValidMobileNo = (mobile, countryCode) => {
    let error = "";
    if (!mobile || mobile.length !== 10) {
        error = "Please enter 10 digit Mobile no.";
    } 
    else if (
      mobile.charAt(0) !== "8" &&
      mobile.charAt(0) !== "9" &&
      mobile.charAt(0) !== "7" &&
      mobile.charAt(0) !== "6" &&
      countryCode === "91"
    ) {
      error = "Please enter valid Mobile no.";
    }
    
    return error === "";
}


const initialState = {
    currentField: 'country',
    dateRange: [null, null],
    tripDateSelected: false,
    destinations: [],
    travellerData: initTravellerData(1),
    count: 0,
    familyDataCollection: {},
    proposalStep1: {},
    proposalStep2: {},
    saveTravellerDOB: false
}

const preQuoteReducer = (state = initialState, action) => {
    let getQuoteData = localStorage.getItem('getQuote');
    const askDob = sessionStorage.getItem('askDob');
    if(askDob === null) {
        sessionStorage.setItem('askDob', true);
    }

    const askAMT = sessionStorage.getItem('askAMT');
    if(askAMT === null) {
        sessionStorage.setItem('askAMT', false);
    }

    getQuoteData = JSON.parse(getQuoteData);
    if (!getQuoteData || _.isEmpty(getQuoteData)) {
        getQuoteData = {
            memberCount: 0,
        };
        localStorage.setItem('getQuote', JSON.stringify(getQuoteData));
    } else {
        const {
            destinations,
            destinationsData,
            memberCount,
            travellerData,
            tripDates,
            mobileNo,
            countryCode,
            timezone,
            validMobileNo,
            tripSource,
            familyDataCollection,
            order,
            filters,
            proposerId,
            saveTravellerDOB,
            enquiryId,
            encryptedProposerId,
            tripSummary,
            requestCallBackData
        } = getQuoteData;

        state.dateRange = tripDates ?
            [moment(tripDates[0]), moment(tripDates[1])] :
            state.dateRange;
        state.tripDateSelected = !!tripDates;
        state.destinations = destinations && destinations.length ?
            destinations :
            state.destinations;
        state.travellerData = !_.isEmpty(travellerData)? 
        checkForTemporaryID(travellerData) : 
            state.travellerData;
        state.count = memberCount || state.count;
        state.mobileNo = mobileNo || state.mobileNo;
        state.destinationsData = destinationsData && destinationsData.length ?
            destinationsData :
            state.destinationsData;
        state.countryCode = countryCode || '91';
        state.validMobileNo = validMobileNo || getValidMobileNo(state.mobileNo, state.countryCode) ;
        state.timezone = timezone || null;
        state.tripSource = tripSource || 'India';
        state.order = order || 0;
        state.filters = filters || {};
        state.familyDataCollection = familyDataCollection || state.familyDataCollection;
        state.proposerId = proposerId || 0;
        state.saveTravellerDOB = saveTravellerDOB || false;
        state.enquiryId = enquiryId || '';
        state.encryptedProposerId = encryptedProposerId || '';
        state.tripSummary = tripSummary || null;
        state.requestCallBackData = requestCallBackData || undefined;

    }



    state.isPed = validatePed(state.travellerData);

    switch (action.type) {
        case Actions.SELECT_FIELD:
            return {
                ...state,
                currentField: action.currentField,
            }
        case Actions.TRIP_DATES:
            getQuoteData.tripDates = action.dateRange;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));
            return {
                ...state,
                dateRange: action.dateRange,
                tripDateSelected: true
            }
        case Actions.DESTINATION: {
            getQuoteData.destinations = action.destinations;
            getQuoteData.destinationsData = action.selectedDestination;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));
            return {
                ...state,
                destinations: action.destinations,
                destinationsData: action.selectedDestination,
            }
        }
        case Actions.MEMBER_COUNT:
            getQuoteData.memberCount = action.count;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                count: action.count,
            }

        case Actions.MEMBER_DATA:
            getQuoteData.travellerData = action.travellerData;
            getQuoteData.memberCount = action.travellerData.length;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                isPed: validatePed(action.travellerData),
                travellerData: action.travellerData,
                count: action.travellerData.length,

            }
        case Actions.MOBILE_NUMBER:
            getQuoteData.mobileNo = action.mobileNo;
            getQuoteData.validMobileNo = action.validNo;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                mobileNo: action.mobileNo,
                validMobileNo: action.validNo,
            }
        case Actions.MOBILE_CODE:
            getQuoteData.countryCode = action.countryCode;
            getQuoteData.validMobileNo = action.validNo;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                countryCode: action.countryCode,
                validMobileNo: action.validNo,
            }
        case Actions.TIMEZONE:
            getQuoteData.timezone = action.timezone;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                timezone: action.timezone,
            }

        case Actions.TRIP_SOURCE:
            getQuoteData.tripSource = action.tripSource;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                tripSource: action.tripSource,
            }

        case Actions.DEFINE_FAMILY:
            getQuoteData.familyDataCollection = action.familyDataCollection;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                familyDataCollection: action.familyDataCollection,
            }
        case Actions.OPERATOR_TYPE:
            return {
                ...state,
                operatorType: action.operatorType
            }
        case Actions.FLOW_NAME:
            return {
                ...state,
                flowName: action.flowName,
                journeyType: action.journeyType
            }

        case Actions.REFRESH_DATA:
            const data = action.data;
            // const filters = _.isEmpty(state.filters) ? data.filters : state.filters

            getQuoteData = {
                ...getQuoteData,
                ...data,
                filters: data.filters
            };

            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));
            return {
                ...state,
                ...data,
                count: data.memberCount,
                dateRange: data.tripDates
            }

        case Actions.INIT:

            getQuoteData = {
                ...getQuoteData,
                proposerId: action.proposerId || 0,
                enquiryId: action.enquiryId,
                encryptedProposerId: action.encryptedProposerId
            };

            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));
            return {
                ...state,
                proposerId: action.proposerId || 0,
                enquiryId: action.enquiryId,
                encryptedProposerId: action.encryptedProposerId
            }

        case Actions.PROPOSAL_STEP1:  
            // proposalStep1 = action.data
            return {
                ...state,
                proposalStep1: action.data
            }

        case Actions.PROPOSAL_STEP2:
            // state.proposalStep2 = action.data
            return {
                ...state,
                proposalStep2: action.data

            }
        case Actions.SORTING_ORDER:
            getQuoteData.order = action.order;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));
            return {
                ...state,
                order: action.order,
            }

        case Actions.FILTERS:
            getQuoteData.filters = action.filters;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));
            return {
                ...state,
                filters: action.filters
            }
        case Actions.UPDATE_TRAVELLER:
            getQuoteData.travellerData = action.data.travellerData;
            getQuoteData.saveTravellerDOB = action.data.saveTravellerDOB;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                isPed: validatePed(action.data.travellerData),
                travellerData: action.data.travellerData,
                saveTravellerDOB: action.data.saveTravellerDOB
            }

        case Actions.TRIP_SUMMARY: 
            getQuoteData.tripSummary = action.data;
            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                tripSummary: action.data,
            }  
        
        case Actions.REQUEST_CALLBACK: 
            getQuoteData.requestCallBackData = action.data;
            getQuoteData.countryCode = action.data.countryCode;
            getQuoteData.validMobileNo = action.data.validNo;

            localStorage.setItem('getQuote', JSON.stringify(getQuoteData));

            return {
                ...state,
                requestCallBackData: action.data,
                mobileNo: action.data.mobileNo,
                validMobileNo: action.data.validNo,
            }  
            
            
        default:
            return state;
    }

}

export default preQuoteReducer;

