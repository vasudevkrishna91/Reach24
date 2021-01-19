import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { 
    filtersType,
    InsurerFilter,
    CoveragesFilter,
    SumInsuredCoverageFilter,
    VisaTypeFilter,
    SumInsuredFilter,
    currencyFormat,
    TravellingPurposeFilter
} from './helperData';

import { formattedCurrency } from '../../../../utils/helper';
import { lang } from '../../../../cms/i18n/en/index';


import './styles/MoreFilters.css';
import './styles/SumInsured.css';
import './styles/Insurers.css'


class MoreFilters extends Component {

    constructor(props){
        super(props);
        const { filters } = props;
        this.state={
            currentFilter: 0,
            currentField: 'Insurers',
            newFiltersType: this.getFilterType(props.travellerData),
            insurerFilter: this.mapDataToprops(InsurerFilter, filters.insurers),
            coveragesFilter: this.mapDataToprops(CoveragesFilter, filters.coverages),
            sumInsuredCoverageFilter: this.mapDataToprops(
                                        SumInsuredCoverageFilter, 
                                        filters.sumInsuredCoverageFilter
                                    ),
            visaTypeFilter: this.mapDataToprops(VisaTypeFilter, filters.visaType),
            travellingPurposeFilter: this.mapDataToprops(
                                        TravellingPurposeFilter, 
                                        filters.travellingPurpose
                                    ),
            sumInsuredFilter: this.mapDataToprops(SumInsuredFilter, filters.sumInsured, 'Sum Inured'),
            selectedCurrency: props.selectedCurrency
        }
    }

    getFilterType = (travellers) =>{
        let result = filtersType;
        if(travellers.length === 1){
            result = result.filter(res => res !== "Sum Insured Coverage")
        }
        return result
    }

    mapDataToprops = (mainFilter, selectedFilter = [], type='') =>{
        let filters = []
        if(type !== 'Sum Inured'){
            filters = mainFilter.map(filter =>{
                const index = selectedFilter.findIndex(selected => selected.name === filter.name)
                return {
                    ...filter,
                    selected: index !== -1
                }
            })
        }else{
            filters = mainFilter.map(filter =>{
                const index = selectedFilter.findIndex(selected => 
                    selected.name === filter.name
                    && selected.currency === filter.currency
                )
                return {
                    ...filter,
                    selected: index !== -1
                }
            })
        }
        
        return filters
    }

    handleSelection = (id, filter) =>{
        this.setState({
            currentFilter: id,
            currentField: filter
        })
    }

    componentSwitcher = () =>{
        const { currentField } = this.state;
        switch(currentField){
          case "Insurers":
            return this.showInsurerFilter()
          case "Sum Insured":
            return this.showSumInuredFilter()
          case "Coverages":
            return this.showCoverageFilter()
          case "Sum Insured Coverage":
            return this.showSumInsuredCoverageFilter()
          case "Visa Type":
            return this.showVisaFilter()
          case "Purpose Of Travel":
            return this.showPurposeFilter()
          default:  return <h1> No Component</h1>
        }
    }

    showInsurerFilter = () =>{
        const { insurerFilter } = this.state
        
        return insurerFilter.map((item, id) => (
          <div className='coverage-item'>
            <input 
              className="magic-checkbox"
              type="checkbox"
              onClick={this.handleFilterSelection}
              value={item.selected}
              id={id}
              key={`insurer-filter${id}`} // eslint-disable-line
              checked={item.selected}
            />
            <label htmlFor={id} />
            <label className="text" htmlFor={id}> 
              {item.name}
            </label>
          </div>
        ));
        // return (
        //   <div className="insurer_wrapper">
        //     {insurerFilter.map((insurer, id) => (
        //       <div 
        //         className={`insurer_row ${insurer.selected ? 'enable' : ''}`}
        //         id={id}
        //         onClick={this.handleFilterSelection}
        //       >
        //         {insurer.name}
        //       </div>
        //     ))}
        //   </div>)
    }

    showSumInsuredCoverageFilter = () => {
        const { sumInsuredCoverageFilter } = this.state;
    
        return sumInsuredCoverageFilter.map((item, id) => (
          <div className='coverage-item'>
            <input 
              className="magic-checkbox"
              type="checkbox"
              onClick={this.handleFilterSelection}
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
        ));
    }

