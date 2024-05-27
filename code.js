var apiToken = "6944157202:AAFEqPcy0_FjiqpJdmI5ckEpPMgUf36q2J0";
var appUrl = "https://script.google.com/macros/s/AKfycbyvy77kRsl7OgruFyfc8tKPsPBUsIxZt5nosl9AF0LFlzfDaMBcEgGl6WnSJZAPYY7SGA/exec";
var apiUrl = "https://api.telegram.org/bot" + apiToken;
var sheet = SpreadsheetApp.openById('1C2ex2r4yVPXzKwmtBPGdhSjqnn0R2ybYUf-oAxEgR-I').getSheetByName('paradestate');
var dbsheet = SpreadsheetApp.openById('1C2ex2r4yVPXzKwmtBPGdhSjqnn0R2ybYUf-oAxEgR-I').getSheetByName('database');
var glsheet = SpreadsheetApp.openById('1C2ex2r4yVPXzKwmtBPGdhSjqnn0R2ybYUf-oAxEgR-I').getSheetByName('groupleader');
var fname = '';
var fstatus = '';
var command = {
  "/start": "welcome to my bot",
  "hi": "hello",
  "what is your name?": "my name is devisty bot"
}
var CHANNEL_ID = '-1002060070830';
function appendToSheet(chatId, name, orddate, link) {
  dbsheet.appendRow([chatId, name, orddate, link]);
}

// set webhook
function setWebhook() {
  var url = apiUrl + "/setwebhook?url=" + appUrl;
  var res = UrlFetchApp.fetch(url).getContentText();
  Logger.log(res);
}

function updateAttendanceStatus(name, status, enddate, pmstatus, chatId, updatetime, startdate) {
  var rankColumn = getColumnIndexByName(sheet, 'Rank');
  var nameColumn = getColumnIndexByName(sheet, 'Name');
  var statusColumn = getColumnIndexByName(sheet, 'Attendance_Status');
  var enddateColumn = getColumnIndexByName(sheet, 'End_Date');
  var pmstatusColumn = getColumnIndexByName(sheet, 'PM_Status');
  var updatebyColumn = getColumnIndexByName(sheet, 'Last_Updatedby');
  var updatetsColumn = getColumnIndexByName(sheet, 'UpdatedTimestamp');
  var arrowEmoji = "\u27A1\uFE0F";
  var data = sheet.getDataRange().getValues();
  let user = ''
  var printstatus = '';
  console.log(name)
  if (chatId === 3210) {
    user = 'TimeTree'
  }
  else {
    user = getusername(chatId);
  }
  var currentdate = convertToMMDDYY(getCurrentDateDDMMYY());
  var enddatets = totimestamp(enddate)
  var startdatets = totimestamp(startdate)
  var currentdatets = totimestamp(currentdate)
  try {
    if (status != 'MR' || pmstatus != 'MR') {
      for (var i = 1; i < data.length; i++) {
        var previousupdate = data[i][updatetsColumn - 1];
        var fullName = data[i][nameColumn - 1].toLowerCase();
        var rank = data[i][rankColumn - 1];
        var oristatus = data[i][statusColumn - 1];
        var nameParts = name.toLowerCase().split(' ');
        console.log(nameParts);
        if (nameParts.every(part => fullName.includes(part))) {
          if (updatetime > previousupdate || previousupdate === '') {
            if (status === null || status === '') {
              sheet.getRange(i + 1, statusColumn).setValue(oristatus);
              printstatus += oristatus
            }
            else {
              sheet.getRange(i + 1, statusColumn).setValue(status);
              printstatus += status
            }
            if ((enddatets === currentdatets && enddatets === startdatets) || enddatets < currentdatets) {
              sheet.getRange(i + 1, enddateColumn).setValue('');
            }
            else {
              sheet.getRange(i + 1, enddateColumn).setValue(enddate);
            }
            if (pmstatus) {
              printstatus += '/' + pmstatus
            }
            sheet.getRange(i + 1, pmstatusColumn).setValue(pmstatus);
            sheet.getRange(i + 1, updatebyColumn).setValue(user);
            sheet.getRange(i + 1, updatetsColumn).setValue(updatetime);
            var msg = rank + " " + fullName + ' from <b><u>' + oristatus + '</u></b> ' + arrowEmoji + ' <b><u>' + printstatus + '</u></b>\n';
            return msg;
          }
        }
      }
    }
  }
  catch (e) {
    console.log(e)
  }
}

