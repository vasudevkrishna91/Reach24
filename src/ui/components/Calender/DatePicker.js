import React, { Component } from 'react';
import { SingleDatePicker } from 'react-dates';
import PropTypes from 'prop-types';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import Moment, { months } from 'moment';
import { extendMoment } from "moment-range";
import { calenderEvents } from '../../../lib/helperData';
import './tripDate.css';

const moment = extendMoment(Moment);

class DatePicker extends Component {
  constructor(props) {
    super(props);
    const { dateOfBirth } = this.props
    this.state = {
      selectedDate: dateOfBirth != null ? moment(dateOfBirth, "YYYY-MM-DD") : null,

    }
  }

  componentDidMount() {
  }

  handelMemberDob = (dob) => {
    this.setState({
      selectedDate: moment(dob._d)
    })
    const {
      onChange,
      insuredMemberID,
      index
    } = this.props;
    onChange({
      dateOfBirth: dob._d,
      insuredMemberID,
      isFocused: false,
      index
    }, calenderEvents.onDateChange)
  }

  memberWiseFocusChange = (focused) => {
    const {
      dateOfBirth,
      insuredMemberID,
      onChange
    } = this.props;
    onChange({
      dateOfBirth,
      insuredMemberID,
      isFocused: focused,
    }, calenderEvents.onFocusChange);
  }

  enabelDisabelCalenderYears = (day, calendarStartOn, calendarEndOn) => {


    // let valid = true;
    return !moment(day._d).isBetween(moment(calendarStartOn, "YYYY-MM-DD"), moment(calendarEndOn, "YYYY-MM-DD").add("day", 1))
    //valid;
  }

  initialVisibleYears = (age, selectedDate, calendarStartOn) => {
    if (!selectedDate) {
      return moment().year(moment(calendarStartOn, "YYYY-MM-DD").year()).month(moment(calendarStartOn, "YYYY-MM-DD").month()).day(moment(calendarStartOn, "YYYY-MM-DD").day())

    }
    else {
      return moment().year(moment(selectedDate._i).year()).month(moment(selectedDate._i).month())
    }
  }

  renderMonthElement = ({ month, onMonthSelect, onYearSelect}) =>{
    const { calendarStartOn, calendarEndOn} = this.props;
    const years = [];
    for(let i = moment(calendarEndOn).year(); i >= moment(calendarStartOn).year(); i--) {
        years.push(<option value={i} key={`${i}`}>{i}</option>)
    }
    return(
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
        <select
          value={month.month()}
          onChange={(e) => onMonthSelect(month, e.target.value)}
        >
          {moment.months().map((label, value) => (
            <option value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <select value={month.year()} onChange={(e) => onYearSelect(month, e.target.value)}>
          {/* <option value={moment().year() - 1}>Last year</option>
          <option value={moment().year()}>{moment().year()}</option>
          <option value={moment().year() + 1}>Next year</option> */}
          {years}
        </select>
      </div>
    </div>)}

  render() {
    const {
      isFocused,
      insuredMemberID,
      displayFormat,
      age,
      calendarStartOn,
      calendarEndOn
    } = this.props;

    const {
      selectedDate
    } = this.state

    const OPEN_UP = 'up'

    return (
      <SingleDatePicker
        openDirection="up"
        date={selectedDate}
        initialVisibleMonth={() => this.initialVisibleYears(age, selectedDate, calendarStartOn)}
        id={`insuredMemberID${insuredMemberID}`}
        focused={isFocused}
        onDateChange={date => this.handelMemberDob(date)}
        onFocusChange={({ focused }) => this.memberWiseFocusChange(focused)}
        numberOfMonths={1}
        isOutsideRange={(day) => this.enabelDisabelCalenderYears(day, calendarStartOn, calendarEndOn)}
        displayFormat={displayFormat}
        readOnly={true}
        renderMonthElement={this.renderMonthElement}
      />
    )
  }
}

DatePicker.propTypes = {
  index: PropTypes.number.isRequired,
  isFocused: PropTypes.bool.isRequired,
  dateOfBirth: PropTypes.string.isRequired,
  insuredMemberID: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  displayFormat: PropTypes.string.isRequired,
}

export default DatePicker; 