    showPurposeFilter = () => {
        const { travellingPurposeFilter } = this.state;
    
        return travellingPurposeFilter.map((item, id) => (
          <div className='coverage-item'>
            <input
              className="magic-checkbox"
              type="checkbox"
              onClick={this.handleFilterSelection}
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
        ));
    }

    showCoverageFilter = () => {
        const { coveragesFilter: oldCoverages } = this.state;
    
        const { travellerData } = this.props;
        let newCoverageFilters = oldCoverages;
    
        let hideMedicalCoverage = true;
    
        travellerData.forEach(element => {
          if(!hideMedicalCoverage) return;
          if(element.age > 50) 
            hideMedicalCoverage = false;
        });
    
        if(hideMedicalCoverage) {
          newCoverageFilters = oldCoverages.filter((obj) => obj.id !== 9);
        }
    
        const { coveragesFilter } = this.state
        return coveragesFilter.map((item, id) => (
          <div className='coverage-item'>
            <input 
              className="magic-checkbox"
              type="checkbox"
              onClick={this.handleFilterSelection}
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
        ));
      }

    showVisaFilter = () => {
        const { visaTypeFilter } = this.state;
    
        return visaTypeFilter.map((item, id) => (
          <div className='coverage-item'>
            <input 
              className="magic-checkbox"
              type="checkbox"
              onClick={this.handleFilterSelection}
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
        ));
      }

    handleFilterSelection = (e) =>{
        const {
            currentField,
            insurerFilter,
            coveragesFilter,
            sumInsuredCoverageFilter,
            visaTypeFilter,
            travellingPurposeFilter,
        } = this.state;

        const { value, id } = e.target

        switch(currentField){
          case "Insurers":
            if(!insurerFilter[id].selected) {
                insurerFilter[id].selected = true;
            } else {
                insurerFilter[id].selected = false;
            }
            break; 
          case "Coverages":
            coveragesFilter[id].selected = value === 'false';
            break; 
          case "Sum Insured Coverage":
            sumInsuredCoverageFilter[id].selected = value === 'false';
            break; 
          case "Visa Type":
            visaTypeFilter[id].selected = value === 'false';
            break; 
          case "Purpose Of Travel":
            travellingPurposeFilter[id].selected = value === 'false';
            break; 
          default:  break;
        }

        this.setState({
            insurerFilter,
            coveragesFilter,
            sumInsuredCoverageFilter,
            visaTypeFilter,
            travellingPurposeFilter, 
        })
    }

    selectCurrency = (e) =>{
        const { value }= e.target;
        this.setState({
            selectedCurrency: value,
            sumInsuredFilter: this.mapDataToprops(SumInsuredFilter),
            sumInsuredAlert:''
        })
    }

    showSumInuredFilter = () =>{
        const { sumInsuredFilter, selectedCurrency } = this.state;

        return (
          <div className="si_wrapper">
            <p>
			{lang.quotesSumInsuredSubHeader}
            </p>
            <label>{lang.quotesSelectedCurrency}</label>
            <select 
              className="drop_down si_slect"
              onChange={this.selectCurrency}
              value={selectedCurrency}
            >
              {currencyFormat.map(currency =>{
                // if(currency.type === 'USD' || (currency.type !== 'USD' && GeographyID === "6")){
                  return (
                    <option 
                      value={currency.type}
                    >
                      {currency.value}
                    </option>
                  )
            // )}
            //     return null
            })}
            </select>
            <p className="chip_text">{lang.quoteSelctedSumInsured}</p>
            <div className="si_chip_wrapper">
              {this.renderSumInsured(sumInsuredFilter)}
            </div>
          </div>
      )
    }

    renderSumInsured = (filterList) =>{
        const { selectedCurrency, sumInsuredAlert } = this.state
        const newData = filterList.filter(sumInsured => {
          if(sumInsured.currency === selectedCurrency) return true
          return false
        })
        return (
          newData.map((sumInsured) => (
            <span
              className={`${sumInsured.selected ? 'active' : ''}`}
              style={{border: `${sumInsuredAlert ? '1px solid red':''}`}}
              onClick={() => this.handleSumInsuredSelection(sumInsured)}
            > 
              {sumInsured.currency === 'USD'
                ? '$' 
                : (sumInsured.currency === 'EUR'?'€': '$,€')} 
              {' '}
              {formattedCurrency(sumInsured.name)}
            </span>
        ))
        )
      }

