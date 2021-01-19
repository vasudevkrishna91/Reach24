import React, {Component} from 'react';
import { Select, MenuItem } from '@material-ui/core';
import { default as diallingCodes } from '../lib/diallingCodes.json';
import {sendOTP , verifyOTP} from '../services/chatService';
import { ShowDesktopchat } from "./ScriptLiveChat";
import { connect } from "react-redux";

import { onRequestCallBack } from '../store/actions/preQuoteActions';
import './Styles/chat.css';

class ChatUI extends Component {
  constructor(props) {
    super(props);

    const {requestCallBackData} = props;
    this.state = {
      chatBoxToggle : false,
      showRCB1 :  true,
      showRCB2 :  false,
      currentTab : true,
      toggleLiveChatBtn : true,
      mobileCode : props.countryCode,
      mobile: this.props.mobileNo,
      error: false
    }
  }

  // static getDerivedStateFromProps(props, state) {
  //   if(props.mobileNo !== state.mobile && !state.mobile) {
  //     return {
  //       mobile: props.mobileNo
  //     }
  //   }
  // }

  componentDidMount = async () => {

  }

  componentDidUpdate(prevProps, prevState){
    const { showLiveChat } = this.props
    const { chatBoxToggle } = this.state
    if(showLiveChat !== chatBoxToggle){
      this.setState({
        chatBoxToggle:showLiveChat
      },()=>{
        this.toggleLiveChat()
      })
    }
  }

  openChatBox = () => {
    const { handleShowLiveChat } = this.props
    this.setState({
      chatBoxToggle : true
    },()=>{
      handleShowLiveChat(true)
      this.toggleLiveChat()
    })
  }

  closeChatBox = () => {
    const { handleShowLiveChat } = this.props
    this.setState({
      chatBoxToggle : false,
      toggleLiveChatBtn: true,
    },() =>{
      handleShowLiveChat(false)
    })
  }
  
  toggleLiveChat = () => {
    const { currentTab,toggleLiveChatBtn } = this.state;
    var ss = document.getElementsByClassName('rocketchat-widget')
    if(ss.length == 1){
      this.setState({
        toggleLiveChatBtn : false
      })
      document.querySelector('.rocketchat-widget').style.display = (!currentTab) ? 'none' : 'inline'
    }
    else{
    }
  }

  toggleTab = () => {
    const { currentTab } = this.state;
    this.setState({
      currentTab : !currentTab
    },() =>{
      this.toggleLiveChat()
    })
  }

  renderLiveChat = () => {
    const { enquiryID, encryptedProposerId } = this.props
    let data = {
      leadid: '',
      enquiryId: enquiryID,
      encId: encryptedProposerId || ''
    }
    this.setState({ toggleLiveChatBtn: false });
    ShowDesktopchat(data)
  }

  renderMobileCodesOptions = () => {
    const data = diallingCodes["Final Countries"];
    const { mobileCode } = this.state;
    return data.map((item, id) => {
      return <MenuItem value={item.CountryDialingCode}>
        <span>{item.CountryName}</span>
        <span>{`+${item.CountryDialingCode}`}</span>
      </MenuItem>
    });
  }

  onChangeCode = e => {
    this.setState({
      mobileCode : e.target.value
    })
  }

  handleMobileNumber = (e) => {
    const { mobileCode } = this.state;
    const mobileNo = e.target.value.replace(/[^\d]/g, "");
    console.log('mobile No--', mobileNo);
    let error = "";
    if (mobileNo.length !== 10) {
      error = "Please enter 10 digit Mobile no.";
    } else if (
      mobileNo.charAt(0) !== "8" &&
      mobileNo.charAt(0) !== "9" &&
      mobileNo.charAt(0) !== "7" &&
      mobileNo.charAt(0) !== "6" &&
      mobileCode === "91"
    ) {
      error = "Please enter valid Mobile no.";
    }

    this.setState(
      {
        mobile: mobileNo,
        error: ''
      }
    )
  }

  handleOTP = (e) => {
    const otpVal = e.target.value.replace(/[^\d]/g, "");
    let error = "";
    this.setState(
      {
        otp: otpVal
      }
    )
  }

  sendOTP = async () => {
    const {
      mobileCode, 
      mobile
    } = this.state
    const { proposerID } = this.props
    if(!mobile) { 
      this.setState({ error: 'Please enter valid mobile number'})
      return;
    } 
    
    let payload = {
      mobile : mobile,
      CountryCode : `+${mobileCode}`,
      proposerID : proposerID
    }
    const response = await sendOTP(payload);
    if(!response.hasError){
      this.setState({
        showRCB1 : false,
        showRCB2 : true,
        VCode : response.returnValue,
        MobileDisplay : `+${mobileCode} ${mobile}`
      })
    }
  }

