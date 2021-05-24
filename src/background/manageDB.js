const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const { convertUnixToDateAndHour, convertUnixToDate } = require('../utils/manageDates');
const { getNanoPrice } = require('../utils/getNanoPrice');
const { accountHistory, accountInfo } = require('./nanoRPC');


async function initializeDB() {
  return new Promise((resolve, reject) => {
    open({
      filename: './db/pos.db',
      driver: sqlite3.Database
    })
      .then(db => {
        return resolve(db);
      })
      .catch(err => {
        return reject(err);
      });
  });
}

async function getConfigs(db) {
  // Return the global settings added

  return new Promise((resolve, reject) => {
    db.all(`
      SELECT section_name, setting_name, setting_value, setting_type
      FROM global_config;
    `).then(configs => {
      let result = {};
      for (config of configs) {
        result[config.setting_name] = config.setting_value;
      }

      return resolve(result);
    }).catch(err => {
      return reject(err);
    });
  });
}

async function addConfig(
  db, sectionName, settingName, settingValue, setting_type) {
  //  Insert the settings into the database

  await db.run(`
    INSERT INTO global_config
    (section_name, setting_name, setting_value, setting_type)
    VALUES (?, ?, ?, ?);
  `, [sectionName, settingName, settingValue, setting_type]);
}

async function updateConfigs(db, configs) {
  // Update the settings from the database

  for (config of configs) {
    let { setting, value } = config;

    await db.run(`
      UPDATE global_config 
      SET setting_value = ?
      WHERE setting_name = ?;`, 
      [value, setting]
    );
  }
}

async function deleteConfigs(db) {
  // Delete any settings inside the database

  await db.run("DELETE FROM global_config;");
}

async function insertItem(
  db, id, name, description, barcode, category, price, extra) {
  // Insert the items into the database
    
  await db.run(
    `INSERT OR IGNORE INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (?, ?, ?, ?, ?, ?, ?);`, 
    [id, name, description, barcode, category, price, extra]
  );
}

async function deleteItem(db, id) {
  // Delete item with the corresponding ID

  await db.run("DELETE FROM items WHERE id = ?;", [id]);
}

async function deleteItems(db) {
  // Delete any items inside the database

  await db.run("DELETE FROM items;");
}

async function insertTransaction(db, hash, account, amount, date, type) {
  await db.run("INSERT INTO transactions VALUES (?, ?, ?, ?, ?);",
    [hash, account, amount, date, type]);
}

async function syncTransactions(db, address) {
  // Add all new transactions to the database

  const config = await getConfigs(db);
  const rpcServer = config.rpcNode;

  const rows = await db.all(`
    SELECT hash 
    FROM transactions 
    WHERE account = :account;
  `, {':account': address});

  const info = await accountInfo(address, rpcServer);
  const head = info.confirmation_height_frontier;

  const { history } = await accountHistory(address, rpcServer, head);

  for (block of history) {
    if (!rows.some(row => row.hash === block.hash)) {
      insertTransaction(
        db,
        block.hash,
        address,
        block.amount,
        block.local_timestamp,
        block.type === 'send' ? 0 : 1
      ).catch((e) => console.log(e));
    }
  }
}

async function getInfo(db, address) {
  // Get all essential information and return it

  var prettyTransactions = []; // Formatted in a user-readable way
  var rawTransactions = []; // The content exactly as it is

  var balanceTotal = 0;
  var balanceToday = 0;

  const pureTransactions = await db.all(`
    SELECT hash, amount, date, type 
    FROM transactions 
    WHERE account = :account
    ORDER BY date DESC;
  `, {':account': address});
  
  const settings = await getConfigs(db);
  const currency = settings.currency;

  const currentNanoPrice = getNanoPrice(currency, convertUnixToDate(Date.now()));

  const rawItems = await db.all("SELECT * FROM items;");
  const prettyItems = [];

  for (let i = 0; i < rawItems.length; i++) {
    prettyItems.push({
      id: rawItems[i].id,
      name: rawItems[i].name,
      description: rawItems[i].description,
      barcode: rawItems[i].barcode,
      category: rawItems[i].category,
      price: rawItems[i].price.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        minimumIntegerDigits: 2
      }),
      extra: rawItems[i].extra
    });
  }
  
  for (transaction of pureTransactions) {
    let { hash, amount, date, type } = transaction;

    const parsedDate = convertUnixToDate(date*1000);

    const cachedNanoPrice = await db.get(
      'SELECT price FROM nano_price WHERE date = ? AND currency = ?',
      [date, currency]
    );

    if (cachedNanoPrice) {
      var nanoPrice = cachedNanoPrice.price;
    } else {
      var nanoPrice = await getNanoPrice(currency, parsedDate);
      await db.run(`
        INSERT INTO nano_price (
          currency, price, date
        ) VALUES (
          ?, ?, ?
        )`,
        [currency, nanoPrice, date]
      );
    }

    const convertedAmount = Math.round(
      ((amount / Math.pow(10, 30)) + Number.EPSILON) * 100) / 100;
    const parsedAmount = convertedAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      minimumIntegerDigits: 2
    });
  
    if (convertedAmount === 0) {
      continue;
    }

    const price = nanoPrice * convertedAmount;
    const roundPrice = Math.round((price + Number.EPSILON) * 100) / 100;
    const parsedPrice = roundPrice ? `${roundPrice.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      minimumIntegerDigits: 2
    })} ${currency.toUpperCase()}` : 'Unknown';

    const prettyAmount = {
      nano: parsedAmount,
      currency: parsedPrice
    };
    const prettyDate = convertUnixToDateAndHour(date*1000);
    const prettyType = type === 0 ? 'Send' : 'Receive';

    rawAmount = {
      nano: amount,
      currency: price
    };

    prettyTransactions.push({
      hash, 
      date: prettyDate, 
      amount: prettyAmount, 
      type: prettyType
    });
    rawTransactions.push({hash, date, amount: rawAmount, type});

    if (type === 1) {
      balanceTotal += amount;
    } else {
      balanceTotal -= amount;
    }

    if (new Date(date*1000)
        .setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)) {

      if (type === 1) {
        balanceToday += amount;
      }
    }
  }

  const waitedNanoPrice = await currentNanoPrice;

  return new Promise((resolve, reject) => {
    return resolve({
      loading: false,
      settings,
      currentNanoPrice: waitedNanoPrice,
      balance: {
        total: (Math.round((
          balanceTotal / Math.pow(10, 30) + Number.EPSILON) * 100) / 100)
            .toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              minimumIntegerDigits: 2
            }),
        today: (Math.round((
          balanceToday / Math.pow(10, 30) + Number.EPSILON) * 100) / 100)
            .toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              minimumIntegerDigits: 2
            }),
      },
      prettyTransactions,
      rawTransactions,
      prettyItems,
      rawItems
    });
  })
}

async function deleteTransactions(db) {
  // Delete any transactions inside the database
  
  await db.run("DELETE FROM transactions;");
}

module.exports = { 
  initializeDB,
  getConfigs,
  addConfig,
  updateConfigs,
  deleteConfigs,
  insertItem,
  deleteItem,
  deleteItems,
  insertTransaction,
  syncTransactions,
  getInfo,
  deleteTransactions
};