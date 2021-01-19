import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import {
  filtersType,
  CoveragesFilter,
  SpecialFilter,
  VisaTypeFilter,
  TravellingPurposeFilter,
  SumInsuredFilter,
  PlanTypesFilter,
} from './helperData';
import { InsurerFilter } from '../../../../lib/helperData'
import { customEvent } from "../../../../GA/gaEvents";
import { lang } from '../../../../cms/i18n/en/index';

import "./styles/moreFilter.css";

import AMTPlan from '../AMTPlan';
import { QuoteFilters } from "./helperData";

class MoreFilterModal extends Component {
  constructor(props) {
    super(props);
    const { filters } = props;
    this.state = {
      currentFilter: 0,
      currentField: "Coverages",
      removeStudent: false,
      showLoader: false,
      newFiltersType: this.getFilterType(props.travellerData),
      coveragesFilter: this.mapDataToprops(CoveragesFilter),
      sumInsuredFilter: this.mapDataToprops(SumInsuredFilter),
      specialFilter: this.mapDataToprops(SpecialFilter),
      visaTypeFilter: this.mapDataToprops(VisaTypeFilter),
      planTypeFilter: this.mapDataToprops(PlanTypesFilter),
      travellingPurposeFilter: this.mapDataToprops(TravellingPurposeFilter),
      
    };
  }

  getFilterType = (travellerData) => {
    let result = filtersType;

    var isMobile = window.screen.width < 800

    if (isMobile) {
      result.push("Insurers")
    }
    if (travellerData.length === 1) {
      result = result.filter((type) => type !== "Sum Insured Coverage")
    }
    return result;
  }

  gaCustomEvent = (data) => {
    const gaData = {
      eventCategory: 'Trv.Filters',
      eventAction: data.Action,
      eventLabel: data.Label,
      eventValue: '',
      flowName: this.props.flowNameGA
    }
    customEvent(gaData);
  }

  getChipsData = (dataArr) => {
    const moreFilterList = [];
    for (var key in dataArr) {
      (dataArr[key]).map((k) => {
        moreFilterList.push(k.name);
      })
    }
    return _.join(moreFilterList);
  }

  clearAllFilters = () => {

    const {
      travellingPurposeFilter,
      coveragesFilter,
      specialFilter,
      visaTypeFilter,
      sumInsuredFilter,
    } = this.state;
    travellingPurposeFilter.forEach(x=>x.selected===false);
    coveragesFilter.forEach(x=>x.selected===false);
    specialFilter.forEach(x=>x.selected===false);
    visaTypeFilter.forEach(x=>x.selected===false);
    sumInsuredFilter.forEach(x=>x.selected===false);

    this.setState({
      travellingPurposeFilter,
      coveragesFilter,
      specialFilter,
      visaTypeFilter,
      sumInsuredFilter
    })

    const { onClose, onApply, quotes, selectedProfileTypeID } = this.props;
    let moreFilterQuotes = [...quotes];
    const quoteIndex = moreFilterQuotes.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (quoteIndex !== -1) {
      let otherFilters = moreFilterQuotes[quoteIndex].profileFilter.filter(x => x.parentID !== 1001 && x.parentID !== 1002
        && x.parentID !== 1003 && x.parentID !== 1004 && x.parentID !== 1005)
      let newFilters = [...otherFilters]
      moreFilterQuotes[quoteIndex].profileFilter = newFilters;
    }
    onApply(moreFilterQuotes, 'MoreFilter')
    onClose();

  }

  mapDataToprops = (mainData) => {
    const {
      quotes,
      selectedProfileTypeID
    } = this.props;
    let parentID = mainData[0].parentID;
    let moreFilterQuotes = [...quotes];
    let otherFilters = [];
    const quoteIndex = moreFilterQuotes.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (quoteIndex !== -1) {
      otherFilters = moreFilterQuotes[quoteIndex].profileFilter.filter(x => x.parentID === parentID)

    }


    const updatedFilter = mainData.map((filter) => {
      if (otherFilters.findIndex(x => x.actualID === filter.actualID) !== -1) {
        return {
          ...filter,
          selected: true
        }
      }
      else {
        return {
          ...filter,
          selected: false
        }
      }


    });

    return updatedFilter;
  }

