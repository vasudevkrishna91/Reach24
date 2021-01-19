import React, { Component} from 'react';
import { lang } from '../../../../cms/i18n/en/index';


class CheckoutAlertModal extends Component {

    handleClose = () => {
        const { onClose } = this.props;

        onClose();

    }

    render() {
        return (
            <div className="checkout_ovly">
            <div className="checkout_alert">
                <p>
                   {lang.quotesEditCheckoutAlert}
                </p>
                <div className="checkout_btn">
                <button onClick={this.handleClose}> {lang.quotesCancel}</button>
                <button onClick={this.props.onProceed}>{lang.quotesProceed}</button>
                </div>
                </div>
            </div>
        )
    }

}

export default CheckoutAlertModal