function updateWorkAttendance(newStatus, names, chatId) {
  var nameColumn = getColumnIndexByName(sheet, 'Name');
  var statusColumn = getColumnIndexByName(sheet, 'Attendance_Status');
  var updatebyColumn = getColumnIndexByName(sheet, 'Last_Updatedby');
  var updatetsColumn = getColumnIndexByName(sheet, 'UpdatedTimestamp');
  var data = sheet.getDataRange().getValues();
  let user = '';
  user = getusername(chatId);
  for (var i = 1; i < data.length; i++) {
    var fullName = data[i][nameColumn - 1].toLowerCase();
    var status = data[i][statusColumn - 1];
    var nameFound = names.some(name => {
      var nameParts = name.toLowerCase().split(' ');
      return nameParts.every(part => fullName.includes(part));
    });
    if (!nameFound && status === 'P') {
      var updatetime = Date.now();
      sheet.getRange(i + 1, statusColumn).setValue(newStatus.toUpperCase());
      sheet.getRange(i + 1, updatebyColumn).setValue(user);
      sheet.getRange(i + 1, updatetsColumn).setValue(updatetime);
    }
  }
}


// Function to pad numbers with leading zeros
function pad(num, size) {
  var s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
}

function createInvite(channelId = CHANNEL_ID, name = "generatedByTelegramBot") {
  var apiUrl = 'https://api.telegram.org/bot' + apiToken + '/createChatInviteLink';
  var payload = {
    'method': 'post',
    'payload': {
      'name': name,
      'chat_id': channelId,
      'expire_date': `${Math.floor((Date.now() / 1000)) + 24 * 60 * 60}`, //Valid for 24hours; UNIX Timestamp in SECONDS
      'member_limit': 1, //can be 1 to 9999
      'creates_join_request': false
    }
  };
  var response = UrlFetchApp.fetch(apiUrl, payload);
  var link = JSON.parse(response.getContentText()).result.invite_link
  console.log(`Link generated: ${link}`)
  return link
}

function printattendance() {
  var rankColumn = getColumnIndexByName(sheet, 'Rank');
  var nameColumn = getColumnIndexByName(sheet, 'Name');
  var enddateColumn = getColumnIndexByName(sheet, 'End_Date');
  var statusColumn = getColumnIndexByName(sheet, 'Attendance_Status');
  var pmstatusColumn = getColumnIndexByName(sheet, 'PM_Status');
  var seccomColumn = getColumnIndexByName(sheet, 'Sec_com');
  var data = sheet.getDataRange().getValues();
  var msg = 'Attendance For CPAG ' + getCurrentDateDDMMYY() + '\n';
  msg += "\n"
  msg += printStatusCounts() + '\n';
  for (var i = 1; i < data.length; i++) {
    if (data[i][seccomColumn - 1]) {
      if (data[i][seccomColumn - 1] !== 'CPAG Mgmt Group') {
        msg += "\n";
      }
      msg += data[i][seccomColumn - 1] + "\n";
    }
    if ((data[i][enddateColumn - 1])) {
      var formattedString = Utilities.formatDate((data[i][enddateColumn - 1]), Session.getScriptTimeZone(), "dd/MM/yyyy");
      msg += (i + '. ' + data[i][rankColumn - 1] + ' ' + data[i][nameColumn - 1] + ' - ' + data[i][statusColumn - 1] + ' (until ' + formattedString + ')' + '\n');
    }
    else if ((data[i][pmstatusColumn - 1])) {
      msg += (i + '. ' + data[i][rankColumn - 1] + ' ' + data[i][nameColumn - 1] + ' - ' + data[i][statusColumn - 1] + '/' + data[i][pmstatusColumn - 1] + '\n');
    }
    else {
      msg += (i + '. ' + data[i][rankColumn - 1] + ' ' + data[i][nameColumn - 1] + ' - ' + data[i][statusColumn - 1] + '\n');
    }
  }
  return msg;
}

