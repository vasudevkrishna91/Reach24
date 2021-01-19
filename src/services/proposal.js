import axios from 'axios';
import config from './config';

export const getProposalStep1Data = async (proposerID, encryptedProposerId) => {

    try {

        const parameters = {
            headers: {
                "Content-Type": "application/json"
            }
        }
    
        let body = {
            ProposerID: parseInt(proposerID, 10),
            encryptedProposerId: encryptedProposerId,
        }
    
    
        body = JSON.stringify(body);
        const res = await axios.post(
            `${config.baseUrl}${config.endpoints.getStep1}`,
            body,
            parameters
        );
    
        return res.data;
    } catch(err) {

        return {
            error: true
        }

    }

}

export const modifyStep1Data = async (travellerData) => {

    try {
        let requstbody = JSON.parse(JSON.stringify(travellerData))
    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    const {

        members,
        disclaimers,
        hasError,
        returnValue,
        proposerID,
        encryptedProposerID,
        enquiryID,
        errorCode,
        redirectURL,
        customer
    } = requstbody;


    members.map(member => {
        let {
            nationalities
        } = member
        nationalities.shift()
    })

    // members.forEach((member, index) => {
    //     const {
    //         questions
    //     } = member
    //     questions.forEach((question, questionIndex) => {
    //         const {
    //             insuredMemberID,
    //             questionID,
    //             answer
    //         } = question
    //         members[index].questions[questionIndex] = { insuredMemberID, questionID, answer }
    //     });
    // })
    // members.forEach((member, index) => {
    //     const {
    //         insuredMemberID,
    //         dateOfBirth,
    //         visaTypeID,
    //         nationalityID,
    //         isPED,
    //         questions

    //     } = member
    //     members[index] = { insuredMemberID, dateOfBirth, visaTypeID, nationalityID, isPED, questions }
    // })

    let body = {

        members,
        disclaimers,
        proposerID,
        hasError,
        returnValue,
        encryptedProposerID,
        enquiryID,
        errorCode,
        redirectURL,
        customer: {
            proposerID: proposerID,
            "fullName": null,
            "emailID": "",
            "countryCode": null,
            "customerID": 0,
            ...customer
        }
    }



    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.modifyStep1Data}`,
        body,
        parameters
    );
    return res;

    } catch(err) {

        return {
            error: true
        }


    }

    
}


export const getProposalStep2Data = async (proposerID, encryptedProposerId) => {

    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    let body = {
        ProposerID: parseInt(proposerID),
        encryptedProposerId,
    }


    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.getStep2}`,
        body,
        parameters
    );

    return res.data;
}

export const modifyStep2Data = async (travellerData, actionType, encryptedProposerId) => {
    ;
    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    const {
        customer,
        variants,
        proposers,
        proposerID

    } = JSON.parse(JSON.stringify(travellerData))

    let members = [];

    variants.forEach((variant, variantIndex) => {
        let {
            members: variantMember
        } = variant;

        variantMember.forEach((member, membersIndex) => {
            members.push(member)
        });
    });


    let body = {
        customer,
        proposers,
        members,
        proposerID,
        SourceTypeID: 4,
        ActionTypeID: actionType,
        encryptedProposerId
    }

    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.modifyStep2Data}`,
        body,
        parameters
    );
    return res.data;
}

export const getPassportData = async (formData) => {

    const body = formData;
    let headers = { 'Content-Type': 'multipart/form-data' }
    const res = await axios.post(
        `${config.passportURL}`,
        body,
        headers
    );
    return res;
}


export const getPincodes = async (value) => {

    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }
    const res = await axios.get(
        `${config.baseUrl}Master/GetPinCode?pinCode=${value}`,
        parameters
    );
    return res.data;
}




export const modifyProposer = async (data) => {

    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    const { proposer, proposerID } = JSON.parse(JSON.stringify(data))
    const {
        fullName,
        salutationID,
        address,
        city,
        genderID,
        dateOfBirth,
        pan,
        mobileNo,
        emailID,
        cityID,
        stateID,
        state,
        countryID,
        countryName,
        sourceTypeID,
        zipCode,
        alternateMobileNo,
        landmark,
        countryCode
    } = proposer;

    let body = {
        ProposerID: proposerID,
        FullName: fullName,
        salutationID: salutationID,
        MobileNo: mobileNo,
        SourceTypeID: 4,
        GenderID: genderID,
        DateOfBirth: dateOfBirth, //MM-dd-yyyy
        PAN: pan,
        CountryCode: countryCode,
        EmailID: emailID,
        Address: address,
        CityID: cityID,
        StateID: stateID,
        CountryID: countryID,
        ZipCode: zipCode,
        AlternateMobileNo: alternateMobileNo,
        Landmark: landmark
    }


    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.modifyProposer}`,
        body,
        parameters
    );


    return res.data;
}


