import React, { Component } from "react";
import { default as countryData } from "../../../lib/countryDataLatest.json";

import "./styles/newCountryModal.css";
import { lang } from "../../../cms/i18n/en/index.js";

import { connect } from "react-redux";
import { onUpdateDestination, onUpdateTripSource } from "../../../store/actions/preQuoteActions";
import {
  destinationMapper,
  highlightedCountriesList,
  DESTINATION_LIMIT
} from "../../../lib/helperData";

import _ from "lodash";
import { customEvent } from "../../../GA/gaEvents";

class CountryModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filteredCountryData: this.getFilteredCountryData(countryData, props.destinationsData),
      destinations: props.selectedDestinations ? props.selectedDestinations : [],
      destinationsData: props.destinationsData ? props.destinationsData : [],
      alert: "",
      loading: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { selectedDestinations, destinationsData, tripSource } = props;
    const { alert } = state;

    // let data = {};
    let data = {};

    // const invalidCountry = props.destination && props.selectedDestinations.filter(item => item === 'India');

    if (
      selectedDestinations !== undefined &&
      destinationsData !== undefined &&
      !_.isEqual(selectedDestinations, state.destinations) &&
      !_.isEqual(destinationsData, state.destinationsData)
    ) {
      data = {
        ...data,
        destinations: selectedDestinations,
        destinationsData,
        alert: ''
      };
    }

    if (
      props.selectedDestinations.findIndex(dest => dest === "India") === -1
      // && !alert
    ) {
      if (tripSource !== "Outside India") {
        data = {
          ...data,
          // alert: "",
          // showToast: false
        };
      } else if (tripSource === "Outside India") {
        data = {
          ...data,
          // alert: lang.invalidCountry
          // showToast: true
        };
      }
    }

    // if(tripSource === 'Outside India') {
    //   data = {
    //     ...data,
    //     alert: lang.invalidCountry,
    //   };
    // }
    // if(invalidCountry.length > 0 && tripSource !== 'Outside India'){
    //   props.showWithinIndiaDestinationError(data.alert);
    // }
    // else{
    //   props.showWithinIndiaDestinationError('');
    // }

    return {
      ...data
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedDestinations, tripSource, destinationsData } = this.props;
    const { alert } = this.state;

    if (prevProps.selectedDestinations !== selectedDestinations) {
      this.setState({
        filteredCountryData: this.getFilteredCountryData(countryData, destinationsData)
      });
      if (selectedDestinations.findIndex(dest => dest === "India") !== -1) {
        this.setState({
          alert: "We currently do not have plans for travel within India. But they're coming soon.",
          showToast: true
        });
      }
      if (tripSource === "Outside India") {
        this.setState({
          // alert: lang.invalidCountry,
          // showToast: true
        });
      }
    }
  }

  gaCustomeEvent = data => {
    const gaData = {
      eventCategory:
        this.props.eventCategory == undefined ? "Trv.BU Prequotes" : this.props.eventCategory,
      eventAction: data.Action,
      eventLabel: data.Label,
      eventValue: "",
      flowName: ""
    };
    customEvent(gaData);
  };

  getFilteredCountryData = (countryData = [], destinationsData = []) => {
    let filteredCountry = countryData.filter(country => country.MostPopular === true);
    filteredCountry = filteredCountry.map(country => {
      const index = destinationsData.findIndex(obj => obj.CountryName === country.CountryName);
      if (index !== -1) {
        return {
          selected: true,
          ...country
        };
      }
      return {
        ...country
      };
    });

    filteredCountry = filteredCountry.sort(function(a, b) {
      if (a.Order < b.Order) return -1;
      if (a.Order > b.Order) return 1;
      return 0;
    });
    return filteredCountry;
  };

  handleCountryClick = (e, country) => {
    const { onUpdateDestination, afterUpdate, editPage, tripSource } = this.props;
    let { filteredCountryData, destinationsData, destinations } = this.state;
    let emptyDest = "";
    let alert = "";

    const index = filteredCountryData.findIndex(obj => obj.CountryName === country.CountryName);

    if (index !== -1) {
      let selectedData = filteredCountryData[index];
      selectedData.selected = selectedData.selected !== undefined ? !selectedData.selected : true;

      if (selectedData.selected) {
        if (selectedData.CountryName == "India") {
          alert =
            "We currently do not have plans for travel within India. But they're coming soon.";
          this.gaCustomeEvent({ Action: "Trv.Destination", Label: "Trv.Domestic" });
        } else if (tripSource === "Outside India") {
          alert = lang.invalidCountry;
        }
        destinations.push(country.CountryName);
        destinationsData.push(selectedData);
      } else {
        destinations = destinations.filter(destination => destination !== country.CountryName);
        destinationsData = destinationsData.filter(
          data => data.CountryName !== selectedData.CountryName
        );
      }

      onUpdateDestination({
        formattedDestinations: destinations,
        destinations: destinationsData
      });

      editPage ? afterUpdate(destinations, destinationsData) : afterUpdate();

      filteredCountryData[index] = selectedData;
      this.setState({
        filteredCountryData,
        emptyDest,
        alert,
        showToast: alert ? true : false
      });
    }

    return;
  };

  isCountrySelected = country => {
    const { destinationsData } = this.state;
    const index = destinationsData.findIndex(obj => obj.CountryName === country.CountryName);

    if (index === -1) return false;
    const data = destinationsData[index];

    if (!_.isEmpty(data)) return true;

    return false;
  };

  handleKeyPress = (e, country, tabId) => {
    e.preventDefault();
    let nextInput = "";
    if (e.key === "Tab") {
      nextInput = document.querySelectorAll("[tabindex=" + '"' + (tabId + 1) + '"]');
      if (nextInput.length === 0) {
        nextInput = document.querySelectorAll('[tabindex="1"]');
      }
      nextInput[0].focus();
    }
    if (e.key === "Enter") {
      this.handleOnSubmit();
    }
    if (e.key === " " || e.key === "Spacebar") {
      this.handleCountryClick(e, country);
    }
  };

  renderCountryList = () => {
    const { filteredCountryData, showToast } = this.state;
    const { selectedDestinations } = this.props;
    // const filteredCountry = countryData.filter(country => country.MostPopular === true);

    return (
      <div className="MostPopularCountryList">
        <ul>
          {filteredCountryData.map((country, id) => (
            <li class={this.isCountrySelected(country) ? "active" : null}>
              <div
                className="countryChip"
                onKeyDown={e => this.handleKeyPress(e, country, id + 1)}
                onClick={e => this.handleCountryClick(e, country)}
                tabIndex={(id + 1).toString()}
                style={{
                  border:
                    country.CountryName === "India" &&
                    selectedDestinations.findIndex(dest => dest === "India") !== -1
                      ? "1px solid red"
                      : ""
                }}
              >
                {country.CountryName}
              </div>
              <span></span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  handleFlyingfromClickEvent = e => {
    let error = "";

    const { onUpdateTripSource } = this.props;
    if (e.target.value === "Outside India") {
      error = lang.invalidCountry;
      this.gaCustomeEvent({ Action: "Trv.Travel Started", Label: "Trv.Outside India" });
    } else {
      error = "";
      this.gaCustomeEvent({ Action: "Trv.Travel Started", Label: "Trv.Inside India" });
    }

    onUpdateTripSource(e.target.value);
    this.setState({
      alert: error,
      showToast: error ? true : false
    });
  };

  validateDestinations = () => {
    const { destinations } = this.state;
    const { tripSource, selectedDestinations } = this.props;
    let { alert } = this.state;
    let emptyDest = "";
    // let valid = '';
    if (tripSource === "Outside India") {
      alert = lang.invalidCountry;
    }
    if (selectedDestinations.findIndex(dest => dest === "India") !== -1) {
      alert = "We currently do not have plans for travel within India. But they're coming soon.";
    }

    alert = !destinations.length ? lang.emptyDestination : alert;
    // emptyDest = !destinations.length ? lang.emptyDestination : "";
    this.setState({
      alert,
      emptyDest,
      showToast: alert ? true : false
    });
    return alert === "" || alert === undefined;
  };

  handleOnSubmit = e => {
    const { alert, destinations } = this.state;
    const { flowNameGA } = this.state;

    const valid = this.validateDestinations();
    if (!alert && valid) {
      this.props.closeModel();
      this.setState({ loading: true });
    }
    const gaData = {
      eventCategory:
        this.props.eventCategory == undefined ? "Trv.BU Prequotes" : this.props.eventCategory,
      eventAction: "Trv.Countries Selected",
      eventLabel: destinations.toString(),
      eventValue: "",
      flowName: flowNameGA
    };

    if (destinations.length > 0) {
      customEvent(gaData);
    }
  };

  hideToast = () => {
    this.setState({
      showToast: false
    });
  };

  render() {
    const { alert, showToast, emptyDest, loading } = this.state;
    const { tripSource, editPage } = this.props;
    return (
      <div className="CountryModal">
        {/* <div class="error">{alert}</div> */}
        <h6>{lang.mostPopularCountryTitle}</h6>
        {this.renderCountryList()}

        <div class="clearfix"></div>

        <div className={showToast ? "toast" : "toast_show"}>
          {showToast && (
            <>
              <p className="kkTost">
                <i className="info" />
                {alert}
                <span className="closeToast" onClick={this.hideToast} />
              </p>
            </>
          )}
        </div>
        <div class="clearfix"></div>
        <div className="row align-items-center show-mobile justify-content-space-around">
          <div className="">
            <div className="country_bottom_text">
              <i>{lang.flyingFrom}</i>
              <a>
                <select
                  onChange={e => this.handleFlyingfromClickEvent(e)}
                  style={{ border: tripSource === "Outside India" ? "1px solid red" : "" }}
                >
                  <option value="India" selected={tripSource !== "Outside India"}>
                    {lang.withinIndia}
                  </option>
                  <option value="Outside India" selected={tripSource === "Outside India"}>
                    {lang.outsideIndia}
                  </option>
                </select>
              </a>
            </div>
          </div>
          <div className="country_error_msg">{emptyDest}</div>
          <div className="country-search-button">
            {loading ? (
              <button className="next loading"></button>
            ) : (
              <button
                className={`next ${!alert && !emptyDest && tripSource !== "Outside India" ? "" : "disable"}`}
                onClick={this.handleOnSubmit}
              >
                {!editPage ? "Next" : "Apply"}
              </button>
            )}
          </div>
        </div>

        <div className="cl"></div>
      </div>
    );
  }
}

const mapCountryStateToProps = state => {
  return {
    selectedDestinations: state.destinations,
    destinationsData: state.destinationsData,
    tripSource: state.tripSource,
    flowNameGA: state.flowName
  };
};
const mapCountryDispatchToProps = dispatch => {
  return {
    onUpdateDestination: data => dispatch(onUpdateDestination(data)),
    onUpdateTripSource: data => dispatch(onUpdateTripSource(data))
  };
};

export default connect(mapCountryStateToProps, mapCountryDispatchToProps)(CountryModal);

// export default CountryModal;
