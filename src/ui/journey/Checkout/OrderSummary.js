import React, { Component } from "react";
import Cookies from "js-cookie";
import "./styles/orderSummary.css";
import { Redirect } from "react-router-dom";
import { getInsurerProposal } from "../../../services/checkout";
import { formattedCurrency } from "../../../utils/helper";
import Toast from "../../components/Toast/Toast";
import { customEvent } from "../../../GA/gaEvents";
import { lang } from "../../../cms/i18n/en/index";

class OrderSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: props.orders,
      orderId: props.orderID,
      proposerId: props.proposerId,
      errorMessage: "",
      toast: "hide",
      

    };
  }

  static getDerivedStateFromProps = (props, state) => {
    if (props.proposerId !== state.proposerId) {
      return {
        proposerId: props.proposerId
      };
    }
  };

  closeToast = () => {
    this.setState({ toast: "hide" });
  };

  proceedPayment = async () => {
    const { proposerId } = this.state;
    const { encryptedProposerId } = this.props;
    const body = {
      proposerId,
      encryptedProposerId
    };
    this.gaCustomEvent();
    this.setState({ showLoader: true });
    // this.setState({ payementSent: true });
    const res = await getInsurerProposal(body);
    this.setState({ showLoader: false });

    let error = false;
    let errorMessage = "";

    if(!res.length) {
      error= true;
    }
    
    await res.forEach(element => {
      if (error) return;
      if (element.hasError) {
        error = true;
        errorMessage = lang.technicalIssue;
        this.setState({ errorMessage, toast: "show" });
        setTimeout(() => this.closeToast(), 3000);
      }
    });

    if (!error)
      window.location.href = `https://travelcheckoutdev.policybazaar.com/paymentrequest.aspx?ProposerID=${encryptedProposerId}&Environment=DEV`;
  };

  renderPaymentCard = () => {
    const { orders, orderId, payementSent, showLoader } = this.state;
    return (
      <div class="card checkout_rightl_list">
        <div class="checkout_header">
		{lang.order_number}: {orderId}
          {/* <sapn>
            <i class="arrow up"></i>
            <i class="arrow down"></i>
          </sapn> */}
        </div>
        <div class="checkout_right_box">
          <ul>
            <li>
              <label for="">{lang.plan_premium} </label>
              <span>₹{formattedCurrency(orders[0].premium)}</span>
            </li>
            {/* <li>
              <label>{`Add on Premium `}</label>
              <span>₹{orders[0].addOnPremium}</span>
            </li> */}
            <li>
              <label>{lang.tax} </label>
              <span>₹{formattedCurrency(orders[0].serviceTax)}</span>
            </li>
            <li class="total_premium">
              <label>{lang.total_premium}</label>
              <span>₹{formattedCurrency(orders[0].totalPremium)}</span>
            </li>
          </ul>
          <div class="checkout_button_wrp">
            {showLoader ? (
              <div className=" checkout_button loading"></div>
            ) : (
                <button class="checkout_button" onClick={this.proceedPayment}>
                  Pay Now
                </button>
              )}
          </div>
        </div>
      </div>
    );
  };

  renderPaymentGroup = () => {
    const { orders, orderId, errorMessage, toast, showLoader } = this.state;
    return (
      <div class="checkout_rightl_list checkout_rightl_group">
        <div class="checkout_header">
          Order Number: {orderId}
          {/* <sapn>
            <i class="arrow up"></i>
            <i class="arrow down"></i>
          </sapn> */}
        </div>
        {orders.map(order => {
          return (
            <div class="checkout_right_box">
              <ul>
                <li>
                  <label for="">{lang.plan_premium} </label>
                  <span>₹{order.premium}</span>
                </li>
                {/* <li>
                  <label>{`Add on Premium `}</label>
                  <span>₹{order.addOnPremium}</span>
                </li> */}
                <li>
                  <label>{lang.tax} </label>
                  <span>₹{order.serviceTax}</span>
                </li>
                <li class="total_premium">
                  <label>{lang.total_premium}</label>
                  <span>₹{order.totalPremium}</span>
                </li>
              </ul>
              <div class="checkout_button_wrp">
                {showLoader ? (
                  <div className="checkout_button loading"></div>
                ) : (
                    <button class="checkout_button" onClick={this.proceedPayment}>
                      Pay Now
                    </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  gaCustomEvent = () => {
    let cookie = Cookies.get("TravelCjCookie");
    cookie = cookie ? JSON.parse(cookie) : { flowName: "Trv.Direct" };
    const gaData = {
      eventCategory: "Trv.BU Checkout",
      eventAction: "Trv.click",
      eventLabel: "Trv.Pay Now",
      eventValue: "",
      flowName: cookie.flowName
    };
    customEvent(gaData);
  };

  render() {
    const { orders, payementSent, errorMessage, toast } = this.state;
    return (
      <>
        {payementSent ? (
          <Redirect to="/v2/paymentRequest" />
        ) : (
            <div>
              {orders.length === 1 ? this.renderPaymentCard() : this.renderPaymentGroup()}
              <Toast toastText={errorMessage} additionalClass={toast} handleClose={this.closeToast} />
            </div>
          )}
      </>
    );
  }
}

export default OrderSummary;
