export const filtersType = [
  "Coverages",
  "Sum Insured Coverage",
  // "Special Features",
  "Visa Type",
  "Purpose Of Travel",
  //"Plan Types",
];

export const PlanTypesFilter = [
  {
    id: 36,
    name: "Single Trip Plans",
    parent: "planTypes",
    noChip: true
  },
  {
    id: 37,
    name: "Annual Multi-Trip Plans",
    parent: "planTypes",
    noChip: true,
  },
]

export const CoveragesFilter = [
  {
    id: 1,
    name: "Pre-existing disease covered",
    parent: "coverages",
    parentID: 1001, filterID: 1, filter: "Pre-existing disease covered", actualID: 1
  },
  {
    id: 2,
    name: "Adventure sports covered",
    parent: "coverages",
    parentID: 1001, filterID: 2, filter: "Adventure sports  Covered", actualID: 2,

  },
  {
    id: 3,
    name: "Pet Care",
    parent: "coverages",
    parentID: 1001, filterID: 3, filter: "Pet Care", actualID: 3,
  },
  {
    id: 4,
    name: "Coverage on Cruise",
    parent: "coverages",
    parentID: 1001, filterID: 4, filter: "Coverage on Cruise", actualID: 4,
  },
  {
    id: 6,
    name: "Home Burglary Covered",
    parent: "coverages",
    parentID: 1001, filterID: 6, filter: "Home Burglary Covered", actualID: 6,
  },
  {
    id: 7,
    name: "Card Fraud",
    parent: "coverages",
    parentID: 1001, filterID: 7, filter: "Card Fraud", actualID: 7,
  },
  {
    id: 9,
    name: "No medical sublimit",
    parent: "coverages",
    parentID: 1001, filterID: 9, filter: "No medical sublimit", actualID: 9,
  },
];

export const SumInsuredFilter = [
  {
    id: 10,
    name: 'Individiual basis',
    parent: 'sumInsuredFilter',
    parentID: 1002, filterID: 10, filter: "Individual basis", actualID: 10,
  },
  {
    id: 11,
    name: 'Floater basis',
    parent: 'sumInsuredFilter',
    parentID: 1002, filterID: 11, filter: "Floater basis", actualID: 11,
  }
];

export const SpecialFilter = [{
  id: 24,
  name: "Non Indian Passport Holder(Resident in India)",
  parent: 'special'
}];

export const VisaTypeFilter = [
  {
    id: 13,
    name: 'Tourist/ Visitor Visa',
    parent: 'visaType',
    parentID: 1004, filterID: 13, filter: "Tourist/Visitor Visa", actualID: 13,

  },
  {
    id: 14,
    name: 'Short term work Visa (stay less than 6 months)',
    parent: 'visaType',
    parentID: 1004, filterID: 14, filter: "Short term work Visa (stay less than 6 months)", actualID: 14,
  },
  {
    id: 30,
    name: 'Long term work Visa (stay more than 6 months)',
    parent: 'visaType',
    parentID: 1004, filterID: 30, filter: "Long term work Visa (stay more than 6 months)", actualID: 30,
  },
  {
    id: 15,
    name: 'Permanent Resident Card/Immigrant visa',
    parent: 'visaType',
    parentID: 1004, filterID: 15, filter: "Permanent Resident Card/Immigrant visa", actualID: 15,
  },
  {
    id: 31,
    name: 'Dependent Visa',
    parent: 'visaType',
    parentID: 1004, filterID: 31, filter: "Dependent Visa", actualID: 31,
  },
  {
    id: 32,
    name: 'Diplomatic Visa',
    parent: 'visaType',
    parentID: 1004, filterID: 32, filter: "Diplomatic Visa", actualID: 32,
  },
  {
    id: 16,
    name: 'Student Visa',
    parent: 'visaType',
    noChip: true,
    parentID: 1004, filterID: 16, filter: "Student Visa", actualID: 16,
  },
  {
    id: 35,
    name: 'Expat (No Visa Required)',
    parent: 'visaType',
    parentID: 1004, filterID: 35, filter: "Expat (No Visa Required)", actualID: 35,
  }
];