    handleSumInsuredSelection = (sumInsured) =>{
        const { sumInsuredFilter } = this.state;
        const index = sumInsuredFilter.findIndex(amount => 
            amount.name === sumInsured.name 
            && amount.currency === sumInsured.currency
        )
        if(index !== -1){
            sumInsuredFilter[index].selected = true;
        }
        this.setState({
            sumInsuredFilter,
            sumInsuredAlert:''
        })
    }

    clearSumInsuredFilter = () =>{
        const { defaultSumInsured, defaultCurrency } = this.props;
        const filters = SumInsuredFilter.map(sumInsured => {
            if(sumInsured.name === defaultSumInsured && sumInsured.currency === defaultCurrency){
                return {
                    ...sumInsured,
                    selected: true
                }
            }
            return{
                ...sumInsured,
                selected : false
            }
        })

        this.setState({
            selectedCurrency: defaultCurrency,
            sumInsuredFilter: filters
        })
        return filters
    }

    clearAllFilters = ()  => {
        this.setState({
          currentFilter: 0,
          currentField: "Insurers",
          sumInsuredFilter: this.clearSumInsuredFilter(),
          insurerFilter: this.mapDataToprops(InsurerFilter),
          coveragesFilter: this.mapDataToprops(CoveragesFilter),
          sumInsuredCoverageFilter: this.mapDataToprops(SumInsuredCoverageFilter),
          visaTypeFilter: this.mapDataToprops(VisaTypeFilter),
          travellingPurposeFilter: this.mapDataToprops(TravellingPurposeFilter)
        }, () => this.handleApplyButton());
      }

      handleApplyButton = () => {
        const {
          insurerFilter,
          travellingPurposeFilter,
          coveragesFilter,
          sumInsuredFilter,
          visaTypeFilter,
          sumInsuredCoverageFilter
        } = this.state;
    
        const { onClose } = this.props;
        
        let sumInsuredAlert = '';
        const data = {
          insurers: insurerFilter.filter(obj => obj.selected === true),
          coverages: coveragesFilter.filter(obj => obj.selected === true),
          sumInsured: sumInsuredFilter.filter(obj => obj.selected === true),
          sumInsuredCoverage: sumInsuredCoverageFilter.filter(obj => obj.selected === true),
          visaType: visaTypeFilter.filter(obj => obj.selected === true),
          travellingPurpose: travellingPurposeFilter.filter(obj => obj.selected === true),
        };

        let check = false;
        sumInsuredFilter.forEach(filter =>{
          if(filter.selected === true) check = true
        })
        if(!check){
          sumInsuredAlert = 'Please Select Sum Insured'
        }else{
            onClose(true, data);
        }
        this.setState({
            sumInsuredAlert
        })
       
      }
    
    
    render() {
        const { onClose } = this.props
        const {
            currentFilter,
            newFiltersType
        } = this.state

        return (
          <div className="overlay">
            <div className="moreFilter">
              <div className="heading">
			  {lang.quotesFilterYourPlans}
                <span className="close" onClick={() =>onClose(false)} />
              </div>
              <div className="main-wrapper">
              <div className="row">
                <div className="col-sm-4 filter-type-col">
                  {newFiltersType.map((filter, id) => (
                    <div 
                      className={`filter-type ${currentFilter === id ? "selected" : ""}`}
                      onClick={() => this.handleSelection(id, filter)}
                    >
                      {filter}
                    </div>
                ))}
                </div>
                <div className="col-8 scrollFilter-mobile">
                  {this.componentSwitcher()}
                </div>
                </div>
              </div>
              <div className="footer-btn">
                <button
                  type="submit"
                  className="clear_all"
                  onClick={this.clearAllFilters}
                >
                  CLEAR ALL
                </button>
                <button
                  type="submit"
                  className="primary_button apply_btn"
                  onClick={this.handleApplyButton}
                >
                  APPLY
                </button>
              </div>
            </div>
          </div>
        )
    }
}

MoreFilters.propTypes = {
    filters: PropTypes.instanceOf(Object).isRequired,
    onClose: PropTypes.instanceOf(Object).isRequired
}

const mapStateToProps = (state) =>({
    travellerData: state.travellerData
})

export default connect(mapStateToProps,{})(MoreFilters);
