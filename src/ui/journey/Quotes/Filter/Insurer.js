import React, { Component } from "react";
import PropTypes from 'prop-types';

import { InsurerFilter } from '../../../../lib/helperData'
import { customEvent } from "../../../../GA/gaEvents";
import * as _ from "lodash";
import "./styles/insurer.css";
import { lang } from "../../../../cms/i18n/en";
import { QuoteFilters } from "./helperData";



class Insurer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterList: this.getInsurerSelection(),
      quotes: props.quotes,
      selectedProfileTypeID: props.selectedProfileTypeID,
      selectedGroupID: props.selectedGroupID,
      currentSelection: []
    }
  }

  getInsurerSelection = () => {

    const updatedInsurere = InsurerFilter.map((insurer) => {
      const { quotes, selectedProfileTypeID } = this.props;
      const index = quotes.findIndex(x => x.profileTypeID === selectedProfileTypeID);
      if (index !== -1) {
        let selectedInsurerFilter = quotes[index].profileFilter.filter(f => f.parentID === 1007)
        if (selectedInsurerFilter && selectedInsurerFilter.length > 0) {

          const insurerFilterIndex = selectedInsurerFilter.findIndex(x => x.actualID.toString() === insurer.insurerID);
          return {
            ...insurer,
            selected: insurerFilterIndex !== -1
          }
        }
        else {
          return {
            ...insurer,
            selected: false
          }
        }
      }
     
    });

    return updatedInsurere
  }




  handleFilterSelection = (id) => {
    const { filterList } = this.state;

    const insurer = filterList[id];
    if (!insurer.selected) {
      insurer.selected = true;
    } else {
      insurer.selected = false;
    }

    this.setState({ filterList });
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

  handleApplyButton = async () => {

    const { filterList } = this.state;
    let selectedInsurer = [];
    const { onClose, onApply, quotes, selectedProfileTypeID } = this.props;

    filterList.forEach(x => {
      if (x.selected === true) {
        if (selectedInsurer.findIndex(y => y.actualID == x.insurerID) === -1) {
          const {
            filterID,
            filter
          } = QuoteFilters.filter(z => z.parentID === 1007 && z.actualID.toString() === x.insurerID)[0]
          selectedInsurer.push({ actualID: parseInt(x.insurerID, 10), parentID: 1007, filterID, filter, profileTypeID: selectedProfileTypeID })
        }

      }
      else if (x.selected === false) {
        if (selectedInsurer.findIndex(y => y.actualID == x.insurerID) !== -1) {
          const removeIndex = selectedInsurer.findIndex(y => y.actualID == x.insurerID)
          selectedInsurer.splice(removeIndex, 1)
        }

      }
    })


    let addRemoveInsurerFilter = [...quotes];
    const index = addRemoveInsurerFilter.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (index !== -1) {
      selectedInsurer.forEach(x => {
        const {
          actualID,
          parentID,
          filterID,
          filter,
          profileTypeID
        } = x;
        if (addRemoveInsurerFilter[index].profileFilter.findIndex(y => y.parentID === 1007 && y.actualID === x.actualID) === -1) {
          addRemoveInsurerFilter[index].profileFilter.push({ actualID, parentID, filterID, filter, profileTypeID })
        }
      })



      for (let i = 0; i < addRemoveInsurerFilter[index].profileFilter.length; i++) {

        if (addRemoveInsurerFilter[index].profileFilter[i].parentID === 1007 && selectedInsurer.findIndex(r => r.actualID === addRemoveInsurerFilter[index].profileFilter[i].actualID) === -1) {
          addRemoveInsurerFilter[index].profileFilter.splice(i, 1);
          i--;
        }
      }



    }

    // const filterInsurer = filterList.filter((insurer) =>  insurer.selected === true);
    // const arr = _.join(_.map(filterInsurer, 'insurerID'),',');
    // this.gaCustomEvent({Action:'Trv.Insurer',Label:arr});
    onApply(addRemoveInsurerFilter, "Insurer");
    onClose(true, []);
  }



  handleClearAll = () => {
    const { filterList } = this.state;
    let selectedInsurer = [];
    const { onClose, onApply, quotes, selectedProfileTypeID } = this.props;
    let addRemoveInsurerFilter = [...quotes];
    const index = addRemoveInsurerFilter.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (index !== -1) {
      let removedInsurerFilter = addRemoveInsurerFilter[index].profileFilter.filter(x => x.parentID !== 1007)
      if (removedInsurerFilter && removedInsurerFilter.length > 0) {
        addRemoveInsurerFilter[index].profileFilter = removedInsurerFilter;
      }
    }

    onApply(addRemoveInsurerFilter, "Insurer");
    onClose(true, []);
  }

  render() {
    const { onClose } = this.props;
    const { filterList } = this.state;

  
    return (
      <div className="overlay">
        <div className="modal-dialog insurer_popup">
          <div className="modal-content">
            <div className="insurer_popup_heading">
              {lang.quotesInsurer}
              <span className="close" onClick={() => onClose(false, [])} />
            </div>
            <div className="insurer_wrapper">
              {filterList && filterList.length > 0 && filterList.map((insurer, id) => (
                <div
                  className={`insurer_row ${insurer.selected === true ? 'enable' : ''}`}
                  onClick={() => this.handleFilterSelection(id)}
                >
                  {insurer.name}
                </div>
              ))}
            </div>
            <div className="insurer_btn">
              <button
                type="submit"
                className="clear_all"
                onClick={this.handleClearAll}
              >
                {lang.quotesClearALL}
              </button>
              <button
                type="submit"
                className="primary_button apply_btn"
                onClick={this.handleApplyButton}
              >
                {lang.quotesApplyCaps}
              </button>

            </div>
          </div>
        </div>

      </div>
    );
  }
}

Insurer.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default Insurer;
