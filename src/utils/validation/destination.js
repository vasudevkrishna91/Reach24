import { lang } from "../../cms/i18n/en/index";

const DESTINATION_LIMIT = 9;

const validateDestinations = (destinations = [], tripSource) => {
    let error = "";

    if(destinations === undefined) return { valid: false}

    error = (!destinations || !destinations.length)
      ? lang.emptyDestination
      : error;

    if(tripSource === "Outside India") {
      error = lang.invalidCountry
    } else {
      destinations.forEach((country) => {
        if(country.CountryName === 'India') {
          error = "We currently do not have plans for travel within India. But they're coming soon."
        }
      })
    }

    return {
        valid: error === "",
        error
    };
};

export default validateDestinations;