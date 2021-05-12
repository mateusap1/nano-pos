const sqlite3 = require('sqlite3').verbose();
const { convertUnixToDateString } = require('../utils/convertUnixToDateString');


function initializeDB() {
  return new sqlite3.Database('./db/pos.db', (err) => {
    if (err) {
      console.error(err.message);
    }
  
    console.log('Connected to the database.');
  });
}

function closeDB(db) {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  
    console.log('Close the database connection.');
  });
}

function insertTransaction(hash, account, amount, date, type) {
  let db = initializeDB();

  db.run("INSERT INTO transactions VALUES (?, ?, ?, ?, ?);",
          [hash, account, amount, date, type]);

  closeDB(db);
}

function getTransactions(callback, pretty = true) {
  let db = initializeDB();
  var transactions = [];

  db.each("SELECT hash, amount, date, type FROM transactions", function(err, row) {
    if (err) {
      return console.error(err.message);
    }

    if (pretty === true) {
      var amount = row.amount / Math.pow(10, 30);
      var date = convertUnixToDateString(row.date*1000);
    } else {
      var amount = row.amount;
      var date = row.date;
    }

    transactions.push({
      hash: row.hash,
      date,
      amount,
      type: pretty ? row.type[0].toUpperCase() + row.type.slice(1) : row.type
    });
  }, () => {
    closeDB(db);
    callback(transactions);
  });
}

getTransactions((transactions) => {
  console.log(transactions);
})

module.exports = { insertTransaction, getTransactions };