  handleSelection = (id, filter) => {
    this.setState({
      currentFilter: id,
      currentField: filter
    });
  }

  showCoverageFilter = () => {
    const { coveragesFilter: oldCoverages } = this.state;

    const { travellerData } = this.props;
    let newCoverageFilters = oldCoverages;

    let hideMedicalCoverage = true;

    travellerData.forEach(element => {
      if (!hideMedicalCoverage) return;
      if (element.age > 50)
        hideMedicalCoverage = false;
    });

    if (hideMedicalCoverage) {
      newCoverageFilters = oldCoverages.filter((obj) => obj.id !== 9);
    }
  

    return newCoverageFilters.map((item, id) => {
      const {
        parentID, filterID, filter, actualID
      } = item;
      return (
        <div 
        className='coverage-item'>
          <input
            className="magic-checkbox"
            type="checkbox"
            onClick={(e) => this.handleFilterSelection(e)}
            value={item.selected}
            id={id}
            
            key={`coverage-filter${id}`} // eslint-disable-line
            checked={item.selected}
          />
          <label htmlFor={id} />
          <label className="text" htmlFor={id}>
            {item.name}
          </label>

        </div>
      )
    });
  }



  showVisaFilter = () => {
    const { visaTypeFilter } = this.state;
debugger;
    return visaTypeFilter.map((item, id) => {
      const {
        parentID, filterID, filter, actualID
      } = item;
      return (<div 
      className={`coverage-item ${item.id===16?'hide':''}`}>
        <input
          className="magic-checkbox"
          type="checkbox"
          onClick={(e) => this.handleFilterSelection(e)}
          value={item.selected}
          id={id}
          key={`visa-filter${id}`} // eslint-disable-line
          checked={item.selected}
        />
        <label htmlFor={id} />
        <label className="text" htmlFor={id}>
          {item.name}
        </label>
      </div>
      )
    });
  }

  showPurposeFilter = () => {
    const { travellingPurposeFilter } = this.state;

    return travellingPurposeFilter.map((item, id) => {
      const {
        parentID, filterID, filter, actualID
      } = item;
      return (<div className='coverage-item'>
        <input
          className="magic-checkbox"
          type="checkbox"
          onClick={(e) => this.handleFilterSelection(e)}
          value={item.selected}
          id={id}
          key={`travelling-filter${id}`} // eslint-disable-line
          checked={item.selected}
        />
        <label htmlFor={id} />
        <label className="text" htmlFor={id}>
          {item.name}
        </label>
      </div>
      )
    });
  }

  showSumInsuredFilter = () => {
    const { sumInsuredFilter } = this.state;

    return sumInsuredFilter.map((item, id) => {
      const {
        parentID, filterID, filter, actualID
      } = item;
      return (<div className='coverage-item'>
        <input
          className="magic-checkbox"
          type="checkbox"
          onClick={(e) => this.handleFilterSelection(e)}
          value={item.selected}
          id={id}
          key={`travelling-filter${id}`} // eslint-disable-line
          checked={item.selected}
        />
        <label htmlFor={id} />
        <label className="text" htmlFor={id}>
          {item.name}
        </label>
      </div>
      )
    });
  }




  showInsurers = () => {
    return InsurerFilter.map((item, id) => {
      const {
        parentID, filterID, filter, actualID
      } = item;
      return (<div className='coverage-item'>
        <input
          className="magic-checkbox"
          type="checkbox"
          onClick={(e) => this.handleFilterSelection(e)}
          value={item.selected}
          id={id}
          key={`travelling-filter${id}`} // eslint-disable-line
          checked={item.selected}
        />
        <label htmlFor={id} />
        <label className="text" htmlFor={id}>
          {item.name}
        </label>
      </div>
      )
    });
  }


