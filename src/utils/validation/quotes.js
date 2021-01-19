import * as _ from "lodash";
import { relationData } from "../../lib/helperData";
import { lang } from "../../cms/i18n/en";

export const validateQuoteSelection = (state) =>{
    const { 
        selectedQuote, 
        selectedQuotes,
        profiles
      } = state;

  const validation = {
    valid: true,
    error: {}
  };

      profiles.forEach(profile =>{
          if(selectedQuotes.findIndex(x=>x.profileTypeID===profile.profileTypeID)===-1){
              validation.error[profile.profileName] =  `Please Select Plan for ${profile.profileName}`; 
              validation.valid = false;
          }
      })
      return validation
}

const validateRelationsShips = families => {
  const validation = {
    valid: true,
    error: ""
  };

  Object.keys(families).forEach(key => {
    const family = families[key];
    family.forEach(traveller => {
      const { age, relationShip } = traveller;
      if (
        age < 18 &&
        (relationShip === "Father" || relationShip === "Mother" || relationShip === "Spouse")
      ) {
        validation.valid = false;
        validation.error = "Please assign correct relationship for travellers less than 18";
      } else if (family.length > 1 && age < 18 && relationShip === "Self") {
        validation.valid = false;
        validation.error = "Traveller less than 18 cannot be a proposer";
      } else if (age > 60 && (relationShip === "Son" || relationShip === "Daughter")) {
        validation.valid = false;
        validation.error = "Please assign correct relationship for travellers";
      }
    });
  });
  return validation;
};

const checkForNuclear = family => {
  const validation = { valid: true, error: "" };
  const familyTemp = _.cloneDeep(family);
  if (familyTemp.length > 1) {
    const index = familyTemp.findIndex(
      traveller =>
        traveller.age > 18 &&
        (traveller.relationShip === "Father" ||
          traveller.relationShip === "Mother" ||
          traveller.relationShip === "Brother" ||
          traveller.relationShip === "Sister")
    );
    if (index !== -1) {
      familyTemp.splice(index, 1);
      familyTemp.forEach(traveller => {
        const { relationShip } = traveller;
        if (
          relationShip === "Brother" ||
          relationShip === "Sister" ||
          relationShip === "Self" ||
          relationShip === "Spouse" ||
          relationShip === "Son" ||
          relationShip === "Daughter"
        ) {
          validation.valid = false;
          validation.error =
            "Depending on the insurer seprate policies might be issued for different travellers";
        }
      });
    }

    familyTemp.forEach(traveller => {
      const { age, relationShip } = traveller;
      if (age < 18 && (relationShip === "Brother" || relationShip === "Sister")) {
        validation.valid = false;
        validation.error =
          "Depending on the insurer seprate policies might be issued for different travellers";
      }
    });
  }
  return validation;
};

export const validateFamily = families => {
  const validation = validateRelationsShips(families);
  if (validation.valid) {
    Object.keys(families).forEach(key => {
      const family = families[key];
      const { valid, error } = checkForNuclear(family);
      validation.valid = valid;
      validation.error = error;
      family.forEach(traveller => {
        const { age, relationShip } = traveller;
        if (
          family.length > 1 &&
          age > 18 &&
          (relationShip === "Son" || relationShip === "Daughter")
        ) {
          validation.valid = false;
          validation.error =
            "Depending on the insurer seprate policies might be issued for different travellers";
        }
      });
    });
  }
  return validation;
};

export const validateMember = data => {
  let error = false;
  let alert = "";

  // if(!this.state.alert) {
  //   return alert;
  // }

  let childCount = 0;

  if (
    (data.relationShip === "Father" ||
      data.relationShip === "Mother" ||
      data.relationShip === "Self" ||
      data.relationShip === "Spouse") &&
    data.age < 18
  ) {
    error = true;
    alert = lang.quotesAgeBw1899Alert;
  } else if (data.age < 18 && !(data.relationShip === "Son" || data.relationShip === "Daughter")) {
    error = true;
    alert = lang.quotesLessThan18Alert;
  }

  // else if(data.relationShip === 'Son' || data.relationShip === 'Daughter' ) {
  //   childCount = childCount + 1;
  //   if(childCount > 3) {
  //     error = true;
  //     alert = 'Maximum 3 Childs are allowed per family';

  //   }
  // }
  else if (data.age > 18 && (data.relationShip === "Son" || data.relationShip === "Daughter")) {
    error = true;
    alert = lang.quoteschildAbove18Alert;
  }

  // else if (!data.relationShip) {
  //   error = true;
  //   alert = 'Please select relationship';
  // }

  return alert;
};
