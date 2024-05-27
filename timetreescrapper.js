function generateUUID() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}



function login2() {
  var url = "https://timetreeapp.com/api/v1/auth/email/signin";
  var payload = {
    "uid": "UID",
    "password": "PW",
    "uuid": generateUUID()
  };

  var headers = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.6",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Brave\";v=\"122\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "x-csrf-token": "",
    "x-timetreea": "web/2.1.0/en",
    "cookie": "",
    "Referer": "https://timetreeapp.com/signin",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };

  var options = {
    "method": "PUT",
    "payload": JSON.stringify(payload),
    "headers": headers,
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseData = JSON.parse(response.getContentText());
    var setCookieHeader = response.getAllHeaders()["Set-Cookie"];
    // Logger.log(responseData); // Log the response data
    Logger.log(setCookieHeader); // Log the Set-Cookie header
    return setCookieHeader; // Return the response data
  } catch (error) {
    Logger.log("Error: " + error); // Log any errors
    return null;
  }
}


function loginAndFetchEvents() {
  var sessionidColumn = getColumnIndexByName(sheet, 'session_id');
  var data = sheet.getDataRange().getValues();
  var cookie = data[1][sessionidColumn - 1];
  Logger.log(cookie)
  // Login
  try {
    var eventsResponse = getEvents(cookie);
    if (eventsResponse != null) {
      Logger.log("Events fetched successfully.");
      Logger.log(updatestatus(eventsResponse));
      return eventsResponse;
    } else {
      Logger.log("session_id has expired");
      throw 'error'
    }
  }
  catch (e) {
    Logger.log(e);
    var loginResponse = login2();
    if (loginResponse != null) {
      Logger.log("Login successful. Fetching sessionid...");
      cookie = extractSessionId(loginResponse)
      sheet.getRange(1 + 1, sessionidColumn).setValue(cookie);
      // Fetch events after successful login
      loginAndFetchEvents();
    } else {
      Logger.log("Login failed.");
    }
    return null;
  }

}

function extractSessionId(setCookieHeader) {
  var parts = setCookieHeader.split(";"); // Split the Set-Cookie header into parts
  var sessionId = parts[0]; // Get the first part (which contains the _session_id)
  return sessionId;
}

function getEvents(cookie) {
  var url = "CALENDAR API LINK";
  var headers = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.6",
    "content-type": "application/json",
    "if-none-match": "W/\"4a616796e5b957b481919eff454e4be4\"",
    "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Brave\";v=\"122\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "x-csrf-token": "",
    "x-timetreea": "web/2.1.0/en",
    "cookie": cookie,
    "Referer": "https://timetreeapp.com/calendars/tCXQ7Ss24en9",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };
  var options = {
    "method": "GET",
    "headers": headers
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseData = JSON.parse(response.getContentText());
    var eventList = extractEventData(responseData);

    return eventList; // Return the response data
  } catch (error) {
    Logger.log("Error: " + error); // Log any errors
    return null;
  }
}

function extractEventData(responseData) {
  if (!responseData || !responseData.events) {
    return null;
  }

  var eventList = [];
  responseData.events.forEach(function (event) {
    var startAtDate = new Date(event.start_at);
    var endAtDate = new Date(event.end_at);

    var eventData = {
      "title": event.title,
      "start_at": convertToMMDDYY(convertUnixTimestamp(startAtDate)),
      "end_at": convertToMMDDYY(convertUnixTimestamp(endAtDate)),
      "updated_at": event.updated_at,
      "label_id": event.label_id,
      "note": event.note
    };
    var currentDate = convertToMMDDYY(getCurrentDateDDMMYY());
    var tscurrentDate = ddmmyyToUnixTimestamp(currentDate);
    var tsstartdate = ddmmyyToUnixTimestamp(eventData.start_at);
    var tsenddate = ddmmyyToUnixTimestamp(eventData.end_at);
    if (eventData.label_id === 10) {
      if (tsstartdate <= tscurrentDate && tsenddate >= tscurrentDate) {
        eventList.push(eventData);
      }
    }
    else if (eventData.label_id === 6) {
      if (tsstartdate <= tscurrentDate && tsenddate >= tscurrentDate) {
        if (eventData.note != null) {
          eventList.push(eventData)
        }
      }
    }
  });

  return eventList;
}

