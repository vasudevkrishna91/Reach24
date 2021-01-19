import React, { Component } from "react";

import { Switch } from "@material-ui/core";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";

import Toast from "../../../components/Toast/Toast";
import _ from "lodash";
import { lang } from "../../../../cms/i18n/en";

const styles = theme => ({
  root: {
    width: 28,
    height: 16,
    padding: 0,
    display: "flex"
  },
  switchBase: {
    padding: 2,
    color: "#ffffff",
    "&$checked": {
      transform: "translateX(12px)",
      color: theme.palette.common.white,
      "& + $track": {
        opacity: 1,
        backgroundColor: "#0065ff"
        // borderColor: theme.palette.primary.main,
      }
    }
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: "none"
  },
  track: {
    // border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: "#b3bac5"
  },
  checked: {},
  focusVisible: {}
});

class StudentVisaModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      travellerData: this.transformData(props.travellerData)
    };
  }

  transformData = data => {
    let result = [];
    if (data.length === 1 && data[0].age > 16 && data[0].age < 51) {
      data[0].isStudent = true;
      result = data;
    } else {
      result = data.map(obj => {
        return {
          ...obj,
          isStudent: obj.visaTypeID === 7
        };
      });
    }
    return result;
  };

  handleStudentVisa = (e, id) => {
    debugger;
    const { checked } = e.target;
    const { travellerData } = this.state;
    const traveller = _.cloneDeep(travellerData[id]);
    if (traveller.age > 16 && traveller.age < 50) {
      //this.setState({ showToast: true });
      travellerData[id].isStudent = traveller.isStudent === undefined ? true : !traveller.isStudent;
    }

    this.setState({ travellerData });
  };

  handleOnSubmit = () => {
    const { onApply } = this.props;
    const { travellerData } = this.state;
    onApply(travellerData);
  };

  renderTravellerData = () => {
    const { travellerData } = this.state;
    const { classes } = this.props;

    return (
      <div
        ref={el => {
          this.el = el;
        }}
      >
        {travellerData.map((traveller, id) => {
          return (
            <ul className="student_visa_age">
              <li>
                <label>{`${lang.quotesTraveler} ${id + 1} (${traveller.age} ${
                  lang.quotesYrs
                })`}</label>
              </li>
              <li style={{ width: "0px" }}>{/* <label>{`${traveller.age}`}</label> */}</li>
              <li>
                <span>{lang.quotesStudentVisas}</span>
              </li>
              <li>
                <Switch
                  checked={traveller.isStudent === true}
                  onClick={e => this.handleStudentVisa(e, id)}
                  classes={{
                    root: classes.root,
                    switchBase: classes.switchBase,
                    thumb: classes.thumb,
                    track: classes.track,
                    checked: classes.checked
                  }}
                  color="primary"
                  id={id.toString()}
                />
              </li>
            </ul>
          );
        })}
      </div>
    );
  };

  render() {
    const { onClose } = this.props;
    // const { showToast } = this.state;
    return (
      <div className="overlay">
        <div className="EditTravellerModal">
          <div className="insurer_popup_heading">
            {lang.quotesStudentTravellerInfo} <span className="close" onClick={() => onClose()} />
          </div>
          <p style={{ fontSize: 12 }}>
            Student Visa, Allowed for age group between 16 yrs to 50 yrs.
          </p>

          {/* <p className="student_visa_text">{lang.quotesStudentVisaHader2}</p> */}
          <div class="add_traveller">
            <div
            // className="traveller_scroll"
            // id="#style-3"
            //   ref={this.travellScroll}
            >
              <div class="traveler_header student_visa_scroll">
                <div className="clearfix" />
                {this.renderTravellerData()}
              </div>
            </div>
            {/* <p>Student Visa Cannot Apply on </p> */}

            <button
              onClick={() => onClose()}
              className="clear_all"
              style={{ lineHeight: "20px", marginLeft: "0" }}
            >
              SKIP
            </button>

            <button className="next" onClick={this.handleOnSubmit}>
              {lang.quotesApplyCaps}
            </button>
          </div>
        </div>
        {/* {
          <Toast
            toastText={"Student visa is applicable only for age range 16 to 50"}
            additionalClass={showToast ? "show" : "hide"}
            handelclose={() => {
              this.setState({ showToast: false });
            }}
            text={"studentVisa"}
          />
        } */}
      </div>
    );
  }
}

const mapHomeStateToProps = state => {
  return {
    travellerData: state.travellerData,
    membercount: state.membercount
  };
};

const mapHomeDispatchToProps = dispatch => {
  return {
    //   onUpdateMemberCount: data => dispatch(onUpdateMemberCount(data)),
    //   onUpdateMemberData: data => dispatch(onUpdateMemberData(data)),
    //   defineFamilyAction: data => dispatch(defineFamilyAction(data))
  };
};

export default connect(
  mapHomeStateToProps,
  mapHomeDispatchToProps
)(withStyles(styles)(StudentVisaModal));
