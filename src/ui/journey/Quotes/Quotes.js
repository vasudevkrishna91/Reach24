import React, { Component } from "react";
import PropTypes from "prop-types";
import reactReferer from "react-referer";
import Cookies from "js-cookie";
import _ from "lodash";
import { connect } from "react-redux";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import {
  saveQuoteSelection,
  saveQuote,
  getQuoteData,
  logActiveQuotesService,
  SaveFilters,
  CreateBookings
} from "../../../services/quotes";
import { savePageTracker } from "../../../services/common";
import {
  saveQuoteRequestBody,
  transformDataForStore,
  logActiveQuotesBody,
  mapFilterDataForApi
} from "../../../utils/helper";
import { validateQuoteSelection } from "../../../utils/validation/quotes";

import QuotesCard from "./QuotesCardModal";
import Family from "./Family";
import TravellerDetails from "./TravellerDetails";
import EditModal from "./EditModals/EditModal";
import Filter from "./Filter/Filter";
import ProfileSelection from "./ProfileSelection";
import SelectedQuotes from "./SelectedQuotes";
import Header from "../../components/static/header";
import Footer from "../../components/static/footer";
import AMTPlan from "./AMTPlan";
import Loader from "../../../assets/images/loader.gif";
import EmailQuotes from "./EmailQuotes.js";
import {
  onUpdateStore,
  setFlowName,
  onUpdateSorting,
  onUpdateFilters,
  onUpdateTravellerData
} from "../../../store/actions/preQuoteActions";
import { varPushEvent, customEvent, virtualPageEvent, addImpression } from "../../../GA/gaEvents";
import { hideScroll, showScroll } from "../../../utils/helper";

import ChatUI from "../../../Chat/Chat";
import "./styles/quotes.css";

import Moment from "moment";
import StudentVisaModal from "./Filter/StudentVisa";
import Toast from "../../components/Toast/Toast2";
import MobileFilter from "../MobileView/Filters/Filters";
import MobileFamily from "../MobileView/Family/Family";

import { extendMoment } from "moment-range";
import { masterData, QuoteFilters, Test } from "./Filter/helperData";
import { lang } from "../../../cms/i18n/en";
const moment = extendMoment(Moment);

class Quotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quotes: [],
      QuotesTemp: [],
      selectedProfileTypeID: 0,
      filters: props.filters ? props.filters : {},
      firstQuoteV2Load: true,
      showFamilyComponent: false,
      proposerID: props.proposerId,
      showAMT: false,
      selectedQuote: {},
      lastScrollPosition: 0,
      errors: {},
      DOBPopup: false,
      firstLoad: false,
      order: 0,
      showLiveChat: false,
      coveredMembers: {},
      showLoader: true,
      referrer: reactReferer.referer(),
      delay: 0,
      email: "",
      showStudentVisaModal: false,
      // previousTripTypeId: "",
      // currentTripTypeId: "",
      resetDefaultSI: false,
      showMobileViewSaveMore: false,
      profiles: [],
      rawQuote: [],
      encryptedProposerID: null,
      selectedQuotes: [],
      selectedGroupID: 0,
      tripTypeID: 0,
      isStudentProfileExist: false
    };
  }

  hideSeo = () => {
    document.querySelector(".tttttt h1").setAttribute("style", "font-size:0");
    var seoTxt = document.querySelector(".tttttt");
    seoTxt.setAttribute("style", "font-size: 0");
  };

  componentDidMount = async () => {
    const { proposerId } = this.props;
    document.body.style.backgroundImage = "none";
    setTimeout(() => this.hideSeo(), 100);

    let encryptedProposerId = null;
    let ipAddress = "";
    const { location, match } = this.props;
    if (location && location.state) {
      encryptedProposerId = location.state.encryptedProposerId;
      ipAddress = location.state.ipAddress;
    }

    const { encryptedProposerId: passedID } = match.params;
    encryptedProposerId = passedID || encryptedProposerId;

    if (encryptedProposerId) {
      this.setState(
        {
          proposerID: proposerId,
          encryptedProposerId,
          ipAddress
        },
        async () => {
          await this.getInsurerQuotesV2();
        }
      );
    }
    this.setFlownameFunc();
  };

  handleShowLiveChat = type => {
    this.setState({
      showLiveChat: type
    });
  };

  refreshData = async (proposerID, res, encryptedProposerId) => {
    const { onUpdateStore } = this.props;
    const { firstQuoteV2Load } = this.state;

    if (!res) {
      res = await getQuoteData(proposerID, encryptedProposerId);
    }
    if (res && !res.data.hasError) {
      this.setState({
        enquiryID: res.data.enquiryID,
        maxTripDuration: res.data.data.maxTripDuration,
        email: res.data.data.customer.emailID,
        proposerID: res.data.proposerID
      });
      if (res.data.data.tripTypeID !== 2 && firstQuoteV2Load) {
        this.setState(
          {
            firstQuoteV2Load: false
          },
          () => {
            setTimeout(() => {
              this.setState({
                showAMT:
                  res.data.data.tripTypeID === 1 && sessionStorage.getItem("askAMT") === "true"
              });
            });
          }
        );
      }

      const proposerId = res.data.proposerID;

      if (!proposerID) {
        const data = {
          encryptedProposerId: encryptedProposerId,
          ProposerID: proposerId
        };
      }

      const transformedData = transformDataForStore(res.data);
      this.setState({ filters: transformedData.filters });
      onUpdateStore({ ...transformedData, encryptedProposerId, proposerId });
      this.checkDOBOfTravellers();
    }
  };

  checkDOBOfTravellers = () => {
    const { travellerData, onUpdateTravellerData } = this.props;
    let check = true;
    travellerData.forEach(traveller => {
      if (!traveller.dateOfBirth) {
        check = false;
      }
    });
    onUpdateTravellerData({
      travellerData,
      saveTravellerDOB: check
    });
    if (!check) {
      this.setState({
        DOBPopup: false
      });
    }
  };

 

  removeSelectedPlan = (profielTypeID, groupID) => {
    let { selectedQuotes, selectedProfileTypeID, selectedGroupID } = this.state;

    const index = selectedQuotes.findIndex(
      x => x.profileTypeID === profielTypeID && x.groupID === groupID
    );
    if (index !== -1) {
      selectedQuotes.splice(index, 1);
      selectedProfileTypeID = profielTypeID; 
      selectedGroupID = groupID;
    }

    this.setState({
      selectedQuotes,
      selectedProfileTypeID,
      selectedGroupID
    });
  };

  

  // GA Log quotes
  logQuotesGA = quotes => {
    addImpression(quotes, this.props.flowNameGA);
  };

  gaVirtualEvent = obj => {
    const payload = {
      ProposerID: obj.ProposerID,
      pageName: "Trv.BU Quotes",
      pageType: "Trv.Quotes",
      flowName: this.props.flowNameGA,
      prevPage: "preQuote"
    };
    virtualPageEvent(payload);
  };

  CallGaEvent = () => {
    const payload = {
      ProposerID: this.state.proposerID,
      operatorType: this.props.operatorTypeGA,
      flowName: this.props.flowNameGA,
      VisitID: this.state.visitID,
      prevPage: "preQuote",
      pageName: "Trv.BU Quotes",
      pageType: "Trv.Quotes"
    };
    varPushEvent(payload);
  };

  setFlownameFunc = () => {
    let cookie = Cookies.get("TravelCjCookie");
    cookie = cookie
      ? JSON.parse(decodeURIComponent(decodeURI(cookie.split("="))))
      : { flowName: "", JourneyType: "" };
    this.props.setFlowName(cookie);
    this.CallGaEvent();
  };

  renderSaveMoreCard = () => {
    const { travellerData, familyDataCollection } = this.props;
    const newFamilyData = {
      Family: [],
      "Senior Family": [],
      Individual: [],
      "Senior Citizen": [],
      "Senior Citizen 71-80 yrs": [],
      "Senior Citizen 80+ yrs": [],
      Student: []
    };

    !_.isEmpty(travellerData) &&
      travellerData.forEach(traveller => {
        if (traveller.profileTypeID === 1) {
          newFamilyData["Individual"].push(traveller);
        } else if (traveller.profileTypeID === 6) {
          newFamilyData["Senior Citizen"].push(traveller);
        } else if (traveller.profileTypeID === 2) {
          newFamilyData["Family"].push(traveller);
        } else if (traveller.profileTypeID === 7) {
          newFamilyData["Senior Family"].push(traveller);
        } else if (traveller.profileTypeID === 8) {
          newFamilyData["Senior Citizen 71-80 yrs"].push(traveller);
        } else if (traveller.profileTypeID === 9) {
          newFamilyData["Senior Citizen 80+ yrs"].push(traveller);
        } else if (traveller.profileTypeID === 4) {
          newFamilyData["Student"].push(traveller);
        }
      });

    return Object.keys(newFamilyData).map((Family, id) => {
      let title = Family;
      if (!newFamilyData[Family].length) return;

      return (
        <>
          <div class="group_famil_read_title">{title}</div>
          {newFamilyData[Family].map(data => {
            return (
              <div class="group_famil_read_list_wrp">
                <div class="group_famil_read_list_left">
                  <label>{data.name}</label>
                  <span>{`${data.age} yrs`}</span>
                </div>
                <div class="group_famil_read_list_right">
                  <label>{data.relationType}</label>
                </div>
              </div>
            );
          })}
        </>
      );
      
    });
  };

  handleShowAMT = (showToast = false) => {
    sessionStorage.setItem("askAMT", false);
    this.setState({
      showAMT: false,
      showAMTToast: !showToast
    });
  };

  getInsurerQuotesV2 = async () => {
    this.setState({
      showLoader: true
    });

    let {
      selectedProfileTypeID,
      selectedGroupID,
      profiles,
      // previousTripTypeId,
      // currentTripTypeId,
      proposerID,
      encryptedProposerId,
      GeographyID,
      rawQuote
    } = this.state;

    try {
      const response = await getQuoteData(proposerID, encryptedProposerId);

      this.refreshData(proposerID, response, encryptedProposerId);

      const { data } = response;
      const { hasError, data: quotesData, encryptedProposerID } = data;
      let {
        quotes,
        filters,
        tripTypeID,
        isStudentProfileExist,
        geographyID,
        maxTripDuration
      } = quotesData;
      rawQuote = JSON.parse(JSON.stringify(quotes));

      if (!response || !quotesData || !quotes || hasError) {
        this.setState({
          techErrMsg: lang.technicalIssue
        });
        return;
      } else {
        
        selectedProfileTypeID = quotes[0].profileTypeID;
        selectedGroupID = quotes[0].groupID;

        let filteredQuotes = [];
        quotes = this.defaultSorting(quotes);
        filteredQuotes = this.filterQuotesV2(quotes, null);
        quotes = filteredQuotes;
        // previousTripTypeId = tripTypeID; // old to be removed   ummy
        // currentTripTypeId = tripTypeID; // old to be removed
       // GeographyID = 1; // old to be removed

        quotes.forEach(x => {
          profiles.push({
            filters,
            profileTypeID: x.profileTypeID,
            profileName: x.profileName,
            coveredMembers: x.coveredMembers,
            groupID: x.groupID
          });
        });

        // this.setState({ encryptedProposerID, rawQuote, maxTripDuration, GeographyID, previousTripTypeId, currentTripTypeId, quotes, selectedProfile, selectedProfileTypeID, selectedGroupID, profiles, showLoader: false })

        this.setState({
          encryptedProposerID,
          rawQuote,
          maxTripDuration,
          // GeographyID,
          // previousTripTypeId,
          // currentTripTypeId,
          quotes,
          selectedProfileTypeID,
          selectedGroupID,
          profiles,
          showLoader: false,
          tripTypeID,
          isStudentProfileExist
        });
      }
    } catch (err) {
      this.setState({
        techErrMsg: lang.technicalIssue
      });
    }
  };

  defaultSorting = quotes => {
    if (quotes && quotes.length > 0) {
      quotes.forEach(x => {
        x.premiums.sort((a, b) => {
          return a.priorityCategoryID - b.priorityCategoryID;
        });
      });
      quotes.forEach(x => {
        x.premiums.sort((a, b) => {
          if (a.priorityCategoryID === b.priorityCategoryID) {
            return a.premium - b.premium;
          }
        });
      });
    }
    return quotes;
  };

  showFamilyComponent = () => {
    const { showFamilyComponent, showLoader } = this.state;

    if (showLoader) return;

    this.setState({
      showFamilyComponent: !showFamilyComponent
    });
    this.trackCustomGA("Save now");
  };

  transformData = data => {
    const transformedData = [];

    const { firstLoad } = this.state;

    data &&
      data.forEach(item => {
        const indexofInsurer = transformedData.findIndex(e => e.InsurerName === item.InsurerName);
        if (indexofInsurer !== -1) {
          transformedData[indexofInsurer].sub.push(item);
        } else {
          transformedData.push({ ...item, sub: [] });
        }
      });
    return transformedData;
  };

  createMoreLessPlan = data => {
    const transformedData = [];
    data &&
      data.forEach(item => {
        const indexofInsurer = transformedData.findIndex(e => e.insurerID === item.insurerID);
        if (indexofInsurer !== -1) {
          transformedData[indexofInsurer].sub.push(item);
        } else {
          transformedData.push({ ...item, sub: [] });
        }
      });
    return transformedData;
  };

  logActiveQuote = async () => {
    const { proposerID, order, quotes, filters, enquiryID, QuotesTemp, selectedQuote } = this.state;
    try {
      const profiles = Object.keys(quotes);
      const body = [];
      profiles.forEach(async profile => {
        const data = {
          profile,
          quotes,
          proposerID,
          order,
          filters,
          enquiryID,
          QuotesTemp,
          selectedQuote
        };
        const activeQuotes = logActiveQuotesBody(data);
        if (activeQuotes) {
          body.push(activeQuotes);
        }
      });
      if (body.length > 0 && !this.loggingQuotes) {
        this.loggingQuotes = true;
        // await logActiveQuotesService(body);
        this.loggingQuotes = false;
      }
    } catch (err) {}
  };

  componentDidUpdate(prevProps, prevState) {
    const { showFamilyComponent, order, filters } = this.state;

    if (showFamilyComponent) {
      hideScroll();
    } else {
      showScroll();
    }

    if (prevState.order !== order) {
      this.logActiveQuote();
    }
  }

  renderQuotesV2 = () => {
    const {
      selectedProfile, //to be removed
      selectedProfileTypeID,
      selectedGroupID,
      quotes,
      profiles,
      showLoader,
      filters,
      QuotesTemp,
      enquiryID,
      DOBPopup
    } = this.state;
    let alert = "";
    let profilePlanVariants = [];
    let premiums = [];

    profilePlanVariants = quotes.filter(x => x.groupID === selectedGroupID);
    premiums = profilePlanVariants[0].premiums;

    premiums = this.createMoreLessPlan(premiums);

    if (_.isEmpty(premiums)) {
      alert = lang.quotesNoPlansFOrFilterAlert;
    }

    return (
      <>
        {!_.isEmpty(premiums) ? (
          premiums.map(premium => {
            if (showLoader) {
              return this.renderSkeleton();
            }
            return (
              <QuotesCard
                showCompare
                saveSingleQuotes={this.saveSingleQuotes}
                saveMultipleQuotes={this.saveMultipleQuotes}
                profileType={selectedProfile}
                selectQuote={this.selectQuote}
                data={premium}
                DOBPopup={DOBPopup}
                checkDOBPopup={this.checkDOBPopup}
                profiles={profiles}
                saveUpdatedData={this.saveUpdatedData}
                flowName={this.props.flowNameGA}
                selectedProfileTypeID={selectedProfileTypeID}
                selectedGroupID={selectedGroupID}
              />
            );
          })
        ) : (
          <>{!showLoader && <div className="strip">{alert}</div>}</>
        )}
      </>
    );
  };

  saveUpdatedData = async (data, filter = false) => {
    const { proposerID } = this.state;
    let {
      rawQuote,
      profiles,
      // previousTripTypeId,
      // currentTripTypeId,
      // GeographyID,
      maxTripDuration,
      selectedProfileTypeID,
      selectedGroupID
    } = this.state;
    const { encryptedProposerId } = this.props;
    const dataForApi = {
      ...data,
      sourceTypeID: 2,
      proposerID,
      encryptedProposerId
    };

    const res = await saveQuote(dataForApi);

    if (res && res.data && res.data.hasError === false) {
      this.refreshData(proposerID, res, encryptedProposerId);
      const { data } = res;
      const { data: quotesData } = data;
      let { quotes, tripTypeID, isStudentProfileExist, geographyID, maxTripDuration } = quotesData;
      rawQuote = JSON.parse(JSON.stringify(quotes));
      profiles = [];

      selectedProfileTypeID = quotes[0].profileTypeID;
      selectedGroupID = quotes[0].groupID;

      let filteredQuotes = [];
      quotes = this.defaultSorting(quotes);
      filteredQuotes = this.filterQuotesV2(quotes, null);
      quotes = filteredQuotes;
      // previousTripTypeId = tripTypeID; // old to be removed
      // currentTripTypeId = tripTypeID; // old to be removed
      // GeographyID = 1; // old to be removed

      quotes.forEach(x => {
        profiles.push({
          profileTypeID: x.profileTypeID,
          profileName: x.profileName,
          coveredMembers: x.coveredMembers,
          groupID: x.groupID
        });
      });

      this.setState({
        rawQuote,
        maxTripDuration,
        // GeographyID,
        // previousTripTypeId,
        // currentTripTypeId,
        quotes,
        selectedProfileTypeID,
        selectedGroupID,
        profiles,
        showLoader: false,
        delay: 500,
        tripTypeID,
        isStudentProfileExist
      });
    } else {
      this.setState({
        techErrMsg: "We are experiencing some technical issues, please try in sometime!"
      });
    }
  };

  hideToast = () => {
    this.setState({
      techErrMsg: ""
    });
  };

  renderTravellerInfo = () => {
    const { proposerID, encryptedProposerId, showLoader } = this.state;
    return (
      <EditModal
        page="Quote"
        showEditModals={this.showEditModals}
        getInsurerQuotes={this.getInsurerQuotes}
        proposerID={proposerID}
        encryptedProposerId={encryptedProposerId}
        saveUpdatedData={this.saveUpdatedData}
        {...this.props}
        disabled={showLoader}
      />
    );
  };

  changeSelectedProfile = (selectedProfileTypeID, selectedGroupID) => {
    this.setState(
      {
        showLoader: true,
        //selectedProfile: profile
        selectedProfileTypeID,
        selectedGroupID
      },
      () => {
        setTimeout(() => {
          this.setState({
            showLoader: false
          });
        }, 500);
      }
    );
  };

  renderMultiProfileTab = () => {
    const {
      selectedProfile,
      selectedProfileTypeID,
      quotes,
      profiles,
      coveredMembers,
      selectedGroupID
    } = this.state;
    return (
      <ProfileSelection
        selectedProfile={selectedProfile} //old has to be removed
        selectedProfileTypeID={selectedProfileTypeID}
        selectedGroupID={selectedGroupID}
        quotes={quotes}
        profiles={profiles}
        coveredMembers={coveredMembers}
        changeSelectedProfile={this.changeSelectedProfile}
      />
    );
  };

  selectQuote = (data, profileType) => {
    const { selectedQuote, profiles } = this.state;
    selectedQuote[profileType] = {
      InsurerName: data.PlanName,
      ItemSelection: data.SelectedPlan,
      Insurer: data.InsurerName
    };
    this.setState(
      {
        selectedQuote,
        selectedProfile: this.changeProfileSelection(),
        showLoader: profiles.length > 1 ? true : false
      },
      () => {
        setTimeout(() => {
          this.setState({
            showLoader: false
          });
        }, 1000);
        this.logActiveQuote();
      }
    );
  };

  changeProfileSelection = () => {
    const { profiles, selectedProfile } = this.state;
    let index = profiles.findIndex(profile => profile === selectedProfile);
    ++index;
    let profile = selectedProfile;
    if (index === profiles.length) {
      profile = profiles[0];
    } else {
      profile = profiles[index];
    }
    return profile;
  };

  gaCustomEvent = label => {
    const gaData = {
      eventCategory: "Trv.BU Quotes",
      eventAction: "Trv.click",
      eventLabel: label,
      eventValue: "",
      flowName: this.props.flowNameGA
    };
    customEvent(gaData);
  };

  trackCustomGA = label => {
    this.gaCustomEvent(label);
  };

  saveQuotes = () => {
    const { proposerID, errors, DOBPopup, selectedQuotes, encryptedProposerId } = this.state;
    const { proposerId } = this.props;

    const { valid, error } = validateQuoteSelection(this.state);
    if (!valid) {
      errors.proceed = error;
      this.setState({
        errors
      });
      return;
    }
    this.gaCustomEvent("Trv.Proceed to Pay");

    if (valid) {
      let bookings = [];

      selectedQuotes.forEach(x => {
        bookings.push(x.selectedPlan);
      });

      const data = {
        proposerId,
        encryptedProposerId,
        bookings
      };

      const res = this.createBooking(data);
      return res;
    }
  };

  checkDOBPopup = type => {
    this.setState({
      DOBPopup: type
    });
  };

  saveSingleQuotes = selectedQuote => {
    const { proposerID, selectedQuotes, encryptedProposerId } = this.state;
    const quoteIndex = selectedQuotes.findIndex(
      x => x.profileTypeID === selectedQuote.profileTypeID && x.groupID === selectedQuote.groupID
    );

    if (quoteIndex !== -1) {
      selectedQuotes[quoteIndex].selectedPlan = selectedQuote.selectedPlan;
      selectedQuotes[quoteIndex].variantName = selectedQuote.variantName;
      selectedQuotes[quoteIndex].insurerID = selectedQuote.insurerID;
      selectedQuotes[quoteIndex].insurerName = selectedQuote.insurerName;
    } else {
      selectedQuotes.push(selectedQuote);
    }

    this.setState({ selectedQuotes });

    let bookings = [selectedQuotes[0].selectedPlan];

    const data = {
      proposerID,
      encryptedProposerId,
      bookings
    };

    this.createBooking(data);
  };

  saveMultipleQuotes = selectedQuote => {
    const { proposerID, selectedQuotes, encryptedProposerId, profiles } = this.state;
    let {
      selectedProfileTypeID, // to be removed
      selectedGroupID
    } = this.state;
    const quoteIndex = selectedQuotes.findIndex(
      x => x.profileTypeID === selectedQuote.profileTypeID && x.groupID === selectedQuote.groupID
    );

    if (quoteIndex !== -1) {
      selectedQuotes[quoteIndex].selectedPlan = selectedQuote.selectedPlan;
      selectedQuotes[quoteIndex].variantName = selectedQuote.variantName;
      selectedQuotes[quoteIndex].insurerID = selectedQuote.insurerID;
      selectedQuotes[quoteIndex].insurerName = selectedQuote.insurerName;
    } else {
      selectedQuotes.push(selectedQuote);
    }

    const selectedProfileIndex = profiles.findIndex(
      p => p.profileTypeID === selectedQuote.profileTypeID && p.groupID === selectedQuote.groupID
    );
    const profileLength = profiles.length;
    if (selectedProfileIndex + 1 !== profileLength) {
      selectedProfileTypeID = profiles[selectedProfileIndex + 1].profileTypeID; // to be removed
      selectedGroupID = profiles[selectedProfileIndex + 1].groupID;
    }
    this.setState({ selectedQuotes, selectedProfileTypeID, selectedGroupID });
  };

  createBooking = async (data) => {
    const {
      encryptedProposerID
    } = this.state;
    debugger
    let res = await CreateBookings(data);

    if (res && res.data && res.data.hasError === false) {
      this.props.history.push(`/v2/proposalStep1/${encryptedProposerID}`);
    }
  };

  renderProceedBar = () => {
    const { quotes, selectedQuote, profiles, errors, selectedQuotes } = this.state;

    return (
      <>
        <SelectedQuotes
          profiles={profiles}
          quotes={quotes}
          errors={errors.proceed}
          selectedQuote={selectedQuote} // to be removed
          selectedQuotes={selectedQuotes}
          saveQuotes={this.saveQuotes}
          removeSelectedPlan={this.removeSelectedPlan}
        />
      </>
    );
  };

  deleteFilterChip = async data => {
    let { quotes, encryptedProposerID, proposerID } = this.state;
    const { selectedProfileTypeID, selectedGroupID } = this.state;

    const quoteIndex = quotes.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (quoteIndex !== -1) {
      const filterIndex = quotes[quoteIndex].profileFilter.findIndex(
        x => x.parentID === data.parentID && x.filterID === data.filterID
      );
      if (filterIndex !== -1) {
        quotes[quoteIndex].profileFilter.splice(filterIndex, 1);
      }
    }

    this.filterQuotesV2(quotes, "Chips");

    let savefiltersList = [];
    quotes.forEach(x => {
      x.profileFilter.forEach(y => {
        const { filterID, filter, profileTypeID } = y;
        savefiltersList.push({ filterID, filter, profileTypeID });
      });
    });
    let reqBody = {};
    reqBody.encryptedProposerID = encryptedProposerID;
    reqBody.proposerID = proposerID;
    reqBody.filters = savefiltersList;
    await SaveFilters(reqBody);
  };

  renderChips = () => {
    const { quotes, selectedProfileTypeID } = this.state;

    let chips = [];

    const chipsQuote = [...quotes];
    const quoteIndex = chipsQuote.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (quoteIndex !== -1) {
      chips = chipsQuote[quoteIndex].profileFilter.filter(
        x => x.parentID !== 1008 && x.parentID !== 1006
      );
    }

    return (
      <>
        {!_.isEmpty(chips) && (
          <div className="chip_wrapper">
            {chips.map(data => {
              const { filter } = data;

              return (
                <span className="chips">
                  {filter}
                  <span className="close" onClick={() => this.deleteFilterChip(data)} />
                </span>
              );
            })}
          </div>
        )}
      </>
    );
  };

  sortQuotes = value => {
    let { quotes, selectedProfileTypeID } = this.state;
    const index = quotes.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (index !== -1) {
      if (value === "1") {
        quotes[index].premiums.sort((x, y) => {
          return x.premiumWithoutTax - y.premiumWithoutTax;
        });
      } else if (value === "2") {
        quotes[index].premiums.sort((x, y) => {
          return y.premiumWithoutTax - x.premiumWithoutTax;
        });
      } else if (value === "0") {
        quotes[index].premiums.sort((a, b) => {
          return a.priorityCategoryID - b.priorityCategoryID;
        });
        quotes[index].premiums.sort((a, b) => {
          if (a.priorityCategoryID === b.priorityCategoryID) {
            return a.premium - b.premium;
          }
        });

        //this.filterQuotesV2(quotes, 'sortDefault')
        // quotes = this.defaultSorting(quotes);
      }
      this.setState({
        quotes
      });
    }
  };

  updateFiltersViaApi = (filters, maxTripDays = null) => {
    const { travellerData, destinationsData, values } = this.props;
    const { maxTripDuration } = this.state;

    this.setState({ showLoader: true });

    setTimeout(() => {
      this.setState({ showLoader: false });
    }, 3000);

    const newMaxTrip = maxTripDays ? maxTripDays : 0;
    const filtersData = mapFilterDataForApi(filters);

    const memberData = travellerData.map(traveller => {
      const obj = {
        ...traveller,
        IsPED: traveller.ped
      };
      return obj;
    });

    const data = {
      data: {
        tripCountries: [...destinationsData],
        members: [...memberData],
        tripStartDate: moment(values[0]).format("YYYY-MM-DD"),
        tripEndDate: moment(values[1]).format("YYYY-MM-DD"),
        filters: filtersData,
        MaxTripDuration: newMaxTrip
      },
      actionTypeID: "7"
    };

    this.saveUpdatedData(data, maxTripDuration === newMaxTrip);
  };

  handleSubmitVisaModal = travellerData => {
    const transformedData = travellerData.map(traveller => {
      if (traveller.age > 15 && traveller.age < 51 && traveller.isStudent === true) {
        return {
          ...traveller,
          visaTypeID: 7
        };
      } else {
        return {
          ...traveller,
          visaTypeID: 1
        };
      }
    });
    this.onStudentVisa(transformedData);
  };

  checkStudentVisaModal = filterApply => {
    const { travellerData } = this.props;

    let showModal = travellerData.length > 1 ? true : false;

    if (filterApply && showModal) {
      this.setState({
        showStudentVisaModal: true
      });
    } else if (filterApply) {
      const transformedData = travellerData.map(traveller => {
        if (traveller.age < 16 || traveller.age > 50) {
          return {
            ...traveller,
            visaTypeID: 1
          };
        } else {
          return {
            ...traveller,
            visaTypeID: 7
          };
        }
      });

      this.setState({
        studentVisaData: transformedData
      });
    }
  };

  removeStudentPlans = () => {
    const { travellerData } = this.props;

    const transformedData = travellerData.map(traveller => {
      return {
        ...traveller,
        visaTypeID: 1
      };
    });

    this.onStudentVisa(transformedData);
  };

  onStudentVisa = travellerData => {
    const { destinationsData, values } = this.props;

    if (!travellerData) return;
    const { filters } = this.state;

    const filtersData = mapFilterDataForApi(filters);

    const memberData = travellerData.map(traveller => {
      const obj = {
        ...traveller,
        IsPED: traveller.ped
      };
      return obj;
    });

    const data = {
      data: {
        tripCountries: [...destinationsData],
        members: [...memberData],
        tripStartDate: moment(values[0]).format("YYYY-MM-DD"),
        tripEndDate: moment(values[1]).format("YYYY-MM-DD"),
        filters: filtersData
      },
      actionTypeID: "18"
    };

    this.saveUpdatedData(data);
    this.setState({ showStudentVisaModal: false });
  };

  filterQuotes = (
    filters,
    field = null,
    filterApply = false,
    removeStudent = false,
    maxTrip = null
  ) => {
    const { quotes, selectedProfile, QuotesTemp, order } = this.state;
    let newFilters = _.clone(filters);
    newFilters[selectedProfile] = {
      ...(!_.isEmpty(this.props.filters) && this.props.filters[selectedProfile]),
      ...filters[selectedProfile]
    };

    let firstLoad = true;

    let newQuotes = _.cloneDeep(QuotesTemp[selectedProfile]);
    const tempProfileType = selectedProfile;
    const filterData = newFilters[tempProfileType];

    !_.isEmpty(filterData) &&
      filterData &&
      Object.keys(filterData).forEach(key => {
        if (key === undefined || key === null) return;

        if (!filterData[key] || !filterData[key].length) return;

        if (key === "insurers") {
          newQuotes.premiums = newQuotes.premiums.filter(insurer => {
            const index = filterData.insurers.findIndex(
              obj => insurer.InsurerID.toString() === obj.insurerID
            );
            if (index === -1) return false;
            return true;
          });
          firstLoad = false;
        } else if (key !== "sumInsured") {
          filterData[key].forEach(obj => {
            if (obj.noChip) {
              return;
            }
            newQuotes.premiums = newQuotes.premiums.filter(insurer => {
              return insurer.PlanKeyFeatures.hasOwnProperty(obj.id);
            });
          });
          firstLoad = false;
        }
      });

    quotes[selectedProfile] = newQuotes;

    this.setState(
      {
        filters: newFilters,
        quotes,
        firstLoad
      },
      () => {
        !firstLoad && this.logActiveQuote();
        this.props.onUpdateFilters(newFilters);
        removeStudent && this.removeStudentPlans();

        filterApply && this.onStudentVisa(this.state.studentVisaData);
      }
    );

    filterApply && !this.state.studentVisaData && this.updateFiltersViaApi(newFilters, maxTrip);
  };

  filterQuotesV2 = (quotes, source = null) => {
    const { rawQuote } = this.state;
    if (rawQuote && rawQuote.length > 0 && source !== null) {
      rawQuote.forEach((x, index) => {
        quotes[index].premiums = x.premiums;
      });
    }

    let filteredQuote = [];

    quotes.forEach((x, quoteIndex) => {
      if (x.profileFilter && x.profileFilter.length > 0) {
        let insurerFilters = x.profileFilter.filter(f => f.parentID === 1007);
        if (insurerFilters && insurerFilters.length > 0) {
          let insurerUnfilteredPremium = [...x.premiums];
          let insurerFilteredPremium = insurerUnfilteredPremium.filter(
            u => insurerFilters.findIndex(i => i.actualID === u.insurerID) !== -1
          );
          x.premiums = [...insurerFilteredPremium];
        }

        const sumInsuredFilter = x.profileFilter.filter(f => f.parentID === 1008);
        if (sumInsuredFilter && sumInsuredFilter.length > 0) {
          const { filter } = sumInsuredFilter[0];
          const data = filter.split(" ");
          if (data && data.length > 0) {
            let sumInsuredUnfilteredPremium = [...x.premiums];
            let sumInsuredFilteredPremium = sumInsuredUnfilteredPremium.filter(
              u => u.sumInsured === parseInt(data[1], 10)
            );
            x.premiums = [...sumInsuredFilteredPremium];
          }
        }

        let pp = "";
        let cc = "";

        const moreFilters = x.profileFilter.filter(
          f =>
            f.parentID === 1001 ||
            f.parentID === 1002 ||
            f.parentID === 1003 ||
            f.parentID === 1004 ||
            f.parentID === 1005
        );

        if (moreFilters.length > 0) {
          let moreFilterUnfilteredPremiums = [...x.premiums];

          let moreFilterFilteredPremium = moreFilterUnfilteredPremiums.filter(tp => {
            return (pp = moreFilters.every(e => {
              return (cc = tp.filters.findIndex(tpf => tpf.filterID === e.filterID) !== -1);
            }));
          });

          x.premiums = [...moreFilterFilteredPremium];
        }
      }
    });

    filteredQuote = quotes;
    if (source !== null) {
      this.setState({ quotes });
    } else {
      return filteredQuote;
    }
  };

  hanldeMaxTripDuration = (isAmt, days) => {
    const { filters } = this.state;

    this.updateFiltersViaApi(filters, days);
  };

  renderSkeleton = () => {
    var count = 4;
    const arr = [1, 2, 3, 4];

    return (
      <>
        {arr.map(ele => {
          return (
            <div
              style={{
                height: "115px",
                width: "100%",
                backgroundColor: "white",
                marginRight: "10px",
                marginTop: "",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "12px"
              }}
            >
              <SkeletonTheme color="#E1E6E6" highlightColor="#BEC4C4">
                <Skeleton width="100%" style={{ maxWidth: 600 }} />
                <Skeleton width="100%" />
                <div>
                  <Skeleton width={200} />
                </div>
                <div>
                  <Skeleton width={200} />
                </div>
              </SkeletonTheme>
            </div>
          );
        })}
      </>
    );
  };

  isSpainSelected = () => {
    const { destinationsData } = this.props;

    if (destinationsData) {
      const spainData = destinationsData.filter(obj => obj.CountryName === "Spain");
      if (spainData.length) return true;
    }
    return false;
  };

  closeStudentModal = () => {
    this.setState({ showStudentVisaModal: false });
  };

  // getEuroCheck = () => {
  //   const { quotes, selectedProfile } = this.state;

  //   let euro = false;
  //   let dollar = false;

  //   quotes[selectedProfile].premiums.forEach(data => {
  //     if (euro && dollar) {
  //       return;
  //     }

  //     if (data.CurrencyName === "EUR") {
  //       euro = true;
  //     } else if (data.CurrencyName === "USD") {
  //       dollar = true;
  //     }
  //   });

  //   return euro && dollar;
  // };

  handelmobileViewSaveMore = () => {
    const { showMobileViewSaveMore } = this.state;
    this.setState({
      showMobileViewSaveMore: true
    });
  };

  applyFilters = (filterQuote, source) => {
    this.filterQuotesV2(filterQuote, source);
  };

  applySingleTripFilter = async () => {
    const { travellerData, values, destinationsData } = this.props;

    const data = {
      data: {
        members: [...travellerData],
        tripCountries: [...destinationsData],
        tripStartDate: moment(values[0]).format("YYYY-MM-DD"),
        tripEndDate: moment(values[1]).format("YYYY-MM-DD"),
        filters: [],
        MaxTripDuration: 0
      },
      actionTypeID: "19"
    };

    await this.saveUpdatedData(data);
  };

  applyMultiTripFilter = () => {
    this.setState({ showAMT: true });
  };

  applyStudentPlan = () => {
    this.setState({
      showStudentVisaModal: true
    });
  };

  render() {
    const {
      quotes,
      selectedProfile,
      showFamilyComponent,
      proposerID,
      profiles,
      lastScrollPosition,
      selectedQuote,
      showLoader,
      filters,
      GeographyID,
      QuotesTemp,
      enquiryID,
      showLiveChat,
      showAMT,
      maxTripDuration,
      showStudentVisaModal,
      revisedToast,
      showAMTToast,
      email,
      // previousTripTypeId,
      // currentTripTypeId,
      showMobileViewSaveMore,
      techErrMsg,
      selectedProfileTypeID,
      selectedGroupID,
      encryptedProposerID,

      tripTypeID,
      isStudentProfileExist
    } = this.state;

    const { travellerData, familyDataCollection, order, encryptedProposerId } = this.props;

    return (
      <div class="quotePage">
        <Header
          handleShowLiveChat={this.handleShowLiveChat}
          handelmobileViewSaveMore={this.handelmobileViewSaveMore}
          showSaveMore={travellerData && travellerData.length > 1 ? true : false}
        />
        <div className="quote_wrapper container">
          <div className="row">
            <div className="col-md-9">
              {this.renderTravellerInfo()}
              {quotes && quotes.length > 0 && this.renderMultiProfileTab()}
              {showFamilyComponent && (
                <Family close={this.showFamilyComponent} saveUpdatedData={this.saveUpdatedData} />
              )}

              {!_.isEmpty(quotes) && (
                <Filter
                  getInsurerQuotes={this.getInsurerQuotes}
                  // previousTripTypeId={previousTripTypeId}
                  // currentTripTypeId={currentTripTypeId}
                  updateFiltersViaApi={this.updateFiltersViaApi}
                  profileType={selectedProfile}
                  quotes={quotes}
                  profiles={profiles}
                  filterQuotes={this.filterQuotes}
                  sortQuotes={this.sortQuotes}
                  proposerID={proposerID}
                  selectedOrder={order}
                  filters={filters}
                  geographyID={GeographyID}
                  QuotesTemp={QuotesTemp}
                  checkStudentVisaModal={this.checkStudentVisaModal}
                  maxTripDuration={maxTripDuration}
                  hanldeMaxTripDuration={this.hanldeMaxTripDuration}
                  selectedProfileTypeID={selectedProfileTypeID} //
                  selectedGroupID={selectedGroupID}
                  applyFiltersOnQuote={this.applyFilters}
                  encryptedProposerID={encryptedProposerID}
                />
              )}

              {showStudentVisaModal && (
                <StudentVisaModal
                  onClose={this.closeStudentModal}
                  onApply={this.handleSubmitVisaModal}
                />
              )}

              <div className="cl" />
              {this.renderChips()}
              {GeographyID === "6" && travellerData && travellerData.length > 1 && (
                <div class="strip">
                  Europe Visa rules require $50,000 per person minimum coverage
                </div>
              )}
              <div className={techErrMsg ? "toast" : "toast_show"}>
                <p>
                  <i className="info" />
                  {techErrMsg}
                  <span className="closeToast" onClick={this.hideToast} />
                </p>
              </div>
              {showLoader || showAMT ? (
                <div>
                  <div className="cl"></div>
                  {this.renderSkeleton()}
                </div>
              ) : (
                <>
                  {!_.isEmpty(quotes) && this.renderQuotesV2()}
                  {!_.isEmpty(quotes) && !_.isEmpty(quotes[0].premiums) && (
                    <div className={"gst-guidelines"}>
                      <p>*Above mentioned quotes are exclusive of 18% GST</p>
                      <p>
                        **Guaranteed approval by Insurer on all legitimate claims for PolicyBazaar
                        customers
                      </p>
                    </div>
                  )}
                </>
              )}
              {showAMTToast && (
                <Toast
                  status={"show"}
                  text={"You can always change your preference in the Filters."}
                  key={`AMT Toast`}
                  onClose={() => {
                    this.setState({ showAMTToast: false });
                  }}
                />
              )}
              {revisedToast && (
                <Toast
                  status={"show"}
                  text={"Premium is Revised, Please select the updated quotes"}
                  key={`amtToast`}
                  onClose={() => {
                    this.setState({ revisedToast: false });
                  }}
                />
              )}
            </div>

            <div className="quote_right col-md-3">
              {showLoader ? (
                <div style={{ cursor: "auto" }} class="right_box group_famil_read">
                  <SkeletonTheme color="#E1E6E6" highlightColor="#BEC4C4" style={{ padding: "2%" }}>
                    <div style={{ marginLeft: "10%", width: "80%" }}>
                      <Skeleton circle={true} count={1} />
                      <br />
                      <Skeleton circle={true} count={1} />
                      <br />
                      <Skeleton circle={true} count={1} />
                      <br />
                      <Skeleton circle={true} count={1} />
                      <br />
                      <br />
                    </div>

                    {/* <Skeleton width='100%' style={{ maxWidth: 600, margin: '2%' }} />
                  <Skeleton width='100%' />
                  <div>
                    <Skeleton width={150} />
                  </div>
                  <div>
                    <Skeleton width={150} />
                  </div> */}
                  </SkeletonTheme>
                </div>
              ) : (
                <div style={{ cursor: "auto" }} class="right_box group_famil_read">
                  <div class="group_famil_read_head">
                    <h2 style={{ fontSize: 15 }}>Looking Other Plans?</h2>
                  </div>

                  <div className="othersPlan" onClick={() => this.applySingleTripFilter()}>
                    <label style={{ marginLeft: -17 }}>SINGLE TRIP PLANS</label>
                    <label style={{ marginLeft: 5 }}>{`${tripTypeID === 1 ? "\u2714" : ""}`}</label>
                  </div>
                  <div className="othersPlan" onClick={() => this.applyMultiTripFilter()}>
                    <label style={{ marginLeft: -38 }}>MULTI TRIP PLANS</label>
                    <label style={{ marginLeft: 5 }}>{`${tripTypeID === 2 ? "\u2714" : ""}`}</label>
                  </div>
                  <div className="othersPlan" onClick={() => this.applyStudentPlan()}>
                    <label style={{ marginLeft: -38 }}>STUDENT PLANS</label>
                    <label style={{ marginLeft: 5 }}>{`${
                      isStudentProfileExist === true ? "\u2714" : ""
                    }`}</label>
                  </div>
                </div>
              )}
              {travellerData.length > 1 &&
                (_.isEmpty(familyDataCollection) || _.isEmpty(familyDataCollection["family1"]) ? (
                  <div className="right_box" onClick={this.showFamilyComponent}>
                    <div>
                      <h2>Save More Here</h2>
                      <b>Travelling with family(s)?</b>
                      <p>Specifying your family/relation may get you DISCOUNT.</p>
                      <div className="button_save">Save now</div>
                    </div>
                    <div className="right_banner" />
                  </div>
                ) : (
                  <div class="right_box group_famil_read">
                    <div class="group_famil_read_head">
                      <h2>
                        Family Grouping
                        <span onClick={this.showFamilyComponent}>Edit</span>
                      </h2>
                      <p>Specifying your family/relation may get you DISCOUNT on premium.</p>
                    </div>
                    <div class="group_famil_read_list">
                      {this.renderSaveMoreCard(travellerData)}
                    </div>
                  </div>
                ))}
              <div className="cl" />

              {!_.isEmpty(quotes) && (
                <EmailQuotes
                  quotes={quotes}
                  proposerID={proposerID}
                  enquiryID={enquiryID}
                  email={email}
                  encryptedProposerId={encryptedProposerId}
                />
              )}
            </div>
          </div>
        </div>
        {this.renderProceedBar()}

        {showAMT && (
          <AMTPlan
            close={this.handleShowAMT}
            saveUpdatedData={this.saveUpdatedData}
            maxTripDuration={maxTripDuration}
          />
        )}
        <div className="cl" />
        {<Footer lastScrollPosition={lastScrollPosition} showContent={false} />}

        {showMobileViewSaveMore && (
          <MobileFamily
            show={showMobileViewSaveMore}
            hideFamilyModal={() => {
              this.setState({ showMobileViewSaveMore: false });
            }}
            saveUpdatedData={this.saveUpdatedData}
          />
        )}
      </div>
    );
  }
}

Quotes.propTypes = {
  location: PropTypes.instanceOf(Object).isRequired,
  match: PropTypes.instanceOf(Object).isRequired
};

const mapDispatchToProps = dispatch => {
  return {
    onUpdateStore: data => dispatch(onUpdateStore(data)),
    setFlowName: data => dispatch(setFlowName(data)),
    onUpdateFilters: data => dispatch(onUpdateFilters(data)),
    onUpdateSorting: data => dispatch(onUpdateSorting(data)),
    onUpdateTravellerData: data => dispatch(onUpdateTravellerData(data))
  };
};

const mapStateToProps = state => {
  return {
    familyDataCollection: state.familyDataCollection,
    travellerData: state.travellerData,
    flowNameGA: state.flowName,
    saveTravellerDOB: state.saveTravellerDOB,
    filters: state.filters,
    order: state.order,
    destinationsData: state.destinationsData,
    values: state.dateRange,
    encryptedProposerId: state.encryptedProposerId,
    proposerId: state.proposerId
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Quotes);