function getColumnIndexByName(sheet, name) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === name) {
      return i + 1;
    }
  }
  return -1;
}

function getColumnValuesByName(sheet, name) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var columnIndex = headers.indexOf(name);
  if (columnIndex === -1) {
    return []; // Return an empty array if column name is not found
  }
  var columnValues = sheet.getRange(2, columnIndex + 1, sheet.getLastRow() - 1, 1).getValues();
  var uniqueValues = new Set(columnValues.map(row => row[0])); // Use a Set to ensure uniqueness
  return Array.from(uniqueValues); // Convert the Set back to an array
}

function rankupdate(name, rank, user) {
  var nameColumn = getColumnIndexByName(sheet, 'Name');
  var rankColumn = getColumnIndexByName(sheet, 'Rank');
  var updatebyColumn = getColumnIndexByName(sheet, 'Last_Updatedby');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var fullName = data[i][nameColumn - 1].toLowerCase();
    var nameParts = name.toLowerCase().split(' ');
    if (nameParts.every(part => fullName.includes(part))) {
      sheet.getRange(i + 1, rankColumn).setValue(rank);
      sheet.getRange(i + 1, updatebyColumn).setValue(user);
      return;
    }
  }
}

function grabinvitelink(chatId) {
  var inviteColumn = getColumnIndexByName(dbsheet, 'Invite_Link');
  var data = dbsheet.getDataRange().getValues();
  var invitelink = data[getRowIndexByValue(dbsheet, 'chatId', chatId) - 1][inviteColumn - 1];
  Logger.log(invitelink);
  return invitelink
}

function graborddatelink(chatId) {
  var inviteColumn = getColumnIndexByName(dbsheet, 'ORD_Date');
  var data = dbsheet.getDataRange().getValues();
  var invitelink = data[getRowIndexByValue(dbsheet, 'chatId', chatId) - 1][inviteColumn - 1];
  Logger.log(invitelink);
  return invitelink
}



