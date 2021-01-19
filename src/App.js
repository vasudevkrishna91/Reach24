import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import Home from "./ui/journey/Home";
import Quotes from "./ui/journey/Quotes/Quotes";
import Checkout from "./ui/journey/Checkout/Checkout";
import ProposalStep1 from "./ui/journey/ProposalStep1/ProposalStep1";
import ProposalStep2 from "./ui/journey/ProposalStep2/ProposalStep2";
import Thanks from "./ui/journey/Thanks/Thanks";
import PaymentRequest from "./ui/journey/Payment/PaymentRequest";
import PaymentResponse from "./ui/journey/Payment/PaymentResponse";
import PaymentFailed from "./ui/journey/Payment/PaymentFailed";
import ContinueJourney from "./ui/components/ContinueJourney/ContinueJourney";
import Filters from "./ui/journey/MobileView/Filters/Filters";
import Family from "./ui/journey/MobileView/Family/Family";
import Profiletab from "./ui/journey/MobileView/ProfileTab/Profiletab";

import "./App.css";
import "./index.css";

// const history = createBrowserHistory({ basename: '/v2' });

const App = () => {
  return (
    <main role="main" class="main">
      <Router>
        <Switch>
          <Route path="/v2/proposalStep1/:encryptedProposerId" component={ProposalStep1}></Route>
          <Route path="/v2/proposalStep2/:encryptedProposerId?/:al?" component={ProposalStep2}></Route>
          <Route exact path="/v2/checkout/:encryptedProposerId?" component={Checkout}></Route>
          <Route path="/v2/quotes/:encryptedProposerId?" component={Quotes}></Route>
          <Route path="/v2/thanks/:encryptedProposerId?" component={Thanks}></Route>
          <Route path="/v2/paymentRequest" component={PaymentRequest}></Route>
          <Route path="/v2/paymentResponse" component={PaymentResponse}></Route>
          <Route path="/v2/paymentFailed" component={PaymentFailed}></Route>
          <Route path="/v2/continueJourney/:encryptedProposerId" component={ContinueJourney}></Route>
          <Route path="/v2/mobileView/Filters" component={Filters}></Route>
          <Route path="/v2/mobileView/Family" component={Family}></Route>
          <Route path="/v2/mobileView/Profile" component={Profiletab}></Route>
          <Route path="/v2/:encryptedProposerId" component={Home}></Route>
          <Route path="/" component={Home}></Route>
        </Switch>
      </Router>
    </main>
  );
};

export default App;
