const dateFormat = require('dateformat');


function convertUnixToDateAndHour(time) {
  const timeString = dateFormat(time, 'mmm dd, yyyy\nhh:MM TT');

  return {
    date: timeString.split('\n')[0],
    hour: timeString.split('\n')[1]
  };
}

function convertUnixToDate(time) {
  return dateFormat(time, 'dd-mm-yyyy');
}

module.exports = { convertUnixToDateAndHour, convertUnixToDate };