import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Moment from "moment";
import { extendMoment } from "moment-range";
import Cookies from "js-cookie";
import { getProposalStep1Data, modifyStep1Data } from "../../../services/proposal";
import { lang } from "../../../cms/i18n/en/index";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Styles/proposal.css";
import {
  validateTravellerDob,
  isPropoalStep1Valid,
  validateVisaType,
  validateNationalityID
} from "./ProposalStep1Validation";
import { default as jsonData } from "./dummy.json";
import Header from "../../components/static/header";
import Footer from "../../components/static/footer";
import EditModal from "../../journey/Quotes/EditModals/EditModal";
import {
  saveProposalStep1Data,
  onInit,
  onUpdateMobileNumber,
  onUpdateMobileCountryCode
} from "../../../store/actions/preQuoteActions";
import Toast from "../../components/Toast/Toast2";
import GenericToast from "../../components/Toast/Toast";
import * as _ from "lodash";
import ChatUI from "../../../Chat/Chat";
import { customEvent, onPageLoad, leadSubmitEvent } from "../../../GA/gaEvents";
import { getAge } from "../../../utils/helper";
import MobileComponent from "./MobileComponent";
import MobileModal from "../MobileView/CountryCode/style.css";
import { default as diallingCodes } from "../../../lib/diallingCodes.json";
import { filter } from "lodash";

const moment = extendMoment(Moment);

