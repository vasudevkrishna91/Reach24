import React, { Component } from 'react';

import * as _ from 'lodash';

import './styles/profile.css'

class Profiletab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profiles: props.profiles,
      coveredMembers: {
        "Individual": 'Traveler 2 (50yrs)',
        "Senior Citizen": 'Traveler 2 (50yrs)',
        "Family": 'Traveler 2 (50yrs)',
        "Senior Citizen 71-80": 'Traveler 2 (50yrs)',
        "Senior Citizen 80+": 'Traveler 2 (50yrs)',
        "Student": 'Traveler 2 (50yrs)'
      },
      selectedProfile: props.selectedProfile,
      selectedProfileTypeID: props.selectedProfileTypeID,
      selectedGroupID: props.selectedGroupID,
      showProfiles: false
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.selectedGroupID !== state.selectedGroupID) {
      return {
        selectedGroupID: props.selectedGroupID,
        selectedProfileTypeID: props.selectedProfileTypeID
      }
    }

    return null;
  }

  // selectProfile = (profile) => {
  //   this.setState({
  //     selectedProfile: profile,
  //     showProfiles: false
  //   })
  // }

  renderTravellerNumbers = (travellers) =>{

    if(!travellers) return;
      let traveller = travellers.split(',');
      traveller = traveller.map(data =>{
        return (
          <option>
            {data}
          </option>
        )
      })
      return traveller
    }

  changeProfileSelection = (profileTypeID, groupID) => {
    const { changeSelectedProfile } = this.props;
    changeSelectedProfile(profileTypeID, groupID);
    this.setState({ showProfiles: false })
  }

  renderProfiles = () => {
    const { profiles, coveredMembers } = this.props;
    return (
      <div className="overlay">
        <div className="modal-dialog profilesDropdown">
          <div className="modal-content">
            <div className="modal-header">
              <h5 class="modal-title">Select Group</h5>
              <span
                class="close"
                onClick={() => this.setState({ showProfiles: false })}
              ></span>
            </div>

            <div class="modal-body">

              {/* <ul>
                {!_.isEmpty(profiles) && profiles.map(profile =>{
                  return (
                    <li onClick={() =>this.selectProfile(profile)}>
                      {profile}
                    </li>
                )
                })}
              </ul> */}

              {!_.isEmpty(profiles) && profiles.map(profile => {
                return (
                  <ul class="groupList">
                    <li class="check">
                      <input
                        type="radio"
                        name="tab"
                        value={profile.profileName}
                        onClick={() => this.changeProfileSelection(profile.profileTypeID, profile.groupID)}
                      />
                    </li>
                    <li class="name">
                      {profile.profileName}
                    </li>
                    <li class="select">
                      <select className="form-control">
                        <option disabled selected>View</option>
                        {profile.coveredMembers && this.renderTravellerNumbers(profile.coveredMembers)}

                      </select>
                    </li>
                  </ul>
                  // <li onClick={() =>this.selectProfile(profile)}>
                  //   {profile}
                  // </li>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    )
  }

  selectedProfileName = () => {
  
    let profileName = '';
    const { profiles, selectedGroupID } = this.state;
    const index = profiles.findIndex(x => x.groupID === selectedGroupID)
    if (index !== -1) {
      profileName = profiles[index].profileName;
    }
    return profileName;

  }

  getCoveredMembers = () => {
    let coveredMembers = '';
    const { profiles, selectedGroupID } = this.state;
    const index = profiles.findIndex(x => x.groupID === selectedGroupID)
    if (index !== -1) {
      coveredMembers = profiles[index].coveredMembers;
    }
    return coveredMembers;
  }

  render() {
    const { profiles } = this.props;
    const { selectedProfile, showProfiles, selectedProfileTypeID, selectedGroupID } = this.state;
    return (
      <div>
        {!_.isEmpty(profiles) && (
          <div className="showProfile" onClick={() => this.setState({ showProfiles: !showProfiles })}>
            <p>SHOWING PLANS FOR</p>
            <p className="selectedProfile">
              {this.selectedProfileName()}
            </p>

            <i class="fa fa-angle-down" aria-hidden="true"></i>

            <span className="tooltip_text">
              {/* {this.renderTravellerNumbers() && this.renderTravellerNumbers()} */}
            </span>
          </div>
        )}
        {showProfiles === true && this.renderProfiles()}
      </div>
    )
  }
}

export default Profiletab;
