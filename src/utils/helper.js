import _ from 'lodash';
import Moment from "moment";
import { extendMoment } from "moment-range";
import { relationData } from './../lib/helperData';
import { masterData } from '../ui/journey/Quotes/Filter/helperData';
import SelectedQuotes from '../ui/journey/Quotes/SelectedQuotes';
const moment = extendMoment(Moment);



export const filterZoneWiseData = (countryData, zone) => {
    return countryData.filter((country) => country.Zone === zone);
}

export const duplicateValue = (value, arr ) =>  arr.indexOf(value) !== -1 ;


export const removeSelectedDestinationData = (data, selectedDestinations) => {

    if(data && data.length && selectedDestinations && selectedDestinations.length) {
        const filterData = data.filter(
            (country) =>  selectedDestinations.indexOf(country.CountryName) === -1 
        );
        return filterData;
    }

    return data

}

export const validTravellerData = (data) => {

    if(_.isEmpty(data)) return false;
    let valid = true;

    data.forEach((item) => {
        valid = _.isEmpty(item) ? false : valid;
        valid = _.isEmpty(item) && !item.age ? false : valid; 
    })
    return valid === true;
}

export const getAge= (dateOfBirth)=>{
    if(dateOfBirth){
    return moment().year()-moment(dateOfBirth,"YYYY-MM-DD").year()
    }
    else {
    return null
    }
}


export const getQueryStringValue = (key) => {
    return decodeURIComponent(window.location.href.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }



export const PurposeOfTravel=[
    "Study",
    "Official",
    "Personal",
    "Business",
    "Holiday",
    "Professional"
]

export const VisaType=[
    "BusinessVisa",
    "EmploymentWorkVisa",
    "NonImmigrant",
    "Immigrant"
]

export const Nationality=[
    "INDIAN",
    "NON-INDIAN",
]
export const validateQuoteSelection = (state) =>{
    const { 
        selectedQuote, 
        QuotesTemp,
        MultipleProfile 
      } = state;

      if(MultipleProfile){
          if(!selectedQuote.Individual && !selectedQuote.SeniorCitizen){
              return { valid: false , error: 'Please Select Quotes'}
          }
          if(!selectedQuote.Individual){
              return { valid: false , error: 'Please Select Quote for Individual'}
          }if(!selectedQuote.SeniorCitizen){
              return { valid: false , error: 'Please Select Quote for Senior Citizen'}
          }
      }else{
          if(QuotesTemp.Individual && ! selectedQuote.Individual){
              return { valid: false , error: 'Please Select Quote for Individual'}
          }if(QuotesTemp['Senior Citizen'] && !selectedQuote.SeniorCitizen){
            return { valid: false , error: 'Please Select Quote for Senior Citizen'}
          }
      }
      return { valid: true , error: ''}
}

export const saveQuoteRequestBody = (state) =>{
    const {
        selectedQuote,
        profiles
    } = state;

    const obj = {};
    profiles.forEach(profile =>{
        obj[profile] = selectedQuote[profile].ItemSelection
    })
    return obj;
}

export const removeEmptyKeys = (obj) =>{
  Object.keys(obj).forEach(propName => {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
        delete obj[propName];
      }
  })
    return obj;
}

export const formattedCurrency = (currency) =>{

    let sumInsured = parseInt(currency);
    sumInsured = sumInsured.toLocaleString('en-IN');
    return sumInsured
}

export const getRelationId = (value) => {
    if(value) {
        const data = relationData.filter((item) => item.value === value);
        return data[0].id
    }

    return 1;
}

export const getRelation = (value) => {
    if(value) {
        const data = relationData.filter((item) => item.id === value);
        return data[0].value;
    }

    return 1;
}

const validatePed = (travellerData) => {
    const ped = travellerData.some(el => el.ped === true);
    return ped;
}

const transformTravellerData = (travellerData,type='Quote') =>{
    
    const traveller = travellerData.map(traveller =>{
        const obj = {
            proposerID: traveller.proposerID,
            fullName: traveller.fullName,
            dateOfBirth: traveller.dateOfBirth,
            visaTypeID: traveller.visaTypeID,
            travelPurposeID: traveller.travelPurposeID,
            nationalityID: traveller.nationalityID,
            relationTypeID: traveller.relationTypeID,
            relationType: traveller.relationType,
            profileID: traveller.profileID,
            proposerRelationID: traveller.proposerRelationID,
            proposerRelation: traveller.proposerRelation,
            parentIM: traveller.parentIM,
            denoteTraveller: traveller.denoteTraveller,
            labelTraveller: traveller.labelTraveller,
            temporaryProfileID: traveller.temporaryProfileID,
            isActive: traveller.isActive,
            pedStatus: traveller.pedStatus,
            planID: traveller.planID,
            profileTypeID: traveller.profileTypeID,
            ped: traveller.isPED,
            TemporaryID: traveller.temporaryID,
            age: traveller.age,
            InsuredMemberID: traveller.insuredMemberID,
            calendarStartOn: traveller.calendarStartOn || '',
            calendarEndOn: traveller.calendarEndOn || ''
        }

        if(type==='Quote') {
            obj.proposerRelationID = traveller.relationTypeID;
            obj.temporaryProfileID = traveller.temporaryProfileID;
            obj.name = `${traveller.labelTraveller}`
        }

        return obj
    })

    return traveller;
}

