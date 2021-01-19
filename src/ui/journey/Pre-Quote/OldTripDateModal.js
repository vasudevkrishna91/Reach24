import React, {Component} from 'react';

import { extendMoment } from 'moment-range';
import { connect } from 'react-redux';
import _ from 'lodash'
import { onUpdateTripDate } from '../../../store/actions/preQuoteActions';


// import "react-daterange-picker/dist/css/react-calendar.css";
// import 'bootstrap-daterangepicker/daterangepicker.css'

import DateRangePicker from 'react-bootstrap-daterangepicker';
// import DateRangePicker from '@wojtekmaj/react-daterange-picker';

// you will need the css that comes with bootstrap@3. if you are using
// a tool like webpack, you can do the following:
//import 'bootstrap/dist/css/bootstrap.css';
// you will also need the css that comes with bootstrap-daterangepicker
import 'bootstrap-daterangepicker/daterangepicker.css';
import './styles/tripDateModal.css';
import Moment from 'moment';

const moment = extendMoment(Moment);

const stateDefinitions = {
  available: {
    color: null,
    label: 'Available',
  },
  enquire: {
    color: '#ffd200',
    label: 'Enquire',
  },
  unavailable: {
    selectable: false,
    color: '#78818b',
    label: 'Unavailable',
  },
};

const dateRanges = [
  {
    state: 'enquire',
    range: moment.range(
      moment().add(2, 'weeks').subtract(5, 'days'),
      moment().add(2, 'weeks').add(6, 'days')
    ),
  },
  {
    state: 'unavailable',
    range: moment.range(
      moment().add(3, 'weeks'),
      moment().add(3, 'weeks').add(5, 'days')
    ),
  },
];

class TripDateModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            date: props.values,
        }
    }

    static getDerivedStateFromProps(props, state) {
        if(!_.isEqual(props.values, state.date)) {
            return {
                date: props.values,
            }
        }
        return null;
    }

    handleSelect = (e, values) => {
        // range is a moment-range object
        const { startDate, endDate } = values;
        const date = [startDate, endDate]
        this.setState({
          date,
        //   states: values,
        },() => {
          this.props.onUpdateTripDate(date);
          this.props.showMobileFieldFunc();
        });
    }

    handleDateEvent = (first, second) => {
    }
    
            /* <DateRangePicker
            firstOfWeek={1}
            numberOfCalendars={2}
            selectionType='range'
            minimumDate={new Date()}
            stateDefinitions={stateDefinitions}
            dateStates={dateRanges}
            defaultState="available"
            showLegend={true}
            value={this.state.value}
            onSelect={this.handleSelect} /> */
    render() {
        const { children } = this.props;


        return (
          <div className='tripDate'>
            <DateRangePicker
                startDate={this.state.date[0]}
                endDate={this.state.date[1]}
                onApply={this.handleSelect}
                minDate={moment(new Date())}
                onEvent={this.handleDateEvent}
                dateLimit={{days: 180}}
                alwaysShowCalendars={true}
            >
              {children}
            </DateRangePicker>
          </div>
        );
    }
}

const mapDateStateToProps = state => {
    return {
      values: state.dateRange,
    }
  }
  const mapDateDispatchToProps = dispatch => {
    return {
      onUpdateTripDate: (data) => dispatch(onUpdateTripDate(data))
    };
  };
  
export default connect(mapDateStateToProps, mapDateDispatchToProps)(TripDateModal);