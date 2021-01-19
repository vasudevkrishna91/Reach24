import React, { Component } from "react";
import { connect } from "react-redux";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import Cookies from "js-cookie";
import {
  getProposalStep2Data,
  getPassportData,
  modifyStep2Data,
  getPincodes
} from "../../../services/proposal";
import EditModal from "../../journey/Quotes/EditModals/EditModal";
import DatePicker from "react-datepicker";
import Moment from "moment";
import { extendMoment } from "moment-range";
import "react-datepicker/dist/react-datepicker.css";
import "./Styles/proposal.css";
import { lang } from "../../../cms/i18n/en/index";
import {
  isCustomerValid,
  isSpecialCharacter,
  isSpecialCharacterInAddressFieldValid,
  isNumber,
  isProceedProposalStep2Valid,
  isPassportValid,
  isTravellerValid,
  isAlphaNumeric,
  isValidEmailAddress,
  isNotAlphabate,
  isNotAllowedMobileDigit,
  isValidMobileDigit,
  insurerSpecificValidation,
  isFullNameValid,
  isTextValidForPan,
  validatePan,
  handleStudentPlanSubmit,
  isPincode,
  validateDatatypeAndMisc
} from "../ProposalStep2/ProposalStep2Validation";
import * as _ from "lodash";
import {
  documents,
  actionTypes,
  copyFrom,
  profileTypes,
  requestFrom,
  dataField,
  fileExtensions
} from "../../../lib/helperData";
import { saveProposalStep2Data, onInit } from "../../../store/actions/preQuoteActions";
import Header from "../../components/static/header";
import Footer from "../../components/static/footer";
import { default as jsonData } from "./dummy2.json";
import Toast from "../../components/Toast/Toast";
import ChatUI from "../../../Chat/Chat";
import { getQueryStringValue } from "../../../utils/helper";
import { default as StudentDetails } from "./studentFields.json";
import { courseDuration, countryData } from "./helperData";
import { customEvent, onPageLoad } from "../../../GA/gaEvents";

const moment = extendMoment(Moment);

class ProposalStep2 extends Component {
  constructor(props) {
    super(props);
    this.dobRef1 = React.createRef();
    this.dobRef2 = React.createRef();
    this.state = {
      loading: false,
      travellerData: {},
      errors: {},
      pincodeMaster: [],
      pincodeCity: [],
      proposersPincodeCity: [],
      PinAndCityList: {},
      sliderMarginLeft: 0,
      sliderMarginRight: 0,
      submittProceedSpinnerShowHide: "hide",
      saveTravellerSpinnerShowHide: "hide",
      submitProposalSpinnerShowHide: "hide",
      submitTravellerSpinnerShowHide: "hide",
      toastShowHide: "hide",
      toastText: "",
      toastFlag: true,
      showLiveChat: false,
      customerTotalPremium: 0,
      totalMember: 0,
      show8thLiApperance: true,
      screenSize: window.screen.width,
      gaFlowName: ''
    };
  }

  hideSeo = () => {
    document.querySelector(".tttttt h1").setAttribute("style", "font-size:0");
    var seoTxt = document.querySelector(".tttttt");
    seoTxt.setAttribute("style", "font-size: 0");
  };

  async componentDidMount() {
    onPageLoad('Trv.Proposal 2', 'Trv.BU Proposal 2');

    const { encryptedProposerId } = this.props.match.params;
    const { proposerId, onInit } = this.props;
    let errors = {};
    let variantsErrors = [];
    let { customerTotalPremium, totalMember, toastShowHide, toastText } = this.state;
    let al = getQueryStringValue("al");

    if (al && parseInt(al, 10) === 1) {
      toastShowHide = true;
      toastText = lang.verifyDetail;
    }

    setTimeout(() => this.hideSeo(), 100);
     const result = await getProposalStep2Data(proposerId || 0, encryptedProposerId);

     if(result.errorCode === 6) {
      this.props.history.push(`/v2/checkout/${encryptedProposerId}`);
    }



    //  const result = jsonData
    if (result) {

      onInit({
        proposerId: result.proposerID, 
        enquiryId: result.enquiryID,
        encryptedProposerId: encryptedProposerId,
      })

      let proposerErrors = [];
      result.proposers.map((proposer, propserIndex) => {
        const { profileID } = proposer;
        let proposerError = {};
        proposerError.fullNameError = { valid: true };
        proposerError.dateOfBirthError = { valid: true };
        proposerError.genderError = { valid: true };
        proposerError.addressError = { valid: true };
        proposerError.cityIDError = { valid: true };
        proposerError.zipCodeError = { valid: true };
        proposerError.alternateMobileNoError = { valid: true };
        proposerError.mobileNoError = { valid: true };
        proposerError.emailIDError = { valid: true };
        proposerError.relationWithInsuredError = { valid: true };
        proposerError.profileID = profileID;
        proposerErrors.push(proposerError);
      });
      errors.proposerErrors = proposerErrors;

      result.variants.map((variant, variantIndex) => {
        const { premium, insurerID } = variant;
        customerTotalPremium += premium;
        variant.showHideProductDetailDiv = "hide";
        variant.productDetailIcon = "downArrow_Grey";
        let insuredMembersErrors = [];
        variant.members.map((traveller, index) => {
          const { questions } = traveller;
          totalMember += 1;
          let travellrDetailError = {};
          travellrDetailError.passportFrontError = { valid: true };
          travellrDetailError.passportBackError = { valid: true };
          travellrDetailError.genderError = { valid: true };
          travellrDetailError.fullnameError = { valid: true };
          travellrDetailError.nationalityIDError = { valid: true };
          travellrDetailError.passportNoError = { valid: true };
          travellrDetailError.addressError = { valid: true };
          travellrDetailError.nomineeNameError = { valid: true };
          travellrDetailError.nomineeRelationIDError = { valid: true };
          travellrDetailError.passportExpiredOnError = { valid: true };
          travellrDetailError.isPedError = { valid: true };
          travellrDetailError.questionError = [];
          questions &&
            questions.length > 0 &&
            questions.map(x => {
              const {
                insuredMemberID,
                questionID,
                controlType,
                parentQuestionID,
                customDiseases
              } = x;
              if (!customDiseases || customDiseases.length === 0) {
                travellrDetailError.questionError.push({
                  valid: true,
                  insuredMemberID,
                  questionID,
                  parentQuestionID,
                  controlType,
                  customeDiseaseError: [
                    {
                      valid: true,
                      diseaseNameValid: true,
                      sufferingSinceMonthValid: true,
                      sufferingSinceYearValid: true,
                      isUnderMedicationValid: true
                    },
                    {
                      valid: true,
                      diseaseNameValid: true,
                      sufferingSinceMonthValid: true,
                      sufferingSinceYearValid: true,
                      isUnderMedicationValid: true
                    },
                    {
                      valid: true,
                      diseaseNameValid: true,
                      sufferingSinceMonthValid: true,
                      sufferingSinceYearValid: true,
                      isUnderMedicationValid: true
                    }
                  ]
                });
              } else {
                let customeDiseaseError = [];
                customDiseases.map(x => {
                  customeDiseaseError.push({
                    valid: true,
                    diseaseNameValid: true,
                    sufferingSinceMonthValid: true,
                    sufferingSinceYearValid: true,
                    isUnderMedicationValid: true
                  });
                });

                travellrDetailError.questionError.push({
                  valid: true,
                  insuredMemberID,
                  questionID,
                  parentQuestionID,
                  controlType,
                  customeDiseaseError
                });
              }
            });

          if (traveller.profileTypeID === 4) {
            const studentFields = StudentDetails[traveller.insurerID];
            if (studentFields) {
              studentFields.forEach(fields => {
                const { master } = fields;
                travellrDetailError[master] = { valid: true };
              });
            }
          }

          insuredMembersErrors.push(travellrDetailError);

          if (index === 0) {
            traveller.isTabDisplayed = true;
          } else {
            traveller.isTabDisplayed = false;
          }
        });
        variantsErrors.push(insuredMembersErrors);
      });
      errors.variantsErrors = variantsErrors;

      result.nomineeRelations &&
        result.nomineeRelations.unshift({
          masterTypeID: 0,
          masterID: 0,
          name: "Select"
        });

      result.proposerRelations &&
        result.proposerRelations.unshift({
          masterTypeID: 0,
          masterID: 0,
          zOrder:0,
          name: "Select"
        });

        const childIndex=result.proposerRelations.findIndex(x=>x.masterID===7);
        if(childIndex!==-1){
          result.proposerRelations.splice(childIndex,1);
        }

        
        result.proposerRelations.forEach((a)=>{
          
          if(a.name=="Self"){
            a.zOrder=1
          }
          else if(a.name=="Spouse"){
            a.zOrder=2
          }
          else if(a.name=="Son"){
            a.zOrder=3
          }
          else if(a.name=="Daughter"){
            a.zOrder=4
          }
          else if(a.name=="Father"){
            a.zOrder=5
          }
          else if(a.name=="Mother"){
            a.zOrder=6
          }
         
        })
        result.proposerRelations.sort((a,b)=>a.zOrder-b.zOrder)
        

      let customerError = {};
      customerError.fullNameError = { valid: true };
      customerError.mobileNoError = { valid: true };
      customerError.emailIDError = { valid: true };
      customerError.panError = { valid: true };

      errors.customerError = customerError;

      result.variants.map(variant => {
        variant.members.map((traveller, index) => {
          if (index === 0) {
            traveller.isTabDisplayed = true;
          } else {
            traveller.isTabDisplayed = false;
          }
        });
      });

      result.variants.map(variant => {
        const { insurerID } = variant;
        if (insurerID === 6)
          variant.members.map((traveller, index) => {
            let { insuredMemberID, questions } = traveller;
            if (questions && questions.length > 0) {
              let { customDiseases, questionID } = questions[0];
              if (!customDiseases || customDiseases.length === 0) {
                customDiseases.push({
                  insuredMemberID,
                  questionID,
                  diseaseName: null,
                  sufferingSince: null,
                  isUnderMedication: 3
                });
                customDiseases.push({
                  insuredMemberID,
                  questionID,
                  diseaseName: null,
                  sufferingSince: null,
                  isUnderMedication: 3
                });
                customDiseases.push({
                  insuredMemberID,
                  questionID,
                  diseaseName: null,
                  sufferingSince: null,
                  isUnderMedication: 3
                });
              }
            }
          });
      });

      // result.enquiryID = this.props.enquiryId;
      let cookie = Cookies.get("TravelCjCookie");
      cookie = cookie ? JSON.parse(cookie) : { flowName: "Trv.Direct" };
      this.setState({
        travellerData: result,
        errors,
        customerTotalPremium,
        totalMember,
        toastShowHide,
        toastText,
        gaFlowName: cookie.flowName
      });
      // const ele = document.querySelectorAll("#filePassportFront00");
      // if (ele[0]) {
      //   ele[0].focus();
      // }
    }
    const elements = document.getElementsByClassName('selectCalenderDate')
    if (elements) {
      for (let i = 0; i < elements.length; i++) {
        elements[i].setAttribute("readonly", true);
      }
    }
  }

  onDatepickerRef(el) {
    if (el && el.input) {
      el.input.readOnly = true;
    }
  }
  handleDateChangeRaw = e => {
    e.preventDefault();
  };

  handelProposerName = (e, travellerProfileID) => {
    const { travellerData, errors } = this.state;

    let { proposers } = travellerData;

    const index = proposers.findIndex(x => x.profileID === travellerProfileID);
    let { value } = e.target;
    value = value.trimLeft();
    if (/^.*  .*$/.test(value)) {
      value = value.replace("  ", " ");
    }
    if (index !== -1) {
      if (isNotAlphabate(value)) {
        errors.proposerErrors[index].fullNameError = {
          valid: false,
          remarks: "Special Character are not allowed"
        };
        errors.proposerErrors[index].fullNameError.showremarks = true;
        errors.proposerErrors[index].fullNameError.remarks = lang.fulNamerequiredValidationMsg;
        this.setState({ errors });
      } else {
        errors.proposerErrors[index].fullNameError.valid = true;
        errors.proposerErrors[index].fullNameError.showremarks = false;
        errors.proposerErrors[index].fullNameError.remarks = null;
        travellerData.proposers[index].fullName = value;
        this.setState({
          travellerData,
          errors
        });
      }
    }
  };

  onBlurProposerName = (name, travellerProfileID, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    let { proposers } = travellerData;

    const index = proposers.findIndex(x => x.profileID === travellerProfileID);

    if (index !== -1) {
      if (!name || name.length < 2 || name.length > 70) {
        errors.proposerErrors[index].fullNameError = {
          valid: false,
          remarks: "Special Character are not allowed"
        };
        errors.proposerErrors[index].fullNameError.showremarks = true;
        errors.proposerErrors[index].fullNameError.remarks = lang.fulNamerequiredValidationMsg;
        this.setState({ errors });
      } else if (!/^(.*\s.*){1,}$/.test(_.trim(name))) {
        errors.proposerErrors[index].fullNameError = {
          valid: false,
          remarks: "Special Character are not allowed"
        };
        errors.proposerErrors[index].fullNameError.showremarks = true;
        errors.proposerErrors[index].fullNameError.remarks = lang.fulNamerequiredValidationMsg;
        this.setState({ errors });
      } else {
        errors.proposerErrors[index].fullNameError = {
          valid: true,
          remarks: "Special Character are not allowed"
        };
        errors.proposerErrors[index].fullNameError.showremarks = false;
        errors.proposerErrors[index].fullNameError.remarks = null;
        this.setState({ errors });

        this.copyData(copyFrom.proposer, variantIndex, memberIndex);
        if (variantIndex === 0 && memberIndex === 0) {
          this.copyFirstProposerToAllProposer();
        }
      }
    }
  };

  handelProposerGender = (e, profileID) => {
    const { travellerData, errors } = this.state;
    let { proposers } = travellerData;

    const index = proposers.findIndex(x => x.profileID === profileID);

    if (index !== -1) {
      travellerData.proposers[index].genderID = parseInt(e.target.value, 10);
      travellerData.proposers[index].salutationID = parseInt(e.target.value, 10);
      errors.proposerErrors[index].genderError = { valid: true };

      this.setState({
        travellerData,
        errors
      });
    }
  };

  proposerDobChange = (e, profileID) => {
    if (e) {
      const { travellerData, errors } = this.state;

      let { proposers } = travellerData;

      const index = proposers.findIndex(x => x.profileID === profileID);

      if (index !== -1) {
        let newDate = new Date(e);
        newDate.setDate(e.getDate() + 1);
        travellerData.proposers[index].dateOfBirth = newDate.toISOString().substr(0, 10);

        errors &&
          errors.proposerErrors &&
          (errors.proposerErrors[index].dateOfBirthError = { valid: true });

        this.setState({
          travellerData,
          errors
        });
      }
    }
  };

  handelRelationwithInsured = (e, travellerProfileID, variantIndex) => {
    let { travellerData, errors } = this.state;
    let { proposers, variants } = travellerData;
    let { members } = variants[variantIndex];

    let { proposerRelationID, age } = members.filter(x => x.profileID === travellerProfileID)[0];
    const proposerIndex = proposers.findIndex(x => x.profileID === travellerProfileID);

    const memberIndex = travellerData.variants[variantIndex].members.findIndex(
      x => x.profileID === travellerProfileID
    );

    if (memberIndex != -1) {
      const val = parseInt(e.target.value, 10);
      if (age < 18) {
        if (val === 0 || val === 1 || val === 5 || val === 6) {
          errors.proposerErrors[proposerIndex].relationWithInsuredError.valid = false;
        } else {
          travellerData.variants[variantIndex].members[memberIndex].proposerRelationID = val;
          errors.proposerErrors[proposerIndex].relationWithInsuredError.valid = true;
        }
      } else {
        travellerData.variants[variantIndex].members[memberIndex].proposerRelationID = val;
      }
    }

    this.setState({
      travellerData,
      errors
    });
  };

  handelProposerEmail = (e, profileID) => {
    const { travellerData, errors } = this.state;
    let { proposers } = travellerData;

    const index = proposers.findIndex(x => x.profileID === profileID);

    if (index !== -1) {
      // errors.proposerErrors[index].emailIDError.valid = true;
      travellerData.proposers[index].emailID = e.target.value.trimLeft();
      this.setState({ travellerData });
    }
  };

  validateProposerEmail = (travellerProfileID, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;
    const { proposers } = travellerData;
    const index = proposers.findIndex(x => x.profileID === travellerProfileID);

    if (!isValidEmailAddress(travellerData.proposers[index].emailID)) {
      errors.proposerErrors[index].emailIDError = { valid: false, remarks: "email not valid" };
      errors.proposerErrors[index].emailIDError.showremarks = true;
      errors.proposerErrors[index].emailIDError.remarks = lang.validEmailMsg;
    } else {
      errors.proposerErrors[index].emailIDError.valid = true;
      errors.proposerErrors[index].emailIDError.showremarks = false;
      errors.proposerErrors[index].emailIDError.remarks = null;

      this.copyData(copyFrom.proposer, variantIndex, memberIndex);
      if (variantIndex === 0 && memberIndex === 0) {
        this.copyFirstProposerToAllProposer();
      }
    }
    this.setState({ errors });
  };

  handelProposerAltMobileNo = (e, profileID) => {
    const { travellerData, errors } = this.state;
    let { proposers } = travellerData;

    const index = proposers.findIndex(x => x.profileID === profileID);

    if (index !== -1) {
      if (isNotAllowedMobileDigit(e.target.value)) {
        errors.proposerErrors[index].alternateMobileNoError = {
          valid: false,
          remarks: "Special Character are not allowed"
        };
        this.setState({ errors });
      } else {
        errors.proposerErrors[index].alternateMobileNoError.valid = true;
        travellerData.proposers[index].alternateMobileNo = e.target.value;
        this.setState({
          errors,
          travellerData
        });
      }
    }
  };

