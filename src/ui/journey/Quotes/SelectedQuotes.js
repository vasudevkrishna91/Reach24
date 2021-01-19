import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { lang } from '../../../cms/i18n/en';

class SelectedQuotes extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  handleClick = async () => {
    debugger
    const { saveQuotes } = this.props;

    const { loading } = this.state;

    if (loading) return;

    this.setState({ loading: true })

    const res = await saveQuotes();
    if (res) {
      this.setState({ loading: false });
    }
  }

  isValid = () => {
    const {
      profiles,
      selectedQuotes
    } = this.props;

    let valid = true;


    const profileLength=profiles.length;
    const selectedQuotesLength=selectedQuotes.length;
    if(profileLength!==selectedQuotesLength){
      valid=false
    }

    if (valid === true) {

      this.handleClick();
    }



    return valid === true ? "" : "disabled";
  }

  getVariantName = (profileTypeID,groupID) => {
    const {
      selectedQuotes
    } = this.props;
    const index = selectedQuotes.findIndex(x => x.profileTypeID === profileTypeID && x.groupID===groupID)
    if(index!==-1){
     return selectedQuotes[index].variantName
    }
    else{
      return '';
    }
  }

  getInsurerName = (profileTypeID,groupID) => {
    const {
      selectedQuotes
    } = this.props;
    const index = selectedQuotes.findIndex(x => x.profileTypeID === profileTypeID && x.groupID===groupID)
    if(index!==-1){
     return selectedQuotes[index].insurerName;
    }
    else{
      return '';
    }
  }

  render() {
    const {
      profiles,
      selectedQuote,
      saveQuotes,
      errors,
      removeSelectedPlan,
      selectedQuotes
    } = this.props;

    const { loading } = this.state;

    return (
      <>
        {!_.isEmpty(profiles) && !_.isEmpty(selectedQuotes) && profiles.length > 1 && (
          <div className="proceed_footer">
            <div className="proceed_inner">
              <i className="proceed_text">{lang.quotesSelectedPlans}</i>
              {profiles.map(profile => {
                const {
                  profileTypeID,
                  profileName,
                  groupID
                } = profile;
                return (
                  <>
                    {selectedQuotes && this.getVariantName(profileTypeID,groupID)
                      ?
                      (
                        <div className="select_plan_chip">
                          <span
                            onClick={() => removeSelectedPlan(profileTypeID,groupID)}
                          // style={{cursor:'pointer', fontWeight:'bold', fontSize:'12px'}}
                          >
                            {/* X */}
                          </span>
                          <div className={`Logo ${this.getInsurerName(profileTypeID,groupID)}`}>
                            {/* <img src="images/insurer.png" alt="" /> */}
                          </div>
                          <div className="select_insurer">
                            <h5>{`${this.getVariantName(profileTypeID,groupID)} for ${profileName}`}</h5>
                          </div>
                        </div>
                      )
                      :
                      (
                        <div
                          className="select_plan_chip add_plan_chip"
                          style={{ border: `${errors && errors[profile] ? '1px solid red' : ''}` }}
                        >
                          <div className="select_insurer">
                            <h5>{`Add Plan for ${profileName}`}</h5>
                          </div>
                        </div>
                      )}
                  </>
                )
              })}
              {/* {errors  
                && (
                <p style={{fontSize:'8px', color: 'red'}}>Please Select Plan</p>
                )} */}
              <div className="primary_button_wrapper">
                {loading && _.isEmpty(errors) ? <div className="loading primary_button_wrapper" /> : <button
                  className={`primary_button ${this.isValid()}`}
                  type="submit"
                  onClick={this.handleClick}
                >
                  {lang.quotesProceed}
                </button>}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }
}

SelectedQuotes.propTypes = {
  profiles: PropTypes.instanceOf(Array).isRequired,
  selectedQuote: PropTypes.instanceOf(Object).isRequired,
  saveQuotes: PropTypes.func.isRequired,
  errors: PropTypes.instanceOf(Object).isRequired
}

export default SelectedQuotes