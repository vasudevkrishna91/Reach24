import Moment from "moment";
import { extendMoment } from "moment-range";
import { getRelationId } from "../../../../utils/helper";
import { lang } from "../../../../cms/i18n/en";
import { customEvent } from "../../../../GA/gaEvents";

const moment = extendMoment(Moment);

const defineFamily = (props, state) => {
  const { values, destinationsData } = props;
  const { families, travellerData } = state;

  let data = {};
  const members = [];
  let alert = "";
  let showFamilyAlert = "";
  let error = false;

  Object.keys(families).forEach(family => {
    let childCount = 0;
    families[family].forEach(familyData => {
      if (
        (familyData.relationShip === "Father" ||
          familyData.relationShip === "Mother" ||
          familyData.relationShip === "Self" ||
          familyData.relationShip === "Spouse") &&
        familyData.age < 18
      ) {
        error = true;
        alert = lang.quotesAgeBw1899Alert;
      }

      if (familyData.relationShip === "Son" || familyData.relationShip === "Daughter") {
        childCount = childCount + 1;
        if (childCount > 3) {
          error = true;
          // alert = 'Maximum 3 Childs are allowed per family';

          this.setState(
            {
              showFamilyAlert: lang.quotesMax3ChildAlert
            },
            () => {
              setTimeout(() => {
                this.setState({
                  showFamilyAlert: ""
                });
              }, 5000);
            }
          );
        }
      } else if (!familyData.relationShip) {
        error = true;
        alert = lang.quotesSelectRelationshipAlert;
      }
    });
  });

  if (!error) {
    Object.keys(families).forEach((key, index) => {
      families[key].forEach(member => {
        members.push({
          ...member,
          temporaryProfileID: `F${index}`,
          proposerRelationID: getRelationId(member.relationShip),
          relationTypeID: getRelationId(member.relationShip)
        });
      });
    });

    if (travellerData.length > 0) {
      travellerData.forEach(travellers => {
        const obj = {
          ...travellers,
          proposerRelationID: 11,
          relationTypeID: 11
        };
        members.push(obj);
      });
    }

    data[data] = {
      members,
      tripCountries: [...destinationsData],
      tripStartDate: moment(values[0]).format("YYYY-MM-DD"),
      tripEndDate: moment(values[1]).format("YYYY-MM-DD")
    };
    data.actionTypeID = "6";
  }
  //console.log(members);
  return { alert, data, showFamilyAlert, members };
};

const gaCustomEvent = (props, label) => {
  const gaData = {
    eventCategory: "Trv.BU Quotes",
    eventAction: "Trv.click",
    eventLabel: label,
    eventValue: "",
    flowName: props.flowNameGA
  };
  customEvent(gaData);
};

const transformTravellersData = (families, travellerData) => {
  const travellers = [];
  travellerData.forEach((traveller, id) => {
    let check = true;
    Object.keys(families).forEach(key => {
      if (families[key].findIndex(family => family.TemporaryID === traveller.TemporaryID) !== -1) {
        check = false;
      }
    });
    if (check) {
      const obj = {
        ...traveller,
        id: traveller.labelTraveller.split(" ")[1],
        name: traveller.labelTraveller
      };
      travellers.push(obj);
    }
  });
  return travellers;
};

const addFamilyMember = (e, state) => {
  e.preventDefault();
  let { noOfFamily } = state;
  const { families, noOfTravellers } = state;
  if (Object.keys(families).length < noOfTravellers) {
    noOfFamily += 1;
    families[`family${noOfFamily}`] = [];
  }
    return { noOfFamily, families };
  /*this.setState({
    noOfFamily,
    families
  });*/
};

export const common = {
  defineFamily,
  gaCustomEvent,
  transformTravellersData,
  addFamilyMember
};