const groupFamilyData = (travellerData) => {
    let newTravellerData = _.clone(travellerData);
    const usedProfileType = [];
    const familyDataCollection = {};
    let count = 1;

    newTravellerData.forEach((travellerData, id) => {
        
        const usedProfileIndex = usedProfileType.findIndex((item)=> item === travellerData.profileID);
        if(usedProfileIndex !== -1) return;

        const families = newTravellerData.filter((obj) => obj.profileID === travellerData.profileID);
        // const tempIndex = families.findIndex(family => family)
        if(families.length < 2 && families[0].relationTypeID === 11 ) return;
        
        usedProfileType.push(travellerData.profileID);

        const family = families.map((traveller, index) => {
            return {
                InsuredMemberID: traveller.insuredMemberID,
                ped: traveller.isPED,
                TemporaryID: traveller.temporaryID,
                age: traveller.age,
                id: traveller.labelTraveller.split(' ')[1],
                name: `${traveller.labelTraveller}`,
                temporaryProfileID: traveller.temporaryProfileID,
                proposerRelationID:  traveller.proposerRelationID,
                relationShip: traveller.relationType,
            }
        });

        familyDataCollection[`family${count}`] = [...family];
        count++;
    });


    return familyDataCollection;
}

const transformDestinationData = (destinations) =>{
    const data = destinations.map(dest =>{
        const obj = {
            CountryID: dest.countryID,
            CountryName: dest.countryName
        }
        return obj
    })

    return data
}

export const tranformFilterDataForStore = (filters) => {
    let data = {};
        let filterMapperData = {} ;
        filters.forEach((filter) => {
            let profileType = null;
            // profileTypeID
            switch(filter.profileTypeID) {
                case 1: {
                    profileType = 'Individual'
                    break;
                  }
                  case 6: {
                    profileType = 'Senior Citizen'
                    break;
                  }
                  case 2: {
                    profileType = 'Family'
                    break;
                  }
                  case 7: {
                    profileType = 'Senior Family'
                    break;
                  }
                  case 8: {
                    profileType = 'Sr Citizen 71-80yrs'
                    break;
                  }
                  case 9: {
                    profileType = 'Sr Citizen 80+yrs'
                    break;
                  }
                  case 4: {
                    profileType = 'Student'
                    break;
                  }
            }

            if(!filterMapperData[profileType]) {
                filterMapperData[profileType] = {}
            }

            const filterItem = masterData.filter((obj) => obj.id === filter.filterID)[0];
            // if(filterMapperData[profileType] &&  filterMapperData[profileType][filterItem.parent]) {
            //     filterMapperData[profileType][filterItem.parent].push({...filterItem, selected: true });
            // }
            // else {

            //     filterMapperData[profileType][filterItem.parent] = [{ ...filterItem, selected: true }]
            // }
        });

        return filterMapperData;
}


export const transformDataForStore = (res) => {
    const { data } = res;
    const destinations =  [];

    const filters =  tranformFilterDataForStore(data.filters);

    data.tripCountries && data.tripCountries.forEach((country) => {
        destinations.push(country.countryName);
    })

    const travellerData = data.members && transformTravellerData(data.members);
    const familyDataCollection = data.members && groupFamilyData(data.members);

    const returnData = {
        tripDates: data.tripStartDate && data.tripEndDate
            ? [moment(data.tripStartDate), moment(data.tripEndDate)]
            : [],
        memberCount: data.members && data.members.length,
        destinationsData: data.tripCountries 
            ?transformDestinationData([...data.tripCountries])
            : [],
        destinations,
        filters: filters,
        isPed: data.members ? validatePed(travellerData) : false,
        travellerData,
        familyDataCollection,
        mobileNo: data.customer.mobileNo,
    }
    return returnData
}

export const hideScroll = () => {
    let scrollBody = document.getElementsByTagName("body");
    scrollBody[0].style.overflow = "hidden";
}

export const showScroll = () => {
    let scrollBody = document.getElementsByTagName("body");
      scrollBody[0].style.overflow = "auto";
}

export const transformPreQuoteDataForStore1 = (res) =>{
    
    const { data :resData} = res;

    const { data } = resData; 
    const destinations =  [];

    data.tripCountries && data.tripCountries.forEach((country) => {
        destinations.push(country.countryName);
    })

    const travellerData = data.insuredMembers && transformTravellerData(data.insuredMembers,'preQuote');
    const returnData = {
        tripDates: data.tripStartDate && data.tripEndDate
            ? [moment(data.tripStartDate), moment(data.tripEndDate)]
            : [],
        memberCount: data.insuredMembers && data.insuredMembers.length,
        destinationsData: data.tripCountries 
            ?transformDestinationData([...data.tripCountries])
            : [],
        destinations,
        isPed: data.insuredMembers ? validatePed(travellerData) : false,
        travellerData,
        mobileNo: data.mobileNo,
        validMobileNo: true 
    }
    return returnData
}

