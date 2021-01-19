import React, { Component } from "react";
import PropTypes from 'prop-types';

import { connect } from "react-redux";
import * as _ from 'lodash';
import './styles/editTravellerModal.css';

import TravellersModal from '../../Pre-Quote/TravellersModal';

import {
  onUpdateMemberCount,
  onUpdateMemberData,
  defineFamilyAction
} from "../../../../store/actions/preQuoteActions";
import { lang } from '../../../../cms/i18n/en/index';
import Moment from "moment";

import { extendMoment } from "moment-range";
const moment = extendMoment(Moment);


class TravellerEditModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      travellerData: props.travellerData
    };
  }

  componentDidMount(){
    const nextInput = document.querySelectorAll('[tabindex="traveller_0"]')
    if(nextInput[0]){
      nextInput[0].focus()
    }
  }
  
  closeModel = () => {
    const { 
      handleEditModalChange,
      onUpdateMemberData
    } = this.props;
    const { travellerData } = this.state;
    onUpdateMemberData(travellerData);
    handleEditModalChange('close')
  }

  handleSubmit = async() => {
    const { 
      travellerData,
      saveUpdatedData,
      handleEditModalChange,
      prevTravellerData,
      defineFamilyAction,
      destinationsData,
      values,
    } = this.props;

    const memberData = travellerData.map(traveller =>{
      const obj = {
        ...traveller,
        IsPED: traveller.ped
      }

      if (traveller.age > 15 && traveller.age < 51) {
        obj.visaTypeID = traveller.visaTypeID
      } else {
        obj.visaTypeID = 1
      }
      return obj;
    })

    const data = {
      data: {
        members: [...memberData],
        tripCountries: [...destinationsData],
        tripStartDate: moment(values[0]).format('YYYY-MM-DD'),
        tripEndDate: moment(values[1]).format('YYYY-MM-DD'),
      },
      actionTypeID: "3"
    };

    if(!_.isEqual(prevTravellerData, travellerData)){
      // const families ={
      //   family1: []
      // }
      // defineFamilyAction(families)
      sessionStorage.setItem("askDob", true);
      const res = await saveUpdatedData(data);
    }
    handleEditModalChange();
  }

  render() {

    const { 
      counter,
      changeCounter
    } = this.props
    
    return (
      <div className="overlay">
        <div className="EditTravellerModal">
          <div className="insurer_popup_heading">
          {lang.quotesEditTraveller}
            <span onClick={this.closeModel} className="close" />
          </div>
          <TravellersModal 
            primaryActionText={lang.quotesApply}
            closeModel={this.handleSubmit}
            counter={counter}
            changeCounter={changeCounter}
            gaEventCategory={"Trv.BU Quotes"}
          />
        </div>
      </div>
    )
  }
}

TravellerEditModal.propTypes={
  travellerData: PropTypes.instanceOf(Array).isRequired,
  handleEditModalChange: PropTypes.func.isRequired,
  onUpdateMemberData: PropTypes.func.isRequired,
  saveUpdatedData: PropTypes.func.isRequired,
  counter: PropTypes.number.isRequired,
  changeCounter: PropTypes.func.isRequired
}


const mapHomeStateToProps = state => {
  return {
    travellerData: state.travellerData,
    destinationsData: state.destinationsData,
    values: state.dateRange,
  };
};

const mapHomeDispatchToProps = dispatch => {
  return {
    onUpdateMemberCount: data => dispatch(onUpdateMemberCount(data)),
    onUpdateMemberData: data => dispatch(onUpdateMemberData(data)),
    defineFamilyAction: data => dispatch(defineFamilyAction(data))
  };
};

export default connect(
  mapHomeStateToProps,
  mapHomeDispatchToProps
)(TravellerEditModal);
