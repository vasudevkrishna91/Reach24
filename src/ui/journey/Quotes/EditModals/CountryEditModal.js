import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as _ from 'lodash';
import Autocomplete from "react-autocomplete";
import { Chip } from "@material-ui/core";
import  './styles/editCountryModal.css';
import { default as countryData } from "../../../../lib/countryDataLatest.json";
import { onUpdateDestination } from "../../../../store/actions/preQuoteActions";
import CountryModal from '../../Pre-Quote/NewCountryModal';
import {lang} from '../../../../cms/i18n/en/index';

import Moment from "moment";

import { extendMoment } from "moment-range";
const moment = extendMoment(Moment);

class CountryEditModal extends Component{

    constructor(props) {
      super(props);
      this.state = {
        originalFormattedDestinations: props.selectedDestinations,
        originalDestinationData: props.destinationsData,
        formattedDestinations: props.selectedDestinations,
        autoSearchData: countryData,
        countrySearchValue: '',
        destinations: [],
        tempDestination: props.destinationsData,
      }
      this.destinationChip = React.createRef();
      this.inputField = React.createRef();
    }


  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    var elem = document.getElementsByClassName('editCountryModal');
    var errorElem = document.getElementsByClassName('traveler_error');
    if(elem[0]) {
      // if(errorElem.length) {
      //   elem[0].scrollTop = errorElem[0].offsetTop;

      // }
      // else {
        elem[0].scrollTop = elem[0].scrollHeight;
      // }
    }
  }

    static getDerivedStateFromProps(props, state) {
      if (props.selectedDestinations && state.formattedDestinations !== props.selectedDestinations) {
        return {
          formattedDestinations: props.selectedDestinations,
          tempDestination: props.destinationsData,
        };
      }
  
      return null;
    }
    
    removeDestination = (e, item) => {
      let { 
        formattedDestinations,
        destinations,
        autoSearchData,
        tempDestination
      } = this.state;
  
      const { 
        onUpdateDestination,
        destinationsData
      } = this.props;
      let destination = [];
  
      let updatedDestinationsData = _.cloneDeep(destinationsData);
  
      // 
      formattedDestinations = formattedDestinations.filter(dest => dest !== item);
  
      for (let i = 0; i < updatedDestinationsData.length; i++) {
        if (updatedDestinationsData[i].CountryName !== item) {
          destination.push(updatedDestinationsData[i]);
        } else {
          let index = updatedDestinationsData.findIndex(dest => dest.CountryName ===  item);
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
 
    handleAutoCompleteSelect = (val, item) => {
      let { 
        formattedDestinations,
        autoSearchData,
        destinations,
        tempDestination
      } = this.state;
  
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

    getChipsFocused = (formattedDestinations, destinations) => {

      this.setState({
        formattedDestinations: formattedDestinations,
        tempDestination: destinations
      })
      // this.destinationChip.current && this.destinationChip.current.focus();
    }

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
  

    onCountryChange = e => {

      const newValue = e.target.value.replace(/[^a-zA-Z]+/, '');
      this.inputField.current && this.inputField.current.focus();
      this.setState({
        countrySearchValue: newValue,
        autoSearchValue: newValue,
        showCountrySearchModal: newValue ? true : false
      });
    };
  
    renderChips = () => {
      const { formattedDestinations } = this.state;

      if(!formattedDestinations.length) return;

      return (
          <div
            ref={this.destinationChip}
            // className="chipsMobileDisplay"
          >
            {formattedDestinations.map(item => {
              return (
                <Chip
                  label={item}
                  onDelete={e => this.removeDestination(e, item)}
                />
              );
            })}
          </div>
      )
    }

    closeModal = () => {
      const { handleEditModalChange, onUpdateDestination } = this.props;
      const { originalFormattedDestinations, originalDestinationData } = this.props;
      onUpdateDestination({ 
        formattedDestinations: originalFormattedDestinations,
        destinations: originalDestinationData
      })
      handleEditModalChange('close');
    }
  
    handleCountrySubmit = async() => {
      const { 
        handleEditModalChange,
        selectedDestinations,
        destinationsData,
        saveUpdatedData,
        travellerData,
        values
      } = this.props;

      const memberData = travellerData.map(traveller =>{
        const obj = {
          ...traveller,
          IsPED: traveller.ped
        }
        return obj;
      })
  
      
      const data = {
        data: {
          tripCountries: [...destinationsData],
          members: [...memberData],
          tripStartDate: moment(values[0]).format('YYYY-MM-DD'),
          tripEndDate: moment(values[1]).format('YYYY-MM-DD'),
        },
        actionTypeID: "4"
      };


      const res = await saveUpdatedData(data);
      handleEditModalChange();
    }

    handleKeyPress = (e) =>{
      if(e.key === 'Tab'){
        e.preventDefault()
        const nextInput = document.querySelectorAll('[tabindex="1"]');
        nextInput[0].focus()
      }
    }


    render() {
      const { handleEditModalChange } = this.props;
      const { countrySearchValue, tempDestination } = this.state;
      
      return (
        <div className="overlay">
          <div className="editCountryModal">
            <span onClick={this.closeModal} className="close" />
            
            {!countrySearchValue && (
              <input
                autoFocus={true}
                onKeyDown={this.handleKeyPress}
                value={countrySearchValue}
                className={"autocomplet_input"}
                onChange={this.onCountryChange}
                onClick={this.onCountryChange}
                placeholder={lang.quotesSearchCountry}
                maxLength="30"
                ref={this.inputField}
              />
            )}
            {this.renderChips()}
            {countrySearchValue && (
              <Autocomplete
                getItemValue={item => item.CountryName}
                items={this.renderAutoSearchData()}
                renderItem={(item, isHighlighted) => (
                <div className="">
                  <div
                    className="country_listing edit_country_text"
                    style={{ background: isHighlighted ? "#F4F5F7" : "white" }}
                  >
                    {item.CountryName}
                  </div>
                </div>
                )}
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
                    <input
                      {...props}
                      autoFocus={true}
                      value={countrySearchValue}
                      className={"autocomplet_input"}
                      onChange={this.onCountryChange}
                      maxLength="30"
                      //  ref={this.AutoCompleteRef}
                    />
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
              />
            )}
            {!countrySearchValue && (
              <CountryModal
                closeModel={this.handleCountrySubmit}
                destination={tempDestination}
                hideShowZoneGrid={true}
                showZoneGridDisplay={() => null}
                afterUpdate={this.getChipsFocused}
                editPage={true}
                eventCategory = 'Trv.BU Quotes'
              />
            )}
          </div>
        </div>
      );
    }
}

CountryEditModal.propTypes = {
    selectedDestinations: PropTypes.instanceOf(Array).isRequired,
    destinationsData: PropTypes.instanceOf(Array).isRequired,
    onUpdateDestination: PropTypes.func.isRequired,
    handleEditModalChange: PropTypes.func.isRequired
}

const mapStateToProps = (state) =>({
    selectedDestinations: state.destinations,
    destinationsData: state.destinationsData,
    travellerData: state.travellerData,
    values: state.dateRange,
})

const mapHomeDispatchToProps = dispatch => {
    return {
      onUpdateDestination: data => dispatch(onUpdateDestination(data)),
    };
  };

export default connect(mapStateToProps,mapHomeDispatchToProps)(CountryEditModal);

