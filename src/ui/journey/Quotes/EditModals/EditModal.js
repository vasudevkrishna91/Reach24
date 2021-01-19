import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as _ from "lodash";
import Moment from "moment";
import { extendMoment } from "moment-range";
import Cookies from "js-cookie";
import CountryEditModal from "./CountryEditModal";
import TripDateEditModal from "./TripDateEditModal";
import TravellerEditModal from "./TravellerEditModal";
import CheckoutAlerModal from "./CheckoutAlertModal";
import {
  onUpdateMemberData,
  onUpdateDestination,
  onUpdateTripDate,
  onUpdateTripSummary
} from "../../../../store/actions/preQuoteActions";

import { GetTripSummary } from "../../../../services/common";

import { hideScroll, showScroll, getTemporaryId } from "../../../../utils/helper";

import { customEvent } from "../../../../GA/gaEvents";
import { lang } from '../../../../cms/i18n/en/index';

const moment = extendMoment(Moment);

class EditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDestinationEditPage: false,
      showTripDateEditPage: false,
      prevDestinations: !_.isEmpty(props.selectedDestinations) && [...props.selectedDestinations],
      prevDestinationData: !_.isEmpty(props.destinationsData) && [...props.destinationsData],
      prevTripDate: !_.isEmpty(props.dateRange) && [...props.dateRange],
      showTravellerEditPage: false,
      // prevTravellerData: this.transformTravellerData([...props.travellerData]),
      prevTravellerData: !_.isEmpty(props.travellerData) && [...props.travellerData],
      counter: !_.isEmpty(props.travellerData) && getTemporaryId(props.travellerData),
      tripSummarydestinations: null,
      tripSummarytravellers: null,
      tripSummarytripStartDate: null,
      tripSummaryEndDate: null,
      showAlert: false,
      proposerID: props.proposerID,
      gaFlowName: ''
    };
  }

  static getDerivedStateFromProps = (props, state) => {
    if (state.proposerID !== props.proposerID) {
      return {
        proposerID: state.proposerID
      };
    }

    // return null;
  };

  async componentDidMount() {
    // const { proposerID } = this.props;

    const ele = document.querySelectorAll("#country_edit");

    ele[0].focus();

    let encryptedProposerId = null;
    let selectedModel = null;
    let lastPage = null;

    const { location, match } = this.props;

    const { proposerId: proposerID, tripSummary: storeTripSummary } = this.props;

    if (location && location.state) {
      encryptedProposerId = location.state.encryptedProposerId;
      selectedModel = location.state.selectedModel;
      lastPage = location.state.lastPage;
    }

    const { encryptedProposerId: passedID } = match.params;
    encryptedProposerId = passedID || encryptedProposerId;

    if (encryptedProposerId) {
      const data = {
        ProposerID: proposerID,
        encryptedProposerId
      };
    }
    let cookie = Cookies.get("TravelCjCookie");
    cookie = cookie ? JSON.parse(cookie) : { flowName: "" };
    this.setState({ proposerID, gaFlowName: cookie.flowName });

    if (!storeTripSummary || (storeTripSummary.encryptedProposerId !== encryptedProposerId && encryptedProposerId)) {
      let tripSummary = await GetTripSummary(proposerID, encryptedProposerId);
      if (tripSummary) {
        this.setState({
          tripSummarydestinations: tripSummary.destinations,
          tripSummarytravellers: tripSummary.travellers,
          tripSummarytripStartDate: tripSummary.tripStartDate,
          tripSummaryEndDate: tripSummary.tripEndDate
        }, () => {
          const dataToUpdate = {
            tripSummarydestinations: tripSummary.destinations,
            tripSummarytravellers: tripSummary.travellers,
            tripSummarytripStartDate: tripSummary.tripStartDate,
            tripSummaryEndDate: tripSummary.tripEndDate,
            encryptedProposerId, 
          }
          this.props.onUpdateTripSummary(dataToUpdate)
        });
      }
    } else {
      this.setState({
        tripSummarydestinations: storeTripSummary.tripSummarydestinations,
        tripSummarytravellers: storeTripSummary.tripSummarytravellers,
        tripSummarytripStartDate: storeTripSummary.tripSummarytripStartDate,
        tripSummaryEndDate: storeTripSummary.tripSummaryEndDate
      })

    }

    if (lastPage === "Checkout" || lastPage === "ProposalStep2" || lastPage === "ProposalStep1") {
      this.showEditPageModal(selectedModel);
      window.history.replaceState(null,'');

    }

    const { travellerData, onUpdateMemberData } = this.props;
    onUpdateMemberData(travellerData);
  }

  getTripSummary = async () => {
    let encryptedProposerId = null;

    const { match } = this.props;
    const { proposerID } = this.state;

    const { encryptedProposerId: passedID } = match.params;
    encryptedProposerId = passedID || encryptedProposerId;

    // this.setState({ proposerID });

    if (encryptedProposerId) {
      let tripSummary = await GetTripSummary(proposerID, encryptedProposerId);

      if (tripSummary) {
        this.setState({
          tripSummarydestinations: tripSummary.destinations,
          tripSummarytravellers: tripSummary.travellers,
          tripSummarytripStartDate: tripSummary.tripStartDate,
          tripSummaryEndDate: tripSummary.tripEndDate
        }, () => {
          const dataToUpdate = {
            tripSummarydestinations: tripSummary.destinations,
            tripSummarytravellers: tripSummary.travellers,
            tripSummarytripStartDate: tripSummary.tripStartDate,
            tripSummaryEndDate: tripSummary.tripEndDate,
            encryptedProposerId, 
          }
          this.props.onUpdateTripSummary(dataToUpdate)
        });
      }
    }
  };

  async componentDidUpdate() {
    const { showDestinationEditPage, showTripDateEditPage, showTravellerEditPage } = this.state;

    // let proposerID = null;
    // let selectedModel = null;
    // let lastPage = null;

    // const {
    //   location,
    //   match
    //  } = this.props;

    // if(location && location.state) {
    //   proposerID = location.state.proposerID;
    //   selectedModel = location.state.selectedModel;
    //   lastPage = location.state.lastPage;
    // }

    // const { proposerId: passedID } = match.params;
    // proposerID = passedID || proposerID;

    // if(proposerID) {
    //   const data = {
    //     ProposerID: proposerID
    //   }
    // }

    // this.setState({proposerID})

    // if(proposerID) {

    //   let tripSummary = await GetTripSummary(proposerID)
    //   if (tripSummary) {

    //     this.setState({
    //       tripSummarydestinations: tripSummary.destinations,
    //       tripSummarytravellers: tripSummary.travellers,
    //       tripSummarytripStartDate: tripSummary.tripStartDate,
    //       tripSummaryEndDate: tripSummary.tripEndDate

    //     });

    //   }
    // }

    if (showDestinationEditPage || showTripDateEditPage || showTravellerEditPage) {
      hideScroll();
    } else {
      showScroll();
    }
  }

  formattedDate = date => {
    // const newDate = new Date(date)
    // newDate.setDate(newDate.getDate()+1);

    return moment(date).format("DD/MM/YY");
    // return new Date(date).toISOString().substr(0,10).split('-').reverse().join('/').substr(0,8)
  };

  formattedDestinations = destinations => {
    if (!_.isEmpty(destinations)) {
      let dest = destinations[0];
      const len = destinations[0].length;
      if (len > 13) {
        dest = `${destinations[0].substring(0, 12)}...`;
      }
      if (destinations.length > 1) {
        return `${dest},+${destinations.length - 1} more `;
      }
      return `${dest}`;
    }
    return "Select Destination";
  };

  showEditPageModal = component => {
    const { selectedDestinations, destinationsData, dateRange, travellerData, page } = this.props;
    const { flowName, disabled } = this.props;
    const {
      gaFlowName
    } = this.state;

    if(disabled) return;

    if (page === "Checkout") {
      this.setState({
        showAlert: true,
        selectedModel: component
      }, this.checkoutCallBack(component));
      return;
    }

    if (page === "ProposalStep2") {
      switch (component) {
        case "destination":
          const gaData1 = {
            eventCategory: "Trv.BU Proposal 2",
            eventAction: "Trv.click",
            eventLabel: "Trv.Destination Edit",
            eventValue: "",
            flowName: gaFlowName
          };
          customEvent(gaData1);
          break;
        case "tripDate":
          const gaData2 = {
            eventCategory: "Trv.BU Proposal 2",
            eventAction: "Trv.click",
            eventLabel: "Trv.Trip Date Edit",
            eventValue: "",
            flowName: gaFlowName
          };
          customEvent(gaData2);
          break;
        case "travellerData":
          const gaData3 = {
            eventCategory: "Trv.BU Proposal 2",
            eventAction: "Trv.click",
            eventLabel: "Trv.Traveller Edit",
            eventValue: "",
            flowName: gaFlowName
          };
          customEvent(gaData3);
          break;
        default:
      }

      this.setState(
        {
          // showAlert: true,
          selectedModel: component
        },
        () => this.handleProceedAlert()
      );
      return;
    }

    if (page === "ProposalStep1") {
      switch (component) {
        case "destination":
          const gaData4 = {
            eventCategory: "Trv.BU Proposal 1",
            eventAction: "Trv.click",
            eventLabel: "Trv.Destination Edit",
            eventValue: "",
            flowName: gaFlowName
          };
          customEvent(gaData4);
          break;
        case "tripDate":
          const gaData5 = {
            eventCategory: "Trv.BU Proposal 1",
            eventAction: "Trv.click",
            eventLabel: "Trv.Trip Date Edit",
            eventValue: "",
            flowName: gaFlowName
          };
          customEvent(gaData5);
          break;
        case "travellerData":
          const gaData6 = {
            eventCategory: "Trv.BU Proposal 1",
            eventAction: "Trv.click",
            eventLabel: "Trv.Traveller Edit",
            eventValue: "",
            flowName: gaFlowName
          };
          customEvent(gaData6);
          break;
        default:
      }

      this.setState(
        {
          // showAlert: true,
          selectedModel: component
        },
        () => this.handleProceedAlert()
      );
      return;
    }

    switch (component) {
      case "destination":  {
        const gaData4 = {
          eventCategory: "Trv.BU Quotes",
          eventAction: "Trv.click",
          eventLabel: "Trv.Destination Edit",
          eventValue: "",
          flowName: flowName
        };
        customEvent(gaData4);
        this.setState({
          showDestinationEditPage: true,
          prevDestinations: _.cloneDeep(selectedDestinations),
          prevDestinationData: _.cloneDeep(destinationsData)
        });
        break;
      }
      case "tripDate": {

        const gaData5 = {
          eventCategory: "Trv.BU Quotes",
          eventAction: "Trv.click",
          eventLabel: "Trv.Trip Date Edit",
          eventValue: "",
          flowName: flowName
        };
        customEvent(gaData5);
        this.setState({
          showTripDateEditPage: true,
          prevTripDate: _.cloneDeep(dateRange)
        });
        break;
      }
      case "travellerData": {
        const gaData6 = {
          eventCategory: "Trv.BU Quotes",
          eventAction: "Trv.click",
          eventLabel: "Trv.Traveller Edit",
          eventValue: "",
          flowName: flowName
        };
        customEvent(gaData6);

        this.setState({
          showTravellerEditPage: true,
          prevTravellerData: _.cloneDeep(travellerData)
        });
        break;
      }
      default:
    }
  };

  checkoutCallBack = (component) => {
    const {
      gaFlowName
    } = this.state;
    switch (component) {
      case "destination":
        const gaData1 = {
          eventCategory: "Trv.BU Checkout",
          eventAction: "Trv.click",
          eventLabel: "Trv.Destination Edit",
          eventValue: "",
          flowName: gaFlowName
        };
        customEvent(gaData1);
        break;
      case "tripDate":
        const gaData2 = {
          eventCategory: "Trv.BU Checkout",
          eventAction: "Trv.click",
          eventLabel: "Trv.Trip Date Edit",
          eventValue: "",
          flowName: gaFlowName
        };
        customEvent(gaData2);
        break;
      case "travellerData":
        const gaData3 = {
          eventCategory: "Trv.BU Checkout",
          eventAction: "Trv.click",
          eventLabel: "Trv.Traveller Edit",
          eventValue: "",
          flowName: gaFlowName
        };
        customEvent(gaData3);
        break;
      default:
    }
  }

  getQuotesRequestBody = () => {
    const { proposerID } = this.props;
    return {
      SumAssured: 200000,
      isSIModified: 0,
      ProfileType: "",
      ProposerID: proposerID
    };
  };

  handleEditModalChange = (type = "apply") => {
    const { prevDestinations, prevTripDate, prevTravellerData, prevDestinationData } = this.state;

    const {
      onUpdateMemberData,
      onUpdateDestination,
      onUpdateTripDate,
      selectedDestinations,
      destinationsData,
      dateRange,
      travellerData
    } = this.props;

    if (type === "close") {
      this.setState(
        {
          showDestinationEditPage: false,
          showTripDateEditPage: false,
          showTravellerEditPage: false
        },
        () => {
          onUpdateDestination({
            formattedDestinations: prevDestinations,
            destinations: prevDestinationData
          });
          onUpdateMemberData(prevTravellerData);
          onUpdateTripDate(prevTripDate);
        }
      );
      return;
    }

    this.setState(
      {
        showDestinationEditPage: false,
        showTripDateEditPage: false,
        showTravellerEditPage: false,
        prevDestinations: _.cloneDeep(selectedDestinations),
        prevDestinationData: _.cloneDeep(destinationsData),
        prevTripDate: _.cloneDeep(dateRange),
        prevTravellerData: _.cloneDeep(travellerData)
      },
      () => this.getTripSummary()
      // async () =>{
      //   if(
      //       !_.isEqual(prevDestinations,selectedDestinations) ||
      //       !_.isEqual(prevTripDate,dateRange) ||
      //       !_.isEqual(prevTravellerData,travellerData)
      //     ){
      //     const data = {
      //         isPed: isPed ? 1 : 0,
      //         SourceTypeID:2,
      //         destinationsData,
      //         travellerData,
      //         tripStartDate: moment(dateRange[0]).format("DD-MM-YYYY"),
      //         tripEndDate: moment(dateRange[1]).format("DD-MM-YYYY"),
      //         proposerId: proposerID
      //     };
      //     const result = await savePreQuotes(data);
      //     if(!result.hasError) {
      //         const data = this.getQuotesRequestBody()
      //         // getInsurerQuotes(data);
      //     }

      //     this.setState({
      //         prevDestinations: [...selectedDestinations],
      //         prevTripDate: [...dateRange],
      //         counter: travellerData[travellerData.length-1].TemporaryID,
      //         prevTravellerData: [...travellerData]
      //     })
      // }
    );
  };

  renderDateRange = dateRange => {
    let date1 = "Trip Start Date";
    let date2 = "Trip End Date";
    if (dateRange[0]) {
      date1 = this.formattedDate(dateRange[0]);
    }
    if (dateRange[1]) {
      date2 = this.formattedDate(dateRange[1]);
    }

    return `${date1} - ${date2}`;
  };

  changeCounter = count => {
    this.setState({
      counter: count
    });
  };

  handleCloseAlert = () => {
    this.setState({ showAlert: false });
  };

  handleProceedAlert = () => {
    const { selectedModel, proposerID } = this.state;

    const { history, page, encryptedProposerId } = this.props;
    // this.setState({ loading: true });

    // const result = await savePreQuotes(data);
    history.push({
      pathname: `/v2/quotes/${encryptedProposerId}`,
      state: {
        proposerID: proposerID,
        selectedModel: selectedModel,
        lastPage: page,
        encryptedProposerId, 
      }
    });
  };

  render() {
    const { travellerData, dateRange, selectedDestinations, saveUpdatedData } = this.props;

    const { prevTravellerData } = this.state;

    const {
      showDestinationEditPage,
      showTripDateEditPage,
      showTravellerEditPage,
      counter,
      tripSummarydestinations,
      tripSummarytravellers,
      tripSummarytripStartDate,
      tripSummaryEndDate,
      showAlert,
    } = this.state;

    return (
      <div className="quotes_member_info">
        <div className="row">
          {showAlert && (
            <CheckoutAlerModal
              onClose={this.handleCloseAlert}
              onProceed={this.handleProceedAlert}
            />
          )}
          {showDestinationEditPage && (
            <CountryEditModal
              handleEditModalChange={this.handleEditModalChange}
              saveUpdatedData={saveUpdatedData}
            />
          )}
          {showTripDateEditPage && (
            <TripDateEditModal
              handleEditModalChange={this.handleEditModalChange}
              saveUpdatedData={saveUpdatedData}
              values={dateRange}
              focusedInput="startDate"
            />
          )}
          {showTravellerEditPage && (
            <TravellerEditModal
              handleEditModalChange={this.handleEditModalChange}
              saveUpdatedData={saveUpdatedData}
              changeCounter={this.changeCounter}
              counter={counter}
              prevTravellerData={prevTravellerData}
            />
          )}
          <div className="col-md-4 col-12">
            <div class="card">
              <div class="row no-gutters justify-content-center align-items-center">
                <div class="col-md-8 col-10">
                  <span>Destinations</span>
                  <p>
                    {/* {this.formattedDestinations(selectedDestinations)} */}
                    {tripSummarydestinations}{" "}
                  </p>
                </div>
                <div class="col-md-4 col-2">
                  <div class="card-body">
                    <i
                      className="edit-btn btn-primary"
                      id="country_edit"
                      onClick={() => this.showEditPageModal("destination")}
                    >
                      Edit
                    </i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div class="card">
              <div class="row no-gutters justify-content-center align-items-center">
                <div class="col-md-8 col-10">
                  <span>Travellers</span>
                  <p>
                    {/* {`${travellerData.length} Member(s)`}
              {' '} */}
                    {`${travellerData.length} member(s)`}
                  </p>
                </div>
                <div class="col-md-4 col-2">
                  <div class="card-body">
                    <i
                      className="edit-btn btn-primary"
                      onClick={() => this.showEditPageModal("travellerData")}
                    >
                      Edit
                    </i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div class="card">
              <div class="row no-gutters justify-content-center align-items-center">
                <div class="col-md-8 col-10">
                  <span>{lang.quotesTripDate}</span>
                  <p>
                    {/* {this.renderDateRange(dateRange)}
              {' '} */}
                    {`${moment(tripSummarytripStartDate, "YYYY-MM-DD").format(
                      "D MMM' YY"
                    )} - ${moment(tripSummaryEndDate, "YYYY-MM-DD").format("D MMM' YY")}`}
                  </p>
                </div>
                <div class="col-md-4 col-2">
                  <div class="card-body">
                    <i
                      className="edit-btn btn-primary"
                      onClick={() => this.showEditPageModal("tripDate")}
                    >
                      Edit
                    </i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EditModal.propTypes = {
  travellerData: PropTypes.instanceOf(Array).isRequired,
  dateRange: PropTypes.instanceOf(Array).isRequired,
  selectedDestinations: PropTypes.instanceOf(Array).isRequired,
  destinationsData: PropTypes.instanceOf(Array).isRequired,
  proposerID: PropTypes.number.isRequired,
  onUpdateMemberData: PropTypes.func.isRequired,
  onUpdateDestination: PropTypes.func.isRequired,
  onUpdateTripDate: PropTypes.func.isRequired,
  saveUpdatedData: PropTypes.func.isRequired,
};

const mapDateDispatchToProps = dispatch => {
  return {
    onUpdateTripDate: data => dispatch(onUpdateTripDate(data)),
    onUpdateMemberData: data => dispatch(onUpdateMemberData(data)),
    onUpdateDestination: data => dispatch(onUpdateDestination(data)),
    onUpdateTripSummary: data => dispatch(onUpdateTripSummary(data))
  };
};

const mapStateToProps = state => {
  return {
    travellerData: state.travellerData,
    selectedDestinations: state.destinations,
    dateRange: state.dateRange,
    destinationsData: state.destinationsData,
    flowName: state.flowName,
    encryptedProposerId: state.encryptedProposerId,
    tripSummary: state.tripSummary
  };
};

export default connect(mapStateToProps, mapDateDispatchToProps)(EditModal);
