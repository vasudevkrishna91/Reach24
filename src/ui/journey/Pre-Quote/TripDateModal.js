import React, {Component} from 'react';

import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';

import { connect } from 'react-redux';
import _ from 'lodash'
import { onUpdateTripDate, onUpdateTripSummary } from '../../../store/actions/preQuoteActions';
import { lang } from "../../../cms/i18n/en/index";
import { customEvent } from "../../../GA/gaEvents";

var moment = require('moment');
class TripDateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: props.values[0],
      endDate: props.values[1],
      minDate: moment(),
      maxDate: moment().add(179, "d"),
      focusedInput: props.focusedInput,
      tabPress: 0
    };
    this.update = false
    this.mobileScreen =  window.screen.width < 768 ? true : false
  }

  static getDerivedStateFromProps(props, state) {
    const data = {};

    const { values } = props;
    if ( state.startDate != values[0] || state.endDate != values[1]) {
        data.startDate = values[0];
        data.endDate = values[1];
    }

    if( state.focusedInput === null && props.focusedInput === 'startDate') {
        data.focusedInput = 'startDate'
    } 
    
    if(props.focusedInput === null && props.focusedInput !== state.focusedInput) {
        
      data.focusedInput = null

    }

    if(!_.isEmpty(data)) {

      return {
        ...data
      }
    }
    return null;
  }

  componentDidMount() {

    var region = document.querySelector('.tripDateModal');
    var x = region.getElementsByTagName("INPUT");
    var i;
    for (i = 0; i < x.length; i++) {
      x[i].setAttribute("readonly", true);
      // x[i].addEventListener("change",(e) => this.hanleInputType(e, x[i]));
    }
    // document.getElementsByTagName("INPUT")[0].setAttribute("type", "button");

  }

  // handleInputType = (e, obj) => {
  //   obj.setAttribute("value", "");
  //   console.log('------')
    
  // }

  handleDateSelected = (startDate, endDate) => {
    // console.log('Handle Date Selected On Focus', startDate, endDate)
    const{
      startDate:filledStartDate

    }=this.state;
    if(filledStartDate ){
      endDate=null;
    }
    const date = [startDate, endDate];

    if(startDate && !endDate) {
      // this.handleFocusChange('endDate', true);
      this.update = true;
    } else {
      this.update = false;
    }


    this.setState(
      {
        startDate,
        endDate,
        maxDate: moment(startDate).add(180, "d")
      },
      // () => {
      //   this.props.onUpdateTripDate(date);
      // }
    );

    this.props.onUpdateTripDate(date);

  };

  handleOutsideRangeCheck = date => {
    const { minDate, maxDate } = this.state;
    const valid = date.isBefore(minDate, "day") || date.isAfter(maxDate, "day");
    return valid;
  };

  gaCustomEvent = (date,action) => {

    const { flowNameGA } = this.props;

    const gaData = {
      eventCategory : 'Trv.BU Prequotes',
      eventAction   : action,
      eventLabel    : date,
      eventValue    : '',					
      flowName			: flowNameGA
    }
      customEvent(gaData);
  }


  handleCloseCalendar = ({startDate, endDate}) => {
    const date = [startDate, endDate];

    let error = ( !startDate || 
                  !endDate || 
                  !startDate._isValid || 
                  !endDate._isValid
                ) ? `${lang.tripDateError}` : '';

    if(error) {
      this.setState({ error });
      return;
    }
    this.setState({
      startDate,
      endDate,
      maxDate: moment(startDate).add(180, "d")
    }, () => {
      this.props.onUpdateTripDate(date);
      this.props.onUpdateTripSummary(null);
      this.props.closeOtherModel()
      this.props.showMobileFieldFunc();
      this.gaCustomEvent(moment(startDate).format('DD-MM-YYYY'),'Trv.Start Date')
      this.gaCustomEvent(moment(endDate).format('DD-MM-YYYY'),'Trv.End Date')
    });
  }

  handleKeyPress = (e) =>{
    e.preventDefault()
    if(e.key === 'Tab'){
      const { tabPress } = this.state;
      if(tabPress === 1){
        this.setState({ tabPress: 0, focusedInput: null});
        const nextInput = document.querySelector('[tabindex="country_free_quotes"]');
        nextInput.focus();
      }else{
        this.setState({ tabPress: 1 });
      }
    }
    else if(e.key === 'Enter'){
      const { tabPress } = this.state;
      if(tabPress === 1){
        this.setState({ tabPress: 0, focusedInput: null});
        const nextInput = document.querySelector('[tabindex="country_free_quotes"]');
        nextInput.focus();
      }else{
        this.setState({ tabPress: 1 });
      }
    }
  }

  handleFocusChange = (focusedInput, update = false) => {

    const { startDate } = this.state;
    const { closeOtherModel } = this.props;

    if(!this.update 
      && focusedInput === 'endDate'
      && (!startDate || !startDate._isValid)
      && focusedInput !== this.state.focusedInput
    ) {
      this.setState({ focusedInput: 'startDate'});
      return;
    } 


    this.setState(
      { focusedInput, tabPress: 0 }, 
      // () => closeOtherModel()
    )
  }

  render() {
    const { closeOtherModel, error } = this.props;

    return (
      <div className="tripDateModal" onKeyUp={this.handleKeyPress}>
        <p>{error}</p>
        <DateRangePicker
          startDate={this.state.startDate} // momentPropTypes.momentObj or null,
          startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
          endDate={this.state.endDate} // momentPropTypes.momentObj or null,
          endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
          onDatesChange={({ startDate, endDate }) => this.handleDateSelected(startDate, endDate)}
          focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
          onFocusChange={focusedInput => this.handleFocusChange(focusedInput)
          } // PropTypes.func.isRequired,
          anchorDirection="left"
          displayFormat="D MMM' YY"
          showDefaultInputIcon={false}
          isOutsideRange={this.handleOutsideRangeCheck}
          onClose={this.handleCloseCalendar}
          numberOfMonths={this.mobileScreen ? 1 : 2}

        />
      </div>
    );
  }
}

const mapDateStateToProps = state => {
    return {
      values: state.dateRange,
      flowNameGA: state.flowName,
    }
  }
  const mapDateDispatchToProps = dispatch => {
    return {
      onUpdateTripDate: (data) => dispatch(onUpdateTripDate(data)),
      onUpdateTripSummary: data => dispatch(onUpdateTripSummary(data))

    };
  };
  
export default connect(mapDateStateToProps, mapDateDispatchToProps)(TripDateModal);