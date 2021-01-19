import React, { Component } from "react";
import Cookies from "js-cookie";
import PlanCard from "./PlanCard";
import OrderSummary from "./OrderSummary";
import Footer from "../../components/static/footer.js";
import Header from "../../components/static/header.js";
import { getCheckout } from "../../../services/checkout.js";
import EditTravellerModal from "../Quotes/EditModals/EditModal";
import ChatUI from "../../../Chat/Chat";
import "./styles/checkout.css";
import { connect } from "react-redux";
import { customEvent ,onPageLoad} from "../../../GA/gaEvents";
import { lang } from "../../../cms/i18n/en/index";

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkoutData: null,
      showLiveChat: false,
      gaFlowName:''
    };
  }

  hideSeo = () => {
    document.querySelector(".tttttt h1").setAttribute("style", "font-size:0");
    var seoTxt = document.querySelector(".tttttt");
    seoTxt.setAttribute("style", "font-size: 0");
  };

  async componentDidMount() {
    onPageLoad('Trv.Checkout','Trv.BU Checkout');
    let encryptedProposerId = null;
    const { location, match, proposerId: proposerID } = this.props;
    setTimeout(() => this.hideSeo(), 100);
    if (location && location.state) {
      encryptedProposerId = location.state.encryptedProposerId;
    } else {
      const { encryptedProposerId: passedID } = match.params;
      encryptedProposerId = passedID || encryptedProposerId;
    }

    if (encryptedProposerId) {
      const data = {
        ProposerID: proposerID,
        encryptedProposerId
      };

      const res = await getCheckout(data);

      if (!res.hasError) {
        this.setState({ 
          checkoutData: res,
          proposerID,
          enquiryID: this.props.enquiryId,
          encryptedProposerId
        });
      }

   
    }

    let cookie = Cookies.get("TravelCjCookie");
        cookie = cookie ? JSON.parse(cookie) : { flowName: "Trv.Direct" };
      this.setState({
        gaFlowName:cookie.flowName
      });
  }

  redirectToProposal = (requestFrom) => {

    if (requestFrom === "Customer") {
      this.gaCustomEvent("Trv.Customer Edit");
    }
    else if (requestFrom === "Proposer") {
      this.gaCustomEvent("Trv.Proposer Edit");
    }
    else if (requestFrom === "InsuredMember") {
      this.gaCustomEvent("Trv.Insurer Edit");
    }
    const { history, match } = this.props;

    let encryptedProposerId = null;

    const { encryptedProposerId: passedID } = match.params;
    encryptedProposerId = passedID || encryptedProposerId;

    history.push({
      pathname: `/v2/proposalStep2/${encryptedProposerId}`,
      state: {
        encryptedProposerId: encryptedProposerId,
        proposerID: this.props.proposerId
      }
    });
  };

  redirectToThanks = () => {
    const { history, match } = this.props;

    let encryptedProposerId = null;

    const { encryptedProposerId: passedID } = match.params;
    encryptedProposerId = passedID || encryptedProposerId;

    history.push({
      pathname: `/v2/thanks`,
      state: {
        encryptedProposerId, 
        proposerID: this.props.proposerId
      }
    });
  };

  renderDetailBar = () => {
    const { checkoutData } = this.state;

    if (checkoutData) {
      const { customer } = checkoutData;
      return (
        <div className="row">
          <div className="customer_details col-12">
            <div class="card">
              <h2>{lang.customer_details}</h2>
              <ul>
                <li class="customer_list">
                  <label for="">{customer.fullName}</label>
                </li>
                <li class="customer_list">
                  <label for="">{customer.mobileNo}</label>
                </li>
                <li class="customer_list">
                  <label for="">{customer.emailID}</label>
                </li>
                <li class="customer_list">
                  <span class="checkout_edit" onClick={() => this.redirectToProposal("Customer")}>
                    EDIT
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
  };

  handleShowLiveChat = type => {
    this.setState({
      showLiveChat: type
    });
  };

  gaCustomEvent = (el) => {
    const{
gaFlowName
    }=this.state;
    const gaData = {
      eventCategory: "Trv.BU Checkout",
      eventAction: "Trv.click",
      eventLabel: el,
      eventValue: "",
      flowName:gaFlowName
    };
    customEvent(gaData);
  };

  render() {
    const { checkoutData, proposerID, enquiryID, showLiveChat } = this.state;

    
    return (
      <div>
        {/* <h1>Checkout Page</h1> */}
        <Header handleShowLiveChat={this.handleShowLiveChat} />

        <div className="container">
          <div class="checkout_wrapper">
            <EditTravellerModal page="Checkout" {...this.props} />

            {this.renderDetailBar()}
            <div className="row">
              {checkoutData !== null && (
                <PlanCard
                  profiles={checkoutData.profiles}
                  redirectFunction={this.redirectToProposal}
                  {...this.props}
                />
              )}

              <div class="checkout_right col-md-4 col-12">
                {checkoutData !== null && (
                  <OrderSummary
                    orders={checkoutData.orders}
                    orderID={checkoutData.customer.enquiryID}
                    redirectFunc={this.redirectToThanks}
                    proposerId={this.state.proposerID}
                    encryptedProposerId={this.state.encryptedProposerId}
                  />
                )}
                {/* Payment */}
              </div>


            </div>
          </div>
        </div>
        {proposerID && enquiryID && (
          <ChatUI
            proposerID={proposerID}
            enquiryID={enquiryID}
            showLiveChat={showLiveChat}
            handleShowLiveChat={this.handleShowLiveChat}
          />
        )}
        <Footer />
      </div>
    );
  }
}

const mapStatetoProps = state => {
  return {
    enquiryId: state.enquiryId,
    encryptedProposerId: state.encryptedProposerId,
    proposerId: state.proposerId
  };
};

const mapDispatchtoProps = dispatch => {
  return {};
};
export default connect(mapStatetoProps, mapDispatchtoProps)(Checkout);