export const transformPreQuoteDataForStore = (res) =>{
    
    const { data: resData} = res;

    const { data } = resData; 
    const destinations =  [];

    data.tripCountries && data.tripCountries.forEach((country) => {
        destinations.push(country.countryName);
    })

    const travellerData = data.members && transformTravellerData(data.members,'preQuote');
    const returnData = {
        tripDates: data.tripStartDate && data.tripEndDate
            ? [moment(data.tripStartDate), moment(data.tripEndDate)]
            : [],
        memberCount: data.members && data.members.length,
        destinationsData: data.tripCountries 
            ?transformDestinationData([...data.tripCountries])
            : [],
        destinations,
        isPed: data.members ? validatePed(travellerData) : false,
        travellerData,
        mobileNo: data.customer.mobileNo,
        validMobileNo: true 
    }
    return returnData
}
const getFilterIds = (filters) =>{
    let filterId = [];
    !_.isEmpty(filters) 
    && filters
    && Object.keys(filters).forEach((key) => {
      if(key === undefined || key === null) return;

      if(!filters[key] || !filters[key].length) return;


      if(key === 'insurers') {
        const insurerIds = filters.insurers.map(insurer => insurer.insurerID);
        filterId = filterId.concat(insurerIds)
      } else if(key !== 'sumInsured') {
        if(!_.isEmpty(filters[key])){
            const ids = filters[key].map(ids=> ids.id)
            filterId = filterId.concat(ids)
        }
      }
    });

    return filterId.join(',')
}

const checkIfSelected = (profile, selectedQuote, quote) =>{
    if(_.isEmpty(selectedQuote)){
        return false
    }
    
    return selectedQuote[profile] && quote.SelectedPlan === selectedQuote[profile].ItemSelection? true : false
}

const getActiveQuotesData = (data) =>{
    const { quotes, QuotesTemp, selectedQuote, profile } = data;
    
    const newQuotes = !_.isEmpty(quotes[profile].premiums)
                    ? _.cloneDeep(quotes[profile].premiums)
                    : _.cloneDeep(QuotesTemp[profile].premiums)

    const type = !_.isEmpty(quotes[profile].premiums)
                ? 1
                : (!_.isEmpty(QuotesTemp[profile].premiums) ? 2: 1)

    const activeQuotes = newQuotes.map(quote =>{
        const obj = {
            ...quote,
            Default: "",
            displayFlag: true,
            IsLastDisplayedQuotes: true,
            IsSelected: checkIfSelected(profile, selectedQuote,quote),
            QuotesType: type
        }
        return obj
    })

    return activeQuotes
}
export const logActiveQuotesBody = (data) =>{

    const {
        profile,
        quotes,
        order,
        filters,
        enquiryID,
        QuotesTemp
    } = data

    if(_.isEmpty(quotes[profile].premiums) && _.isEmpty(QuotesTemp[profile].premiums)){
        return ''
    }

   const requestBody={
       ActiveQuotes: getActiveQuotesData(data),
       EnquiryID: enquiryID,
       FilterID: getFilterIds(filters[profile]),
       GUID: null,
       SortBy: order[profile],
       SumAssured: quotes[profile].SelectedSumInsured,
       TravellerCategoryID: quotes[profile].premiums[0] 
                            ? quotes[profile].premiums[0].TravellerCategoryID 
                            : (QuotesTemp[profile].premiums[0]
                                ? QuotesTemp[profile].premiums[0].TravellerCategoryID 
                                : '')
   }
   return requestBody
}


export const mapFilterDataForApi = (filter) => {
    let filterMapperData = [];

    Object.entries(filter).forEach(([key, value]) =>  {
        let profileTypeID = null;
        switch(key) {
          case 'Individual': {
            profileTypeID = 1
            break;
          }
          case 'Senior Citizen': {
            profileTypeID = 6
            break;
          }
          case 'Family': {
            profileTypeID = 2
            break;
          }
          case 'Senior Family': {
            profileTypeID = 7
            break;
          }
          case 'Sr Citizen 71-80yrs': {
            profileTypeID = 8
            break;
          }
          case 'Sr Citizen 80+yrs': {
            profileTypeID = 9
            break;
          }
          case 'Student': {
            profileTypeID = 4
            break;
          }
        }

        Object.entries(value).forEach(([filtername, filtervalue]) => {
          if(!filtervalue.length) return;
          if(filtername === 'sumInsured') return;
          if(filtername === 'insurers') return;

          const newData = filtervalue.map((obj) => {
            return {
              filterID: obj.id,
              profileTypeID,
              filter: obj.name
            }
          });

          filterMapperData.push(...newData);
        })
    })

    return filterMapperData;
  }

  export const getTemporaryId = (travellerData) =>{
    let max = travellerData[0].TemporaryID;
    travellerData.forEach(traveller => { 
        if(traveller.TemporaryID > max){
            max = traveller.TemporaryID
        }
    })
    return max
  }