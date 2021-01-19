import React, { Component } from "react";
import * as _ from "lodash";
import Moment from "moment";
import { extendMoment } from "moment-range";
import { connect } from "react-redux";
import Cookies from "js-cookie";
import { loadThanks, feedbackApi } from "../../../services/thanks";
import Header from "../../components/static/header";
import Footer from "../../components/static/footer";
import playStore from "../../../assets/images/playstore.png";
import appStore from "../../../assets/images/appstore.png";
import Awesome from "../../../assets/images/em1.png";
import JustOkay from "../../../assets/images/em2.png";
import NotGood from "../../../assets/images/em3.png";
import { customEvent, onPageLoad } from "../../../GA/gaEvents";
import { lang } from "../../../cms/i18n/en/index";

import "./styles/thankyou.css";
const moment = extendMoment(Moment);

class Thanks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      policy: [],
      payment: [],
      basic: "",
      feedSuccess: false,
      gaFlowName: ""
    };
  }

  hideSeo = () => {
    document.querySelector(".tttttt h1").setAttribute("style", "font-size:0");
    var seoTxt = document.querySelector(".tttttt");
    seoTxt.setAttribute("style", "font-size: 0");
  };

  componentDidMount = async () => {
    onPageLoad("Trv.Thankyou", "Trv.BU Thankyou");
    localStorage.removeItem('getQuote')
    this.loadThanksFunc();
    setTimeout(() => this.hideSeo(), 100);
    localStorage.clear();
    let cookie = Cookies.get("TravelCjCookie");
    cookie = cookie ? JSON.parse(cookie) : { flowName: "Trv.Direct" };
    this.setState({
      gaFlowName: cookie.flowName
    });
  };

  feedback = id => {
    let proposerID = null;
    const { location, match } = this.props;
    if (location && location.state) {
      proposerID = location.state.proposerID;
    } else {
      const { proposerId } = match.params;
      proposerID = proposerId;
    }

    let payload = {
      proposerID: proposerID,
      expTypeId: id
    };
    const response = feedbackApi(payload);
    if (response) {
      if (id === 1) {
        this.gaCustomEvent("Trv.Feedback_Awesome");
      } else if (id === 2) {
        this.gaCustomEvent("Trv.Feedback_JustOkay");
      } else if (id === 3) {
        this.gaCustomEvent("Trv.Feedback_NotGood");
      }
    }
    this.setState({
      feedSuccess: true
    });
  };

  loadThanksFunc = async () => {
    // const {encryptedProposerId } = this.props;
    const { location, match, history, proposerId } = this.props;
    let encryptedProposerId = this.props.encryptedProposerId;
    
    // if (location && location.state) {
    //   console.log('LOCATION -----', location);
    //   encryptedProposerId = location.state.encryptedProposerId;
      
    // } else
    if(match && match.params && 
      match.params.encryptedProposerId 
      && match.params.encryptedProposerId !== encryptedProposerId){
        // const { encryptedProposerId } = match.params;
       encryptedProposerId = match.params.encryptedProposerId;
    }



    if (!encryptedProposerId) {
      history.push({
        pathname: `/v2/`
      });
    } else {
      let payload = {
        proposerID: proposerId,
        encryptedProposerId
      };
      const response = await loadThanks(payload);

      if(response.errorCode === 6) {
        this.props.history.push(`/v2/checkout/${this.state.encryptedProposerId}`);
      }

      this.setState({
        basic: response,
        policy: response.policies,
        payment: response.payments,
        customer: response.customerDetails
      });
    }
  };

  renderPaymentDetails = data => {
    const { payment } = this.state;
    return (
      <>
        {payment.map(payDetail => (
          <div class="row paymnet_succsess descripton">
            <div className="form-group col-md-4 col-6">
              <label>{lang.amount}</label>
              <span>₹ {`${payDetail.insurerPremium}`}</span>
            </div>
            <div className="form-group col-md-4 col-6">
              <label>{lang.payment_reference_id} </label>
              <span>{`${payDetail.pgRefNo}`}</span>
            </div>
            <div className="form-group col-md-4 col-6">
              <label>{lang.order_number}</label>
              <span>{`${payDetail.transactionNo}`}</span>
            </div>
          </div>
        ))}
      </>
    );
  };

  renderTripDetails = data => {
    const { basic } = this.state;
    return (
      <>
        <div className="row thankyou_trip_details descripton">
          <div className="form-group col-md-3 col-6">
            <label>{lang.destinations}</label>
            <span>{`${basic.destinations}`}</span>
          </div>
          <div className="form-group col-md-3 col-6">
            <label>{lang.travellers}</label>
            <span>{`${basic.noOfTravellers}`} Member(s)</span>
          </div>
          <div className="form-group col-md-3 col-6">
            <label>{lang.travel_start_date}</label>
            <span>{`${moment(basic.tripStartDate).format("DD-MMM-YYYY")}`}</span>
          </div>
          <div className="form-group col-md-3 col-6">
            <label>{lang.travel_end_date}</label>
            <span>{`${moment(basic.tripEndDate).format("DD-MMM-YYYY")}`}</span>
          </div>
        </div>
      </>
    );
  };
  renderCustomerDetails = data => {};

  renderPolicies = data => {
    const { policy, customer } = this.state;
    return (
      <>
        {policy &&
          policy.map((policyData, ind) => (
            <div class="checkout_left_inner">
              <div class="checkout_policy_header checkout_booking_header">
                <ul className="booking_header">
                  <li className="li-header">Policy {`${ind + 1}`}</li>
                  <li>
                    <label>{lang.policy_number} :</label> {`${policyData.policyNo}`}
                  </li>
                  <li>
                    <label>{lang.booking_id} :</label> {`${policyData.bookingID}`}
                  </li>
                </ul>
              </div>
              <div class="checkout_left_box">
                <div class="card">
                  <div class="row justify-content-center align-items-center">
                    <div class="col-md-4 col-12 mt-2 text">
                      <div className="thanks_logo">
                        <img className="mb-2" src={`${policyData.smallThumbnailURL}`} />
                      </div>
                      <div className="thanks_plan_name">{`${policyData.planName}`}</div>
                    </div>
                    <div class="col-md-8 col-12">
                      <ul className="thanksyou_list">
                        <div className="row justify-content-center align-items-center mt-2">
                          <div className="col-md-4 col-sm-6 col-6">
                            <label>{lang.sum_insured}</label>
                            <span>${`${policyData.sumInsured}`}</span>
                          </div>
                          <div className="col-md-4 col-sm-6 col-6">
                            <label>{lang.premium}</label>
                            <span>₹{`${policyData.premium}`}</span>
                          </div>
                          <div className="col-md-4 col-sm-12 col-12 text-center">
                            {policyData.policyURL && (
                              <a
                                className="download_policy"
                                style={{ textDecoration: "none" }}
                                href={policyData.policyURL}
                                target="_blank"
                                onClick={this.downloadPolicy}
                              >
                                Download Policy{" "}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="row justify-content-center align-items-center mt-2">
                          <div className="col-md-6 col-sm-6 col-6">
                            <label>{lang.policy_start_date}</label>
                            <span>{`${moment(policyData.policyStartDate).format(
                              "DD-MMM-YY"
                            )}`}</span>
                          </div>
                          <div className="col-md-6 col-sm-6 col-6">
                            <label>{lang.Policy_end_dates}</label>
                            <span>{`${moment(policyData.policyEndDate).format("DD-MMM-YY")}`}</span>
                          </div>
                          {/* <div className="col-md-4 col-sm-12 col-12">
                          {policyData.proposalURL ? (
                            <button className="download_proposal">Download Proposal </button>
                          ) : (
                            <button className="download_proposal">Download Proposal </button>
                          )}
                        </div> */}
                        </div>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="thanks_row">
                  <div class="plan_name_wrapper"></div>
                  <div class="thanks_policy_details"></div>
                </div>
              </div>
              <div className="checkout_policy_header">{lang.insured_details}</div>
              <div class="checkout_left_box">
                {policyData.insuredMembers.map(memData => (
                  <div className="row thanks_customer_details descripton">
                    <div className="form-group col-md-3 col-6">
                      <label>{lang.Name}</label>
                      {`${memData.fullName}`}
                    </div>
                    <div className="form-group col-md-3 col-6">
                      <label>{lang.gender}</label>
                      {`${memData.gender}`}
                    </div>
                    <div className="form-group col-md-3 col-6">
                      <label>{lang.dob} </label>
                      {`${moment(memData.dateOfBirth).format("D MMM' YY")}`}
                    </div>
                    <div className="form-group col-md-3 col-6">
                      <label>{lang.passport}</label>
                      {`${memData.passportNo}`}
                    </div>
                  </div>
                ))}
              </div>
              {/* <div className="checkout_policy_header">Contact Details</div>
            <div className="checkout_left_box checkout_contact_details">           
              <ul>
                <li>{`${customer.fullName}`}</li>
                <li>{`${customer.mobileNo}`}</li>
                <li>{`${customer.emailID}`}</li>
              </ul>
            </div> */}
            </div>
          ))}
        {customer && (
          <div class="checkout_left_inner">
            <div className="checkout_policy_header checkout_booking_header">{lang.contact_details}</div>
            <div className="checkout_left_box checkout_contact_details">
              <ul>
                <li>{`${customer.fullName}`}</li>
                <li>{`${customer.mobileNo}`}</li>
                <li>{`${customer.emailID}`}</li>
              </ul>
            </div>
          </div>
        )}
      </>
    );
  };

  renderFeedback = data => {
    return (
      <>
        <div className="socal_media_head">{lang.experience}</div>
        {!this.state.feedSuccess ? (
          <div className="socal_icon">
            <ul class="feedback">
              <li>
                <img
                  src={Awesome}
                  alt="Awesome"
                  style={{ cursor: "pointer" }}
                  onClick={() => this.feedback(1)}
                />
                <span>{lang.awesome}</span>
              </li>
              <li>
                <img
                  src={JustOkay}
                  alt="JustOkay"
                  onClick={() => this.feedback(2)}
                  style={{ cursor: "pointer" }}
                />

                <span>{lang.just_okay}</span>
              </li>
              <li>
                <img
                  src={NotGood}
                  alt="NotGood"
                  onClick={() => this.feedback(3)}
                  style={{ cursor: "pointer" }}
                />

                <span>{lang.not_good}</span>
              </li>
            </ul>
            {/* <div className="socal_Awesome">
              <span onClick={() => this.feedback(1)}></span>
              <p>Awesome</p>
            </div>
            <div className="socal_good">
              <span onClick={() => this.feedback(2)}></span>
              <p>Just Okay</p>
            </div>
            <div className="socal_not_googd">
              <span onClick={() => this.feedback(3)}></span>
              <p>Not good</p>
            </div> */}
          </div>
        ) : (
          <div className="socal_icon">{lang.thanks_feedback}</div>
        )}
      </>
    );
  };

  downloadPolicy = () => {
    this.gaCustomEvent("Trv.Download Policy");
  };

  gaCustomEvent = el => {
    const { gaFlowName } = this.state;
    const gaData = {
      eventCategory: "Trv.BU Thankyou",
      eventAction: "Trv.click",
      eventLabel: el,
      eventValue: "",
      flowName: gaFlowName
    };
    customEvent(gaData);
  };

  render() {
    const { customer } = this.state;
    return (
      <div>
        <Header hideChat={true} />

        <div class="thankyou_wrapper container">
          <div className="checkout_banner">
            <h2>Bon voyage!</h2>
            <p>
              Thank you {!customer ? "" : `${customer.fullName}`} for choosing Policybazaar <br />{" "}
              for your travel insurance needs{" "}
            </p>
          </div>
          <div className="row">
            <div className="col-md-8 col-12 thanks-box">
              <div class="checkout_left">
                <div class="checkout_left_inner thanks_panyment_wrp">
                  <div class="checkout_left_box thankyou_left_box">
                    <h3>{lang.payment_status}</h3>
                    <p className="thankyou_sub_headign">
					{lang.payment_sucess_message}
                    </p>
                    {this.renderPaymentDetails()}
                  </div>
                  <div class="checkout_left_box">{this.renderTripDetails()}</div>
                </div>
                {this.renderPolicies()}
                <div className="login_my_account">
                  <div className="login_my_account_inner">
                    <div className="login_policy_header">
                      To raise Queries,Track Booking status,View & Download Policies
                    </div>

                    <div className="login_btn">
                      <a
                        href="https://caccount.policybazaar.com/?utmsource=TravelConfirmationEmail"
                        target="_blank"
                        onClick={() => {
                          this.gaCustomEvent("Trv.Login");
                        }}
                      >
                        <button class="btn btn-primary">{lang.loging_my_account}</button>
                      </a>
                      <span>OR</span>
                      <a href="mailto:travel@policybazaar.com">
                        <button
                          class="btn btn-outline-primary getInBtn"
                          onClick={() => {
                            this.gaCustomEvent("Trv.Get in Touch");
                          }}
                        >
						{lang.get_in_touch}
                        </button>
                      </a>
                      {/* <div className="login_my_account_btn"></div>
                      <div className="login_or"></div>
                      <div className="get_in_tuch">
                        <a href="mailto:travel@policybazaar.com">
                          {" "}
                          <button>GET IN TOUCH WITH US</button>
                        </a>
                      </div> */}
                    </div>
                    <div className="login_content">
                      <p>{lang.keep_track_policy}</p>
                    </div>
                    <div className="link">
                      <a
                        href="https://play.google.com/store/apps/details?id=com.policybazaar"
                        target="blank"
                        onClick={() => {
                          this.gaCustomEvent("Trv.Download App");
                        }}
                      >
					  {lang.download_policybazaar}
                      </a>
                    </div>

                    <div className="app_btn">
                      <a
                        href="https://itunes.apple.com/us/app/policybazaar/id956740142?mt=8"
                        target="blank"
                        onClick={() => {
                          this.gaCustomEvent("Trv.App Store");
                        }}
                      >
                        <img src={appStore} alt="appstore" />
                      </a>
                      <a
                        href="https://play.google.com/store/apps/details?id=com.policybazaar"
                        target="blank"
                        onClick={() => {
                          this.gaCustomEvent("Trv.Google Play");
                        }}
                      >
                        <img src={playStore} alt="Play Store" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-12">
              <div class="checkout_right">
                <div class="card mb-2">
                  <div class="card-body">
                    <h3 class="card-title">{lang.first_content}</h3>
                    <div class="checkout_right_box_inner">
                      <ul>
                        <li>{lang.second_content} </li>
                        <li>{lang.third_content}</li>
                        <li>{lang.fourth_content}</li>
                      </ul>
                      <div class="checkout_right_bottom">
                        <div class="checkout_right_bottom_logo"></div>
                        <a
                          href="https://termlife.policybazaar.com/prequotes?&utm_source=PB_ThankYou_Travel"
                          target="_blank"
                          onClick={() => {
                            this.gaCustomEvent("Trv.View Plan");
                          }}
                        >
                          <div class="checkout_right_bottom_button">{lang.view_plans}</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="checkout_right_box">
                  <h3>{lang.first_content}</h3>
                  <div class="checkout_right_box_inner">
                    <ul>
                       <li>{lang.second_content} </li>
                        <li>{lang.third_content}</li>
                        <li>{lang.fourth_content}</li>
                    </ul>
                    <div class="checkout_right_bottom">
                      <div class="checkout_right_bottom_logo"></div>
                      <a
                        href="https://health.policybazaar.com?utm_source=pb_thankyou&amp;utm_medium=PB_ThankYou_Travel"
                        target="_blank"
                        onClick={() => {
                          this.gaCustomEvent("Trv.View Plan");
                        }}
                      >
                        {" "}
                        <div class="checkout_right_bottom_button">{lang.view_plans}</div>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="socal_media">{this.renderFeedback()}</div>
                {/*<div className="socal_media">
                  <div className="socal_media_head" style={{ marginTop: "20px" }}>
                    Share your experience
                  </div>
                  <span>
                    Share your experience and enter our contest.Win Rs 500 amazon vouchers every
                    month
                  </span>
                  <div className="share_group">
                    <a
                      href="https://www.facebook.com/dialog/feed?app_id=573273822695374&link=https://travelqa.policybazaar.com/&picture=https://travelqa.policybazaar.com/assets/images/pblogoQuote.png&name=Excited%20for%20my%20trip%20to%20USA,%20thanks%20Policybazaar%20for%20helping%20me%20secure%20the%20best%20Travel%20Insurance&caption=travel.policybazaar.com&description=Compare%20International%20Travel%20Insurance%20online%20at%20Policybazaar.%20Buy%20best%20Travel%20Insurance%20plans%20in%20India%20like%20Student%20Travel%20Insurance,%20single%20trip%20and%20annual%20multi%20trip%20insurance%20in%202%20min.&redirect_uri=https://travelqa.policybazaar.com/checkout/closefeeddialog/2342955/&display=popup"
                      target="_blank"
                      onClick={() => {
                        this.gaCustomEvent("Trv.Facebook");
                      }}
                    >
                      {" "}
                      <div className="fb"></div>
                    </a>
                    <a
                      href="https://twitter.com/intent/tweet?url=&text=Excited%20for%20my%20trip%20to%20USA,%20thanks%20@Policybazaar%20for%20helping%20me%20secure%20the%20best%20Travel%20Insurance"
                      target="_blank"
                      onClick={() => {
                        this.gaCustomEvent("Trv.Twitter");
                      }}
                    >
                      {" "}
                      <div className="twitter"></div>
                    </a>
                    <div
                      className="whatsapp"
                      onClick={() => {
                        this.gaCustomEvent("Trv.Whatsapp");
                      }}
                    ></div>
                  </div>
                    </div> */}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }
}

const mapStatetoProps = store => {
  return { 
    store,
    encryptedProposerId: store.encryptedProposerId 
  };
};
const mapDispatchtoProps = dispatch => {
  return {};
};
export default connect(mapStatetoProps, mapDispatchtoProps)(Thanks);
