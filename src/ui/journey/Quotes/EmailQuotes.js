import React, { Component } from "react";

import { EmailQuote } from "../../../services/quotes";
import { lang } from "../../../cms/i18n/en";

class EmailQuotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      validEmail: false,
      email: ""
    };
  }

  toggleEmailModal = () => {
    const { showModal } = this.state;
    const { email } = this.props;
    this.setState({
      showModal: !showModal,
      email,
      validEmail: email ? true : false
    });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  onChangeEmail = e => {
    const email = e.target.value;
    const filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    const validEmail = filter.test(email);

    this.setState({
      email,
      validEmail,
      error: ""
    });
  };

  mapQuotesForEmail = quotes => {
    let emailQuotes = [];

    Object.entries(quotes).forEach(entry => {
      let key = entry[0];
      let value = entry[1];

      emailQuotes.push(value);
    });

    return emailQuotes;
  };

  onSubmit = async () => {
    const { email, validEmail } = this.state;
    if (!validEmail) {
      this.setState({ showError: true });
      return;
    }

    const { proposerID, enquiryID, quotes, encryptedProposerId } = this.props;
    const data = {
      EmailID: email,
      CustomerName: null,
      ProfileQuotes: this.mapQuotesForEmail(quotes),
      ProposerID: proposerID,
      EnquiryID: enquiryID,
      encryptedProposerId: encryptedProposerId
    };

    const res = await EmailQuote(data);
    if (res && res.data) {
      this.setState({ sent: true });
    } else {
      this.setState({
        showError: true,
        error: "Something went wrong! Please try after some time"
      });
    }
  };

  render() {
    const { showModal, email, validEmail, showError, sent, error } = this.state;

    return (
      <>
        {showModal ? (
          <div class="overlay">
            <div class="insurer_popup email_quote_wrp">
              <div class="amt_header_popup">
                <b className="amit_heading">{lang.quotesEmailQuotes}</b>
                <span class="close" onClick={this.closeModal}></span>
              </div>
              {!sent ? (
                <>
                  <div class="email_quotes_form">
                    <label>{lang.quotesEmailID}</label>
                    <input
                      type="text"
                      placeholder="Email Id"
                      value={email}
                      onChange={this.onChangeEmail}
                    />
                    {showError && error && <p className="error">{error}</p>}
                    {showError && !error && !validEmail && (
                      <p className="error">{email ? " Invalid Email" : "Please Enter Email"}</p>
                    )}
                    <div className={`insurer_btn`}>
                      <button type="submit" className="clear_all" onClick={this.closeModal}>
                        {lang.quotesSkipButton}
                      </button>
                      <button
                        className={`${
                          showError && !validEmail ? "disable primary_button apply_btn" : "primary_button apply_btn"
                        }`}
                        onClick={this.onSubmit}
                      >
                        {lang.quotesSubmit}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div class="email_quotes_text">
                  <h3> "{lang.quotesEmailThankYou}"</h3>

                  <p>{lang.quotesEmailPS}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
        <div className="right_box_bottom email_quote_fixed" onClick={this.toggleEmailModal}>
          {lang.quotesGetOnEmail}
        </div>
      </>
    );
  }
}

export default EmailQuotes;
