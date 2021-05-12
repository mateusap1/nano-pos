const dateFormat = require('dateformat');


function convertUnixToDateString(time) {
  const timeString = dateFormat(time, 'mmm dd, yyyy\nhh:MM TT');

  return {
    date: timeString.split('\n')[0],
    hour: timeString.split('\n')[1]
  };
}

module.exports = { convertUnixToDateString }