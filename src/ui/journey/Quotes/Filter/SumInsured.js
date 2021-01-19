import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as _ from 'lodash';
import { SumInsuredFilter, currencyFormat } from '../../../../lib/helperData';
import { formattedCurrency } from '../../../../utils/helper';

import './styles/sumInsured.css';
import { lang } from '../../../../cms/i18n/en';

class SumInsured extends Component {

  constructor(props) {
    super(props);
    this.state = {
      filterList: this.mapDataToprops(SumInsuredFilter),
      currencyV2: props.currencyV2,
      sumInsuredV2: props.sumInsuredV2,
    
    }
  }

  

  mapDataToprops = (mainData) => {
    const {
      currencyV2,
      sumInsuredV2
    } = this.props;
    const updatedFilter = mainData.map((filter) => {
      if (filter.name === sumInsuredV2 && filter.currency === currencyV2) {
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

  handleApplyButton = () => {
    const {
      filterList,
    } = this.state;

    const { onClose, onApply, quotes, selectedProfileTypeID } = this.props;

    let updateSumInsured = [...quotes];
    const index = updateSumInsured.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (index !== -1) {

      const siFilterIndex = updateSumInsured[index].profileFilter.findIndex(y => y.parentID === 1008)
      if (siFilterIndex !== -1) {
        let siFiltere = {};
        const si = filterList.filter(x => x.selected === true)
        if (si && si[0] && si.length > 0) {
          siFiltere = si[0];

          updateSumInsured[index].profileFilter[siFilterIndex].filterID = siFiltere.filterID
          updateSumInsured[index].profileFilter[siFilterIndex].actualID = siFiltere.actualID
          updateSumInsured[index].profileFilter[siFilterIndex].profileTypeID = selectedProfileTypeID
          updateSumInsured[index].profileFilter[siFilterIndex].parentID = 1008
          updateSumInsured[index].profileFilter[siFilterIndex].filter = `${siFiltere.currency} ${siFiltere.name}`
        }
      }
    }

    onApply(updateSumInsured, 'SumInsured');
    onClose(true, []);

  }

  handleClearAll = () => {
    const {
      filterList,
    } = this.state;

    const { onClose, onApply, quotes, selectedProfileTypeID } = this.props;

    let updateSumInsured = [...quotes];
    const index = updateSumInsured.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (index !== -1) {

      const siFilterIndex = updateSumInsured[index].profileFilter.findIndex(y => y.parentID === 1008)
      if (siFilterIndex !== -1) {
        let siFiltere = {};
        const si = filterList.filter(x => x.selected === true)
        if (si && si[0] && si.length > 0) {
          siFiltere = si[0];

          updateSumInsured[index].profileFilter[siFilterIndex].filterID = 56
          updateSumInsured[index].profileFilter[siFilterIndex].actualID = 56
          updateSumInsured[index].profileFilter[siFilterIndex].profileTypeID = selectedProfileTypeID
          updateSumInsured[index].profileFilter[siFilterIndex].parentID = 1008
          updateSumInsured[index].profileFilter[siFilterIndex].filter = 'USD 100000'
        }
      }
    }

    onApply(updateSumInsured, 'SumInsured');
    onClose(true, []);

  }

  handleSumInsuredSelection = (sumInsured) => {
    const { filterList } = this.state;
    for (let i = 0; i < filterList.length; i++) {
      if (filterList[i].name === sumInsured.name
        && filterList[i].currency === sumInsured.currency
      ) {
        filterList[i].selected = true;
      } else {
        filterList[i].selected = false;
      }
    }
    this.setState({
      filterList,
      disabled: false,
      alert: ''
    });
  }

  selectCurrency = (e) => {
    const { filterList } = this.state
    for (let i = 0; i < filterList.length; i++) {
      filterList[i].selected = false
    }
    this.setState({
      currencySelected: e.target.value,
      filterList,
      currencyV2:e.target.value
    })
  }

  renderSumInsured = (filterList) => {
    

    const {
      currencyV2,
    } = this.state;

    const newData = filterList.filter(sumInsured => {
      if (sumInsured.currency === currencyV2) { return true }
      else {
        return false
      }

    })
    return (
      newData.map((sumInsured, id) => (
        <span
          className={`${sumInsured.selected ? 'active' : ''}`}
          // style={{border: `${alert ? '1px solid red':''}`}}
          onClick={() => this.handleSumInsuredSelection(sumInsured)}
        >
          {sumInsured.currency === 'USD'? '$':'\u20AC'}
          {' '}
          {formattedCurrency(sumInsured.name)}
        </span>
      ))
    )
  }

  render() {
    const { onClose, geographyID ,quotes,selectedProfileTypeID} = this.props;
    let selectedQuoteIndex=0;
    const quoteIndex=quotes.findIndex(x=>x.profileTypeID===selectedProfileTypeID);
   if( quoteIndex!==-1){
    selectedQuoteIndex=quoteIndex;
   }

    const {
      filterList,
      disabled,
      currencySelected,
      currencyV2
    } = this.state;

    return (
      <div className="overlay">
        <div className="modal-dialog insurer_popup si_popup">
          <div className="modal-content">
            <div className="insurer_popup_heading si_heading">
              {lang.quotesSumInsuredHeader}
              <span
                className="close"
                onClick={() => onClose()}
              />
            </div>
            <div className="si_wrapper">
              <p>
                {lang.quotesSumInsuredSubHeader}
              </p>
              {/* eslint-disable */}
              <label>{lang.quotesSelectedCurrency}</label>
              {/* eslint-enable */}
              <select
                className="drop_down si_slect"
                onChange={this.selectCurrency}
                value={currencySelected}
              >
                {currencyFormat.map(currency => {
                  if (quotes[selectedQuoteIndex].isSchengenPlanExist===true ) {
                    return (
                      <option
                        value={currency.type}
                        selected={currencyV2===currency.type}
                      >
                        {currency.value}
                      </option>
                    )
                  }
                  else if(quotes[selectedQuoteIndex].isSchengenPlanExist===false && currency.type==='USD'){
                    return (
                      <option
                        value={currency.type}
                      >
                        {currency.value}
                      </option>
                    )
                  }
                 
                })}
              </select>
              <p className="chip_text">{lang.quoteSelctedSumInsured}</p>
              <div className="si_chip_wrapper">
                {this.renderSumInsured(filterList)}
              </div>
              <div className="insurer_btn">
                <button
                  type="submit"
                  className="clear_all"
                  onClick={this.handleClearAll}
                >
                  {lang.quotesReset}
                </button>
                <button
                  className="primary_button apply_btn"
                  type="submit"
                  disabled={disabled}
                  onClick={this.handleApplyButton}
                >
                  {lang.quotesApplyCaps}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SumInsured.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedSumInsured: PropTypes.instanceOf(Array).isRequired,
  defaultSumInsured: PropTypes.string.isRequired
}

export default SumInsured;