import * as _ from "lodash";
import {

    requestFrom,
    dataField
} from '../../../lib/helperData';
import { lang } from "../../../cms/i18n/en/index";
import { default as StudentDetails } from './studentFields.json';


export const isProposerNameValid = (fullName) => {

    let isValid = true

    if (_.isEmpty(_.trim(fullName)) || fullName.length < 2 || fullName.length > 70 || (fullName && !fullName.trimRight().includes(" "))) {
        isValid = false;

    }
    return isValid
}

export const isProposerGenderValid = (genderID) => {


    let isValid = true
    if (_.isEmpty(_.trim(genderID))) {
        isValid = false
    }
    else if (genderID === 0) {
        isValid = false
    }

    return isValid

}

export const isProposerDobValid = (dateOfBirth) => {


    let isValid = true
    if (_.isEmpty(_.trim(dateOfBirth))) {
        isValid = false

    }

    return isValid
}

export const isProposerEmailIDValid = (emailID) => {

    let isValid = true
    if (_.isEmpty(_.trim(emailID))) {
        isValid = false;
    }
    else if (!isValidEmailAddress(emailID)) {
        isValid = false;
    }

    return isValid
}


export const isProposerPincodeValid = (zipCode) => {

    let isValid = true
    if (_.isEmpty(_.trim(zipCode)) || zipCode.length !== 6) {
        isValid = false
    }

    return isValid
}

export const isProposerCityValid = (cityID) => {
    let isValid = true
    if (_.isEmpty(_.trim(cityID)) || cityID === 0) {
        isValid = false
    }
    return isValid

}

export const isProposerAddressValid = (address) => {

    let isValid = true
    if (_.isEmpty(_.trim(address)) || address.length < 10 || address.length > 95) {
        isValid = false
    }

    return isValid
}


export const isRelationWithInsuredValid=(profileTypeID,age,proposerRelationID)=>{
  
    let isValid = true
    if (profileTypeID === 1 && age < 18 && (proposerRelationID === 0 || proposerRelationID === 1 || proposerRelationID === 5 || proposerRelationID === 6)) {
        isValid = false
    }
    else if(proposerRelationID === 0){
        isValid = false
    }
    return isValid;
}


export const isProposerAltMobilNoValid = (travellerData) => {

}



export const isCustomerNameValid = (travellerData) => {
    const { customer } = travellerData;
    const {
        fullName
    } = customer;
    let error = {}

    if (_.isEmpty(_.trim(fullName))) {
        error = { valid: false }
    }
    else if (fullName.length < 2 || fullName.length > 70 || (fullName && !fullName.trimRight().includes(" ") ))  {
        error = { valid: false }
    }
    else {
        error = { valid: true }
    }
    return error
}

export const isCustomerEmailIDValid = (travellerData) => {
    const { customer } = travellerData;
    const {
        emailID
    } = customer;

    let error = {}
    if (_.isEmpty(_.trim(emailID))) {
        error = { valid: false }
    }
    else if (!isValidEmailAddress(travellerData.customer.emailID)) {
        error = { valid: false }
    }
    else {
        error = { valid: true }
    }
    return error
}

export const isCustomerPhoneNoValid = (travellerData) => {
    const { customer } = travellerData;
    const {
        mobileNo
    } = customer;

    let error = {}
    if (_.isEmpty(_.trim(mobileNo))) {
        error = { valid: false }

    }
    else if (mobileNo.length !== 10) {
        error = { valid: false }
    }
    else {
        error = { valid: true }

    }
    return error
}

export const isCustomerValid = (travellerData, errors) => {
    const { customer } = travellerData;
    let isvalid = true;
    errors.customerError.fullNameError = isCustomerNameValid(travellerData)
    errors.customerError.emailIDError = isCustomerEmailIDValid(travellerData)
    errors.customerError.mobileNoError = isCustomerPhoneNoValid(travellerData)
    if (errors.customerError.fullNameError.valid === false ||
        errors.customerError.emailIDError.valid === false ||
        errors.customerError.mobileNoError.valid === false) {

        isvalid = false
    }
    return { isvalid, errors };
}


