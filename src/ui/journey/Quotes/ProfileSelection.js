import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';

import './styles/profileSelection.css';
import { validTravellerData } from '../../../utils/helper';
import { lang } from '../../../cms/i18n/en/index';
import ProfileTab from '../MobileView/ProfileTab/Profiletab';
class ProfileSelection extends Component {

    constructor(props){
        super(props);
        this.state = {
            selectedProfile: props.selectedProfile,
            selectedProfileTypeID:props.selectedProfileTypeID,
            selectedGroupID:props.selectedGroupID
        };
    }

    static getDerivedStateFromProps(props, state){
        // if(props.selectedProfile !== state.selectedProfile){
        //   return {
        //     selectedProfile: props.selectedProfile
        //   }
        // }
        // if(props.selectedProfileTypeID !== state.selectedProfileTypeID){
        //   return {
        //     selectedProfileTypeID: props.selectedProfileTypeID
        //   }
        // }
        if(props.selectedGroupID !== state.selectedGroupID){
          return {
            selectedGroupID: props.selectedGroupID,
            selectedProfileTypeID:props.selectedProfileTypeID
          }
        }
        return null;
    }

    changeProfileSelection = (profileTypeID,groupID) =>{
        const { changeSelectedProfile } = this.props;
        changeSelectedProfile(profileTypeID,groupID)
    }

    renderTravellerNumbers = (travellers) =>{
    
      let traveller = travellers.split('#');
      traveller = traveller.map(data =>{
        return (
          <>
            {data}
            <br />
          </>
        )
      })
      return traveller
    }

    render() {

        const { selectedProfile ,selectedProfileTypeID,selectedGroupID} = this.state;
        const { 
          quotes, 
          profiles,
          coveredMembers
        } = this.props;
        return (
          <>
          <div className="Quotes-head">
            {!_.isEmpty(profiles) && profiles.length >0 && (
              <div className="multi_profile">
                <ul>
                  { profiles.map((profile,index) => {
                    return (
                      (
                        <>
                          <li 
                            className={selectedGroupID === profile.groupID? "active": ''}
                            onClick={() =>this.changeProfileSelection(profile.profileTypeID,profile.groupID)}
                          >
                          <div className="tooltip">
                         
                            <p>
                              {
                              quotes[index]
                              && quotes[index].premiums.length
                              } 
                              {' '}
                              {lang.quotesPlanFor}
                            </p>
                            <p>{profile.profileName}</p>
                            {' '}
                                <span className="tooltip_text">
                                  {/* {`${coveredMembers[profile]}`} */}
                                  {profile.coveredMembers && this.renderTravellerNumbers(profile.coveredMembers)}
                                </span>
                            </div>
                            </li>
                             
                         
                        </>
                      )
                    )
                  })}
                </ul>
                <div className="cl" />
              </div>
            )}
          </div>
          <ProfileTab
            profiles={profiles}
            selectedProfile={this.props.selectedProfile}
            quotes={quotes}
            coveredMembers={coveredMembers}
            changeSelectedProfile={this.props.changeSelectedProfile}
            selectedProfileTypeID={selectedProfileTypeID}
            selectedGroupID={selectedGroupID}
          />
          {/* <ul className="filterBox mobile">
          <li>Showing Plan For</li>
          <li>
            <div className="selection">
              25-30 Yrs
              <div className="img_arrow" />
            </div>
          </li>
        </ul> */}
        </>
          
        )
    }
}

ProfileSelection.propTypes = {
    selectedProfile: PropTypes.string.isRequired,
    changeSelectedProfile: PropTypes.func.isRequired,
    quotes: PropTypes.instanceOf(Object).isRequired,
    profiles: PropTypes.instanceOf(Array).isRequired
}

export default ProfileSelection;