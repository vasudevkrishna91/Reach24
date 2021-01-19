import React, { Component } from "react";

import "./styles/mobileModal.css";
import { withStyles } from "@material-ui/core/styles";

import { connect } from "react-redux";
import {
  onUpdateMobileNumber,
  onUpdateMobileCountryCode,
  onUpdateTimeZone,
  onSelectField
} from "../../../store/actions/preQuoteActions";
// import Select from "../../components/Select/Select";\
import { Select, MenuItem } from "@material-ui/core";

import { default as diallingCodes } from "../../../lib/diallingCodes.json";

const styles = theme => ({
  root: {
    // top: '153px !important',
    marginTop: "Opx"
  },
  // root: {
  //   width: 28,
  //   height: 16,
  //   padding: 0,
  //   display: 'flex',
  // },
  // switchBase: {
  //   padding: 2,
  //   color: '#ffffff',
  //   '&$checked': {
  //     transform: 'translateX(12px)',
  //     color: theme.palette.common.white,
  //     '& + $track': {
  //       opacity: 1,
  //       backgroundColor: '#0065ff',
  //       // borderColor: theme.palette.primary.main,
  //     },
  //   },
  // },
  // thumb: {
  //   width: 12,
  //   height: 12,
  //   boxShadow: 'none',
  // },
  // track: {
  //   // border: `1px solid ${theme.palette.grey[500]}`,
  //   borderRadius: 16 / 2,
  //   opacity: 1,
  //   backgroundColor: '#b3bac5',
  // },
  // checked: {},
  // focusVisible: {}
  scrollTransition: {
    scrollBehavior: "smooth"
  }
});

class MobileModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobile: props.mobileNo ? props.mobileNo : "",
      mobileCode: props.countryCode,
      timeZoneValue: props.timezone,
      alert: !props.validMobileNo && props.mobileNo && props.mobileNo.length === 10,
      error: props.validMobileNo ? "" : "Please enter valid Mobile no."
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const ele = document.querySelector('[tabindex="mobile_input_field"]');
    ele.focus();
  }

  componentDidUpdate(nextProps) {
    const { hideSelectBoxes } = this.props;
    if (nextProps.hideSelectBoxes !== hideSelectBoxes) {
      this.setState({
        showMobileDropDown: false,
        showTimeZoneDropdown: false
      });
    }
  }

  handleMobileNumber = e => {
    const { onUpdateMobileNumber, onSelectField } = this.props;
    const { mobileCode } = this.state;
    const mobileNo = e.target.value.replace(/[^\d]/g, "");
    let error = "";
    if (mobileNo.length !== 10) {
      error = "Please enter 10 digit Mobile no.";
    } else if (
      mobileNo.charAt(0) !== "8" &&
      mobileNo.charAt(0) !== "9" &&
      mobileNo.charAt(0) !== "7" &&
      mobileNo.charAt(0) !== "6" &&
      mobileCode === "91"
    ) {
      error = "Please enter valid Mobile no.";
    }

    const valid = error === "";
    const showTimeZoneDropdown = valid && mobileNo.length === 10 && true;
    this.setState(
      {
        mobile: mobileNo,
        error,
        alert: error !== "" && mobileNo.length === 10,
        showTimeZoneDropdown,
        showMobileDropDown: false
      },
      () => {
        onUpdateMobileNumber({ mobileNo, valid });
        showTimeZoneDropdown && onSelectField("timeZone");
      }
    );
  };

  transformDataForSelect = dummyData => {
    const transformedData = dummyData["Final Countries"].map(item => {
      return {
        label: item.CountryName,
        secondaryText: `+${item.CountryDialingCode}`
      };
    });

    return transformedData;
  };

  handleSelectMobileCode = value => {
    const { onUpdateMobileCountryCode } = this.props;

    // const { onUpdateMobileNumber, onSelectField } = this.props;
    const { mobile } = this.state;
    // const mobileNo = e.target.value.replace(/[^\d]/g, "");
    let error = "";
    if (mobile.length !== 10) {
      error = "Please enter 10 digit Mobile no.";
    } else if (
      mobile.charAt(0) !== "8" &&
      mobile.charAt(0) !== "9" &&
      mobile.charAt(0) !== "7" &&
      mobile.charAt(0) !== "6" &&
      value === "91"
    ) {
      error = "Please enter valid Mobile no.";
    }

    const valid = error === "";
    // const showTimeZoneDropdown = valid && mobileNo.length === 10 && true;
    this.setState(
      {
        error,
        alert: error !== "" && mobile.length === 10,
        mobileCode: value,
        showMobileDropDown: false
      },
      () => {
        onUpdateMobileNumber({ mobile, valid });
        onUpdateMobileCountryCode({ countryCode: value, valid });
      }
    );
  };

  hanldeZoneSelect = value => {
    const { onUpdateTimeZone } = this.props;

    this.setState(
      {
        timeZoneValue: value,
        showTimeZoneDropdown: false
      },
      () => onUpdateTimeZone({ timezone: value })
    );
  };

  handleTimeZoneToggle = value => {
    const { showMobileDropDown } = this.state;
    this.setState(
      {
        showTimeZoneDropdown: value,
        showMobileDropDown: value ? false : showMobileDropDown
      },
      () => {
        value && this.props.onSelectField("timeZone");
      }
    );
  };

  handleFocusOnMobile = () => {
    this.props.onSelectField("mobileNumber");
    this.setState({ showTimeZoneDropdown: false });
  };

  handleMobileCodeToggle = value => {
    this.setState({
      showMobileDropDown: value
    });
  };

  renderMobileCodesOptions = () => {
    const data = diallingCodes["Final Countries"];
    const { mobileCode } = this.state;
    const { classes } = this.props;

    return data.map((item, id) => {
      return (
        <MenuItem
          value={item.CountryDialingCode}
          // classes={classes.scrollTransition}
          // MenuProps={{ classes: { paper: classes.scrollTransition }}}
        >
          <span>{item.CountryName}</span>
          <span>{`+${item.CountryDialingCode}`}</span>
        </MenuItem>
      );
    });
  };

  handleKeyPress = e => {
    if (e.key === "Enter") {
      this.props.handleGetQuote();
      return;
    }
  };

  render() {
    const {
      mobile,
      error,
      alert,
      mobileCode,
      showMobileDropDown,
      timeZoneValue,
      showTimeZoneDropdown
    } = this.state;

    const { currentField, classes } = this.props;

    return (
      <div className="row bg-white justify-content-center align-items-center">
        <div className="col-md-2 col-3">
          <div className="back_button" onClick={this.props.hideMobileField}>
            <button class="back_button_tab" tabIndex="mobile_back_button">
              Back
            </button>
          </div>
        </div>
        <div className="col-md-10 col-9">
          <div className="row">
            <div className="lead_text col-md-5 col-12">
              You are just
              <span style={{ width: "100%" }}> one step away</span>
            </div>

            <div className="col-md-7 col-12" onClick={this.handleFocusOnMobile}>
              <label className={currentField === "mobileNumber" ? "tab_active" : null}>
                <div className={currentField === "mobileNumber" ? "tab_active_border" : null}></div>
                Mobile Number
              </label>
              <div className="mobile_wrapper">
                <Select
                  className="mobile_prefix"
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={mobileCode}
                  onChange={e => this.handleSelectMobileCode(e.target.value)}
                  classes={{
                    root: classes.root,
                    selectMenu: classes.root
                    // switchBase: classes.switchBase,
                    // thumb: classes.thumb,
                    // track: classes.track,
                    // checked: classes.checked,
                  }}
                  MenuProps={{ classes: { paper: classes.root } }}
                  renderValue={selected => <div>{`+${mobileCode}`}</div>}
                >
                  {this.renderMobileCodesOptions()}
                </Select>
                {/* <select
            // placeholder="24 yrs"
            // id={id}
            // tabIndex={"traveller_"+id.toString()}
            // className={error && !_.isNil(travellerError[id]) && travellerError[id].hasOwnProperty('age') ? 'traveler_error':''}
            value={mobileCode}
            name="CountryCode"
            onSelect={(e) => this.handleSelectMobileCode(e.target.value)}
            onChange={(e) => this.handleSelectMobileCode(e.target.value)}
          >
            {/* <option disabled selected value>{lang.age}</option> */}
                {/* {this.renderMobileCodesOptions()}
          </select>  */}
                {/* <Select
            items={this.transformDataForSelect(diallingCodes)}
            showSecondaryText={true}
            defaultValue='India'
            valueDisplayText={mobileCode}
            value={mobileCode}
            placeHolder="select"
            className="mobie_select_field"
            onSelect={this.handleSelectMobileCode}
            showDropDownModel={showMobileDropDown}
            updateShowDropDownModel={this.handleMobileCodeToggle}
          /> */}

                <div className="lead_mobile">
                  <input
                    type="tel"
                    tabIndex="mobile_input_field"
                    maxLength="10"
                    value={mobile ? mobile : ""}
                    name="Mobile"
                    onKeyDown={this.handleKeyPress}
                    onChange={e => this.handleMobileNumber(e)}
                    autoComplete="off"
                    onKeyDown={this.handleKeyPress}
                    placeholder="Enter mobile number"
                  />
                  {alert && <div className="mobile_error">{error}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="col-md-3">
          <label className={currentField ==='timeZone' ? "tab_active" : null} style={{ width: "100%" }}>
            <div className={currentField ==='timeZone' ? "tab_active_border" : null} ></div>
            Timezone
          </label>
          <Select
            items={TimeZoneDummyData}
            showSecondaryText={false}
            placeHolder="select"
            valueDisplayText={timeZoneValue}
            value={timeZoneValue}
            onSelect={this.hanldeZoneSelect}
            showDropDownModel={showTimeZoneDropdown}
            updateShowDropDownModel={this.handleTimeZoneToggle}
          />
        </div> */}
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
    onUpdateMobileCountryCode: data => dispatch(onUpdateMobileCountryCode(data)),
    onUpdateTimeZone: data => dispatch(onUpdateTimeZone(data)),
    onSelectField: data => dispatch(onSelectField(data))
  };
};

export default connect(
  mapCountryStateToProps,
  mapCountryDispatchToProps
)(withStyles(styles)(MobileModal));