export const modifyInsuredMember = async (travellerData, variantIndex, memberIndex) => {
    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    const {
        proposerID,
        proposerVariants,
        proposer,
    } = JSON.parse(JSON.stringify(travellerData))

    const {
        insuredMembers
    } = proposerVariants[variantIndex]


    const {

        proposerID: Pid,
        sourceTypeID = 4,
        insuredMemberID,
        salutationID,
        fullName,
        age,
        dateOfBirth,
        genderID,
        maritalStatusID,
        passportNo,
        occupationID,
        nationalityID,
        passportExpiredOn,
        nomineeName,
        nomineeRelationID,
        proposerRelationID,
        temporaryID,
        additionalInfo,
        physicianName,
        physicianContactNumber,
        physicianCityAddress,
        questions,
        passportFrontURL,
        passportBackURL,
        emailID,
        address,
        cityID,
        zipCode,
        isPED,
        relationTypeID,

    } = insuredMembers[memberIndex];

    let body = {
        proposerID,
        sourceTypeID,
        insuredMemberID,
        salutationID,
        fullName,
        age,
        dateOfBirth,
        genderID,
        maritalStatusID,
        passportNo,
        occupationID,
        nationalityID,
        passportExpiredOn,
        nomineeName,
        nomineeRelationID,
        proposerRelationID,
        temporaryID,
        additionalInfo,
        physicianName,
        physicianContactNumber,
        physicianCityAddress,
        questions,
        passportFrontURL,
        passportBackURL,
        emailID,
        address,
        cityID,
        zipCode,
        isPED,
        relationTypeID,
        additionalInfo
    }

    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.modifyInsuredMember}`,
        body,
        parameters
    );

    return res.data;
}

export const modifyStep2DataV1 = async (travellerData, button) => {

    const parameters = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    const {
        proposerID,
        variants,
        proposer,
        //  sourceTypeID

    } = JSON.parse(JSON.stringify(travellerData))


    let memberTraveller = [];

    variants.forEach((variant, variantIndex) => {
        let {
            members
        } = variant;

        members.forEach((members, membersIndex) => {
            const {
                insuredMemberID,
                salutationID,
                fullName,
                age,
                dateOfBirth,
                genderID,
                maritalStatusID,
                passportNo,
                occupationID,
                passportExpiredOn,
                proposerRelationID,
                nomineeName,
                nomineeRelationID,
                passportFrontURL,
                passportBackURL,
                emailID,
                address,
                cityID,
                zipCode,
                temporaryID,
                physicianName,
                physicianContactNumber,
                physicianCityAddress,
                questions
            } = members;

            memberTraveller.push({

                insuredMemberID,
                salutationID,
                fullName,
                age,
                dateOfBirth,
                genderID,
                maritalStatusID,
                passportNo,
                occupationID,
                passportExpiredOn,
                proposerRelationID,
                nomineeName,
                nomineeRelationID,
                passportFrontURL,
                passportBackURL,
                emailID,
                address,
                cityID,
                zipCode,
                temporaryID,
                questions,
                physicianName,
                physicianContactNumber,
                physicianCityAddress,
            });


        });
    });


    const insuredMembers = memberTraveller

    let body = {
        proposerID,
        sourceTypeID: 4,
        ActionType: button,
        proposer,
        insuredMembers

    }
    body = JSON.stringify(body);
    const res = await axios.post(
        `${config.baseUrl}${config.endpoints.modifyStep2Data}`,
        body,
        parameters
    );
    return res.data;
}



