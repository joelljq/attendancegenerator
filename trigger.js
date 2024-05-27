function changeStatusToP() {
  var statusColumn = getColumnIndexByName(sheet, 'Attendance_Status');
  var endDateColumn = getColumnIndexByName(sheet, 'End_Date'); // Assuming the end date column is column C
  var pmstatusColumn = getColumnIndexByName(sheet, 'PM_Status');
  var updatebyColumn = getColumnIndexByName(sheet, 'Last_Updatedby');
  var updateTimebyColumn = getColumnIndexByName(sheet, 'UpdatedTimestamp');

  // Set the current date in SGT
  var today = new Date();
  var sgtOffset = 8; // SGT is UTC+8
  today.setHours(today.getHours() + sgtOffset);

  // Set tomorrow's date in SGT
  var tomorrow = new Date(today);
  tomorrow.setDate(today.getDate());


  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) { // Start from 1 to skip the header row

    if (!(data[i][endDateColumn - 1])) {
      sheet.getRange(i + 1, statusColumn).setValue('P'); // Set status to 'P'
      sheet.getRange(i + 1, endDateColumn).setValue('');
      sheet.getRange(i + 1, pmstatusColumn).setValue('');
      sheet.getRange(i + 1, updateTimebyColumn).setValue('');
      sheet.getRange(i + 1, updatebyColumn).setValue('Admin');
    }
    else {
      var endDate = new Date(data[i][endDateColumn - 1]);
      endDate.setHours(0, 0, 0, 0);
      if (endDate < tomorrow) {
        sheet.getRange(i + 1, statusColumn).setValue('P'); // Set status to 'P'
        sheet.getRange(i + 1, endDateColumn).setValue('');
        sheet.getRange(i + 1, pmstatusColumn).setValue('');
        sheet.getRange(i + 1, updateTimebyColumn).setValue('');
        sheet.getRange(i + 1, updatebyColumn).setValue('Admin');
      }
    }

  }
}

function updatetrigger() {
  var today = new Date();
  var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Exclude Friday (5) and Saturday (6)
    addNewDateDDMMYY();
    changeStatusToP();
    var message = 'Parade state has been reset, please wait for the parade state for ' + getCurrentDateDDMMYY() + ' to be printed out.\n If any changes are needed, please update them using the @sixtwotimetree_bot or update through TimeTree';
    sendCMessage('-1002060070830', message);
    flush();
  }
}

function notiftrigger() {
  var today = new Date();
  var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Exclude Friday (5) and Saturday (6)
    autoparadestate();
  }
}

function flush() {
  var chatIdColumn = getColumnIndexByName(dbsheet, 'chatId');
  var ordDateColumn = getColumnIndexByName(dbsheet, 'ORD_Date');
  var data = dbsheet.getDataRange().getValues()
  for (var i = 1; i < data.length; i++){
    console.log(data[i][ordDateColumn - 1])
    var orddatets = dateToTimestamp(data[i][ordDateColumn - 1])
    console.log(orddatets)
    var currentDatets = totimestamp(convertToMMDDYY(getCurrentDateDDMMYY()))
    if (orddatets < currentDatets){
      var chatId = data[i][chatIdColumn - 1].toString()
      console.log(typeof chatId)
      var response = ban('-1002060070830', chatId)
      console.log(response)
      sendMessage(chatId, 'You have been kicked out of the channel, HAPPY OWADIO!')
      deleteRowByChatId(data[i][chatIdColumn - 1])
    }
  }
}

function ban(channel, userId) {
  var apiUrl = 'https://api.telegram.org/bot' + apiToken + '/banChatMember';
  var payload = {
    'method': 'post',
    'payload': {
      'revoke_history': false,
      'chat_id': channel,
      'user_id': userId,
      "muteHttpExceptions": true
    }
  };
  var response = UrlFetchApp.fetch(apiUrl, payload);
}


function autoparadestate(){
  var message = printattendance();
  var chatIdColumn = getColumnIndexByName(dbsheet, 'chatId');
  var data = dbsheet.getDataRange().getValues();
  let chatId = '';
  for (var i = 1; i < data.length; i++) {
    chatId = data[i][chatIdColumn - 1];
    // sendMessage(chatId, dialog, message);
    sendMessage(chatId, message);
  }
}

