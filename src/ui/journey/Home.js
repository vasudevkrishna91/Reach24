import React, { Component } from "react";
import axios from "axios";
import reactReferer from "react-referer";
import { detect } from "detect-browser";
import Cookies from "js-cookie";
import logo from "../../assets/images/logo.png";
import { lang } from "../../cms/i18n/en/index";
import CountryModal from "./Pre-Quote/NewCountryModal";
import MobileModal from "./Pre-Quote/MobileModal";
import CountrySearchModal from "./Pre-Quote/CountrySearchModal";
import { connect } from "react-redux";
import { extendMoment } from "moment-range";
import Moment from "moment";
// import { Autocomplete } from '@material-ui/lab';
import Autocomplete from "react-autocomplete";
import { Chip } from "@material-ui/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TextField from "@material-ui/core/TextField";
import { default as countryData } from "../../lib/countryDataLatest.json";
import config from "../../services/config";
import { removeEmptyKeys, transformPreQuoteDataForStore, getTemporaryId } from "../../utils/helper";
import { savePreQuotes, getPreQuote, initPreQuote } from "../../services/preQuote";
import * as _ from "lodash";
import { DESTINATION_LIMIT } from "./../../lib/helperData";
import validTravellerData from "../../utils/validation/traveller";
import validateDestinations from "../../utils/validation/destination";
import validatePreQuoteData from "../../utils/validation/preQuote";
import Header from "./../components/static/header";
import Footer from "./../components/static/footer";
import CountryCode from "../journey/MobileView/CountryCode/CountryCode";

import {
  onSelectField,
  onUpdateDestination,
  onUpdateMemberCount,
  setOperatorType,
  setFlowName,
  onInit,
  onUpdateStore,
  onUpdateMobileNumber,
  onUpdateMobileCountryCode,
  onUpdateTripDate
} from "../../store/actions/preQuoteActions";

import TravellersModal from "./Pre-Quote/TravellersModal";
import TripDateModal from "./Pre-Quote/TripDateModal";
import { default as diallingCodes } from "../../lib/diallingCodes.json";
//import { ShowDesktopchat } from "../../Chat/ScriptLiveChat";

import { varPushEvent, customEvent, virtualPageEvent, leadSubmitEvent } from "../../GA/gaEvents";
import { handleMessage } from "../../Chat/handleMsg";
import { default as dynamicData } from "../../lib/dynamicData.json";

import ChatUI from "../../Chat/Chat";
import CovidUpdate from "../components/static/covidUpdate";
import { stubTrue } from "lodash";

const moment = extendMoment(Moment);

class Home extends Component {
  value = "";

  constructor(props) {
    super(props);
    const { valid } = validatePreQuoteData(
      props.destinationsData,
      props.travellerData,
      props.dateRange,
      props.tripSource
    );
    this.mobileScreen = window.screen.width < 768 ? true : false;
    this.state = {
      toggleCountryModel: !this.mobileScreen,
      toggleTravelModel: false,
      toggleDateModel: false,
      currentField: props.currentField,
      showLiveChat: false,
      formattedDestinations: props.selectedDestinations,
      autoSearchData: countryData,
      hideShowZoneGrid: false,
      showMobileField: false,
      autoSearchValue: "",
      destinations: [],
      tempDestination: [],
      scrollTitle: false,
      validated: false,
      mobileNo: props.mobileNo,
      validMobileNo: props.validMobileNo,
      lastScrollPosition: 0,
      tripDateFocused: null,
      preQuoteCompleted: valid,
      dateRange: props.dateRange,
      hideSelectBoxes: false,
      travellerData: [],
      counter: getTemporaryId(props.travellerData),
      referrerList: ["google", "yahoo", "bing"],
      proposerId: props.proposerId,
      encryptedProposerId: props.encryptedProposerId,
      loading: false,
      getPrequoteResponseData: null,
      cms: dynamicData.filter(obj => obj.OfferId === "0")[0],
      toggleMobileViewModel: false,
      OpenMobileViewTripEndDate: false,
      showCovid: Cookies.get("covidDeclare") ? false : true
    };
    // this.loading = false;
    const browser = detect();
    this.Browser = browser.name;
    const referrer = reactReferer.referer();

    this.tripInput = React.createRef();
    this.destinationChip = React.createRef();
    this.travellerModal = React.createRef();
    this.utmMedium =
      this.getQueryStringValue("utm_medium") || this.getQueryStringValue("pb_medium") || "";
    this.utmCampaign =
      this.getQueryStringValue("utm_campaign") || this.getQueryStringValue("pb_campaign") || "";
    this.utmTerm =
      this.getQueryStringValue("utm_term") || this.getQueryStringValue("pb_term") || "";
    this.utmContent =
      this.getQueryStringValue("utm_content") || this.getQueryStringValue("pb_content") || "";

    if (referrer.trim() != "") {
      let str = referrer.split("//")[1].split("/")[0];
      this.result = _.find(this.state.referrerList, function (num) {
        return str.lastIndexOf(num) != -1;
      });
    }
    if (
      this.result &&
      (this.getQueryStringValue("utm_source") == null ||
        this.getQueryStringValue("utm_source") == undefined ||
        this.getQueryStringValue("utm_source") == "")
    ) {
      this.utmSource = "organic";
    } else {
      this.utmSource =
        this.getQueryStringValue("utm_source") || this.getQueryStringValue("pb_source") || "";
    }
  }

  getQueryStringValue = key => {
    return decodeURIComponent(
      window.location.href.replace(
        new RegExp(
          "^(?:.*[&\\?]" +
          encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
          "(?:\\=([^&]*))?)?.*$",
          "i"
        ),
        "$1"
      )
    );
  };

  static getDerivedStateFromProps(props, state) {
    const { valid } = validatePreQuoteData(
      props.destinationsData,
      props.travellerData,
      props.dateRange,
      props.tripSource
    );

    if (props.selectedDestinations && state.formattedDestinations !== props.selectedDestinations) {
      return {
        formattedDestinations: props.selectedDestinations,
        tempDestination: props.destinationsData,
        preQuoteCompleted: valid,
        scrollTitle:
          props.selectedDestinations.length >= state.formattedDestinations.length &&
            props.selectedDestinations.length >= 2
            ? true
            : false
      };
    }
    if (state.currentField !== props.currentField) {
      return {
        currentField: props.currentField,
        preQuoteCompleted: valid
      };
    }

    if (state.mobileNo && props.mobileNo !== state.mobileNo) {
      return {
        mobileNo: props.mobileNo,
        preQuoteCompleted: valid
      };
    }

    if (state.dateRange && props.dateRange !== state.dateRange) {
      return {
        dateRange: props.dataRange,
        preQuoteCompleted: valid
      };
    }
    window.addEventListener("message", handleMessage, false);
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { travellerData } = this.props;
    const { showMobileField, scrollTitle } = this.state;
    if (!_.isEmpty(travellerData) && prevProps.travellerData !== travellerData) {
      this.setState({
        counter: getTemporaryId(travellerData)
      });
    }

    // if (scrollTitle !== prevState.scrollTitle && scrollTitle && !showMobileField) {
    //   this.handlewindowScroll();
    // }
  }