  componentSwitcher = (id) => {
    const { currentField } = this.state;

    switch (currentField) {
      case "Coverages":
        return this.showCoverageFilter()
      case "Sum Insured Coverage":
        return this.showSumInsuredFilter()

      case "Visa Type":
        return this.showVisaFilter()
      case "Purpose Of Travel":
        return this.showPurposeFilter();

      case "Insurers":
        return this.showInsurers();
      default: return <h1> {lang.quotesNoComponent}</h1>
    }
  }

  handleFilterSelection = (e) => {
    const {
      currentFilter,
      currentField,
      coveragesFilter,
      specialFilter,
      travellingPurposeFilter,
      visaTypeFilter,
      sumInsuredFilter,
      planTypeFilter

    } = this.state;
    const { value, id } = e.target;
    const { checkStudentVisaModal } = this.props;

    let removeStudent = false;
    let studenVisa = false;

    switch (currentField) {
      case 'Coverages': {
        coveragesFilter[id].selected = value === "false";

        break;
      }

      case 'Sum Insured Coverage': {
        sumInsuredFilter[id].selected = value === "false";
        break;
      }
      case 'Special Features': {
        specialFilter[id].selected = value === "false";;
        break;
      }
      case 'Visa Type': {
        if (visaTypeFilter[id].name === 'Student Visa' && visaTypeFilter[id].selected) {
          removeStudent = true;
        }
        visaTypeFilter[id].selected = value === "false";;
        !removeStudent
          && visaTypeFilter[id].name === 'Student Visa'
          && visaTypeFilter[id].selected
          && checkStudentVisaModal(true);
        break;
      }
      case 'Purpose Of Travel': {
        travellingPurposeFilter[id].selected = value === "false";;
        break;
      }

      default: break;
    }

    this.setState({
      travellingPurposeFilter,
      coveragesFilter,
      specialFilter,
      visaTypeFilter,
      sumInsuredFilter,
      planTypeFilter,
      removeStudent,
    });
  }

  // handleApplyButton = () => {
  //   const {
  //     travellingPurposeFilter,
  //     coveragesFilter,
  //     specialFilter,
  //     visaTypeFilter,
  //     sumInsuredFilter,
  //     removeStudent,
  //     planTypeFilter,
  //     maxTripDuration,
  //     moreFilterSelection
  //   } = this.state;

  //   const { onClose, hanldeMaxTripDuration } = this.props;
  //   const data = {
  //     coverages: coveragesFilter.filter(obj => obj.selected === true),
  //     sumInsuredFilter: sumInsuredFilter.filter(obj => obj.selected === true),
  //     special: specialFilter.filter(obj => obj.selected === true),
  //     visaType: visaTypeFilter.filter(obj => obj.selected === true),
  //     travellingPurpose: travellingPurposeFilter.filter(obj => obj.selected === true),
  //     planTypes: planTypeFilter.filter(obj => obj.selected === true)
  //   };

  //   const tripType = planTypeFilter.filter(obj => obj.selected === true);
  //   const multiTrip = tripType && tripType[0] && tripType[0].name === 'Annual Multi-Trip Plans'

  //   // if(multiTrip && maxTripDuration) {
  //   //   hanldeMaxTripDuration(multiTrip, maxTripDuration)
  //   // }

  //   this.setState({ showLoader: true })

  //   this.gaCustomEvent({ Action: 'Trv.Selection', Label: this.getChipsData(data) });

  //   onClose(true, data, removeStudent, maxTripDuration);
  // }


