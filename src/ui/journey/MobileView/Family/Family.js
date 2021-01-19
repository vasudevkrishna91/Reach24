import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "moment";
import { extendMoment } from "moment-range";
import { connect } from "react-redux";
import * as _ from "lodash";
import { travellers, relationsData } from "./helper";
import { common } from "../Common/common";
import { defineFamilyAction } from "../../../../store/actions/preQuoteActions";
import { getRelationId } from "../../../../utils/helper";
import { lang } from "../../../../cms/i18n/en";
import { validateMember } from "../../../../utils/validation/quotes";
import { customEvent } from "../../../../GA/gaEvents";

import "./style.css";

const moment = extendMoment(Moment);

class Family extends Component {
  constructor(props) {
    super(props);
    this.state = {
      travellerData: _.cloneDeep(props.travellerData),
      families: {
        family1: []
      },
      open: this.props.show,
      addFamilyTo: "",
      hideFamilyModal: this.props.hideFamilyModal
    };
  }

  componentDidMount() {
    let { travellerData } = this.state;
    // let { travellerData ,familyDataCollection} = this.props;
    const { familyDataCollection } = this.props;
    if (Object.keys(familyDataCollection).length > 0) {
      travellerData = common.transformTravellersData(
        familyDataCollection,
        _.cloneDeep(travellerData)
      );
      this.setState({
        travellerData,
        families: _.cloneDeep(familyDataCollection)
      });
    } else {
      const newTravelData = travellerData.map(data => {
        return {
          ...data,
          id: data.labelTraveller ? data.labelTraveller.split(" ")[1] : "",
          name: data.labelTraveller,
          checked: false
        };
      });
      this.setState({
        families: { family1: [] },
        travellerData: newTravelData
      });
    }
  }

  showFamilyComponent = () => {
    const { open } = this.state;
    this.setState({
      open: !open
    });
  };

  defineFamily = async () => {
    const { defineFamilyAction, close, values, destinationsData } = this.props;
    const { families, travellerData, prevTravellerData, hideFamilyModal } = this.state;

    const {
      saveUpdatedData,
      // travellerData: prevTravellerData,
      familyDataCollection: prevFamily
    } = this.props;

    const check = common.defineFamily(this.props, this.state);
    const { alert, data, showFamilyAlert, members } = check;
    // console.log(members);
    if (!alert) {
      this.setState({ loading: true });
      const data = {
        data: {
          members,
          tripCountries: [...destinationsData],
          tripStartDate: moment(values[0]).format("YYYY-MM-DD"),
          tripEndDate: moment(values[1]).format("YYYY-MM-DD")
        },
        actionTypeID: "6"
      };

      const res = await saveUpdatedData(data);

      if (res) {
        this.setState({ loading: false });
      }
      defineFamilyAction(families);

      this.trackCustomGA("Trv.Apply");
      hideFamilyModal();
      // close();
    }
    this.setState({
      alert
      // errors
    });
  };
  addFamilyMember = e => {
    common.addFamilyMember(e, this.state);
    this.trackCustomGA("TTrv.Create more family");
  };
  trackCustomGA = label => {
    common.gaCustomEvent(label, this.props);
  };

  handleCheckbox = (e, id, type = "traveller", key) => {
    const { travellerData, families } = this.state;
    let index = -1;
    if (type === "traveller") {
      index = travellerData.findIndex(traveler => traveler.id === id);
      if (index !== -1) {
        travellerData[index].checked = !travellerData[index].checked;
      }
    } else {
      index = families[key].findIndex(traveler => traveler.id === id);
      if (index !== -1) {
        families[key][index].checked = !families[key][index].checked;
      }
    }
    this.setState({
      travellerData,
      families
    });
  };