  handlewindowScroll = () => {
    const nextInput = document.getElementById("main-body");
    setTimeout(() => {
      this.setState({
        scrollTitle: false
      });
      nextInput.scrollIntoView({ behavior: "smooth" });
    }, 3000);
  };

  handleShowLiveChat = type => {
    this.setState({
      showLiveChat: type
    });
  };

  // get flow name
  setFlownameFunc = () => {
    let gaClientID = Cookies.get("ClientID");
    var payload = `Key=TravelCJCookie&value=&visitId=0&VisitorToken=null&UtmSource=${this.utmSource}&UtmMedium=${this.utmMedium}&UtmTerm=${this.utmTerm}&UtmCampaign=${this.utmCampaign}&LeadSource=PB&ProcessType=5&GAClientID=${gaClientID}&IpAddress=${this.state.ipAddress}&encMobileNo=undefined&cjtype=2`;
    const res = axios.get(`${config.apiEnquiryId}?${payload}`).then(resp => {
      if (resp && resp.status == 200) {
        let cookie = Cookies.get("TravelCjCookie");
        cookie = cookie
          ? JSON.parse(decodeURIComponent(decodeURI(cookie.split("="))))
          : { flowName: "" };
        this.props.setFlowName(cookie);
        this.CallGaEvent();
      }
    });
  };

  // Get IP Address
  GetIpAddress = () => {
    let ipaddress = "";
    const res = axios
      .get(`${config.apiIpLocator}`)
      .then(resp => {
        if (resp && resp.status == 200) {
          if (!_.isEmpty(resp.data)) {
            let { data } = resp;
            ipaddress = data[0].ipFound;
            this.setState(
              {
                ipAddress: data[0].ipFound
              },
              () => {
                this.GetIpLocation();
                this.initPrequote();
              }
            );
          }
        }
      })
      .catch(err => {
        // console.log(err);
      });
  };
  // Check ip address
  GetIpLocation = () => {
    let { ipAddress } = this.state;
    const res = axios.get(`${config.iPLocator}${ipAddress}`).then(resp => {
      if (resp && resp.status == 200) {
        let { data } = resp;
        let operatorType = data ? "agent" : "user";
        this.props.setOperatorType(operatorType);
      }
    });
  };
  // Call GA varpush
  CallGaEvent = () => {
    const payload = {
      ProposerID: this.state.proposerId,
      operatorType: this.props.operatorTypeGA,
      flowName: this.props.flowNameGA,
      VisitID: this.state.visitId
    };
    varPushEvent(payload);
  };

  hideSeo = () => {
    document.querySelector(".tttttt h1").setAttribute("style", "font-size:0");
    var seoTxt = document.querySelector(".tttttt");
    seoTxt.setAttribute("style", "font-size: 0");
  };

  componentDidMount = async () => {
    window.addEventListener("scroll", this.handleScroll);
    await this.GetIpAddress();
    document.getElementById("myText").focus();
    setTimeout(() => this.hideSeo(), 100);
    let offerId = this.getQueryStringValue("offerId");
    offerId = parseInt(offerId);
    offerId = !offerId || isNaN(offerId) ? "0" : +offerId > 19 ? "0" : offerId;
    this.setState({
      cms: dynamicData.filter(obj => obj.OfferId == offerId)[0]
    });
    const elementTripStartDate = document.getElementById("txtMobileViewTripStartDate");
    if (elementTripStartDate) {
      elementTripStartDate.setAttribute("readonly", "readonly");
    }

    const elementTripEndDate = document.getElementById("txtMobileViewTripEndDate");

    if (elementTripEndDate) {
      elementTripEndDate.setAttribute("readonly", 'readonly');
      elementTripEndDate.setAttribute("disabled", true);

    }
  };

  // initChat = () => {
  //   let data = {
  //     leadid: '',
  //     enquiryId: this.state.enquiryID,
  //     encId: ''
  //   }
  //   ShowDesktopchat(data)
  // }

  initPrequote = async () => {
    const body = this.initPreQuoteRequestData();
    const { onInit } = this.props;
    const { proposerId, encryptedProposerId } = this.state;
    const enProposer = this.getQueryStringValue("encryptedProposerId");

    if (enProposer) {
      this.setState({ proposerId, encryptedProposerId: enProposer }, () =>
        onInit({
          proposerId: proposerId,
          enquiryID: "",
          encryptedProposerId: enProposer
        })
      );
      body.proposerId = proposerId ? proposerId : 0;
      body.encryptedProposerId = enProposer ? enProposer : "";

      const encryptedProposerId = this.props.encryptedProposerId;

      this.getPreQuoteV2(proposerId, body);
      // this.setState({getPrequoteResponseData:res})
      // const data = transformPreQuoteDataForStore(res)
      //  this.props.onUpdateStore(data);
    } else if (proposerId) {
      this.getPreQuoteV2(proposerId, body);
    } else {
      try {
        const res = await initPreQuote(body, encryptedProposerId);
        if (res && res.data) {
          const proposerId = res.data.proposerID;
          const encryptedProposerId = res.data.encryptedProposerID;
          const enquiryId = res.data.enquiryID;
          const visitId = res.data.visitID;

          this.setState(
            {
              proposerId,
              enquiryID: enquiryId,
              encryptedProposerId,
              visitId
            },
            () => {
              onInit({ proposerId, enquiryId, encryptedProposerId });
              this.setFlownameFunc();
            }
          );
        }
      } catch (err) {
        this.setState({
          techErrMsg: lang.technicalIssue
        });
      }
    }

    //this.initChat()
  };

  getPreQuoteV2 = async (proposerId, body) => {
    const { onInit } = this.props;
    const { encryptedProposerId, apiHitted } = this.state;
    try {
      if (!apiHitted) {
        this.setState({ apiHitted: true });
        const res = await getPreQuote(proposerId, encryptedProposerId);

        if (res.data.errorCode === 6) {
          this.props.history.push(`/v2/checkout/${encryptedProposerId}`);
        }

        this.setState({
          getPrequoteResponseData: res,
          isLeadCreated: res.data.data.isLeadCreated,
          enquiryId: res.data.enquiryID
          // apiHitted: false
        });
        const data = transformPreQuoteDataForStore(res);
        const response = await initPreQuote(body, encryptedProposerId);
        if (response && response.data) {
          const ProposerID = response.data.proposerID;
          this.setState({
            enquiryID: response.data.enquiryID,
            apiHitted: false
          });

          if (response.data.encryptedProposerID) {
            this.setState(
              {
                proposerId: ProposerID,
                enquiryId: response.data.enquiryID,
                encryptedProposerId: response.data.encryptedProposerID,
                mobileNo: "",
                validMobileNo: false,
                apiHitted: false,
                countryCode: "91"
              },
              () => {
                data.mobileNo = "";
                data.validMobileNo = false;
                if (res && !res.data.hasError) {
                  this.props.onUpdateStore(data);
                }
                onUpdateMobileCountryCode({ countryCode: "91", valid: false });
                let storeData = {
                  proposerId: ProposerID,
                  enquiryId: response.data.enquiryID,
                  encryptedProposerId: response.data.encryptedProposerID
                };
                onInit(storeData);
              }
            );
          } else {
            if (res && !res.data.hasError) {
              this.props.onUpdateStore(data);
            }
          }
        } else {
          if (res && !res.data.hasError) {
            this.props.onUpdateStore(data);
          }
        }
      }
    } catch (err) {
      this.setState({
        techErrMsg: lang.technicalIssue
      });
    }
  };