function updatestatus(eventList) {
  let msg = '<b>TimeTree has updated For</b> \n'
  var nmsg = [];
  var newmsg = [];
  eventList.forEach(user => {
    if (user.label_id === 6) {
      console.log(user.label_id + '\n' + user.note + '\n' + user.title)
      try {
        var emsg = extractevent(user.note, user.title, user.updated_at);
        console.log('List is \n' + emsg)
        newmsg.push.apply(newmsg, emsg)
      }
      catch (e) {
        console.log(e)
      }
    }
    else if (user.label_id === 10) {
      console.log(user.label_id)
      usertitle = extractgroups(user.title)
      for (let i = 0; i < (usertitle.name).length; i++) {
        var sendname = (usertitle.name)[i]
        var mmsg = updateAttendanceStatus(sendname, usertitle.amstatus, user.end_at, usertitle.pmstatus, 3210, user.updated_at, user.start_at)
        if (mmsg != null) {
          newmsg.push(mmsg.toUpperCase());
        }
      }
    }
    if (newmsg.length != 0) {
      nmsg = nmsg.concat(newmsg);
    }
  });
  if (nmsg.length != 0) {
    nmsg = removeDuplicates(nmsg);
    msg += nmsg.join('');
    sendCMessage('CHANNELID', printattendance());
    sendCMessage('CHANNELID', msg);
  }
  return msg
}

function updatestatus1(usertitle) {
  let amdegree = '';
  let pmdegree = '';
  let title = usertitle;
  var pmdegreecheck = false;
  var fulldaycheck = false;
  if (title.includes('-')) {
    var finaltitle = title.replace('-', ' ');
  }
  let amcheck = /\bAM\b/i;
  let pmcheck = /\bPM\b/i;
  if (amcheck.test(finaltitle)) {
    finaltitle = finaltitle.replace(/\bAM\b/gi, '');
  }
  else if (pmcheck.test(finaltitle)) {
    finaltitle = finaltitle.replace(/\bPM\b/gi, '')
    pmdegreecheck = true;
  }
  else {
    fulldaycheck = true;
  }
  let regex = /\([^)]*\)/; // Regular expression to match values in parentheses
  let includesParentheses = regex.test(finaltitle);
  if (includesParentheses) {
    finaltitle = finaltitle.replace(/\([^)]*\)/g, '');
  }
  let parts = finaltitle.split(' ');
  statusindex = parts.length - 1;
  let degreeIndex = parts.findIndex(part => part === '-'); // Find the index of '-'
  let name = parts.slice(1, degreeIndex).join(' '); // THADDEUS CHE RUIYANG
  // if (bothdegreecheck){
  //   var amdegree = 
  // }
  if (!pmdegreecheck) {
    amdegree = parts[statusindex]
    if (fulldaycheck === true) {
      pmdegree = '';
    }
  }
  else {
    pmdegree = parts[statusindex]
    amdegree = null
  }

  var userstatus = {
    'name': name.toLowerCase(),
    'amstatus': amdegree,
    'pmstatus': pmdegree,
  }
  return userstatus
}

function getCurrentDate() {
  let currentDate = new Date();

  // Get day, month, and year
  let day = currentDate.getDate().toString().padStart(2, '0');
  let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  let year = currentDate.getFullYear().toString().slice(-2);

  // Return formatted date
  return `${day}${month}${year}`;
}

function replaceStringInList(list, searchString, replacement) {
  return list.map(item => item.replace(searchString, replacement));
}

