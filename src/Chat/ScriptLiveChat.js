import { chatScriptLib } from './chatScriptLib';
export const ShowDesktopchat = (data) => {
  if(document.getElementById('rocketchat-iframe') == 'undefined' || document.getElementById('rocketchat-iframe') == null){(
    function (w, d, s, u) {
      w.RocketChat = function (c) {
        w.RocketChat._.push(c)
      };
      w.RocketChat._ = [];
      w.RocketChat.url = u;
      var h = d.getElementsByTagName(s)[0], j = d.createElement(s);
      j.async = true; j.src = chatScriptLib(window);
      h.parentNode.insertBefore(j, h);
    }
  )  
    (window, document, 'script', 'https://pbchat.policybazaar.com/livechat?product=Travel&sh=1&leadid='+data.leadid+'&enquiryid='+data.enquiryId+'&encID='+data.encId);
  }
  if(document.getElementsByClassName('rocketchat-widget')[0] != undefined){
    document.getElementsByClassName('rocketchat-widget')[0].style.display = "inline";
  }
}

