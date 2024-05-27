function printStatusCounts() {
  var statusColumn = getColumnIndexByName(sheet, 'Attendance_Status');
  var data = sheet.getDataRange().getValues();
  var presentCount = 0;
  var strengthCount = 0;
  var statusCounts = {};

  for (var i = 1; i < data.length; i++) {
    var status = data[i][statusColumn - 1];
    if (status === 'P') {
      presentCount++;
    }
    strengthCount++;
    if (status !== 'P') { // Exclude 'P' status from statusCounts
      if (statusCounts[status] === undefined) {
        statusCounts[status] = 1;
      } else {
        statusCounts[status]++;
      }
    }
  }

  // Construct the message with status counts
  var msg = 'Strength: ' + pad(strengthCount, 2) + '\n';
  msg += 'Present: ' + pad(presentCount, 2) + '\n';

  msg += '\n';

  // Add the rest of the statuses
  for (var status in statusCounts) {
    msg += status + ': ' + pad(statusCounts[status], 2) + '\n';
  }
  return msg;
}

function ddmmyyToUnixTimestamp(dateStr) {
  // Parse the date string into day, month, and year components
  const parts = dateStr.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are zero-based (0-11)
  const year = 2000 + parseInt(parts[2], 10); // Assuming years are between 2000 and 2099

  // Create a new Date object with the parsed components
  const date = new Date(year, month, day);

  // Get the Unix timestamp (milliseconds since the Unix epoch)
  const unixTimestamp = date.getTime() / 1000; // Convert milliseconds to seconds

  return unixTimestamp;
}

function findRowIndexByChatId(chatId) {
  const data = dbsheet.getDataRange().getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === chatId) { // Assuming chatId is in the first column (index 0)
      return i + 1; // Adding 1 to convert from zero-based index to 1-based index
    }
  }

  return -1; // Return -1 if chatId is not found
}

function deleteRowByChatId(chatId=946625452) {
  const rowIndex = findRowIndexByChatId(chatId);

  if (rowIndex !== -1) {
    dbsheet.deleteRow(rowIndex);
    Logger.log(`Row with chatId ${chatId} deleted successfully.`);
  } else {
    Logger.log(`Row with chatId ${chatId} not found.`);
  }
}


function isNotEmpty(str) {
  return str.length > 0;
}

function removeDuplicates(list) {
  return list.filter((item, index) => list.indexOf(item) === index);
}

function dateToTimestamp(dateString) {
  const date = new Date(dateString);
  return date.getTime();
}


function isMoreThanOneDay(startDateStr, endDateStr) {
  // Convert date strings to Date objects
  let startDateParts = startDateStr.split("/");
  let endDateParts = endDateStr.split("/");
  let startDate = new Date(`20${startDateParts[2]}`, startDateParts[1] - 1, startDateParts[0]);
  let endDate = new Date(`20${endDateParts[2]}`, endDateParts[1] - 1, endDateParts[0]);

  // Calculate the difference in milliseconds
  let diff = endDate.getTime() - startDate.getTime();
  // Calculate the difference in days
  let daysDiff = diff / (1000 * 3600 * 24);
  // Check if the difference is greater than or equal to 1 day
  return daysDiff >= 1;
}

function convertToMMDDYY(dateString) {
  var day = dateString.substring(0, 2);
  var month = dateString.substring(2, 4);
  var year = dateString.substring(4, 6);

  return day + "/" + month + "/" + year;
}

// Function to pad numbers with leading zeros
function pad(num, size) {
  var s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
}

function totimestamp(dateString) {
  // Split the date string into day, month, and year components
  const dateParts = dateString.split('/');

  // Create a new Date object using the components
  // Note: The month is 0-based in JavaScript, so we need to subtract 1 from the month
  const dateObject = new Date('20' + dateParts[2], dateParts[1] - 1, dateParts[0]);

  // Get the timestamp
  const timestamp = dateObject.getTime();
  return timestamp
}

function addNewDateDDMMYY() {
  var today = new Date();
  today.setDate(today.getDate() + 1);
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yy = String(today.getFullYear()).slice(-2);
  var formattedDate = dd + '/' + mm + '/' + yy;

  sheet.getRange("J2").setValue(formattedDate); // Set the value in cell J2 to the formatted date
}

function getCurrentDateDDMMYY() {
  var dateCell = sheet.getRange("J2"); // Assuming the date is in cell A1, change this to the actual cell
  var dateValue = dateCell.getValue();
  var dateObject = new Date(dateValue);
  var dd = String(dateObject.getDate()).padStart(2, '0');
  var mm = String(dateObject.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yy = String(dateObject.getFullYear()).slice(-2);
  return dd + mm + yy;
}

function isDateBeforeToday(date) {
  var today = new Date();
  today.setDate(today.getDate()); // Set to yesterday

  // Set the time part of yesterday to 0 to compare only the date part
  today.setHours(0, 0, 0, 0);

  // Set the time part of the date to 0 to compare only the date part
  date.setHours(0, 0, 0, 0);

  return date < today;
}

function addOneDayToCurrentDate() {
  var currentDate = getCurrentDateDDMMYY(); // Get the current date in DDMMYY format
  var dateParts = currentDate.match(/(\d{2})(\d{2})(\d{2})/); // Extract day, month, and year
  var dd = parseInt(dateParts[1], 10);
  var mm = parseInt(dateParts[2], 10) - 1; // January is 0!
  var yy = parseInt(dateParts[3], 10) + 2000; // Assuming years are in the 21st century

  var tomorrow = new Date(yy, mm, dd + 1); // Add one day to the current date

  // Format the date as DDMMYY
  var ddTomorrow = String(tomorrow.getDate()).padStart(2, '0');
  var mmTomorrow = String(tomorrow.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyTomorrow = String(tomorrow.getFullYear()).slice(-2);

  var tomorrowDate = ddTomorrow + mmTomorrow + yyTomorrow;
  return tomorrowDate;
}