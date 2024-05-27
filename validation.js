function uservalid (name){
  var nameColumn = getColumnIndexByName(sheet, 'Name');
  var data = sheet.getDataRange().getValues();
  var matchcount = 0;
  for (var i = 1; i < data.length; i++) {
    var fullName = data[i][nameColumn - 1].toLowerCase();
    var nameParts = name.toLowerCase().split(' ');

    if (nameParts.every(part => fullName.includes(part))) {
      matchcount++; // Increment the match count
    }
  }
  if (matchcount != 1){
    Logger.log('false');
    return false;
  }
  else{
    Logger.log('true');
    return true;
  }
}

function isMessageInFormat(message) {
  // Regular expression to match the format of a numbered list of names
  let regex = /^\d+\.\s+.+(\n\d+\.\s+.+)*$/;
  return regex.test(message);
}

function isValidDateFormat(message) {
  // Regex pattern for ddmmyy format
  var regex = /^\d{2}\d{2}\d{2}$/;

  // Check if the message matches the regex pattern
  if (!regex.test(message)) {
    return false; // Invalid format
  }

  // Parse the date components
  var day = parseInt(message.substring(0, 2), 10);
  var month = parseInt(message.substring(2, 4), 10) - 1; // Months are zero-based in JavaScript
  var year = parseInt(message.substring(4), 10); // Assuming years are in the 21st century
  
  // Adjust the year to be in the 21st century if it's less than 50
  if (year < 50) {
    year += 2000; // Add 2000 to the year
  } else {
    year += 1900; // Add 1900 to the year
  }
  
  // Check if the parsed date is a valid date
  var date = new Date(year, month, day);
  if (
    isNaN(date.getTime()) || // Invalid date object
    date.getDate() !== day || // Day is out of range
    date.getMonth() !== month || // Month is out of range
    date.getFullYear() !== year // Year is out of range
  ) {
    Logger.log('False')
    return false; // Invalid date
  } else if (isDateBeforeToday(date)){
    Logger.log('False')
    return false;
  } else {
    Logger.log('True!')
    return true; // Valid date
  }
}

function rankvalidation (rank){
  var ranklist = ['pte', 'lcp', 'cpl', 'cfc', '3sg', '2sg', 'me1t', 'me1', 'me2', 'me3', 'me4', 'me5']
  if (!ranklist.includes(rank.toLowerCase())){
    return false;
  }
  else{
    return true;
  }
}


function checkforuser(chatId){
  var chatIdColumn = getColumnIndexByName(dbsheet, 'chatId');
  var data = dbsheet.getRange(1, chatIdColumn, dbsheet.getLastRow(), chatIdColumn).getValues().join();
  return data.indexOf(chatId)!=-1
}

function getRowIndexByValue(sheet, columnName, value) {
  var columnValues = getColumnValues(sheet, columnName);
  var index = columnValues.indexOf(value);
  Logger.log(index)
  return index === -1 ? -1 : index + 2; // Add 2 because row index is 1-based and getColumnValues is 0-based
}

function test1(){
  var index = getRowIndexByValue(dbsheet, 'chatId', 833966104)
  Logger.log(index)
}

function getColumnValues(sheet, columnName) {
  var columnIndex = getColumnIndexByName(sheet, columnName);
  if (columnIndex === -1) {
    throw new Error('Column ' + columnName + ' not found');
  }
  var values = sheet.getRange(2, columnIndex, sheet.getLastRow() - 1, 1).getValues();
  return values.map(function(row) {
    return row[0];
  });
}

function getusername (chatId){
  var chatIdColumn = getColumnIndexByName(dbsheet, 'chatId');
  var nameColumn = getColumnIndexByName(dbsheet, 'MatchName');
  var data = dbsheet.getDataRange().getValues();
  var name = '';
  for (var i = 1; i < data.length; i++) {
    if (data[i][chatIdColumn - 1] === chatId) {
      name = data[i][nameColumn - 1]; // ChatId exists in the column
    }
  }
  return name;
}

function getusername2 (fname){
  var nameColumn = getColumnIndexByName(sheet, 'Name');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var fullName = data[i][nameColumn - 1].toLowerCase();
    var nameParts = fname.toLowerCase().split(' ');

    if (nameParts.every(part => fullName.includes(part))) {
      return data[i][nameColumn - 1];
    }
  }
}