function getTomorrowDate() {
  let currentDate = new Date();
  let tomorrowDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000)); // Add one day

  // Get day, month, and year for tomorrow's date
  let day = tomorrowDate.getDate().toString().padStart(2, '0');
  let month = (tomorrowDate.getMonth() + 1).toString().padStart(2, '0');
  let year = tomorrowDate.getFullYear().toString().slice(-2);

  // Return formatted date for tomorrow
  return `${day}${month}${year}`;
}

function convertUnixTimestamp(timestamp) {
  // Convert Unix timestamp to milliseconds
  let date = new Date(timestamp);

  // Get day, month, and year
  let day = date.getDate().toString().padStart(2, '0');
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let year = date.getFullYear().toString().slice(-2);

  // Return formatted date
  return `${day}${month}${year}`;
}

function extractevent(text, title, updated_at) {
  try {
    var newmsg = []
    var namevalid = true;
    var pmdegreecheck = false;
    var fulldaycheck = false;
    let amdegree = '';
    let pmdegree = '';
    if (isMessageInFormat(text)) {
      var names = text.split(/\d+\.\s+/).slice(1).map(name => name.trim());
      names.forEach(function (name) {
        if (!uservalid(name)) {
          namevalid = false;
          console.log('error ' + name)
          return; // Exit the forEach loop
        }
      });
      if (namevalid === true) {
        console.log(names);
        var fstatus = title;
        let amcheck = /\bAM\b/i;
        let pmcheck = /\bPM\b/i;
        if (amcheck.test(fstatus)) {
          fstatus = fstatus.replace(/\bAM\b/gi, '');
        }
        else if (pmcheck.test(fstatus)) {
          fstatus = fstatus.replace(/\bPM\b/gi, '')
          pmdegreecheck = true;
        }
        else {
          fulldaycheck = true;
        }
        for (let i = 0; i < names.length; i++) {
          var fname = names[i]
          if (!pmdegreecheck) {
            amdegree = fstatus.toUpperCase();
            amdegree = amdegree.trim();
            if (fulldaycheck === true) {
              pmdegree = '';
            }
            else{
              pmdegree = 'P';
            }
          }
          else {
            pmdegree = fstatus.toUpperCase();
            pmdegree = pmdegree.trim();
            amdegree = null
          }
          var mmsg = updateAttendanceStatus(fname, amdegree, '', pmdegree, 3210, updated_at, getCurrentDateDDMMYY());
          console.log(mmsg)
          if (mmsg != null) {
            newmsg.push(mmsg.toUpperCase());
          }
        }
        return newmsg;
      }
      else {
        Logger.log('Names cannot be found in the database! Please key in correctly or in full name.');
      }
    } else {
      Logger.log('Wrong format! Please key in again using the format mentioned in the previous prompt.')
    }
  } catch (e) {
    console.log(e)
  }
}

