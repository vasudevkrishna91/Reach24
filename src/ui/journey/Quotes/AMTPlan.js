import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux'

import Moment from 'moment';
import { extendMoment } from "moment-range";


import { Switch } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import {lang} from '../../../cms/i18n/en/index';
import Slider from '@material-ui/core/Slider';

const moment = extendMoment(Moment);

const styles = theme => ({
    root: {
      width: 28,
      height: 16,
      padding: 0,
      display: 'flex',
    },
    switchBase: {
      padding: 2,
      color: '#ffffff',
      '&$checked': {
        transform: 'translateX(12px)',
        color: theme.palette.common.white,
        '& + $track': {
          opacity: 1,
          backgroundColor: '#0065ff',
        },
      },
    },
    thumb: {
      width: 12,
      height: 12,
      boxShadow: 'none',
    },
    track: {
      // border: `1px solid ${theme.palette.grey[500]}`,
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: '#b3bac5',
    },
    checked: {},
    focusVisible: {}
  });

class AMTPlan extends Component {

    constructor(props){
        super(props);
        this.state={
          annualMultiTripOn:true, //props.maxTripDuration? true: false,
          annualMultiTripSliderValue: props.maxTripDuration ?this.setSliderValue(props.maxTripDuration) :0,
          disabled: false,
          day: props.maxTripDuration ?props.maxTripDuration :30
        }
    }

    componentDidMount(){
      const { annualMultiTripSliderValue } = this.state;
      const ele = document.getElementById('sliderRange');
      if(ele){
        this.applyFill(ele, annualMultiTripSliderValue)
      }
    }
    setSliderValue = (tripDuration) =>{
      if(tripDuration === 30) return 0;
      else if(tripDuration === 45) return 30;
      else if(tripDuration === 60) return 60;
      else if(tripDuration === 90) return 90;
      else return 0;
    }

    setAnnualMultiTripOnOff = async () => {
    const { annualMultiTripOn } = this.state;
    const { 
      saveUpdatedData, 
      close,
      travellerData,
      values,
      destinationsData
   } = this.props;

		this.setState({
			annualMultiTripOn: !annualMultiTripOn,
      day: !annualMultiTripOn ? 30 : 0,
      disabled: annualMultiTripOn  
    });
    // if(!annualMultiTripOn === false){
    //   const data = {
    //     data: {
    //       members: [...travellerData],
    //       tripCountries: [...destinationsData],
    //       tripStartDate: moment(values[0]).format('YYYY-MM-DD'),
    //       tripEndDate: moment(values[1]).format('YYYY-MM-DD'),
    //       MaxTripDuration: 0
    //     },
    //     actionTypeID: "19"
    //   };
    //   close();
    //   await saveUpdatedData(data);
    // }
	};

	setAnnualMultiTripDays = (e) => {
    const { day } = this.state;
    const { inBox, onUpdate} = this.props
    const draggedSliderValue = parseInt(e.target.value, 10);

		if (draggedSliderValue > 0 && draggedSliderValue <= 20) {
			this.setState({
				day: 30,
				annualMultiTripSliderValue: 0
      }, this.applyFill(e.target, 0));
      if(inBox) onUpdate(30);

		}
		else if (draggedSliderValue > 20 && draggedSliderValue <= 45) {
			this.setState({
				day: 45,
				annualMultiTripSliderValue: 30
      }, this.applyFill(e.target, 30));
      if(inBox) onUpdate(45);
		}
		else if (draggedSliderValue > 45 && draggedSliderValue <= 75) {
			this.setState({
				day: 60,
				annualMultiTripSliderValue: 60
      }, this.applyFill(e.target, 60));
      if(inBox) onUpdate(60);

		}

		else if (draggedSliderValue > 75) {
			this.setState({
				day: 90,
				annualMultiTripSliderValue: 90
      }, this.applyFill(e.target, 90));
      if(inBox) onUpdate(90);

    }
    

		if (day === 30 || day === 45 || day === 60 || day === 90) {
			this.setState({
				disabled: false
			});
    }

    
    
    
  };

  applyFill = (slider, value) => {
    const ele = slider
    const settings={
      fill: '#0065ff',
      background: '#d7dcdf'
    }
    const percentage = 100*(value-slider.min)/(slider.max-slider.min);
    const bg = `linear-gradient(90deg, ${settings.fill} ${percentage}%, ${settings.background} ${percentage+0.1}%)`;
    ele.style.background = bg;
  }
    