// handle webhook
function doPost(e) {
  var msg = '';
  var webhookData = JSON.parse(e.postData.contents);
  var chatId = webhookData.message.from.id;
  var message = String(webhookData.message.text);
  const propertiesService = PropertiesService.getScriptProperties();
  let chatDialogStatus = propertiesService.getProperty(chatId);
  var nmsg = '<b>' + getusername(chatId) + ' has updated for</b>\n'
  try {
    if (message.startsWith("/")) {
      if (message === '/start') {
        propertiesService.deleteProperty(chatId);
        msg = 'Welcome to the 62FMD CPAG Parade State Bot \n The below commands are available for usage \n';
        msg += '/register - Use this to register if you are new to this bot\n';
        msg += '/updateattendance - Use this to update your status for the day\n';
        msg += '/printparadestate - Use this to print out the latest parade state\n';
        msg += "/manualupdatestatus - Use this to help update respective personnel's status\n";
        msg += '/updatemyrank - Update your rank to your latest one\n'
        msg += "/manualupdaterank - Update latest rank of other personnel's"
        msg += "/work - Update status of working personnels at their respective camps"
      }
      else if (message === '/register') {
        propertiesService.deleteProperty(chatId);
        var check = checkforuser(chatId);
        if (check === false) {
          propertiesService.setProperty(chatId, 'WAITING_FOR_MATCHNAME');
          msg = 'Enter your name';
        }
        else if (check === true) {
          msg = 'You have already registered!\n';
          msg += 'Please use your generated link to join the channel\n'
          msg += grabinvitelink(chatId);
        }
      }

      else if (message === '/updateattendance') {
        if (checkforuser(chatId) === true) {
          var fname = getusername(chatId);
          propertiesService.deleteProperty(chatId);
          propertiesService.deleteProperty('fname_' + chatId);
          propertiesService.deleteProperty('fstatus_' + chatId);
          var fnamelist = []
          fnamelist.push(fname)
          var fnameliststring = fnamelist.join('&')
          propertiesService.setProperty('fname_' + chatId, fnameliststring);
          propertiesService.setProperty(chatId, 'WAITING_FOR_ADD_STEP_1');
          msg = 'Please enter your status';
        }
        else {
          msg = 'You are not registered. Please use the command /register to register first.'
        }
      }
      else if (message === '/printparadestate') {
        propertiesService.deleteProperty(chatId);
        checkforuser(chatId);
        if (checkforuser(chatId) === true) {
          msg = printattendance();
        }
        else {
          msg = 'You are not registered. Please use the command /register to register first.';
        }
      }
      else if (message === '/manualupdatestatus') {
        if (checkforuser(chatId) === true) {
          propertiesService.deleteProperty(chatId);
          propertiesService.deleteProperty('fname_' + chatId);
          propertiesService.deleteProperty('fstatus_' + chatId);
          propertiesService.setProperty(chatId, 'WAITING_FOR_NOPERSONNEL');
          msg = 'Are you updating the same status for more than one personnel?';
        }
        else {
          msg = 'Invalid answer, please key in again using the buttons below.'
        }
      }
      else if (message === '/updatemyrank') {
        if (checkforuser(chatId) === true) {
          propertiesService.deleteProperty(chatId);
          var fname = getusername(chatId);
          propertiesService.setProperty('fname_' + chatId, fname);
          propertiesService.setProperty(chatId, 'WAITING_FOR_RANK_INPUT');
          msg = 'Please enter your updated rank';
        }
        else {
          msg = 'You are not registered. Please use the command /register to register first.'
        }
      }
      else if (message === '/manualupdaterank') {
        if (checkforuser(chatId) === true) {
          propertiesService.deleteProperty(chatId);
          propertiesService.setProperty(chatId, 'WAITING_FOR_NAMEINPUTRANK')
          msg = "What is the personnel's name?";
        }
        else {
          msg = 'You are not registered. Please use the command /register to register first.'
        }
      }
      else if (message === '/work') {
        if (checkforuser(chatId) === true) {
          propertiesService.deleteProperty(chatId);
          propertiesService.setProperty(chatId, 'WAITING_FOR_CAMPINPUT')
          msg = "Please enter the camp's name: "
        }
        else {
          msg = 'You are not registered. Please use the command /register to register first.'
        }
      }
      else if (message === '/sendupdateparadestate') {
        if (checkforuser(chatId) === true) {
          propertiesService.deleteProperty(chatId)
          propertiesService.setProperty(chatId, "WAITING_FOR_PARADESTATE")
          msg = "Send in the new parade state from WhatsApp: "
        }
      }
      else {
        msg = 'You have entered the wrong command! Please use /start to see the available commands';
      }
    }
    else if (chatDialogStatus === 'WAITING_FOR_PARADESTATE') {
      propertiesService.deleteProperty(chatId)
      var tmsg = testreplace(message).toUpperCase();
      msg = '<b>Status updated for</b> \n'
      msg += tmsg
      var username = getusername(chatId)
      var nmsg = '<b>' + username + ' has updated for</b>\n'
      nmsg += tmsg;
      sendCMessage('-1002060070830', nmsg);
    }
    else if (chatDialogStatus === 'WAITING_FOR_MATCHNAME') {
      var valid = uservalid(message);
      if (valid === true) {
        propertiesService.setProperty('fname_' + chatId, message);
        propertiesService.setProperty(chatId, 'WAITING_FOR_ORDDATE')
        msg = 'Key in your ORD Date in DDMMYY format: ';
      }
      else {
        msg = 'Your name was not found in the list, please try again. If it still fails, try entering a full name instead'
      }
    }
    else if (chatDialogStatus === 'WAITING_FOR_NOPERSONNEL') {
      try {
        if (message === 'Yes') {
          propertiesService.setProperty('choice_' + chatId, message)
          propertiesService.setProperty(chatId, 'WAITING_FOR_ADD_STEP_0')
          msg = 'Please key in personnels who will be at NSDC instead. Format will be: E.g.\n'
          msg += '1. Joel Lee\n2. Keanu Lim\n3. Bing Quan'
        }
        else if (message === 'No') {
          propertiesService.setProperty('choice_' + chatId, message)
          propertiesService.setProperty(chatId, 'WAITING_FOR_ADD_STEP_0')
          msg = "What is the personnel's name"
        }
        else {
          msg = 'Your option is invalid, please choose the right option.'
        }
      } catch (e) {
        msg = "Error is " + e;
      }

    }
    else if (chatDialogStatus === 'WAITING_FOR_CAMPINPUT') {
      propertiesService.setProperty('fstatus_' + chatId, message);
      propertiesService.setProperty(chatId, 'WAITING_FOR_NONWORKNAMES');
      msg = 'Please key in personnels who will be at NSDC instead. Format will be: E.g.\n'
      msg += '1. Joel Lee\n2. Keanu Lim\n3. Bing Quan'
    }
    else if (chatDialogStatus === 'WAITING_FOR_ORDDATE') {
      try {
        var valid = isValidDateFormat(message);
        if (valid === true) {
          var fname = propertiesService.getProperty('fname_' + chatId);
          var orddate = convertToMMDDYY(message);
          var link = createInvite(CHANNEL_ID, '62BOT')
          appendToSheet(chatId, fname, orddate, link);
          msg = 'You have been registered!\n'
          msg += 'Name: ' + fname + '\n'
          msg += 'ORD Date: ' + orddate + '\n'
          msg += 'Your unique invite link to the channel is ' + link + '\nPlease join within 24 hours and do not share this link with others'
          propertiesService.deleteProperty('fname_' + chatId)
          propertiesService.deleteProperty(chatId);
        }
        else {
          msg = 'Invalid date/format, please key in again.'
        }
      } catch (e) {
        msg = 'Error: ' + e;
      }

    }
    else if (chatDialogStatus === 'WAITING_FOR_NONWORKNAMES') {
      let namevalid = true;
      try {
        if (isMessageInFormat(message)) {
          var names = message.split(/\d+\.\s+/).slice(1).map(name => name.trim());
          names.forEach(function (name) {
            if (!uservalid(name)) {
              namevalid = false;
              return; // Exit the forEach loop
            }
          });
          if (namevalid === true) {
            var fstatus = propertiesService.getProperty('fstatus_' + chatId);
            updateWorkAttendance(fstatus, names, chatId);
            propertiesService.deleteProperty('fstatus_' + chatId)
            propertiesService.deleteProperty(chatId)
            msg = 'Attendance has been updated for work personnels.';
          }
          else {
            msg = 'Names cannot be found in the database! Please key in correctly or in full name.';
          }
        } else {
          msg = 'Wrong format! Please key in again using the format mentioned in the previous prompt.'
        }
      } catch (e) {
        msg = 'Error: ' + e;
      }

    }
    else if (chatDialogStatus === 'WAITING_FOR_NAMEINPUTRANK') {
      var valid = uservalid(message);
      try {
        if (valid === true) {
          var fname = getusername2(message);
          propertiesService.setProperty('fname_' + chatId, fname);
          propertiesService.setProperty(chatId, 'WAITING_FOR_RANK_INPUT');
          msg = "Please enter his/her updated rank";
        }
        else {
          msg = "Please re-enter his/her name again. If it still fails, try entering a full name instead"
        }
      } catch (e) {
        msg = 'Error: ' + e;
      }

    }
    else if (chatDialogStatus === 'WAITING_FOR_RANK_INPUT') {
      var rank = message;
      if (rankvalidation(rank) === true) {
        var user = getusername(chatId);
        var fname = propertiesService.getProperty('fname_' + chatId);
        propertiesService.deleteProperty(chatId);
        msg = 'You have updated ' + fname + "'s rank to " + rank;
        rankupdate(fname, rank, user);
      }
      else {
        msg = 'Wrong rank input. Please reenter again';
      }

    }
    else if (chatDialogStatus === 'WAITING_FOR_ADD_STEP_0') {
      var option = propertiesService.getProperty('choice_' + chatId);
      if (option === 'Yes') {
        let namevalid = true;
        try {
          if (isMessageInFormat(message)) {
            var names = message.split(/\d+\.\s+/).slice(1).map(name => name.trim());
            var fnamelist = []
            names.forEach(function (name) {
              if (!uservalid(name)) {
                namevalid = false;
                return; // Exit the forEach loop
              }
              fnamelist.push(name)
            });
            if (namevalid === true) {
              var fnameliststring = fnamelist.join('&')
              propertiesService.setProperty('fname_' + chatId, fnameliststring);
              propertiesService.setProperty(chatId, 'WAITING_FOR_ADD_STEP_1')
              msg = 'Please enter his/her status';
            }
            else {
              msg = 'Names cannot be found in the database! Please key in correctly or in full name.';
            }
          } else {
            msg = 'Wrong format! Please key in again using the format mentioned in the previous prompt.'
          }
        } catch (e) {
          msg = 'Error: ' + e;
        }
      }
      else {
        if (checkforuser(chatId) === true) {
          var valid = uservalid(message);
          if (valid === true) {
            var fname = getusername2(message);
            var fnamelist = []
            fnamelist.push(fname)
            var fnameliststring = fnamelist.join('&')
            propertiesService.setProperty('fname_' + chatId, fnameliststring);
            propertiesService.setProperty(chatId, 'WAITING_FOR_ADD_STEP_1');
            msg = "Please enter his/her status";
          }
          else {
            msg = "Please re-enter his/her name again. If it still fails, try entering a full name instead"
          }
        }
        else {
          msg = 'You are not registered. Please use the command /register to register first.';
        }
      }

    }
    else if (chatDialogStatus === 'WAITING_FOR_ADD_STEP_1') {
      var fstatus = message;
      if (message.toLowerCase() === 'p' || message.toLowerCase() === 'ma' || message.toLowerCase() === 'duty hoto' || message.toLowerCase() === 'll' || message.toLowerCase() === 'off' || message.toLowerCase() === 'ffi' || message.toLowerCase() === 'ord ffi') {
        propertiesService.setProperty('fstatus_' + chatId, fstatus);
        propertiesService.setProperty(chatId, 'WAITING_FOR_PMOPTIONS');
        msg = 'Do you have any different PM status?';
      }
      else if (message.toLowerCase() === 'duty' || message.toLowerCase() === 'rsi' || message.toLowerCase() === 'rso') {
        var fnameliststring = propertiesService.getProperty('fname_' + chatId);
        var fnamelist = fnameliststring.split('&');
        propertiesService.deleteProperty('fname_' + chatId);
        propertiesService.deleteProperty(chatId);
        msg = 'Done. You have updated \n'
        var timestamp = Date.now();
        for (let i = 0; i < fnamelist.length; i++) {
          var fname = fnamelist[i]
          msg += fname + '\n'
          nmsg += updateAttendanceStatus(fname, fstatus, '', '', chatId, timestamp, getCurrentDateDDMMYY());
        }
        msg += 'status to ' + status;
        sendCMessage('-1002060070830', nmsg.toUpperCase());
      }
      else if (message.toLowerCase() === 'others') {
        propertiesService.setProperty(chatId, 'WAITING_FOR_COURSECAMPNAME');
        msg = 'Please enter your status name';
      }
      else if (message.toLowerCase() === 'other camp') {
        propertiesService.setProperty(chatId, 'WAITING_FOR_COURSECAMPNAME');
        msg = 'Please enter the name of the camp';
      }
      else if (message.toLowerCase() === 'ol' || message.toLowerCase() === 'mc') {
        propertiesService.setProperty('fstatus_' + chatId, fstatus);
        propertiesService.setProperty(chatId, 'WAITING_FOR_ENDDATESTATUS');
        msg = 'Please enter your end date (Format DDMMYY)';
      }
      else {
        msg = 'Invalid status, please key in again using the buttons below.';
      }

    }
    else if (chatDialogStatus === 'WAITING_FOR_COURSECAMPNAME') {
      propertiesService.setProperty('fstatus_' + chatId, message);
      propertiesService.setProperty(chatId, 'WAITING_FORCOURSECAMPSTATUS');
      msg = 'Do you have any different PM status?';
    }
    else if (chatDialogStatus === 'WAITING_FORCOURSECAMPSTATUS') {
      if (message === 'Yes') {
        propertiesService.setProperty(chatId, 'WAITING_FOR_ADDPMSTATUS');
        msg = 'What is your PM Status?';
      }
      else if (message === 'No') {
        propertiesService.setProperty(chatId, 'WAITING_FOR_ENDDATESTATUS');
        msg = 'Please enter your end date (Format DDMMYY)';
      }
      else {
        msg = 'Invalid answer, please key in again using the buttons below.';
      }
    }
    else if (chatDialogStatus === 'WAITING_FOR_PMOPTIONS') {
      if (message === 'Yes') {
        propertiesService.setProperty(chatId, 'WAITING_FOR_ADDPMSTATUS');
        msg = 'What is your PM Status?';
      }
      else if (message === 'No') {
        var fstatus = propertiesService.getProperty('fstatus_' + chatId);
        if (fstatus === 'LL' || fstatus === 'OFF') {
          propertiesService.setProperty(chatId, 'WAITING_FOR_ENDDATESTATUS');
          msg = 'Please enter your end date (Format DDMMYY)';
        }
        else {
          var fnameliststring = propertiesService.getProperty('fname_' + chatId);
          var fnamelist = fnameliststring.split('&');
          propertiesService.deleteProperty(chatId);
          msg = 'Done. You have updated \n';
          var timestamp = Date.now();
          for (let i = 0; i < fnamelist.length; i++) {
            var fname = fnamelist[i]
            msg += fname + '\n'
            nmsg += updateAttendanceStatus(fname, fstatus, '', '', chatId, timestamp, getCurrentDateDDMMYY());
          }
          msg += 'status to ' + fstatus;
          sendCMessage('-1002060070830', nmsg.toUpperCase());
        }
      }
      else {
        msg = 'Invalid answer, please key in again using the buttons below.';
      }
    }
    else if (chatDialogStatus === 'WAITING_FOR_ADDPMSTATUS') {
      var pmstatus = message;
      var fstatus = propertiesService.getProperty('fstatus_' + chatId);
      if (message === 'Others' || message === 'Other Camp') {
        propertiesService.setProperty(chatId, 'WAITING_FOR_PMSTATUSNAME');
        msg = 'Please key in your Status/Camp name';
      }
      else if (message === fstatus) {
        msg = 'Both your AM and PM status are the same, please key in again.'
      }
      else {
        var fname = propertiesService.getProperty('fname_' + chatId);
        propertiesService.deleteProperty('fname_' + chatId);
        propertiesService.deleteProperty('fstatus_' + chatId);
        propertiesService.deleteProperty(chatId);
        msg = 'Done. You have updated \n';
        var timestamp = Date.now();
        for (let i = 0; i < fnamelist.length; i++) {
          var fname = fnamelist[i]
          msg += fname + '\n'
          nmsg += updateAttendanceStatus(fname, fstatus, '', pmstatus, chatId, timestamp, getCurrentDateDDMMYY());
        }
        msg += 'status to ' + fstatus + '/' + pmstatus;
        sendCMessage('-1002060070830', nmsg.toUpperCase());
      }
    }
    else if (chatDialogStatus === 'WAITING_FOR_PMSTATUSNAME') {
      var pmstatus = message;
      var fname = propertiesService.getProperty('fname_' + chatId);
      var fstatus = propertiesService.getProperty('fstatus_' + chatId);
      propertiesService.deleteProperty('fname_' + chatId);
      propertiesService.deleteProperty('fstatus_' + chatId);
      propertiesService.deleteProperty(chatId);
      msg = 'Done. You have updated \n';
      var timestamp = Date.now();
      for (let i = 0; i < fnamelist.length; i++) {
        var fname = fnamelist[i]
        msg += fname + '\n'
        nmsg += updateAttendanceStatus(fname, fstatus, '', pmstatus, chatId, timestamp, getCurrentDateDDMMYY());
      }
      msg += 'status to ' + fstatus + '/' + pmstatus
      sendCMessage('-1002060070830', nmsg.toUpperCase());
    }
    else if (chatDialogStatus === 'WAITING_FOR_ENDDATESTATUS') {
      if (isValidDateFormat(message) === true) {
        var enddate = convertToMMDDYY(message);
        var currentdate = convertToMMDDYY(getCurrentDateDDMMYY());
        var fnameliststring = propertiesService.getProperty('fname_' + chatId);
        var fnamelist = fnameliststring.split('&');
        var fstatus = propertiesService.getProperty('fstatus_' + chatId);
        propertiesService.deleteProperty('fname_' + chatId);
        propertiesService.deleteProperty('fstatus_' + chatId);
        propertiesService.deleteProperty(chatId);
        var timestamp = Date.now();
        msg = 'Done. You have updated\n'
        for (let i = 0; i < fnamelist.length; i++) {
          var fname = fnamelist[i]
          if (enddate == currentdate) {
            msg += fname + '\n'
            nmsg += updateAttendanceStatus(fname, fstatus, '', '', chatId, timestamp, getCurrentDateDDMMYY());
          }
          else {
            msg += fname + '\n'
            nmsg += updateAttendanceStatus(fname, fstatus, enddate, '', chatId, timestamp, getCurrentDateDDMMYY());
          }
        }
        sendCMessage('-1002060070830', nmsg.toUpperCase());
        msg += 'status to ' + fstatus;


      }
      else {
        msg = 'Please reinput ur end date again (Format DDMMYY)';
      }
    }
    else {
      propertiesService.deleteProperty(chatId);
      msg = 'Hello ' + name + ' id: ' + chatId + '\nYour text:\n' + message;
      msg += '\nPossible commands:' + commands;
    }
  } catch (e) {
  }
  sendMessage(chatId, msg);
}


