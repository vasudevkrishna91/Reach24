import React, { Component } from 'react'
import './Styles/autocomplete.css';
import { default as Pincodes } from './Pincodes.json';
import {
  isPincode
} from '../ProposalStep2/ProposalStep2Validation';

class AutoComplete extends Component {
  constructor(props) {
    super(props);
    const {
      placeholder: inputPlaceholder,
      isNumber: isAutoNumber,
      onChange: propOnChange,
      data: propData
    } = props
    this.state = {
      isNumber: isAutoNumber,
      placeholder: inputPlaceholder,
      onChange: propOnChange,
      data: propData,
      additionalClass:props.additionalClass,
      profileID:props.profileID,
      
    }
  }

  componentDidMount() {
  }


  autocomplete = (inp, arr) => {
    const {
      isNumber,
      onChange,
      profileID
    } = this.state

    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false; }
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      if (isNumber) {
        for (i = 0; i < arr.length; i++) {

          if (arr[i].toString().substr(0, val.length) == val) {

            b = document.createElement("DIV");
            b.innerHTML = "<strong>" + arr[i].toString().substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].toString().substr(val.length);
            // b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            b.innerHTML += `<input  type=hidden value=${arr[i]}>`;
            b.addEventListener("click", function (e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              onChange(profileID,inp.value);
              closeAllLists();
            });
            a.appendChild(b);
          }

        }
      }
      else {

        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            b.addEventListener("click", function (e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              onChange(profileID,inp.value);
              closeAllLists();
            });
            a.appendChild(b);
          }
        }
      }

    });
    inp.addEventListener("keydown", function (e) {

      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) {
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }

    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });

  }


  handelChange = (e) => {
 
    let {
      data,
      onChange,
      id,
      isNumber,
      profileID
    } = this.props;
    let value = e.target.value;
    value = value.replace(/[^0-9]+$/g,"")
    if (isNumber) {
      if (isPincode(value)) {
        this.setState({additionalClass:''});
   
        onChange(profileID,value)
      }
      else{
        this.setState({additionalClass:'error_proposal'})
      }
    }

    if (value.length >= 1) {
      this.autocomplete(document.getElementById(id), data)

    }
    if (value.length <= 2) {
      let ele = document.getElementById("myInputautocomplete-list");
      if (ele) {
        ele.parentNode.removeChild(ele);
      }

    }
  }

  
  render() {
    const {
      placeholder,
      data,
      onChange,
     // additionalClass
    } = this.state
    const {
      id,
      isDisabled,
      value,
      additionalClass
    } = this.props;
    return (
      <form autoComplete="off" >
        <div className="autocomplete fieldBlock">
          <div className={`field`}>
              <input type="text" required id={id}
                  value={value}
                  className={`${additionalClass}`}
                  onChange={this.handelChange}
                  disabled={isDisabled}
                  maxLength={6}
              />
              <label for={id}>{placeholder}</label>
          </div>


        </div>
      </form>

    );
  }
}

export default AutoComplete;