export const TravellingPurposeFilter = [
  {
    id: 18,
    name: 'Holiday / Tourism',
    parent: 'travellingPurpose',
    parentID: 1005, filterID: 18, filter: "Holiday/Tourism", actualID: 18,
  },
  {
    id: 20,
    name: 'Employment (stay more than 6 months)',
    parent: 'travellingPurpose',
    parentID: 1005, filterID: 20, filter: "Employment (stay more than 6 months)", actualID: 20,
  },
  {
    id: 22,
    name: 'Business / Work (stay less than 6 months)',
    parent: 'travellingPurpose',
    parentID: 1005, filterID: 22, filter: "Business /Work (stay less than 6 months)", actualID: 22,
  },
  {
    id: 33,
    name: 'Relocation',
    parent: 'travellingPurpose',
    parentID: 1005, filterID: 33, filter: "Relocation", actualID: 33,
  },
  {
    id: 21,
    name: 'Studies',
    parent: 'travellingPurpose',
    parentID: 1005, filterID: 21, filter: "Studies", actualID: 21,
  },
  {
    id: 34,
    name: 'Medical Treatment',
    parent: 'travellingPurpose',
    parentID: 1005, filterID: 34, filter: "Medical Treatment", actualID: 34,
  },
  {
    id: 17,
    name: 'Going home (Non-Indian Passport)',
    parent: 'travellingPurpose',
    parentID: 1005, filterID: 17, filter: "Going home (Non-Indian Passport)", actualID: 17,
  }
];


export const masterData = [
  {
    id: 1,
    name: "Pre-existing disease covered",
    parent: "coverages"
  },
  {
    id: 2,
    name: "Adventure sports covered",
    parent: "coverages"
  },
  {
    id: 3,
    name: "Pet Care",
    parent: "coverages",
  },
  {
    id: 4,
    name: "Coverage on Cruise",
    parent: "coverages"
  },
  {
    id: 6,
    name: "Home Burglary Covered",
    parent: "coverages"
  },
  {
    id: 7,
    name: "Card Fraud",
    parent: "coverages"
  },
  {
    id: 9,
    name: "No medical sublimit",
    parent: "coverages"
  },
  {
    id: 10,
    name: 'Individiual basis',
    parent: 'sumInsuredFilter'
  },
  {
    id: 11,
    name: 'Floater basis',
    parent: 'sumInsuredFilter'
  },
  {
    id: 24,
    name: "Non Indian Passport Holder(Resident in India)",
    parent: 'special'
  },
  {
    id: 13,
    name: 'Tourist/ Visitor Visa',
    parent: 'visaType'
  },
  {
    id: 14,
    name: 'Short term work Visa (stay less than 6 months)',
    parent: 'visaType'
  },
  {
    id: 25,
    name: 'Long term work Visa (stay more than 6 months)',
    parent: 'visaType'
  },
  {
    id: 15,
    name: 'Permanent Resident Card/Immigrant visa',
    parent: 'visaType'
  },
  {
    id: 26,
    name: 'Dependent Visa',
    parent: 'visaType'
  },
  {
    id: 27,
    name: 'Diplomatic Visa',
    parent: 'visaType'
  },
  {
    id: 16,
    name: 'Student Visa',
    parent: 'visaType',
    noChip: true
  },
  {
    id: 30,
    name: 'Expat (No Visa Required)',
    parent: 'visaType'
  },
  {
    id: 18,
    name: 'Holiday / Tourism',
    parent: 'travellingPurpose'

  },
  {
    id: 20,
    name: 'Employment (stay more than 6 months)',
    parent: 'travellingPurpose'
  },
  {
    id: 22,
    name: 'Business / Work (stay less than 6 months)',
    parent: 'travellingPurpose'
  },
  {
    id: 28,
    name: 'Relocation',
    parent: 'travellingPurpose'
  },
  {
    id: 21,
    name: 'Studies',
    parent: 'travellingPurpose'
  },
  {
    id: 29,
    name: 'Medical Treatment',
    parent: 'travellingPurpose'
  },
  {
    id: 17,
    name: 'Going home (Non-Indian Passport)',
    parent: 'travellingPurpose'
  },
  {
    id: 36,
    name: "Single Trip Plans",
    parent: "planTypes",
    noChip: true,
  },
  {
    id: 37,
    name: "Annual Multi-Trip Plans",
    parent: "planTypes",
    noChip: true,
  },
];

