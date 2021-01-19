import React, { Component } from "react";
import PropTypes from "prop-types";

import { SingleDatePicker } from "react-dates";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Moment from "moment";
import * as _ from "lodash";
import { extendMoment } from "moment-range";
import { connect } from "react-redux";
import { onUpdateTravellerData } from "../../../store/actions/preQuoteActions";
import { lang } from "../../../cms/i18n/en";

const moment = extendMoment(Moment);

class TravellerDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      travellerData: _.cloneDeep(props.travellerData),
      alert: ""
    };
  }

  componentDidMount() {

    var region = document.querySelector('.dob_scroll');
    var x = region.getElementsByTagName("INPUT");
    var i;
    for (i = 0; i < x.length; i++) {
      x[i].setAttribute("readonly", true);
      // x[i].addEventListener("change",(e) => this.hanleInputType(e, x[i]));
    }
    // document.getElementsByTagName("INPUT")[0].setAttribute("type", "button");

  }
  enabelDisabelCalenderYears = (date, calendarStartOn, calendarEndOn) => {
    const start = moment(calendarStartOn);
    const end = moment(calendarEndOn);
    const valid = date.isBefore(start, "day") || date.isAfter(end, "day");
    return valid;
  };


  handelCalenderEvents = (e, index) => {

    if (e) {
      const { travellerData, errors } = this.state;

      let newDate = new Date(e);
      newDate.setDate(e.getDate() + 1);
      // travellerData.members[index].dateOfBirth = newDate.toISOString().substr(0, 10);
      travellerData[index].dateOfBirth = newDate.toISOString().substr(0, 10);
      this.setState({
        travellerData,
        alert: ""
      });
    }
  };


  handleDateChange = (date, index) => {
    const { travellerData } = this.state;
    travellerData[index].dateOfBirth = date._d;
    travellerData[index].isFocused = false;
    this.setState({
      travellerData,
      alert: ""
    });
  };

  handleFocusChange = (focus, index) => {
    let { travellerData } = this.state;
    if (!focus.focused) {
      travellerData.forEach(traveller => {
        traveller.isFocused = false;
      });
    } else {
      travellerData = travellerData.map((traveler, id) => {
        if (id !== index) traveler.isFocused = false;
        else traveler.isFocused = true;
        return traveler;
      });
    }
    this.setState({
      travellerData
    });
  };

  initialVisibleYears = (selectedDate, calendarStartOn) => {
    if (!selectedDate) {
      return moment(calendarStartOn);
    }
    return moment(selectedDate);
  };

  handleApplyButton = async () => {
    const { travellerData } = this.state;
    const {
      onUpdateTravellerData,
      close,
      travellerData: prevTravellerData,
      saveUpdatedData,
      values,
      destinationsData
    } = this.props;

    let check = false;
    travellerData.forEach(traveller => {
      if (!traveller.dateOfBirth) {
        check = true;
      }
    });
    if (check) {
      this.setState({
        alert: lang.quotesDOBAlert
      });
      return;
    }

    sessionStorage.setItem("askDob", false);

    // if(!_.isEqual(prevTravellerData, travellerData)){
    const data = {
      data: {
        members: [...travellerData],
        tripCountries: [...destinationsData],
        tripStartDate: moment(values[0]).format("YYYY-MM-DD"),
        tripEndDate: moment(values[1]).format("YYYY-MM-DD")
      },
      actionTypeID: "16"
    };
    onUpdateTravellerData({ travellerData, saveTravellerDOB: true });
    close(true);
    await saveUpdatedData(data, true);
    // }
  };

  render() {
    const { travellerData, alert } = this.state;
    const { close } = this.props;
    return (
      <div className="overlay overlay_ab">
        <div className="modal-dialog insurer_popup si_popup TravellerDetails">
          <div className="modal-content">
            <div className="TravellerDetails_header">
              {" "}
              {lang.quotesTravllerDetailsHeader}{" "}
              <span className="close" onClick={() => close(false)}></span>
            </div>
            <div className="si_wrapper">
              <div className="">
                <p>{lang.quotesTravellersSubHeader}</p>
              </div>
              <div className="dob_scroll">
                <table cellPadding="10" cellSpacing="0" width="100%">
                  <tr>
                    <th>{lang.quotesTraveler}</th>
                    <th>{lang.quotesTravelerAge}</th>
                    <th>{lang.quotesTravelerDOB}</th>
                  </tr>
                  {travellerData.map((traveler, index) => {
                    const { age, dateOfBirth, calendarStartOn, calendarEndOn } = traveler;

                    return (
                      <tr>
                        <td>{traveler.labelTraveller}</td>
                        <td>{traveler.age} Years</td>
                        <td
                         // className="dbo_Calendar"
                          style={{
                            border: `${alert && !traveler.dateOfBirth ? "1px solid red" : ""}`
                          }}
                        >
                          {/* <SingleDatePicker
                          date={dateOfBirth ? moment(dateOfBirth) : null}
                          onDateChange={date => this.handleDateChange(date, index)}
                          focused={traveler.isFocused}
                          onFocusChange={({ focused }) =>
                            this.handleFocusChange({ focused }, index)
                          }
                          id={traveler.labelTraveller}
                          placeholder="DD/MM/YYYY"
                          defaultFormat="D MMM' YY"
                          numberOfMonths={1}
                          initialVisibleMonth={() =>
                            this.initialVisibleYears(dateOfBirth, calendarStartOn)
                          }
                          isOutsideRange={day =>
                            this.enabelDisabelCalenderYears(day, calendarStartOn, calendarEndOn)
                          }
                        /> */}

                          <div className="dbo_Calendar askdobCalender" id={traveler.labelTraveller}

                          >
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


                        </td>
                      </tr>
                    );
                  })}
                </table>
              </div>
              <div className="insurer_btn">
                <button
                  type="submit"
                  className="clear_all"
                  onClick={() => {
                    sessionStorage.setItem("askDob", false);
                    close(false)
                  }}
                >
                  {lang.quotesSkipButton}
                </button>
                <button
                  className="primary_button apply_btn"
                  type="submit"
                  onClick={this.handleApplyButton}
                >
                  {lang.quotesApplyCaps}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TravellerDetails.propTypes = {
  travellerData: PropTypes.instanceOf(Array).isRequired,
  close: PropTypes.func.isRequired,
  values: PropTypes.instanceOf(Array).isRequired,
  onUpdateTravellerData: PropTypes.func.isRequired,
  saveUpdatedData: PropTypes.func.isRequired,
  destinationsData: PropTypes.instanceOf(Array).isRequired
};

const mapStateToProps = state => ({
  travellerData: state.travellerData,
  saveTravellerDOB: state.saveTravellerDOB,
  values: state.dateRange,
  destinationsData: state.destinationsData
});

export default connect(mapStateToProps, { onUpdateTravellerData })(TravellerDetails);
