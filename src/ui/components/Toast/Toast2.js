import React, { Component } from 'react';


class Toast extends Component {

    constructor(props) {
        super(props);
        this.state = {
            toastShowHide: 'show',
            message: props.text,
        }
    }

    // static getDerivedStateFromProps = (props, state) => {

    //     console.log('Yes I am called 22222222222');
    //     // if(props.text !== state.message) {
    //     //     return {
    //     //         // toastShowHide: 'show',
    //     //         message: props.text,
    //     //     }
    //     // }
    // }


    componentDidMount = () => {
        // setTimeout(() => {
        //     this.closeToast();
        // }, 4000);
    }

    closeToast = () => {
        const { onClose } = this.props;

        onClose(this.state.message);
        this.setState({
            message: "",
            toastShowHide: 'hide',
        })
    }

    render() {

        const {  toastShowHide, message } = this.state;
        
        return (
          <div
            style={{ position: "sticky !important" }}
            className={toastShowHide === 'show'  || true ?'toast tost_top':'toast_show'}
          >
           
              <p>
              <i className="info"></i>
                {message}
                <span onClick={() => this.closeToast()} className="closeToast"></span>
              </p>
                
              </div>
        );
    }
}


export default Toast;