export const istravellerSpecificProposerValid = (errors, travellerData, variantIndex, memberIndex) => {
    let isValid = true;
    const {
        variants,
        proposers
    } = travellerData;
    const{ 
        profileID: travellerProfileID ,
        age,
        profileTypeID,
        proposerRelationID
    } = variants[variantIndex].members[memberIndex]
    const proposerIndex = proposers && proposers.findIndex(proposer => proposer.profileID === travellerProfileID)
    if (proposerIndex !== -1) {
        const {
            fullName,
            genderID,
            dateOfBirth,
            emailID,
            address,
            alternateMobileNo,
            zipCode,
            cityID,
        } = proposers[proposerIndex];
        errors.proposerErrors[proposerIndex].fullNameError.valid = isProposerNameValid(fullName);
        errors.proposerErrors[proposerIndex].genderError.valid = isProposerGenderValid(genderID);
        errors.proposerErrors[proposerIndex].dateOfBirthError.valid = isProposerDobValid(dateOfBirth);
        errors.proposerErrors[proposerIndex].emailIDError.valid = isProposerEmailIDValid(emailID);
        errors.proposerErrors[proposerIndex].zipCodeError.valid = isProposerPincodeValid(zipCode);
        errors.proposerErrors[proposerIndex].cityIDError.valid = isProposerCityValid(cityID);
        errors.proposerErrors[proposerIndex].addressError.valid = isProposerAddressValid(address);
        errors.proposerErrors[proposerIndex].relationWithInsuredError.valid= isRelationWithInsuredValid(profileTypeID,age,proposerRelationID)


        if (
            errors.proposerErrors[proposerIndex].fullNameError.valid === false ||
            errors.proposerErrors[proposerIndex].genderError.valid === false ||
            errors.proposerErrors[proposerIndex].dateOfBirthError.valid === false ||
            errors.proposerErrors[proposerIndex].emailIDError.valid === false ||
            errors.proposerErrors[proposerIndex].zipCodeError.valid === false ||
            errors.proposerErrors[proposerIndex].cityIDError.valid === false ||
            errors.proposerErrors[proposerIndex].addressError.valid === false ||
            errors.proposerErrors[proposerIndex].relationWithInsuredError.valid === false
        ) {
            isValid = false
        }
    }
    return { isValid, errors };
}


export const isProceedProposalStep2Valid = (errors, travellerData) => {

    let isValid = true;
    const { variants } = travellerData;


    variants.map((variant, variantIndex) => {
        const { members } = variant;
        members.map((member, memberIndex) => {
            let { errors: modifiedError } = isTravellerValid(errors, travellerData, variantIndex, memberIndex);
            errors = modifiedError;
        });
    });

    errors.variantsErrors.map((x, index) => {
        let count = errors.variantsErrors[index].filter(y => y.fullnameError.valid === false
            || y.passportNoError.valid === false
            || y.genderError.valid === false
            || y.nomineeRelationIDError.valid === false
            || y.nomineeNameError.valid === false
            || y.passportExpiredOnError.valid === false
            || y.isPedError.valid === false
           

        ).length;

        let { isvalid: hasCustomerError, errors: customerError } = isCustomerValid(travellerData, errors)
        errors = customerError;

        if (count !== 0 || hasCustomerError === false) {
            isValid = false;
        }
    });

    let proposerErrorCount = errors.proposerErrors.filter(x =>
        x.fullNameError.valid === false || x.dateOfBirthError.valid === false
        || x.genderError.valid === false
        || x.addressError.valid === false
        || x.cityIDError.valid === false
        || x.zipCodeError.valid === false
        || x.emailIDError.valid === false
        || x.relationWithInsuredError.valid===false
    ).length;
    if (proposerErrorCount > 0) {
        isValid = false
    }
    return { isValid, errors }


}

