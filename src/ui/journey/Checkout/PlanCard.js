import React, { Component } from "react";
// import logo from '../../../'
import Moment from "moment";
import { extendMoment } from "moment-range";
import { formattedCurrency } from "../../../utils/helper";
import { lang } from "../../../cms/i18n/en/index";

const moment = extendMoment(Moment);

class PlanCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profiles: this.transformProfilesToRender(props.profiles) || []
    };
  }

  transformProfilesToRender = profiles => {
    return profiles.map(item => {
      return {
        ...item,
        openProfileDetail: false,
        profileProposer: item.profileProposer.map(proposer => {
          return {
            ...proposer,
            openModal: false
          };
        }),
        insuredMembers: item.insuredMembers.map(member => {
          return {
            ...member,
            openModal: false
          };
        })
      };
    });
  };

  hanldeModelToggle = (index, field, value, id) => {
    const { profiles } = this.state;
    if (field === "profileDetail") {
      profiles[index].openProfileDetail = !value;
    }

    if (field === "proposer") {
      profiles[index].profileProposer[id].openModal = !value;
    }

    if (field === "insurer") {
      profiles[index].insuredMembers[id].openModal = !value;
    }

    this.setState({ profiles });
  };

  renderPlanCard = () => {
    const { profiles } = this.state;

    const { redirectFunction } = this.props;

    return profiles.map((profile, index) => {
      return (
        <div class="insurer_details" key={`plan${index + 1}`}>
          <div class="checkout_header">{lang.policy_count}{`${index + 1}`}</div>
          <div class="checkout_card proposerCard">
            <div class={profile.openProfileDetail ? "" : "propser_read_only"}>
              <div class="toggleArrow">
                <span
                  class={profile.openProfileDetail ? "up_arrow" : "down_arrow"}
                  onClick={() =>
                    this.hanldeModelToggle(index, "profileDetail", profile.openProfileDetail)
                  }
                ></span>
              </div>

              <div className="row align-items-top">

                <div class="form-group col-md-3 col-6">
                  <img src={profile.logoURL} />
                </div>
                <div class="form-group col-md-3 col-12">
                  <p>{profile.planName}</p>
                </div>
                <div class="form-group col-md-3 col-6">
                  <label>{lang.sum_insured}</label>
                  <p>$ {formattedCurrency(profile.sumInsured)}</p>
                </div>
                <div class="form-group col-md-3 col-6">
                  <label>{lang.premium}</label>
                  <p> ₹ {formattedCurrency(profile.premium)}</p>
                </div>
              </div>

            </div>
            {profile.openProfileDetail && (

              <div class="row align-items-top inurer_table">
                <div class="form-group col-md-3 col-12 proDetails">
				{lang.product_detail} <i className="arrow right_arrow"></i>
                </div>
                <div class="form-group col-md-3 col-6">
                  <label>{lang.geographical_coverage}</label>
                  <p>{profile.geography}</p>
                </div>
                <div class="form-group col-md-3 col-6 ">
                  <label>{lang.members_covered}</label>
                  <p>{profile.memberedCovered.split(",").join(", ")}</p>
                </div>
                <div class="form-group col-md-3 col-6 ">
                  <label> {lang.policy_count}</label>
                  <p>{profile.noOfPolicy}</p>
                </div>
              </div>

            )}
          </div>
          <div class="cl"></div>
          <div class="checkout_headign">{lang.proposer_details}</div>
          {profile.profileProposer.map((data, id) => {
            return (
              <div class="proposer_wrapper">
                <div class="checkout_card proposerCard">
                  {!data.openModal && (
                    <div className="proposer_top_row">
                      <div className="toggleArrow">
                        <span
                          class={data.openModal ? "up_arrow" : "down_arrow"}
                          onClick={() =>
                            this.hanldeModelToggle(index, "proposer", data.openModal, id)
                          }
                        ></span>
                      </div>

                      <div className="row align-items-top proposer_name">
                        <div className="form-group col-md-4 col-12">
                          <label>{lang.proposer_name}</label>
                          {data.fullName}
                        </div>
                        {data.alternateMobileNo && (
                          <div className="form-group col-md-3 col-6">
                            <label>Alternate No.</label>
                            <p> {data.alternateMobileNo}</p>
                          </div>
                        )}

                        <div className="form-group col-md-4 col-6">
                          <label>{lang.proposer_email}</label>
                          {data.emailID}
                        </div>
                      </div>

                    </div>
                  )}

                  {data.openModal && (
                    <>
                      <div className="toggleArrow">
                        <span
                          class={data.openModal ? "up_arrow" : "down_arrow"}
                          onClick={() =>
                            this.hanldeModelToggle(index, "proposer", data.openModal, id)
                          }
                        ></span>
                      </div>

                      <div className="row align-items-top checkout_details_header">
                        <div className="form-group col-md-3 col-12">
                          <label>Name</label>
                          <p>{data.fullName}</p>
                        </div>
                        <div className="form-group col-md-3 col-6">
                          <label>{lang.proposer_gender}</label>
                          <p>{data.gender}</p>
                        </div>
                        <div className="form-group col-md-3 col-6">
                          <label>{lang.proposer_dob}</label>
                          <p>{moment(data.dateOfBirth).format("D MMM' YY")}</p>
                        </div>
                        <div className="form-group col-md-3 col-6">
                          <div class="edit_proposer" onClick={() => { redirectFunction("Proposer") }}>
                            Edit
                          </div>

                        </div>
                      </div>

                      <div className="row align-items-top checkout_rows">
                        <div className="form-group col-md-3 col-6">
                          <label>{lang.proposer_email}</label>
                          <p> {data.emailID}</p>
                        </div>
                        {/* <li>
                        <label>Passport</label>
                        <p> ML3456677</p>
                      </li>
                      <li>
                        <label>Mobile No.</label>
                        <p> {data.mobileNo}</p>
                      </li> */}
                        {data.alternateMobileNo && (
                          <div className="form-group col-md-3 col-6">
                            <label>Alternate No.</label>
                            <p> {data.alternateMobileNo}</p>
                          </div>
                        )}

                        {data.openModal && (
                          <div class="form-group col-md-3 col-6 summary_address">
                            <label>Address</label>
                            <p>{data.address}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}


                  <div class="cl"></div>
                </div>
              </div>
            );
          })}

          <div class="checkout_headign">Insured Details</div>

          {profile.insuredMembers.map((data, id) => {
            const {

              insurerID
            } = data;
            return (
              <div class="proposer_wrapper">
                <div class="checkout_card proposerCard">
                  {!data.openModal && (
                    <div className="proposer_top_row">
                      <div className="toggleArrow">
                        <span
                          class={data.openModal ? "up_arrow" : "down_arrow"}
                          onClick={() =>
                            this.hanldeModelToggle(index, "insurer", data.openModal, id)
                          }
                        ></span>
                      </div>
                      <div class="row align-items-top">
                        <div class="form-group col-md-4 col-12">
                          <label>{lang.proposer_name}</label>
                          {data.fullName}
                        </div>
                        <div class="form-group col-md-4 col-6">
                          <label>Date of Birth: </label>
                          {moment(data.dateOfBirth).format("D MMM' YY")}
                        </div>
                        <div class="form-group col-md-4 col-6">
                          <label>Passport No.:</label>
                          {data.passportNo}
                        </div>

                      </div>
                    </div>
                  )}
                  {data.openModal && (
                    <>
                      <div className="toggleArrow">
                        <span
                          class={data.openModal ? "up_arrow" : "down_arrow"}
                          onClick={() =>
                            this.hanldeModelToggle(index, "insurer", data.openModal, id)
                          }
                        ></span>
                      </div>

                      <div class="row align-items-top">
                        <div class="form-group col-md-3 col-6">
                          <label>{lang.proposer_name}</label>
                          <p>{data.fullName}</p>
                        </div>
                        <div class="form-group col-md-3 col-6">
                          <label>{lang.proposer_gender}</label>
                          <p>{data.gender}</p>
                        </div>
                        <div class="form-group col-md-6 col-12 text-right">
                          <div class="edit_proposer" onClick={() => { redirectFunction("InsuredMember") }}>
                            Edit
                            </div>
                        </div>
                      </div>


                      <div className="row align-items-top">
                        <div className="form-group col-md-3 col-6">
                          <label>{lang.passport_no}</label>
                          <p>{data.passportNo}</p>
                        </div>

                        <div className="form-group col-md-3 col-6">
                          <label>{lang.proposer_dob}</label>
                          <p>{moment(data.dateOfBirth).format("D MMM' YY")}</p>
                        </div>

                        <div className="form-group col-md-3 col-6">
                          <label>{lang.nomineeName}</label>
                          <p>{data.nominee_name}</p>
                        </div>

                        <div className="form-group col-md-3 col-6">
                          <label>{lang.nominee_relation}</label>
                          <p>{data.nomineeRelation}</p>
                        </div>

                        <div className="form-group col-md-3 col-6">
                          <label>{lang.relationship_of_proposer}</label>
                          <p>{data.proposerRelation}</p>
                        </div>

                        <div className="form-group col-md-3 col-6">
                          <label>{lang.pre_existing_disease}</label>
                          <p>{data.isPED ? "Yes" : "No"}</p>
                        </div>

                        {/* <li>
                          <label>Occupation</label>
                          <p> {data.occupation}</p>
                        </li> */}
                      </div>
                    </>
                  )}

                  {data.isPED && data.openModal && data.questions.length ? (
                    <div class="">
                      <label className="insurer_otther_details">{lang.other_additional_question}</label>

                      {data.questions.map(obj => {
                        const {
                          customDiseases
                        } = obj


                        return (
                          <>
                            <label>{obj.question}</label>
                            <p>{obj.answer ?customDiseases && customDiseases.length > 0?'': obj.answer :  "NA"}</p>
                            {
                              customDiseases && customDiseases.length > 0 && (
                                <div class='row'><div className='col-xs-4'>Disease Name</div><div className='col-xs-4'>Suffering Since</div><div className='col-xs-4'>Is Under Medication</div>

                                </div>
                              )
                            }
                            {
                              customDiseases && customDiseases.length > 0 && customDiseases.map(x => {
                                const {
                                  diseaseName,
                                  sufferingSince,
                                  isUnderMedication,
                                } = x;
                                return (
                                  <div className='row'><div className='col-xs-4'>{diseaseName}</div><div className='col-xs-4'>{sufferingSince}</div><div className='col-xs-4'>{isUnderMedication.toString()}</div></div>
                        )
                      })

                      }
                          </>
                  );

                      })}

                    </div>
                  ) : null}
                <div class="cl"></div>
              </div>
              </div>
      );
    })
  }
        </div>
      );
    });
  };

render() {
  return (
    <div class="checkout_left col-md-8 col-12">
      {this.renderPlanCard()}
      <div className="gst-guidelines">
        <p>{lang.message_gst}</p>
      </div>
    </div>
  );
}
}

export default PlanCard;
