import React, { Component } from 'react';

import * as _ from 'lodash';

import MoreFilters from './MoreFilters';

class Filters extends Component {
    constructor(props){
        super(props);
        this.state={
            open: false,
            filters:{
                sumInsured : [
                    {
                        currency: 'USD&EUR',
                        name:'100000'
                    }
                ]
            },
            selectedCurrency: 'USD&EUR',
            defaultCurrency:'USD',
            defaultSumInsured:'50000'
        }
    }

    showFilters = () =>{
        const { open } = this.state;
        this.setState({open: !open})
    }

    handleFilters = (updated = false, data) =>{
        const { filters } = this.state;
        this.setState({
            filters: updated ? {...filters, ...data} : filters,
            selectedCurrency: updated? data.sumInsured[0].currency: filters.sumInsured[0].currency,
            open:false
        })
    }

    renderChips = () =>{
        const { filters } = this.state;
        const chips = [];
        Object.keys(filters).forEach(key =>{
            filters[key].forEach(data =>{
                chips.push({ name: data.name, key})
            })
            
        })

        return (
          <>
            { !_.isEmpty(chips) && (
              <div className="chip_wrapper">
                {chips.map((data) => (
                  <span className="chips">
                    {data.name}
                    <span 
                      className="close" 
                      onClick={() => this.deleteFilterChip(data)}
                    />
                  </span>
                ))}
              </div>
            )}
          </>
        )
    }

    render() {
        const { 
            filters, 
            open,
            defaultCurrency,
            defaultSumInsured,
            selectedCurrency
         } = this.state; 
        return (
          <div>
            <div className="bottom_navbar" >
              {/* <a><i className="fa fa-balance-scale"></i> Compare</a>  */}
              <a onClick={this.showFilters}><i className="fa fa fa-filter"> <em className="badge badge-danger">4</em> </i> Filter </a> 
              <a><i className="fa fa-shopping-bag"></i> Sort by</a>
            </div>
            
            {open && (
              <MoreFilters 
                filters={filters}
                defaultCurrency={defaultCurrency}
                defaultSumInsured={defaultSumInsured}
                selectedCurrency={selectedCurrency}
                onClose={this.handleFilters}
              />
            )}
            {/* {this.renderChips()} */}
          </div>
        )
    }
}

Filters.propsTypes = {

}

export default Filters
