import React, { Component } from "react";
import { default as countryData } from "../../../../lib/countryDataLatest.json";

// import "./styles/newCountryModal.css";
import { lang } from "../../../../cms/i18n/en/index";


import { connect } from "react-redux";
import { onUpdateDestination } from "../../../../store/actions/preQuoteActions";
import {
  destinationMapper,
  highlightedCountriesList,
  DESTINATION_LIMIT
} from "../../../../lib/helperData";

import _ from "lodash";

class CountryEditModal2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredCountryData: this.getFilteredCountryData(countryData, props.destinationsData),
      destinations: props.selectedDestinations ? props.selectedDestinations : [],
      destinationsData: props.destinationsData ? props.destinationsData : []
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { selectedDestinations, destinationsData } = props;
    if(selectedDestinations !== undefined && 
      destinationsData !== undefined &&
      !_.isEqual(selectedDestinations, state.destinations) &&
      !_.isEqual(destinationsData, state.destinationsData)
    ) {
      return {
        destinations: selectedDestinations,
        destinationsData
      }
    }
  }

  getFilteredCountryData = (countryData = [], destinationsData = []) => {
    let filteredCountry = countryData.filter(country => country.MostPopular === true);
    filteredCountry = filteredCountry.map((country) => {
      const index = destinationsData.findIndex(obj => obj.CountryName === country.CountryName);
      if(index !== -1) {
        return {
          selected: true,
          ...country
        }
      }
      return {
        ...country
      }
    });

    return filteredCountry;
  }

  handleCountryClick = (e, country) => {
    const { onUpdateDestination, afterUpdate } = this.props;
    
    let { filteredCountryData, destinationsData, destinations } = this.state;
    const index = filteredCountryData.findIndex(obj => obj.CountryName === country.CountryName);
    
    if (index !== -1) {
      let selectedData = filteredCountryData[index];      

      selectedData.selected = selectedData.selected !== undefined ? !selectedData.selected : true;
      
      if(selectedData.selected) {
        destinations.push(country.CountryName);
        destinationsData.push(selectedData);
      } else {
        destinations = destinations.filter((destination) => destination !== country.CountryName);
        destinationsData = destinationsData.filter((data) =>  data.CountryName !== selectedData.CountryName);
      }

      onUpdateDestination({
        formattedDestinations: destinations,
        destinations: destinationsData
      });

      afterUpdate();

      filteredCountryData[index] = selectedData;
      this.setState(
        {
          filteredCountryData
        },
        () => {
        }
      );
    }
  };

  isCountrySelected = country => {
    
    // if (country.selected) return true;
    

    const { destinationsData } = this.state;

    

    const index = destinationsData.findIndex(obj => obj.CountryName === country.CountryName);
    
    if (index === -1) return false;
    const data = destinationsData[index];
    

    if (!_.isEmpty(data)) return true;

    return false;
  };

  // handleKeyPress = (e, country, tabId) =>{
  //   e.preventDefault();
  //   let nextInput = '';
  //   if(e.key === 'Tab'){
  //     nextInput = document.querySelectorAll('[tabindex='+'"'+(tabId+1)+'"]');
  //     if (nextInput.length === 0) {
  //       nextInput = document.querySelectorAll('[tabindex="1"]');
  //     }
  //     nextInput[0].focus();
  //   }
  //   if(e.key === 'Enter'){
  //     this.handleOnSubmit();
  //   }  
  //   if(e.key === ' '|| e.key === 'Spacebar'){
  //     this.handleCountryClick(e,country);
  //   }   
  // }

  renderCountryList = () => {
    const { filteredCountryData } = this.state;
    // const filteredCountry = countryData.filter(country => country.MostPopular === true);

    return (
      <div className="MostPopularCountryList">
        <ul>
          {filteredCountryData.map((country,id) => (
            <li 
              class={this.isCountrySelected(country) 
                    ? "active" 
                    : null}
              >
              <div 
                className="countryChip" 
                // onKeyDown = {(e)=>this.handleKeyPress(e,country, (id+1))}  
                onClick={e => this.handleCountryClick(e, country)}
                // tabIndex={(id+1).toString()}
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

  // handleFlyingfromClickEvent = e => {
  //   if (e.target.value === "Outside India") {
  //     this.setState({ 
  //       alert: lang.invalidCountry
  //     });

  //     return;
  //   }

  //   this.setState({ alert: "" });
  // };

  validateDestinations = () => {
    const { destinations } = this.state;
    let { alert } = this.state;
    alert = !destinations.length
      ? lang.emptyDestination
      : alert
    // 

    this.setState({ alert });
    return alert === "" || alert === undefined;
  };

  handleOnSubmit = e => {
    const { alert } = this.state;
    const { closeModel } = this.props;
  
    // 
    const valid = this.validateDestinations();
    !alert && valid && closeModel();

    // if(!formattedDestinations.length) {
    //     this.setState({
    //         alert: "Please select atleast one destination"
    //     })
    // } else {
    // }
  };


  render() {
    const { alert } = this.state;
    return (
      <div className="CountryModal">
        {/* <div class="error">{alert}</div> */}
        <h6>{lang.mostPopularCountryTitle}</h6>
        {this.renderCountryList()}

        <div class="clearfix"></div>
        {/* <div className="country_bottom_text">
          <i>{lang.flyingFrom}</i>
          <a>
            <select onChange={e => this.handleFlyingfromClickEvent(e)}>
              <option value="India">{lang.withinIndia}</option>
              <option value="Outside India">{lang.outsideIndia}</option>
            </select>
          </a>
        </div> */}
        <div className="country_error_msg">
          {alert}
        </div>
        <button className="next" onClick={this.handleOnSubmit}>
          Apply
        </button>
       
      </div>
     
    );
  }
}

const mapCountryStateToProps = state => {
  return {
    selectedDestinations: state.destinations,
    destinationsData: state.destinationsData
  };
};
const mapCountryDispatchToProps = dispatch => {
  return {
    onUpdateDestination: data => dispatch(onUpdateDestination(data))
  };
};

export default connect(mapCountryStateToProps, mapCountryDispatchToProps)(CountryEditModal2);

// export default CountryModal;

