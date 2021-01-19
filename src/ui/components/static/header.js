import React, { Component } from "react";
import { lang } from "../../../cms/i18n/en/index";
import logo from "../../../assets/images/logo.png";
import logoMob from "../../../assets/images/logoMob.png";
import chat from "../../../assets/images/svg/chat.svg";
import headphonep from "../../../assets/images/headphonep.png";
import receiver from "../../../assets/images/phone-receiver.png";
import reload from "../../../assets/images/svg/reload.svg";
import phoneCall from "../../../assets/images/svg/phone-call.png";
import liveChat from "../../../assets/images/svg/liveChat.png";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }



  handelSaveMore = () => {
    const {
      handelmobileViewSaveMore
    } = this.props;
    handelmobileViewSaveMore();
  }

  render() {
    const {
      handleShowLiveChat,
      showSaveMore,
      hideChat
    } = this.props;
    return (
      <header>
        <nav className="navbar navbar-expand-md navbar-dark bg-white fixed-top">
          <div className="container header-bar">
            <a
              class="navbar-brand desktop-view"
              href="https://www.policybazaar.com/"
              target="_blank"
            >
              {" "}
              <img src={logo} alt="chat" />
            </a>
            <a class="navbar-brand mob-view" href="https://www.policybazaar.com/" target="_blank">
              {" "}
              <img src={logoMob} alt="chat" />
            </a>

            {/* Mobile View heading */}
            <div className="mobile-heading">
              <h1>Travel Insurance</h1>
            </div>



            <ul class="navbar-nav ml-auto">
              {showSaveMore === true && <li className="nav-item saveMore">
                <h2 onClick={this.handelSaveMore}> Save More</h2>
              </li>}
              {/* {!hideChat && <li class="nav-item desktop-view">
                <a className="nav-link" href="#" onClick={() => handleShowLiveChat(true)}>
                  <img src={chat} alt="chat" />
                  {lang.liveChat}
                </a>
              </li>} */}
              <li class="nav-item tollfreeNumber">
                <a class="nav-link desktop-view">
                  <img src={headphonep} />
                  {lang.tollFree}
                </a>
                <a class="nav-link mob-view">
                   {/* <img src={receiver} />  */}
                   <img src={headphonep} /> 
                  <span>{lang.tollFree}</span>
                </a>

                <div class="tollfree-number-box">
                  <div class="number_devider">
                    <p class="number_small">
                      {" "}
                      <a href="tel:1800-419-7824">Have not paid yet? (Sales)</a>{" "}
                    </p>
                    <p>
                      <a href="tel:1800-419-7824">1800 - 419 - 7824</a>
                    </p>
                  </div>
                  <div class="number_devider">
                    <p class="number_small">
                      {" "}
                      <a href="tel:1800 258 5970">Have already paid? (Service)</a>{" "}
                    </p>
                    <p>
                      <a href="tel:1800 258 5970">1800 - 258 - 5970</a>
                    </p>
                    <p class="number_small">
                      {" "}
                      <a href="tel:1800 258 5970">(Use Registered Mobile Only)</a>
                    </p>
                  </div>
                  <div class="number_devider last_child">
                    <p class="number_small">
                      {" "}
                      <a href="tel:91124-6656507">For NRIs</a>
                    </p>
                    <p>
                      <a href="tel:+91124-6656507">+91 - 124 - 6656507</a>
                    </p>
                  </div>
                  {/* <div className="number_devider  mob-view">
                    <button className="btn btn-primary mb-1 w-100 get-call-back">
                      Get a call back <img src={phoneCall} alt="phoneCall" />
                      <img src={reload} alt="reload" />
                    </button>
                    <button className="btn btn-primary mb-1 w-100 live-chat">
                      Live Chat <img src={liveChat} alt="chat" />
                    </button>
                  </div> */}
                </div>
              </li>
              {/* <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="dropdown01"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Dropdown
                </a>
                <div class="dropdown-menu" aria-labelledby="dropdown01">
                  <a class="dropdown-item" href="tel:1800-419-7824">
                    Have not paid yet? (Sales)
                  </a>{" "}
                  <a class="dropdown-item" href="#">
                    Something else here
                  </a>
                </div>
              </li> */}
            </ul>
          </div>
        </nav>



      </header>
    );
  }
}

export default Header;
