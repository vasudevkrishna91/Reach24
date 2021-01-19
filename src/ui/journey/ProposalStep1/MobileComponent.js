import React, { Component } from "react";
import { default as diallingCodes } from "../../../lib/diallingCodes.json";
import {
  onUpdateMobileNumber,
  onUpdateMobileCountryCode,
  onUpdateTimeZone,
  onSelectField
} from "../../../store/actions/preQuoteActions";
import { connect } from "react-redux";
import "../MobileView/CountryCode/style.css";
import "../ProposalStep2/Styles/proposal.css";
import { lang } from "../../../cms/i18n/en/index";

class MobileComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      countryCode: diallingCodes["Final Countries"],
      data: diallingCodes["Final Countries"],
      countryName: props.countryCode
        ? diallingCodes["Final Countries"].filter(
          x => x.CountryDialingCode === props.countryCode
        ).length && diallingCodes["Final Countries"].filter(
          x => x.CountryDialingCode === props.countryCode
        )[0].CountryName
        : "India",

      showCountryCode: false,
      mobile: props.mobileNo ? props.mobileNo : "",
      mobileCode: props.countryCode ? "+" + props.countryCode : "+91",
      timeZoneValue: props.timezone,
      alert: !props.validMobileNo && props.mobileNo && props.mobileNo.length === 10 || props.showMobileError,
      error: props.validMobileNo ? "" : "Please enter valid Mobile no.",
      filterTxt: "",
      load: 0
      // showMobileError: props.showMobileError
    };
  }


  static getDerivedStateFromProps(props, state) { 
    // if(!state.error && props.validMobileNo && !state.load && state.mobile) {
    //   return {
    //     error: "Please enter valid Mobile no.",
    //     alert: true,
    //     load: 1
    //   }
    // }

    // if (state.mobile.length !== 10) {
    //   return {
    //     alert : true,
    //     error : "Please enter valid Mobile no.",
    //   }
    // }
    
    const { mobile } = state;
    if (state.mobile.length === 10 &&(state.mobileCode === "91" || state.mobileCode === "+91")) {
      if (
        mobile.charAt(0) === "6" ||
        mobile.charAt(0) === "7" ||
        mobile.charAt(0) === "8" ||
        mobile.charAt(0) === "9" ||
        mobile.charAt(0) === "*"
      ) return {
        error:  "",
        alert: false
      }
      else  return{
        error: "Please enter valid Mobile no.",
        alert: true
      }
    }

  }

  componentDidMount() {
    const { countryCode, mobileCode } = this.state;

    countryCode.sort((x, y) => {
      if (x.MostPopular === true) {
        return -1;
      } else {
        return 1;
      }
    });

    countryCode.sort((x, y) => {
      if (x.Order < y.Order) {
        return -1;
      } else {
        return 0;
      }
    });

    this.setState({
      countryCode
    });

    const element = document.getElementById("txtCountryCode");
    if (element) {
      element.focus();
    }

    // this.handleSelectMobileCode(mobileCode)
  }

  toggelCountryCodeModel = e => {
    const { showCountryCode } = this.state;

    this.setState({ showCountryCode: !showCountryCode }, this.toggelFocus);
  };

  toggelFocus = () => {
    const { showCountryCode } = this.state;
    // if (showCountryCode !== true) {
    //   document.getElementById("txtCountryCode").blur();
    // } else {
    //   document.getElementById("txtCountryCode").focus();
    // }
  };


  handelSelectedCountry = (name, code) => {

    this.handleSelectMobileCode(code);

    this.setState({
      countryName: name,
      mobileCode: `+${code}`,
      showCountryCode: false
    })

  }

  handleSelectMobileCode = value => {
    const { onUpdateMobileCountryCode, onUpdateMobileNumber } = this.props;
    const { mobile, mobileCode } = this.state;
    let error = "";
    let valid = true;


    if (mobile.length !== 10) {
      valid = false;
      error = "Please enter valid Mobile no.";
    }
    else if (mobile.length === 10 && value === "91") {
      if (
        mobile.charAt(0) === "6" ||
        mobile.charAt(0) === "7" ||
        mobile.charAt(0) === "8" ||
        mobile.charAt(0) === "9" ||
        mobile.charAt(0) === "*"
      ) {
        error = "";
        valid = true;
      }
      else {
        error = "Please enter valid Mobile no.";
        valid = false;
      }
    }



    if (!value) {
      // error="There is some issue in country code";
      valid = false;
    }


    this.setState(
      {
        error,
        alert: error !== "",
        mobileCode: value,

      },
      () => {
        onUpdateMobileCountryCode({ countryCode: value, valid });
        //  onUpdateMobileNumber({ mobile, valid });
      }
    );
  };


  handleMobileNumber = e => {

    let showAlert = false;
    const { onUpdateMobileNumber, onSelectField } = this.props;
    const { mobileCode } = this.state;
    const mobileNo = e.target.value.replace(/[^\d]/g, "");
    let error = "";


    
    if (mobileNo.length !== 10) {
      error = "Please enter 10 digit Mobile no.";
      showAlert = true
    }
    else if (mobileCode === "+91") {
      if (
        mobileNo.charAt(0) === "6" ||
        mobileNo.charAt(0) === "7" ||
        mobileNo.charAt(0) === "8" ||
        mobileNo.charAt(0) === "9" ||
        mobileNo.charAt(0) === "*"
      ) {
        error = "";
      }
      else {
        error = "Please enter valid Mobile no.";
        showAlert = true;
      }

      // {
      //   error = "Please enter valid Mobile no.";
      // }
    }
    const valid = error === "";
    this.setState(
      {
        mobile: mobileNo,
        error,
        alert: mobileNo.length === 10 && showAlert,

      }
      ,
      () => {
        onUpdateMobileNumber({ mobileNo, valid });

      }
    );
  };


  renderMobileCodesOptions = () => {
    const { countryCode } = this.state;
    const data = countryCode;

    if (data != null && data.length > 0) {
      return data.map((item, id) => {
        return (
          <div value={item.CountryDialingCode}>
            <div
              className="dialingCode"
              style={{ marginRight: 10, cursor: "pointer" }}
              onClick={() => this.handelSelectedCountry(item.CountryName, item.CountryDialingCode)}
            >
              {`${item.CountryName} (+${item.CountryDialingCode})`}
            </div>

            {item.Order === 20 && <hr style={{ borderTop: "1px solid #343a40" }} />}
          </div>
        );
      });
    }
  };

  handeltxtCountryCode = e => {
    const { data } = this.state;
    const { onUpdateMobileNumber, mobileNo } = this.props;
    let { filterTxt } = this.state;
    let { value } = e.target;
    value = value.trimLeft();
    if (/^.*  .*$/.test(value)) {
      value = value.replace("  ", " ");
    }
    value = value.replace(/([^a-zA-Z\s]+)/g, "");
    filterTxt = value;

    const filterdCountryCode = data.filter(x => {
      if (x.CountryName.toLowerCase().includes(value.toLowerCase())) {
        return x;
      }
    });

    this.setState({
      showCountryCode: true,
      countryCode: filterdCountryCode,
      filterTxt
    });
  };

  render() {
    const { countryName, showMobileError, mobileCode, mobile, error, alert, showCountryCode, filterTxt } = this.state;
    return (
      <div className="">
        <div className="proposal_step2 container">
          <div className="proposal_details white_box">
            <div className="tellUsMoreAbout">
              <p className="head">{lang.EnterMobileNo}</p>
            </div>
            <div className="custDetailWrap row">
              <div className="country-list-wrapper fieldBlock mb-0">
                <div className="position-relative">
                  <ul className="country-list-view" onClick={e => { this.toggelCountryCodeModel(e); }}>
                    <li className="country-name">
                      <span
                        className="name-country"
                      >
                        {countryName}
                      </span>
                    </li>
                    <li>
                      <span
                      >
                        <i className="fa fa-angle-down"></i>
                      </span>
                    </li>
                  </ul>
                  <div
                    className={showCountryCode ? "show row select-country" : "hide"}
                    style={{ margin: "0" }}
                  >
                    <div className="col-md-12 col-12 search-box">
                      <div className="row">
                        <div className="col-2">
                          <i className="fa fa-search"></i>
                        </div>
                        <div className="col-10" style={{ marginLeft: "-25px" }}>
                          <input
                            type="text"
                            style={{ width: "-webkit-fill-available", border: "0px" }}
                            // autofocus={true}
                            id="txtCountryCode"
                            value={filterTxt}
                            onChange={e => this.handeltxtCountryCode(e)}
                          //  onBlur={() => this.closeCountryCode()} this.setState({showCountryCodeBlurFlag:false})
                          //  onBlur={(e) =>this.toggelCountryCodeModel(e) }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-12 cuntury-view" style={{ height: "200px", overflowY: "scroll" }}>
                      {showCountryCode && this.renderMobileCodesOptions()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="countryCodeWrap"><span className="codeNumber">{mobileCode}</span></div>


              <div className="col-md-4 fieldBlock mb-0">
                <div className={`field ${
                  alert || (!mobile && this.props.showMobileError)
                  ? "error_proposal" : "" }`}
                // className={`field ${errors &&
                //   errors.customerError &&
                //   (!errors.customerError.mobileNoError.valid ? "error_proposal" : "")}`}
                >
                  <input
                    type="text"
                    value={mobile}
                    onChange={e => {
                      this.handleMobileNumber(e);
                    }}
                    onBlur={e => {
                      this.handleSelectMobileCode(mobileCode);
                    }}
                    onClick={() => this.setState({ showCountryCode: false })}
                    maxLength={10}
                    id="txtMobileNo"
                    required
                  />
                  <label for="txtMobileNo">{"Enter Mobile Number"}</label>
                </div>
                  {/* {alert && <div className="mobile_error">{error}</div>} */}
              </div>
            </div>
            <br />
            <p className="desc">
              By clicking on "Submit", you agree to our{" "}
              <a href="http://www.policybazaar.com/legal-and-admin-policies/" target="_blank">
			  {lang.PrivacyPolicy}
              </a>{" "}
              &amp;{" "}
              <a
                href="https://www.policybazaar.com/legal-and-admin-policies/#termsofuse"
                target="_blank"
              >
			  {lang.TermsOfUse}
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

const mapCountryStateToProps = state => {
  return {
    mobileNo: state.mobileNo,
    countryCode: state.countryCode,
    timezone: state.timezone,
    currentField: state.currentField,
    validMobileNo: state.validMobileNo
  };
};
const mapCountryDispatchToProps = dispatch => {
  return {
    onUpdateMobileNumber: data => dispatch(onUpdateMobileNumber(data)),
    onUpdateMobileCountryCode: data => dispatch(onUpdateMobileCountryCode(data))
    //   onUpdateTimeZone: data => dispatch(onUpdateTimeZone(data)),
    //   onSelectField: data => dispatch(onSelectField(data))
  };
};

export default connect(mapCountryStateToProps, mapCountryDispatchToProps)(MobileComponent);
