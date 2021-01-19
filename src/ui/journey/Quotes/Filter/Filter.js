import React, { Component } from "react";
import PropTypes from 'prop-types';

import * as _ from 'lodash'
import Insurer from './Insurer';
import MoreFilterModal from './MoreFilterModal';
import SumInsured from './SumInsured';
 

import { formattedCurrency, hideScroll, showScroll } from '../../../../utils/helper';
import { customEvent } from "../../../../GA/gaEvents";

import { lang } from '../../../../cms/i18n/en/index';

import './styles/filter.css';
import { Hidden } from "@material-ui/core";
import { SaveFilters } from "../../../../services/quotes"

class Filter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      openInsurerModal: false,
      openSumInsuredModal: false,
      openMoreFilterModal: false,
      filter: {},
      //previousTripTypeId: props.previousTripTypeId,
      quotes: props.quotes,
      selectedProfileTypeID: props.selectedProfileTypeID,
      selectedGroupID: props.selectedGroupID,
      profiles: props.profiles,
      sumInsured: '',
      currency: '',
      mobileSorting: false,
      trackSort: []

    }
    this.isMobile = window.screen.width < 768;

  }


  componentDidMount() {
    let {
      currency,
      sumInsured
    } = this.state;
    currency = this.getCurrency();
    sumInsured = this.getSumInsured();
    this.setState({
      currency,
      sumInsured
    })
  }

  static getDerivedStateFromProps(props, state) {

    if (props.selectedProfileTypeID !== state.selectedProfileTypeID) {

      return {
        selectedProfileTypeID: props.selectedProfileTypeID,
        selectedGroupID: props.selectedGroupID,
        quotes:props.quotes
      }

    }
  }


  handleInsurerModal = () => {
    this.setState({ openInsurerModal: true });
  }

  handlesumInsuredModal = () => {
    this.setState({ openSumInsuredModal: true });
  }



  closeInsureModal = (updated, filterInsurers) => {

    this.setState({
      openInsurerModal: false,
    });
  }


  handleMoreFilterModal = () => {
    this.setState({ openMoreFilterModal: true });
  }


  closeMoreFilterModal = () => {

    this.setState({
      openMoreFilterModal: false,

    });

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



  closeSumInsuredModal = () => {
    this.setState({
      openSumInsuredModal: false,
    })
  }

  renderMobileSorting = () => {
    let sorting = 0
    const {
      profiles,
      selectedProfileTypeID
    } = this.props;
    const profileIndex = profiles.findIndex(x => x.profileTypeID === selectedProfileTypeID)
    if (profileIndex !== -1) {
      sorting = profiles[profileIndex].mobileSort >= 0 ? profiles[profileIndex].mobileSort : 0
    }





    return <div className="overlay">
      <div className="modal-dialog profilesDropdown">
        <div className="modal-content">
          <div className="modal-header">
            <h5 class="modal-title">
              Sorting
                  <span className="close" onClick={(e) => this.setState({ mobileSorting: false })} />
            </h5>

          </div>

          <div class="modal-body">
            <div class="sortingList">
              <div
                class={`name ${sorting === 0 ? "active" : ''}`}
                onClick={() => this.handleMobileSortingValue("0")}
              >
                {"Default"}
              </div>
              <div
                class={`name ${sorting === 1 ? "active" : ''}`}
                onClick={() => this.handleMobileSortingValue("1")}
              >
                {"Low to High"}
              </div>
              <div
                class={`name ${sorting === 2 ? "active" : ''}`}
                onClick={() => this.handleMobileSortingValue("2")}
              >
                {"High to Low"}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  }

  handleMobileSortingValue = (val) => {

    const {

      sortQuotes
    } = this.props;
    const {

      profiles,
      selectedProfileTypeID
    } = this.state;


    if (val === "0" || val === "1" || val === "2") {
      const label = (val === "0") ? 'Default' : (val === "1") ? 'Low to High' : 'High to Low';
      this.gaCustomEvent({ Action: 'Trv.Sort', Label: label })
    }

    const index = profiles.findIndex(x => x.profileTypeID === selectedProfileTypeID)
    if (index !== -1) {
      profiles[index].mobileSort = parseInt(val, 10)
    }

    sortQuotes(val);
    this.setState({ mobileSorting: false, profiles })

  }



  handleSorting = (e) => {

    const {
      sorting,
      sortQuotes
    } = this.props;
    const {
      quotes,
      selectedProfileTypeID,
      trackSort
    } = this.state;

    const { value } = e.target;
    if (value == 0 || value == 1 || value == 2) {

      const index = trackSort.findIndex(x => x.selectedProfileTypeID === selectedProfileTypeID);
      if (index === -1) {
        trackSort.push({ selectedProfileTypeID, value })
      }
      else {
        trackSort[index].value = value;
      }

      const label = (value == 0) ? 'Default' : (value == 1) ? 'Low to High' : 'High to Low';
      this.gaCustomEvent({ Action: 'Trv.Sort', Label: label })
      this.setState({
        trackSort
      })
    }

    if (e.target.value !== sorting) {
      sortQuotes(value);
    }
  }

  applyFilter = async (filterQuotes, source) => {

    const {
      applyFiltersOnQuote,
      encryptedProposerID,
      proposerID
    } = this.props;
    let savefiltersList = [];
    filterQuotes.forEach(x => {
      x.profileFilter.forEach(y => {
        const {
          filterID,
          filter,
          profileTypeID
        } = y
        if (source === 'SumInsured') {
          if (y.parentID === 1008) {
            const value = filter.split(' ');
            if (value && value[0] && value[1]) {
              let currencySymbol = '';
              currencySymbol = value[0] === 'USD' ? '$' : '€'
              this.setState({ currency: currencySymbol, sumInsured: value[1] })
            }

          }
        }

        savefiltersList.push({ filterID, filter, profileTypeID });
      })
    })
    let reqBody = {};
    reqBody.encryptedProposerID = encryptedProposerID;
    reqBody.proposerID = proposerID;
    reqBody.filters = savefiltersList;
    applyFiltersOnQuote(filterQuotes, source);
    await SaveFilters(reqBody);
  }


  getSumInsured = () => {

    const {
      quotes,
      selectedProfileTypeID
    } = this.state;
    let {
      sumInsured,
    } = this.state;

    const quoteIndex = quotes.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (quoteIndex !== -1) {

      let sumInsuredFilter = quotes[quoteIndex].profileFilter.filter(x => x.parentID === 1008)

      if (sumInsuredFilter && sumInsuredFilter.length > 0) {
        const {
          filter
        } = sumInsuredFilter[0];
        let data = filter.split(' ');

        if (data && data.length > 0) {

          if (data && data[1] && data[1].length > 0) {
            sumInsured = data[1];
          }

        }
      }

    }


    return sumInsured;
  }

  getCurrency = () => {

    const {
      quotes,
      selectedProfileTypeID
    } = this.state;
    let {

      currency,
    } = this.state;

    const quoteIndex = quotes.findIndex(x => x.profileTypeID === selectedProfileTypeID);
    if (quoteIndex !== -1) {

      let sumInsuredFilter = quotes[quoteIndex].profileFilter.filter(x => x.parentID === 1008)

      if (sumInsuredFilter && sumInsuredFilter.length > 0) {
        const {
          filter
        } = sumInsuredFilter[0];
        let data = filter.split(' ');

        if (data && data.length > 0) {
          if (data[0] === 'USD') {
            currency = '$';
          }
          else {
            currency = '€';
          }

        }
      }

    }

    return currency;
  }

  sortTextOrder = () => {
    const {
      trackSort,
      selectedProfileTypeID
    } = this.state;
    let value = "0";
    const index = trackSort.findIndex(x => x.selectedProfileTypeID === selectedProfileTypeID);
    if (index !== -1) {
      value = trackSort[index].value;
    }
    return value;
  }

  render() {

    const {
      openInsurerModal,
      openMoreFilterModal,
      filter,
      openSumInsuredModal,
      mobileSorting,
      selectedProfileTypeID,
      quotes,
      sumInsured,
      currency,

    } = this.state;

    const {
      profileType,
      GeographyID,
      checkStudentVisaModal,
      maxTripDuration,
      hanldeMaxTripDuration
    } = this.props;

    const order = this.sortTextOrder();

    return (
      <>
        <div className="filter_section desktop">
          {mobileSorting === true && this.renderMobileSorting()}
          {openInsurerModal && (
            <Insurer
              onClose={this.closeInsureModal}
              onApply={this.applyFilter}
              selectedProfileTypeID={selectedProfileTypeID}
              quotes={quotes}
              selectedInsurers={[]}
            />
          )}
          {openSumInsuredModal && (
            <SumInsured
              onClose={this.closeSumInsuredModal}
              GeographyID={GeographyID}
              currencyV2={this.getCurrency() === '$' ? 'USD' : 'EUR'}
              sumInsuredV2={this.getSumInsured()}
              selectedProfileTypeID={selectedProfileTypeID}
              quotes={quotes}
              onApply={this.applyFilter}
            />
          )}
          {openMoreFilterModal && (
            <MoreFilterModal
              onClose={this.closeMoreFilterModal}
              filters={filter[profileType]}
              checkStudentVisaModal={checkStudentVisaModal}
              maxTripDuration={maxTripDuration}
              hanldeMaxTripDuration={hanldeMaxTripDuration}
              selectedProfileTypeID={selectedProfileTypeID}
              quotes={quotes}
              onApply={this.applyFilter}
            />
          )}

          <ul className="filterBox desktop">
            <li>{lang.quotesFilterBy}</li>
            <li>
              <div className="selection" onClick={this.handleInsurerModal}>
                {" "}
                {lang.quotesInsurerAll}
                <div className="img_arrow" />
              </div>
            </li>
            <li>
              <div className="selection si_input" onClick={this.handlesumInsuredModal}>
                <p className="sumInsured">{lang.quotesSumInsured}</p>
                <p>
                  {`${currency && this.getCurrency()} ${sumInsured && parseInt(this.getSumInsured(), 10).toLocaleString()}`
                  }
                </p>
                <div className="img_arrow" />
              </div>
            </li>

            <li>
              <div className="selection" onClick={this.handleMoreFilterModal}>
                {" "}
                {lang.quotesMoreFilters}
                <div className="img_arrow" />
              </div>
            </li>

            <li>
              <div className="selection selection_wrp sortby">
                <p className="sumInsured">{lang.quotesSortBy}</p>
                <select
                  onChange={this.handleSorting}
                  id={profileType}
                  key={profileType}
                >
                  {/* <option disabled selected value>Sort By: Pricing</option> */}
                  <option value='0' selected={order === '0'}>{lang.quotesDefault}</option>
                  <option value='1' selected={order === '1'}>{lang.quotesSortLtoH}</option>
                  <option value='2' selected={order === '2'}>{lang.quotesSortHtoL}</option>
                </select>
                {/* Sort By: Pricing */}
                <div className="img_arrow" />
              </div>
            </li>
          </ul>



        </div>
        {this.isMobile && <div className="bottom_navbar mobile" >
          <a>
            <div className="selection si_input small" onClick={this.handlesumInsuredModal}>

              <p>
                {`${currency && this.getCurrency()} ${sumInsured && parseInt(this.getSumInsured(), 10).toLocaleString()}`
                }
              </p>
              <p className="sumInsured">{lang.quotesSumInsured}</p>
              {/* <div className="img_arrow" /> */}
            </div>
          </a>
          <a onClick={this.handleMoreFilterModal}><i className="fa fa fa-filter"> <em className="badge badge-danger">4</em> </i> Filter </a>
          <a onClick={() => this.setState({ mobileSorting: true })}><i className="fa fa-shopping-bag"></i> Sort by</a>
        </div>}

      </>
    );
  }
}

Filter.propTypes = {
  getInsurerQuotes: PropTypes.func.isRequired,
  profileType: PropTypes.string.isRequired,
  proposerID: PropTypes.string.isRequired,
  sortQuotes: PropTypes.func.isRequired,
  filterQuotes: PropTypes.func.isRequired,
  profiles: PropTypes.instanceOf(Array).isRequired,
  quotes: PropTypes.instanceOf(Array).isRequired,
  sorting: PropTypes.string.isRequired,
}
export default Filter;