  verifyOTP = async () => {
    const {
      otp, 
      mobile,
      VCode,
      mobileCode
    } = this.state

    const { proposerID, onRequestCallBack } = this.props

    let payload = {
      mobile : mobile,
      otp   : otp,
      VCode : VCode,
      proposerID : proposerID
      }
    
      
    const response = await verifyOTP(payload);

    onRequestCallBack({
      showRCB1 : false,
      showRCB2 : false,
      mobileNo : mobile,
      validNo: mobileCode,
    })
    
    if(!response.hasError){
      this.setState({
        showRCB1 : false,
        showRCB2 : false
      })
    } else {
      this.setState({
        error: 'Invalid OTP'
      })
    }
  }

	render(){
    const {
      mobileCode,
      otp,
      MobileDisplay,
      currentTab,
      toggleLiveChatBtn,
      mobile,
      error
    } = this.state

    if(window.innerWidth <= 768) return <div></div>;

		return(
      <div className='chat_wrapper'>
        {this.state.chatBoxToggle && 
          (<div className="chat_inner_wrp">
            <div className="chat_header">
              {(currentTab)?
              (<ul>
                <li className="chat_active">Live Chat</li>
                <li onClick={this.toggleTab}>Request Call Back</li>
              </ul>):(<ul>
                <li onClick={this.toggleTab}>Live Chat</li>
                <li className="chat_active">Request Call Back</li>
              </ul>)
              }
            </div>

              {(currentTab) ? 
                (<div className="chat_inner" id="live1">

                  {(toggleLiveChatBtn) ? (<div className="request_call_back">
                    <button onClick={this.renderLiveChat}>Start Chat</button>
                  </div>) : (<></>) }

                </div>) : (
                (this.state.showRCB1) ? 
                  (<div className="chat_inner" id="rcb1">
                    <div className="request_call_back">
                      <h2>Please verify your mobile number to get a call back from our advisor.</h2>
                      <div className="mobileNumber">
                      <label>Mobile Number</label>
                      <div className="mobileNumberLead">
                      <Select onChange={(e) => this.onChangeCode(e)}
                        value = {mobileCode}
                        renderValue={selected => (
                          <div>
                            {/* {`+${mobileCode}`} */}
                            { mobileCode.charAt(0) === '+' ? mobileCode : `+${mobileCode}`}
                          </div>
                        )}
                      >
                        {this.renderMobileCodesOptions()}
                      </Select>
                     
                      <input type="tel"
                        placeholder="Enter Mobile Number"
                        maxLength="10"
                        name="mobilno"
                        value={mobile}
                        onChange={e => this.handleMobileNumber(e)}
                      />
                      </div>
                      </div>
                      {error && <p className="error">{error}</p>}
                      <button onClick={this.sendOTP}>Send OTP</button>
                    </div>
                  </div>
                  ) : (!this.state.showRCB1 && this.state.showRCB2) ? 
                  (<div className="chat_inner" id="rcb2">
                    <div className="request_call_back">
                      <h2>Please input the OTP you have received.</h2>
                      <label>Mobile Number</label>
                      <div class="resent_mobile"> 
                        <input type="text" disabled 
                          value = {MobileDisplay}
                        />
                      </div>
                      <label>Enter OTP</label>
                      <input type="text"
                        placeholder="Enter OTP"
                        maxLength="10"
                        name="otp"
                        autoComplete="off"
                        value={otp ? otp : ""}
                        onChange={e => this.handleOTP(e)}
                      />
                      {error && <p className="error">{error}</p>}
                      <button onClick={this.verifyOTP}>Submit</button>
                      <a onClick={this.sendOTP}>RESEND OTP</a>
                    </div>
                  </div>
                  ) : (
                  <div className="chat_inner" id="rcb3">
                    <div className="request_call_back">
                      <h2>Thank you! You’ll receive a call from one of our advisors shortly.</h2>
                    </div>
                  </div>
                  )
                )
              }

          </div>
          )
        }
          <div className="chat_icon"></div>
          {this.state.chatBoxToggle && (<div className="chat_close" onClick={this.closeChatBox}></div>)}
          {!this.state.chatBoxToggle && (<div className="chat_button" onClick={this.openChatBox}></div>)}
      </div>
		)
	}
}

const mapChatStateToProps = state => {
  return {
    mobileNo: state.mobileNo,
    countryCode: state.countryCode,
    timezone: state.timezone,
    currentField: state.currentField,
    validMobileNo: state.validMobileNo,
    encryptedProposerId: state.encryptedProposerId,
    requestCallBackData: state.requestCallBackData
  };
};

const mapChatDispatchToProps = dispatch => {
  return {
    onRequestCallBack: data => dispatch(onRequestCallBack(data))
  };
};

export default connect(
  mapChatStateToProps,
  mapChatDispatchToProps,
)(ChatUI);

// export default ChatUI;