function testreplace(newlist, chatId) {
  var originalattendance = printattendance();
  var newattendance = newlist
  var formatoldlist = addintolist(originalattendance)
  var formatnewlist = addintolist(newattendance)
  var timestamp = Date.now();
  // var userobj = {
  //   "name":
  //     "status" :
  // }
  Logger.log(formatnewlist);
  var testmsg = ''
  for (var i = 0; i < formatoldlist.length; i++) {
    try {
      var olditem = formatoldlist[i]
      var newitem = formatnewlist[i]
      if (olditem != newitem) {
        var parts = newitem.split('-');
        console.log('split 1 ' + parts[1])
        var name = parts[0].split('. ')[1].split(' ').slice(1).join(' ').trim();
        console.log('split 2' + name)
        var status = parts[1].trim();
        if (status.includes('/')) {
          console.log('include /')
          var statusindex = status.split('/')
          var amstatus = statusindex[0].trim()
          var pmstatus = statusindex[1].trim()
        }
        else {
          var amstatus = status
          var pmstatus = ''
        }
        var curdate = convertToMMDDYY(getCurrentDateDDMMYY())
        console.log('Name: ' + name + '\nAM Status: ' + amstatus + '\nPM Status: ' + pmstatus)
        testmsg += updateAttendanceStatus(name, amstatus, curdate, pmstatus, chatId, timestamp, curdate)
        console.log(testmsg);
      }
    }
    catch (e) {
      console.log(formatnewlist[i] + ' ' + e)
    }

  }
  return testmsg
}

function addintolist(list) {
  var formatlist = []
  var splitlist = list.split('\n')
  for (var i = 0; i < splitlist.length; i++) {
    var item = splitlist[i]
    if (item.match(/\d+\.\s/gm)) {
      formatlist.push(item)
    }
  }
  return formatlist;
}

function doGet(e) {
  return ContentService.createTextOutput("Method GET not allowed");
}
