import Moment from "moment";
import { extendMoment } from "moment-range";

const moment = extendMoment(Moment);

export const travellerHeaders = [
    'Members Insured',
    'Age',
    'Any Medical Condition?',
]


export const destinationMapper = {
    US_CANADA: 1,
    Europe: 6,
    Asia: 5,
    AUS_NZ: 0,
    India: 7,
    Others: 2,
}

export const currencyFormat = [
    {
        value: 'Dollar',
        type: 'USD'
    },
    {
        value: 'Euro',
        type: 'EUR'
    }
]

export const highlightedCountriesList = [
    {
        countryName: 'USA/Canada',
        classIcon: 'usa_icon',
        zone: "USA/ Canada",
        type: ""
    },
    {
        countryName: 'Schengen',
        classIcon: 'sachengen_icon',
        zone: 'Europe',
        type: ""
    },
    {
        countryName: 'Asia',
        classIcon: 'asia_icon',
        zone: 'Asia',
        type: ""
    },
    {
        countryName: 'Aus/NZ',
        classIcon: 'auu_nz_icon',
        zone: 'AUS/NZ',
        type: ""
    },
    {
        countryName: 'Within India',
        classIcon: 'india_icon',
        zone: 'India',
        type: ""
    },
    {
        countryName: 'Others',
        classIcon: 'other_icons',
        zone: 'Others',
        type: ""
    }
]

export const visaType = [
    {
        id: 0,
        visaType: 'Select',
        value: 'Select'
    },
    {
        id: 1,
        visaType: 'Tourist Visa',
        value: 'Tourist Visa'
    },
    {
        id: 2,
        visaType: 'Resident Visa',
        value: 'Resident Visa'
    },
    {
        id: 3,
        visaType: 'Emplotment/Work Visa',
        value: 'Emplotment/Work Visa'
    },
    {
        id: 4,
        visaType: 'Business Visa',
        value: 'Business Visa'
    }
]

export const nomineeRelations = [
    {
        id: 0,
        value: "Select"
    },
    {
        id: 1,
        value: "Brother"
    },
    {
        id: 2,
        value: "Child"
    },
    {
        id: 3,
        value: "Daughter",
    },
    {
        id: 4,
        value: "Father",
    },

    {
        id: 5,
        value: "Father-in-Law",
    },


]


export const travelPurpose = [
    {
        id: 0,
        purpose: 'Select',
        value: 'Select'
    },
    {
        id: 1,
        purpose: 'Holiday',
        value: 'Holiday'
    },
    {
        id: 2,
        purpose: 'Business',
        value: 'Business'
    }
]

export const calenderFormats = [
    {
        id: 1,
        value: "DD MMM YYYY"
    },
    {
        id: 2,
        value: "DD-MM-YYYY"
    }
]

export const nationality = [
    {
        id: 0,
        value: 'Select'
    },
    {
        id: 1,
        value: 'Indian'
    },
    {
        id: 2,
        value: 'Non-Indian'
    }
]

export const controlTypes = [
    "radio",
    "checkbox",
    "TextBox",
]


export const calenderEvents = {
    onDateChange: 1,
    onFocusChange: 2
}

export const flag = {
    true: "true",
    false: "false"
}


export const occupations = [
    {
        id: 0,
        value: 'Select'
    },
    {
        id: 1,
        value: 'Doctor'
    },
    {
        id: 2,
        value: 'Nalla'
    },
    {
        id: 3,
        value: 'BerojGar'
    },
    {
        id: 3,
        value: 'Engineer'
    },
]

export const documents = [
    {
        id: 0,
        value: 'Passport Front'
    }
    ,
    {
        id: 1,
        value: 'Passport Back'
    }
]


export const salutations = [
    {
        id: 0,
        value: 'Select'
    },
    {
        id: 1,
        value: 'Mr'
    },
    {
        id: 2,
        value: 'Mrs'
    }
]

export const maritalStatus = [
    {
        id: 0,
        value: 'Select'
    },
    {
        id: 1,
        value: 'Single'
    },
    {
        id: 2,
        value: 'Married'
    }
]

export const indianPassports = [
    {
        id: 0,
        value: 'Select'
    },
    {
        id: 1,
        value: 'Yes'
    },
    {
        id: 2,
        value: 'No'
    }
]

export const DESTINATION_LIMIT = 9;


