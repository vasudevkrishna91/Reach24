import React, { Component } from 'react';


class Toast extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toastText: props.toastText,
      toastShowHide: props.additionalClass,
      handelclose: props.handelclose
    }
  }


  static getDerivedStateFromProps(props, state) {

    if (props.additionalClass !== state.toastShowHide) {
      return {
        toastShowHide: props.additionalClass,
        toastText: props.toastText

      };
    }
    else {
      return null;
    }

  }

  handelclose = () => {

    const { handelclose } = this.state
    handelclose();
  }

  render() {
    const {
      toastShowHide,
      toastText
    } = this.state

    const { text } = this.props;

    return (
      <div 
      // id="divProposalStep2Toast"
      // style={{ top: 150, position: "sticky !important", display: 'block' }}
       className={toastShowHide === 'show' ? 'toast tost_top':'toast_show'}>

         
       <p>
         <i className="info"></i>
            {toastText}
            <span
            onClick={() => this.handelclose()}
            className="closeToast">
              {/* {text === 'studentVisa' ?'' :'OK'} */}
          </span>
          </p>
          
      </div>
    )
  }

}

export default Toast;