export const QuoteFilters = [
  { parentID: 1001, filterID: 1, filter: "Pre-existing disease covered", actualID: 1 },
  { parentID: 1001, filterID: 2, filter: "Adventure sports  Covered", actualID: 2 },
  { parentID: 1001, filterID: 3, filter: "Pet Care", actualID: 3 },
  { parentID: 1001, filterID: 4, filter: "Coverage on Cruise", actualID: 4 },
  { parentID: 1001, filterID: 6, filter: "Home Burglary Covered", actualID: 6 },
  { parentID: 1001, filterID: 7, filter: "Card Fraud", actualID: 7 },
  { parentID: 1001, filterID: 9, filter: "No medical sublimit", actualID: 9 },
  { parentID: 1001, filterID: 28, filter: "OPD Treatment Covered", actualID: 28 },
  { parentID: 1002, filterID: 10, filter: "Individual basis ", actualID: 10 },
  { parentID: 1002, filterID: 11, filter: "Floater basis", actualID: 11 },
  { parentID: 1003, filterID: 29, filter: "Non Indian Passport Holder (Residing in India)", actualID: 29 },
  { parentID: 1004, filterID: 13, filter: "Tourist/Visitor Visa", actualID: 13 },
  { parentID: 1004, filterID: 14, filter: "Short term work Visa (stay less than 6 months)", actualID: 14 },
  { parentID: 1004, filterID: 15, filter: "Permanent Resident Card/Immigrant visa", actualID: 15 },
  { parentID: 1004, filterID: 16, filter: "Student Visa", actualID: 16 },
  { parentID: 1004, filterID: 30, filter: "Long term work Visa (stay more than 6 months)", actualID: 30 },
  { parentID: 1004, filterID: 31, filter: "Dependent Visa", actualID: 31 },
  { parentID: 1004, filterID: 32, filter: "Diplomatic Visa", actualID: 32 },
  { parentID: 1004, filterID: 35, filter: "Expat (No Visa Required)", actualID: 35 },
  { parentID: 1005, filterID: 17, filter: "Going home (Non-Indian Passport)", actualID: 17 },
  { parentID: 1005, filterID: 18, filter: "Holiday/Tourism", actualID: 18 },
  { parentID: 1005, filterID: 20, filter: "Employment (stay more than 6 months)", actualID: 20 },
  { parentID: 1005, filterID: 21, filter: "Studies", actualID: 21 },
  { parentID: 1005, filterID: 22, filter: "Business /Work (stay less than 6 months)", actualID: 22 },
  { parentID: 1005, filterID: 33, filter: "Relocation", actualID: 33 },
  { parentID: 1005, filterID: 34, filter: "Medical Treatment", actualID: 34 },
  { parentID: 1007, filterID: 38, filter: "Apollo Munich", actualID: 1 },
  { parentID: 1007, filterID: 39, filter: "Bajaj Allianz", actualID: 2 },
  { parentID: 1007, filterID: 40, filter: "HDFC", actualID: 4 },
  { parentID: 1007, filterID: 41, filter: "Iffco Tokio", actualID: 5 },
  { parentID: 1007, filterID: 42, filter: "Reliance", actualID: 6 },
  { parentID: 1007, filterID: 43, filter: "Royal Sundaram", actualID: 7 },
  { parentID: 1007, filterID: 44, filter: "Star Health", actualID: 8 },
  { parentID: 1007, filterID: 45, filter: "Tata AIG", actualID: 9 },
  { parentID: 1007, filterID: 46, filter: "Religare", actualID: 10 },
  { parentID: 1007, filterID: 47, filter: "Bharti Axa", actualID: 11 },
  { parentID: 1007, filterID: 48, filter: "New India assurance", actualID: 12 },
  { parentID: 1007, filterID: 49, filter: "Future Generali", actualID: 13 },
  { parentID: 1007, filterID: 50, filter: "SBI General Insurance Company Ltd", actualID: 14 },
  { parentID: 1007, filterID: 51, filter: "Universal Sompo General Insurance Company Ltd", actualID: 15 },
  { parentID: 1007, filterID: 52, filter: "Shriram", actualID: 21 },
  { parentID: 1007, filterID: 53, filter: "Digit", actualID: 22 },
  { parentID: 1007, filterID: 54, filter: "Royal Sundaram", actualID: 23 },
  { parentID: 1007, filterID: 55, filter: "HDFC ERGO Health", actualID: 24 },

]