  handleApplyButton = () => {

    const {
      travellingPurposeFilter,
      coveragesFilter,
      specialFilter,
      visaTypeFilter,
      sumInsuredFilter,
    } = this.state;
    
    

    const { onClose, onApply, quotes, selectedProfileTypeID } = this.props;

   let moreFilterSelection = [];
    const cf = coveragesFilter.filter(obj => obj.selected === true);
    if (cf && cf.length > 0) {
      cf.forEach(x => {
        const {
          parentID, filterID, filter, actualID
        } = x;
        moreFilterSelection.push({ parentID, filterID, filter, actualID, profileTypeID: selectedProfileTypeID })
      })
    }

    const sif = sumInsuredFilter.filter(obj => obj.selected === true);
    if (sif && sif.length > 0) {
      sif.forEach(x => {
        const {
          parentID, filterID, filter, actualID
        } = x;
        moreFilterSelection.push({ parentID, filterID, filter, actualID, profileTypeID: selectedProfileTypeID })
      })
    }

    const sf = specialFilter.filter(obj => obj.selected === true)
    if (sf && sf.length > 0) {
      sf.forEach(x => {
        const {
          parentID, filterID, filter, actualID
        } = x;
        moreFilterSelection.push({ parentID, filterID, filter, actualID, profileTypeID: selectedProfileTypeID })
      })
    }

    const vtf = visaTypeFilter.filter(obj => obj.selected === true)
    if (vtf && vtf.length > 0) {
      vtf.forEach(x => {
        const {
          parentID, filterID, filter, actualID
        } = x;
        moreFilterSelection.push({ parentID, filterID, filter, actualID, profileTypeID: selectedProfileTypeID })
      })
    }

    const tp = travellingPurposeFilter.filter(obj => obj.selected === true)
    if (tp && tp.length > 0) {
      tp.forEach(x => {
        const {
          parentID, filterID, filter, actualID
        } = x;
        moreFilterSelection.push({ parentID, filterID, filter, actualID, profileTypeID: selectedProfileTypeID })
      })
    }

    let moreFilterQuotes = [...quotes];
    const quoteIndex = moreFilterQuotes.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (quoteIndex !== -1) {
      let otherFilters = moreFilterQuotes[quoteIndex].profileFilter.filter(x => x.parentID !== 1001 && x.parentID !== 1002
        && x.parentID !== 1003 && x.parentID !== 1004 && x.parentID !== 1005)
      let newFilters = [...otherFilters, ...moreFilterSelection]
      moreFilterQuotes[quoteIndex].profileFilter = newFilters;
    }


    this.setState({ showLoader: true })

    //this.gaCustomEvent({ Action: 'Trv.Selection', Label: this.getChipsData(data) });
    onApply(moreFilterQuotes, 'MoreFilter')
    onClose();
  }

  render() {
    const { onClose } = this.props;
    const { currentFilter, newFiltersType, showLoader } = this.state;

    return (
      <div className="overlay">
        <div className="moreFilter">
          <div className="heading">
            {lang.quotesFilterYourPlans}
            <span className="close" onClick={(e) => onClose()} />
          </div>
          <div className="main-wrapper">
            <div className="row ">
              <div className="col-md-4">
                {newFiltersType.map((filter, id) => (
                  <div
                    className={`filter-type ${currentFilter === id ? "selected" : ""}`}
                    onClick={() => this.handleSelection(id, filter)}
                  >
                    {filter}
                  </div>
                ))}
              </div>
              <div className="col-md-8">
                {this.componentSwitcher(currentFilter)}
              </div>
            </div>
          </div>
          <div className="footer-btn">
            <button
              type="submit"
              className="clear_all"
              onClick={this.clearAllFilters}
            >
              {lang.quotesClearALL}
            </button>
            {showLoader ? <div className="loading primary_button apply_btn"></div> : <button
              type="submit"
              className="primary_button apply_btn"
              onClick={this.handleApplyButton}
            >
              {lang.quotesApplyCaps}
            </button>}
          </div>
        </div>
      </div>
    );
  }
}

MoreFilterModal.propTypes = {
  filters: PropTypes.instanceOf(Object).isRequired,
  onClose: PropTypes.func.isRequired
}

const mapDispatchToProps = dispatch => {
  return {
    // onUpdateStore: data => dispatch(onUpdateStore(data))
  };
};

const mapStateToProps = state => {
  return {
    // familyDataCollection: state.familyDataCollection,
    travellerData: state.travellerData
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MoreFilterModal);
// export default ;