    handleApplyButton = async () =>{
      debugger
        const { 
            maxTripDuration, 
            saveUpdatedData, 
            close,
            travellerData,
            values,
            destinationsData
         } = this.props;

        const { day, annualMultiTripOn } = this.state;
        if(annualMultiTripOn && maxTripDuration !== day){
            const data = {
                data: {
                  members: [...travellerData],
                  tripCountries: [...destinationsData],
                  tripStartDate: moment(values[0]).format('YYYY-MM-DD'),
                  tripEndDate: moment(values[1]).format('YYYY-MM-DD'),
                  filters: [],
                  MaxTripDuration: day
                },
                actionTypeID: "17"
            };
            close(true);
            await saveUpdatedData(data);
        } else if(annualMultiTripOn && maxTripDuration === day){
            close(true);
        }else if(!annualMultiTripOn){
            // const data = {
            //     data: {
            //       members: [...travellerData],
            //       tripCountries: [...destinationsData],
            //       tripStartDate: moment(values[0]).format('YYYY-MM-DD'),
            //       tripEndDate: moment(values[1]).format('YYYY-MM-DD'),
            //       MaxTripDuration: 0
            //     },
            //     actionTypeID: "17"
            // };
            close();
            // await saveUpdatedData(data);
        }
    }

    render() {

        const { annualMultiTripSliderValue, annualMultiTripOn,disabled } = this.state
        const { classes, close, inBox } = this.props;
        return (
          <>
          { !inBox ? (
                     <div className="overlay">
                     <div className="modal-dialog insurer_popup si_popup rangeslider_wrapper">
                     <div className="modal-content">
                       <div className="amt_header_popup">
                         <b className="amit_heading">{lang.amtSliderHeader}</b> <span class="close"  onClick={() => close(true)}></span>
                       </div>
                       <div className="rangeslider__slider">
                         <div className="rangeslider__text">
                           {lang.amtSliderToggleText}
                         </div>
        
                         <div className="rangeslider__slide">
                          
                           <Switch
                             checked={annualMultiTripOn}
                             onClick={this.setAnnualMultiTripOnOff}
                             inputProps={{ 'aria-label': 'primary checkbox' }}
                             color="primary"
                             classes={{
                               root: classes.root,
                               switchBase: classes.switchBase,
                               thumb: classes.thumb,
                               track: classes.track,
                               checked: classes.checked,
                             }}
                             id="amtToggler"
                           />
                         </div>
                         </div>
                         <div className="amtRangePicker_range">
                         {annualMultiTripOn && (
                           
                           <div className="amtRangePicker dragContainer">
                                   <div className="rangeslider_slide_text"> <p>{lang.amtSliderRangeText}</p></div>

                             <div className="rangeslider_range">
                               {/* {lang.annualMultiTripRangeText} */}
                             </div>
                             <div>
                               <div className="rangeslider">
                                 <input
                                   onChange={this.setAnnualMultiTripDays}
                                   type="range"
                                   min="1"
                                   max="90"
                                  //  step="10"
                                   value={annualMultiTripSliderValue}
                                   className="slider"
                                   id="sliderRange"
                                 />
                               </div>
                               <div className=" rangeslider_range_text">
                                 <div>
                                   {lang.amt30Days}
                                 </div>
                                 <div>
                                   {lang.amt45Days}
                                 </div>
                                 <div>
                                   {lang.amt60Days}
                                 </div>
                                 <div>
                                   {lang.amt90Days}
                                 </div>
                               </div>
                             </div>
                           </div>
                         )} 
                       </div>
                       <div className="insurer_btn">
                         <button 
                           type="submit" 
                           className="clear_all"
                           onClick={() => close()} 
                         > 
                             {lang.quotesSkipButton}
                         </button>
                         <button 
                           className="primary_button apply_btn" 
                           type="submit" 
                           disabled={disabled}
                           onClick={this.handleApplyButton}
                         >
                             {lang.quotesApplyCaps}
                         </button>
                       </div>
                     </div>
                     </div>
                   </div>
          ): (
                           
            <div className="amtRangePicker dragContainer">
                             <div className="rangeslider_range">
                               {lang.amtSliderRangeText}
                             </div>
                             <div>
                               <div className="rangeslider">
                                 <input
                                   onChange={this.setAnnualMultiTripDays}
                                   type="range"
                                   min="1"
                                   max="90"
                                  //  step="10"
                                   value={annualMultiTripSliderValue}
                                   className="slider"
                                   id="sliderRange"
                                 />
                               </div>
                               <div className=" rangeslider_range_text">
                                 <div>
                                   {lang.amt30Days}
                                 </div>
                                 <div>
                                   {lang.amt45Days}
                                 </div>
                                 <div>
                                   {lang.amt60Days}
                                 </div>
                                 <div>
                                   {lang.amt90Days}
                                 </div>
                               </div>
                             </div>
                           </div>
          )
          }
          </>
        )
    }
}


AMTPlan.propTypes = {
    travellerData: PropTypes.instanceOf(Array).isRequired,
    close: PropTypes.func.isRequired,
    values: PropTypes.instanceOf(Array).isRequired,
    saveUpdatedData: PropTypes.func.isRequired,
    maxTripDuration: PropTypes.number.isRequired,
    destinationsData: PropTypes.instanceOf(Array).isRequired
}

const mapStateToProps = (state) =>({
    travellerData: state.travellerData,
    saveTravellerDOB: state.saveTravellerDOB,
    values: state.dateRange,
    destinationsData: state.destinationsData,
})

export default connect(mapStateToProps,{})(withStyles(styles)(AMTPlan))
