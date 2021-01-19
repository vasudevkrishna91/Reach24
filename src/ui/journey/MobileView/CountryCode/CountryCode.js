import React, { Component } from "react";
import { default as diallingCodes } from "../../../../lib/diallingCodes.json";
import {
  onUpdateMobileNumber,
  onUpdateMobileCountryCode,
  onUpdateTimeZone,
  onSelectField
} from "../../../../store/actions/preQuoteActions";
import { connect } from "react-redux";
import "./style.css";

class CountryCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countryCode: diallingCodes["Final Countries"],
      data: diallingCodes["Final Countries"],
      countryName: props.countryCode ? diallingCodes["Final Countries"].filter(x => x.CountryDialingCode === props.countryCode)[0].CountryName : 'India',

      showCountryCode: false,
      mobile: props.mobileNo ? props.mobileNo : "",
      mobileCode: props.countryCode ? "+" + props.countryCode : "+91",
      timeZoneValue: props.timezone,
      alert: !props.validMobileNo && props.mobileNo && props.mobileNo.length === 10,
      error: props.validMobileNo ? "" : "Please enter valid Mobile no.",
      filterTxt: '',

    }
  }
  
  componentDidMount() {
    const {
      countryCode
    } = this.state;

    countryCode.sort((x, y) => {
      if (x.MostPopular === true) {
        return -1
      }
      else {
        return 1;
      }
    });

    countryCode.sort((x, y) => {
      if (x.Order < y.Order) {
        return -1
      }
      else {
        return 0;
      }
    });

    this.setState({
      countryCode
    })
    const element = document.getElementById("txtCountryCode");
    if (element) {
      element.focus();
    }
  }

  renderMobileCodesOptions = () => {
    const {
      countryCode,
    } = this.state;
    const data = countryCode

    if (data != null && data.length > 0) {
      return data.map((item, id) => {
        return (
          <div
            value={item.CountryDialingCode}
          >
            <div
              className='dialingCode'
              style={{ marginRight: 10, cursor: 'pointer' }}
              onClick={() => this.handelSelectedCountry(item.CountryName, item.CountryDialingCode)}
            >
              {`${item.CountryName} (+${item.CountryDialingCode})`
              }
            </div>

            {item.Order === 20 && <hr style={{ borderTop: '1px solid #343a40' }} />}

          </div>
        );
      });
    }
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
    const { onUpdateMobileCountryCode ,onUpdateMobileNumber} = this.props;
    const { mobile, mobileCode } = this.state;
    let error = "";
    let valid = true;

    if (mobile.length !== 10) {
      valid = false;
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
        valid=true;
      }
      else {
        error = "Please enter valid Mobile no.";
        valid=false;
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



  handeltxtCountryCode = (e) => {
    const {
      data
    } = this.state;
    const { onUpdateMobileNumber ,mobileNo} = this.props;
    let {
      filterTxt
    } = this.state;
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
    })
  }

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

  toggelCountryCodeModel = (e) => {
    
    const {
      showCountryCode,
      
    } = this.state;
    
      this.setState({ showCountryCode:!showCountryCode}, this.toggelFocus)
    
  }

  toggelFocus = () => {
    const {
      showCountryCode
    } = this.state;
    if (showCountryCode !== true) {
      document.getElementById("txtCountryCode").blur()
    }
    else {
      document.getElementById("txtCountryCode").focus()
    }
  }

  closeCountryCode = () => {

    const {
      showCountryCode
    } = this.state;
    if (showCountryCode === true) {
      this.setState({ showCountryCode: false })
    }

  }

  

  render() {
    const { countryName, mobileCode, showCountryCode, mobile, error, alert, filterTxt } = this.state;
    return (<form autocomplete="off">
      <div className="row justify-content-center align-items-center">
        {window.screen.width > 768 && (
          <div className="col-md-2 col-12">
            <div className="back_button" onClick={this.props.hideMobileField}>
              <button class="back_button_tab" tabIndex="mobile_back_button">
                Back
              </button>
            </div>
          </div>
        )}

        <div className="col-md-10 col-12 text-left">
          <div className="row">
            <div className="lead_text col-md-4 col-12">
              You are just <span>One Step Away</span>{" "}
            </div>
            <div className="col-md-8 col-12 mobile-number" style={{ position: "relative"}}>
              <div className="row no-gutters">
                <label class="tab_active">Mobile Number</label>
                <div className="col-10"></div>
                <div className="col-2"></div>
              </div>
              <div className="row no-gutters">
                <div className="col-md-12 col-12">
                  <ul className="country-list-view">
                    <li className='country-name'>
                      <span
                        onClick={(e) => {
                          this.toggelCountryCodeModel(e)
                        }}
                        
                        className="name-country"
                      >
                        {countryName}
                      </span>
                    </li>
                    <li>
                      <span
                        onClick={(e) => {
                          this.toggelCountryCodeModel(e)
                        }}
                      >
                        <i className="fa fa-angle-down"></i>
                      </span>
                    </li>
                    <li>
                      <span className="codeNumber">{mobileCode}</span>
                    </li>
                    <li>
                      <input
                        style={{ border: "0px" }}
                        type="text"
                        value={mobile}
                        onChange={e => {
                          this.handleMobileNumber(e);
                        }}
                        onClick={()=>this.setState({showCountryCode:false})}
                        placeholder="Enter mobile number"
                        maxLength={10}
                        id="txtMobileNo"
                        

                      />
                      {alert && <div className="mobile_error">{error}</div>}
                    </li>
                  </ul>
                </div>
              </div>
              <div
                className={showCountryCode  ? "show row select-country" : "hide"}
                style={{ margin: "0" }}
              >
                <div className="col-md-12 col-12 search-box">
                  <div className="row">
                    <div className="col-2">
                      <i className="fa fa-search"></i>
                    </div>
                    <div className="col-10" style={{marginLeft: '-25px'}}>
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
                <div
                  className="col-12 cuntury-view"
                  style={{ height: "200px", overflowY: "scroll" }}
                >
                  {showCountryCode && this.renderMobileCodesOptions()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </form>);
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
    onUpdateMobileCountryCode: data => dispatch(onUpdateMobileCountryCode(data)),
    //   onUpdateTimeZone: data => dispatch(onUpdateTimeZone(data)),
    //   onSelectField: data => dispatch(onSelectField(data))
  };
};

export default connect(mapCountryStateToProps, mapCountryDispatchToProps)(CountryCode);