function extractgroups(text) {
  let amdegree = 'P';
  let pmdegree = 'P';
  var names = getColumnValuesByName(sheet, 'Name');
  var ranks = getColumnValuesByName(sheet, 'Rank');
  var status = ['P', 'MA', 'OFF', 'Other Camp', 'DUTY', 'FFI', 'RSI', 'MC', 'LL', 'OL', 'Others', 'DUTY HOTO', 'ORD FFI', 'RSO'];
  var camps = ['MHC', 'NSDC', 'NSC', 'KTC', 'KC3', 'KC2', 'SELARANG', 'STAGMONT'];
  // Lowercase all the variables in the lists
  var lowercaseNames = names.map(name => name.toLowerCase());
  var lowercaseRanks = ranks.map(rank => rank.toLowerCase());
  var lowercaseStatus = status.map(stat => stat.toLowerCase());
  var lowercaseCamps = camps.map(camp => camp.toLowerCase());
  var pmdegreecheck = false;
  var fulldaycheck = false;

  // Regex patterns
  var rankPattern = new RegExp("\\b(" + lowercaseRanks.join("|") + ")\\b", "i");
  var statusPattern = new RegExp("\\b(" + lowercaseStatus.join("|") + ")\\b", "i");
  var campPattern = new RegExp("\\b(" + lowercaseCamps.join("|") + ")\\b", "i");

  // Initialize variables
  var status = "";
  var nameslist = [];
  // Find rank
  text = text.toLowerCase();
  var newtext = text.split('-').map(part => part.trim());
  if (newtext.length > 1) {
    if (newtext[0].includes('&')) {
      nameslist = newtext[0].split('&');
    }
    else {
      nameslist.push(newtext[0]);
    }
    for (let i = 0; i < nameslist.length; i++) {
      var rankMatch = nameslist[i].match(rankPattern);
      if (rankMatch) {
        var newname = nameslist[i].replace(rankMatch[0], "").trim();
        newname = findMatch(newname, lowercaseNames);
        nameslist = replaceStringInList(nameslist, nameslist[i], newname);
      }
    }
    // var rankMatch = text.match(rankPattern);
    // if (rankMatch) {
    // text = text.replace(rankMatch[0], "").trim();
    // }
    name = findMatch(newtext[0], lowercaseNames);
    newtext.splice(0, 1);
    if (newtext.length > 1) {
      newtext.join('');
    }
    // Find status
    var statusMatch = findMatch(newtext[0], lowercaseStatus);
    if (statusMatch) {
      status = statusMatch;
    } else {
      // If status is not found, check against camps list
      var campMatch = findMatch(newtext[0], lowercaseCamps);
      if (campMatch) {
        status = campMatch;
      }
      else {
        status = newtext[0].trim();
      }
    }
    let amcheck = /\bAM\b/i;
    let pmcheck = /\bPM\b/i;
    if (amcheck.test(status)) {
      status = status.replace(/\bAM\b/gi, '');
    }
    else if (pmcheck.test(status)) {
      status = status.replace(/\bPM\b/gi, '')
      pmdegreecheck = true;
    }
    else {
      fulldaycheck = true;
    }
  }
  else {
    let amcheck = /\bAM\b/i;
    let pmcheck = /\bPM\b/i;
    if (amcheck.test(text)) {
      text = text.replace(/\bAM\b/gi, '');
    }
    else if (pmcheck.test(text)) {
      text = text.replace(/\bPM\b/gi, '')
      pmdegreecheck = true;
    }
    else {
      fulldaycheck = true;
    }
    // Find status
    var statusMatch = text.match(statusPattern);
    if (statusMatch) {
      status = statusMatch[0];
      text = text.replace(statusMatch[0], "").trim();
    } else {
      // If status is not found, check against camps list
      var campMatch = text.match(campPattern);
      if (campMatch) {
        status = camps[lowercaseCamps.indexOf(campMatch[0])];
        text = text.replace(campMatch[0], "").trim();
      }
      else {
        status = text.trim();
      }
    }
    var rankMatch = text.match(rankPattern);
    if (rankMatch) {
      var newname = text.replace(rankMatch[0], "").trim();
      newname = findMatch(newname, lowercaseNames);
      nameslist.push(newname);
    }

  }

  if (!pmdegreecheck) {
    amdegree = status.toUpperCase();
    amdegree = amdegree.trim();
    if (fulldaycheck === true) {
      pmdegree = '';
    }
  }
  else {
    pmdegree = status.toUpperCase();
    pmdegree = pmdegree.trim();
    amdegree = null
  }

  var userstatus = {
    'name': nameslist,
    'amstatus': amdegree,
    'pmstatus': pmdegree,
  }
  console.log(userstatus);
  return userstatus;
}


// Function to find a match
function findMatch(inputName, list) {
  const inputParts = inputName.split(" ");
  for (const name of list) {
    const nameParts = name.split(" ");
    let inputIndex = 0;
    if (nameParts.some(part => {
      if (part.toLowerCase() === inputParts[inputIndex].toLowerCase()) {
        inputIndex++;
        return inputIndex === inputParts.length;
      }
      return false;
    })) {
      return name; // Return the first match found
    }
  }
  return null; // Return null if no match found
}