  changeCounter = count => {
    this.setState({ counter: count });
  };

  initPreQuoteRequestData = () => {
    const { proposerId, ipAddress } = this.state;

    const requestData = {
      VisitID: 0,
      EnquiryID: 0,
      Utm_Source: this.utmSource,
      Utm_Medium: this.utmMedium,
      Utm_Term: this.utmTerm,
      Utm_Campaign: this.utmCampaign,
      Utm_Content: this.utmContent,
      LeadSource: "PB",
      MobileNo: "",
      CJTypeID: config.CJType,
      IPAddress: ipAddress,
      Browser: this.Browser,
      gaClientID: Cookies.get("ClientID"),
      proposerId: proposerId ? proposerId : 0,
      productId: 3
    };
    //const params = removeEmptyKeys(requestData);

    return requestData;
  };

  UNSAFE_componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  closeToast = () => {
    this.setState({
      indiaError: ""
    });
  };

  handleScroll = e => {
    const { lastScrollPosition } = this.state;
    if (lastScrollPosition !== window.scrollY && window.scrollY >= 70) {
      this.setState({ lastScrollPosition: window.scrollY });
    } else if (lastScrollPosition !== window.scrollY && window.scrollY < 50) {
      this.setState({ lastScrollPosition: 0 });
    }
  };

  handleSelectCountry = async e => {
    e.preventDefault();
    const { toggleCountryModel } = this.state;

    this.setState({
      toggleCountryModel: true,
      toggleTravelModel: false,
      currentField: "country",
      tripDateFocused: null
    });

    this.hideShowZoneGrid();
    this.props.onSelectField("country");
    this.getChipsFocused();
  };

  hideShowZoneGrid = () => {
    this.setState({ hideShowZoneGrid: true });
  };

  gaLeadSubmit = () => {
    const payload = {
      ProposerID: this.state.proposerId,
      pageName: "Trv.BU lead",
      pageType: "Trv.Lead"
    };
    leadSubmitEvent(payload);
  };

  handleGetQuote = async () => {
    const { isPed, destinationsData, travellerData, dateRange, mobileNo, countryCode } = this.props;

    const {
      ipAddress,
      getPrequoteResponseData,
      encryptedProposerId,
      apiHitted,
    } = this.state;

    // let filterCode = ''

    //   if(countryCode === '+91' || countryCode === '91' ) {
    //     filterCode = '392'

    //   } else {
    //     // countryCode = countryCode.replace("+", "");
    //     // console.log('>>>.....', countryCode, isvalid, mobileNo, validMobileNo)

    //     filterCode = diallingCodes["Final Countries"].filter(
    //       x => x.CountryDialingCode === countryCode.replace("+", "")
    //     )[0]["CountryID - Travel CJ"]
    //   }


    const mobileData = diallingCodes["Final Countries"].filter(
      x => x.CountryDialingCode === countryCode.replace("+", "")
    )
    const { proposerId, loading } = this.state;
    let utmDetail = {
      utm_Source: this.utmSource,
      utm_Medium: this.utmMedium,
      utm_Term: this.utmTerm,
      utm_Campaign: this.utmCampaign,
      utm_Content: this.utmContent,
      leadSource: "PB",
      source: "dummy",
      gclid: Cookies.get("ClientID")
    };

    let data = {
      isPed: isPed ? 1 : 0,
      SourceTypeID: 1,
      CJType: 1,
      destinationsData,
      travellerData,
      tripStartDate: moment(dateRange[0]).format("YYYY-MM-DD"),
      tripEndDate: moment(dateRange[1]).format("YYYY-MM-DD"),
      proposerId,
      MobileNo: this.props.mobileNo,
      CountryID: mobileData[0]["CountryID - Travel CJ"],
      utmDetail,
      ipAddress: ipAddress,
      browser: this.Browser,
      getPrequoteResponseData,
      encryptedProposerId: this.state.encryptedProposerId
    };
    // debugger;
    if (this.validateData() && !loading && this.state.encryptedProposerId && !apiHitted) {
      const { history } = this.props;
      this.setState({ loading: true }, async () => {
        try {
          const result = await savePreQuotes(data);
          // this.loading = true;
          // if(!result.hasError) window.location.href = result.redirectURL;
          window.scrollTo(0, 0);
          // this.gaLeadSubmit();
          if (!result.hasError && encryptedProposerId) {
            history.push({
              pathname: `/v2/quotes/${encryptedProposerId}`,
              state: { proposerID: result.proposerID, ipAddress, encryptedProposerId }
            });
            // this.loading = false;
            // this.setState({ loading: false });
          } else {
            // this.loading = false;
            this.setState({
              loading: false,
              techErrMsg: lang.technicalIssue
            });
          }
        } catch (err) {
          this.setState({
            techErrMsg: lang.technicalIssue
          });
        }
      });
    }

    if (!this.state.encryptedProposerId) {
      this.setState({
        techErrMsg: lang.technicalIssue
      });
    }
    // const res = await axios.post(`${config.baseUrl}${config.endpoints.init}`, body);
  };

  handlekeyDown = e => {
    const {
      currentField,
      toggleTravelModel,
      toggleCountryModel,
      tripDateFocused,
      showMobileField
    } = this.state;

    const { selectedDestinations } = this.props;

    const valid = this.validateData();
    // console.log('123 >>>>> On Key Down ', e.key, showMobileField, valid);

    if (e.key === "Enter") {
      // console.log('ENter key press',e.key,currentField,tripDateFocused);

      if (showMobileField && valid) {
        // console.log('123 YEs I am calles')
        this.handleEnterKey(e, "mobile");
        return;
      }

      if (currentField === "country" && toggleCountryModel && !_.isEmpty(selectedDestinations)) {
        this.closeModel();
        return;
      }

      // if(currentField === 'traveller' && toggleTravelModel) {
      //   this.closeTravelModel()
      //   return;
      // }

      if (currentField === "tripDate" && tripDateFocused === null) {
        // this.showMobileField()
        // return;
        this.handleEnterKey(e, "mobile");
        return;
      }

      if (currentField === "tripDate") {
        this.handleEnterKey(e, "mobile");
        return;
      }
    }
  };

