import React, { Component } from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { formattedCurrency } from "../../../utils/helper";
import { customEvent, addProduct } from "../../../GA/gaEvents";
import TravellerDetails from "./TravellerDetails";
import { lang } from "../../../cms/i18n/en/index";

import { default as AskDobData } from "../../../lib/askDob.json";

// import { saveQuote } from "../../../services/quotes";

// import IconButton from "@material-ui/core/IconButton";
// import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
// import ExpandLessIcon from "@material-ui/icons/ExpandLess";
// import "./styles/quotesCard.css";

class QuotesCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      showLoader: false,
      showSubLoader: false,
      showTravellerDetailsModal: false,
      showDob: true,
      subPlanId: 0,
   


    };
  }

  handleClick = () => {
    const { open } = this.state;
    this.setState({ open: !open });
  };

  // GA Log quotes
  logAddProduct = quotes => {
    addProduct(quotes, this.props.flowName);
  };

  brochureClick = () => {
    const gaData = {
      eventCategory: "Trv.BU Quotes",
      eventAction: "Trv.click",
      eventLabel: "Trv.Product Details",
      eventValue: "",
      flowName: this.props.flowNameGA
    };
    customEvent(gaData);
  };

  askDobRequired = PlanID => {
    const { travellerData } = this.props;

    let askDob = false;

    let selectedAskDobData = AskDobData.features.filter(
      obj => obj.properties.PlanID.toString() === PlanID.toString()
    );

    selectedAskDobData &&
      selectedAskDobData.length &&
      travellerData.forEach(traveller => {
        if (askDob) return;

        selectedAskDobData.forEach(data => {
          if (askDob) return;

          if (
            data.properties.MinAge === traveller.age ||
            data.properties.MaxAge === traveller.age
          ) {
            askDob = true;
          }
        });
      });

    return askDob;
  };
 


  selectPlan = (selectedPlan, variantName, insurerID, insurerName, variantID) => {
    const {
      selectQuote,
      profileType,
      
      profiles,
      saveSingleQuotes,
      saveMultipleQuotes,
      saveTravellerDOB,
      DOBPopup,
      selectedProfileTypeID,
      selectedGroupID
    } = this.props;
  

    const { showTravellerDetailsModal, showLoader, showSubLoader, showDob,selectedPlans } = this.state;
    
   let selectedQuote= {selectedPlan, variantName, insurerID, insurerName,profileTypeID:selectedProfileTypeID,groupID:selectedGroupID}

    if (profiles.length === 1 && !showTravellerDetailsModal && !showLoader && !showSubLoader) {
      this.setState({ 
        showLoader: true,
        subPlanId: variantID
      });
      saveSingleQuotes(selectedQuote);
      return;
    }
    else{
      saveMultipleQuotes(selectedQuote);
    }



  };

  getCoverageClass = covergareTypeId => {
    if (covergareTypeId === 0) {
      return "blank_si";
    }

    return "";
  };

  getCoverageFeature = covergareTypeId => {
    if (covergareTypeId === 0) {
      return (
        <li className="blank_feature">
          {""}
          <span className="tooltip_text">{""}</span>
        </li>
        // null
      );
    }

    if (covergareTypeId === "1") {
      return (
        <li className="si_icon tooltip">
          <span>{"Individual SI: Sum Insured coverage mentioned is per person"}</span>
          {/* <span className="tooltip_text">
              {'Sum Insured Coverage Per Person'}
            </span> */}
        </li>
      );
    }

    if (covergareTypeId === "2") {
      return (
        <li className="floater_icon tooltip">
          <span>{lang.quotesFloaterSI}</span>
          {/* <span className="tooltip_text">
              {'Sum Insured Covers All Members'}
            </span> */}
        </li>
      );
    }
  };

  selectPlanFromSub = ({ planName, SelectedPlan, insurerName, variantID }) => {
    const {
      selectQuote,
      profileType,
      profiles,
      data: { AskDateOfBirth, PlanID },
      saveSingleQuotes,
      saveTravellerDOB,
      DOBPopup
    } = this.props;

    const { showLoader, showSubLoader } = this.state;

    if (showSubLoader || showSubLoader) return;

    if (sessionStorage.getItem("askDob") === undefined) {
    }
    const askDob = sessionStorage.getItem("askDob") === "true";

    const { showTravellerDetailsModal } = this.state;

    const isAskDob = this.askDobRequired(PlanID);

    if (isAskDob && askDob && !DOBPopup) {
      this.setState({
        showTravellerDetailsModal: true
      });
      return;
    }

    if (AskDateOfBirth && askDob && !DOBPopup) {
      this.setState({
        showTravellerDetailsModal: true
      });
      return;
    }
    if (profiles.length === 1 && !showTravellerDetailsModal && !showLoader && !showSubLoader) {
      this.setState({
        showSubLoader: true,
        subPlanId: variantID
      });
      saveSingleQuotes(profileType, SelectedPlan);
      return;
    }
    selectQuote(
      {
        planName,
        SelectedPlan,
        insurerName
      },
      profileType
    );
  };

  handleTravellerDetails = (type = false) => {
    sessionStorage.setItem("askDob", true);
    const { showTravellerDetailsModal } = this.state;
    const { checkDOBPopup } = this.props;
    this.setState({
      showTravellerDetailsModal: !showTravellerDetailsModal,
      showDob: false
    });
    checkDOBPopup(type);
  };

  render() {
    const { open, showLoader, showSubLoader, showTravellerDetailsModal, subPlanId } = this.state;
    const { data } = this.props;
    let {
      insurerName,
      planName,
      planID,
      insurerID,
      sumInsured,
      currencyName,
      brochureURL,
      logoURL,
      currencyID,
      features,
      premiumWithoutTax,
      variantID,
      selectedPlan,
      variantName,

    } = data;
    data.CoverageTypeID = "1";

  
    return (
      <div className={`main_quotes ${this.getCoverageClass(data.CoverageTypeID)}`}>
        <div className="row align-items-center">
          <div className="quote_row_left col-md-2">
            <div className="desktop leftLogo">
              <div className={`Logo ${insurerName}`} />
              {data.sub && data.sub.length ? (
                <p
                  className={open ? "more_plans down_arrow " : " up_plans down_arrow"}
                  onClick={this.handleClick}
                >
                  {`${data.sub.length} ${open ? "Less" : "More"} Plan${
                    data.sub.length > 1 ? "s" : ""
                    }`}
                </p>
              ) : null}
              {/* <img src="images/insurer.png" alt='' /> */}
            </div>
            <div className="mobile">
              <p className="quotes_plan_name">{planName}</p>
              <div className="desktop">
                {brochureURL && (
                  <p className="pay_per">
                    {" "}
                    <a
                      className="pay_per"
                      href={brochureURL}
                      target="_blank"
                      onClick={this.brochureClick}
                    >
                      {lang.quotesProductDetails}
                    </a>
                  </p>
                )}
              </div>
              <ul className="features">
                {/* <li>
                      <label className="container"> 
                        Add to compare
                        <input type="checkbox" />
                        <span className="checkmark" />
                      </label>
                    </li> */}
                {/* {data.CurrencyName === 'EUR' ? 
                     <li>{`Sum Insured : € ${formattedCurrency(data.SumInsured)}`}</li> :
                     <li></li>
                    } */}
                <li></li>
                {this.getCoverageFeature(data.CoverageTypeID)}

                {/* <li className="tooltip">
                      {data.CoverageTypeID === '1' ? 'Sum Insured Coverage Per Person' : 'Floater SI'}
                      <span className="tooltip_text">
                      {data.CoverageTypeID === '1' ? 'Sum Insured Coverage Per Person' : 'Floater SI'}
                      </span>
                    </li> */}
              </ul>
            </div>
            {/* <p class="more_plans up_arrow">{data.sub.length} More Plans</p> */}
          </div>
          <div className="quote_row_wrapper col-md-10">
            <div
              className="quotes_row_shadow"
            // style={{
            //   zIndex: `${
            //     data.sub && data.sub.length > 1 ? (data.sub.length + 1).toString() : "10"
            //   } `
            // }}
            >
              <div className="quote_row_right">
                <div className="row">
                  <div className="col-md-9">
                    <div className="quote_key_features">
                      <div className="mobile">
                        <ul className="features">
                          {/* <li>
                      <label className="container"> 
                        Add to compare
                        <input type="checkbox" />
                        <span className="checkmark" />
                      </label>
                    </li> */}
                          {/* {data.CurrencyName === 'EUR' ? 
                     <li>{`Sum Insured : € ${formattedCurrency(data.SumInsured)}`}</li> :
                     <li></li>
                    } */}
                          <li></li>
                          {this.getCoverageFeature(data.CoverageTypeID)}

                          {/* <li className="tooltip">
                      {data.CoverageTypeID === '1' ? 'Sum Insured Coverage Per Person' : 'Floater SI'}
                      <span className="tooltip_text">
                      {data.CoverageTypeID === '1' ? 'Sum Insured Coverage Per Person' : 'Floater SI'}
                      </span>
                    </li> */}
                        </ul>
                      </div>

                      <ul className="key_features">
                        <li>
                          <p className="quotes_plan_name">{planName}</p>
                          <div className="mobile pay_per">
                            {brochureURL && (
                              <p className="pay_per">
                                {" "}
                                <a
                                  className="pay_per"
                                  href={brochureURL}
                                  target="_blank"
                                  onClick={this.brochureClick}
                                >
                                  {lang.quotesProductDetails}
                                </a>
                              </p>
                            )}
                          </div>
                        </li>
                        <li className="featuresLI">
                          <div className="key_features_wpapper">
                            {(insurerID === 10 || insurerID === 6) && (
                              <span className="claims icon_wrp tooltip">
                                {lang.quotesClaimGuarantee}
                                <span className="tooltip_text">
                                  {
                                    "Guaranteed approval by Insurer on all legitimate claims of PolicyBazaar customers"
                                  }
                                </span>
                              </span>
                            )
                              // <span className="ferures_space">&nbsp;</span>
                            }
                            {data.features.map((e, index) => (

                              <span
                                className={`check_icon icon_wrp ${e.toolTip ? "tooltip" : ""}`}
                                key={`check_icon-${index + 1}`}
                              >
                                {e.name}
                                {e.toolTip && <span className="tooltip_text">{e.toolTip}</span>}
                              </span>
                            ))}
                            <div className="cl" />
                          </div>
                        </li>
                        <li className="col-md-3 cta">
                          <div>
                          {(showLoader &&
                          subPlanId.toString() === variantID.toString()) ? <div className="loading"></div> : (
                              <>
                                <button
                                  onClick={() => this.selectPlan(selectedPlan, variantName, insurerID, insurerName, variantID)}
                                  className={`secondary_button plan${planID}${
                                    showLoader ? "" : ""
                                    }`}
                                >
                                  &#x20B9; {formattedCurrency(premiumWithoutTax)}
                                </button>{" "}
                              </>
                            )}
                          </div>
                        </li>
                      </ul>
                      <div className="cl" />
                    </div>
                    <ul className="features">
                      {/* <li>
                      <label className="container"> 
                        Add to compare
                        <input type="checkbox" />
                        <span className="checkmark" />
                      </label>
                    </li> */}
                      {/* {data.CurrencyName === 'EUR' ? 
                     <li>{`Sum Insured : € ${formattedCurrency(data.SumInsured)}`}</li> :
                     <li></li>
                    } */}
                      <li></li>
                      {this.getCoverageFeature(data.CoverageTypeID)}

                      {/* <li className="tooltip">
                      {data.CoverageTypeID === '1' ? 'Sum Insured Coverage Per Person' : 'Floater SI'}
                      <span className="tooltip_text">
                      {data.CoverageTypeID === '1' ? 'Sum Insured Coverage Per Person' : 'Floater SI'}
                      </span>
                    </li> */}
                    </ul>
                    <div className="cl" />
                  </div>

                  <div className="col-md-3 cta desktop">
                    <div>
                      {(showLoader &&
                          subPlanId.toString() === variantID.toString()) ? <div className="loading"></div> : (
                        <>
                          <button
                            onClick={() => this.selectPlan(selectedPlan, variantName, insurerID, insurerName, variantID)}
                            id={planID}
                            className={`secondary_button plan${planID}${showLoader ? "" : ""}`}
                          >
                            &#x20B9; {formattedCurrency(premiumWithoutTax)}
                          </button>{" "}
                        </>
                      )}

                      <div className="desktop">
                        {brochureURL && (
                          <p className="pay_per">
                            {" "}
                            <a
                              className="pay_per"
                              href={brochureURL}
                              target="_blank"
                              onClick={this.brochureClick}
                            >
                              {lang.quotesProductDetails}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {open && data.sub && data.sub.length ? (
              data.sub.map((element, id) => (
                <div
                  className="quotes_row_shadow"
                  style={{ zIndex: `${data.sub.length - (id + 1)}` }}
                >
                  <div className="quote_row_right">
                    <div className="row">
                      <div className="col-md-9">
                        <div className="quote_key_features">
                          <div className="mobile">
                            <ul className="features">
                              {element.CurrencyName === "EUR" ? (
                                <li>{`Sum Insured : € ${formattedCurrency(
                                  element.SumInsured
                                )}`}</li>
                              ) : (
                                  <li />
                                )}
                              {this.getCoverageFeature(element.CoverageTypeID)}
                              {/* <li className="">
                        {data.CoverageTypeID === '1' ? 'Sum Insured Coverage Per Person' : 'Floater SI'}
                        </li> */}
                            </ul>
                          </div>

                          <ul className="key_features">
                            <li>
                              <p className="quotes_plan_name">{element.planName}</p>
                            </li>
                            <li className="featuresLI">
                              <div className="key_features_wpapper">
                                {(element.insurerID === 10 || element.insurerID === 6) && (
                                  <span className="claims icon_wrp">
                                    {lang.quotesSubClaimGuarantee}
                                    <span className="tooltip_text">
                                      {
                                        "Guaranteed approval by Insurer on all legitimate claims of PolicyBazaar customers"
                                      }
                                    </span>
                                  </span>
                                )
                                  // : (
                                  //   <span className="ferures_space">&nbsp;</span>
                                  // )
                                }
                                {element.features.map((e, index) => (
                                  <span
                                    className={`check_icon icon_wrp ${e.toolTip ? "tooltip" : ""}`}
                                    key={`check_icon-${index + 1}`}
                                  >
                                    {e.name}
                                    {e.toolTip && <span className="tooltip_text">{e.toolTip}</span>}
                                  </span>
                                ))}
                                {/* <span className="check_icon icon_wrp">Adventure Activity</span>
                              <span className="check_icon icon_wrp">Pre Existing Disease</span>
                              <span className="check_icon icon_wrp">Pre Existing Disease</span> */}
                                <div className="cl" />
                              </div>
                            </li>
                            <li className="col-md-3 cta">
                              <div>
                                {showLoader &&
                                  subPlanId.toString() == element.variantID.toString() && (
                                    <div className="loading"></div>
                                  )}
                                {(!showLoader ||
                                  subPlanId.toString() !== element.variantID.toString()) && (
                                    <>
                                      <button
                                        id={element.variantID + "_" + element.planName}
                                        className={`secondary_button plan${element.PlanID}${
                                          showLoader ? "" : ""
                                          }`}
                                        onClick={() => this.selectPlan(element.selectedPlan, element.variantName, element.insurerID, element.insurerName, element.variantID)}

                                      >
                                        &#x20B9; {formattedCurrency(element.premiumWithoutTax)}
                                      </button>{" "}
                                    </>
                                  )}
                              </div>
                            </li>
                          </ul>
                          <div className="cl" />
                        </div>
                        <ul className="features">
                          {element.CurrencyName === "EUR" ? (
                            <li>{`Sum Insured : € ${formattedCurrency(element.SumInsured)}`}</li>
                          ) : (
                              <li />
                            )}
                          {this.getCoverageFeature(element.CoverageTypeID)}
                          {/* <li className="">
                        {data.CoverageTypeID === '1' ? 'Sum Insured Coverage Per Person' : 'Floater SI'}
                        </li> */}
                        </ul>
                        <div className="cl" />
                      </div>
                      <div className="col-md-3 cta desktop">
                        {/* <div className="loading">dfsf</div> */}

                        {showLoader && subPlanId && subPlanId.toString() === element.variantID.toString() && (
                          <div className="loading"></div>
                        )}
                        {(!showLoader ||
                          subPlanId.toString() !== element.variantID.toString()) && (
                            <>
                              <button
                                id={element.variantID + "_" + element.planName}
                                className={`secondary_button  ${showLoader ? " " : ""}`}
                                onClick={() => this.selectPlan(element.selectedPlan, element.variantName, element.insurerID, element.insurerName, element.variantID)}

                              >
                                &#x20B9; {formattedCurrency(element.premiumWithoutTax)}
                              </button>{" "}
                            </>
                          )}

                        {/* <button 
                        className={`secondary_button  ${showLoader ? ' loading': ""}`}
                        onClick={() =>this.selectPlanFromSub(element)}
                      >
                        &#x20B9; {formattedCurrency(element.PremiumWithoutTax)}
                      </button>{" "} */}
                        {/*eslint-disable-line*/}
                        <div className="cl"></div>
                        <div className="desktop">
                          {element.brochureURL && (
                            <p className="pay_per">
                              {" "}
                              <a
                                href={element.brochureURL}
                                target="_blank"
                                onClick={this.brochureClick}
                              >
                                {lang.quotesProductDetails}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
                <></>
              )}
            {showTravellerDetailsModal && (
              <TravellerDetails
                close={this.handleTravellerDetails}
                saveUpdatedData={this.props.saveUpdatedData}
              />
            )}
            <div className="cl"></div>
          </div>
        </div>
        {data.sub && data.sub.length ? (
          <a
            className={
              open
                ? "btn btn-ouline-secondary moreQuotes more_plans down_arrow "
                : "btn btn-ouline-secondary moreQuotes up_plans down_arrow"
            }
            onClick={this.handleClick}
          >
            {`${data.sub.length} ${open ? "Less" : "More"} Plan${data.sub.length > 1 ? "s" : ""}`}
          </a>
        ) : null}

        {/* <a href="javascript:void(0)" className="btn btn-ouline-secondary moreQuotes">
          3 More Plans
        </a> */}
      </div>
    );
  }
}

QuotesCard.propTypes = {
  data: PropTypes.instanceOf(Object).isRequired,
  selectQuote: PropTypes.func.isRequired,
  saveSingleQuotes: PropTypes.func.isRequired,
  profiles: PropTypes.instanceOf(Array).isRequired,
  profileType: PropTypes.string.isRequired
};

const mapStateTOProps = state => ({
  saveTravellerDOB: state.saveTravellerDOB,
  travellerData: state.travellerData
});

export default connect(mapStateTOProps, {})(QuotesCard);