  handelProposerAddress = (e, profileID, variantIndex) => {
    const { travellerData, errors } = this.state;
    let { proposers, variants } = travellerData;

    const { insurerID } = variants[variantIndex];

    const index = proposers.findIndex(x => x.profileID === profileID);

    if (index !== -1) {
      let { value } = e.target;
      value = value.trimLeft();
      if (/^.*  .*$/.test(value)) {
        value = value.replace("  ", " ");
      }
      if (
        insurerSpecificValidation(insurerID, requestFrom.proposer, dataField.proposerAddress, value)
      ) {
        errors.proposerErrors[index].addressError.valid = true;
        errors.proposerErrors[index].addressError.showremarks = false;
        errors.proposerErrors[index].addressError.remarks = null;
        travellerData.proposers[index].address = value;
        this.setState({ travellerData });
      } else {
        errors.proposerErrors[index].addressError = {
          valid: false,
          remarks: "Special Character are not allowed"
        };
        errors.proposerErrors[index].addressError.showremarks = true;
        errors.proposerErrors[index].addressError.remarks = lang.validAddressMsg;
        this.setState({ errors });
      }
    }
  };

  onBlureProposerAddress = (address, profileID, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;
    let { proposers, variants } = travellerData;

    const { insurerID } = variants[variantIndex];

    const index = proposers.findIndex(x => x.profileID === profileID);

    if (index !== -1) {
      if (!address || address.length < 10 || address.length > 95) {
        errors.proposerErrors[index].addressError = {
          valid: false,
          remarks: "Special Character are not allowed"
        };
        errors.proposerErrors[index].addressError.showremarks = true;
        errors.proposerErrors[index].addressError.remarks = lang.validAddressMsg;
        this.setState({ errors });
      } else {
        errors.proposerErrors[index].addressError = {
          valid: true,
          remarks: "Special Character are not allowed"
        };
        errors.proposerErrors[index].addressError.showremarks = false;
        errors.proposerErrors[index].addressError.remarks = null;
        this.setState({ errors });
        if (variantIndex === 0 && memberIndex === 0) {
          this.copyFirstProposerToAllProposer();
        }
      }
    }
  };

  handelcityState = (e, profileID) => {
    const { travellerData, errors } = this.state;
    let { proposers } = travellerData;

    const index = proposers.findIndex(x => x.profileID === profileID);

    if (index !== -1) {
      travellerData.proposers[index].cityID = parseInt(e.target.value, 10);
      this.setState({ travellerData });
    }
  };

  getPincodeList = async value => {
    let { pincodeMaster, pincodeCity, PinAndCityList } = this.state;
    let zipCodeMaster = [];
    const result = await getPincodes(parseInt(value, 10));
    if (!result.hasError) {
      PinAndCityList = result;
      result.pinCodes &&
        result.pinCodes.map(x => {
          zipCodeMaster.push(x.pincode);
        });

      this.setState({
        pincodeMaster: zipCodeMaster,
        PinAndCityList
      });
    }
  };

  handelAutoCompleteProposerZipCode = (value, profileID) => {
    value = value.toString();
    value = value.replace(/([^0-9]+)/g, "");
    let {
      pincodeMaster,
      pincodeCity,
      proposersPincodeCity,
      PinAndCityList,
      travellerData,
      errors
    } = this.state;
    let { proposers } = travellerData;

    const index = proposers.findIndex(x => x.profileID === profileID);
    if (isPincode(value)) {
      if (value.length > 2 && value.length <= 6) {
        this.getPincodeList(value);
      }
      travellerData.proposers[index].zipCode = value.trim();
    } else {
      errors.proposerErrors[index].zipCodeError = { valid: false };
      this.setState({ errors });
    }

    errors.proposerErrors[index].cityIDError = { valid: true };

    if (value.length === 6) {
      if (isNumber(value)) {
        errors.proposerErrors[index].zipCodeError = { valid: false };

        this.setState({ errors });
      } else {
        errors.proposerErrors[index].zipCodeError = { valid: true };

        const cities =
          PinAndCityList &&
          PinAndCityList.pinCodes &&
          PinAndCityList.pinCodes.filter(x => x.pincode === parseInt(value, 10));
        if (cities && cities.length > 0) {
          pincodeCity = [];
          cities[0].cities.map(x => {
            const { city, cityID, state, stateID } = x;
            pincodeCity.push({ city, cityID, state, stateID });
          });
          if (pincodeCity.length > 1) {
            pincodeCity.unshift({ city: "Select City", cityID: 0 });
          }

          if (pincodeCity.length === 1) {
            travellerData.proposers[index].city = pincodeCity[0].city;
            travellerData.proposers[index].cityID = pincodeCity[0].cityID;
            travellerData.proposers[index].state = pincodeCity[0].state;
            travellerData.proposers[index].stateID = pincodeCity[0].stateID;
          }

          if (proposersPincodeCity && proposersPincodeCity.length === 0) {
            proposersPincodeCity.push({ profileID, pincodeCity });
          } else {
            const proposerLength = proposersPincodeCity.filter(x => x.profileID === profileID)
              .length;
            if (proposerLength === 0) {
              proposersPincodeCity.push({ profileID, pincodeCity });
            } else {
              proposersPincodeCity.map(x => {
                if (x.profileID === profileID) {
                  x.pincodeCity = pincodeCity;
                }
              });
            }
          }
        } else {
          // if pincode do not exist and user fill the correct pincode first time but again put wrong pincode
          errors.proposerErrors[index].zipCodeError = { showUnavailabePincode: true };
          errors.proposerErrors[index].zipCodeError = {
            showUnavailabePincodeRemarks: lang.unavailabelPincodeRemarks
          };
          travellerData.proposers[index].city = "";
          travellerData.proposers[index].cityID = 0;
          const proposerPincodeIndex = proposersPincodeCity.findIndex(
            x => x.profileID === profileID
          );
          if (proposerPincodeIndex !== -1)
            proposersPincodeCity[proposerPincodeIndex].pincodeCity = [];
          setTimeout(() => {
            this.setState({ proposersPincodeCity });
          }, 10);
        }
      }
    }

    this.setState({
      travellerData,
      PinAndCityList,
      pincodeCity,
      proposersPincodeCity,
      errors
    });
    if (value.length === 6) {
      this.copyFirstProposerToAllProposer();
    }
  };

  hideToast = () => {
    this.setState({
      toastShowHide: "hide"
    });
  };

  handelTravellTabDisplay = (variantIndex, travellerIndex) => {
    const { travellerData } = this.state;

    this.changeTravellerTab(travellerData, variantIndex, travellerIndex);
  };

  showTravellerLoader = (variantIndex, travellerIndex) => {
    let loaderElement = document.getElementById(`divloader${variantIndex}${travellerIndex}`);
    let travellerElement = document.getElementById(
      `divmemberAndProposercontainer${variantIndex}${travellerIndex}`
    );
  };
  hideTravellerLoader = (variantIndex, travellerIndex) => {
    let loaderElement = document.getElementById(`divloader${variantIndex}${travellerIndex}`);
    let travellerElement = document.getElementById(
      `divmemberAndProposercontainer${variantIndex}${travellerIndex}`
    );
  };

  changeTravellerTab = (travellerData, variantIndex, travellerIndex) => {
    setTimeout(() => this.showTravellerLoader(variantIndex, travellerIndex), 0);
    setTimeout(() => this.hideTravellerLoader(variantIndex, travellerIndex), 1000);

    travellerData.variants.map((x, proposerVariantIndex) => {
      x.members.map((y, memberIndex) => {
        if (proposerVariantIndex === variantIndex && memberIndex === travellerIndex) {
          travellerData.variants[variantIndex].members[memberIndex].isTabDisplayed = true;
        } else if (proposerVariantIndex === variantIndex) {
          travellerData.variants[variantIndex].members[memberIndex].isTabDisplayed = false;
        }
      });
    });
    this.setState({ travellerData }, () => {
      const ele = document.getElementById(`txtTravellerName${variantIndex}${travellerIndex}`);
      setTimeout(
        ele => {
          ele.focus();
        },
        1000,
        ele
      );
    });
  };

  handelTravellerGender = (e, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    errors.variantsErrors[variantIndex][memberIndex].genderError.valid = true;

    travellerData.variants[variantIndex].members[memberIndex].genderID = parseInt(
      e.target.value,
      10
    );
    travellerData.variants[variantIndex].members[memberIndex].salutationID = parseInt(
      e.target.value,
      10
    );
    this.setState({
      travellerData,
      errors
    });
  };

  handelTravellerName = (e, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    const { variants } = travellerData;
    const { insurerID } = variants[variantIndex];
    let { value } = e.target;
    value = value.trimLeft();
    if (/^.*  .*$/.test(value)) {
      value = value.replace("  ", " ");
    }
    const validationResponse = insurerSpecificValidation(
      insurerID,
      requestFrom.traveller,
      dataField.travellerName,
      value
    );

    if (!validationResponse.hasError) {
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.valid = true;
      if (validationResponse.hasWarning && validationResponse.hasWarning === true) {
        errors.variantsErrors[variantIndex][memberIndex].fullnameError.hasWarning = true;
        errors.variantsErrors[variantIndex][memberIndex].fullnameError.remarks =
          validationResponse.remarks;
      }
      travellerData.variants[variantIndex].members[memberIndex].fullName = value;
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.showremarks = false;
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.remarks = null;
      this.setState({ travellerData, errors });
    } else {
      if (errors && errors.variantsErrors) {
        errors.variantsErrors[variantIndex][memberIndex].fullnameError.valid = false;
        errors.variantsErrors[variantIndex][memberIndex].fullnameError.showremarks = true;
        errors.variantsErrors[variantIndex][memberIndex].fullnameError.remarks =
          lang.fulNamerequiredValidationMsg;
      }
      this.setState({ errors });
    }
  };

  onBlurTravellerName = (fullName, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    const { variants } = travellerData;
    const { insurerID } = variants[variantIndex];

    if (!fullName || fullName.length < 2 || fullName.length > 70) {
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.valid = false;
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.showremarks = true;
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.remarks =
        lang.fulNamerequiredValidationMsg;
      this.setState({ errors });
    } else if (!/^(.*\s.*){1,}$/.test(_.trim(fullName))) {
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.valid = false;
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.showremarks = true;
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.remarks =
        lang.fulNamerequiredValidationMsg;
      this.setState({ errors });
    } else {
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.valid = true;
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.showremarks = false;
      errors.variantsErrors[variantIndex][memberIndex].fullnameError.remarks = null;
      this.setState({ errors });
      this.copyData(copyFrom.traveller, variantIndex, memberIndex);
    }
  };

  handelTravellerpassportNo = (e, variantIndex, memberIndex, nationalityID) => {
    const { travellerData, errors } = this.state;
    const { variants } = travellerData;
    const { insurerID } = variants[variantIndex];

    let { value } = e.target;

    if (nationalityID === 1) {
      if (!/^[A-Za-z]{1}.*$/.test(value)) {
        // value = value.replace(/[^a-zA-Z\d]+/g, "")
        value = "";
      }
      if (insurerID !== 9) {
        if (value.length > 8) {
          return
        }
      }
      else {
        if (value.length > 9) {
          return
        }
      }

      if (
        !insurerSpecificValidation(insurerID, requestFrom.traveller, dataField.passportno, value)
      ) {
        if (errors && errors.variantsErrors) {
          errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = false;
          errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = true;
          errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks =
            lang.passportrequiredValidationMsg;
        }
        this.setState({ errors });
      } else {
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = true;
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = false;
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks = null;
        travellerData.variants[variantIndex].members[memberIndex].passportNo = value.toUpperCase();
        this.setState({ travellerData });
      }
    } else {
      if (value.length <= 10) {
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = true;
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = false;
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks = null;
        travellerData.variants[variantIndex].members[memberIndex].passportNo = value.toUpperCase();
      } else {
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = false;
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = true;
        errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks =
          lang.passportrequiredValidationMsg;
      }
      this.setState({
        travellerData,
        errors
      });
    }
  };
  validatePassport = (value, variantIndex, memberIndex, nationalityID) => {
    const { errors, travellerData } = this.state;
    const { variants } = travellerData;
    const { insurerID } = variants[variantIndex];
    if (value) {
      if (nationalityID === 1) {
        if (insurerID !== 9) {
          if (value.length !== 8) {
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = false;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = true;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks =
              lang.passportrequiredValidationMsg;
            this.setState({ errors });
          } else {
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = true;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = false;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks = null;
            this.setState({ errors });
          }
        } else {
          if (value.length < 8 || value.length > 9) {
            if (errors && errors.variantsErrors) {
              errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = false;
              errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = true;
              errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks =
                lang.passportrequiredValidationMsg;
            }
          } else {
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = true;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = false;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks = null;
          }
          this.setState({ errors });
        }
      } else {
        if (value.length < 4 || value.length > 10) {
          if (errors && errors.variantsErrors) {
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = false;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = true;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks =
              lang.passportrequiredValidationMsg;
          }
        } else {
          errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = true;
          errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = false;
          errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks = null;
        }
        this.setState({ errors });
      }

      let allMembers = [];
      travellerData.variants.map(x => {
        const { members } = x;
        members &&
          members.map(x => {
            allMembers.push(x);
          });
        const passportCount = allMembers.filter(x => x.passportNo === value).length;
        if (passportCount > 1) {
          if (errors && errors.variantsErrors) {
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.valid = false;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.showremarks = true;
            errors.variantsErrors[variantIndex][memberIndex].passportNoError.remarks =
              lang.samePassportValidationMsg;
          }
          this.setState({ errors });
        }
      });
    }
  };

  handelTravellerAddress = (e, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    if (isSpecialCharacterInAddressFieldValid(e.target.value)) {
      if (errors && errors.variantsErrors) {
        errors.variantsErrors[variantIndex][memberIndex].addressError.valid = false;
      }
      this.setState({ errors });
    } else {
      errors.variantsErrors[variantIndex][memberIndex].addressError.valid = true;
      travellerData.variants[variantIndex].members[memberIndex].address = e.target.value;
      this.setState({ travellerData });
    }
  };

  handelTravellerNomineeName = (e, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;
    const { variants } = travellerData;
    const { insurerID } = variants[variantIndex];

    let { value } = e.target;
    value = value.trimLeft();
    if (/^.*  .*$/.test(value)) {
      value = value.replace("  ", " ");
    }

    if (insurerSpecificValidation(insurerID, requestFrom.traveller, dataField.nomineeName, value)) {
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.valid = true;
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.showremarks = false;
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.remarks = null;
      travellerData.variants[variantIndex].members[memberIndex].nomineeName = value;
      this.setState({ travellerData });
    } else {
      if (errors && errors.variantsErrors) {
        errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.valid = false;
        errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.showremarks = true;
        errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.remarks =
          lang.nomineeNamevalidationmsg;
      }
      this.setState({ errors });
    }
  };

  onBlurTravellerNomineeName = (nomineeName, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;
    const { variants } = travellerData;
    const { insurerID } = variants[variantIndex];

    if (!nomineeName || nomineeName.length < 2 || nomineeName.length > 70) {
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.valid = false;
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.showremarks = true;
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.remarks =
        lang.nomineeNamevalidationmsg;
      this.setState({ errors });
    } else if (!/^(.*\s.*){1,}$/.test(_.trim(nomineeName))) {
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.valid = false;
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.showremarks = true;
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.remarks =
        lang.nomineeNamevalidationmsg;
      this.setState({ errors });
    } else {
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.valid = true;
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.showremarks = false;
      errors.variantsErrors[variantIndex][memberIndex].nomineeNameError.remarks = null;
      this.setState({ errors });
    }
  };

  handelTravellerNomineeRelationShip = (e, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    if (parseInt(e.target.value, 10) === 0) {
      if (errors && errors.variantsErrors) {
        errors.variantsErrors[variantIndex][memberIndex].nomineeRelationIDError.valid = false;
      }
      this.setState({ errors });
    } else {
      errors.variantsErrors[variantIndex][memberIndex].nomineeRelationIDError.valid = true;
      travellerData.variants[variantIndex].members[memberIndex].nomineeRelationID = parseInt(
        e.target.value,
        10
      );
      this.setState({ travellerData });
    }
  };

  handelphysicianContactNumber = (e, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    travellerData.variants[variantIndex].members[memberIndex].physicianContactNumber = parseInt(
      e.target.value,
      10
    );
    this.setState({
      travellerData,
      errors
    });
  };

  handelphysicianName = (e, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    travellerData.variants[variantIndex].members[memberIndex].physicianName = e.target.value;
    this.setState({
      travellerData,
      errors
    });
  };

  handelphysicianCityAddress = (e, variantIndex, memberIndex) => {
    const { travellerData, errors } = this.state;

    travellerData.variants[variantIndex].members[memberIndex].physicianCityAddress = e.target.value;
    this.setState({
      travellerData,
      errors
    });
  };

  travellerPassportExpiredOn = (e, variantIndex, memberIndex) => {
    if (e) {
      const { travellerData, errors } = this.state;

      let newDate = new Date(e);
      newDate.setDate(e.getDate() + 1);
      travellerData.variants[variantIndex].members[
        memberIndex
      ].passportExpiredOn = newDate.toISOString().substr(0, 10);

      errors.variantsErrors[variantIndex][memberIndex].passportExpiredOnError.valid = true;

      this.setState({
        travellerData,
        errors
      });
    }
  };