export const isTravellerValid = (errors, travellerData, variantIndex, memberIndex) => {
    let isValid = true;
    const { variants } = travellerData;
    const {
        members,
        insurerID
    } = variants[variantIndex];
    const {
        fullName,
        maritalStatusID,
        passportNo,
        occupationID,
        nomineeName,
        nomineeRelationID,
        address,
        nationalityID,
        genderID,
        passportExpiredOn,
        proposerRelationID,
        questions,
        profileTypeID,
        age
    } = members[memberIndex];


    if (_.isEmpty(_.trim(fullName)) || fullName.length < 2 || fullName.length > 70 || (fullName && !fullName.trimRight().includes(" ") )) {
       
        if (errors && errors.variantsErrors) {
            errors.variantsErrors[variantIndex][memberIndex].fullnameError.valid = false;
            isValid = false;
        }
    }

    if (insurerID === 8 || insurerID === 12) {
        if (_.isEmpty(_.trim(passportExpiredOn))) {
            if (errors && errors.variantsErrors) {
                errors.variantsErrors[variantIndex][memberIndex].passportExpiredOnError.valid = false;
                isValid = false;
            }
        }
    }

    if (_.isEmpty(_.trim(passportNo))) {

        if (errors && errors.variantsErrors) {
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = false;
            isValid = false;
        }
    }

    if (genderID === 0) {
        if (errors && errors.variantsErrors) {
            errors.variantsErrors[variantIndex][memberIndex].genderError.valid = false;
            isValid = false;
        }
    }

    if (nomineeRelationID === 0) {
        if (errors && errors.variantsErrors) {
            errors.variantsErrors[variantIndex][memberIndex].nomineeRelationIDError.valid = false;
            isValid = false;
        }
    }

   

    if (_.isEmpty(_.trim(nomineeName)) || nomineeName.length < 2 || nomineeName.length > 30) {
        if (errors && errors.variantsErrors) {
            errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.valid = false;
            isValid = false;
        }
    }

    if (insurerID !== 6 && questions && questions.length > 0) {
        const parentLabelQuestion = questions.filter(x => x.controlType === 1 && x.parentQuestionID === 0)
        if (parentLabelQuestion && parentLabelQuestion.length > 0) {
            parentLabelQuestion.map(x => {
                const childQuestionOfParentLabel = questions.filter(y => y.parentQuestionID === x.questionID).length;
                const childQuestionNotSelectedOfParentLabel = questions.filter(y => y.parentQuestionID === x.questionID && (y.answer === null || y.answer === "")).length;
                if (childQuestionOfParentLabel === childQuestionNotSelectedOfParentLabel) {
                    errors &&
                        errors.variantsErrors[variantIndex][memberIndex] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError.length > 0 &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError.map(y => {
                            if (y.parentQuestionID === x.questionID) {
                                y.valid = false;
                                errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = false;
                            }
                        })
                }


            })
        }

        const parentToggelOnQuestion = questions.filter(x => x.controlType === 2 && x.parentQuestionID === 0 && x.answer === true.toString())
        if (parentToggelOnQuestion && parentToggelOnQuestion.length > 0) {
            parentToggelOnQuestion.map(x => {
                const childQuestionOfParentOnToggel = questions.filter(y => y.parentQuestionID === x.questionID).length;
                const childQuestionNotSelectedOfParentOnToggel = questions.filter(y => y.parentQuestionID === x.questionID && (y.answer === null || y.answer === "")).length;
                if (childQuestionOfParentOnToggel === childQuestionNotSelectedOfParentOnToggel) {
                    errors &&
                        errors.variantsErrors[variantIndex][memberIndex] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError.length > 0 &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError.map(y => {
                            if (y.parentQuestionID === x.questionID) {
                                y.valid = false;
                                errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = false;
                            }
                        })
                }


            })
        }

        const parentTextQuestion = questions.filter(x => x.controlType === 4 && x.parentQuestionID === 0 && (x.answer === null || x.answer === ""));
        if (parentTextQuestion && parentTextQuestion.length > 0) {
            errors.variantsErrors[variantIndex][memberIndex].questionError.map(y => {
                if (y.questionID === parentTextQuestion[0].questionID) {
                    y.valid = false;
                    errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = false;
                }
            })
        }

    }
    else if (insurerID === 6 && questions && questions.length > 0) {
        validateCustomeDisease(errors, questions, variantIndex, memberIndex)
    }

    // temporary for time being , save button will come fro proposer in case of family
    let {
        isValid: isProposeValid,
        errors: step2Error,

    } = istravellerSpecificProposerValid(errors, travellerData, variantIndex, memberIndex)

    if (!isProposeValid) {
        errors = step2Error;
        isValid = false;
    }


    return { isValid, errors }

}


