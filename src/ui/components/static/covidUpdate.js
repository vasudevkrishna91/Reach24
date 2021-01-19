import React, { Component } from "react";

class CovidUpdate extends Component {

  onSubmit = () => {
    const { onClose } = this.props;
    onClose();
  }

  render() {
    return (
      <div className="overlay">
        <div className="covidUpdate">
          <span className="covidUpdate_header">Important Message</span>
          <p>Dear Customer,</p>
            <br />
          <p>
            You can only buy a Travel policy from here - if the insured(traveller) is currently in
            India and travelling at a future date.
          </p>

            <br />
          <p>
            If you are already outside India, then please contact your existing travel insurance
            provider for policy extension. If you bought a policy from Policybazaar earlier, please
            write to us at <a href="mailto:travel@policybazaar.com">travel@policybazaar.com</a> for extending your policy.
          </p>
          <br />
          <p>
            Please confirm that the insured is currently in India and planning to travel at a future
            date.
          </p>
          <br />
        <span className="button" style={{ cursor: "pointer"}} onClick={this.onSubmit}>I, Confirm</span>
        </div>
      </div>
    );
  }
}

export default CovidUpdate;
