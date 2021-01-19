import _ from 'lodash';
import { lang } from "../../cms/i18n/en/index";

const validTravellerData = (data) => {

    if(_.isEmpty(data)) 
        return {
            valid: false,
            error: lang.emptyTravellerError 
        };

    let valid = true;

    data.forEach((item) => {
        valid = _.isEmpty(item) ? false : valid;
        valid = !_.isEmpty(item) && (item.age === null || item.age === undefined) ? false : valid; 
    });

    return {
        valid: valid === true,
        error: "Incomplete data"
    }
        
}

export default validTravellerData;