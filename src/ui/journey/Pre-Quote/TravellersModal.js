import React, { Component } from "react";
import { Switch } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { travellerHeaders, travelPurpose, visaType } from "../../../lib/helperData";
import { lang } from "../../../cms/i18n/en/index";
import { OkButton } from "../../components/Button/index";
import _ from "lodash";
import { connect } from "react-redux";

import {
  onUpdateMemberCount,
  onUpdateMemberData,
  defineFamilyAction
} from "../../../store/actions/preQuoteActions";

import "./styles/travellerModal.css";
import { customEvent } from "../../../GA/gaEvents";

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

class TravellersModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      travellerCount: 4,
      travellerData: props.travellerData,
      counter: _.cloneDeep(props.counter),
      loading: false
    };
  }

  travellScroll = React.createRef();

  static getDerivedStateFromProps = (props, state) => {
    const { travellerData: oldTravellerData } = state;
    const { travellerData } = props;
    if (travellerData && !_.isEqual(oldTravellerData, travellerData)) {
      return {
        travellerData
      };
    }
    return null;
  };

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    var elem = document.getElementsByClassName("traveler_header");
    var errorElem = document.getElementsByClassName("traveler_error");
    if (elem[0]) {
      if (errorElem.length) {
        elem[0].scrollTop = errorElem[0].offsetTop;
      } else {
        elem[0].scrollTop = elem[0].scrollHeight;
      }
    }
  }

  handleChangePed = (e, id) => {
    const { checked } = e.target;
    const { travellerData } = this.state;
    const traveller = _.cloneDeep(travellerData[id]);
    travellerData[id].ped = traveller.ped === undefined ? true : !traveller.ped;
    this.setState({ travellerData }, () => this.validTravellerData());
  };

  renderVisaOptions = () => {
    return visaType.map(visa => {
      return <option value={visa.id}>{visa.visaType}</option>;
    });
  };

  renderPurposeOptions = () => {
    return travelPurpose.map(data => {
      return <option value={data.id}>{data.purpose}</option>;
    });
  };

  renderAgeOptions = traveller => {
    let ageOptions = [];

    for (var i = 1; i < 100; i++) {
      ageOptions.push(i);
    }

    return ageOptions.map(age => {
      return (
        <option
          value={age}
          selected={age === traveller.age}
          // id={`Age${25}`}
        >{`${age} yrs`}</option>
      );
    });
  };

  handleAgeSelection = (e, id) => {
    // this.selectAutoScroll(e);
    const { travellerData, travellerError } = this.state;
    const { value } = e.target;
    travellerData[id].age = value;
    if (!_.isEmpty(travellerError) && !_.isNil(travellerError[id])) {
      delete travellerError[id].age;
    }
    this.setState({ travellerData, travellerError }, () => this.validTravellerData());
  };

  handleVisaSelection = e => {
    const { travellerData, travellerError } = this.state;
    const { id, value } = e.target;
    travellerData[id].visaType = value;
    if (!_.isEmpty(travellerError) && !_.isNil(travellerError[id])) {
      delete travellerError[id].visaType;
    }
    this.setState({ travellerData, travellerError }, () => this.validTravellerData());
  };

  handlePurposeSelection = e => {
    const { travellerData, travellerError } = this.state;
    const { id, value } = e.target;
    travellerData[id].purpose = value;
    if (!_.isEmpty(travellerError) && !_.isNil(travellerError[id])) {
      delete travellerError[id].purpose;
    }
    this.setState({ travellerData, travellerError }, () => this.validTravellerData());
  };

  validTravellerData = async () => {
    const { travellerData } = this.state;
    let count = 0;
    await travellerData.forEach(traveller => {
      if (
        traveller.age === null ||
        traveller.age === undefined ||
        traveller.visaType ||
        traveller.purpose
      ) {
        count++;
      }
    });
    this.setState({ travellerCount: count }, () => {
      const families = {
        family1: []
      };
      // this.props.defineFamilyAction(families)
      this.props.onUpdateMemberCount(count);
      this.props.onUpdateMemberData(travellerData);
    });
  };

  handleDeleteTraveller = (traveller, id) => {
    let { travellerData } = this.state;
    if (travellerData.length === 1) return;

    const newTraveller = travellerData.filter((value, index) => {
      return index !== id;
    });

    // travellerData = travellerData.splice(id, 1);
    this.setState({ travellerData: newTraveller }, () => {
      // const families ={
      //   family1: []
      // }
      // this.props.defineFamilyAction(families)
      this.props.onUpdateMemberData(newTraveller);
    });
  };

  // selectAutoScroll = (e, traveller) => {
  //   if(!traveller.age) {

  //     var select = document.getElementById(e.target.id);

  //     var option = select.options[26];
  //     option.selected = true;
  //   }
  // }

  // reselectForAutoScroll = (e, traveller) => {
  //   if(!traveller.age) {

  //     var select = document.getElementById(e.target.id);

  //     var option = select.options[26];
  //     var option2 = select.options[0]

  //     option.selected = false;
  //     option2.selected = true;

  //   }
  // }

  renderTravellerData = () => {
    const { travellerData, travellerError, error } = this.state;
    const { classes } = this.props;

    return (
      <div
        ref={el => {
          this.el = el;
        }}
      >
        {travellerData.map((traveller, id) => {
          return (
            <ul key={`traveller_${id}_${traveller.age}`}>
              <li>
                <label>{`${lang.travller} ${id + 1}`}</label>
              </li>
              <li>
                <select
                  placeholder="24 yrs"
                  id={`Traveller_${id}`}
                  tabIndex={"traveller_" + id.toString()}
                  className={
                    error &&
                    !_.isNil(travellerError[id]) &&
                    travellerError[id].hasOwnProperty("age")
                      ? "traveler_error"
                      : ""
                  }
                  value={
                    traveller.age !== null || traveller.age !== undefined ? traveller.age : true
                  }
                  name="age"
                  onSelect={e => this.handleAgeSelection(e, id)}
                  onChange={e => this.handleAgeSelection(e, id)}
                  // onFocus={(e) => this.selectAutoScroll(e, traveller)}
                  // onClick={(e) => this.reselectForAutoScroll(e, traveller)}
                  // onClick={(e) => this.selectAutoScroll(e)}
                >
                  <option disabled selected value>
                    {lang.age}
                  </option>
                  {this.renderAgeOptions(traveller)}
                </select>
              </li>
              <li>
                <span>{lang.pedText}</span>
              </li>
              <li>
                <Switch
                  checked={traveller.ped === true}
                  onClick={e => this.handleChangePed(e, id)}
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
              <li>
                {travellerData.length > 1 && (
                  <div onClick={() => this.handleDeleteTraveller(traveller, id)} />
                )}
              </li>
            </ul>
          );
        })}
      </div>
    );
  };

  handleAddTraveller = () => {
    const { counter, travellerData } = this.state;
    const newTraveller = {
      TemporaryID: counter + 1,
      InsuredMemberID: 0,
      relationTypeID: 11
    };
    travellerData.push(newTraveller);
    this.setState(
      {
        travellerData,
        counter: counter + 1
      },
      () => this.validTravellerData()
    );
  };

  renderTravellerHeaders = () => {
    return (
      <ul>
        {travellerHeaders.map(name => {
          return <li>{name}</li>;
        })}
      </ul>
    );
  };

  travellerDataValidator = () => {
    const { travellerData } = this.state;
    let error = false,
      emptyTravellers = 0,
      travellerError = {};
    let errorMsg = "";

    travellerData.forEach((traveller, id) => {
      if (traveller) {
        travellerError[id] = {};
        if (traveller.age === null || traveller.age === undefined) {
          error = true;
          travellerError[id].age = true;
        }
      }

      emptyTravellers = _.isEmpty(traveller) ? emptyTravellers + 1 : emptyTravellers;
    });

    error = emptyTravellers === travellerData.length ? true : error;
    errorMsg = emptyTravellers === travellerData.length ? lang.emptyTravellerError : "";
    travellerError = !_.isEmpty(travellerError) ? travellerError : "";

    this.setState({ error, errorMsg, travellerError });

    return error;
  };

  handleOnSubmit = e => {
    const { counter } = this.state;
    const { 
      changeCounter,
      closeModel,
      flowNameGA,
      gaEventCategory
    } = this.props;
    const error = this.travellerDataValidator();
    if (!error) {
      this.setState({ loading: true})
      changeCounter(counter);
      closeModel();
    }
    // !error && this.props.closeModel();

    let { travellerData } = this.state;
    const gaData = {
      eventCategory: gaEventCategory || "Trv.BU Prequotes",
      eventAction: "Trv.Traveller Number",
      eventLabel: travellerData.length,
      eventValue: "",
      flowName: flowNameGA
    };
    customEvent(gaData);

    travellerData.map(val => {

      if(val.age) {
        const trvData = {
          eventCategory: gaEventCategory || "Trv.BU Prequotes",
          eventAction: "Trv.Travellers",
          eventLabel: `Traveller_${val.age}`,
          eventValue: "",
          flowName: flowNameGA
        };
        customEvent(trvData);
      }
    });
  };

  handleKeyPress = e => {
    if (e.key === "Tab") {
      const nextInput = document.querySelectorAll('[tabindex="addMember"]');
      if (e.target === nextInput[0]) {
        const nextInput2 = document.querySelectorAll('[tabindex="traveller_0"]');
        e.preventDefault();
        nextInput2[0].focus();
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = document.querySelectorAll('[tabindex="addMember"]');
      if (e.target === nextInput[0]) {
        this.handleAddTraveller();
      } else {
        this.handleOnSubmit();
      }
    }
  };
  render() {
    const { primaryActionText } = this.props;

    const { loading } = this.state

    return (
      <div class="add_traveller" id="addTraveller" onKeyDown={this.handleKeyPress}>
        <div className="traveller_scroll" id="#style-3" ref={this.travellScroll}>
          <div class="traveler_header">
            <div className="clearfix" />
            {this.renderTravellerData()}
          </div>
        </div>
        <div className="clearfix" />
        <div className="row travllerBttn">
          <div className="col col-12 col-md-6">
            <button
              tabIndex="addMember"
              className="secandry_button add_travller"
              onClick={this.handleAddTraveller}
            >
              {lang.addMoreTravller}
            </button>
          </div>
          <div className="col">
            <div className="nxtBtnFotter">
              {loading ? (
                <button className="next loading"></button>
              ) : (
                <button className="next" onClick={this.handleOnSubmit}>
                {primaryActionText ? primaryActionText : lang.next}
                </button>
              )}
              
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapHomeStateToProps = state => {
  return {
    travellerData: state.travellerData,
    membercount: state.membercount,
    flowNameGA: state.flowName,
  };
};

const mapHomeDispatchToProps = dispatch => {
  return {
    onUpdateMemberCount: data => dispatch(onUpdateMemberCount(data)),
    onUpdateMemberData: data => dispatch(onUpdateMemberData(data)),
    defineFamilyAction: data => dispatch(defineFamilyAction(data))
  };
};

export default connect(
  mapHomeStateToProps,
  mapHomeDispatchToProps
)(withStyles(styles)(TravellersModal));
