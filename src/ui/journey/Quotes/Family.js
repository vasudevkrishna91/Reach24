import React, { Component } from "react";
import PropTypes from "prop-types";
import * as _ from "lodash";
import { connect } from "react-redux";
import { DragDropContainer, DropTarget } from "react-drag-drop-container";
import { relationData } from "../../../lib/helperData";
import { validateFamily, validateMember } from "../../../utils/validation/quotes";
import { getRelationId } from "../../../utils/helper";
import "./styles/family.css";
import { defineFamilyAction } from "../../../store/actions/preQuoteActions";
import { customEvent } from "../../../GA/gaEvents";
import { common } from "../MobileView/Common/common";
import Moment from "moment";
import { extendMoment } from "moment-range";
import { lang } from "../../../cms/i18n/en";
const moment = extendMoment(Moment);

const actionTypeID = 6;
class Family extends Component{

    constructor(props){
        super(props);
        this.state={
            travellerData : _.cloneDeep(props.travellerData),
            prevTravellerData : _.cloneDeep(props.travellerData),
            noOfFamily: 1,
            families:{
                family1: []
            },
            showFamilyAlert: '',
            loading: false,
        }
    }

    componentDidMount(){
      debugger;
        const { travellerData } = this.state;
        const { familyDataCollection } = this.props;

        if(Object.keys(familyDataCollection).length > 0){
           
            this.setState({ 
                travellerData: this.transformTravellersData(
                                  familyDataCollection, 
                                  _.cloneDeep(travellerData)), 
                prevTravellerData: this.transformTravellersData(
                                      familyDataCollection, 
                                      _.cloneDeep(travellerData)),
                families: _.cloneDeep(familyDataCollection),
                noOfFamily: Object.keys(familyDataCollection).length,
                noOfTravellers: travellerData.length
            })
        } else{
            const newTravelData = travellerData.map((data,id) =>{
                return {
                    ...data,
                    id: data.labelTraveller.split(' ')[1],
                    name: data.labelTraveller
                 }
            })
            this.setState({
                families: {family1:[]},
                travellerData: newTravelData,
                noOfFamily: 1,
                prevTravellerData: newTravelData,
                noOfTravellers: travellerData.length
            })
        }
    }

  componentDidMount() {
    const { travellerData } = this.state;
    const { familyDataCollection } = this.props;

    if (Object.keys(familyDataCollection).length > 0) {
      this.setState({
        travellerData: common.transformTravellersData(
          familyDataCollection,
          _.cloneDeep(travellerData)
        ),
        prevTravellerData: common.transformTravellersData(
          familyDataCollection,
          _.cloneDeep(travellerData)
        ),
        families: _.cloneDeep(familyDataCollection),
        noOfFamily: Object.keys(familyDataCollection).length,
        noOfTravellers: travellerData.length
      });
    } else {
      const newTravelData = travellerData.map((data, id) => {
        return {
          ...data,
          id: data.labelTraveller.split(" ")[1],
          name: data.labelTraveller
        };
      });
      this.setState({
        families: { family1: [] },
        travellerData: newTravelData,
        noOfFamily: 1,
        prevTravellerData: newTravelData,
        noOfTravellers: travellerData.length
      });
    }
  }

  trackCustomGA = label => {
    common.gaCustomEvent(label, this.props);
  };

  onDrop = (e, familyId) => {
    const { families } = this.state;
    const index = families[familyId].findIndex(family => family.id === e.dragData.id);
    if (index !== -1) {
      families[familyId].splice(index, 1);
    }
    this.setState({
      families
    });
  };

  dropped = (e, id) => {
    const { travellerData, families } = this.state;
    const index = travellerData.findIndex(traveller => traveller.id === e.dragData.id);
    if (index !== -1) {
      travellerData.splice(index, 1);
      families[id].push(e.dragData);
    } else {
      delete e.dragData.relationShip;
      families[id].push(e.dragData);
    }

    this.setState(
      {
        travellerData,
        families
      },
      () => {
        this.showFamilyCheckAlert();
      }
    );
  };