  handelTravellerSubmit = async (e, variantIndex, memberIndex) => {
    e.preventDefault();

    const { travellerData, errors: step2Error, submitTravellerSpinnerShowHide } = this.state;


    if(submitTravellerSpinnerShowHide === 'show') return;

    this.setState({
      submitTravellerSpinnerShowHide: "show"
    });

    const { saveProposalStep2Data, encryptedProposerId } = this.props;
    saveProposalStep2Data(travellerData);
    const response = await modifyStep2Data(travellerData, actionTypes.SAVEFORM, encryptedProposerId);

    const { hasError } = response;
    if (hasError) {
      this.setState({
        submitTravellerSpinnerShowHide: "hide"
      });
    } else {
      const {
        gaFlowName
      } = this.state;
      const gaTravellerData = {
        eventCategory: "Trv.BU Proposal 2",
        eventAction: "Trv.click",
        eventLabel: "Trv.Traveller",
        eventValue: "",
        flowName: gaFlowName
      };
      customEvent(gaTravellerData);

      this.setState({
        submitTravellerSpinnerShowHide: "hide"
      });
    }

    let trvellerCount = travellerData.variants[variantIndex].members.length;
    if (!(memberIndex + 1 === trvellerCount)) {
      this.changeTravellerTab(travellerData, variantIndex, memberIndex + 1);
      this.scrollToCustomeElement(`txtTravellerName${variantIndex}${memberIndex + 1}`);
    } else {
      const ele = document.getElementById(`txtTravellerName${variantIndex + 1}0`);
      setTimeout(
        ele => {
          if (ele) {
            ele.focus();
          } else {
            const elemnt = document.getElementById(`txtCustomerName`);
            elemnt.focus();
          }
        },
        0,
        ele
      );
    }
  };

  handelProceedProposalStep2 = async () => {
    let {
      travellerData,
      errors: errorStep2,
      submittProceedSpinnerShowHide,
      saveTravellerSpinnerShowHide,
      toastShowHide,
      toastText,
      gaFlowName
    } = this.state;


    if(submittProceedSpinnerShowHide === 'show' || saveTravellerSpinnerShowHide === 'show') return;
    
    this.setState({ submittProceedSpinnerShowHide: "show" });
    let { isValid, errors } = isProceedProposalStep2Valid(errorStep2, travellerData);
    const { valid, error } = handleStudentPlanSubmit(travellerData, errors, isValid);
    const { encryptedProposerId } = this.props;
    isValid = valid;
    errors = error;
    if (isValid) {
      const { saveProposalStep2Data } = this.props;
      saveProposalStep2Data(travellerData);
      const response = await modifyStep2Data(travellerData, actionTypes.PROCEED, encryptedProposerId);

      const { hasError } = response;
      if (hasError) {
        this.setState({
          submittProceedSpinnerShowHide: "hide"
        });
      } else {
        submittProceedSpinnerShowHide = "hide";
        const gaData = {
          eventCategory: "Trv.BU Proposal 2",
          eventAction: "Trv.click",
          eventLabel: "Trv.Proceed",
          eventValue: "",
          flowName: gaFlowName
        };
        customEvent(gaData);
        this.props.history.push(`/v2/checkout/${encryptedProposerId}`);
      }
    } else {
      const travellerData = this.showTravellerTabWithError(errors);
      submittProceedSpinnerShowHide = "hide";
      this.setState(
        {
          errors,
          submittProceedSpinnerShowHide,
          travellerData
        },
        this.focusOnErrorElement
      );
    }
  };

  showTravellerTabWithError = errors => {
    const { travellerData } = this.state;
    for (let variantIndex = 0; variantIndex < errors.variantsErrors.length; variantIndex++) {
      const variant = errors.variantsErrors[variantIndex];
      for (let memberIndex = 0; memberIndex < variant.length; memberIndex++) {
        const profileID = travellerData.variants[variantIndex].members[memberIndex].profileID;
        const proposerIndex = travellerData.proposers.findIndex(x => x.profileID === profileID);

        const {
          fullNameError: proposerFullNameError,
          genderError: proposerGenderError,
          addressError,
          cityIDError,
          zipCodeError,
          emailIDError,
          relationWithInsuredError
        } = errors.proposerErrors[proposerIndex];

        const {
          fullnameError,
          genderError,
          nomineeNameError,
          nomineeRelationIDError,
          passportNoError,
          isPedError
        } = variant[memberIndex];
        if (
          !fullnameError.valid ||
          !genderError.valid ||
          !nomineeNameError.valid ||
          !nomineeRelationIDError.valid ||
          !passportNoError.valid ||
          !isPedError.valid ||
          !proposerFullNameError.valid ||
          !proposerGenderError.valid ||
          !addressError.valid ||
          !cityIDError.valid ||
          !zipCodeError.valid ||
          !emailIDError.valid ||
          !relationWithInsuredError.valid
        ) {
          travellerData.variants[variantIndex].members[memberIndex].isTabDisplayed = true;
        } else {
          travellerData.variants[variantIndex].members[memberIndex].isTabDisplayed = false;
        }
      }

      const check = [];
      travellerData.variants[variantIndex].members.forEach((member, memberIndex) => {
        if (member.isTabDisplayed) {
          check.push({
            index: memberIndex
          });
        }
      });
      if (!check.length) {
        travellerData.variants[variantIndex].members[0].isTabDisplayed = true;
      } else if (check.length > 1) {
        check.forEach((memberIndex, i) => {
          if (i === 0) {
            travellerData.variants[variantIndex].members[memberIndex.index].isTabDisplayed = true;
          } else {
            travellerData.variants[variantIndex].members[memberIndex.index].isTabDisplayed = false;
          }
        });
      }
    }
    return travellerData;
  };

  scrollTo(top, behavior, left = null) {
    try {
      window.scrollTo({
        top: top,
        left: left || 0,
        behavior: behavior
      });
    } catch (err) { }
  }

  focusOnErrorElement = () => {
    const elements = document.getElementsByClassName("error_proposal");
    if (elements.length > 0) {
      const yCoordinate = elements[0].getBoundingClientRect().top + window.pageYOffset;
      const yOffset = -50;
      this.scrollTo(yCoordinate + yOffset, "smooth");
    }
  };
  scrollToCustomeElement = ID => {
    const element = document.getElementById(ID);
    if (element) {
      const yCoordinate = element.getBoundingClientRect().top + window.pageYOffset;
      const yOffset = -380;
      this.scrollTo(yCoordinate + yOffset, "smooth");
    }
  };

  handelSaveProposalStep2 = async () => {
    let {
      travellerData,
      errors: errorStep2,
      saveTravellerSpinnerShowHide,
      submittProceedSpinnerShowHide,
      toastShowHide,
      gaFlowName
    } = this.state;

    if(saveTravellerSpinnerShowHide === 'show'|| submittProceedSpinnerShowHide ==='show' ) return;


    this.setState({ saveTravellerSpinnerShowHide: "show" });

    if (validateDatatypeAndMisc() === true) {
      const { saveProposalStep2Data, encryptedProposerId } = this.props;
      saveProposalStep2Data(travellerData);
      const response = await modifyStep2Data(travellerData, actionTypes.SAVEFORM, encryptedProposerId);
      const { hasError } = response;
      if (hasError) {
        this.setState({
          saveTravellerSpinnerShowHide: "hide"
        });
      } else {
        const gaData = {
          eventCategory: "Trv.BU Proposal 2",
          eventAction: "Trv.click",
          eventLabel: "Trv.Save Form",
          eventValue: "",
          flowName: gaFlowName
        };
        customEvent(gaData);

        let element = document.getElementById("divProposalStep2Toast");
        if (element) {
          element.style.top = "110px";
        }

        this.setState({
          saveTravellerSpinnerShowHide: "hide",
          toastShowHide: "show",
          toastText: "Data has been Successfully Saved. "
        });
        setTimeout(() => this.hideToast(), 3000);
      }
    } else {
      this.setState({
        saveTravellerSpinnerShowHide: "hide"
      });
    }
  };

  handelPassportUpload = async (
    elementID,
    doc,
    variantIndex,
    memberIndex,
    profileID,
    profileTypeID
  ) => {
    let { travellerData, errors } = this.state;
    let { variants, proposers } = travellerData;
    let { members } = variants[variantIndex];
    let { age } = members[memberIndex];

    let fileField = document.getElementById(elementID);
    let formData = new FormData();
    formData.append("image", fileField.files[0]);
    const fileName = fileField.files[0].name;
    const fileSize = Math.round(fileField.files[0].size / 1000) + " Kb";
    const fileExtension = fileField.files[0].name
      .split(".")
      .pop()
      .toLowerCase();
    if (
      fileExtension === fileExtensions[0] ||
      fileExtension === fileExtensions[1] ||
      fileExtension === fileExtensions[2] ||
      fileExtension === fileExtensions[3]
    ) {
      if (documents[0].value === doc) {
        travellerData.variants[variantIndex].members[memberIndex].enableFrontLoader = true;
        travellerData.variants[variantIndex].members[memberIndex].frontFileName = fileName;
        travellerData.variants[variantIndex].members[memberIndex].frontFileSize = fileSize;
        this.setState({
          travellerData
        });
      } else {
        travellerData.variants[variantIndex].members[memberIndex].enableBackLoader = true;
        travellerData.variants[variantIndex].members[memberIndex].backFileName = fileName;
        travellerData.variants[variantIndex].members[memberIndex].backFileSize = fileSize;
        this.setState({
          travellerData
        });
      }

      if (fileField.files[0]) {
        let reader = new FileReader();
        reader.onload = function (readerEvt) {
          let binaryString = readerEvt.target.result;
          let base64String = btoa(binaryString);
        };
        reader.readAsBinaryString(fileField.files[0]);
      }
      const result = await getPassportData(formData);
      if (result.data && result.data.data) {
        let {
          first_name,
          last_name,
          mothers_name,
          passport_no,
          gender,
          spouses_name,
          address,
          date_of_issue,
          date_of_birth,
          fathers_name,
          place_of_birth,
          date_of_expiry,
          place_of_issue,
          type,
          uid,
          dob,
          name
        } = result.data.data;

        if (documents[0].value === doc) {
          if ((first_name && last_name) || name) {
            travellerData.variants[variantIndex].members[
              memberIndex
            ].fullName =name?name: `${first_name} ${last_name}`;
            this.copyData(copyFrom.traveller, variantIndex, memberIndex);
          }
          if (passport_no || uid) {
            travellerData.variants[variantIndex].members[memberIndex].passportNo =uid?uid: passport_no;
          }

          if (gender && gender === "F") {
            travellerData.variants[variantIndex].members[memberIndex].genderID = 2;
            this.copyData(copyFrom.traveller, variantIndex, memberIndex);
          }
          if (gender && gender === "M") {
            travellerData.variants[variantIndex].members[memberIndex].genderID = 1;
            this.copyData(copyFrom.traveller, variantIndex, memberIndex);
          }
        } else {
          if (address && age >= 18) {
            let passportScannedPincode = null;
            const index = proposers.findIndex(x => x.profileID === profileID);
            if (index !== -1) {
              if (
                (profileTypeID === profileTypes.family ||
                  profileTypeID === profileTypes.senionFamily) &&
                memberIndex === 0 &&
                variantIndex === 0
              ) {
               
                address=address.replace('.','')
                proposers[index].address = address;
                let addressArr = address.split(",");
                addressArr &&
                  addressArr.length > 0 &&
                  addressArr.map(x => {
                    if (x.includes("Pin")) {
                      passportScannedPincode = x.split(":").pop();
                      if (passportScannedPincode && passportScannedPincode.length === 6) {
                        this.handelAutoCompleteProposerZipCode(passportScannedPincode, profileID);
                        this.copyFirstProposerToAllProposer();
                      }
                    }
                  });
                this.copyFirstProposerToAllProposer();
              } else if (
                profileTypeID !== profileTypes.family &&
                profileTypeID !== profileTypes.senionFamily
              ) {
               
                address=address.replace('.','')
                proposers[index].address = address;
                let addressArr = address.split(",");
                addressArr &&
                  addressArr.length > 0 &&
                  addressArr.map(x => {
                    if (x.includes("Pin")) {
                      passportScannedPincode = x.split(":").pop();
                      if (passportScannedPincode && passportScannedPincode.length === 6) {
                        this.handelAutoCompleteProposerZipCode(passportScannedPincode, profileID);
                        this.copyFirstProposerToAllProposer();
                      }
                    }
                  });
                this.copyFirstProposerToAllProposer();
              }
            }
          }
        }

        if (documents[0].value === doc) {
          travellerData.variants[variantIndex].members[memberIndex].enableFrontLoader =
            "showPassportCheck";
          travellerData.variants[variantIndex].members[memberIndex].frontFileName = null;
          travellerData.variants[variantIndex].members[memberIndex].frontFileSize = null;
        } else {
          travellerData.variants[variantIndex].members[memberIndex].enableBackLoader =
            "showPassportCheck";
          travellerData.variants[variantIndex].members[memberIndex].backFileName = null;
          travellerData.variants[variantIndex].members[memberIndex].backFileSize = null;
        }
      } else {
        if (documents[0].value === doc) {
          travellerData.variants[variantIndex].members[memberIndex].enableFrontLoader = false;
          travellerData.variants[variantIndex].members[memberIndex].frontFileName = null;
          travellerData.variants[variantIndex].members[memberIndex].frontFileSize = null;
        } else {
          travellerData.variants[variantIndex].members[memberIndex].enableBackLoader = false;
          travellerData.variants[variantIndex].members[memberIndex].backFileName = null;
          travellerData.variants[variantIndex].members[memberIndex].backFileSize = null;
        }
      }
    } else {
      if (documents[0].value === doc) {
        errors.variantsErrors[variantIndex][memberIndex].passportFrontError.valid = false;
        errors.variantsErrors[variantIndex][memberIndex].passportFrontError.remarks =
          fileExtension + " file is not allowed";
      } else {
        errors.variantsErrors[variantIndex][memberIndex].passportBackError.valid = false;
        errors.variantsErrors[variantIndex][memberIndex].passportBackError.remarks =
          fileExtension + " file is not allowed";
      }
    }
    this.setState({
      travellerData,
      errors
    });
  };

  closePassportUploadProcess = (docType, variantIndex, memberIndex) => {
    let { travellerData } = this.state;

    if (documents[0].value === docType) {
      travellerData.variants[variantIndex].members[memberIndex].enableFrontLoader = false;
    } else {
      travellerData.variants[variantIndex].members[memberIndex].enableBackLoader = false;
    }
    this.setState({
      travellerData
    });

    return;
  };

  handelRightsliderDimension = id => {
    let { show8thLiApperance } = this.setState;
    show8thLiApperance = false;

    let { sliderMarginLeft, sliderMarginRight } = this.state;
    const element = document.getElementById(id);
    if (element) {
      element.style.marginLeft = `${sliderMarginLeft - 140}px`;
      if (sliderMarginLeft !== 0) {
        sliderMarginRight = sliderMarginRight - 140;
      }
      this.setState({
        sliderMarginLeft: sliderMarginLeft - 140,
        sliderMarginRight,
        show8thLiApperance
      });
    }
  };

  handelLeftsliderDimension = id => {
    let { sliderMarginLeft, sliderMarginRight, show8thLiApperance } = this.state;
    const element = document.getElementById(id);
    if (element) {
      element.style.marginLeft = `${sliderMarginRight}px`;
      if (sliderMarginRight !== 0) {
        sliderMarginRight = sliderMarginRight + 140;
      }
      if (sliderMarginLeft !== 0) {
        sliderMarginLeft = sliderMarginLeft + 140;
      }
      if (sliderMarginLeft === 0 && sliderMarginRight === 0) {
        show8thLiApperance = true;
      }
      this.setState({ sliderMarginLeft, sliderMarginRight, show8thLiApperance });
    }
  };
  closeToast = () => {
    this.hideToast();
  };

  handelShowHideProductDetail = variantIndex => {
    const { travellerData } = this.state;

    travellerData.variants[variantIndex].showHideProductDetailDiv =
      travellerData.variants[variantIndex].showHideProductDetailDiv === "hide" ? "show" : "hide";
    travellerData.variants[variantIndex].productDetailIcon =
      travellerData.variants[variantIndex].productDetailIcon === "downArrow_Grey"
        ? "upArrow_Grey"
        : "downArrow_Grey";

    this.setState({
      travellerData
    });
  };