export const InsurerFilter = [
    {
        insurerID: "2",
        name: "Bajaj Allianz",
        parent: "insurers"
    },
    {
        insurerID: "11",
        name: "Bharti Axa",
        parent: "insurers"
    },
    {
        insurerID: "22",
        name: "Digit",
        parent: "insurers"
    },
    {
        insurerID: "13",
        name: "Future Generali",
        parent: "insurers"
    },
    {
        insurerID: "4",
        name: "HDFC Ergo General Insurance",
        parent: "insurers"
    },
    {
        insurerID: "24",
        name: "HDFC Ergo Health Insurance",
        parent: "insurers"
    },
    {
        insurerID: "5",
        name: "Iffco Tokio",
        parent: "insurers"
    },

    {
        insurerID: "12",
        name: "New India assurance",
        parent: "insurers"
    },

    {
        insurerID: "6",
        name: "Reliance",
        parent: "insurers"
    },
    {
        insurerID: "10",
        name: "Religare",
        parent: "insurers"
    },
    {
        insurerID: "7",
        name: "Royal Sundaram",
        parent: "insurers"

    },
    {
        insurerID: "14",
        name: "SBI General Insurance Company Ltd",
        parent: "insurers"

    },
    {
        insurerID: "21",
        name: "Shriram",
        parent: "insurers"

    },
    {
        insurerID: "8",
        name: "Star Health",
        parent: "insurers"
    },
    {
        insurerID: "9",
        name: "Tata AIG",
        parent: "insurers"
    },
    {
        insurerID: "15",
        name: "Universal Sompo",
        parent: "insurers"

    }
]

export const SumInsuredFilter = [
    {
        currency: 'USD',
        name: '50000',
        filterID: 58,
        actualID: 58
    },
    {
        currency: 'USD',
        name: '100000',
        filterID: 59,
        actualID: 59
    },
    {
        currency: 'USD',
        name: '150000',
        filterID: 60,
        actualID: 60
    },
    {
        currency: 'USD',
        name: '200000',
        filterID: 61,
        actualID: 61
    },
    {
        currency: 'USD',
        name: '250000',
        filterID: 62,
        actualID: 62
    },
    {
        currency: 'USD',
        name: '300000',
        filterID: 63,
        actualID: 63
    },
    {
        currency: 'USD',
        name: '500000',
        filterID: 64,
        actualID: 64
    },
    {
        currency: 'USD',
        name: '750000',
        filterID: 65,
        actualID: 65
    },
    {
        currency: 'USD',
        name: '1000000',
        filterID: 66,
        actualID: 66
    },
    {
        currency: 'EUR',
        name: '30000',
        filterID: 67,
        actualID: 67
    },
    {
        currency: 'EUR',
        name: '50000',
        filterID: 68,
        actualID: 68
    },
    {
        currency: 'EUR',
        name: '100000',
        filterID: 69,
        actualID: 69
    },
    {
        currency: 'USD&EUR',
        name: '30000'
    },
    {
        currency: 'USD&EUR',
        name: '50000'
    },
    {
        currency: 'USD&EUR',
        name: '100000'
    },
]


export const relationData = [
    {
        id: 1,
        value: 'Self',
        disabled: false
    },
    {
        id: 2,
        value: 'Spouse',
        disabled: false
    },
    {
        id: 3,
        value: 'Son',
        disabled: false
    },
    {
        id: 4,
        value: 'Daughter',
        disabled: false
    },
    {
        id: 5,
        value: 'Father',
        disabled: false
    },
    {
        id: 6,
        value: 'Mother',
        disabled: false
    },
]


export const actionTypes = {
    PROCEED: 1,
    SAVEFORM: 2,
    EDITMEMBER: 3,
    EDITCOUNTRIES: 4,
    EDITTRIPDATES: 5,
    DEFINEFAMILY: 6,
    APPLYFILTERS: 7,
    QUOTESELECTED: 8,
    COREIDs: 9,
    PROPOSALNO: 10,
    PAYMENT: 11,
    POLICYNO: 12,
    SUBMITPROPOSER: 13,
    SUBMITINSUREDMEMBER: 14
}

export const copyFrom = {
    traveller: 1,
    proposer: 2
}

export const profileTypes = {
    self: 1,
    family: 2,
    senionFamily: 7,
    student: 4
}

export const requestFrom = {
    traveller: 1,
    proposer: 2,
    customer: 3
}

export const dataField = {
    travellerName: 1,
    travellerGender: 2,
    passportExpiredOn: 3,
    passportno: 4,
    nomineeName: 5,
    nomineeRelationShip: 6,
    proposerName: 7,
    proposerGender: 8,
    proposerDateofBirth: 9,
    proposerEmail: 10,
    proposerPincode: 11,
    proposercity: 12,
    proposerAddress: 13,
    proposerAlternateNumber: 14,
    proposerRelationWithInsured: 15,
    customerName: 16,
    customerEmail: 17,
    customerPhone: 18,
    customerPan: 19
}

export const fileExtensions = [
    'jpeg', 'jpg', 'pdf', 'png'

]
