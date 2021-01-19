import Moment from "moment";
import { extendMoment } from "moment-range";
const moment = extendMoment(Moment);
const validTripDate = (dateRange) => {
    let valid = true;
    let currentDate = moment(moment().format('L')).unix();
    var startDate = 0
    if(dateRange[0]!=null){
        startDate = moment(moment(dateRange[0]).format('L')).unix()
    } 
    
  
    valid = (currentDate <= startDate) &&
            dateRange[0] && 
            dateRange[1] &&
            moment(dateRange[0])._isValid &&
            moment(dateRange[1])._isValid

    return {
        valid: valid === true,
        error: "Invalid Date"
    }       
}

export default validTripDate;