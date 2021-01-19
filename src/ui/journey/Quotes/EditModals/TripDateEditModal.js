import React, { Component } from "react";
import PropTypes from "prop-types";

import { DateRangePicker } from "react-dates";
import Moment from "moment";
import "react-dates/lib/css/_datepicker.css";
import "react-dates/initialize";

import { connect } from "react-redux";
import _ from "lodash";
import { onUpdateTripDate } from "../../../../store/actions/preQuoteActions";
import { lang } from "../../../../cms/i18n/en/index";
import "./styles/tripDateModal.css";
import { extendMoment } from "moment-range";
import { customEvent } from "../../../../GA/gaEvents";

const moment = extendMoment(Moment);

class TripDateEditModal extends Component {
  constructor(props) {
    super(props);
    this.mobileScreen = window.screen.width < 768 ? true : false;
    this.state = {
      startDate: moment(props.values[0]),
      endDate: moment(props.values[1]),
      focusedInput: props.focusedInput,
      minDate: moment(),
      maxDate: moment().add(179, "d"),
      loading: false
    };
    this.update = false;
  }

  componentDidMount() {
    var region = document.querySelector(".EditTripModal");
    var x = region.getElementsByTagName("INPUT");
    var i;
    for (i = 0; i < x.length; i++) {
      x[i].setAttribute("readonly", true);
      // x[i].addEventListener("change",(e) => this.hanleInputType(e, x[i]));
    }
  }

  gaCustomEvent = (date, action) => {
    const { flowNameGA } = this.props;

    const gaData = {
      eventCategory: "Trv.BU Quotes",
      eventAction: action,
      eventLabel: date,
      eventValue: "",
      flowName: flowNameGA
    };
    customEvent(gaData);
  };

  handleSubmitPage = async () => {
    const {
      handleEditModalChange,
      onUpdateTripDate,
      saveUpdatedData,
      destinationsData,
      travellerData
    } = this.props;

    const { startDate, endDate } = this.state;

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
        tripStartDate: moment(startDate._d).format("YYYY-MM-DD"),
        tripEndDate: moment(endDate._d).format("YYYY-MM-DD")
      },
      actionTypeID: "5"
    };

    this.setState({ loading: true})

    const dates = [startDate, endDate];
    onUpdateTripDate(dates);
    this.gaCustomEvent(moment(startDate).format("DD-MM-YYYY"), "Trv.Start Date");
    this.gaCustomEvent(moment(endDate).format("DD-MM-YYYY"), "Trv.End Date");
    const res = await saveUpdatedData(data);
    handleEditModalChange();
  };

  closeModel = () => {
    const { handleEditModalChange, onUpdateTripDate } = this.props;

    const { startDate, endDate } = this.state;
    const date = [startDate, endDate];
    onUpdateTripDate(date);
    handleEditModalChange("close");
  };

  tranformDateForApi = date => {
    const datearray = new Date(date)
      .toISOString()
      .substring(0, 10)
      .split("-");
    const newdate = `${datearray[1]}/${datearray[2]}/${datearray[0]}`;
    return newdate;
  };

  handleDateSelected = (startDate, endDate) => {
    if (startDate && !endDate) {
      this.update = true;
    } else {
      this.update = false;
    }
    this.setState({
      startDate,
      endDate,
      maxDate: moment(startDate).add(180, "d")
    });
  };

  handleOutsideRangeCheck = date => {
    const { minDate, maxDate } = this.state;
    const valid = date.isBefore(minDate, "day") || date.isAfter(maxDate, "day");
    return valid;
  };

  handleFocusChange = (focusedInput, update = false) => {
    const { startDate, focusedInput: focused } = this.state;

    if (
      !this.update &&
      focusedInput === "endDate" &&
      (!startDate || !startDate._isValid) &&
      focusedInput !== focused
    ) {
      this.setState({ focusedInput: "startDate" });
      return;
    }

    const focusedCheck = focusedInput === null ? "startDate" : focusedInput;

    this.setState({
      focusedInput: focusedCheck
    });
  };

  render() {
    const { startDate, endDate, focusedInput, loading } = this.state;

    return (
      <div className="overlay">
        <div className="EditTripModal">
          <span onClick={() => this.closeModel()} className="close"></span>
          <DateRangePicker
            startDate={startDate} // momentPropTypes.momentObj or null,
            startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
            endDate={endDate} // momentPropTypes.momentObj or null,
            endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
            onDatesChange={({ startDate, endDate }) => this.handleDateSelected(startDate, endDate)}
            focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
            onFocusChange={focusedInput => this.handleFocusChange(focusedInput)} // PropTypes.func.isRequired,
            anchorDirection="left"
            displayFormat="D MMM' YY"
            openDirection="up"
            showDefaultInputIcon={false}
            isOutsideRange={this.handleOutsideRangeCheck}
            onClose={this.handleCloseCalendar}
            keepOpenOnDateSelect={true}
            numberOfMonths={this.mobileScreen ? 1 : 2}
            // withPortal={true}
            // customInputIcon={<input placeholder={"Select"}/>}
          />
          <div className="cl" />
          {loading ? (
            <button className="primary_button loading"></button>
          ) : (
            <button type="submit" className="primary_button" onClick={this.handleSubmitPage}>
              {lang.quotesApply}
            </button>
          )}

          <div className="cl" />
        </div>
      </div>
    );
  }
}

TripDateEditModal.propTypes = {
  values: PropTypes.instanceOf(Array).isRequired,
  focusedInput: PropTypes.string.isRequired,
  handleEditModalChange: PropTypes.func.isRequired,
  onUpdateTripDate: PropTypes.func.isRequired,
  saveUpdatedData: PropTypes.func.isRequired
};

const mapDateStateToProps = state => {
  return {
    values: state.dateRange,
    destinationsData: state.destinationsData,
    travellerData: state.travellerData,
    flowNameGA: state.flowName
  };
};
const mapDateDispatchToProps = dispatch => {
  return {
    onUpdateTripDate: data => dispatch(onUpdateTripDate(data))
  };
};

export default connect(mapDateStateToProps, mapDateDispatchToProps)(TripDateEditModal);
