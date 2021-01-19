// import { lang } from "../../cms/i18n/en/index";
import validTravellerData from "./traveller";
import validateDestinations from "./destination";
import validTripDate from "./tripDate";

const validatePreQuoteData = (destinationsData, travellerData, tripDate, tripSource) => {
    let valid = true;
    const { valid: destinationValid } = validateDestinations(destinationsData, tripSource);
    const { valid: travellerValid } = validTravellerData(travellerData);
    const { valid: tripDateValid } = validTripDate(tripDate);
    valid = destinationValid && travellerValid && tripDateValid;
    return {
        valid: valid === true,
        error: "Incomplete data"
    }
        
}

export default validatePreQuoteData;