  renderTravellers = () => {
    const { travellerData, addFamilyTo } = this.state;

    return (
      <div className="traveller_group">
        <h6>Travellers:</h6>
        <div className="ul">
          {travellerData.map(traveler => {
            const { name, id, checked, age } = traveler;
            return (
              <div className="row li">
                {addFamilyTo && (
                  <div className="col-1 check">
                    <input
                      type="checkbox"
                      onClick={e => this.handleCheckbox(e, id)}
                      checked={checked}
                    />
                  </div>
                )}
                <div className="col-5 fmlyname">
                  {name}
                  <p>Age: {age}yrs</p>
                </div>
                {/* <div className="col-7 selectBox">&nbsp;</div> */}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  renderFamilies = () => {
    const { families, addFamilyTo } = this.state;
    return (
      <div className="family_group">
        {Object.keys(families).map((key, index) => {
          return (
            <div className="family_container">
              <h3>
                {`Family ${index + 1}`}
                {Object.keys(families).length > 1 && (
                  <span className="delete_family" onClick={() => this.deleteFamily(key)}>
                    <i class="fa fa-times" aria-hidden="true"></i>
                  </span>
                )}
              </h3>
              {!_.isEmpty(families[key]) && this.renderFamilyMembers(key)}
              <div className="bttnBox">
                {addFamilyTo !== key ? (
                  <button
                    type="submit"
                    className="btn addFamily"
                    onClick={() => this.addFamilyMembers(key)}
                  >
                    Add Family Member
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn addFamily"
                    onClick={() => this.moveFamily(key)}
                  >
                    Move Here
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  renderFamilyMembers = key => {
    const { families, addFamilyTo, alert } = this.state;
    return (
      <div className="family_traveler">
        {families[key].map((traveler, index) => {
          const { name, id, relationShip, checked, age } = traveler;
          const valid = validateMember(traveler);
          return (
            <div className="row repeatFamily">
              {addFamilyTo && addFamilyTo !== key && (
                <input
                  className="traveler_checkbox"
                  type="checkbox"
                  checked={checked}
                  onClick={e => this.handleCheckbox(e, id, "family", key)}
                />
              )}
              <div className="col-5 fmlyname">
                {name}
                <small>{age}yrs</small>
              </div>
              {/* <div className="col-4 traveler_age">Age: </div> */}
              <div className="col-6 selectBox">
                <select
                  className="form-control"
                  style={{ border: `${alert && !relationShip ? "1px solid red" : ""}` }}
                  value={relationShip ? relationShip : null}
                  onChange={e => this.handleRelationShip(e, key, traveler)}
                >
                  <option disabled selected value>
                    Relation
                  </option>
                  {this.renderRelationOptions(key, traveler)}
                </select>
              </div>

              <i
                class="fa fa-times"
                aria-hidden="true"
                onClick={() => this.deleteTraveler(key, index)}
              ></i>
              {alert && !relationShip ? <div className="group_error">{alert}</div> : null}
              {!alert && valid ? (
                <div className="group_error" style={{ color: "#253858" }}>
                  {valid}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  /*validateMember = data => {
    let alert = "";

    if (
      (data.relationShip === "Father" ||
        data.relationShip === "Mother" ||
        data.relationShip === "Self" ||
        data.relationShip === "Spouse") &&
      data.age < 18
    ) {
      alert = "Age should be between 18 & 99 for adults.";
    } else if (
      data.age < 18 &&
      !(data.relationShip === "Son" || data.relationShip === "Daughter")
    ) {
      alert = "Person can only be son or daughter as per his age";
    } else if (data.age > 18 && (data.relationShip === "Son" || data.relationShip === "Daughter")) {
      alert = "Child more than 18yrs should be a different family group";
    }
    return alert;
  };*/

  renderRelationOptions = (family, selectedData) => {
    const { families } = this.state;
    const familyData = families[family];
    const relations = _.cloneDeep(relationsData);
    familyData.forEach(fa => {
      if (
        fa.relationShip === "Father" ||
        fa.relationShip === "Mother" ||
        fa.relationShip === "Self" ||
        fa.relationShip === "Spouse"
      ) {
        const index = relations.findIndex(re => re.value === fa.relationShip);
        if (index !== -1) {
          relations[index].disabled = true;
        }
      }
    });

    if (selectedData.age < 18) {
      relations.forEach((relation, index) => {
        if (relation.id === 3 || relation.id === 4) {
          relations[index].disabled = false;
        } else {
          relations[index].disabled = true;
        }
      });
    }
    return relations.map(data => {
      return (
        <option value={data.value} disabled={data.disabled}>
          {data.value}
        </option>
      );
    });
  };

  handleRelationShip = (e, key, travellerData) => {
    const { families } = this.state;

    const index = families[key].findIndex(familyData => familyData.id === travellerData.id);
    if (index !== -1) {
      families[key][index].relationShip = e.target.value;
    }

    this.setState({
      families,
      alert: ""
    });
  };

  createFamily = () => {
    const { families, travellerData } = this.state;
    const noOfFamilies = Object.keys(families).length + 1;
    if (noOfFamilies > travellerData.length) return;
    families[`family${noOfFamilies}`] = [];
    this.setState({
      families
    });
    this.trackCustomGA("Trv.Create more family");
  };

  //   createFamily = (e) =>{
  //     e.preventDefault()
  //     let { noOfFamily } = this.state;
  //     const { families,noOfTravellers  } = this.state;
  //     if(Object.keys(families).length <noOfTravellers){
  //         noOfFamily += 1;
  //         families[`family${noOfFamily}`] = []
  //     }
  //     this.setState({
  //         noOfFamily,
  //         families
  //     })
  //   this.trackCustomGA('Trv.Create more family');
  // }

  addFamilyMembers = key => {
    this.setState({
      addFamilyTo: key
    });
  };

  moveFamily = family => {
    let { travellerData, families } = this.state;
    travellerData = travellerData.filter(traveler => {
      const { checked } = traveler;
      if (checked) {
        const obj = {
          ...traveler,
          relationShip: "",
          checked: false
        };
        families[family].push(obj);
      } else {
        return traveler;
      }
    });

    Object.keys(families).forEach(key => {
      families[key] = families[key].filter(traveler => {
        const { checked } = traveler;
        if (checked) {
          const obj = {
            ...traveler,
            relationShip: "",
            checked: false
          };
          families[family].push(obj);
        } else {
          return traveler;
        }
      });
    });
    this.setState(
      {
        families,
        travellerData,
        addFamilyTo: ""
      },
      () => {
        this.showFamilyCheckAlert();
      }
    );
  };

  showFamilyCheckAlert = () => {
    const { families } = this.state;
    let sum = 0;
    Object.keys(families).forEach(key => {
      sum += families[key].length;
    });
    this.setState(
      {
        showFamilyAlert: sum >= 2 ? lang.quotesSeprateAlert : ""
      },
      () => {
        setTimeout(() => {
          this.setState({
            showFamilyAlert: ""
          });
        }, 5000);
      }
    );
  };

  deleteTraveler = (family, index) => {
    const { families, travellerData } = this.state;
    const traveler = families[family][index];
    const obj = {
      ...traveler,
      checked: false,
      relationShip: ""
    };
    travellerData.push(obj);
    delete families[family][index];
    this.setState({
      travellerData,
      families
    });
  };

  deleteFamily = key => {
    const { families, travellerData } = this.state;
    families[key].forEach(traveler => {
      const obj = {
        ...traveler,
        checked: false,
        relationShip: ""
      };
      travellerData.push(obj);
    });
    delete families[key];
    this.setState({
      travellerData,
      families
    });
  };

  hideToast = () => {
    this.setState({
      showFamilyAlert: ""
    });
  };

  removeAllFamilies = () => {
    const { families, travellerData } = this.state;
    let check = false;
    Object.keys(families).forEach(key => {
      if (families[key].length > 0) {
        check = true;
      }
    });
    if (!check) {
      this.defineFamily();
      return;
    }
    Object.keys(families).forEach(keys => {
      families[keys] &&
        families[keys].forEach(familyData => {
          const { InsuredMemberID, TemporaryID, age, id, name, ped } = familyData;
          const obj = {
            InsuredMemberID,
            TemporaryID,
            age,
            id,
            name,
            ped
          };
          travellerData.push(obj);
        });
    });
    const family = {
      family1: []
    };

    this.setState(
      {
        families: family,
        travellerData
      },
      () => {
        this.defineFamily();
      }
    );
  };

  render() {
    const { travellerData, open, showFamilyAlert, hideFamilyModal } = this.state;

    return (
      <>
        {open && (
          <div style={{ overflowY: "scroll" }} className="overlay">
            <div className="modal-dialog insurer_popup si_popup familymodal">
              <div className="modal-content">
                <div className="modal-header ">
                  Travelling With Family?
                  <span className="close" onClick={() => hideFamilyModal()} />
                </div>
                <div className="modal-body">
                  {!_.isEmpty(travellerData) && this.renderTravellers()}
                  {this.renderFamilies()}

                  <div className="btnDiv">
                    <button type="submit" className="btn create-family" onClick={this.createFamily}>
                      Create more family group
                    </button>

                    <button
                      type="submit"
                      onClick={this.removeAllFamilies}
                      className="cancel_button"
                    >
                      {lang.quotesClearALL}
                    </button>

                    <button type="submit" className="btn get_discount" onClick={this.defineFamily}>
                      GET DISCOUNT
                    </button>
                  </div>
                </div>

                <div className={showFamilyAlert ? "toast" : "toast_show"}>
                  <p>
                    <i className="info" />
                    {showFamilyAlert}
                    <span className="closeToast" onClick={this.hideToast} />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

Family.propTypes = {
  travellerData: PropTypes.instanceOf(Array).isRequired,
  defineFamilyAction: PropTypes.func.isRequired,
  familyDataCollection: PropTypes.instanceOf(Object).isRequired,
  saveUpdatedData: PropTypes.func.isRequired,
  values: PropTypes.instanceOf(Array).isRequired,
  destinationsData: PropTypes.instanceOf(Array).isRequired
};

const mapDispatchToProps = dispatch => {
  return {
    defineFamilyAction: data => dispatch(defineFamilyAction(data))
  };
};

const mapStateToProps = state => {
  return {
    travellerData: state.travellerData,
    familyDataCollection: state.familyDataCollection,
    values: state.dateRange,
    destinationsData: state.destinationsData
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Family);
