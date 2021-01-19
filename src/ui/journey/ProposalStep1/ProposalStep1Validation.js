import * as _ from "lodash";
import { element } from "prop-types";
import { getAge } from '../../../../src/utils/helper';
import {
    profileTypes
} from '../../../lib/helperData';

export const validateTravellerDob = (error, traveller) => {
    let { valid } = error;

    let {
        dateOfBirth,
        ageOnTravelStart_inMonth,
        age,
        insurerID,
        profileTypeID
    } = traveller;



    if (_.isEmpty(dateOfBirth)) {
        error = { valid: false };
        valid = false;
    }

    else if ((age === 0 || age === 1)&&profileTypeID===2) {



        let result = insurerSpecificValidation(insurerID, profileTypeID, "dob", ageOnTravelStart_inMonth);
        if (result) {
            error = result.error;
            valid = result.valid;
        }
    }
    else {
        error = { valid: true };
        valid = true;
    }
    return { valid, error }

}

export const validateVisaType = (error, traveller) => {

    let { valid } = error;
    const {
        visaTypeID,
        visaTypes
    } = traveller

    if (visaTypes && visaTypes.length > 0) {
        const isAllowedToBuy = visaTypes.filter(x => x.masterID === visaTypeID)[0].isAllowedToBuy
        if (isAllowedToBuy === false) {
            error = { valid: false }
            valid = false
        }
        else {
            error = { valid: true }
            valid = true
        }
    }

    return { valid, error }
}

export const validateNationalityID = (error, traveller) => {
    let { valid } = error;

    const {
        nationalityID,
        nationalities
    } = traveller
    if (nationalities && nationalities.length > 0) {
        const isAllowedToBuy = nationalities.filter(x => x.masterID === nationalityID)[0].isAllowedToBuy
        if (isAllowedToBuy === false) {
            error = { valid: false }
            valid = false
        }
        else {
            if (nationalityID === 2) {
                error = { valid: true, showRemark: true }
            }
            else {
                error = { valid: true }
                valid = true
            }
        }
    }
    return { valid, error }
}

const validatePreExistingDisease = (error, traveller) => {

    let valid = error;

    const {
        questions,
        isPED
    } = traveller

    if (isPED === true) {
        const allowedPedQustions = questions.filter(allowedPedQuestion => allowedPedQuestion.isAllowedToBuy === true)
        if (allowedPedQustions && allowedPedQustions.length > 0) {
            const checkedPedQuestioncount = allowedPedQustions.filter(checkedPedQuestion => checkedPedQuestion.answer !== null).length
            if (checkedPedQuestioncount < 1) {
                error = { valid: false }
                valid = false
            }

            else {
                error = { valid: true }
                valid = true
            }
        }
    }
    return { valid, error }

}

export const validatePedIsAllowedToBuy = (notAllowedtoBuyPedError, traveller) => {

    let valid = true
    let error = { valid: true }

    let notAllowedtoBuyPedErrors = notAllowedtoBuyPedError.filter(x => x.valid === false)
    if (notAllowedtoBuyPedErrors && notAllowedtoBuyPedErrors.length > 0) {
        valid = false
        error = { valid: false }
        return { valid, error }
    }
    else {
        return { valid, error }
    }
}

const validateDisclaimerError = (errors, travellerData) => {

    let valid = true;

    const { disclaimers } = travellerData

    const defaultValueTruecount = disclaimers.filter(disclaimer => disclaimer.valueToProceed === false && disclaimer.defaultValue === true).length
    const defaultValueFalsecount = disclaimers.filter(disclaimer => disclaimer.valueToProceed === true && disclaimer.defaultValue === false).length
    if (defaultValueTruecount > 0 || defaultValueFalsecount > 0) {
        valid = false
    }


    return valid

}


export const isPropoalStep1Valid = (errors, travellerData) => {

    let isvalid = true;
    const {
        members,
    } = travellerData

    members.forEach((member, index) => {
        const {
            insuredMemberID
        } = member;
        if (_.isEmpty(member)) {
            isvalid = false;
        }
        else {

            const { error: dobError } = validateTravellerDob(errors.travellerError[index].dobError, member);
            const { error: visaTypeError } = validateVisaType(errors.travellerError[index].visaTypeError, member);
            const { error: nationalityError } = validateNationalityID(errors.travellerError[index].nationalityError, member);
            const { error: preExistingDiseaseError } = validatePreExistingDisease(errors.travellerError[index].preExistingDiseaseError, member);
            const { error: pedIsAllowedToBuyError } = validatePedIsAllowedToBuy(errors.travellerError[index].pedIsAllowedToBuyError, member)

            errors.travellerError[index].insuredMemberID = insuredMemberID
            errors.travellerError[index].dobError = dobError
            errors.travellerError[index].visaTypeError = visaTypeError
            errors.travellerError[index].nationalityError = nationalityError
            errors.travellerError[index].preExistingDiseaseError = preExistingDiseaseError
            errors.travellerError[index].pedCheckedQuestionError = pedIsAllowedToBuyError

        }
    });

    errors.disclaimerError.valid = validateDisclaimerError(errors, travellerData)



    const isErrorInTravellersData = errors.travellerError.filter(error =>
        error.dobError.valid === false ||
        error.visaTypeError.valid === false ||
        error.nationalityError.valid === false ||
        error.preExistingDiseaseError.valid === false ||
        error.pedCheckedQuestionError.valid === false
    )



    if (isErrorInTravellersData.length !== 0 || errors.disclaimerError.valid === false) {
        isvalid = false
    }

    return { isvalid, errors };
}


export const insurerSpecificValidation = (insurerID, profileTypeID, field, data) => {
    if (data !== null && data !== undefined) {
        if (insurerID === 1) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 6) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 6 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 2) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 3) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }

        else if (insurerID === 4) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 6) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 6 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 5) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 6) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 6 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 7) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 8) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 9) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 10) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {


                }
            }

        }
        else if (insurerID === 11) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }
                }
            }

        }
        else if (insurerID === 12) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 13) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 14) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 15) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {


                }
            }

        }
        else if (insurerID === 16) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 17) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 18) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 19) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 20) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 21) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 22) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 12) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 12 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 23) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 3) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 3 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
        else if (insurerID === 24) {
            if (profileTypeID === profileTypes.family) {
                if (field === 'dob') {
                    if (data < 6) {
                        let error = { valid: false, remarks: 'Minumum age should be at least 6 months' };
                        let valid = false;
                        return { error, valid };
                    }
                    else{
                        let error = { valid: true};
                        let valid = true;
                        return { error, valid };
                    }

                }
            }

        }
    }

}