export const validateCustomeDisease = (errors, questions, variantIndex, memberIndex) => {
    let isCustomeDiseaseValid = true;
    const {
        customDiseases
    } = questions[0];

    if (customDiseases && customDiseases.length > 0) {
        const countOfUnFilledTextBox = customDiseases.filter(x => x.diseaseName === null || x.diseaseName === "").length

        if (countOfUnFilledTextBox === customDiseases.length) {
            errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = false;
            errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[0].valid = false;
            errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[0].diseaseNameValid = false;
            errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[0].sufferingSinceMonthValid = false;
            errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[0].sufferingSinceYearValid = false;
            errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[0].isUnderMedicationValid = false;

        }
        customDiseases && customDiseases.map((cd, cdIndex) => {
            const {
                insuredMemberID,
                diseaseName,
                sufferingSince,
                isUnderMedication
            } = cd;

            if (diseaseName !== null) {

                if (sufferingSince === null) {
                    isCustomeDiseaseValid = false;
                    errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = false;
                    errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[cdIndex].valid = false;
                    errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[cdIndex].sufferingSinceMonthValid = false;
                    errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[cdIndex].sufferingSinceYearValid = false;

                }
                else if (sufferingSince.trim().length < 4) {
                    errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = false;
                    errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[cdIndex].valid = false;
                    errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[cdIndex].sufferingSinceYearValid = false;

                }
                if (isUnderMedication === 3 || isUnderMedication === null) {
                    isCustomeDiseaseValid = false;
                    errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = false;
                    errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[cdIndex].valid = false;
                    errors.variantsErrors[variantIndex][memberIndex].questionError[0].customeDiseaseError[cdIndex].isUnderMedicationValid = false;

                }

            }
        })

        return { isCustomeDiseaseValid, errors };
    }
}



export const isNotAlphabate = (character) => {
    return /[^$A-Za-z\s]/.test(character);
}

export const isAlphabate = (character) => {
    return /^[a-zA-Z\s]{0,30}$/.test(character)
}

export const isNotAllowedMobileDigit = (character) => {

    let a = /[^$\d\*\s]/.test(character)
    return a;

}

export const isValidMobileDigit = (character) => {
    let a = true;
    if (character) {
        a = /^[6789*\s]{1}[\d*]{0,9}$/.test(character)
    }
    return a;

}

export const isSpecialCharacter = (character) => {
    return /[^$A-Za-z\d\s]/.test(character);
}