  handleRelationShip = (e, familyId, travellerData) => {
    const { families, alert } = this.state;

    const index = families[familyId].findIndex(familyData => familyData.id === travellerData.id);
    if (index !== -1) {
      families[familyId][index].relationShip = e.target.value;
    }
    let check = true;
    Object.keys(families).forEach(family => {
      families[family].forEach(familyData => {
        if (!familyData.relationShip) {
          check = false;
        }
      });
    });

    this.setState({
      families,
      alert: !check ? alert : ""
    });
  };

  renderDragContainer = () => {
    const { travellerData } = this.state;
    return (
      <div className="group_travellers">
        <h3>{lang.quotesTravellers}</h3>
        {travellerData.map(traveller => {
          return (
            <DragDropContainer targetKey="foo" dragData={traveller}>
              <div className="traveller_container">
                {/* <b>Traveller 1</b> */}
                <b>
                  {`${traveller.name},`}
                  <br />
                  <div className="family_age"> {`${traveller.age} Years`}</div>
                </b>
                <div className="cl" />
              </div>
            </DragDropContainer>
          );
        })}
      </div>
    );
  };

  renderDropContainer = () => {
    const { families } = this.state;
    return (
      <div className="group_main_container">
        {Object.keys(families).map((family, id) => {
          return (
            <DropTarget targetKey="foo" onHit={e => this.dropped(e, family)}>
              <div style={{ display: "inline-block" }}>
                <div className="dropbox_container_text">
                  <p>
                    {lang.quotesFamilyText}
                    {id + 1}
                    {Object.keys(families).length > 1 && (
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          float: "right",
                          margin: "0px 21px 0px 0px",
                          cursor: "pointer"
                        }}
                        onClick={() => this.removeFamily(family)}
                      >
                        X
                      </span>
                    )}
                  </p>
                </div>
                <div className="dropbox_container">
                  {!_.isEmpty(families[family]) ? (
                    this.renderDragDropContainer(family)
                  ) : (
                    <p className="group_middle_text">{lang.quotesDragDropText}</p>
                  )}
                </div>
              </div>
            </DropTarget>
          );
        })}
      </div>
    );
  };

  removeFamily = family => {
    const { families, travellerData } = this.state;
    if (Object.keys(families).length === 1) return;
    const data =
      families[family] &&
      families[family].map(familyData => {
        const { InsuredMemberID, TemporaryID, age, id, name, ped } = familyData;
        const obj = {
          InsuredMemberID,
          TemporaryID,
          age,
          id,
          name,
          ped
        };
        return obj;
      });
    const newTravellerData = travellerData.concat(data);
    delete families[family];
    this.setState({
      families,
      travellerData: newTravellerData
    });
  };

  removeFromFamily = (family, familyData) => {
    const { families, travellerData } = this.state;
    const index = families[family].findIndex(data => data.TemporaryID === familyData.TemporaryID);
    if (index !== -1) {
      const tempTraveller = families[family][index];
      const temp = {
        InsuredMemberID: tempTraveller.InsuredMemberID,
        TemporaryID: tempTraveller.TemporaryID,
        age: tempTraveller.age,
        id: tempTraveller.id,
        name: tempTraveller.name,
        ped: tempTraveller.ped
        // relationShip: "Self"
      };
      travellerData.push(temp);
      families[family].splice(index, 1);
    }
    this.setState(
      {
        families,
        travellerData
      },
      () => {
        this.showFamilyCheckAlert();
      }
    );
  };

  renderRelationOptions = (family, selectedData) => {
    const { families } = this.state;
    const familyData = families[family];
    const relations = _.cloneDeep(relationData);
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

  renderDragDropContainer = family => {
    const { families, alert } = this.state;
    return (
      <>
        {families[family].map(familyData => {
          const valid = validateMember(familyData);
          return (
            <div className="drag_container">
              <DragDropContainer
                targetKey="foo"
                dragHandleClassName="traveller_container"
                dragData={familyData}
                onDrop={e => this.onDrop(e, family)}
              >
                <div className="group_travellers">
                  <div className="traveller_container">
                    {/* <b>Traveller 1</b> */}
                    <b>
                      {`${familyData.name},`}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          float: "right",
                          margin: "0px 10px 0px 0px",
                          cursor: "pointer"
                        }}
                        onClick={() => this.removeFromFamily(family, familyData)}
                      >
                        X
                      </span>
                      <br />
                      <div className="family_age"> {`${familyData.age} Years`}</div>
                    </b>
                  </div>
                  <div className="drop_selectobox">
                    <select
                      className="select_box"
                      id={`Select ${familyData.name}-${familyData.age}`}
                      value={familyData.relationShip ? familyData.relationShip : true}
                      onChange={e => this.handleRelationShip(e, family, familyData)}
                      style={{
                        border: `${alert && !familyData.relationShip ? "1px solid red" : ""}`
                      }}
                    >
                      <option disabled selected value>
                        {lang.quotesRelationship}
                      </option>
                      {this.renderRelationOptions(family, familyData)}
                      {/* <option>Father</option>
                        <option>Mother</option> */}
                    </select>
                    {alert && !familyData.relationShip ? (
                      <div className="group_error">{alert}</div>
                    ) : null}

                    {!alert && valid ? (
                      <div className="group_error" style={{ color: "#253858" }}>
                        {valid}
                      </div>
                    ) : null}
                  </div>
                </div>
              </DragDropContainer>
            </div>
          );
        })}
      </>
    );
  };

  defineFamily = async () => {
    const { defineFamilyAction, close, values, destinationsData } = this.props;
    const { families, travellerData, prevTravellerData } = this.state;

    const {
      saveUpdatedData,
      // travellerData: prevTravellerData,
      familyDataCollection: prevFamily
    } = this.props;

    const check = common.defineFamily(this.props, this.state);
    //console.log(check);
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

      close();
    }
    this.setState({
      alert
      // errors
    });
  };
  addFamilyMember = e => {
    const familyData = common.addFamilyMember(e, this.state);
    const { families, noOfFamily } = familyData;
    this.setState({
      noOfFamily,
      families
    });

    this.trackCustomGA("Trv.Create more family");
  };

  showFamilyCheckAlert = () => {
    const { families } = this.state;
    let sum = 0;
    Object.keys(families).forEach(key => {
      sum += families[key].length;
    });
    // if(sum >=2){

    // }
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
    // return false;
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
    const { close } = this.props;
    const { alert, showFamilyAlert, loading } = this.state;
    return (
      <div className="overlay">
        <div className="group_wrapper">
          <div className="group_left">
            <h1>{lang.quotesFamilyHeader}</h1>
            <p>
              {lang.quotesFamilySubHeader1}
              <br />
              <br />
              {lang.quotesFamilySubHeader2}
            </p>
          </div>
          <div className="group_right">
            <span className="close_button" onClick={close} />
            {this.renderDragContainer()}
            {/* {alert && (
                  <div className="Family_error">

                    {alert}

                  </div>

                )} */}
            {this.renderDropContainer()}
            <div className="cl" />
            <div>
              <p className="add_family_buttons" onClick={this.addFamilyMember}>
                {lang.quotesCreateMoreFamily}
              </p>
            </div>

            <div className={showFamilyAlert ? "toast" : "toast_show"}>
              <p>
                <i className="info"></i>
                {showFamilyAlert}
                <span className="closeToast" onClick={this.hideToast}></span>
              </p>
            </div>
            {/*
                  <div className="toast">
                  <i className="info"></i>
               <p>
                  { showFamilyAlert }
                  </p>
                   <span className="closeToast" onClick={this.hideToast}></span>
                  </div> */}

            <div className="group_button">
              <button type="submit" onClick={this.removeAllFamilies} className="cancel_button">
                {lang.quotesClearALL}
              </button>
              {/* <button
                    type="submit"
                    // onClick={close}
                    className="clear_all"
                  >
                    CLEAR ALL
                  </button> */}

              {loading && <div className="loading primary_button apply_btn" />}
              {!loading && (
                <button
                  type="submit"
                  onClick={this.defineFamily}
                  className="primary_button apply_btn"
                >
                  {lang.quotesApplyCaps}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Family.propTypes = {
  travellerData: PropTypes.instanceOf(Array).isRequired,
  close: PropTypes.func.isRequired,
  defineFamilyAction: PropTypes.func.isRequired,
  familyDataCollection: PropTypes.instanceOf(Object).isRequired,
  saveUpdatedData: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => {
  return {
    defineFamilyAction: data => dispatch(defineFamilyAction(data))
  };
};

const mapStateToProps = state => {
  return {
    familyDataCollection: state.familyDataCollection,
    travellerData: state.travellerData,
    values: state.dateRange,
    destinationsData: state.destinationsData
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Family);
