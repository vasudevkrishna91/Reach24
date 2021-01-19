let dataLayer = window.dataLayer || [];

export const varPushEvent = (data) => {
    dataLayer.push({
      event         : 'varPush',
      userType      : "guest",
      productId     : 3,
      leadId        : data.leadId || "",
      enquiryId     : data.enquiryId,
      customerId    : data.customerId || "",
      pageLanguage  : "en",
      bookingId     : data.bookingId || "",
      // totalMembers  : data.members || "",
      pageType      : 'Trv.Prequote',
      pageName      : 'Trv.BU Prequotes',
      lobSection1   : "Travel Insurance",
      lobSection2   : "International",
      lobSection3   : 'Trv.v3',
      // cityName      : data.cityName || "",
      policyType    : "fresh",
      // coverAmount   : "",
      prevPage      : data.prevPage || "",
      flowName      : data.flowName,
      operatorType  : data.operatorType,
      visitId       : data.VisitId || 0,
      journeyType   : 'Trv.Lead first',
      referenceId    : data.ProposerID,
      cjType        : 'Trv.v3'
    })    
}

export const virtualPageEvent = (data) => {
  dataLayer.push({
    event         : 'virtualPage',
    userType      : "guest",
    productId     : 3,
    leadId        : data.leadId || "",
    enquiryId     : data.enquiryId,
    // customerId    : data.customerId || "",
    pageLanguage  : "en",
    bookingId     : data.bookingId || "",
    // totalMembers  : data.members || "",
    pageType      : data.pageType || "",
    pageName      : data.pageName || "",
    lobSection1   : "Travel Insurance",
    lobSection2   : "International",
    lobSection3   : 'Trv.v3',
    // cityName      : data.cityName || "",
    policyType    : "fresh",
    // coverAmount   : "",
    prevPage      : data.prevPage || "",
    flowName      : data.flowName,
    operatorType  : data.operatorType,
    visitId       : data.VisitId || 0,
    journeyType   : 'Trv.Lead first',
    referenceId    : data.ProposerID,
    cjType        : 'Trv.v3'
  })    
}

export const leadSubmitEvent = (data) => {
  dataLayer.push({
    event      : 'leadSubmit',
    productId  : 3,
    // pageName   : "Trv.BU lead",
    leadId     : data.leadId,
    enquiryId  : data.enquiryId,
    customerId : data.customerId,
    leadType   : "parent/child",
    bookingId  : data.bookingId,
    policyType : "fresh",
    cjType     : 'Trv.v3'
  });	
}

export const customEvent = (data) => {
  dataLayer.push({
    event       	: 'eventTracking',
    productId     : 3,
    eventCategory : data.eventCategory,
    eventAction   : data.eventAction,
    eventLabel    : data.eventLabel,
    eventValue    : data.eventValue,					
    flowName			: data.flowName,
    journeyType   : 'Trv.Lead first',
    cjType        : 'Trv.v3'
  })
}

export const addImpression = (data,search) => {
  var quoteList  = []
  for(var key in data){
    for( let i=0; i< (data[key].premiums).length; i++ ){
      let val = data[key].premiums[i]
      quoteList.push({
        name : 'NA',
        id : val.PlanID,
        price : 'NA',
        brand : val.InsurerID,
        category : `Trv.${key}`,
        variant : '',
        list : search,
        dimension41 : data[key].DefaultSI,
        position : i + 1
        })
    }
  }
  try{
    dataLayer.push({
      event: 'productImp',
      productId    : 3,
      // coverAmount : 'coverAmount',
      ecommerce : {
        currencyCode : 'INR',// Local currency is optional.
        impressions : quoteList
      }
    });
  }
  catch(e){}
}

export const addProduct = (data,search) => {
  var quoteList  = []
  quoteList.push({
    name : 'NA',   
    id : data.data.PlanID,
    price : 'NA',
    brand : data.data.InsurerID,
    category : `Trv.${data.profileType}`,
    variant : '',
    list : search,
    dimension41 : data.data.DisplaySumInsured,
    position : 1
 })
  try{
    dataLayer.push({
      event : 'productClick',
      productId    : 3,
      coverAmount : data.data.DisplaySumInsured,
      ecommerce : {
        click : {
          actionField : {  'list': search },
          products : quoteList
        }
      }
    });										
  }
  catch(e){}
}

export const onPageLoad=(pt,pn)=>{
  dataLayer.push({
    flowName: 'Trv.Direct',
    pageType: pt,
    lobSection1: 'Travel Insurance',
    lobSection2: 'International',
    lobSection3: '',
    pageName: pn,
    journeyType: 'Trv.Lead first',
    policyType: 'fresh',
    pageLanguage: "en",
  })
}