export const isSpecialCharacterInAddressFieldValid = (character) => {
    return /^[a-zA-Z\d\s,.:\\\/*]$/.test(character);
}

export const isAddressFieldValid = (character) => {
    return /[^$A-Za-z\d\s_-]/.test(character);
}



export const isNumber = (character) => {
    return /[^\d]/.test(character);
}

export const isAlphaNumeric = (text) => {
    return /[^A-Za-z\d]/.test(text);
}

export const isValidEmailAddress = (text) => {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(text)
}

export const isPassportValid = (text) => {

    let valid = true;
    if (text) {
        valid = /^[A-Za-z]{1}\d{0,7}$/.test(text);
    }
    return valid
}

export const isPincode = (text) => {
    let valid = true

    if (text) {
        valid = /^[\d\s]{0,6}$/.test(text);
    }
    return valid
}

export const isMortThan2Space = (text) => {
    return /^(.*\s.*){2,}$/.test(text)
}

export const isTextValidForPan = (text) => {
    return /^[a-zA-z\d]{0,10}$/.test(text)
}

export const validatePan = (text) => {
    return /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/.test(text)
}

export const isFullNameValid = (text) => {

    return /^(.*\s.*){1,}$/.test(_.trim(text))
}


export const insurerSpecificValidation = (insureID, dataSection, formField, validateData) => {
    if (validateData) {
        const data = JSON.parse(JSON.stringify(validateData))



        if (insureID === 1) {

            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }


            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response
                }

                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }


            }

            else if (dataSection === requestFrom.customer) {

            }

        }
        else if (insureID === 2) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }




            }

            else if (dataSection === requestFrom.customer) {

            }
        }

        else if (insureID === 4) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,70}$/.test(data)
                }

                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }

        else if (insureID === 5) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }

        else if (insureID === 6) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 7) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }

                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }
            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 8) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }

                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }



            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 9) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,8}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 10) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }
            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }

        else if (insureID === 11) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 12) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }
            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 13) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 14) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 15) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }
            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 16) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 17) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }

                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 18) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }

                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }
            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 19) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 20) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 21) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }
            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 22) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 23) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}

                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        response.hasError = false
                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }
                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }
            }

            else if (dataSection === requestFrom.customer) {

            }
        }
        else if (insureID === 24) {
            if (dataSection === requestFrom.proposer) {
                if (formField === dataField.proposerAddress) {
                    return /^[a-zA-Z\d\s,.-]{0,95}$/.test(data);
                }

            }

            else if (dataSection === requestFrom.traveller) {
                if (formField === dataField.travellerName) {
                    let response = {}


                    if (/^[a-zA-Z\s]{0,70}$/.test(data)) {
                        if (/^(.*\s.*){2,}$/.test(_.trim(data))) {
                            response.hasError = false
                            response.hasWarning = true
                            response.remarks = lang.hdfcMiddleNameRemarks;
                        }
                        else {
                            response.hasError = false
                            response.hasWarning = false
                            response.remarks = ""
                        }

                    }
                    else {
                        response.hasError = true
                    }
                    return response


                }

                else if (formField === dataField.nomineeName) {
                    return /^[a-zA-Z\s]{0,30}$/.test(data)
                }
                else if (formField === dataField.passportno) {
                    return /^[A-Za-z]{1}\d{0,7}$/.test(data)
                }

            }

            else if (dataSection === requestFrom.customer) {

            }
        }

    }
    else {
        return true;
    }

}

export const handleStudentPlanSubmit = (travellerData, errors, isValid, variantIndex, memberIndex) => {
    const error = errors;
    let valid = isValid;
    if (variantIndex !== undefined && memberIndex !== undefined) {
        const { studentDetails, insurerID, profileTypeID } = travellerData.variants[variantIndex].members[memberIndex];
        if (profileTypeID === 4) {
            const studentFields = StudentDetails[insurerID]
            studentFields && studentFields.forEach(fields => {
                const { master, field } = fields;
                if (!studentDetails || !studentDetails[master]) {
                    error.variantsErrors[variantIndex][memberIndex][master] = {
                        valid: false,
                        remarks: ''
                    }
                    valid = false
                } else if (studentDetails[master] && field === 'name') {
                    if (studentDetails[master].length < 3) {
                        error.variantsErrors[variantIndex][memberIndex][master] = {
                            valid: false,
                            remarks: '*Minimum 3 characters are required'
                        }
                        valid = false
                    }
                    if (studentDetails[master].length > 100) {
                        error.variantsErrors[variantIndex][memberIndex][master] = {
                            valid: false,
                            remarks: '*Maximum 100 characters are allowed'
                        }
                        valid = false
                    }
                } else if (studentDetails[master] && field === 'address') {
                    if (studentDetails[master].length < 3) {
                        error.variantsErrors[variantIndex][memberIndex][master] = {
                            valid: false,
                            remarks: '*Minimum 3 characters are required'
                        }
                        valid = false
                    }
                    if (studentDetails[master].length > 100) {
                        error.variantsErrors[variantIndex][memberIndex][master] = {
                            valid: false,
                            remarks: '*Maximum 100 characters are allowed'
                        }
                        valid = false
                    }
                } else if (studentDetails[master] && field === 'number') {
                    if (studentDetails[master].length < 3) {
                        error.variantsErrors[variantIndex][memberIndex][master] = {
                            valid: false,
                            remarks: '*Please enter valid number'
                        }
                        valid = false
                    }
                    if (studentDetails[master].length > 10) {
                        error.variantsErrors[variantIndex][memberIndex][master] = {
                            valid: false,
                            remarks: '*Maximum 10 characters are allowed'
                        }
                        valid = false
                    }
                } else if (studentDetails[master] && field === 'duration') {
                    if (studentDetails[master].length < 3) {
                        error.variantsErrors[variantIndex][memberIndex][master] = {
                            valid: false,
                            remarks: '*Please enter valid duration'
                        }
                        valid = false
                    }
                    if (studentDetails[master].length > 100) {
                        error.variantsErrors[variantIndex][memberIndex][master] = {
                            valid: false,
                            remarks: '*Maximum 100 characters are allowed'
                        }
                        valid = false
                    }
                } else {
                    error.variantsErrors[variantIndex][memberIndex][master] = {
                        valid: true,
                        remarks: ''
                    }
                }
            })
        }

    } else {
        travellerData.variants.forEach((traveler, variantIndex) => {
            traveler.members.forEach((member, memberIndex) => {
                if (member.profileTypeID === 4) {
                    const { insurerID } = member
                    const studentFields = StudentDetails[insurerID];
                    studentFields && studentFields.forEach(fields => {
                        const { master, field } = fields;
                        if (!member.studentDetails || !member.studentDetails[master]) {
                            error.variantsErrors[variantIndex][memberIndex][master] = {
                                valid: false,
                                remarks: ''
                            }
                            valid = false
                        } else if (member.studentDetails[master] && field === 'name') {
                            if (member.studentDetails[master].length < 3) {
                                error.variantsErrors[variantIndex][memberIndex][master] = {
                                    valid: false,
                                    remarks: '*Minimum 3 characters are required'
                                }
                                valid = false
                            }
                            if (member.studentDetails[master].length > 100) {
                                error.variantsErrors[variantIndex][memberIndex][master] = {
                                    valid: false,
                                    remarks: '*Maximum 100 characters are allowed'
                                }
                                valid = false
                            }
                        } else if (member.studentDetails[master] && field === 'address') {
                            if (member.studentDetails[master].length < 3) {
                                error.variantsErrors[variantIndex][memberIndex][master] = {
                                    valid: false,
                                    remarks: '*Minimum 3 characters are required'
                                }
                                valid = false
                            }
                            if (member.studentDetails[master].length > 100) {
                                error.variantsErrors[variantIndex][memberIndex][master] = {
                                    valid: false,
                                    remarks: '*Maximum 100 characters are allowed'
                                }
                                valid = false
                            }
                        } else if (member.studentDetails[master] && field === 'number') {
                            if (member.studentDetails[master].length < 3) {
                                error.variantsErrors[variantIndex][memberIndex][master] = {
                                    valid: false,
                                    remarks: '*Please enter valid number'
                                }
                                valid = false
                            }
                            if (member.studentDetails[master].length > 10) {
                                error.variantsErrors[variantIndex][memberIndex][master] = {
                                    valid: false,
                                    remarks: '*Maximum 10 characters are allowed'
                                }
                                valid = false
                            }
                        } else if (member.studentDetails[master] && field === 'duration') {
                            if (member.studentDetails[master].length < 3) {
                                error.variantsErrors[variantIndex][memberIndex][master] = {
                                    valid: false,
                                    remarks: '*Please enter valid duration'
                                }
                                valid = false
                            }
                            if (member.studentDetails[master].length > 100) {
                                error.variantsErrors[variantIndex][memberIndex][master] = {
                                    valid: false,
                                    remarks: '*Maximum 100 characters are allowed'
                                }
                                valid = false
                            }
                        } else {
                            error.variantsErrors[variantIndex][memberIndex][master] = {
                                valid: true,
                                remarks: ''
                            }
                        }
                    })
                }
            })
        })
    }
    return { valid, error }
}

export const validateDatatypeAndMisc = () => {
    let isValid = true;
    return isValid;
}