class ProposalStep1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      travellerData: {},
      errors: {},
      timeOutId: 0,
      pedNotAllowedToBuyMessage: "",
      submittSpinnerShowHide: "hide",
      toastShowHide: "hide",
      premiumToastShowHide: "hide",
      premiumToastText: [],
      toastText: "",
      showLiveChat: false,
      isSubmitBtnDisabled: false,
      tempErrors: [],
      modifyStep1Response: [],
      showMobileError: false,
      overlapErrors: [],
      genericToastText: "",
      genericToastShowHide: "hide",
      tripStartDate: null,
      accordianIcon: "fa-angle-down",
      screenSize: window.screen.width,
      gaFlowName: "",
      proposerId: ""
    };
  }
  hideSeo = () => {
    document.querySelector(".tttttt h1").setAttribute("style", "font-size:0");
    var seoTxt = document.querySelector(".tttttt");
    seoTxt.setAttribute("style", "font-size: 0");
  };

  gaLeadSubmit = () => {
    const payload = {
      ProposerID: this.state.proposerId,
      pageName: "Trv.BU lead",
      pageType: "Trv.Lead"
    };
    leadSubmitEvent(payload);
  };

  async componentDidMount() {
    onPageLoad("Trv.Proposal 1", "Trv.BU Proposal 1");
    const {
      match,
      proposerId,
      onInit,
      onUpdateMobileCountryCode,
      onUpdateMobileNumber
    } = this.props;
    const { params } = match;
    const { encryptedProposerId } = params;
    let { errors, travellerData, tempErrors } = this.state;

    setTimeout(() => this.hideSeo(), 100);

    // let result = jsonData
    let result = await getProposalStep1Data(proposerId || 0, encryptedProposerId);

    if (!result || result.error) {
      this.setState({
        submittSpinnerShowHide: "hide",
        genericToastShowHide: "show",
        techErrMsg: "experiencing",
        genericToastText: lang.technicalIssue
      });
    }

    if (result.errorCode === 6) {
      this.props.history.push(`/v2/checkout/${encryptedProposerId}`);
    }

    this.setState({
      proposerId: result.proposerID
    });

    onInit({
      proposerId: result.proposerID,
      enquiryId: result.enquiryID,
      encryptedProposerId: encryptedProposerId
    });

    let countryCode = "91";

    if (result.customer && result.customer.countryID && result.customer.countryID.toString()) {
      const filterCode = diallingCodes["Final Countries"].filter(
        x => x["CountryID - Travel CJ"] === result.customer.countryID.toString()
      )[0].CountryDialingCode;

      if (filterCode) {
        countryCode = filterCode;
      }
    }

    if(countryCode) {
      onUpdateMobileCountryCode({
        countryCode: countryCode.replace("++", "+"),
        valid: true
      });
  
      onUpdateMobileNumber({
        mobileNo: (result.customer && result.customer.mobileNo) || "",
        valid: true
      });
    }



    if (result) {
      const { members, disclaimers } = result;

      let memberError = [];

      members &&
        members.forEach((member, index) => {
          let travellerError = {};
          let {
            questions,
            nationalities,
            dateOfBirth,
            age,
            visaTypeID,
            nationalityID,
            visaTypes,
            calendarStartOn,
            calendarEndOn
          } = member;
          if (index === 0) {
            member.isAccordianTrue = true;
          } else {
            member.isAccordianTrue = false;
          }

          if (dateOfBirth) {
            members[index].dateOfBirth = moment(dateOfBirth).isBetween(
              moment(calendarStartOn),
              moment(calendarEndOn),
              null,
              "[]"
            )
              ? dateOfBirth
              : null;
          }

          if (dateOfBirth !== null && visaTypeID !== null && nationalityID !== null) {
            member.hasTravellerFilledAllData = true;
          } else {
            member.hasTravellerFilledAllData = false;
          }

          nationalities &&
            nationalities.length > 0 &&
            nationalities.sort(function(a, b) {
              if (a.masterID < b.masterID) {
                return -1;
              } else {
                return 1;
              }
            });

          // if (dateOfBirth) {
          //   let revisedAge = getAge(dateOfBirth);
          //   members[index].dateOfBirth =
          //     revisedAge === age || revisedAge === age || revisedAge === age ? dateOfBirth : null;
          // }

          travellerError.dobError = { valid: true };
          travellerError.visaTypeError = { valid: true };
          travellerError.nationalityError = { valid: true };
          travellerError.preExistingDiseaseError = { valid: true };

          travellerError.pedIsAllowedToBuyError = [];
          questions
            .filter(question => question.parentQuestionID !== 0)
            .forEach(question => {
              const { questionID } = question;
              travellerError.pedIsAllowedToBuyError.push({ questionID, valid: true });
            });

          memberError.push(travellerError);
        });

      let tempdisclaimerError = [];
      disclaimers &&
        disclaimers.forEach(disclaimer => {
          const { disclaimerID, defaultValue, valueToProceed, applicableForGender } = disclaimer;

          tempdisclaimerError.push({
            disclaimerID,
            defaultValue,
            valueToProceed,
            applicableForGender,
            type: "nonPed",
            valid: true
          });
        });

      errors.tempdisclaimerError = tempdisclaimerError;
      errors.disclaimerError = { valid: true };
      errors.travellerError = memberError;

      let cookie = Cookies.get("TravelCjCookie");
      cookie = cookie ? JSON.parse(cookie) : { flowName: "Trv.Direct" };
      this.setState({
        travellerData: result,
        errors,
        gaFlowName: cookie.flowName
      });
    }

    const elements = document.getElementsByClassName("selectCalenderDate");
    if (elements) {
      for (let i = 0; i < elements.length; i++) {
        elements[i].setAttribute("readonly", true);
      }
    }
  }

  changeTravellerDobCalenderFocus = indexId => {
    const { travellerData } = this.state;

    const { members } = travellerData;

    members.forEach((element, index) => {
      if (index === indexId) {
        travellerData.members[index].isFocused = true;
      } else {
        travellerData.members[index].isFocused = false;
      }
    });

    this.setState({
      travellerData
    });
  };

  handleShowLiveChat = type => {
    this.setState({
      showLiveChat: type
    });
  };

  handelCalenderEvents = (e, index) => {
    if (e) {
      const { travellerData, errors } = this.state;

      let newDate = new Date(e);
      newDate.setDate(e.getDate() + 1);
      travellerData.members[index].dateOfBirth = newDate.toISOString().substr(0, 10);
      travellerData.members[index].ageOnTravelStart_inMonth = moment(
        this.props.state.dateRange[0]
      ).diff(moment(newDate.toISOString().substr(0, 10)), "month");

      const { error } = validateTravellerDob(
        errors.travellerError[index].dobError,
        travellerData.members[index]
      );

      errors &&
        errors.travellerError &&
        errors.travellerError.length > 0 &&
        (errors.travellerError[index].dobError = error);

      this.checkhasTravellerFilledAllData();

      this.setState({
        travellerData,
        errors
      });
    }
  };

  closeOverlappedToastStatus = message => {
    const { overlapErrors } = this.state;
    this.setState({
      overlapErrors: overlapErrors.splice(overlapErrors.indexOf(message), 1)
    });
  };

  renderOverlapToast = (errorMessage, id) => {
    const { overlappedToastStatus } = this.state;

    return (
      <Toast
        status={overlappedToastStatus}
        text={errorMessage}
        key={`id + ${id}`}
        onClose={this.closeOverlappedToastStatus}
      />
    );
  };

  isValidMobileNo = () => {
    let error = "";

    const { mobileNo, countryCode } = this.props;
    
    if (mobileNo.length !== 10) {
      error = "Please enter 10 digit Mobile no.";
    }
    else if (countryCode === "+91" || countryCode === "91" ) {
      if (
        mobileNo.charAt(0) === "6" ||
        mobileNo.charAt(0) === "7" ||
        mobileNo.charAt(0) === "8" ||
        mobileNo.charAt(0) === "9" ||
        mobileNo.charAt(0) === "*"
      ) {
        error = "";
      }
      else {
        error = "Please enter valid Mobile no.";
      }
    }
    const valid = error === "";

    this.props.onUpdateMobileNumber({
      mobileNo: mobileNo,
      valid: valid
    });

    return valid
  }

  modifyStep1Data = async () => {
    let { travellerData, errors, modifyStep1Response, submittSpinnerShowHide } = this.state;
    const { encryptedProposerId, mobileNo, countryCode, validMobileNo } = this.props;

    if (submittSpinnerShowHide === "show") return;

    this.setState({ submittSpinnerShowHide: "show" });

    const { proposerID } = travellerData;
    const { isvalid, errors: step1Error } = isPropoalStep1Valid(errors, travellerData);




    if (!mobileNo || !countryCode || !this.isValidMobileNo()) {
      this.setState({ showMobileError: true });
    }

    if (isvalid && mobileNo && countryCode && this.isValidMobileNo()) {
      const { saveProposalStep1Data } = this.props;
      saveProposalStep1Data(travellerData);

      let filterCode = "";

      if (countryCode === "+91" || countryCode === "91") {
        filterCode = "392";
      } else {
        // countryCode = countryCode.replace("+", "");
        // console.log('>>>.....', countryCode, isvalid, mobileNo, validMobileNo)

        filterCode = diallingCodes["Final Countries"].filter(
          x => x.CountryDialingCode === countryCode.replace("+", "")
        )[0]["CountryID - Travel CJ"];
      }

      const customer = {
        mobileNo: mobileNo,
        countryID: filterCode
      };

      let response = await modifyStep1Data({ ...travellerData, encryptedProposerId, customer });

      if (!response || response.error) {
        this.setState({
          submittSpinnerShowHide: "hide",
          genericToastShowHide: "show",
          // techErrMsg: 'experiencing',
          genericToastText: lang.technicalIssue
        });

        return;
      }

      modifyStep1Response = response.data;
      let { hasError, premiumRevisedForProfiles } = response.data;
      if (premiumRevisedForProfiles && premiumRevisedForProfiles.length > 0) {
        hasError = true;
      }
      if (!hasError) {
        this.gaCustomEvent();
        if (mobileNo && mobileNo.toString() && !mobileNo.toString().includes("***")) {
          this.gaLeadSubmit();
        }
        this.props.history.push(`/v2/proposalStep2/${encryptedProposerId}`);
      } else {
        this.setState({
          submittSpinnerShowHide: "hide",
          modifyStep1Response,
          premiumToastShowHide: "show"
        });
      }
    } else {
      let errorIndex = 0;
      for (let m of errors.travellerError) {
        if (
          m.dobError.valid === false ||
          m.visaTypeError.valid === false ||
          m.nationalityError.valid === false ||
          m.preExistingDiseaseError.valid === false ||
          m.pedCheckedQuestionError.valid === false
        ) {
          travellerData.members.forEach((x, index) => {
            if (index === errorIndex) {
              travellerData.members[index].isAccordianTrue = true;
            } else {
              travellerData.members[index].isAccordianTrue = false;
            }
          });
          break;
        }
        errorIndex++;
      }

      let overlapErrors = [];

      // step1Error.travellerError.forEach((traveller, id) => {

      //   let error1 = false;
      //   let errorMessage = `Invalid Fields of Traveller ${id + 1}`

      //   if (!traveller.nationalityError.valid) {
      //     error1 = true;
      //   }

      //   if (!traveller.dobError.valid) {
      //     error1 = true;
      //   }

      //   error1 && overlapErrors.push(errorMessage);
      // });

      // this.setState({
      //   overlapErrors,
      //   overlappedToastStatus: 'show'
      // });

      this.setState(
        {
          travellerData,
          errors: step1Error,
          submittSpinnerShowHide: "hide"
        },
        this.focusOnErrorElement
      );
    }
  };

  proceedToProposalStep2 = () => {
    const { travellerData } = this.state;
    const { proposerID } = travellerData;
    const { encryptedProposerId } = this.props;

    this.props.history.push(`/v2/proposalStep2/${encryptedProposerId}`);
  };
  scrollTo(top, behavior, left = null) {
    try {
      window.scrollTo({
        top: top,
        left: left || 0,
        behavior: behavior
      });
    } catch (err) {}
  }

  focusOnErrorElement = () => {
    const { errors, timeOutId } = this.state;
    const { disclaimerError } = errors;
    const { valid } = disclaimerError;

    const elements = document.getElementsByClassName("error_proposal");
    if (elements.length > 0) {
      const yCoordinate = elements[0].getBoundingClientRect().top + window.pageYOffset;
      const yOffset = -150;
      this.scrollTo(yCoordinate + yOffset, "smooth");
    }

    if (!valid) {
      this.setState({
        toastShowHide: "show"
      });

      clearTimeout(timeOutId);
      const id = setTimeout(() => this.hideToast(), 8000);
      this.setState({
        timeOutId: id
      });
    }
  };

  handelTravellersPed = index => {
    let {
      travellerData,
      errors,
      toastShowHide,
      toastText,
      isSubmitBtnDisabled,
      tempErrors,
      timeOutId
    } = this.state;
    const { members } = travellerData;
    const { isPED, pedStatus, variantName, insurerName, insurerID } = members[index];

    if (pedStatus === 4 && isPED === false) {
      errors.travellerError[index].preExistingDiseaseError.valid = !errors.travellerError[index]
        .preExistingDiseaseError.valid;
      toastShowHide = "show";
      if (insurerID === 10) {
        toastText = lang.religarePedToggelMsg;
      } else {
        let a = lang.toastTextProposalStep1.replace("@planName", variantName);
        let b = a.replace("@insurerName", insurerName);
        toastText = b;
      }
    } else {
      toastShowHide = "hide";
    }

    travellerData.members[index].isPED = !isPED;

    this.setState(
      {
        travellerData,
        errors,
        isSubmitBtnDisabled,
        toastShowHide,
        toastText
      },
      this.clearPedAndEnableDisabelButton()
    );

    clearTimeout(timeOutId);
    const id = setTimeout(() => this.hideToast(), 8000);
    this.setState({
      timeOutId: id
    });
  };
  clearPedAndEnableDisabelButton = () => {
    this.clearIsPedFalseDisease();
    this.checkButtonEnabledDisabled();
  };

  clearIsPedFalseDisease = () => {
    let { travellerData, errors } = this.state;
    let { members } = travellerData;
    let { travellerError } = errors;

    members.forEach((member, memberIndex) => {
      let { isPED, questions } = member;
      if (!isPED) {
        questions.forEach(question => {
          question.answer = null;
        });

        errors.travellerError[memberIndex].preExistingDiseaseError.valid = true;

        travellerError &&
          travellerError[memberIndex] &&
          travellerError[memberIndex].pedIsAllowedToBuyError &&
          travellerError[memberIndex].pedIsAllowedToBuyError.forEach(x => {
            x.valid = true;
          });
      }
    });

    this.setState({
      travellerData,
      errors
    });
  };

  handelPedCheckBox = (memberIndex, questionID) => {
    let {
      travellerData,
      errors,
      isSubmitBtnDisabled,
      toastShowHide,
      timeOutId,
      toastText
    } = this.state;

    const { members } = travellerData;
    const { questions, variantName, insurerName } = members[memberIndex];
    const questionIndex = questions.findIndex(x => x.questionID === questionID);

    if (questionIndex !== -1) {
      const { answer, question, isAllowedToBuy, message } = questions[questionIndex];
      if (!isAllowedToBuy) {
        if (errors.travellerError.length > 0) {
          const pedQuestionIndex = errors.travellerError[
            memberIndex
          ].pedIsAllowedToBuyError.findIndex(x => x.questionID === questionID);
          if (pedQuestionIndex !== -1) {
            // travellerData.members[memberIndex].questions[questionIndex].answer =
            //   answer === true.toString() ? false.toString() : true.toString()

            travellerData.members[memberIndex].questions[questionIndex].answer =
              answer === question ? null : question;
            if (travellerData.members[memberIndex].questions[questionIndex].answer === question) {
              errors.travellerError[memberIndex].pedIsAllowedToBuyError[
                pedQuestionIndex
              ].valid = false;
              toastShowHide = "show";
              let a = lang.toastTextProposalStep1.replace("@planName", variantName);
              let b = a.replace("@insurerName", insurerName);
              toastText = b;
            } else {
              errors.travellerError[memberIndex].pedIsAllowedToBuyError[
                pedQuestionIndex
              ].valid = true;
              toastShowHide = "hide";
            }
            errors.travellerError[memberIndex].preExistingDiseaseError.valid = true;
            this.setState(
              {
                travellerData,
                errors,
                pedNotAllowedToBuyMessage: message,
                isSubmitBtnDisabled,
                toastShowHide,
                toastText
              },
              this.checkButtonEnabledDisabled
            );
          }
        }
      } else {
        // travellerData.members[memberIndex].questions[questionIndex].answer =
        //   answer === true.toString() ? false.toString() : true.toString()

        travellerData.members[memberIndex].questions[questionIndex].answer =
          answer === question ? null : question;
        errors.travellerError[memberIndex].preExistingDiseaseError.valid = true;
        this.setState({
          travellerData,
          errors
        });
      }

      clearTimeout(timeOutId);
      const id = setTimeout(() => this.hideToast(), 10000);
      this.setState({
        timeOutId: id
      });
    }
  };

  toggelDisclaimer = disclaimerID => {
    let { travellerData, errors, toastShowHide, toastText, timeOutId } = this.state;

    const { disclaimers } = travellerData;

    const disclaimerIndex = disclaimers.findIndex(
      disclaimer => disclaimer.disclaimerID === disclaimerID
    );
    if (disclaimerIndex > -1) {
      errors.tempdisclaimerError[disclaimerIndex].valid = !errors.tempdisclaimerError[
        disclaimerIndex
      ].valid;
      toastShowHide =
        travellerData.disclaimers[disclaimerIndex].valueToProceed ===
        travellerData.disclaimers[disclaimerIndex].defaultValue
          ? "show"
          : "hide";
      let a = lang.toastTextProposalStep1.replace("@planName", "this");
      let b = a.replace("@insurerName", "");
      toastText = b;
      travellerData.disclaimers[disclaimerIndex].defaultValue = !travellerData.disclaimers[
        disclaimerIndex
      ].defaultValue;
    }

    this.setState(
      {
        travellerData,
        errors,
        toastText,
        toastShowHide
      },
      this.checkButtonEnabledDisabled
    );
    clearTimeout(timeOutId);

    const id = setTimeout(() => this.hideToast(), 8000);
    this.setState({
      timeOutId: id
    });
  };

  hideToast = () => {
    this.setState({
      toastShowHide: "hide"
    });
  };

  closeToast = () => {
    this.hideToast();
  };

  closePremiumToast = () => {
    this.setState({
      premiumToastShowHide: "hide"
    });
  };

  closeGenricToast = () => {
    this.setState({
      genericToastShowHide: "hide"
    });
  };

  onChangeVisaType = (e, index) => {
    let { travellerData, errors, toastShowHide, toastText } = this.state;
    const { variantName, insurerName } = travellerData.members[index];
    travellerData.members[index].visaTypeID = parseInt(e.target.value, 10);

    const { error } = validateVisaType(
      errors.travellerError[index].visaTypeError,
      travellerData.members[index]
    );

    errors &&
      errors.travellerError &&
      errors.travellerError.length > 0 &&
      (errors.travellerError[index].visaTypeError = error);
    if (errors.travellerError[index].visaTypeError.valid === false) {
      toastShowHide = "show";
      let a = lang.toastTextProposalStep1.replace("@planName", variantName);
      let b = a.replace("@insurerName", insurerName);
      toastText = b;
    } else {
      toastShowHide = "hide";
    }
    setTimeout(() => this.hideToast(), 8000);
    this.setState({
      travellerData,
      errors,
      toastShowHide,
      toastText
    });
  };

  onChangenationality = (e, index) => {
    let {
      travellerData,
      errors,
      genericToastText,
      genericToastShowHide,
      toastShowHide,
      toastText
    } = this.state;
    const { variantName, insurerName } = travellerData.members[index];
    travellerData.members[index].nationalityID = parseInt(e.target.value, 10);

    const { error } = validateNationalityID(
      errors.travellerError[index].nationalityError,
      travellerData.members[index]
    );

    if (errors && errors.travellerError && errors.travellerError.length > 0) {
      errors.travellerError[index].nationalityError = error;
      if (error && error.showRemark === true) {
        genericToastShowHide = "show";
        genericToastText = lang.otherNationalityMsg;

        setTimeout(() => {
          this.closeGenricToast();
        }, 10000);
      }
      if (error && error.valid === false) {
        toastShowHide = "show";
        let a = lang.toastTextProposalStep1.replace("@planName", variantName);
        let b = a.replace("@insurerName", insurerName);
        toastText = b;
        setTimeout(() => {
          this.hideToast();
        }, 10000);
      }
    }

    this.setState({
      travellerData,
      errors,
      genericToastShowHide,
      genericToastText,
      toastShowHide,
      toastText
    });
  };

  renderPedQuestions = (question, index) => {
    const { errors } = this.state;
    const { questionID, question: name, answer, controlType } = question;

    if (controlType === 1) {
      return <div style={{ paddingTop: 0 }} className="question_text">{` `}</div>;
    } else if (controlType === 3) {
      return (
        <div
          className={`pro_check_box
        ${errors &&
          errors.travellerError[index].preExistingDiseaseError &&
          (errors.travellerError[index].preExistingDiseaseError.valid ? "" : "error_proposal")}

        `}
        >
          <input
            className="magic-checkbox"
            type="checkbox"
            name="layout"
            id={`chk${questionID}${index}`}
            value="option"
            // checked={answer === true.toString()}
            checked={answer !== null}
            onChange={() => this.handelPedCheckBox(index, questionID)}
          />
          <label className={`text`} htmlFor={`chk${questionID}${index}`}>
            {name}
          </label>
        </div>
      );
    }
  };

  handeltoastClickHere = () => {
    const { travellerData } = this.state;
    const { proposerID } = travellerData;
    const { encryptedProposerId } = this.props;
    this.props.history.push(`/v2/quotes/${encryptedProposerId}`);
  };

  renderToast() {
    const { toastShowHide, toastText } = this.state;
    let data = [];

    if (toastText.includes("click here")) {
      data = toastText.split("click here");
    }
    if (data.length > 0) {
      return (
        <div className={toastShowHide === "show" ? "toast top75" : "toast_show"}>
          <p>
            <i style={{ marginRight: 5 }} className="info"></i>
            {data[0]}
            <a style={{ cursor: "pointer", color: "blue" }} onClick={this.handeltoastClickHere}>
              {" "}
              click here{" "}
            </a>
            {data[1]}
            <span onClick={() => this.closeToast()} className="closeToast"></span>
          </p>
        </div>
      );
    } else {
      return (
        <div className={toastShowHide === "show" ? "toast top75" : "toast_show"}>
          <p>
            <i style={{ marginRight: 5 }} className="info"></i>
            {toastText}
            <a style={{ cursor: "pointer", color: "blue" }} onClick={this.handeltoastClickHere}>
              click here
            </a>
            <span onClick={() => this.closeToast()} className="closeToast"></span>
          </p>
        </div>
      );
    }
  }
  renderPremiumToast() {
    const { premiumToastShowHide, premiumToastText, modifyStep1Response } = this.state;

    const { premiumRevisedForProfiles } = modifyStep1Response;

    let revisedPremiumRow = [];

    premiumRevisedForProfiles &&
      premiumRevisedForProfiles.forEach(x => {
        const { premium, revisedPremium, memberCovered } = x;
        revisedPremiumRow.push(
          `Premium has been revised for ${memberCovered} from premium Rs ${parseInt(premium)} to Rs ${parseInt(revisedPremium)} due to age changed.`
        );
      });

    return (
      <div
        style={{  position: 'fixed', top: '10%'}}
        // style={{top:300}} 
        className={premiumToastShowHide === "show" ? "toast toast_top" : "toast_show"}
      >
        <i className="info"></i>
        {revisedPremiumRow &&
          revisedPremiumRow.length > 0 &&
          revisedPremiumRow.map(msg => {
            return (
              <p>
                {msg}
                <br />
              </p>
            );
          })}

        <span className="closeToast" onClick={() => this.proceedToProposalStep2()}></span>
      </div>
    );
  }

  checkButtonEnabledDisabled = () => {
    let isPedCheckedQuestionError = false;
    let { errors, isSubmitBtnDisabled } = this.state;
    let len = errors.tempdisclaimerError.filter(x => x.valid === false).length;
    let len1 = errors.travellerError.filter(x => x.preExistingDiseaseError.valid === false).length;

    errors.travellerError.forEach(x => {
      if (x.pedIsAllowedToBuyError.filter(y => y.valid === false).length > 0) {
        isPedCheckedQuestionError = true;
      }
    });

    if (len > 0) {
      isSubmitBtnDisabled = true;
    } else if (len1 > 0) {
      isSubmitBtnDisabled = true;
    } else if (isPedCheckedQuestionError) {
      isSubmitBtnDisabled = true;
    } else {
      isSubmitBtnDisabled = false;
    }

    this.setState({ isSubmitBtnDisabled });
    setTimeout(() => {
      this.checkButtonEnabledDisabled();
    }, 100); //temporary code , isSubmitBtnDisabled remain true, due to not setState
  };

  gaCustomEvent = () => {
    const { gaFlowName } = this.state;
    const gaData = {
      eventCategory: "Trv.BU Proposal 1",
      eventAction: "Trv.click",
      eventLabel: "Trv.Submit",
      eventValue: "",
      flowName: gaFlowName
    };
    customEvent(gaData);
  };

  showHideMobileViewTravellersAccordian = index => {
    const { travellerData } = this.state;
    travellerData.members.forEach((x, memberIndex) => {
      if (memberIndex === index) {
        travellerData.members[memberIndex].isAccordianTrue = true;
      } else {
        travellerData.members[memberIndex].isAccordianTrue = false;
      }
    });

    this.setState({
      travellerData
    });
  };

  checkhasTravellerFilledAllData() {
    const { travellerData } = this.state;
    const { members } = travellerData;
    members.forEach((x, index) => {
      const { dateOfBirth, visaTypeID, nationalityID } = x;
      if (dateOfBirth !== null && visaTypeID !== null && nationalityID !== null) {
        travellerData.members[index].hasTravellerFilledAllData = true;
      } else {
        travellerData.members[index].hasTravellerFilledAllData = false;
      }
    });

    this.setState({ travellerData });
  }

  // hideToast = () => {
  //   this.setState({
  //     techErrMsg: ""
  //   });
  // };

  render() {
    const {
      travellerData,
      errors,
      pedNotAllowedToBuyMessage,
      submittSpinnerShowHide,
      isSubmitBtnDisabled,
      overlapErrors,
      showLiveChat,
      genericToastText,
      genericToastShowHide,
      screenSize,
      techErrMsg
    } = this.state;

    const {
      members,
      isTravellingForMedicalAdvice,
      isTripStartingFromIndia,
      isTravellingAbroadForMedicalTreatment,
      destinations,
      noOfTravellers,
      tripStartDate,
      tripEndDate,
      disclaimers,
      proposerID,
      enquiryID
    } = travellerData;

    if (!_.isEmpty(travellerData)) {
      return (
        <div className="">
          {<Header handleShowLiveChat={this.handleShowLiveChat} />}
          <div></div>
          <div className="wrapper">
            <div className="container">
              <EditModal page="ProposalStep1" {...this.props} />
            </div>

            <MobileComponent showMobileError={this.state.showMobileError} />
            {/*
            <div className={techErrMsg ? "toast" : "toast_show"}>
              <p>
                <i className="info" />
                {techErrMsg}
                <span className="closeToast" onClick={this.hideToast} />
              </p>
            </div> */}
            {/* <MobileModal /> */}
            <div className="container">
              <div className="proper_contaner">
                <div className="propser_strip">{lang.proposalText1}</div>

                {members &&
                  members.map((member, index) => {
                    let {
                      isFocused,
                      dateOfBirth,
                      insuredMemberID,
                      visaTypeID,
                      nationalityID,
                      isPED,
                      questions,
                      denoteTraveller,
                      pedStatus,
                      age,
                      visaTypes,
                      nationalities,
                      calendarStartOn,
                      calendarEndOn,
                      relationTypeID,
                      relationType,
                      variantName,
                      logoURL,
                      isAccordianTrue,
                      hasTravellerFilledAllData
                    } = member;

                    return (
                      <div className="pro_travel_detail">
                        <div className="pro_travel_section clearfix">
                          <div class="row align-items-center collapseBox">
                            <div className="col-md-4">
                              <div className="row align-items-center">
                                <div className="form-group col-md-5 col-3 img">
                                  <div>
                                    <img style={{ paddingTop: 0 }} src={logoURL}></img>
                                    {/* <span> {variantName} </span>  */}
                                  </div>
                                </div>
                                <div
                                  className="form-group col-md-7 col-9 travellerName"
                                  onClick={() => this.showHideMobileViewTravellersAccordian(index)}
                                >
                                  <span className="traveller_name">
                                    {`${denoteTraveller} : `}
                                    {hasTravellerFilledAllData && (
                                      <i
                                        className="fa fa-check-circle-o check"
                                        aria-hidden="true"
                                      ></i>
                                    )}
                                  </span>
                                  <span className="traveller_age">
                                    {`${relationTypeID !== 11 ? relationType : ""} (${age} ${
                                      lang.yrs
                                    })`}
                                  </span>
                                  <i
                                    className={`fa ${
                                      isAccordianTrue ? "fa-angle-down" : "fa-angle-up"
                                    }`}
                                    aria-hidden="true"
                                  ></i>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`collapseDiv col-md-8 ${screenSize < 768 &&
                                (isAccordianTrue ? "show" : "hide")}`}
                            >
                              <div className="row align-items-center">
                                <div className="form-group col-md-3 col-12">
                                  <div
                                    className={`pro_box  calender_dob
                          ${errors &&
                            errors.travellerError[index].dobError &&
                            (errors.travellerError[index].dobError.valid ? "" : "error_proposal")}`}
                                    id={`divCalfocus${index}`}
                                  >
                                    <label htmlFor={`divCalender${index}`}>
                                      {lang.dateOfBirth}
                                    </label>
                                    <div className="dbo_Calendar" id={`divCalender${index}`}>
                                      <DatePicker
                                        className={`input_type selectCalenderDate`}
                                        selected={dateOfBirth ? moment(dateOfBirth).toDate() : null}
                                        onChange={e => this.handelCalenderEvents(e, index)}
                                        dateFormat={"d MMM yy"}
                                        showYearDropdown
                                        scrollableYearDropdown
                                        dropdownMode="select"
                                        showMonthDropdown={true}
                                        minDate={new Date(moment(calendarStartOn))}
                                        maxDate={new Date(moment(calendarEndOn))}
                                        onKeyDown={e => e.preventDefault()}
                                      />
                                    </div>
                                  </div>
                                  <div
                                    className={`${
                                      errors &&
                                      errors.travellerError[index].dobError &&
                                      errors.travellerError[index].dobError.valid === false
                                        ? "show error_textColor"
                                        : "hide"
                                    }`}
                                  >
                                    {errors &&
                                      errors.travellerError[index].dobError &&
                                      errors.travellerError[index].dobError.remarks}
                                  </div>
                                </div>

                                <div
                                  className="form-group col-md-3 col-12"
                                  style={{
                                    display: nationalities && nationalities.length > 0 ? "" : "none"
                                  }}
                                >
                                  <div
                                    className={`pro_box select ${errors &&
                                      errors.travellerError[index].nationalityError &&
                                      (errors.travellerError[index].nationalityError.valid
                                        ? ""
                                        : "error_proposal")}`}
                                    id={`divNationality${index}`}
                                  >
                                    <label htmlFor={`ddlNationality${index}`}>
                                      {lang.nationality}
                                    </label>
                                    <select
                                      style={{ cursor: "pointer" }}
                                      id={`ddlNationality${index}`}
                                      onChange={e => this.onChangenationality(e, index)}
                                      className="proposer_select"
                                    >
                                      {nationalities &&
                                        nationalities.map(item => {
                                          const { masterID, name } = item;
                                          return (
                                            <option
                                              value={masterID}
                                              selected={masterID === nationalityID}
                                            >
                                              {name}
                                            </option>
                                          );
                                        })}
                                    </select>
                                  </div>
                                </div>

                                <div
                                  className="form-group col-md-3 col-12"
                                  style={{
                                    display: visaTypes && visaTypes.length > 0 ? "" : "none"
                                  }}
                                >
                                  <div
                                    className={`pro_box select
                            ${errors &&
                              errors.travellerError[index].visaTypeError &&
                              (errors.travellerError[index].visaTypeError.valid
                                ? ""
                                : "error_proposal")}`}
                                    id={`divvisaType${index}`}
                                  >
                                    <label htmlFor={`divvisaType${index}`}>{lang.visaType}</label>

                                    <select
                                      style={{ cursor: "pointer" }}
                                      id={`ddlvisaType${index}`}
                                      onChange={e => this.onChangeVisaType(e, index)}
                                      className="proposer_select"
                                    >
                                      {visaTypes &&
                                        visaTypes.map(item => {
                                          const { masterID, name, isAllowedToBuy } = item;
                                          return (
                                            <option
                                              value={masterID}
                                              selected={masterID === visaTypeID}
                                            >
                                              {name}
                                            </option>
                                          );
                                        })}
                                    </select>
                                  </div>
                                </div>

                                <div className="form-group col-md-3 col-12 anyMedicalConditions">
                                  <label className="lblText" htmlFor={`toggelPed${index}`}>
                                    {lang.anyMedicalConditions}
                                  </label>
                                  <div className="slider">
                                    <input
                                      checked={isPED}
                                      type="checkbox"
                                      id={`toggelPed${index}`}
                                      className="switch-input"
                                      onClick={() => this.handelTravellersPed(index)}
                                    />
                                    <label
                                      htmlFor={`toggelPed${index}`}
                                      className="switch-label"
                                      id={`lbltoggelPed${index}`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`pro_travl_ped
                            ${
                              isPED && pedStatus !== 4 && questions && questions.length > 0
                                ? "show"
                                : "hide"
                            }
                            ${screenSize < 768 &&
                              (isAccordianTrue &&
                              isPED &&
                              pedStatus !== 4 &&
                              questions &&
                              questions.length > 0
                                ? "show"
                                : "hide")}`}
                          >
                            <div className="pro_travel_wrp">
                              <div className="pro_check_wrapper">
                                {questions
                                  .filter(parentQuestions => parentQuestions.parentQuestionID === 0)
                                  .map(parentQuestion => {
                                    const {
                                      questionID: parentPedQuestionID,
                                      name
                                    } = parentQuestion;
                                    return (
                                      <div className="question-list clearfix">
                                        {this.renderPedQuestions(parentQuestion, index)}
                                        {questions
                                          .filter(
                                            firstLayerQuestions =>
                                              firstLayerQuestions.parentQuestionID ===
                                              parentPedQuestionID
                                          )
                                          .map(firstLayerQuestion => {
                                            return (
                                              <div>
                                                {this.renderPedQuestions(firstLayerQuestion, index)}
                                              </div>
                                            );
                                          })}
                                      </div>
                                    );
                                  })}

                                {/* <div
                                className={`text-red ${
                                  errors && errors.travellerError && errors.travellerError.length > 0 && errors.travellerError[index].pedIsAllowedToBuyError.length > 0 &&
                                  (errors.travellerError[index].pedIsAllowedToBuyError.filter(x => x.valid === false).length > 0 ? 'show' : 'hide')}`
                                }
                              >
                                {pedNotAllowedToBuyMessage}
                              </div> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="travler_ped_section">
            <div className="container">
              <div className="row">
                <div className="col-md-10">
                  <div className="travler_ped_section_ped clearfix">
                    {disclaimers &&
                      disclaimers.length > 0 &&
                      disclaimers.map(disclaimer => {
                        const { disclaimerText, disclaimerID, defaultValue, tooltip } = disclaimer;
                        return (
                          <div className="slider_wrapper">
                            <div className="slider_member">
                              {disclaimerText}
                              <span className="tooltip">
                                <i className={`info_icon ${tooltip ? "" : "hide"}`}></i>
                                <span class="tooltiptext">{tooltip}</span>
                              </span>
                            </div>
                            <div className="slider">
                              <input
                                checked={defaultValue === true}
                                type="checkbox"
                                id={`toggeldisclaimer${disclaimerID}`}
                                className="switch-input"
                                onClick={() => this.toggelDisclaimer(disclaimerID)}
                              />
                              <label
                                htmlFor={`toggeldisclaimer${disclaimerID}`}
                                className="switch-label"
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className={`
                    proposal_submit
                    ${isSubmitBtnDisabled ? "disabled_effect" : ""}`}
                    id="btnSubmitProposalStep1"
                    onClick={this.modifyStep1Data}
                    disabled={isSubmitBtnDisabled}
                    style={{ cursor: "pointer" }}
                  >
                    {lang.proposal_Button_Save}
                    <div
                      className={`spinner-border text-primary ${submittSpinnerShowHide}`}
                      role="status"
                    >
                      <span className="sr-only"></span>
                    </div>
                  </button>
                  <div></div>
                </div>
              </div>
            </div>
          </div>

          {this.renderToast()}
          {this.renderPremiumToast()}
          {overlapErrors &&
            overlapErrors.map((message, id) => this.renderOverlapToast(message, id))}

          <GenericToast
            toastText={genericToastText}
            additionalClass={genericToastShowHide}
            handelclose={this.closeGenricToast}
          />
          {proposerID && enquiryID && (
            <ChatUI
              proposerID={proposerID}
              enquiryID={enquiryID}
              showLiveChat={showLiveChat}
              handleShowLiveChat={this.handleShowLiveChat}
            />
          )}

          <div className="cl"></div>
          <div className="proposal_footer">{<Footer />}</div>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

ProposalStep1.propTypes = {
  match: PropTypes.string.isRequired
};

const mapStatetoProps = state => {
  return {
    state,
    encryptedProposerId: state.encryptedProposerId,
    proposerId: state.proposerId,
    mobileNo: state.mobileNo,
    countryCode: state.countryCode,
    validMobileNo: state.validMobileNo
    // proposerId: state.proposerId,
    // enquiryId: state.enquiryId
  };
};

const mapDispatchtoProps = dispatch => {
  return {
    saveProposalStep1Data: data => dispatch(saveProposalStep1Data(data)),
    onUpdateMobileNumber: data => dispatch(onUpdateMobileNumber(data)),
    onUpdateMobileCountryCode: data => dispatch(onUpdateMobileCountryCode(data)),
    onInit: data => dispatch(onInit(data))
  };
};

export default connect(mapStatetoProps, mapDispatchtoProps)(ProposalStep1);
