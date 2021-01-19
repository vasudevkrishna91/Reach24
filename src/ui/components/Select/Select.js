import React, { Component } from "react";
import PropTypes from 'prop-types';

import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

import "./select.css";

/* eslint-disable jsx-a11y/label-has-associated-control */

class Select extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.showDropDownModel
    };
  }


  static getDerivedStateFromProps(props, state) {
    if(state.open !== props.showDropDownModel) {
      return {
        open: props.showDropDownModel,
      }
    }

    return null;
  }

  handleToggleSelect = () => {
    const { updateShowDropDownModel } = this.props;
    const { open } = this.state;
    this.setState(
      { open: !open },
      () => updateShowDropDownModel(!open)
    );
  };

  handleSelect = (item) => {
    const { onSelect } = this.props;
    onSelect(item.secondaryText ? item.secondaryText : item.label);
    this.setState({ open: false });
  }

  handleListKeyPress = (e, id, item) =>{
    if(e.key === 'ArrowDown'){
      e.preventDefault()
      let nextInput = document.querySelector('[tabindex='+'"'+(id+1)+ '"'+']')
      if(!nextInput){
        nextInput = document.querySelector('[tabindex="1"]');
      }
      nextInput.focus();
    }if(e.key === ' '|| e.key ==="Spacebar"){
      e.preventDefault()
      this.handleSelect(item)
    }if(e.key === 'Tab'){
      this.handleToggleSelect();
    }
  }

  showDropdown = () => {
    const { items, showSecondaryText, value } = this.props;

    return (
      <div className="custom-select-dropdown">
        <div className="main_drop_down scrolling-box">
          <div id="style-3">
          <ul>
            {items.map((item,id) => {
              let classActive  = null;
              classActive = showSecondaryText ? 
                (item.secondaryText === value ? "active" : null) : 
                (item.label === value ? "active" : null);
              return (
                <li 
                  onKeyDown={(e) => this.handleListKeyPress(e,(id+1), item)}
                  onClick={() => this.handleSelect(item)}
                  className={classActive}
                  tabIndex={(id+1)} 
                >
                  <span>{item.label}</span>
                  {showSecondaryText && <span style={{float:'right'}}>{item.secondaryText}</span>}
                </li>
              );
            })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  handleKeyPress = (e) =>{
    let { open } = this.state;
    if(e.key !== 'Tab'){
      e.preventDefault();
      if(e.key === ' ' || e.key ==='Spacebar'){
        this.handleToggleSelect()
      }if(e.key === 'ArrowDown'){
        if(open){
          const nextInput = document.querySelector('[tabindex="1"]');
          nextInput.focus();
        }
      }
    }
    else if (e.key === 'Tab'){
      if(open){
        this.handleToggleSelect()
      }
    }
  }


  render() {
    const { open } = this.state;
    const { 
      placeHolder, 
      valueDisplayText,
      // showDropDown, 
    } = this.props;

    return (
      <div className="custom-select">
        <div 
          className="custom-select-placeholder" 
          onClick={this.handleToggleSelect}
          onKeyDown={this.handleKeyPress}
        >
          <label>{valueDisplayText ? valueDisplayText : placeHolder}</label>
          <IconButton color="primary">
            {open ? (
              <ExpandLessIcon style={{ color: "red" }} />
            ) : (
              <ExpandMoreIcon style={{ color: "red" }} />
            )}
          </IconButton>
        </div>
        {open && this.showDropdown()}
      </div>
    );
  }
}

Select.propTypes = {
  items: PropTypes.instanceOf(Array).isRequired,
  valueDisplayText: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  placeHolder: PropTypes.string.isRequired,
  showSecondaryText: PropTypes.string.isRequired,
  showDropDownModel: PropTypes.bool.isRequired,
  updateShowDropDownModel: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default Select;
