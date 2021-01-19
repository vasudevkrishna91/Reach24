import React, { Component } from "react";

import { connect } from "react-redux";
import * as _ from "lodash";
import { Chip } from "@material-ui/core";

import { lang } from "../../../cms/i18n/en/index";
import { default as countryData } from "../../../lib/countryDataLatest.json";
import {
  highlightedCountriesList,
  DESTINATION_LIMIT
} from "../../../lib/helperData";

import { onUpdateDestination } from "../../../store/actions/preQuoteActions";

import {
  filterZoneWiseData,
  duplicateValue,
  removeSelectedDestinationData
} from "../../../utils/helper";

import { OkButton } from "../../components/Button/index";


import "./styles/countryModal.css";

class CountryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDestinations: [],
      formattedDestinations: props.selectedDestinations,
      destinations: []
    };
  }

  selectZone = (e, item) => {
    const { formattedDestinations, destinations } = this.state;
    const { onUpdateDestination, showZoneGridDisplay } = this.props;
    let filterZoneData = [];
    let showZoneGrid = false;
    let showZoneError = false;
    let zoneError;

    filterZoneData = filterZoneWiseData(countryData, item.zone);
    filterZoneData = removeSelectedDestinationData(filterZoneData, formattedDestinations);

    if (item.countryName === "Within India") {
      showZoneError = true;
      zoneError = lang.zoneError;
    } else if (!item.type && filterZoneData.length < 6) {
      filterZoneData.forEach(dest => {
        !duplicateValue(dest, formattedDestinations) &&
          formattedDestinations.push(dest.CountryName);
        destinations.push(dest);
      });
    } else {
      showZoneGridDisplay(true);
      showZoneGrid = true;
    }

    this.setState(
      {
        showZoneGrid,
        selectedZonedata: filterZoneData,
        formattedDestinations,
        destinations,
        zoneError,
        showZoneError
      },
      () => {
        onUpdateDestination({ formattedDestinations, destinations });
        this.validateDestinations();
      } 
    );
  };

  // zoneHighlightCheck = zone => {
  //   const { destinations } = this.state;
  //   if (
  //     destinations.findIndex(dest =>
  //       zone.toLowerCase().includes(dest.Zone2.toLowerCase().slice(0, 3))
  //     ) !== -1
  //   ) {
  //     return true;
  //   }
  //   return false;
  // };

  zoneHighlightCheck = (zone) =>{
    const { destinations } = this.state;
        let index = destinations.findIndex(dest=> dest.Zone.toLowerCase() === zone.toLowerCase());
        if( index !== -1){
            return true;
        }
    return false;
}

  renderHighlightedCountries = () => {
    return (
      <ul className="country_icons" id = "input-outside-click">
          {highlightedCountriesList.map((item,id) => (
              <li className={this.zoneHighlightCheck(item.zone)?"active":''} key={id}>
                  <div onClick={(e) => this.selectZone(e,item)} >
                      <span className={item.classIcon}/>
                      <p>{item.countryName}</p>
                  </div>
              </li>
          ))}
      </ul>
    )
    // return (
    //   <ul className="country_icons">
    //     {highlightedCountriesList.map((item, id) => (
    //       <li>
    //         <div onClick={e => this.selectZone(e, item)}>
    //           <span class={item.classIcon} />
    //           <p>{item.countryName}</p>
    //         </div>
    //       </li>
    //     ))}
    //   </ul>
    // );
  };

  handleDestinations = e => {
    const { selectedDestinations } = this.state;

    this.setState({ selectedDestinations: selectedDestinations.push(e.target.value) });
  };

  validateDestinations = () => {
    const { formattedDestinations } = this.state;
    let alert = '';

    alert = !formattedDestinations.length ? lang.emptyDestination 
            : (formattedDestinations.length > DESTINATION_LIMIT) ? lang.maxDestination
            : alert;

    this.setState({ alert });
    return alert === '';
  }

  handleOnSubmit = e => {
    const { formattedDestinations } = this.state;
    const valid = this.validateDestinations()
    valid &&  this.props.closeModel();

    // if(!formattedDestinations.length) {
    //     this.setState({
    //         alert: "Please select atleast one destination"
    //     })
    // } else {
    // }
  };

  addDestination = (e, data, id) => {
    e.preventDefault();
    const {
      selectedZonedata,
      selectedDestinations,
      formattedDestinations,
      destinations
    } = this.state;
    const { onUpdateDestination } = this.props;
    if (!_.isEmpty(formattedDestinations) && formattedDestinations.length === DESTINATION_LIMIT) {
      this.setState({ alert: "You cannot select more than 9 destinations" });
    } else {
      const updatedSelectedZoneData = selectedZonedata.filter(
        obj => obj.CountryID !== data.CountryID
      );
      if (formattedDestinations.indexOf(data.CountryName) == -1) {
        selectedDestinations.push(data);
        destinations.push(data);
        formattedDestinations.push(data.CountryName);
      }
      this.setState(
        {
          selectedZonedata: updatedSelectedZoneData,
          selectedDestinations,
          formattedDestinations
        },
        () => {
            this.validateDestinations()
            onUpdateDestination({ formattedDestinations, destinations })
        } 
      );
    }
  };

  zoneDataSort = (a, b) => {
    if (a.CountryName < b.CountryName) {
      return -1;
    }
    return 0;
  };

  handleBackButton = () => {
    this.setState({
      showZoneError: false,
      zoneError: "",
      showZoneGrid: false
    });
  };

  showInvalidZoneError = () => {
    const { zoneError } = this.state;

    return (
      <div>
        <span className="back_button withInIndia" onClick={this.handleBackButton}>
          <i
            style={{
              color: "#0065FF",
              fontStyle: "normal",
              cursor: "pointer"
            }}
          >
            {lang.backText}
          </i>
        </span>
        <h5>{zoneError}</h5>
      </div>
    );
  };

  showSelectedGrid = () => {
    let { selectedZonedata } = this.state;
    selectedZonedata.sort(this.zoneDataSort);
    return (
      <React.Fragment>
        {/* <b>{lang.popularCountries}</b>  */}
        <span className="back_button" onClick={this.handleBackButton}>
          <i
            style={{
              color: "#0065FF",
              fontStyle: "normal",
              cursor: "pointer"
            }}
          >
            {lang.backText}
          </i>
        </span>
        <div className="country_list_scrol">
          <ul className="CountryListing">
            {selectedZonedata.map((zone, id) => {
              return (
                <li
                  className={`Anchor-${id}`}
                  onClick={(e, id) => this.addDestination(e, zone, id)}
                  key={id}
                >
                  {zone.CountryName}
                </li>
              );
            })}
          </ul>
          <div className="cl"></div>
        </div>
      </React.Fragment>
    );
  };

  removeDestination = (e, item) => {
    let { formattedDestinations, destinations, selectedZonedata } = this.state;
    const { onUpdateDestination } = this.props;
    formattedDestinations = formattedDestinations.filter(dest => dest !== item);

    let removeDestination;
    let filteredDestinations = [];
    destinations.forEach(dest => {
      if (dest.CountryName !== item) filteredDestinations.push(dest);
      else {
        removeDestination = dest;
      }
    });
    if (selectedZonedata) {
      selectedZonedata.push(removeDestination);
    }
    let data = {
      formattedDestinations,
      destinations: filteredDestinations
    };

    this.setState(
      {
        formattedDestinations,
        selectedZonedata,
        destinations: filteredDestinations,
      }, 
      () => {
        this.validateDestinations();
        onUpdateDestination(data)
    }
    );
  };

  renderDestinations = () => {
    const { formattedDestinations } = this.state;
    return (
      <div className="Destinations">
        {formattedDestinations.map(item => {
          return <Chip label={item} onDelete={e => this.removeDestination(e, item)} />;
        })}
      </div>
    );
  };



  componentDidUpdate(prevProp, prevState) {

    const { showZoneGrid: oldShowZoneGrid } = prevState;
    const { hideShowZoneGrid } = this.props;
    const { showZoneGrid } = this.state;

    if (showZoneGrid && hideShowZoneGrid) {
      this.setState({ showZoneGrid: false }, () => this.validateDestinations());
    }
  }

  handleFlyingfromClickEvent = e => {
    if (e.target.value === "Outside India") {
      this.setState({ showZoneError: true, zoneError: lang.zoneError });
    }
  };

  render() {
    const {
      selectedDestinations,
      showZoneGrid,
      selectedZonedata,
      alert,
      showZoneError
    } = this.state;
    //
    return (
      <div class="country_wpapper" id="showdesitionation">
        <div class="tooltiparrow"></div>
        {showZoneError ? (
          this.showInvalidZoneError()
        ) : (
          <React.Fragment>
            {this.renderDestinations()}
            {alert ? <p style={{ color: "red", fontSize: "12px", maxWidth:"100%", float:'left', width:'100%', textAlign:'center' }}>{alert}</p> : ""}
            <b>{lang.popularCountries}</b>
            {showZoneGrid && this.showSelectedGrid()}
            
            {!showZoneGrid && this.renderHighlightedCountries()}
            <div class="clearfix"></div>
            <div className="country_bottom_text">
              <i>{lang.flyingFrom}:</i>
              <a>
                <select onChange={e => this.handleFlyingfromClickEvent(e)}>
                  <option value="India">{lang.withinIndia}</option>
                  <option value="Outside India">{lang.outsideIndia}</option>
                </select>
              </a>
            </div>
            {/* <div class="country_bottom_text">
                  <i>FLYING FROM</i>
                  <select>
                    <option>India</option>
                  </select>
                </div> */}
            <OkButton 
                handleOnSubmit={this.handleOnSubmit}
                disabled={alert ? true : false} 
            />
          </React.Fragment>
        )}
      </div>
    );
  }
}

const mapCountryStateToProps = state => {
  return {
    selectedDestinations: state.destinations
  };
};
const mapCountryDispatchToProps = dispatch => {
  return {
    onUpdateDestination: data => dispatch(onUpdateDestination(data))
  };
};

export default connect(mapCountryStateToProps, mapCountryDispatchToProps)(CountryModal);
