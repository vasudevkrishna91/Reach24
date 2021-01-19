import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { continueCj } from '../../../services/common';

class ContinueJourney extends Component {

    constructor(props){
        super(props);
        this.state={
            // matrixLeadId: this.props.match.params
        }
    }

    async componentDidMount(){
        const { match:{params} } = this.props;
        const { location, match, history } = this.props;
        let encryptedProposerId = null;
        
        if(match && match.params){
        encryptedProposerId = match.params.encryptedProposerId;
      }

      if (!encryptedProposerId) {
        history.push({
          pathname: `/v2/`
        });
      }     


    
    // const { encryptedProposerId } = match.params;

        const res = await continueCj(encryptedProposerId);
        if(res && !res.hasError){
          setTimeout(() =>{
            window.location.href = res.redirectURL;
          },500)
        }
    }

    render() {
      return (
        <div>
          <h3 style={{
            textAlign: 'center',
            marginTop:'250px'
            }}
          >
            Please wait...We are processing your request.
          </h3>
        </div>
        )
    }
}

ContinueJourney.propTypes = {
    match: PropTypes.instanceOf(Object).isRequired
}
export default ContinueJourney;
