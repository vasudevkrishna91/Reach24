import React, { Component } from "react";
import { lang } from "../../../cms/i18n/en/index";
import logo from "../../../assets/images/logo.png";

class Footer extends Component {
  renderMainFooter = () => {
    return (
      
      <div className="main_footer know-more">
        <div class="container">
          CIN: U74900HR2014PTC053454 Policybazaar Insurance Brokers Private Limited (formerly known
          as Policybazaar Insurance Web Aggregator Private Limited)
          <br /> Registered Office no. - Plot No.119, Sector - 44, Gurgaon, Haryana – 122001 <br />
          <a
            href="https://www.policybazaar.com/legal-and-admin-policies/#license"
            target="_blank"
            rel="noopener noreferrer"
          >
            IRDAI Web aggregator Registration No. 06 Registration Code No. IRDAI/WBA21/15 Valid till
            13/07/2021
          </a>
          <p>
            Insurance is the subject matter of solicitation. Visitors are hereby informed that their
            information submitted on the website may be shared with insurers.
          </p>
          <p>
            The product information for comparison displayed on this website is of the insurers with
            whom our company has an agreement.
          </p>
          <p>
            Product information is authentic and solely based on the information received from the
            Insurer © Copyright 2008- 2020 policybazaar.com. All Rights Reserved.
          </p>
        </div>
      </div>
      
    );
  };

  render() {
    const { lastScrollPosition, showContent, cms } = this.props;

    if (!showContent) {
      return this.renderMainFooter();
    }

    return (
      <div className={`bottom_header botton_header_add`} id="bottomHeader">
        <div className="stky" style={{ position: lastScrollPosition ? "relative" : "fixed" }}>
          <div className="row row_footer">
            
            <div className="row">
              <div className="col-12 text-left mob-view">
                <h5>Why Policybazaar?</h5>
              </div>
              <div className="col-md-3 col-sm-6 col-12 footer-info">
                <div>
                  <span className="icon_1"></span>
                  <b>{cms.Pointer1}</b>
                  <i>{cms.Pointer1SubText}</i>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-12 footer-info">
                <div>
                  <span className="flight_cancellation"></span>
                  <b>{cms.Pointer2}</b>
                  <i>{cms.Pointer2SubText}</i>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-12 footer-info">
                <div>
                  <span className="ped_text"></span>
                  <b>{cms.Pointer3}</b>
                  <i>{cms.Pointer3SubText}</i>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 col-12 footer-info">
                <div>
                  <span className="quickClaim"></span>
                  <b>{cms.Pointer4}</b>
                  <i>{cms.Pointer4SubText}</i>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className="container text-left">
          <div className="seo_title">
            <h1 style={{ margin: lastScrollPosition ? "" : "30%" }}>
              Know more about Travel Insurance
            </h1>
          </div>
          <div className="seo_body">
            <h6> Travel Insurance</h6>
            <p>
              {`${lang.footerText1} `}
              <a href="https://www.policybazaar.com/travel-insurance/">Travel Insurance</a>
              {` ${lang.footerText2}`}
            </p>
            <p>{lang.footerText4}</p>
            <p>{lang.footerText3}</p>
            <p>{lang.footerText5}</p>
            <p>{lang.footerText6}</p>
          </div>
        </div>
        <div className="cl" />
        {this.renderMainFooter()}
      </div>
    );
  }
}

export default Footer;