  copyData = (actionFrom, variantIndex = null, memberIndex = null) => {
    let { travellerData, errors } = this.state;

    const { variants } = travellerData;
    const { profileTypeID, members } = variants[variantIndex];
    const { age } = members[memberIndex];

    if (age >= 18) {
      if (actionFrom === copyFrom.traveller) {
        if (profileTypeID === profileTypes.family) {
          const travellerProfileID = travellerData.variants[variantIndex].members[0].profileID;
          const proposerIndex = travellerData.proposers.findIndex(
            x => x.profileID === travellerProfileID
          );
          if (proposerIndex !== -1) {
            if (
              travellerData.proposers[proposerIndex].fullName === null ||
              travellerData.proposers[proposerIndex].fullName === ""
            ) {
              travellerData.proposers[proposerIndex].fullName =
                travellerData.variants[variantIndex].members[0].fullName;
              errors.proposerErrors[proposerIndex].fullNameError.valid = true;
            }

            if (
              travellerData.proposers[proposerIndex].dateOfBirth === null ||
              travellerData.proposers[proposerIndex].dateOfBirth === ""
            ) {
              travellerData.proposers[proposerIndex].dateOfBirth =
                travellerData.variants[variantIndex].members[0].dateOfBirth;
              errors.proposerErrors[proposerIndex].dateOfBirthError = { valid: true };
            }

            if (travellerData.proposers[proposerIndex].genderID === 0) {
              travellerData.proposers[proposerIndex].genderID =
                travellerData.variants[variantIndex].members[0].genderID;
              errors.proposerErrors[proposerIndex].genderError = { valid: true };
            }
          }
        } else if (profileTypeID === profileTypes.self || profileTypeID === profileTypes.student) {
          const travellerProfileID =
            travellerData.variants[variantIndex].members[memberIndex].profileID;
          const proposerIndex = travellerData.proposers.findIndex(
            x => x.profileID === travellerProfileID
          );
          if (proposerIndex !== -1) {
            if (
              travellerData.proposers[proposerIndex].fullName === null ||
              travellerData.proposers[proposerIndex].fullName === ""
            ) {
              travellerData.proposers[proposerIndex].fullName =
                travellerData.variants[variantIndex].members[memberIndex].fullName;
              errors.proposerErrors[proposerIndex].fullNameError.valid = true;
            }

            if (
              travellerData.proposers[proposerIndex].dateOfBirth === null ||
              travellerData.proposers[proposerIndex].dateOfBirth === ""
            ) {
              travellerData.proposers[proposerIndex].dateOfBirth =
                travellerData.variants[variantIndex].members[memberIndex].dateOfBirth;
              errors.proposerErrors[proposerIndex].dateOfBirthError = { valid: true };
            }

            if (travellerData.proposers[proposerIndex].genderID === 0) {
              travellerData.proposers[proposerIndex].genderID =
                travellerData.variants[variantIndex].members[memberIndex].genderID;
              errors.proposerErrors[proposerIndex].genderError = { valid: true };
            }
          }
        }

        if (travellerData.customer.fullName === null || travellerData.customer.fullName === "") {
          travellerData.customer.fullName = travellerData.variants[0].members[0].fullName;
          errors.customerError.fullNameError.valid = true;
        }
      } else if (actionFrom === copyFrom.proposer) {
        if (profileTypeID === profileTypes.family) {
          const travellerProfileID = travellerData.variants[0].members[0].profileID;
          const proposerIndex = travellerData.proposers.findIndex(
            x => x.profileID === travellerProfileID
          );
          if (proposerIndex !== -1) {
            if (travellerData.customer.emailID === null || travellerData.customer.emailID === "") {
              travellerData.customer.emailID = travellerData.proposers[proposerIndex].emailID;
              errors.customerError.emailIDError = { valid: true };
            }
            if (
              travellerData.customer.fullName === null ||
              travellerData.customer.fullName === ""
            ) {
              travellerData.customer.fullName = travellerData.proposers[proposerIndex].fullName;
              errors.customerError.fullNameError.valid = true;
            }
          }
        } else if (profileTypeID === profileTypes.self || profileTypeID === profileTypes.student) {
          const travellerProfileID = travellerData.variants[0].members[0].profileID;
          const proposerIndex = travellerData.proposers.findIndex(
            x => x.profileID === travellerProfileID
          );
          if (proposerIndex !== -1) {
            if (travellerData.customer.emailID === null || travellerData.customer.emailID === "") {
              travellerData.customer.emailID = travellerData.proposers[proposerIndex].emailID;
              errors.customerError.emailIDError = { valid: true };
            }
            if (
              travellerData.customer.fullName === null ||
              travellerData.customer.fullName === ""
            ) {
              travellerData.customer.fullName = travellerData.proposers[proposerIndex].fullName;
              errors.customerError.fullNameError.valid = true;
            }
          }
        }
      }
    }

    this.setState({
      travellerData,
      errors
    });
  };

  handelCustomerName = e => {
    let { travellerData, errors } = this.state;
    let { value } = e.target;
    value = value.trimLeft();
    if (/^.*  .*$/.test(value)) {
      value = value.replace("  ", " ");
    }

    if (isNotAlphabate(value)) {
      errors.customerError.fullNameError = {
        valid: false,
        remarks: "Special Character are not allowed"
      };
      errors.customerError.fullNameError.showremarks = true;
      errors.customerError.fullNameError.remarks = lang.fulNamerequiredValidationMsg;
      this.setState({ errors });
    } else {
      errors.customerError.fullNameError.valid = true;
      errors.customerError.fullNameError.showremarks = false;
      errors.customerError.fullNameError.remarks = null;
      travellerData.customer.fullName = value;
      this.setState({
        travellerData,
        errors
      });
    }
  };

  onBlurCustomerName = fullName => {
    let { errors } = this.state;
    if (!fullName || fullName.length < 2 || fullName.length > 70) {
      errors.customerError.fullNameError.valid = false;
      errors.customerError.fullNameError.showremarks = true;
      errors.customerError.fullNameError.remarks = lang.fulNamerequiredValidationMsg;
      this.setState({ errors });
    } else if (!/^(.*\s.*){1,}$/.test(_.trim(fullName))) {
      errors.customerError.fullNameError.valid = false;
      errors.customerError.fullNameError.showremarks = true;
      errors.customerError.fullNameError.remarks = lang.fulNamerequiredValidationMsg;
      this.setState({ errors });
    } else {
      errors.customerError.fullNameError = { valid: true };
      errors.customerError.fullNameError.showremarks = false;
      errors.customerError.fullNameError.remarks = null;
      this.setState({ errors });
    }
  };
  handelCustomerMobileNo = e => {
    let { travellerData, errors } = this.state;

    if (isValidMobileDigit(e.target.value)) {
      errors.customerError.mobileNoError.valid = true;
      travellerData.customer.mobileNo = e.target.value;
    } else {
      errors.customerError.mobileNoError = {
        valid: false,
        remarks: "Special Character are not allowed"
      };
    }

    this.setState({
      travellerData,
      errors
    });
  };

  validateCustomerMobileNo = mobileNo => {
    let { errors } = this.state;
    if (!mobileNo) {
      errors.customerError.mobileNoError = { valid: false, remarks: "Enter valid mobile no" };
    } else if (mobileNo.length !== 10) {
      errors.customerError.mobileNoError = { valid: false, remarks: "Enter valid mobile no" };
    } else {
      errors.customerError.mobileNoError = { valid: true };
    }

    this.setState({
      errors
    });
  };

  handelCustomerEmail = e => {
    let { travellerData } = this.state;

    travellerData.customer.emailID = e.target.value.trimLeft();
    this.setState({
      travellerData
    });
  };
  validateCustomerEmail = () => {
    const { travellerData, errors } = this.state;

    if (!isValidEmailAddress(travellerData.customer.emailID)) {
      errors.customerError.emailIDError = { valid: false, remarks: "email not valid" };
      errors.customerError.emailIDError.showremarks = true;
      errors.customerError.emailIDError.remarks = lang.validEmailMsg;
    } else {
      errors.customerError.emailIDError = { valid: true };
    }
    this.setState({ errors });
  };

  handelCustomerpan = e => {
    let { travellerData, errors } = this.state;
    e.target.value = e.target.value.replace(/([^a-zA-Z\d]+)/g, "");
    if (isTextValidForPan(e.target.value)) {
      errors.customerError.panError.valid = true;
      travellerData.customer.pan = e.target.value;
      this.setState({
        travellerData,
        errors
      });
    } else {
      errors.customerError.panError = {
        valid: false,
        remarks: "Special Character are not allowed"
      };
      this.setState({ errors });
    }
  };

  validateCustomerPan = pan => {
    let { errors } = this.state;
    if (validatePan(pan) === false) {
      errors.customerError.panError = {
        valid: false,
        remarks: "Special Character are not allowed"
      };
      this.setState({ errors });
    } else if (validatePan(pan) === true) {
      errors.customerError.panError = { valid: true };
      this.setState({ errors });
    }
  };

  handelModifyCustomer = async () => {
    const { travellerData, errors: step2Error } = this.state;
    const { encryptedProposerId } = this.props;

    this.setState({ submitProposalSpinnerShowHide: "show" });
    let { isvalid, errors } = isCustomerValid(travellerData, step2Error);
    if (isvalid) {
      const response = await modifyStep2Data(travellerData, actionTypes.SUBMITPROPOSER, encryptedProposerId);
      const { hasError } = response;
      if (hasError) {
        this.setState({
          submitProposalSpinnerShowHide: "hide"
          // toastShowHide: 'show',
          // toastText: response.returnValue,
        });
        //setTimeout(() => this.hideToast(), 3000);
      } else {
        this.setState({
          submitProposalSpinnerShowHide: "hide"
        });
      }
    } else {
      this.setState(
        {
          errors,
          submitProposalSpinnerShowHide: "hide"
        },
        this.focusOnErrorElement
      );
    }
  };

