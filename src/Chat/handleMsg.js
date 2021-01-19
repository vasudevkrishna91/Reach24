//window.addEventListener("message", handleMessage, false);
export function handleMessage(event) {
  if(event.data.message == "traveldetails"){				
    if(event.data.parameter == "querytype"){
      var s = (event.data.value == 'Already Purchased')?'Click on already purchased':'Click on new Policy';
    }
    if(event.data.parameter == "typeoftravel"){
      //$scope.chatBotTabs(event.data.value)
    }
    if(event.data.parameter == "mobilenumber"){
      //$scope.chatBotMobile(event.data.value)
    }
    if(event.data.parameter == "nooftravelers"){
    }
    if(event.data.parameter == "country"){
      // console.log(event.data.value)
      //$scope.chatBotCountry(event.data.value)
      // var countryCSV = ""
      // angular.forEach(event.data.value, function(obj, index){ 
      //   countryCSV += obj+','
      // });		
    }
    if(event.data.parameter == "tripstartdate"){
      //$scope.chatBotStrtDate(event.data.value)	
    }
    if(event.data.parameter == "tripenddate"){
      //$scope.chatBotEndDate(event.data.value)
    }
    if(event.data.parameter == "amt"){
      //$scope.chatBotAMT(event.data.value)
    }
    if(event.data.parameter == "maxtripduration"){
      //$scope.chatBotMaxTrip(event.data.value)
    }
    if(event.data.parameter == "ped"){
      //$scope.chatBotPed(event.data.value)
    }
    if(event.data.parameter == "age"){
      //$scope.chatBotAge(event.data.value)
    }
    if(event.data.parameter == "confirmdetails"){
      //$scope.chatBotPed(event.data.value)
    }				
    if(event.data.parameter == "name"){
      //$scope.chatBotName(event.data.value)
    }
  }
  else if(event.data.msg == "plansFetched"){
  // plans displayed to customer in Chat
    // GA360Service.customEventTrack('Chat query','Chat query','Quotes called in the chat','');
    // GAService.eventCapture('Chat query','Quotes called in the chat','')
  } else if(event.data.msg == "noPlansFromApi"){
    // no plans available from api, transfer chat to agent.
    // GA360Service.customEventTrack('Chat query','Chat query','Travel to agent message','');
    // GAService.eventCapture('Chat query','Travel to agent message','')
  } else if(event.data.msg == "Transfer_to_Agent"){
    // Chat Transfered to agent. Bot stops.
    // GA360Service.customEventTrack('Chat query','Chat query','Travel to agent message','');
    // GAService.eventCapture('Chat query','Travel to agent message','')
  }else if(event.data == "livechat-close"){
    // Rating given by customer.
    // GA360Service.customEventTrack('Chat rating','Chat rating','Chat rated','');
    // GAService.eventCapture('Chat rating','Chat rated','')
  }else  if(event.data.msg == "chat_closed"){
    // chat closed.
    // GA360Service.customEventTrack('Chat closure','Chat closure','','');
    // GAService.eventCapture('Chat closure','','')
  }
  else if(event.data.message == "messages_onCreated"){
    //GA360Service.customEventTrack('Chat initiatite','Chat initiatite','Chat open','');
    // GA360Service.customEventTrack('Chat initiatite','Chat open',//$scope.baseObj.EnquiryID,'');
    // GAService.eventCapture('Chat initiatite','Mobile number submit','')
  }
}