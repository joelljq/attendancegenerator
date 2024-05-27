function createKeyboard(text) {

  var keyboard;

  if (text === 'Do you have any different PM status?' || text === 'Invalid answer, please key in again using the buttons below.' || text == 'Are you updating the same status for more than one personnel?') {
    keyboard = [
      ['Yes', 'No']
    ];
  }
  else if (text === 'What is your PM Status?'|| text === "Please enter his/her status" || text === 'Please enter your status' || text === 'Invalid status, please key in again using the buttons below.' || text === 'Both your AM and PM status are the same, please key in again.') {
    keyboard = [
      ['P', 'MA', 'OFF', 'Other Camp', 'DUTY', 'FFI', 'RSI'],
      ['MC', 'LL', 'OL', 'Others', 'DUTY HOTO', 'ORD FFI', 'RSO']
    ];
  }
  else if (text === "Please enter his/her updated rank" || text === "Please enter your updated rank" || text === 'Wrong rank input. Please reenter again') {
    keyboard = [
      ['PTE', 'LCP', 'CPL', 'CFC', '3SG', '2SG'],
      ['ME1T', 'ME1', 'ME2', 'ME3', 'ME4', 'ME5']
    ];
  }
  else if (text === 'How many users are you updating for?'){
    keyboard = ['1 User', 'More than one']
  }

  var replyKeyboardMarkup = {
    keyboard: keyboard,
    resize_keyboard: true,
    one_time_keyboard: true
  };


  if (text !== 'What is your PM Status?' && text !== 'Do you have any different PM status?' && text !== 'Please enter your status' && text !== "Please enter his/her status" && text !== 'Invalid status, please key in again using the buttons below.' && text !== 'Invalid answer, please key in again using the buttons below.' && text !== 'Both your AM and PM status are the same, please key in again.' && text !== "Please enter his/her updated rank" && text !== "Please enter your updated rank" && text !== 'Wrong rank input. Please reenter again' && text !== 'How many users are you updating for?' && text != 'Are you updating the same status for more than one personnel?') {
    // Disable the keyboard
    replyKeyboardMarkup = {
      remove_keyboard: true
    };
  }


  return JSON.stringify(replyKeyboardMarkup);
}

function sendMessage(id, text) {
  var keyboard = createKeyboard(text);
  var url = apiUrl + "/sendmessage";
  var payload = { 
    "type": "post",
    "payload": {
      "chat_id": String(id),
      "text": String(text),
      "reply_markup": keyboard,
      "muteHttpExceptions": true ,
      "parse_mode": "HTML" // Add parse_mode parameter
    }
  };
  try {
    var response = UrlFetchApp.fetch(url, payload);
    var responseCode = response.getResponseCode();
    if (responseCode == 403) {
      Logger.log("Chat ID " + id + " has blocked the bot. Skipping message.");
      return;
    }
    var responseContent = response.getContentText();
    Logger.log(responseContent);
  } catch (e) {
    Logger.log("Error sending message to chat ID " + id + ": " + e);
  }
}

function sendCMessage(id, text) {
  var url = apiUrl + "/sendmessage";
  var payload = { 
    "type": "post",
    "payload": {
      "chat_id": id,
      "text": String(text),
      "muteHttpExceptions": true,
      "parse_mode": "HTML" // Add parse_mode parameter
    }
  };
  try {
    var response = UrlFetchApp.fetch(url, payload);
    var responseCode = response.getResponseCode();
    if (responseCode == 403) {
      Logger.log("Chat ID " + id + " has blocked the bot. Skipping message.");
      return;
    }
    var responseContent = response.getContentText();
    Logger.log(responseContent);
  } catch (e) {
    Logger.log("Error sending message to chat ID " + id + ": " + e);
  }
}


function sendMessageOld(id, text, message) {
  var keyboard = createKeyboard(message, text);
  var url = apiUrl + "/sendmessage?parse_mode=HTML&chat_id=" + id + "&text=" + text + "&reply_markup=" + encodeURIComponent(keyboard);
  var opts = { "muteHttpExceptions": true };
  UrlFetchApp.fetch(url, opts).getContentText();
}