  renderProposer(variantIndex, memberIndex, profileTypeID) {
    let travellerProfileID = 0;
    let {
      pincodeMaster,
      pincodeCity,
      proposersPincodeCity,
      PinAndCityList,
      travellerData,
      errors
    } = this.state;
    const { proposerRelations, variants, proposers } = travellerData;

    if (profileTypeID === profileTypes.family) {
      travellerProfileID = variants[variantIndex].members[0].profileID;
    } else {
      travellerProfileID = variants[variantIndex].members[memberIndex].profileID;
    }

    let proposerData =
      proposers && proposers.filter(proposer => proposer.profileID === travellerProfileID);
    let {
      profileID,
      salutationID,
      salutation,
      genderID,
      gender,
      dateOfBirth,
      pan,
      address,
      cityID,
      zipCode,
      alternateMobileNo,
      landmark,
      enquiryID,
      city,
      stateID,
      state,
      countryName,
      proposerID,
      fullName,
      mobileNo,
      emailID,
      countryID,
      countryCode,
      customerID
    } = proposerData[0];

    const { members } = variants[variantIndex];

    const { proposerRelationID, age } = members.filter(x => x.profileID === travellerProfileID)[0];

    const {
      fullNameError,
      genderError,
      addressError,
      dateOfBirthError,
      cityIDError,
      zipCodeError,
      alternateMobileNoError,
      mobileNoError,
      emailIDError,
      relationWithInsuredError
      // showUnavailabePincode,
      // showUnavailabePincodeRemarks
    } = errors.proposerErrors.filter(x => x.profileID === travellerProfileID)[0];

    return (
      <div className="row">
        <div className="col-md-6 fieldBlock">
          <div
            className={`field ${errors &&
              errors.proposerErrors &&
              (!fullNameError.valid ? "error_proposal" : "")}`}
          >
            <input
              type="text"
              required
              id={`txtProposerName_${variantIndex}${memberIndex}`}
              value={this.capitalizeText(fullName)}
              onChange={e => this.handelProposerName(e, profileID)}
              onBlur={() => {
                this.onBlurProposerName(fullName, profileID, variantIndex, memberIndex);
              }}
              autocomplete="new-password"
            />
            <label for={`txtProposerName_${variantIndex}${memberIndex}`}>
              {lang.proposal_Name}
            </label>
          </div>
          <div
            className={`${
              errors && errors.proposerErrors && fullNameError.showremarks === true
                ? "show error_textColor"
                : "hide"
              }`}
          >
            {errors && errors.proposerErrors && fullNameError.remarks}
          </div>
        </div>
        <div className="col-md-6">
          <div className="custom_radio clearfix">
            <div className={`width_50`}>
              <label className="male">
                <input
                  id={`radioProposerMale${variantIndex}${memberIndex}`}
                  onClick={e => {
                    this.handelProposerGender(e, profileID);
                    if (variantIndex === 0 && memberIndex === 0) {
                      this.copyFirstProposerToAllProposer();
                    }
                  }}
                  checked={genderID === 1}
                  type="radio"
                  value={1}
                />{" "}
                <span
                  className={`${errors &&
                    errors.proposerErrors &&
                    (!genderError.valid ? "error_proposal" : "")}`}
                >
                  {lang.male}
                </span>
              </label>
            </div>
            <div className={`width_50`}>
              <label className="female">
                <input
                  id={`radioProposerFeMale${variantIndex}${memberIndex}`}
                  onClick={e => {
                    this.handelProposerGender(e, profileID);
                    if (variantIndex === 0 && memberIndex === 0) {
                      this.copyFirstProposerToAllProposer();
                    }
                  }}
                  checked={genderID === 2}
                  type="radio"
                  value={2}
                />
                <span
                  className={`${errors &&
                    errors.proposerErrors &&
                    (!genderError.valid ? "error_proposal" : "")}`}
                >
                  {lang.female}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div
          className="col-md-6 dbo_Calendar calender_icon">
          <DatePicker
            ref={`proposaldatePicker${variantIndex}${memberIndex}`}
            selected={dateOfBirth ? moment(dateOfBirth).toDate() : null}
            onChange={e => {
              this.proposerDobChange(e, profileID);
              if (variantIndex === 0 && memberIndex === 0) {
                this.copyFirstProposerToAllProposer();
              }
            }}
            dateFormat={"d MMM yy"}
            placeholderText="Date of Birth"
            showYearDropdown
            scrollableYearDropdown
            maxDate={new Date(moment().subtract("year", 18))}
            minDate={new Date(moment().subtract("year", 99))}
            dropdownMode="select"
            tabIndex="proposer_date"
            onKeyDown={e => this.handleDateKeyPress(e, variantIndex, memberIndex)}
            showMonthDropdown={true}
            className={`cursorPointer selectCalenderDate input_type ${errors &&
              errors.proposerErrors &&
              (!dateOfBirthError.valid ? "error_proposal" : "")}`}


          />
        </div>

        <div className="col-md-6 fieldBlock">
          <div
            className={`field ${errors &&
              errors.proposerErrors &&
              (!emailIDError.valid ? "error_proposal" : "")}`}
          >
            <input
              type="text"
              required
              id={`txtProposerEmail${variantIndex}${memberIndex}`}
              value={emailID}
              onBlur={() => {
                this.validateProposerEmail(profileID, variantIndex, memberIndex);
              }}
              tabIndex={`proposerEmail${variantIndex}${memberIndex}`}
              onChange={e => this.handelProposerEmail(e, profileID)}
              autoComplete="off"
            />
            <label for={`txtProposerEmail${variantIndex}${memberIndex}`}>
              {lang.proposal_EmailId}
            </label>
          </div>
          <div
            className={`${
              errors && errors.proposerErrors && emailIDError.showremarks === true
                ? "show error_textColor"
                : "hide"
              }`}
          >
            {errors && errors.proposerErrors && emailIDError.remarks}
          </div>
        </div>

        <div style={{ position: "relative" }} className="col-md-6 fieldBlock">
          <div
            className={`field ${errors &&
              errors.proposerErrors &&
              (!zipCodeError.valid || zipCodeError.showUnavailabePincode === true
                ? "error_proposal"
                : "")}`}
          >
            <input
              onChange={e => this.handelAutoCompleteProposerZipCode(e.target.value, profileID)}
              type="text"
              value={zipCode}
              maxLength={6}
              id={`txtpincodeName_${variantIndex}${memberIndex}`}
              autocomplete="new-password"
              onKeyDown={(e) => { this.traversePincodes(e,0) }}
            />
            <label for={`txtpincodeName_${variantIndex}${memberIndex}`}>Pincode</label>
          </div>
          <div
            className={`${
              zipCodeError.showUnavailabePincodeRemarks &&
                zipCodeError.showUnavailabePincodeRemarks.length > 1
                ? "show error_textColor"
                : "show"
              }`}
          >
            {zipCodeError.showUnavailabePincodeRemarks}
          </div>

          <div
            className={pincodeMaster && pincodeMaster.length > 1 ? "show" : "hide"}
            style={{
              position: "absolute",
              zIndex: 100,
              border: "1px solid grey",
              height: 300,
              width: "94%",
              overflowY: "scroll",
              backgroundColor: "white",
              top: 56
            }}
          >
            <ul>
              {pincodeMaster &&
                pincodeMaster.map((pincode, id) => {
                  return (
                    <li
                      className="pincodeHover"
                      onClick={() => this.handelAutoCompleteProposerZipCode(pincode, profileID)}
                      style={{ cursor: "pointer", padding: 5 }}
                      id={"liPincode" + id}
                      tabIndex={(id+1)} 
                      onKeyDown={(e) => this.handleListKeyPress(e,(id+1), pincode,profileID)}

                      // onKeyDown={(e)=>{this.traversePincodes(e,"liPincode" + id)}}
                    >
                      {pincode}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="pro_box select ">
            <label for="city">City</label>
            <select
              className={`input_type ${errors &&
                errors.proposerErrors &&
                (!cityIDError.valid ? "error_proposal" : "")}`}
              onChange={e => this.handelcityState(e, profileID)}
            >
              {proposersPincodeCity && proposersPincodeCity.length > 0 ? (
                proposersPincodeCity.filter(x => x.profileID === travellerProfileID) &&
                proposersPincodeCity.filter(x => x.profileID === travellerProfileID).length > 0 &&
                proposersPincodeCity.filter(x => x.profileID === travellerProfileID)[0]
                  .pincodeCity &&
                proposersPincodeCity
                  .filter(x => x.profileID === travellerProfileID)[0]
                  .pincodeCity.map(x => {
                    const { city, cityID } = x;
                    return <option value={cityID}>{city}</option>;
                  })
              ) : (
                  <option value={cityID}>{city}</option>
                )}
            </select>
          </div>
        </div>
        <div className="col-md-12 fieldBlock">
          <div
            className={`field ${errors &&
              errors.proposerErrors &&
              (!addressError.valid ? "error_proposal" : "")}`}
          >
            <input
              type="text"
              required
              id={`txtProposerAddress${variantIndex}${memberIndex}`}
              value={address}
              onChange={e => this.handelProposerAddress(e, profileID, variantIndex)}
              onBlur={() => {
                this.onBlureProposerAddress(address, profileID, variantIndex, memberIndex);
              }}
              autocomplete="new-password"
            // autoComplete="off"
            />
            <label for={`txtProposerAddress${variantIndex}${memberIndex}`}>
              {lang.proposal_Address}
            </label>
          </div>

          <div
            className={`${
              errors && errors.proposerErrors && addressError.showremarks === true
                ? "show error_textColor"
                : "hide"
              }`}
          >
            {errors && errors.proposerErrors && addressError.remarks}
          </div>
        </div>
        <div className="col-md-6 fieldBlock">
          <div
            className={`field ${errors &&
              errors.proposerErrors &&
              (!alternateMobileNoError.valid ? "error_proposal" : "")}`}
          >
            <input
              type="text"
              required
              id={`txtProposeraltMobileNo${variantIndex}${memberIndex}`}
              value={alternateMobileNo}
              onChange={e => this.handelProposerAltMobileNo(e, profileID)}
              onBlur={() => {
                if (variantIndex === 0 && memberIndex === 0) {
                  this.copyFirstProposerToAllProposer();
                }
              }}
              maxLength={10}
              autocomplete="new-password"
            />
            <label for={`txtProposeraltMobileNo${variantIndex}${memberIndex}`}>
              {lang.proposal_AltMobileNo}
            </label>
          </div>
        </div>

        <div className={`col-md-6 ${profileTypeID === profileTypes.self ? "show" : "hide"}`}>
          <div
            className={`pro_box select ${errors &&
              errors.proposerErrors &&
              (!relationWithInsuredError.valid ? "error_proposal" : "")}`}
          >
            <label htmlFor={`ddlRelationwithInsured${variantIndex}`}>
              {lang.relationWithInsured}
            </label>
            <select
              className="input_type"
              id={`ddlRelationwithInsured${variantIndex}`}
              onChange={e => this.handelRelationwithInsured(e, travellerProfileID, variantIndex)}
            >
              {proposerRelations &&
                proposerRelations.map(relation => {
                  const { masterID, name } = relation;
                  return (
                    <option
                      value={masterID}
                      selected={
                        age > 18
                          ? masterID === proposerRelationID
                          : proposerRelationID !== 1 &&
                            proposerRelationID !== 5 &&
                            proposerRelationID !== 6
                            ? masterID === proposerRelationID
                            : 0
                      }
                      disabled={
                        age < 18 && (masterID === 1 || masterID === 5 || masterID === 6)
                          ? true
                          : false
                      }
                    >
                      {name}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
      </div>
    );
  }

  copyFirstProposerToAllProposer() {
    let { travellerData, pincodeCity, proposersPincodeCity } = this.state;
    let { proposers } = travellerData;
    const travellerProfileID = travellerData.variants[0].members[0].profileID;
    let firstProposer = proposers.filter(proposer => proposer.profileID === travellerProfileID);
    let {
      fullName: firstProposer_fullName,
      dateOfBirth: firstProposer_dateOfBirth,
      emailID: firstProposer_emailID,
      address: firstProposer_address,
      zipCode: firstProposer_zipCode,
      city: firstProposer_city,
      cityID: firstProposer_cityID,
      alternateMobileNo: firstProposer_alternateMobileNo,
      genderID: firstProposer_genderID,
      profileID: firstProposer_profileID
    } = firstProposer[0];
    const propserPincodecityData = proposersPincodeCity.filter(
      x => x.profileID === firstProposer_profileID
    )[0];

    proposers.forEach((proposer, propserIndex) => {
      let {
        fullName,
        dateOfBirth,
        emailID,
        address,
        zipCode,
        city,
        cityID,
        alternateMobileNo,
        profileID,
        genderID
      } = proposer;

      if (firstProposer_profileID !== profileID) {
        if (!fullName) {
          travellerData.proposers[propserIndex].fullName = firstProposer_fullName;
        }
        if (genderID == 0) {
          travellerData.proposers[propserIndex].genderID = firstProposer_genderID;
        }
        if (!dateOfBirth) {
          travellerData.proposers[propserIndex].dateOfBirth = firstProposer_dateOfBirth;
        }
        if (!emailID) {
          travellerData.proposers[propserIndex].emailID = firstProposer_emailID;
        }
        if (!address) {
          travellerData.proposers[propserIndex].address = firstProposer_address;
        }
        if (!zipCode) {
          travellerData.proposers[propserIndex].zipCode = firstProposer_zipCode;
        }
        if (!city) {
          const proposerLength = proposersPincodeCity.filter(x => x.profileID === profileID).length;
          if (proposerLength === 0) {
            proposersPincodeCity.push({
              profileID,
              pincodeCity: propserPincodecityData && propserPincodecityData.pincodeCity
            });
          } else {
            proposersPincodeCity.map(x => {
              if (x.profileID === profileID) {
                x.pincodeCity = propserPincodecityData && propserPincodecityData.pincodeCity;
              }
            });
          }

          travellerData.proposers[propserIndex].city = firstProposer_city;
        }
        if (cityID === 0) {
          travellerData.proposers[propserIndex].cityID = firstProposer_cityID;
        }
        if (!alternateMobileNo) {
          travellerData.proposers[propserIndex].alternateMobileNo = firstProposer_alternateMobileNo;
        }
      }
    });

    this.setState({
      travellerData,
      pincodeCity,
      proposersPincodeCity
    });
  }

  showProposalStep1Data = () => {
    let travellersDOB = [];
    const { travellerData } = this.state;
    const { variants } = travellerData;
    variants &&
      variants.length > 0 &&
      variants.map(variant => {
        const { members } = variant;
        members.map(member => {
          const { dateOfBirth, denoteTraveller, relationTypeID, relationType, age } = member;
          travellersDOB.push({ dateOfBirth, denoteTraveller, relationTypeID, relationType, age });
        });
      });

    travellersDOB.sort(function (a, b) {
      if (a.denoteTraveller && b.denoteTraveller) {
        let travellerA = a.denoteTraveller.toLowerCase();
        let travellerB = b.denoteTraveller.toLowerCase();
        if (travellerA < travellerB)
          //sort string ascending
          return -1;
        if (travellerA > travellerB) return 1;
      }
      return 0;
    });



    if (travellersDOB.length > 0) {
      return (
        <>
          {travellersDOB.map((x, index) => {
            const { dateOfBirth, denoteTraveller, relationTypeID, relationType, age } = x;

            return (
              <div className="form-group col-md-3 col-6">
                <p>
                  <span className="title">{`${denoteTraveller} `}</span>{" "}
                  {`(${relationTypeID !== 11 ? `${relationType}, ` : ""}${age} Yrs)`}
                </p>
                <p>{`${moment(dateOfBirth, "YYYY-MM-DD").format("DD MMM, YYYY")}`}</p>
              </div>
            );
          })}
        </>
      );
    } else {
      return null;
    }
  };

  capitalizeText = text => {
    if (!text) return "";
    let textArr = text.split(" ");
    const modifiedText = textArr.map(str => _.capitalize(str));
    return modifiedText.join(" ");
  };

  renderQuestionFields = (question, variantIndex, memberIndex) => {
    const {
      travellerData
    } = this.state;
    const {
      variants
    } = travellerData;
    const { insurerID } = variants[variantIndex];
    const { errors } = this.state;
    const { questionID, question: name, answer, controlType, isAllowedToHide, questionType } = question;

    const index = errors.variantsErrors[variantIndex][memberIndex].questionError.findIndex(
      x => x.questionID === questionID
    );

    if (controlType === 1) {
      return (
        <div className={`col-md-3 p0  ${isAllowedToHide === true ? "hide" : "show"}`}>
          <div style={{ whiteSpace: "nowrap" }}>
            <label for={`txtlabelquestion_${question.questionID}_${memberIndex}_${variantIndex}`}>
              {name}
            </label>
          </div>
        </div>
      );
    } else if (controlType === 2) {
      return (
        <div className={`questionBlock ${isAllowedToHide === true ? "hide" : "show"}`}>
          <label htmlFor="ques1">{name}</label>
          <div className="slider">
            <input
              checked={answer === true.toString()}
              type="checkbox"
              id={`toggelquestion_${question.questionID}_${memberIndex}_${variantIndex}`}
              className="switch-input"
              onChange={() => this.handelQuestiontoggel(question, variantIndex, memberIndex)}
            />
            <label
              htmlFor={`toggelquestion_${question.questionID}_${memberIndex}_${variantIndex}`}
              className="switch-label"
              id=""
            />
          </div>
        </div>
      );
    } else if (controlType === 3) {
      return (
        <div
          className={`pro_check_box 
                ${isAllowedToHide === true ? "hide" : "show"}
                ${errors &&
            errors.variantsErrors[variantIndex][memberIndex] &&
            errors.variantsErrors[variantIndex][memberIndex].questionError &&
            errors.variantsErrors[variantIndex][memberIndex].questionError.length > 0 &&
            errors.variantsErrors[variantIndex][memberIndex].questionError[index] &&
            (errors.variantsErrors[variantIndex][memberIndex].questionError[index].valid ===
              false
              ? "error_proposal"
              : "")}
                `}
        >
          <input
            className="magic-checkbox"
            type="checkbox"
            name="layout"
            id={`chkquestion_${question.questionID}_${memberIndex}_${variantIndex}`}
            value="option"
            checked={answer !== null}
            onChange={() => this.handelPedCheckBox(question, variantIndex, memberIndex)}
          />
          <label
            className={`text text_p2`}
            htmlFor={`chkquestion_${question.questionID}_${memberIndex}_${variantIndex}`}
          >
            {name}
          </label>
        </div>
      );
    } else if (controlType === 4) {
      return (
        <div className={`${insurerID !== 4 && insurerID !== 14 && insurerID !== 22 && insurerID !== 7 ? 'col-md-3 p0 fieldBlock numbered' : ''}`}>
          <div

            className={`${insurerID !== 4 && insurerID !== 14 && insurerID !== 22 && insurerID !== 7 ? 'field' : ''} ${errors &&
              errors.variantsErrors[variantIndex][memberIndex] &&
              errors.variantsErrors[variantIndex][memberIndex].questionError &&
              errors.variantsErrors[variantIndex][memberIndex].questionError.length > 0 &&
              errors.variantsErrors[variantIndex][memberIndex].questionError[index] &&
              (errors.variantsErrors[variantIndex][memberIndex].questionError[index].valid === false
                ? "error_proposal"
                : "")}
                    `}
          >
            <input
              type="text"
              value={answer}
              onChange={e => this.handelPedTextbox(e, question, variantIndex, memberIndex)}
              id={`txtquestion_${question.questionID}_${memberIndex}_${variantIndex}`}
              autoComplete="off"
              className={`${insurerID === 4 || insurerID === 14 || insurerID === 22 || insurerID === 7 ? 'tempHdfcTextbox' : ''}`}
            />
            {/* <label for={`txtquestion_${question.questionID}_${memberIndex}_${variantIndex}`}>
              {questionType === 1 ? 'Enter Disease' : ''}
            </label> */}
          </div>
        </div>
      );
    }
  };

  handelQuestiontoggel = (question, variantIndex, memberIndex) => {
    let { travellerData, errors } = this.state;
    const questionIndex = travellerData.variants[variantIndex].members[
      memberIndex
    ].questions.findIndex(x => x.questionID === question.questionID);
    if (questionIndex !== -1) {
      let { answer } = question;
      travellerData.variants[variantIndex].members[memberIndex].questions[questionIndex].answer =
        answer === true.toString() ? false.toString() : true.toString();
      question.answer = answer === true.toString() ? false.toString() : true.toString();
    }

    this.setState(
      {
        travellerData,
        errors
      },
      () => {
        question.parentQuestionID === 0 &&
          question.answer === "false" &&
          this.clearChildanswersIfParentAnswereFalse(question, variantIndex, memberIndex);
      }
    );
  };

  clearChildanswersIfParentAnswereFalse = (question, variantIndex, memberIndex) => {
    let { travellerData, errors } = this.state;
    travellerData.variants[variantIndex].members[memberIndex].questions.map((x, questionIndex) => {
      if (x.parentQuestionID === question.questionID) {
        if (x.controlType === 4) {
          errors.variantsErrors[variantIndex][memberIndex].questionError.map(y => {
            if (y.controlType === 4 && y.parentQuestionID === question.questionID) {
              y.valid = true;
            }
          });

          travellerData.variants[variantIndex].members[memberIndex].questions[
            questionIndex
          ].answer = "";
        } else {
          travellerData.variants[variantIndex].members[memberIndex].questions[
            questionIndex
          ].answer = null;
        }
      }
    });

    this.setState({
      travellerData
    });
  };

  handelPedCheckBox = (question, variantIndex, memberIndex) => {
    let { travellerData, errors } = this.state;
    const questionIndex = travellerData.variants[variantIndex].members[
      memberIndex
    ].questions.findIndex(x => x.questionID === question.questionID);
    if (questionIndex !== -1) {
      let { answer, question: name } = question;
      // travellerData.variants[variantIndex].members[memberIndex].questions[questionIndex].answer = answer === true.toString() ? false.toString() : true.toString();
      // question.answer = answer === true.toString() ? false.toString() : true.toString();
      travellerData.variants[variantIndex].members[memberIndex].questions[questionIndex].answer =
        answer === name ? null : name;
      question.answer = answer === name ? null : name;
      errors.variantsErrors[variantIndex][memberIndex].questionError.length > 0 &&
        errors.variantsErrors[variantIndex][memberIndex].questionError.map(x => {
          if (x.parentQuestionID === question.parentQuestionID) x.valid = true;
        });
      errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = true;
    }
    this.setState(
      {
        travellerData,
        errors
      },
      () => {
        question.answer === null &&
          this.clearChildanswersIfParentAnswereFalse(question, variantIndex, memberIndex);
      }
    );
  };

  handelPedTextbox = (e, question, variantIndex, memberIndex) => {
    let { travellerData, errors } = this.state;
    const questionIndex = travellerData.variants[variantIndex].members[
      memberIndex
    ].questions.findIndex(x => x.questionID === question.questionID);
    if (questionIndex !== -1) {
      let { answer } = question;
      travellerData.variants[variantIndex].members[memberIndex].questions[
        questionIndex
      ].answer = e.target.value.trimLeft();
      errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex].valid = true;
      errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = true;
    }
    this.setState({
      travellerData,
      errors
    });
  };
  handleShowLiveChat = type => {
    this.setState({
      showLiveChat: type
    });
  };

  handleKeyPress = (e, variantIndex, memberIndex) => {
    if (e.key === "Tab") {
      if (e.target === document.querySelectorAll('[tabIndex="proposer_date"]')[0]) {
      }
    }
  };

  handleDateKeyPress = (e, variantIndex, memberIndex) => {
    e.preventDefault();
    if (e.key === "Tab") {
      e.preventDefault();
      const ele = document.querySelectorAll(
        `[tabindex="proposerEmail${variantIndex}${memberIndex}"]`
      );
      if (ele[0]) {
        if (this.refs && this.refs[`proposaldatePicker${variantIndex}${memberIndex}`]) {
          this.refs[`proposaldatePicker${variantIndex}${memberIndex}`].setOpen(false);
        }
        ele[0].focus();
      }
    }
    if (e.key === "Backspace") {
      e.preventDefault();
    }
  };

  handleDateKeyPress2 = (e, variantIndex, memberIndex) => {
    e.preventDefault();
    if (e.key === "Tab") {
      e.preventDefault();
      const ele = document.querySelectorAll(`#txtNomineeName${variantIndex}${memberIndex}`);
      if (ele[0]) {
        if (this.refs && this.refs[`insurerDatePicker${variantIndex}${memberIndex}`]) {
          this.refs[`insurerDatePicker${variantIndex}${memberIndex}`].setOpen(false);
        }

        ele[0].focus();
      }
    }
    if (e.key === "Backspace") {
      e.preventDefault();
    }
  };

  handleDateKeyPress3 = (e, variantIndex, memberIndex) => {
    e.preventDefault();
    if (e.key === "Tab") {
      if (this.refs && this.refs[`studentdatePicker${variantIndex}${memberIndex}`]) {
        this.refs[`studentdatePicker${variantIndex}${memberIndex}`].setOpen(false);
      }
    }
    if (e.key === "Backspace") {
      e.preventDefault();
    }
  };

  handleGenderKeyPress = e => {
    // console.log("Keyboard compliance >>3", e.key, e.target);
  };

  handleStudentDetailsChange = (e, variantIndex, memberIndex, master, field) => {
    const { travellerData, errors } = this.state;
    const { studentDetails } = travellerData.variants[variantIndex].members[memberIndex];
    const details = {
      ...studentDetails
    };
    if (field === "dob") {
      details[master] = e;
      errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
      errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
    } else if (field === "name") {
      let { value } = e.target;
      if (!/[a-zA-Z\s.]+$/i.test(value) && value.length < 3) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks =
          "*Full Name Required (characters and spaces only)";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = false;
      } else if (value.length >= 3) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      } else if (value.length === 1 && /[a-zA-Z\s.]+$/i.test(value)) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      }
      value = value.replace(/([^a-zA-Z.\s]+)/g, "");
      details[master] = value;
    } else if (field === "address") {
      let { value } = e.target;
      if (!/[a-zA-Z0-9/.#(),-\s]+$/i.test(value) && value.length < 3) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks =
          "*Please enter valid characters";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = false;
      } else if (value.length >= 3) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      } else if (value.length === 1 && /[a-zA-Z.#(),-/0-9\s]+$/i.test(value)) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      }
      value = value.replace(/([^a-zA-Z.#(),-/0-9\s]+)/g, "");
      details[master] = value;
    } else if (field === "number") {
      let { value } = e.target;
      if (!/[0-9]+$/i.test(value) && value.length < 3) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks =
          "*Please enter valid characters";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = false;
      } else if (value.length >= 3) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      } else if (value.length === 1 && /[0-9]+$/i.test(value)) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      }
      value = value.replace(/([^0-9]+)/g, "");
      details[master] = value;
    } else if (field === "duration") {
      let { value } = e.target;
      if (!/[a-zA-Z0-9.(),-\s]+$/i.test(value) && value.length < 3) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks =
          "*Please enter valid characters";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = false;
      } else if (value.length >= 3) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      } else if (value.length === 1 && /[a-zA-Z.(),-0-9\s]+$/i.test(value)) {
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      }
      value = value.replace(/([^a-zA-Z.(),0-9\s]+)/g, "");
      details[master] = value;
    } else if (field === "select") {
      if (e.target.value !== 0) {
        details[master] = e.target.value;
        errors.variantsErrors[variantIndex][memberIndex][master].remarks = "";
        errors.variantsErrors[variantIndex][memberIndex][master].valid = true;
      }
    }

    travellerData.variants[variantIndex].members[memberIndex].studentDetails = details;
    this.setState({
      travellerData,
      errors
    });
  };

  renderStudentDetails = (
    profileTypeID,
    insurerID,
    variantIndex,
    variantsErrors,
    memberIndex,
    nomineeRelations
  ) => {
    let studentFields = StudentDetails[insurerID];
    const { travellerData } = this.state;
    const { studentDetails } = travellerData.variants[variantIndex].members[memberIndex];
    
    if (!studentFields) {
      return;
    }
    return (
      <>
        <h3>Student Details</h3>
        <div className="row">
          {studentFields.map(fields => {
            const { name, type, master, field } = fields;
            if (type === "text") {
              return (
                <div className="col-md-6 fieldBlock">
                  <div
                    className={`field ${variantsErrors &&
                      variantsErrors[variantIndex] &&
                      (variantsErrors[variantIndex][memberIndex][master].valid
                        ? ""
                        : "error_proposal")}`}
                  >
                    <input
                      type="text"
                      required
                      id={`${master}${variantIndex}${memberIndex}`}
                      value={studentDetails && studentDetails[master]}
                      onChange={e =>
                        this.handleStudentDetailsChange(e, variantIndex, memberIndex, master, field)
                      }
                    />
                    <label for={`${master}${variantIndex}${memberIndex}`}>{name}</label>
                  </div>
                  {variantsErrors &&
                    variantsErrors[variantIndex] &&
                    variantsErrors[variantIndex][memberIndex][master].remarks ? (
                      <span style={{ color: "red", fontSize: "12px" }}>
                        {variantsErrors[variantIndex][memberIndex][master].remarks}
                      </span>
                    ) : null}
                </div>
              );
            } else if (type === "dropdown") {
              const { dropdownType } = fields;
              let dropdownData = [];
              let ddlkey="";
              if (dropdownType === "Relationship") {
                dropdownData = nomineeRelations;
                ddlkey= studentDetails && studentDetails.sponsorRelation;
                
              } else if (dropdownType === "Duration") {
                dropdownData = courseDuration;
                ddlkey= studentDetails &&  studentDetails.courseDuration
              } else if (dropdownType === "Country") {
                dropdownData = countryData;
                ddlkey= studentDetails && studentDetails.sponsorCountryCode
              }
              return (
                <div className="col-md-6">
                  <div
                    className={`pro_box select ${variantsErrors &&
                      variantsErrors[variantIndex] &&
                      (variantsErrors[variantIndex][memberIndex][master].valid
                        ? ""
                        : "error_proposal")}`}
                  >
                    <label htmlFor={`${master}${variantIndex}${memberIndex}`}>{name}</label>
                    <select
                      className="input_type"
                      id={`${master}${variantIndex}${memberIndex}`}
                      onChange={e =>
                        this.handleStudentDetailsChange(e, variantIndex, memberIndex, master, field)
                      }
                      
                    >
                      {dropdownData.map(relation => {
                        const { masterID, name } = relation;
                        return <option 
                        selected={studentDetails && ddlkey && ddlkey === masterID.toString()}
                        value={masterID}
                        >{name}</option>;
                      })}
                    </select>
                  </div>
                  {variantsErrors &&
                    variantsErrors[variantIndex] &&
                    variantsErrors[variantIndex][memberIndex][master].remarks ? (
                      <span style={{ color: "red", fontSize: "12px" }}>
                        {variantsErrors[variantIndex][memberIndex][master].remarks}
                      </span>
                    ) : null}
                </div>
              );
            } else if (type === "dob") {
              return (
                <div className={`col-md-6 calender_icon fieldBlock`}>
                  <DatePicker
                    ref={`studentdatePicker${variantIndex}${memberIndex}`}
                    selected={
                      studentDetails && studentDetails[master]
                        ? moment(studentDetails[master]).toDate()
                        : null
                    }
                    onChange={e =>
                      this.handleStudentDetailsChange(e, variantIndex, memberIndex, master, field)
                    }
                    dateFormat={"d MMM yy"}
                    placeholderText={name}
                    showYearDropdown
                    scrollableYearDropdown
                    dropdownMode="select"
                    onKeyDown={e => this.handleDateKeyPress3(e, variantIndex, memberIndex)}
                    showMonthDropdown={true}
                    className={`selectCalenderDate input_type ${variantsErrors &&
                      variantsErrors[variantIndex] &&
                      (variantsErrors[variantIndex][memberIndex][master].valid
                        ? ""
                        : "error_proposal")}`}
                  />
                  {variantsErrors &&
                    variantsErrors[variantIndex] &&
                    variantsErrors[variantIndex][memberIndex][master].remarks ? (
                      <span style={{ color: "red", fontSize: "12px" }}>
                        {variantsErrors[variantIndex][memberIndex][master].remarks}
                      </span>
                    ) : null}
                </div>
              );
            }
          })}
        </div>
      </>
    );
  };

  renderRelianceParentQuestion = (question, variantIndex, memberIndex) => {
    const { errors } = this.state;
    const { questionID, question: name, answer, controlType } = question;

    if (controlType === 2) {
      return (
        <div className="questionBlock">
          <label htmlFor="ques1">{name}</label>
          <div className="slider">
            <input
              checked={answer === true.toString()}
              type="checkbox"
              id={`toggelreliancequestionqq_${question.questionID}_${memberIndex}_${variantIndex}`}
              className="switch-input"
              onChange={() => {
                this.handelCustomeQuestiontoggel(question, variantIndex, memberIndex);
              }}
            />
            <label
              htmlFor={`toggelreliancequestionqq_${question.questionID}_${memberIndex}_${variantIndex}`}
              className="switch-label"
              id=""
            />
          </div>
        </div>
      );
    }
    if (controlType === 1) {
      return (
        <div className="col-md-3 p0 ">
          <div style={{ whiteSpace: "nowrap" }}>
            <label
              for={`txtreliancelabelquestion_${question.questionID}_${memberIndex}_${variantIndex}`}
            >
              {name}
            </label>
          </div>
        </div>
      );
    }
  };

  handelCustomeQuestiontoggel = (question, variantIndex, memberIndex) => {
    let { travellerData, errors } = this.state;
    const questionIndex = travellerData.variants[variantIndex].members[
      memberIndex
    ].questions.findIndex(x => x.questionID === question.questionID);
    if (questionIndex !== -1) {
      let { answer } = question;
      travellerData.variants[variantIndex].members[memberIndex].questions[questionIndex].answer =
        answer === true.toString() ? false.toString() : true.toString();
      question.answer = answer === true.toString() ? false.toString() : true.toString();
    }

    this.setState(
      {
        travellerData,
        errors
      },
      () => {
        question.answer === "false" &&
          this.clearRelianceChildanswersIfParentAnswereFalse(question, variantIndex, memberIndex);
      }
    );
  };

  clearRelianceChildanswersIfParentAnswereFalse = (question, variantIndex, memberIndex) => {
    let { travellerData } = this.state;
    let diseaseData = travellerData.variants[variantIndex].members[memberIndex].customDiseases;
    if (diseaseData && diseaseData.length > 0) {
      const { insuredMemberID, questionID } = travellerData.variants[variantIndex].members[
        memberIndex
      ].customDiseases[0];

      travellerData.variants[variantIndex].members[memberIndex].customDiseases = [
        {
          insuredMemberID,
          questionID,
          diseaseName: null,
          sufferingSince: null,
          isUnderMedication: 3
        },
        {
          insuredMemberID,
          questionID,
          diseaseName: null,
          sufferingSince: null,
          isUnderMedication: 3
        },
        {
          insuredMemberID,
          questionID,
          diseaseName: null,
          sufferingSince: null,
          isUnderMedication: 3
        }
      ];

      this.setState({
        travellerData
      });
    }
  };

  renderReliancePedGrid(parentQuestion, variantIndex, memberIndex) {
    const {
      questionID: parentQuestionID,
      question: name,
      answer,
      controlType,
      zOrder
    } = parentQuestion;
    const { errors, relianceDateQuestions, travellerData } = this.state;
    const {
      // customDiseases,
      questions
    } = travellerData.variants[variantIndex].members[memberIndex];

    const questionIndex = questions.findIndex(x => x.questionID === parentQuestionID);
    const { customDiseases } = travellerData.variants[variantIndex].members[memberIndex].questions[
      questionIndex
    ];

    let years = ["Select"];
    for (let i = 0; i < 50; i++) {
      years.push(
        moment()
          .subtract(i, "year")
          .year()
      );
    }
    const months = [
      { id: "00", value: "Select" },
      { id: "01", value: "January" },
      { id: "02", value: "Feburary" },
      { id: "03", value: "March" },
      { id: "04", value: "April" },
      { id: "05", value: "May" },
      { id: "06", value: "June" },
      { id: "07", value: "July" },
      { id: "08", value: "August" },
      { id: "09", value: "September" },
      { id: "10", value: "October" },
      { id: "11", value: "November" },
      { id: "12", value: "December" }
    ];

    return (
      <div>
        {customDiseases &&
          customDiseases.length > 0 &&
          customDiseases.map((customDisease, index) => {
            const {
              insuredMemberID,
              questionID,
              diseaseName,
              sufferingSince,
              isUnderMedication
            } = customDisease;
            return (
              <div className="row">
                <div className="col-md-4 fieldBlock">
                  <div
                    className={`field ${
                      errors.variantsErrors &&
                        errors.variantsErrors[variantIndex] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError[index] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError[index].diseaseNameValid === false
                        ? "error_proposal"
                        : ""
                      }
                               
                                        }`}

                  >
                    <input
                      type="text"
                      value={diseaseName}
                      onChange={e =>
                        this.handelRelianceDiseaseName(
                          e,
                          variantIndex,
                          memberIndex,
                          index,
                          parentQuestion
                        )
                      }
                      id={`txtquestion_${insuredMemberID}_${questionID}_${index}`}
                    />
                    <label for={`txtquestion_${insuredMemberID}_${questionID}_${index}`}>
						{lang.DiseaseName}
                    </label>
                  </div>
                  {/* errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = false;
                errors.variantsErrors[variantIndex][memberIndex].customeDiseaseError[0].diseaseNameValid = false; */}
                </div>
                <div className="col-md-3">
                  <div
                    id={`ddlquestion_${insuredMemberID}_${sufferingSince}_month_${index}`}
                    className={`pro_box select ${
                      errors.variantsErrors &&
                        errors.variantsErrors[variantIndex] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError[index] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError[index].sufferingSinceMonthValid === false
                        ? "error_proposal"
                        : ""
                      }
                                        `}
                  >
                    <label>{lang.month}</label>
                    <select
                      className="input_type"
                      onChange={e =>
                        this.handelRelianceSelectbox(
                          e,
                          variantIndex,
                          memberIndex,
                          index,
                          "month",
                          parentQuestion
                        )
                      }
                    >
                      {months.map(month => {
                        const { id, value } = month;
                        return (
                          <option
                            selected={sufferingSince && sufferingSince.slice(0, 2) === id}
                            value={id}
                          >
                            {value}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div
                    className={`pro_box select ${
                      errors.variantsErrors &&
                        errors.variantsErrors[variantIndex] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError[index] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError[index].sufferingSinceYearValid === false
                        ? "error_proposal"
                        : ""
                      }
                                    `}
                  >
                    <label>{lang.year}</label>
                    <select
                      id={`ddlquestion_${insuredMemberID}_${sufferingSince}_year_${index}`}
                      className="input_type"
                      onChange={e =>
                        this.handelRelianceSelectbox(
                          e,
                          variantIndex,
                          memberIndex,
                          index,
                          "year",
                          parentQuestion
                        )
                      }
                    >
                      {years.map(year => {
                        return (
                          <option
                            selected={
                              sufferingSince &&
                              sufferingSince.slice(-2) === year.toString().slice(-2)
                            }
                            value={year.toString().slice(-2)}
                          >
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="col-md-2">
                  <div
                    className={`pro_box select ${
                      errors.variantsErrors &&
                        errors.variantsErrors[variantIndex] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError[index] &&
                        errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
                          .customeDiseaseError[index].isUnderMedicationValid === false
                        ? "error_proposal"
                        : ""
                      }
                                    `}
                  >
                    <label>{lang.UnderMedication}</label>
                    <select
                      id={`ddlquestion_${insuredMemberID}_${isUnderMedication}_${index}`}
                      className="input_type"
                      onChange={e =>
                        this.handelisUnderMedicationbox(
                          e,
                          variantIndex,
                          memberIndex,
                          index,
                          parentQuestion
                        )
                      }
                    >
                      <option value={null}>Select</option>
                      <option selected={isUnderMedication === true} value={1}>
                        Yes
                      </option>
                      <option selected={isUnderMedication === false} value={0}>
                        No
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        <div className={`row ${customDiseases && customDiseases.length > 0 ? "show" : "hide"}`}>
          <div className="col-md-12">
            <button
              className="proposal_add_row"
              onClick={() => {
                this.addRelianceDateQuestionsRow(variantIndex, memberIndex, parentQuestion);
              }}
            >
              Add Row
            </button>
          </div>
        </div>
      </div>
    );
  }

  addRelianceDateQuestionsRow = (variantIndex, memberIndex, parentQuestion) => {
    let { travellerData, errors } = this.state;

    const index = travellerData.variants[variantIndex].members[memberIndex].questions.findIndex(
      x => x.questionID === parentQuestion.questionID
    );
    const { customDiseases } = travellerData.variants[variantIndex].members[memberIndex].questions[
      index
    ];

    const {
      insuredMemberID,
      questionID,
      diseaseName,
      sufferingSince,
      isUnderMedication
    } = customDiseases[0];
    customDiseases.push({
      insuredMemberID,
      questionID,
      diseaseName: null,
      sufferingSince: null,
      isUnderMedication: 3
    });
    errors.variantsErrors[variantIndex][memberIndex].questionError[index].customeDiseaseError.push({
      valid: true,
      diseaseNameValid: true,
      sufferingSinceMonthValid: true,
      sufferingSinceYearValid: true,
      isUnderMedicationValid: true
    });
    this.setState({
      customDiseases,
      errors
    });
  };

  handelRelianceDiseaseName = (e, variantIndex, memberIndex, index, parentQuestion) => {
    let { travellerData, errors } = this.state;
    const questionIndex = travellerData.variants[variantIndex].members[
      memberIndex
    ].questions.findIndex(x => x.questionID === parentQuestion.questionID);
    let { value } = e.target;
    if (
      errors.variantsErrors &&
      errors.variantsErrors[variantIndex] &&
      errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
        .customeDiseaseError &&
      errors.variantsErrors[variantIndex][memberIndex].questionError[questionIndex]
        .customeDiseaseError[index]
    ) {
      errors.variantsErrors[variantIndex][memberIndex].questionError[
        questionIndex
      ].customeDiseaseError[index].diseaseNameValid = true;
      errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = true;
      errors.variantsErrors[variantIndex][memberIndex].questionError[
        questionIndex
      ].customeDiseaseError[index].valid = true;
    }

    travellerData.variants[variantIndex].members[memberIndex].questions[
      questionIndex
    ].customDiseases[index].diseaseName = value;
    this.setState({
      travellerData,
      errors
    });
  };

  handelRelianceSelectbox = (e, variantIndex, memberIndex, index, dateType, parentQuestion) => {
    let { travellerData, errors } = this.state;
    const questionIndex = travellerData.variants[variantIndex].members[
      memberIndex
    ].questions.findIndex(x => x.questionID === parentQuestion.questionID);

    let { value } = e.target;
    let data =
      travellerData.variants[variantIndex].members[memberIndex].questions[questionIndex]
        .customDiseases[index].sufferingSince;
    if (dateType === "month") {
      errors.variantsErrors[variantIndex][memberIndex].questionError[
        questionIndex
      ].customeDiseaseError[index].valid = true;
      errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = true;
      errors.variantsErrors[variantIndex][memberIndex].questionError[
        questionIndex
      ].customeDiseaseError[index].sufferingSinceMonthValid = true;

      if (!data) {
        travellerData.variants[variantIndex].members[memberIndex].questions[
          questionIndex
        ].customDiseases[index].sufferingSince = value + " ";
      } else if (data.length >= 2) {
        travellerData.variants[variantIndex].members[memberIndex].questions[
          questionIndex
        ].customDiseases[index].sufferingSince = value + data.slice(2);
      }
    } else if (dateType === "year") {
      errors.variantsErrors[variantIndex][memberIndex].questionError[
        questionIndex
      ].customeDiseaseError[index].valid = true;
      errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = true;
      errors.variantsErrors[variantIndex][memberIndex].questionError[
        questionIndex
      ].customeDiseaseError[index].sufferingSinceYearValid = true;

      if (!data) {
        travellerData.variants[variantIndex].members[memberIndex].questions[
          questionIndex
        ].customDiseases[index].sufferingSince = "   " + value;
      } else if (data.length >= 2) {
        travellerData.variants[variantIndex].members[memberIndex].questions[
          questionIndex
        ].customDiseases[index].sufferingSince = data.slice(0, 3) + value;
      }
    }

    this.setState({
      travellerData,
      errors
    });
  };

  handelisUnderMedicationbox = (e, variantIndex, memberIndex, index, parentQuestion) => {
    let { travellerData, errors } = this.state;
    const questionIndex = travellerData.variants[variantIndex].members[
      memberIndex
    ].questions.findIndex(x => x.questionID === parentQuestion.questionID);

    let { value } = e.target;
    travellerData.variants[variantIndex].members[memberIndex].questions[
      questionIndex
    ].customDiseases[index].isUnderMedication = parseInt(value, 10);
    errors.variantsErrors[variantIndex][memberIndex].questionError[
      questionIndex
    ].customeDiseaseError[index].valid = true;
    errors.variantsErrors[variantIndex][memberIndex].isPedError.valid = true;
    errors.variantsErrors[variantIndex][memberIndex].questionError[
      questionIndex
    ].customeDiseaseError[index].isUnderMedicationValid = true;

    this.setState({
      travellerData
    });
  };

  traversePincodes = (e,id=null) => {
    if (e.key === "ArrowDown") {

      const element = document.getElementById("liPincode"+id);
       element.style.backgroundColor='#0065ff'
      element.focus();
    }
  }

  handleListKeyPress = (e, id, pincode,profileID) =>{
    if(e.key === 'ArrowDown'){
      e.preventDefault()
      let nextInput = document.querySelector('[tabindex='+'"'+(id+1)+ '"'+']')
      if(!nextInput){
        nextInput = document.querySelector('[tabindex="1"]');
      }
      nextInput.previousElementSibling.style.backgroundColor='';
      nextInput.style.backgroundColor='#0065ff';
      nextInput.focus();
    }
    if(e.key==='Enter'){
      this.handelAutoCompleteProposerZipCode(pincode, profileID)
    }
    
  }

  render() {
    const {
      travellerData,
      pincodeMaster,
      pincodeCity,
      proposersPincodeCity,
      errors,
      submittProceedSpinnerShowHide,
      saveTravellerSpinnerShowHide,
      submitProposalSpinnerShowHide,
      submitTravellerSpinnerShowHide,
      toastShowHide,
      toastFlag,
      toastText,
      customerTotalPremium,
      totalMember,
      showLiveChat,
      show8thLiApperance,
      screenSize
    } = this.state;

    const {
      variants,
      customer,
      proposers,
      proposerID,
      proposerRelations,
      nomineeRelations,
      enquiryID
    } = travellerData;

    const { encryptedProposerId } = this.props;

    if (variants && customer) {
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
        zipCode,
        alternateMobileNo,
        landmark
      } = customer;

      const { proposerErrors, variantsErrors } = errors;

      return (
        <form autoComplete="off">
          <div>
            <Header handleShowLiveChat={this.handleShowLiveChat} />
            <div className="proposal_form_wrapper proposal_step2">
              <div className="container">
                <EditModal page="ProposalStep2" {...this.props} />
                <div className="proposal_Step2_Back_Container">
                  <div className="row traveller">
                    {this.showProposalStep1Data()}

                    <div className="form-group col-md-3 col-6  edit">
                      <i
                        className="editBtn_ProposalStep1"
                        onClick={() =>
                          this.props.history.push(`/v2/proposalStep1/${encryptedProposerId}`)
                        }
                      >
                        Edit
                      </i>
                    </div>
                  </div>
                </div>

                {variants &&
                  variants.map((variant, variantIndex) => {
                    let {
                      profileTypeID,
                      planName,
                      logoURL,
                      sumInsured,
                      premium,
                      geography,
                      membersCovered,
                      members,
                      productDetailIcon,
                      showHideProductDetailDiv,
                      policyCount
                    } = variant;

                    return (
                      <div>
                        <div
                          className={`customer_detail ${
                            variants && variants.length > 1 ? "show" : "hide"
                          }`}
                        >
                          <h2> {`${lang.plan} ${variantIndex + 1}`}</h2>
                        </div>
                        <div className="insurer_details white_box">
                          <div className="insuer_card acc_card checkout_card">
                            <div className="toggleArrow">
                              <div
                                className={productDetailIcon}
                                onClick={() => this.handelShowHideProductDetail(variantIndex)}
                              ></div>
                            </div>

                            <div className="row align-items-center inurer_table">
                              <div className="form-group col-md-3 col-6">
                                <img src={logoURL} alt="no image loaded..." />
                              </div>

                              <div className="planName form-group col-md-3 col-12">
                                {/* <label>{lang.planName}</label> */}
                                <p>{planName}</p>
                              </div>

                              <div className="form-group col-md-3 col-6">
                                <label>{lang.sumInsured}</label>
                                <p className="value">{`$ ${sumInsured &&
                                  sumInsured.toLocaleString()}`}</p>
                              </div>

                              <div className="form-group col-md-3 col-6">
                                <label>{lang.premium}</label>
                                <p className="value">
                                  &#8377; {premium && Math.round(premium / 1.18).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`row align-items-center ac_list acc_content product_detail ${showHideProductDetailDiv}`}
                            >
                              <div className="form-group col-md-3 col-12 proDetails productDetailLink">
                                {lang.productDetail} <i class="arrow right_arrow"></i>
                              </div>
                              <div className="form-group col-md-3 col-6">
                                <label>{lang.geographicalCoverage}</label>
                                <p className="value">{geography}</p>
                              </div>
                              <div className="form-group col-md-3 col-6">
                                <label>{lang.membersCovered}</label>
                                <p className="value">{membersCovered}</p>
                              </div>
                              <div className="form-group col-md-3 col-6">
                                <label>{lang.policyCount}</label>
                                <p className="value">{policyCount}</p>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "none" }} className="addons_detail acc-card">
                            <h3>Add-On</h3>
                            <p>
                              You should get these additional benefits to enhance your current plan
                            </p>
                            <div className="row">
                              <div className="col-md-6">
                                <h4>Package 1</h4>
                                <div className="addon_card">
                                  <ul className="cards_header">
                                    <li>BENEFITS</li>
                                    <li>SUM INSURED</li>
                                    <li>PREMIUM</li>
                                  </ul>
                                  <ul className="cards_details_three">
                                    <li>Travel Inconvenience Cover</li>
                                    <li>$ 1,00,000</li>
                                    <li>`860</li>
                                  </ul>
                                  <ul className="cards_details_two">
                                    <li>Non Medical Cover</li>
                                    <li>$ 1,00,000</li>
                                  </ul>
                                  <ul className="cards_details_two">
                                    <li>Additional Benefits</li>
                                    <li>$ 1,00,000</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h4>Package 1</h4>
                                <div className="addon_card">
                                  <ul className="cards_header">
                                    <li>BENEFITS</li>
                                    <li>SUM INSURED</li>
                                    <li>PREMIUM</li>
                                  </ul>
                                  <ul className="cards_details_three">
                                    <li>Travel Inconvenience Cover</li>
                                    <li>$ 1,00,000</li>
                                    <li>`860</li>
                                  </ul>
                                  <ul className="cards_details_two">
                                    <li>Non Medical Cover</li>
                                    <li>$ 1,00,000</li>
                                  </ul>
                                  <ul className="cards_details_two">
                                    <li>Additional Benefits</li>
                                    <li>$ 1,00,000</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "none" }} className="addons_package">
                            <h3>Also Buy</h3>
                            <p>
                              You should get these additional benefits to enhance your current plan
                            </p>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="package_card">
                                  <div className="package_card_row">
                                    <div className="package_logo">
                                      <img src="images/apolo.jpg" />
                                    </div>
                                    <div className="package_content">
                                      <p>Plan Name goes here</p>
                                      <p className="link">Product Details</p>
                                    </div>
                                  </div>
                                  <div className="package_card_row">
                                    <div className="package_claim">Claims Guarantee</div>
                                    <div className="package_cta">
                                      <button className="btn_secandry">1,233</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="package_card">
                                  <div className="package_card_row">
                                    <div className="package_logo">
                                      <img src="images/apolo.jpg" />
                                    </div>
                                    <div className="package_content">
                                      <p>Plan Name goes here</p>
                                      <p className="link">Product Details</p>
                                    </div>
                                  </div>
                                  <div className="package_card_row">
                                    <div className="package_claim">Claims Guarantee</div>
                                    <div className="package_cta">
                                      <button className="btn_secandry">1,233</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ overflow: "hidden" }} className="insured_detail">
                            <div className="heading">Insured Details</div>
                            <div className="member_tab custom_carousel">
                              <div
                                className={`${
                                  (members && members.length > 7) ||
                                  (screenSize < 768 && members.length > 4)
                                    ? "show"
                                    : "hide"
                                } controls`}
                              >
                                <div
                                  className="pree"
                                  onClick={() =>
                                    this.handelLeftsliderDimension(`ulSlider${variantIndex}`)
                                  }
                                ></div>
                                <div
                                  className="nextt"
                                  onClick={() =>
                                    this.handelRightsliderDimension(`ulSlider${variantIndex}`)
                                  }
                                ></div>
                              </div>
                              <ul id={`ulSlider${variantIndex}`} className="clearfix">
                                {members &&
                                  members.map((traveller, travellerIndex) => {
                                    const {
                                      isTabDisplayed,
                                      denoteTraveller,
                                      relationTypeID,
                                      relationType,
                                      age
                                    } = traveller;

                                    return (
                                      <li
                                        id={`travellerli${variantIndex}${travellerIndex}`}
                                        className={`tooltip_proposer ${
                                          isTabDisplayed ? "active_traveller" : ""
                                        }`}
                                        onClick={() =>
                                          this.handelTravellTabDisplay(variantIndex, travellerIndex)
                                        }
                                      >
                                        <p
                                          id={`travellerp${variantIndex}${travellerIndex}`}
                                          style={{
                                            width: `${
                                              travellerIndex === 7 && show8thLiApperance === true
                                                ? "33px"
                                                : "98px"
                                            }`,
                                            overflow: `${
                                              travellerIndex === 7 && show8thLiApperance === true
                                                ? "hidden"
                                                : "none"
                                            }`,
                                            whiteSpace: `${
                                              travellerIndex === 7 && show8thLiApperance === true
                                                ? "nowrap"
                                                : "none"
                                            }`
                                          }}
                                          // className={`travellerCount  ${travellerIndex===7 && show8thLiApperance===true ?'sliderthLiApperance':''}`}
                                        >
                                          {`${denoteTraveller}`}
                                        </p>
                                        <span className="tooltip_text_proposer">{`${
                                          relationTypeID !== 11 ? relationType : denoteTraveller
                                        } (${age} Yrs)`}</span>
                                      </li>
                                    );
                                  })}
                              </ul>
                            </div>
                          </div>

                          {members &&
                            members.map((member, memberIndex) => {
                              const {
                                profileID,
                                fullName,
                                genderID,
                                dateOfBirth,
                                visaType,
                                maritalStatusID,
                                passportNo,
                                occupationID,
                                nomineeName,
                                nomineeRelationID,
                                isTabDisplayed,
                                proposerRelationID,
                                nationalityID,
                                insurerID,
                                physicianName = "PolicyBazaar",
                                physicianContactNumber,
                                physicianCityAddress,
                                passportExpiredOn,
                                questions,
                                profileTypeID,
                                isPED,
                                enableFrontLoader,
                                enableBackLoader,
                                frontFileName,
                                backFileName,
                                frontFileSize,
                                backFileSize
                              } = member;

                              return (
                                <div
                                  className="passport_wrapper"
                                  style={{ display: isTabDisplayed ? "" : "none" }}
                                  onKeyDown={e => this.handleKeyPress(e, variantIndex, memberIndex)}
                                >
                                  <h3>{lang.uploadPassport}</h3>
                                  <p className="helpText left">{lang.thisMayhelpText}</p>
                                  <p className="helpText right">
                                    Only PDF, JPEG, PNG files are supported. Size should not be more
                                    that 1 MB.
                                  </p>
                                  <div className="clear"></div>
                                  <div className="passport_wrp row">
                                    <div className="col-md-6 passport_left">
                                      <div className="upload-passport">
                                        <div className="clickDiv">
                                          <label className="passport_upload"></label>
                                          <label>{lang.PassportFront}</label>
                                        </div>
                                        <input
                                          id={`filePassportFront${variantIndex}${memberIndex}`}
                                          type="file"
                                          placeholder={lang.PassportFront}
                                          onChange={() =>
                                            this.handelPassportUpload(
                                              `filePassportFront${variantIndex}${memberIndex}`,
                                              documents[0].value,
                                              variantIndex,
                                              memberIndex,
                                              profileID,
                                              profileTypeID
                                            )
                                          }
                                        />
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                          <div
                                            style={{ color: "#0065ff", fontSize: "12px" }}
                                            className={`${
                                              enableFrontLoader === true ? "show" : "hide"
                                            }`}
                                          >
                                            {frontFileName}
                                          </div>
                                          <div
                                            style={{ width: 150 }}
                                            className={`passportLoader ${
                                              enableFrontLoader === true ? "show" : "hide"
                                            }`}
                                          ></div>
                                          <div
                                            style={{ color: "#0065ff", fontSize: "11px" }}
                                            className={`${
                                              enableFrontLoader === true ? "show" : "hide"
                                            }`}
                                          >
                                            {frontFileSize} Complete
                                          </div>
                                          <div
                                            style={{ zIndex: 100 }}
                                            onClick={() =>
                                              this.closePassportUploadProcess(
                                                documents[0].value,
                                                variantIndex,
                                                memberIndex
                                              )
                                            }
                                            className={`${
                                              enableFrontLoader === true ||
                                              enableFrontLoader === "showPassportCheck"
                                                ? "show"
                                                : "hide"
                                            }  ${
                                              enableFrontLoader === "showPassportCheck"
                                                ? "passport_check"
                                                : "passport_close"
                                            }`}
                                          ></div>
                                        </div>
                                        <div
                                          className={`${
                                            variantsErrors &&
                                            variantsErrors[variantIndex] &&
                                            variantsErrors[variantIndex][memberIndex]
                                              .passportFrontError.valid === false
                                              ? "show error_textColor"
                                              : "hide"
                                          }`}
                                        >
                                          {variantsErrors &&
                                            variantsErrors[variantIndex] &&
                                            variantsErrors[variantIndex][memberIndex]
                                              .passportFrontError.remarks}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="col-md-6  passport_right">
                                      <div className="upload-passport">
                                        <div className="clickDiv">
                                          <label className="passport_upload"></label>
                                          <label>{lang.PassportBack}</label>
                                        </div>
                                        <input
                                          id={`filePassportBack${variantIndex}${memberIndex}`}
                                          type="file"
                                          placeholder={lang.PassportBack}
                                          onChange={() =>
                                            this.handelPassportUpload(
                                              `filePassportBack${variantIndex}${memberIndex}`,
                                              documents[1].value,
                                              variantIndex,
                                              memberIndex,
                                              profileID,
                                              profileTypeID
                                            )
                                          }
                                        />
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                          <div
                                            style={{ color: "#0065ff", fontSize: "12px" }}
                                            className={`${
                                              enableBackLoader === true ? "show" : "hide"
                                            }`}
                                          >
                                            {backFileName}
                                          </div>
                                          <div
                                            style={{ width: 150 }}
                                            className={`passportLoader ${
                                              enableBackLoader === true ? "show" : "hide"
                                            }`}
                                          ></div>
                                          <div
                                            style={{ color: "#0065ff", fontSize: "11px" }}
                                            className={`${
                                              enableBackLoader === true ? "show" : "hide"
                                            }`}
                                          >
                                            {backFileSize} Complete
                                          </div>
                                          <div
                                            style={{ zIndex: 100 }}
                                            onClick={() =>
                                              this.closePassportUploadProcess(
                                                documents[1].value,
                                                variantIndex,
                                                memberIndex
                                              )
                                            }
                                            className={`${
                                              enableBackLoader === true ||
                                              enableBackLoader === "showPassportCheck"
                                                ? "show"
                                                : "hide"
                                            }  ${
                                              enableBackLoader === "showPassportCheck"
                                                ? "passport_check"
                                                : "passport_close"
                                            }`}
                                          ></div>
                                        </div>
                                        <div
                                          className={`${
                                            variantsErrors &&
                                            variantsErrors[variantIndex] &&
                                            variantsErrors[variantIndex][memberIndex]
                                              .passportBackError.valid === false
                                              ? "show error_textColor"
                                              : "hide"
                                          }`}
                                        >
                                          {variantsErrors &&
                                            variantsErrors[variantIndex] &&
                                            variantsErrors[variantIndex][memberIndex]
                                              .passportBackError.remarks}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <p className="otherTxt">{lang.orYouCanFillManuallyText}</p>

                                  <div
                                    style={{ display: "none" }}
                                    id={`divloader${variantIndex}${memberIndex}`}
                                  >
                                    <div className="align_minus">
                                      <h3>&nbsp;</h3>
                                      <div className="row">
                                        <div className="col-md-8 fieldBlock">
                                          <Skeleton width="100%" height={56} />
                                        </div>

                                        <div className="col-md-4 fieldBlock">
                                          <div className="custom_radio clearfix">
                                            <div className="width_50">
                                              <Skeleton width="100%" height={56} />
                                            </div>
                                            <div className="width_50">
                                              <Skeleton width="100%" height={56} />
                                            </div>
                                          </div>
                                        </div>

                                        <div className="col-md-6 fieldBlock">
                                          <Skeleton width="100%" height={56} />
                                        </div>

                                        <div className={`col-md-6 fieldBlock`}>
                                          <Skeleton width="100%" height={56} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    style={{ display: "" }}
                                    id={`divmemberAndProposercontainer${variantIndex}${memberIndex}`}
                                  >
                                    <div className="align_minus">
                                      <h3>{lang.personalDetails}</h3>
                                      <div className="row">
                                        <div className="col-md-6 fieldBlock">
                                          <div
                                            className={`field ${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .fullnameError.valid
                                                ? ""
                                                : "error_proposal")}`}
                                          >
                                            <input
                                              type="text"
                                              required
                                              id={`txtTravellerName${variantIndex}${memberIndex}`}
                                              value={this.capitalizeText(fullName)}
                                              onBlur={() => {
                                                this.onBlurTravellerName(
                                                  fullName,
                                                  variantIndex,
                                                  memberIndex
                                                );
                                              }}
                                              onChange={e =>
                                                this.handelTravellerName(
                                                  e,
                                                  variantIndex,
                                                  memberIndex
                                                )
                                              }
                                              autoComplete="off"
                                            />
                                            <label
                                              for={`txtTravellerName${variantIndex}${memberIndex}`}
                                            >
											{lang.TravellerName}
                                          </label>
                                          </div>

                                          <span
                                            className={`${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .fullnameError.hasWarning &&
                                              variantsErrors[variantIndex][memberIndex]
                                                .fullnameError.hasWarning === true
                                                ? "show"
                                                : "hide")}`}
                                          >
                                            {variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .fullnameError.hasWarning &&
                                              variantsErrors[variantIndex][memberIndex]
                                                .fullnameError.hasWarning === true
                                                ? variantsErrors[variantIndex][memberIndex]
                                                    .fullnameError.remarks
                                                : "")}
                                          </span>
                                          <div
                                            className={`${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .fullnameError.showremarks === true
                                                ? "show error_textColor"
                                                : "hide")}`}
                                          >
                                            {variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              variantsErrors[variantIndex][memberIndex]
                                                .fullnameError.remarks}
                                          </div>
                                        </div>

                                        <div className="col-md-6 fieldBlock">
                                          <div className="custom_radio clearfix">
                                            <div className="width_50">
                                              <label className="male">
                                                <input
                                                  id={`ddlTravellerMale${variantIndex}${memberIndex}`}
                                                  onChange={e => {
                                                    this.handelTravellerGender(
                                                      e,
                                                      variantIndex,
                                                      memberIndex
                                                    );
                                                    this.copyData(
                                                      copyFrom.traveller,
                                                      variantIndex,
                                                      memberIndex
                                                    );
                                                  }}
                                                  checked={genderID === 1}
                                                  onKeyDown={this.handleGenderKeyPress}
                                                  type="radio"
                                                  tabIndex="male_icon"
                                                  value={1}
                                                />
                                                <span
                                                  className={`${variantsErrors &&
                                                    variantsErrors[variantIndex] &&
                                                    (variantsErrors[variantIndex][memberIndex]
                                                      .genderError.valid
                                                      ? ""
                                                      : "error_proposal")}`}
                                                >
                                                  {lang.male}
                                                </span>
                                              </label>
                                            </div>
                                            <div className="width_50">
                                              <label className="female">
                                                <input
                                                  id={`radioFemale${variantIndex}${memberIndex}`}
                                                  onChange={e => {
                                                    this.handelTravellerGender(
                                                      e,
                                                      variantIndex,
                                                      memberIndex
                                                    );
                                                    this.copyData(
                                                      copyFrom.traveller,
                                                      variantIndex,
                                                      memberIndex
                                                    );
                                                  }}
                                                  checked={genderID === 2}
                                                  tabIndex="female_icon"
                                                  type="radio"
                                                  value={2}
                                                />
                                                <span
                                                  className={`${variantsErrors &&
                                                    variantsErrors[variantIndex] &&
                                                    (variantsErrors[variantIndex][memberIndex]
                                                      .genderError.valid
                                                      ? ""
                                                      : "error_proposal")}`}
                                                >
                                                  {lang.female}
                                                </span>
                                              </label>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="col-md-6 fieldBlock">
                                          <div
                                            className={`field ${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .passportNoError.valid
                                                ? ""
                                                : "error_proposal")}`}
                                          >
                                            <input
                                              type="text"
                                              required
                                              id={`txtPassport${variantIndex}${memberIndex}`}
                                              value={passportNo}
                                              onBlur={() => {
                                                this.validatePassport(
                                                  passportNo,
                                                  variantIndex,
                                                  memberIndex,
                                                  nationalityID
                                                );
                                              }}
                                              onChange={e =>
                                                this.handelTravellerpassportNo(
                                                  e,
                                                  variantIndex,
                                                  memberIndex,
                                                  nationalityID
                                                )
                                              }
                                              autoComplete="off"
                                            />
                                            <label for={`txtPassport${variantIndex}${memberIndex}`}>
                                              {lang.Passport}
                                          </label>
                                          </div>
                                          <div
                                            className={`${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .passportNoError.showremarks === true
                                                ? "show error_textColor"
                                                : "hide")}`}
                                          >
                                            {variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              variantsErrors[variantIndex][memberIndex]
                                                .passportNoError.remarks}
                                          </div>
                                        </div>

                                        <div
                                          className={`col-md-6 dbo_Calendar  calender_icon fieldBlock ${
                                            insurerID === 8 || insurerID === 12 ? "show" : "hide"
                                          }`}
                                        >
                                          <DatePicker
                                            ref={`insurerDatePicker${variantIndex}${memberIndex}`}
                                            selected={
                                              passportExpiredOn
                                                ? moment(passportExpiredOn).toDate()
                                                : null
                                            }
                                            onChange={e =>
                                              this.travellerPassportExpiredOn(
                                                e,
                                                variantIndex,
                                                memberIndex
                                              )
                                            }
                                            dateFormat={"d MMM yy"}
                                            placeholderText="Passport Expiry Date"
                                            showYearDropdown
                                            scrollableYearDropdown
                                            dropdownMode="select"
                                            onKeyDown={e =>
                                              this.handleDateKeyPress2(e, variantIndex, memberIndex)
                                            }
                                            showMonthDropdown={true}
                                            maxDate={new Date(moment().add("year", 10))}
                                            minDate={new Date(moment())}
                                            className={`selectCalenderDate input_type ${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .passportExpiredOnError.valid
                                                ? ""
                                                : "error_proposal")}`}
                                          />
                                          <div
                                            style={{
                                              display: "none",
                                              position: "absolute",
                                              color: "red",
                                              fontSize: 13,
                                              top: 55,
                                              right: 13
                                            }}
                                          >
                                            {lang.notMandatory}
                                          </div>
                                        </div>
                                      </div>
                                      <h3>{lang.nomineeDetails}</h3>
                                      <div className="row">
                                        <div className="col-md-6 fieldBlock">
                                          <div
                                            className={`field ${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .nomineeNameError.valid
                                                ? ""
                                                : "error_proposal")}`}
                                          >
                                            <input
                                              type="text"
                                              required
                                              id={`txtNomineeName${variantIndex}${memberIndex}`}
                                              value={this.capitalizeText(nomineeName)}
                                              onChange={e =>
                                                this.handelTravellerNomineeName(
                                                  e,
                                                  variantIndex,
                                                  memberIndex
                                                )
                                              }
                                              onBlur={() => {
                                                this.onBlurTravellerNomineeName(
                                                  nomineeName,
                                                  variantIndex,
                                                  memberIndex
                                                );
                                              }}
                                              autoComplete="new-password"
                                              name="gffgdf"
                                            />
                                            <label
                                              for={`txtNomineeName${variantIndex}${memberIndex}`}
                                            >
											{lang.NomineeName}
                                          </label>
                                          </div>

                                          <div
                                            className={`${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .nomineeNameError.showremarks === true
                                                ? "show error_textColor"
                                                : "hide")}`}
                                          >
                                            {variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              variantsErrors[variantIndex][memberIndex]
                                                .nomineeNameError.remarks}
                                          </div>
                                        </div>

                                        <div className="col-md-6">
                                          <div
                                            className={`pro_box select ${variantsErrors &&
                                              variantsErrors[variantIndex] &&
                                              (variantsErrors[variantIndex][memberIndex]
                                                .nomineeRelationIDError.valid
                                                ? ""
                                                : "error_proposal")}`}
                                          >
                                            <label
                                              htmlFor={`ddlNomineerelation${variantIndex}${memberIndex}`}
                                            >
                                              {lang.nomineeRelation}
                                            </label>
                                            <select
                                              className="input_type"
                                              id={`ddlNomineerelation${variantIndex}${memberIndex}`}
                                              onChange={e =>
                                                this.handelTravellerNomineeRelationShip(
                                                  e,
                                                  variantIndex,
                                                  memberIndex
                                                )
                                              }
                                            >
                                              {nomineeRelations.map(relation => {
                                                const { masterID, name } = relation;
                                                return (
                                                  <option
                                                    value={masterID}
                                                    selected={masterID === nomineeRelationID}
                                                  >
                                                    {name}
                                                  </option>
                                                );
                                              })}
                                            </select>
                                          </div>
                                        </div>
                                      </div>
                                      {profileTypeID === 4 &&
                                        this.renderStudentDetails(
                                          profileTypeID,
                                          insurerID,
                                          variantIndex,
                                          variantsErrors,
                                          memberIndex,
                                          nomineeRelations
                                        )}
                                      <h3
                                        className={
                                          questions && questions.length > 0 ? "show" : "hide"
                                        }
                                      >
									  {lang.OtherAdditionalQuestions}
                                    </h3>
                                      <div
                                        className={`medicalQuestionsWrap ${
                                          insurerID === 6 ? "hide" : "show"
                                        }`}
                                      >
                                        <ul>
                                          {questions &&
                                            questions.length > 0 &&
                                            questions
                                              .filter(
                                                parentQuestions =>
                                                  parentQuestions.parentQuestionID === 0
                                              )
                                              .map(parentQuestion => {
                                                const {
                                                  questionID: parentPedQuestionID,
                                                  answer,
                                                  controlType
                                                } = parentQuestion;
                                                return (
                                                  <li>
                                                    {this.renderQuestionFields(
                                                      parentQuestion,
                                                      variantIndex,
                                                      memberIndex
                                                    )}
                                                    <div className="questionOptionsBlock">
                                                      {" "}
                                                      {questions
                                                        .filter(
                                                          firstLayerQuestions =>
                                                            firstLayerQuestions.parentQuestionID ===
                                                            parentPedQuestionID
                                                        )
                                                        .map(firstLayerQuestion => {
                                                          return (
                                                            <div
                                                              className={`${
                                                                answer === true.toString() ||
                                                                controlType === 1
                                                                  ? "show"
                                                                  : "hide"
                                                              }`}
                                                            >
                                                              {this.renderQuestionFields(
                                                                firstLayerQuestion,
                                                                variantIndex,
                                                                memberIndex
                                                              )}
                                                              {questions
                                                                .filter(
                                                                  secondLayerQuestions =>
                                                                    secondLayerQuestions.parentQuestionID ===
                                                                    firstLayerQuestion.questionID
                                                                )
                                                                .map(secondLayerQuestion => {
                                                                  return (
                                                                    <div
                                                                      className={`${
                                                                        firstLayerQuestion.answer !==
                                                                        null
                                                                          ? "show"
                                                                          : "hide"
                                                                      }`}
                                                                    >
                                                                      {this.renderQuestionFields(
                                                                        secondLayerQuestion,
                                                                        variantIndex,
                                                                        memberIndex
                                                                      )}
                                                                    </div>
                                                                  );
                                                                })}
                                                            </div>
                                                          );
                                                        })}
                                                    </div>
                                                  </li>
                                                );
                                              })}
                                        </ul>
                                      </div>

                                      <div
                                        className={`medicalQuestionsWrapmedicalQuestionsWrap ${
                                          insurerID !== 6 ? "hide" : "show"
                                        }`}
                                      >
                                        <ul>
                                          {questions &&
                                            questions.length > 0 &&
                                            questions
                                              .filter(
                                                parentQuestions =>
                                                  parentQuestions.parentQuestionID === 0
                                              )
                                              .map(parentQuestion => {
                                                return (
                                                  <li>
                                                    {this.renderRelianceParentQuestion(
                                                      parentQuestion,
                                                      variantIndex,
                                                      memberIndex
                                                    )}
                                                    <div
                                                      className={
                                                        parentQuestion.answer === "true"
                                                          ? "show col"
                                                          : "show col"
                                                      }
                                                    >
                                                      {this.renderReliancePedGrid(
                                                        parentQuestion,
                                                        variantIndex,
                                                        memberIndex
                                                      )}
                                                    </div>
                                                  </li>
                                                );
                                              })}
                                        </ul>
                                      </div>
                                    </div>

                                    <div
                                      className={` text-right ${
                                        members &&
                                        totalMember > 1 &&
                                        (profileTypeID === 2 || profileTypeID === 7)
                                          ? "show"
                                          : "hide"
                                      }`}
                                    >
                                      <button
                                        className="proposal_submit"
                                        onClick={e =>
                                          this.handelTravellerSubmit(e, variantIndex, memberIndex)
                                        }
                                      >
                                        {lang.nextTrveller}
                                        <div
                                          className={`spinner-border text-primary ${submitTravellerSpinnerShowHide}`}
                                        >
                                          <span className="sr-only"></span>
                                        </div>
                                      </button>
                                    </div>

                                    <div className="insured_detail">
                                      <div className="heading">{lang.proposerDetail}</div>
                                    </div>
                                    <div className="custDetailWrap">
                                      {this.renderProposer(
                                        variantIndex,
                                        memberIndex,
                                        profileTypeID
                                      )}
                                    </div>

                                    <div
                                      className={` text-right ${
                                        members &&
                                        totalMember > 1 &&
                                        (profileTypeID === 1 || profileTypeID === 4)
                                          ? "show"
                                          : "hide"
                                      }`}
                                    >
                                      <button
                                        className="proposal_submit"
                                        onClick={e =>
                                          this.handelTravellerSubmit(e, variantIndex, memberIndex)
                                        }
                                      >
                                        {lang.nextTrveller}
                                        <div
                                          className={`spinner-border text-primary ${submitTravellerSpinnerShowHide}`}
                                        >
                                          <span className="sr-only"></span>
                                        </div>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}

                <div className="customer_detail ">
                  <h2>{lang.proposal_CustomerDetails}</h2>
                </div>

                <div className="proposal_details white_box ">
                  <div className="tellUsMoreAbout">
                    <p className="head">{lang.tellUsMoreAboutYou}</p>
                    <p className="desc">{lang.thankYouforChoosingPolicybazaarText}</p>
                  </div>

                  <div className="custDetailWrap row">
                    <div className="col-md-6 fieldBlock">
                      <div
                        className={`field ${errors &&
                          errors.customerError &&
                          (!errors.customerError.fullNameError.valid ? "error_proposal" : "")}`}
                      >
                        <input
                          type="text"
                          required
                          id="txtCustomerName"
                          value={this.capitalizeText(fullName)}
                          onChange={this.handelCustomerName}
                          onBlur={() => {
                            this.onBlurCustomerName(fullName);
                          }}
                          autoComplete="new-password99"
                        />
                        <label for="txtCustomerName">{lang.proposal_Name}</label>
                      </div>
                      <div
                        className={`${errors &&
                          errors.customerError &&
                          (errors.customerError.fullNameError.showremarks === true
                            ? "show error_textColor"
                            : "hide")}`}
                      >
                        {errors &&
                          errors.customerError &&
                          errors.customerError.fullNameError.remarks}
                      </div>
                    </div>
                    <div className="col-md-6 fieldBlock">
                      <div
                        className={`field ${errors &&
                          errors.customerError &&
                          (!errors.customerError.emailIDError.valid ? "error_proposal" : "")}`}
                      >
                        <input
                          type="text"
                          required
                          id="txtCustomerEmail"
                          value={emailID}
                          onBlur={this.validateCustomerEmail}
                          onChange={this.handelCustomerEmail}
                          autoComplete="off"
                        />
                        <label for="txtCustomerEmail">{lang.proposal_EmailId}</label>
                      </div>
                      <div
                        className={`${errors &&
                          errors.customerError &&
                          (errors.customerError.emailIDError.showremarks === true
                            ? "show error_textColor"
                            : "hide")}`}
                      >
                        {errors &&
                          errors.customerError &&
                          errors.customerError.emailIDError.remarks}
                      </div>
                    </div>
                    <div className="col-md-6 fieldBlock">
                      <div
                        className={`field ${errors &&
                          errors.customerError &&
                          (!errors.customerError.mobileNoError.valid ? "error_proposal" : "")}`}
                      >
                        <input
                          type="text"
                          required
                          id="txtCustomerMobileNo"
                          value={mobileNo}
                          onChange={this.handelCustomerMobileNo}
                          onBlur={() => this.validateCustomerMobileNo(mobileNo)}
                          maxLength={10}
                          autoComplete="new-password"
                        />
                        <label for="txtCustomerMobileNo">{lang.proposal_MobileNo}</label>
                      </div>
                    </div>

                    <div
                      className={`col-md-6 fieldBlock ${
                        customerTotalPremium > 50000 ? "show" : "hide"
                      }`}
                    >
                      <div
                        className={`field ${errors &&
                          errors.customerError &&
                          (!errors.customerError.panError.valid ? "error_proposal" : "")}`}
                      >
                        <input
                          type="text"
                          required
                          id="txtCustomerPAN"
                          value={pan}
                          onChange={this.handelCustomerpan}
                        />
                        <label for="txtCustomerMobileNo">{lang.pan}</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ctaRow">
                  <div className="button_group">
                    <button
                      type="button"
                      className="save_btn"
                      onClick={this.handelSaveProposalStep2}
                    >
                      {lang.proposal_SaveForm}
                      <div
                        className={`spinner-border text-primary  ${saveTravellerSpinnerShowHide}`}
                        role="status"
                      >
                        <span className="sr-only"></span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="proposal_submit"
                      onClick={this.handelProceedProposalStep2}
                    >
                      {lang.proceed}
                      <div
                        className={`spinner-border text-primary ${submittProceedSpinnerShowHide} `}
                        role="status"
                      >
                        <span className="sr-only"></span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="save-form">
              {/* <Toast
                toastText={toastText}
                additionalClass={toastShowHide}
                handelclose={this.closeToast}
                className='save-form'
              /> */}
              {toastShowHide === "show" && (
                <p className="toast_show">
                  <i className="info"></i>
                  {toastText}
                  <span onClick={() => this.handelclose()} className="closeToast">
                    {/* {text === 'studentVisa' ?'' :'OK'} */}
                  </span>
                </p>
              )}
            </div>
            {proposerID && enquiryID && (
              <ChatUI
                proposerID={proposerID}
                enquiryID={enquiryID}
                showLiveChat={showLiveChat}
                handleShowLiveChat={this.handleShowLiveChat}
              />
            )}
            <Footer />
          </div>
        </form>
      );
    } else {
      return <div></div>;
    }
  }
}

const mapStatetoProps = store => {
  return {
    store,
    encryptedProposerId: store.encryptedProposerId,
    proposerId: store.proposerId
    // enquiryId: store.enquiryId
  };
};

const mapDispatchtoProps = dispatch => {
  return {
    saveProposalStep2Data: data => dispatch(saveProposalStep2Data(data)),
    onInit: data => dispatch(onInit(data))
  };
};
export default connect(mapStatetoProps, mapDispatchtoProps)(ProposalStep2);