  validateData = () => {
    const {
      isPed,
      destinationsData,
      travellerData,
      dateRange,
      mobileNo,
      validMobileNo,
      countryCode,
      timezone
    } = this.props;

    const { showMobileField, preQuoteCompleted } = this.state;

    if (window.screen.width < 768 && preQuoteCompleted) {
      if (mobileNo && mobileNo.length === 10) {
        if (countryCode === "91") {
          if (
            mobileNo.charAt(0) === "8" ||
            mobileNo.charAt(0) === "9" ||
            mobileNo.charAt(0) === "7" ||
            mobileNo.charAt(0) === "6" ||
            mobileNo.charAt(0) === "*"
          ) {
            return true;
          } else {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    }

    if (
      !destinationsData ||
      !destinationsData.length ||
      // !validMobileNo ||
      // !mobileNo ||
      // mobileNo.length!==10||
      !moment(dateRange[0]).format("DD-MM-YYYY") ||
      !moment(dateRange[1]).format("DD-MM-YYYY") ||
      !travellerData ||
      !travellerData.length
      // !showMobileField ||
      // !countryCode
    ) {
      return;
    }

    return true;
  };

  closeCountryModal = () => {
    this.setState({
      toggleCountryModel: false,
      toggleTravelModel: false,
      currentField: "traveller"
    });
    this.props.onSelectField("traveller");
  };

  closeModel = () => {
    const { toggleCountryModel } = this.state;
    this.setState(
      {
        toggleCountryModel: false,
        tripDateFocused: null,
        toggleTravelModel: true && !this.mobileScreen,
        currentField: "traveller"
      },
      () => {
        const nextInput2 = document.querySelectorAll('[tabindex="traveller_0"]');
        if (nextInput2[0]) {
          nextInput2[0].focus();
        }
      }
    );

    this.props.onSelectField("traveller");
  };

  handleTravelSelect = () => {
    const { toggleTravelModel } = this.state;

    this.setState({
      toggleTravelModel: true,
      toggleCountryModel: false,
      tripDateFocused: null,
      currentField: "traveller"
    });

    this.travellerModal.current.click();
    this.props.onSelectField("traveller");
    this.setState({
      countrySearchValue: "",
      autoSearchValue: "",
      showCountrySearchModal: false
    });
  };

  handleStartDateSelect = () => {
    const { toggleDateModel } = this.state;

    this.setState({
      toggleTravelModel: false,
      toggleCountryModel: false,
      toggleDateModel: !toggleDateModel
    });
    this.props.onSelectField("tripDate");
  };

  onCountryChange = e => {
    const newValue = e.target.value.replace(/[^a-zA-Z]+/, "");
    this.setState({
      countrySearchValue: newValue,
      autoSearchValue: newValue,
      showCountrySearchModal: newValue ? true : false,
      toggleTravelModel: false,
      toggleDateModel: false,
      tripDateFocused: null
      // currentField: 'country'
    });
  };

  // closeTripModel = () => {
  //   const { toggleDateModel } = this.state;
  //   this.setState({ toggleDateModel: !toggleDateModel });
  // };

  closeOtherModel = () => {
    this.setState(
      {
        toggleCountryModel: false,
        toggleTravelModel: false,
        currentField: "tripDate",
        tripDateFocused: null
      },
      () => {
        // tabIndex="country_free_quotes"
        const nextInput2 = document.querySelectorAll('[tabindex="country_free_quotes"]');
        if (nextInput2[0]) {
          nextInput2[0].focus();
        }
      }
    );

    this.props.onSelectField("tripDate");
  };

  closeTravelModel = () => {
    const { toggleTravelModel } = this.state;

    this.setState({
      toggleTravelModel: false,
      toggleCountryModel: false,
      tripDateFocused: this.mobileScreen ? "" : "startDate",
      currentField: "tripDate"
    });

    this.props.onSelectField("tripDate");
  };

  closeTripDateModel = () => {
    const { toggleDateModel } = this.state;

    this.setState({
      toggleTravelModel: false,
      toggleCountryModel: false,
      toggleDateModel: false
      // tripDateFocused: "startDate",
      // currentField: "tripDate"
    });

    // this.props.onSelectField("tripDate");
  };

  handleAutoCompleteSelect = (val, item) => {
    let { formattedDestinations, autoSearchData, destinations, tempDestination } = this.state;

    if (!_.isEmpty(formattedDestinations)) {
      let index = formattedDestinations.findIndex(dest => dest === item.CountryName);
      if (index === -1) {
        formattedDestinations.push(item.CountryName);
      }
    } else {
      formattedDestinations.push(item.CountryName);
    }

    // autoSearchData = autoSearchData.filter(obj => obj.CountryName !== item.CountryName);
    destinations.push(item);
    let obj = {
      CountryID: item.CountryID,
      CountryName: item.CountryName,
      Zone2: item.CountryName
    };
    if (tempDestination.findIndex(dest => dest.CountryName === item.CountryName) === -1) {
      tempDestination.push(obj);
    }
    this.props.onUpdateDestination({ formattedDestinations, destinations: tempDestination });
    this.setState({ autoSearchData, tempDestination, countrySearchValue: "" });
  };

  removeDestination = (e, item) => {
    let { formattedDestinations, destinations, autoSearchData, tempDestination } = this.state;

    const { onUpdateDestination, destinationsData } = this.props;
    let destination = [];

    let updatedDestinationsData = _.cloneDeep(destinationsData);

    //
    formattedDestinations = formattedDestinations.filter(dest => dest !== item);

    for (let i = 0; i < updatedDestinationsData.length; i++) {
      if (updatedDestinationsData[i].CountryName !== item) {
        destination.push(updatedDestinationsData[i]);
      } else {
        let index = updatedDestinationsData.findIndex(dest => dest.CountryName === item);
        if (index !== -1) {
          // autoSearchData.push(updatedDestinationsData[i]);
          updatedDestinationsData.splice(index, 1);
        }
      }
    }

    this.setState(
      {
        formattedDestinations,
        destinations: updatedDestinationsData,
        autoSearchData,
        tempDestination,
        alert: ""
      },
      () => onUpdateDestination({ formattedDestinations, destinations: updatedDestinationsData })
    );
  };

  showDestinationSelected = () => {
    const { formattedDestinations } = this.state;
    // const { length } = formattedDestinations;
    if (formattedDestinations.length > 1) {
      return `${formattedDestinations[0]}, +${formattedDestinations.length - 1}more `;
    }
    // if (formattedDestinations.length === 2) {
    //   return `${formattedDestinations[0]} & ${formattedDestinations[1]} `;
    // }
    return `${formattedDestinations[0]}`;
  };

  showZoneGridDisplay = cond => {
    this.setState({ hideShowZoneGrid: !cond });
  };

  getChipsFocused = () => {
    this.destinationChip.current && this.destinationChip.current.focus();
  };

  gaCustomEvent = () => {


    const gaData = {
      eventCategory: "Trv.BU Prequotes",
      eventAction: "Trv.click",
      eventLabel: "Trv.Proceed",
      eventValue: "",
      flowName: this.props.flowNameGA
    };
    customEvent(gaData);
  };

  gaVirtualEvent = () => {
    const { visitId } = this.props;

    const payload = {
      ProposerID: this.state.proposerId,
      pageName: "Trv.BU lead",
      pageType: "Trv.Lead",
      flowName: this.props.flowNameGA,
      visitId: this.state.visitId
    };
    virtualPageEvent(payload);
  };

  getFreeQuotes = async () => {
    const { preQuoteCompleted } = this.state;
    const {
      isPed,
      destinationsData,
      travellerData,
      dateRange,
      encryptedProposerId,
      mobileNo,
      countryCode,
      flowNameGA,
      selectedDestinations
    } = this.props;

    const { ipAddress, getPrequoteResponseData, isLeadCreated, loading, apiHitted } = this.state;

    if (!preQuoteCompleted) return;

    const mobileData = diallingCodes["Final Countries"].filter(
      x => x.CountryDialingCode === countryCode.replace("+", "")
    )

    const { proposerId } = this.state;
    let utmDetail = {
      utm_Source: this.utmSource,
      utm_Medium: this.utmMedium,
      utm_Term: this.utmTerm,
      utm_Campaign: this.utmCampaign,
      utm_Content: this.utmContent,
      leadSource: "PB",
      source: "dummy",
      gclid: Cookies.get("ClientID")
    };

    let data = {
      isPed: isPed ? 1 : 0,
      SourceTypeID: 1,
      CJType: 1,
      destinationsData,
      travellerData,
      tripStartDate: moment(dateRange[0]).format("YYYY-MM-DD"),
      tripEndDate: moment(dateRange[1]).format("YYYY-MM-DD"),
      proposerId,
      MobileNo: mobileNo,
      CountryID: mobileData[0]["CountryID - Travel CJ"],
      utmDetail,
      ipAddress,
      browser: this.Browser,
      getPrequoteResponseData,
      encryptedProposerId: this.state.encryptedProposerId
    };




    
    const gaData1 = {
      eventCategory: "Trv.BU Prequotes",
      eventAction: "Trv.Countries Selected",
      eventLabel: selectedDestinations.toString(),
      eventValue: "",
      flowName: flowNameGA
    };

    if (selectedDestinations.length > 0) {
      customEvent(gaData1);
    }


    const gaData2 = {
      eventCategory: "Trv.BU Prequotes",
      eventAction: "Trv.Traveller Number",
      eventLabel: travellerData.length,
      eventValue: "",
      flowName: flowNameGA
    };
    customEvent(gaData2);

    travellerData.map(val => {

      if(val.age) {
        const trvData = {
          eventCategory: "Trv.BU Prequotes",
          eventAction: "Trv.Travellers",
          eventLabel: `Traveller_${val.age}`,
          eventValue: "",
          flowName: flowNameGA
        };
        customEvent(trvData);
      }
    });

    try {
      // if (!isLeadCreated) {
      //   savePreQuotes(data);
      // } else
      if (this.state.encryptedProposerId && !loading && !apiHitted) {
        this.setState({ loading: true });
        const result = await savePreQuotes(data);
        // this.gaLeadSubmit();
        if (!result.hasError && this.state.encryptedProposerId) {
          this.props.history.push({
            pathname: `/v2/quotes/${encryptedProposerId}`,
            state: { proposerID: result.proposerID, ipAddress, encryptedProposerId }
          });
          // window.scrollTo(0,0);
          this.setState({ loading: false });
        } else {
          this.setState({
            loading: false,
            techErrMsg: lang.technicalIssue
          });
        }
      }
      if (!this.state.encryptedProposerId) {
        this.setState({
          loading: false,
          techErrMsg: lang.technicalIssue
        });
      }
    } catch (err) {
      this.setState({
        loading: false,
        techErrMsg: lang.technicalIssue
      });
    }
    const nextInput = document.querySelector('[tabindex="country_free_quotes"]');
    nextInput && nextInput.blur();

    window.scrollTo(0, 0);
    this.setState(
      {
        toggleMobileViewModel: true,
        showMobileField: false,
        currentField: "mobileNumber"
      },
      () => {
        this.props.onSelectField("mobileNumber");
        this.gaCustomEvent();
        this.gaVirtualEvent();
      }
    );
  };

  showMobileField = () => {
    const { destinationsData, travellerData, dateRange, tripSource } = this.props;
    const { valid } = validatePreQuoteData(destinationsData, travellerData, dateRange, tripSource);

    this.setState({
      tripDateFocused: null,
      currentField: null,
      preQuoteCompleted: valid
    });
  };

  validPreQuoteData = () => {
    const { destinationsData, travellerData, dateRange, tripSource } = this.props;
    const { valid } = validatePreQuoteData(destinationsData, travellerData, dateRange, tripSource);

    return valid;
  };

  autoSearchDataSort = (a, b) => {
    if (a.CountryName < b.CountryName) {
      return -1;
    }
    return 0;
  };

  renderAutoSearchData = () => {
    const { autoSearchData: originalData, formattedDestinations } = this.state;

    let autoSearchData = _.cloneDeep(originalData);
    autoSearchData = autoSearchData.sort(this.autoSearchDataSort);
    if (formattedDestinations.length) {
      formattedDestinations.forEach(dest => {
        let index = autoSearchData.findIndex(data => data.CountryName === dest);
        if (index !== -1) {
          autoSearchData.splice(index, 1);
        }
      });
    }
    return autoSearchData;
  };

  hideMobileField = () => {
    this.setState({
      showMobileField: false,
      currentField: "country",
      toggleCountryModel: true,
      tripDateFocused: null,
      toggleTravelModel: false
    });
    this.props.onSelectField("country");

    const gaData = {
      eventCategory: "Trv.BU Prequotes",
      eventAction: "Trv.click",
      eventLabel: "Trv.Back",
      eventValue: "",
      flowName: this.props.flowNameGA
    };
    customEvent(gaData);
  };

  showFieldChecked = field => {
    const {
      countrySearchValue,
      toggleCountryModel,
      toggleTravelModel,
      currentField,
      tripDateFocused,
      mobileNo,
      validMobileNo
    } = this.state;

    const { destinationsData, travellerData, dateRange, tripSource } = this.props;
    if (field === "destination") {
      const { valid } = validateDestinations(destinationsData, tripSource);
      return !countrySearchValue && !toggleCountryModel && valid;
    }

    if (field === "traveller") {
      const { valid } = validTravellerData(travellerData);
      return !toggleTravelModel && valid;
    }

    if (field === "tripDate") {
      return (
        tripDateFocused !== "startDate" &&
        tripDateFocused !== "endDate" &&
        dateRange[0] &&
        dateRange[1] &&
        dateRange[0]._isValid &&
        dateRange[1]._isValid
      );
    }

    if (field === "tripStartDate") {
      if (dateRange && dateRange[0]) {
        return dateRange[0]._isValid;
      }
    }

    if (field === "tripEndDate") {
      if (dateRange && dateRange[1]) {
        return dateRange[1]._isValid;
      }
    }

    if (field === "mobileNo") {
      return validMobileNo;
    }
  };

  handleTabKeyInCountry = e => {
    let nextInput = "";
    e.preventDefault();

    if (e.key === "Tab") {
      nextInput = document.querySelector('[tabindex="1"]');
      if (nextInput) {
        nextInput.focus();
      }
    } else {
      // || (charCode > 96 && charCode < 123)
      var charCode = e.keyCode;
      if (charCode > 64 && charCode < 91) {
        this.setState({
          countrySearchValue: e.key,
          autoSearchValue: e.key,
          showCountrySearchModal: e.key ? true : false
        });
      }
    }
  };

  handleEnterKey = (e, type) => {
    const { loading, enterCount } = this.state;
    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Enter" && !loading && !enterCount) {
      if (type === "mobile") {
        this.setState({ enterCount: true }, () => {
          this.getFreeQuotes();
          // this.handleGetQuote("mobile");
          return;
        });
      }
      if (type === "country") {
        this.getFreeQuotes();
      }
    }
    if (e.key === "Tab") {
      if (type === "mobile") {
        const ele = document.querySelector('[tabindex="mobile_back_button"]');
        ele.focus();
      }
    }
  };

  showWithinIndiaDestinationError = error => {
    this.setState({
      indiaError: error
    });
  };
  renderMainBody = () => {
    const {
      toggleCountryModel,
      toggleTravelModel,
      currentField,
      countrySearchValue,
      toggleDateModel,
      showCountrySearchModal,
      formattedDestinations,
      autoSearchData,
      autoSearchValue,
      alert,
      tempDestination,
      hideShowZoneGrid,
      showMobileField,
      tripDateFocused,
      preQuoteCompleted,
      counter,
      indiaError,
      loading,
      cms,
      toggleMobileViewModel,
      OpenMobileViewTripEndDate
    } = this.state;

    const {
      isPed,
      destinationsData,
      travellerData,
      dateRange,
      mobileNo,
      validMobileNo,
      membercount
    } = this.props;

    return (
      <div className="container" onKeyDown={this.handlekeyDown}>
        {indiaError && (
          <div class="remove_panls">
            <ul>
              <li></li>
              <li>
                <p>{indiaError}</p>
              </li>
              <li>
                <span class="close_plan" onClick={this.closeToast}></span>
              </li>
            </ul>
          </div>
        )}

        <h3 class="heading">{cms.Headline1 || lang.titleText}</h3>
        <h5 class="sub-heading">{cms.Headline2 || lang.titleTextSub}</h5>
        <div className="pre_main_wrapper" id="main-body">
        <div className="row pre_main booking-section" onKeyDown={this.handlekeyDown}>
            {
              <div
                class="col-md-9"
                id="input-outside-click"
                onKeyDown={this.handlekeyDown}
                tabIndex="0"
              >
                {!showMobileField && (
                  <div class="row">
                    <div
                      class={` col-md-5 col-12 mobile-view-search country-search
                        ${
                          currentField === "country"
                            ? !_.isEmpty(formattedDestinations)
                              ? "selected"
                              : "_active"
                            : ""
                        }
                        `}
                    >
                      <label
                        className={currentField === "country" ? "tab_active" : null}
                        onClick={this.handleSelectCountry}
                      >
                        <div
                          className={currentField === "country" ? "tab_active_border" : null}
                        ></div>
                        {/* checked_arrow */}
                        {this.showFieldChecked("destination") && <div className="checked_arrow" />}
                        {(formattedDestinations === undefined || !formattedDestinations.length) && (
                          <div className="search_arrow" />
                        )}

                        {!this.mobileScreen
                          ? lang.countriesTitle.toUpperCase()
                          : !_.isEmpty(formattedDestinations) && lang.countriesTitle}
                      </label>
                      <div
                        className={`country_container ${
                          this.mobileScreen && !toggleCountryModel ? "mobile" : ""
                        }`}
                      >
                        {!countrySearchValue && (
                          <p className="country_input_text" onClick={this.handleSelectCountry}>
                            <div className="country_list_wrapper" id="#style-3">
                              {/* <i class="fa fa-address-book" aria-hidden="true"></i> */}
                              <div className="hidden-mobile-chips" ref={this.destinationChip}>
                                {currentField === "country" &&
                                  formattedDestinations.map(item => {
                                    return (
                                      <Chip
                                        label={item}
                                        onDelete={e => this.removeDestination(e, item)}
                                      />
                                    );
                                  })}
                              </div>
                              <input
                                className={`select_country_list ${
                                  currentField !== "country" ? "country_placeholder" : null
                                }`}
                                type="text"
                                placeholder={
                                  !_.isEmpty(formattedDestinations) && !toggleCountryModel
                                    ? this.showDestinationSelected()
                                    : (this.mobileScreen
                                    ? "Countries you are visiting "
                                    : lang.searchCountries)
                                }
                                onFocus={this.mobileScreen ? () => null : this.handleSelectCountry}
                                onChange={this.onCountryChange}
                                value={countrySearchValue}
                                autoFocus={!this.mobileScreen && currentField == "country"}
                                onKeyDown={this.handleTabKeyInCountry}
                                ref={this.destinationChip}
                                readOnly={false}
                                id="myText"
                                tabIndex="input_country_index"
                              />
                              <div className="hidden-desktop-chips">
                                {currentField === "country" &&
                                  formattedDestinations.map(item => {
                                    return (
                                      <Chip
                                        label={item}
                                        onDelete={e => this.removeDestination(e, item)}
                                      />
                                    );
                                  })}
                              </div>
                            </div>
                            {alert ? <p style={{ color: "red", fontSize: "10px" }}>{alert}</p> : ""}
                          </p>
                        )}

                        {countrySearchValue && (
                          <Autocomplete
                            getItemValue={item => item.CountryName}
                            items={this.renderAutoSearchData()}
                            // maxLength="40"
                            renderItem={(item, isHighlighted) => (
                              <div
                                className="country_listing"
                                style={{ background: isHighlighted ? "#F4F5F7" : "white" }}
                              >
                                {item.CountryName}
                              </div>
                            )}
                            // onKeyDown={this.handlekeyDown}
                            wrapperProps={{
                              className: "autoComplete wrapper"
                            }}
                            value={countrySearchValue}
                            onSelect={this.handleAutoCompleteSelect}
                            inputProps={{ value: countrySearchValue, autoFocus: true }}
                            wrapperStyle={{
                              display: "block"
                            }}
                            renderInput={props => (
                              <div className="country_list_wrapper">
                                <div className="hidden-mobile-chips">
                                  {formattedDestinations.map(item => {
                                    return (
                                      <Chip
                                        label={item}
                                        onDelete={e => this.removeDestination(e, item)}
                                      />
                                    );
                                  })}
                                </div>
                                <input
                                  {...props}
                                  autoFocus={true}
                                  value={countrySearchValue}
                                  className={"autocomplet_input"}
                                  onChange={this.onCountryChange}
                                  maxLength="30"

                                  //  ref={this.AutoCompleteRef}
                                />
                                <div className="hidden-desktop-chips">
                                  {formattedDestinations.map(item => {
                                    return (
                                      <Chip
                                        label={item}
                                        onDelete={e => this.removeDestination(e, item)}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            shouldItemRender={(item, value) => {
                              return (
                                item &&
                                item.CountryName &&
                                item.CountryName.toLowerCase().includes(value.toLowerCase())
                              );
                            }}
                            open={true}
                            renderMenu={items => {
                              if (!items.length && !formattedDestinations.length) {
                                //  return null;
                                return <div></div>;
                              }
                              return (
                                <div className="countr_list_view">
                                  <div className="country_scroll">
                                    <div children={items} />
                                  </div>
                                </div>
                              );
                            }}
                          />
                        )}

                        {toggleCountryModel && !countrySearchValue && (
                          <CountryModal
                            closeModel={this.closeModel}
                            destination={tempDestination}
                            hideShowZoneGrid={hideShowZoneGrid}
                            showZoneGridDisplay={this.showZoneGridDisplay}
                            afterUpdate={this.getChipsFocused}
                            showWithinIndiaDestinationError={this.showWithinIndiaDestinationError}
                          />
                        )}
                      </div>
                    </div>
                    <div
                      // class="col-md-3"
                      class={`col-md-3 col-12 mobile-view-search trip-label person ${
                        this.showFieldChecked("traveller") ? "hide_icon" : ""
                        }`}
                    >
                      <label
                        className={currentField === "traveller" ? "tab_active" : null}
                        onClick={this.handleTravelSelect}
                      >
					  {lang.travellers}
                        <div></div>
                      </label>
                      {this.showFieldChecked("traveller") && (
                        // validTravellerData(travellerData) &&
                        <div className="checked_arrow"></div>
                      )}
                      <p>
                        <label
                          type="text"
                          placeholder="Traveller"
                          value={membercount}
                          className="slect_trvl"
                          onClick={this.handleTravelSelect}
                          ref={this.travellerModal}
                        >
                          {!membercount ? lang.travller : `${membercount} Person(s)`}
                        </label>
                      </p>
                      {toggleTravelModel && (
                        <TravellersModal
                          closeModel={this.closeTravelModel}
                          counter={counter}
                          changeCounter={this.changeCounter}
                        />
                      )}
                    </div>
                    {window.screen.width > 768 && (
                      <div
                        class={`col-md-4 col-12 trips_dats  mobile-view-search trip-label  ${
                          this.showFieldChecked("tripDate") ? "hide_icon" : ""
                          }`}
                        onClick={this.closeTravelModel}
                      >
                        <label
                          className={currentField === "tripDate" ? "tab_active" : null}
                          onClick={this.closeTravelModel}
                        >
						{lang.tripDate}
                        </label>
                        {this.showFieldChecked("tripDate") && <div className="checked_arrow"></div>}
                        <p>
                          <TripDateModal
                            showMobileFieldFunc={this.showMobileField}
                            focusedInput={tripDateFocused}
                            ref={this.tripInput}
                            handleKeyDown={this.handleKeyDown}
                            closeOtherModel={this.closeOtherModel}
                          />
                        </p>
                      </div>
                    )}

                    {window.screen.width < 768 && (
                      <div
                        class={`col-md-4 col-12 trips_dats  mobile-view-search trip-label  ${
                          this.showFieldChecked("tripStartDate") ? "hide_icon" : ""
                          }`}
                        onClick={this.closeTravelModel}
                      >
                        <label
                          // className={currentField === "tripDate" ? "tab_active" : null}
                          onClick={this.closeTravelModel}
                        >
                          TRIP START DATES
                        </label>
                        {this.showFieldChecked("tripStartDate") && (
                          <div className="checked_arrow"></div>
                        )}
                        <div
                          style={{ backgroundColor: "white" }}
                          className="dbo_Calendar"
                          id={`preQuoteCalenderStartDate`}
                        >
                          <div className="label">
                            {dateRange && dateRange[0] ? "Trip Start Date" : ""}
                          </div>
                          <DatePicker
                            className="input_type"
                            selected={dateRange && dateRange[0] ? new Date(dateRange[0]) : null}
                            onChange={e => this.handelMobileViewCalenderStartDate(e)}
                            dateFormat={"d MMM yy"}
                            showYearDropdown
                            scrollableYearDropdown
                            dropdownMode="select"
                            showMonthDropdown={true}
                            minDate={new Date()}
                            maxDate={new Date(moment().add("day", 180))}
                            onKeyDown={e => e.preventDefault()}
                            // disabledKeyboardNavigation={true}
                            id="txtMobileViewTripStartDate"
                            autoComplete="off"
                            placeholderText="Trip Start Date"

                          // highlightDates={[new Date(moment().add('day',5))]}
                          />
                        </div>
                      </div>
                    )}

                    {window.screen.width < 768 && (
                      <div
                        class={`col-md-4 col-12 trips_dats  mobile-view-search trip-label  ${
                          this.showFieldChecked("tripEndDate") ? "hide_icon" : ""
                          }`}
                        onClick={this.closeTravelModel}
                      >
                        <label
                        // className={currentField === "tripDate" ? "tab_active" : null}
                        // onClick={this.closeTravelModel}
                        >
                          TRIP END DATES
                        </label>
                        {this.showFieldChecked("tripEndDate") && (
                          <div className="checked_arrow"></div>
                        )}
                        <div
                          style={{ backgroundColor: "white" }}
                          className="dbo_Calendar"
                          id={`preQuoteCalenderStartDate`}
                        >
                          <div className="label">
                            {dateRange && dateRange[1] ? "Trip End Date" : ""}
                          </div>
                          <DatePicker
                            className="input_type"
                            //new Date(dateRange[1])
                            // highlightDates={[new Date(moment().add('day',10))]}
                            selected={
                              dateRange && dateRange[1] && dateRange[1]._isValid
                                ? new Date(dateRange[1])
                                : null
                            }
                            onChange={e => this.handelMobileViewCalenderEndDate(e)}
                            dateFormat={"d MMM yy"}
                            showYearDropdown
                            scrollableYearDropdown
                            dropdownMode="select"
                            showMonthDropdown={true}
                            minDate={
                              dateRange && dateRange[0]
                                ? moment(dateRange[0])
                                  .add("day", 1)
                                  .toDate()
                                : null
                            }
                            maxDate={
                              dateRange && dateRange[0]
                                ? moment(dateRange[0])
                                  .add("day", 180)
                                  .toDate()
                                : null
                            }
                            onKeyDown={e => e.preventDefault()}
                            readOnly={dateRange && dateRange[0] ? false : true}
                            id="txtMobileViewTripEndDate"
                            // open={OpenMobileViewTripEndDate}
                            autoComplete="off"
                            onFocus={() => {
                              if (dateRange && dateRange[0]) {
                                this.setState({ OpenMobileViewTripEndDate: true });
                              }
                            }}
                            onBlur={() => {
                              if (dateRange && dateRange[0]) {
                                this.setState({ OpenMobileViewTripEndDate: false });
                              }
                            }}
                            placeholderText="Trip End Date"
                            disabledKeyboardNavigation={true}
                            onClickOutside={() => {
                              this.setState({ OpenMobileViewTripEndDate: false });
                            }}
                          // highlightDates={[]}
                          />
                        </div>
                      </div>
                    )}

                    {/* {preQuoteCompleted && window.screen.width < 768 && (<div
                      className=
                      {`col-md-4 col-12 trips_dats mobile-view-search trip-label mobile  ${
                        this.showFieldChecked("mobileNo") ? "hide_icon" : ""
                        }`}

                    >
                      <label
                        className={toggleMobileViewModel ? "tab_active" : null}
                        onClick={this.closeTripDateModel}
                      >
                        Mobile No
                      </label>
                      {this.showFieldChecked("mobileNo") && <div className="checked_arrow"></div>}
                      <p>
                        <CountryCode
                          hideMobileField={this.hideMobileField}
                        />
                      </p>

                    </div>
                    )} */}
                  </div>
                )}
                {/* <div className="mobile_back_button">
                  {showMobileField && (
                    // <MobileModal
                    //   hideMobileField={this.hideMobileField}
                    //   hideSelectBoxes={this.state.hideSelectBoxes}
                    //   handleGetQuote={this.handleGetQuote}
                    // // currentField={currentField}
                    // />
                    <CountryCode
                      hideMobileField={this.hideMobileField}
                    />
                  )}
                </div> */}
              </div>
            }

            <div class="col-md-3" style={{ padding: 0 }}>
              <div class="quotes_btn">
                {window.screen.width > 768 &&
                  (loading ? (
                    <div className="loading_pre"></div>
                  ) : (
                      // showMobileField ? (
                      //   <button
                      //     onKeyUp={e => this.handleEnterKey(e, "mobile")}
                      //     className={this.validateData() ? "active" : ""}
                      //     onClick={this.handleGetQuote}
                      //     tabIndex="mobile_free_quotes"
                      //     id="GetQuoteButton"
                      //   >
                      //     Get Free Quotes
                      //   </button>
                      // ) :
                      <button
                        className={preQuoteCompleted ? "active" : ""}
                        onClick={this.getFreeQuotes}
                        onKeyUp={e => this.handleEnterKey(e, "mobile")}
                        tabIndex="country_free_quotes"
                        id="GetQuoteButton"
                      >
                        Get Free Quotes
                      </button>
                    ))}
                {window.screen.width < 768 &&
                  (loading ? (
                    <div className="loading_pre"></div>
                  ) : (
                      <button
                        onKeyUp={e => this.handleEnterKey(e, "mobile")}
                        className={preQuoteCompleted ? "active" : ""}
                        onClick={this.getFreeQuotes}
                        tabIndex="mobile_free_quotes"
                        id="GetQuoteButton"
                      >
					              {lang.getFreeQuotes}
                      </button>
                    ))}
              </div>
            </div>
          </div>
          {/* {(this.mobileScreen || showMobileField) && (
            <div className="terms_text">
              By clicking on "Get Free Quote", you agree to our{" "}
              <a href="http://www.policybazaar.com/legal-and-admin-policies/" target="_blank">
                Privacy Policy
              </a>{" "}
              &amp;{" "}
              <a
                href="https://www.policybazaar.com/legal-and-admin-policies/#termsofuse"
                target="_blank"
              >
                Terms of Use
              </a>
            </div>
          )} */}
        </div>
        {/* <div style={{ minHeight: "300px" }}></div> */}
        <div className="explore-padding"></div>
      </div>
    );
  };

  handleOutsideClick = e => {
    // console.log('123---------e', e.key);
    let buttonEle = document.getElementById("GetQuoteButton");
    if (e.target !== buttonEle) {
      let ele = document.getElementById("input-outside-click");
      let targetEle = e.target;
      let checked = false;
      do {
        if (ele === targetEle) {
          checked = true;
          return;
        }
        targetEle = targetEle.parentNode;
      } while (targetEle);

      if (!checked) {
        this.setState({
          hideSelectBoxes: !this.state.hideSelectBoxes
        });
      }
      return;
    }
  };

  hideToast = () => {
    this.setState({
      techErrMsg: ""
    });
  };

  handelMobileViewCalenderStartDate = e => {
    const { dateRange } = this.props;
    if (e) {
      let startDate = new Date(e);
      startDate.setDate(e.getDate() + 1);

      let date = [];
      date.length = 2;
      date[0] = moment(startDate.toISOString().substr(0, 10));
      date[1] = null; //dateRange && dateRange.length === 2 ? dateRange[1] : null;
      this.props.onUpdateTripDate(date);
      if (date[0]) {
        this.setState({ OpenMobileViewTripEndDate: true },
          () => {
            const elementTripEndDate = document.getElementById("txtMobileViewTripEndDate");
            if (elementTripEndDate) {
              elementTripEndDate.focus();
            }
          });
      }
    }
  };

  handelMobileViewCalenderEndDate = e => {
    const { dateRange } = this.props;
    if (e) {
      let endDate = new Date(e);
      endDate.setDate(e.getDate() + 1);

      let date = [];
      date.length = 2;
      date[0] = dateRange && dateRange.length === 2 ? dateRange[0] : null;
      date[1] = moment(endDate.toISOString().substr(0, 10));
      this.props.onUpdateTripDate(date);
      this.setState({ OpenMobileViewTripEndDate: false });
    }
  };

  handleCloseCovid = () => {
    const { showCovid } = this.state;
    Cookies.set("covidDeclare", true);
    this.setState({ showCovid: false });
  };

  render() {
    const { proposerId, enquiryID, cms, lastScrollPosition, techErrMsg, showLiveChat } = this.state;
    const { showCovid } = this.state;
    const { encryptedProposerId } = this.props

    return (
      <div
        className="App bg"
        onClick={this.handleOutsideClick}
        onKeyDown={this.handlekeyDown}
        tabIndex={"0"}
      >
        {<Header handleShowLiveChat={this.handleShowLiveChat} />}
        {showCovid && <CovidUpdate onClose={this.handleCloseCovid} />}
        {this.renderMainBody()}
        {proposerId && enquiryID && (
          <ChatUI
            proposerID={proposerId}
            enquiryID={enquiryID}
            showLiveChat={showLiveChat}
            encryptedProposerId={encryptedProposerId}
            handleShowLiveChat={this.handleShowLiveChat}
          />
        )}
        {<Footer lastScrollPosition={lastScrollPosition} showContent={true} cms={cms} />}
        <div className={techErrMsg ? "toast" : "toast_show"}>
          <p>
            <i className="info" />
            {techErrMsg}
            <span className="closeToast" onClick={this.hideToast} />
          </p>
        </div>
      </div>
    );
  }
}

const mapHomeStateToProps = state => {
  return {
    currentField: state.currentField,
    dateRange: state.dateRange,
    tripDateSelected: state.tripDateSelected,
    selectedDestinations: state.destinations,
    destinationsData: state.destinationsData,
    travellerData: state.travellerData,
    membercount: state.count,
    isPed: state.isPed,
    mobileNo: state.mobileNo,
    validMobileNo: state.validMobileNo,
    timezone: state.timezone,
    countryCode: state.countryCode,
    tripSource: state.tripSource,
    operatorTypeGA: state.operatorType,
    flowNameGA: state.flowName,
    journeyTypeGA: state.journeyType,
    proposerId: state.proposerId,
    encryptedProposerId: state.encryptedProposerId
  };
};
const mapHomeDispatchToProps = dispatch => {
  return {
    onSelectField: data => dispatch(onSelectField(data)),
    onUpdateDestination: data => dispatch(onUpdateDestination(data)),
    onUpdateMemberCount: data => dispatch(onUpdateMemberCount(data)),
    setOperatorType: data => dispatch(setOperatorType(data)),
    setFlowName: data => dispatch(setFlowName(data)),
    onInit: data => dispatch(onInit(data)),
    onUpdateStore: data => dispatch(onUpdateStore(data)),
    onUpdateMobileNumber: data => dispatch(onUpdateMobileNumber(data)),
    onUpdateMobileCountryCode: data => dispatch(onUpdateMobileCountryCode(data)),
    onUpdateTripDate: data => dispatch(onUpdateTripDate(data))
  };
};

export default connect(mapHomeStateToProps, mapHomeDispatchToProps)(Home);
