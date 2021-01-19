
import { Actions } from '../../utils/actions';

export function onUpdateFilters(data) {
    return {
        type: Actions.FILTERS,
        filters: data
    }
}


export function onUpdateSorting(order) {
    return {
        type: Actions.SORTING_ORDER,
        order
    }
}

export function onUpdateStore(data) {
    return {
        type: Actions.REFRESH_DATA,
        data
    }
}

export function onInit(data) {
    return {
        type: Actions.INIT,
        proposerId: data.proposerId,
        enquiryId: data.enquiryId,
        encryptedProposerId: data.encryptedProposerId
    }
}

export function onSelectField(currentField) {
    return {
        type: Actions.SELECT_FIELD,
        currentField,
    };
}

export function onUpdateTripDate(values) {
    return {
        type: Actions.TRIP_DATES,
        dateRange: values,
    }
}

export function onUpdateTripSource(value) {
    return {
        type: Actions.TRIP_SOURCE,
        tripSource: value,
    }
}

export function onUpdateDestination(data) {

    return {
        type: Actions.DESTINATION,
        destinations: data.formattedDestinations,
        selectedDestination: data.destinations,
    }
}


export function onUpdateMemberCount(count) {
    return {
        type: Actions.MEMBER_COUNT,
        count,
    }
}


export function onUpdateMemberData(data) {
    return {
        type: Actions.MEMBER_DATA,
        travellerData: data
    }
}

export function onUpdateMobileNumber(data) {
    return {
        type: Actions.MOBILE_NUMBER,
        mobileNo: data.mobileNo,
        validNo: data.valid
    }
}

export function onUpdateMobileCountryCode(data) {
    return {
        type: Actions.MOBILE_CODE,
        countryCode: data.countryCode,
        validNo: data.valid
    }
}

export function onUpdateTimeZone(data) {
    return {
        type: Actions.TIMEZONE,
        timezone: data.timezone,
    }
}

export function defineFamilyAction(data){
    return {
        type: Actions.DEFINE_FAMILY,
        familyDataCollection: data
    }
}

export function setOperatorType(data){
    return {
        type: Actions.OPERATOR_TYPE,
        operatorType: data
    }
}

export function setFlowName(data){
    return{
        type : Actions.FLOW_NAME,
        flowName: data.flowName,
        journeyType: data.JourneyType
    }
}

export function saveProposalStep1Data(data){
    
    return{
        type : Actions.PROPOSAL_STEP1,
        data
    }
}

export function saveProposalStep2Data(data){
    return{
        type : Actions.PROPOSAL_STEP2,
        data
    }
}

export const onUpdateTravellerData = (data) =>{
    return {
        type: Actions.UPDATE_TRAVELLER,
        data
    }
}

export const onUpdateTripSummary = (data) => {
    return {
        type: Actions.TRIP_SUMMARY,
        data
    }
}

export const onRequestCallBack = (data) => {
    return {
        type: Actions.REQUEST_CALLBACK,
        data
    }
}

