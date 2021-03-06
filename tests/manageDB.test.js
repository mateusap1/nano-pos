const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

jest.mock('../src/background/nanoRPC');
jest.mock('../src/utils/getNanoPrice');

const { 
  getConfigs,
  addConfig,
  updateConfigs,
  deleteConfigs,
  insertItem,
  deleteItem,
  deleteItems,
  insertBill,
  insertTransaction,
  syncTransactions,
  getInfo,
  deleteTransactions
} = require('../src/background/manageDB');


// Helper functions
async function initializeDB() {
  return new Promise((resolve, reject) => {
    open({
      filename: ':memory:',
      driver: sqlite3.Database
    })
      .then(db => {
        db.exec(`
          CREATE TABLE global_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_name TEXT,
            setting_name TEXT,
            setting_value TEXT,
            setting_type INTEGER
          );

          CREATE TABLE transactions (
            hash TEXT PRIMARY KEY,
            account TEXT,
            amount INTEGER,
            date INTEGER,
            type INTEGER
          );

          CREATE TABLE items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            barcode INTEGER,
            category TEXT,
            price REAL,
            extra TEXT
          );

          CREATE TABLE bill_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER,
            item_id INTEGER
          );

          CREATE TABLE bills (
            transaction_hash TEXT PRIMARY KEY,
            price REAL,
            date INTEGER
          );

          CREATE TABLE nano_price (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            currency TEXT,
            price REAL,
            date INTEGER
          );
        `);

        return resolve(db);
      })
      .catch(err => {
        return reject(err);
      });
  });
}

async function addEssentialConfigs(db) {
  await db.exec(`
    INSERT INTO global_config (
      section_name, 
      setting_name, 
      setting_value, 
      setting_type
    ) VALUES ('nodes', 'rpcNode', 'https://mynano.ninja/api/node/', 'string');

    INSERT INTO global_config (
      section_name, 
      setting_name, 
      setting_value, 
      setting_type
    ) VALUES ('nodeRelated', 'wssServer', 'wss://ws.mynano.ninja/', 'string');

    INSERT INTO global_config (
      section_name, 
      setting_name, 
      setting_value, 
      setting_type
    ) VALUES ('moneyRelated', 'currency', 'usd', 'string');
  `);
}

// Actual Tests
it('Should return the global settings added', async () => {
  const db = await initializeDB();

  await db.exec(`
    INSERT INTO global_config (
      section_name,
      setting_name,
      setting_value,
      setting_type
    ) VALUES ('test1', 'test1', 'test1', 0);

    INSERT INTO global_config (
      section_name,
      setting_name,
      setting_value,
      setting_type
    ) VALUES ('test2', 'test2', 'test2', 1);
  `);

  configs = await getConfigs(db);

  expect(configs).toMatchObject({
    test1: 'test1',
    test2: 'test2'
  });
});

it('Should insert the settings into the database', async () => {
  const db = await initializeDB();

  await addConfig(db, 'test1', 'test1', 'test1', 0);
  await addConfig(db, 'test2', 'test2', 'test2', 0);

  const result = await db.all(`
    SELECT section_name, setting_name, setting_value, setting_type
    FROM global_config;
  `);

  const expectedOutput = [{
    section_name: 'test1',
    setting_name: 'test1',
    setting_value: 'test1',
    setting_type: 0
  }, {
    section_name: 'test2',
    setting_name: 'test2',
    setting_value: 'test2',
    setting_type: 0
  }];

  expect(result).toHaveLength(2);
  for (let i = 0; i < result.length; i++) {
    expect(result[i]).toMatchObject(expectedOutput[i]);
  }
});

it('Should update the settings from the database', async () => {
  const db = await initializeDB();

  await db.exec(`
    INSERT INTO global_config (
      section_name,
      setting_name,
      setting_value,
      setting_type
    ) VALUES ('test1', 'test1', 'test1', 0);

    INSERT INTO global_config (
      section_name,
      setting_name,
      setting_value,
      setting_type
    ) VALUES ('test2', 'test2', 'test2', 0);
  `);

  await updateConfigs(db, [{
    setting: 'test1',
    value: 'test1Changed'
  }, {
    setting: 'test2',
    value: 'test2Changed'
  }])

  const result = await db.all(`
    SELECT section_name, setting_name, setting_value, setting_type
    FROM global_config;
  `);

  const expectedOutput = [{
    section_name: 'test1',
    setting_name: 'test1',
    setting_value: 'test1Changed',
    setting_type: 0
  }, {
    section_name: 'test2',
    setting_name: 'test2',
    setting_value: 'test2Changed',
    setting_type: 0
  }];

  expect(result).toHaveLength(2);
  for (let i = 0; i < result.length; i++) {
    expect(result[i]).toMatchObject(expectedOutput[i]);
  }
});

it('Should delete any settings inside the database', async () => {
  const db = await initializeDB();

  await db.exec(`
    INSERT INTO global_config (
      section_name,
      setting_name,
      setting_value,
      setting_type
    ) VALUES ('test1', 'test1', 'test1', 0);
  `);

  await deleteConfigs(db);

  const result = await db.all('SELECT * FROM global_config;');
  expect(result).toEqual([]);
});

it('Should insert the items into the database', async () => {
  const db = await initializeDB();

  await insertItem(
    db, 1, 'test1', 'test1', 'test1', 'test1', 1, 'test1');
  await insertItem(
    db, 2, 'test2', 'test2', 'test2', 'test2', 2, 'test2');
  
  const result = await db.all('SELECT * FROM items;');
  const expectedOutput = [{
    id: 1,
    name: 'test1',
    description: 'test1',
    barcode: 'test1',
    category: 'test1',
    price: 1,
    extra: 'test1'
  }, {
    id: 2,
    name: 'test2',
    description: 'test2',
    barcode: 'test2',
    category: 'test2',
    price: 2,
    extra: 'test2'
  }]

  expect(result).toHaveLength(2);
  for (let i = 0; i < result.length; i++) {
    expect(result[i]).toMatchObject(expectedOutput[i]);
  }
});

it('Should delete item with the corresponding ID', async () => {
  const db = await initializeDB();

  db.exec(`
    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (1, 'test1', 'test1', 'test1', 'test1', 1, 'test1');

    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (2, 'test2', 'test2', 'test2', 'test2', 2, 'test2');
  `);

  await deleteItem(db, 1);
  
  const result = await db.all('SELECT * FROM items;');
  const expectedOutput = [{
    id: 2,
    name: 'test2',
    description: 'test2',
    barcode: 'test2',
    category: 'test2',
    price: 2,
    extra: 'test2'
  }];

  expect(result).toHaveLength(1);
  for (let i = 0; i < result.length; i++) {
    expect(result[i]).toMatchObject(expectedOutput[i]);
  }
});

it('Should delete any items inside the database', async () => {
  const db = await initializeDB();

  await db.exec(`
    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (1, 'test1', 'test1', 'test1', 'test1', 1, 'test1');
  `);

  await deleteItems(db);

  const result = await db.all('SELECT * FROM items;');
  expect(result).toEqual([]);
});

it('Should insert the bill into the database', async () => {
  const db = await initializeDB();

  Date.now = jest.fn(() => 1621878375549);

  db.exec(`
    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (
      0, 'name0', 'description0', 'barcode0', 'category0', 4.9, 'extra0'
    );

    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (
      1, 'name1', 'description1', 'barcode1', 'category1', 9.9, 'extra1'
    );

    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (
      2, 'name2', 'description2', 'barcode2', 'category2', 1.9, 'extra2'
    );

    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (
      3, 'name3', 'description3', 'barcode3', 'category3', 14.9, 'extra3'
    );
  `)

  await insertBill(db, 'hash1', [2, 1]);
  await insertBill(db, 'hash2', [0, 3, 2]);
  
  const resultBills = await db.all('SELECT * FROM bills;');
  const resultBillItems = await db.all('SELECT * FROM bill_items;');

  const expectedOutputBills = [{
    transaction_hash: 'hash1',
    price: 11.8,
    date: 1621878375
  }, {
    transaction_hash: 'hash2',
    price: 21.7,
    date: 1621878375
  }];

  const expectedOutputBillItems = [{
    id: 1,
    bill_id: 'hash1',
    item_id: 2
  }, {
    id: 2,
    bill_id: 'hash1',
    item_id: 1
  }, {
    id: 3,
    bill_id: 'hash2',
    item_id: 0
  }, {
    id: 4,
    bill_id: 'hash2',
    item_id: 3
  }, {
    id: 5,
    bill_id: 'hash2',
    item_id: 2
  }];

  expect(resultBills).toHaveLength(2);
  for (let i = 0; i < resultBills.length; i++) {
    expect(resultBills[i]).toMatchObject(expectedOutputBills[i]);
  }

  expect(resultBillItems).toHaveLength(5);
  for (let i = 0; i < resultBillItems.length; i++) {
    expect(resultBillItems[i]).toMatchObject(expectedOutputBillItems[i]);
  }
});

it('Should insert the transactions into the database', async () => {
  db = await initializeDB();

  await insertTransaction(db, 'test1', 'test1', 1, 1, 1);
  await insertTransaction(db, 'test2', 'test2', 2, 2, 2);
  
  const result = await db.all('SELECT * FROM transactions;');
  const expectedOutput = [{
    hash: 'test1',
    account: 'test1',
    amount: 1,
    date: 1,
    type: 1
  }, {
    hash: 'test2',
    account: 'test2',
    amount: 2,
    date: 2,
    type: 2
  }];

  expect(result).toHaveLength(2);
  for (let i = 0; i < result.length; i++) {
    expect(result[i]).toMatchObject(expectedOutput[i]);
  }

  expect(async () => {
    await insertTransaction(db, 'test2', 'test2', 2, 2, 2);
  }).rejects.toThrow();
});

it('Should add all new transactions to the database', async () => {
  db = await initializeDB();
  await addEssentialConfigs(db);

  const address = 'nano_11g7sktw95wxhq65zoo3xzjyodazi8d889abtzjs1cd7c8rnxazmqqxprdr7';

  await syncTransactions(db, address);
  
  const result = await db.all('SELECT * FROM transactions;');
  const expectedOutput = [{
    hash: '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
    account: address,
    amount: 10000000000000000000000000000,
    type: 1
  }];

  expect(result).toHaveLength(1);
  for (let i = 0; i < result.length; i++) {
    expect(result[i]).toEqual(expect.objectContaining(expectedOutput[i]));
  }
});

it('Should get all essential information and return it', async () => {
  db = await initializeDB();
  await addEssentialConfigs(db);

  await db.exec(`
    INSERT INTO transactions (
      hash, account, amount, date, type
    ) VALUES (
      '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
      'nano_11g7sktw95wxhq65zoo3xzjyodazi8d889abtzjs1cd7c8rnxazmqqxprdr7',
      10000000000000000000000000000,
      1620498274,
      1
    );

    INSERT INTO transactions (
      hash, account, amount, date, type
    ) VALUES (
      '62B5DF659FE4FD7E4BB108731E1AA1FB011A4E402EFC35139D422E25E038962F',
      'nano_11g7sktw95wxhq65zoo3xzjyodazi8d889abtzjs1cd7c8rnxazmqqxprdr7',
      20000000000000000000000000000,
      1620498274,
      1
    );

    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (0, 'test', 'test', 'test', 'test', 0, 'test');

    INSERT INTO bills (
      transaction_hash,
      price,
      date
    ) VALUES (
      '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
      0,
      1620498274
    );

    INSERT INTO bill_items (bill_id, item_id) VALUES (
      '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
      0
    );
  `);

  const address = 'nano_11g7sktw95wxhq65zoo3xzjyodazi8d889abtzjs1cd7c8rnxazmqqxprdr7';

  const expectedSettings = {
    rpcNode: 'https://mynano.ninja/api/node/',
    wssServer: 'wss://ws.mynano.ninja/',
    currency: 'usd'
  };

  const expectedNanoPrice = 9.8;

  const expectedPrettyTransactions = [{
    hash: '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
    date: {
      date: 'May 08, 2021',
      hour: '03:24 PM'
    },
    amount: {
      nano: '00.01',
      currency: '00.10 USD'
    },
    type: 'Receive'
  }, {
    hash: '62B5DF659FE4FD7E4BB108731E1AA1FB011A4E402EFC35139D422E25E038962F',
    date: {
      date: 'May 08, 2021',
      hour: '03:24 PM'
    },
    amount: {
      nano: '00.02',
      currency: '00.20 USD'
    },
    type: 'Receive'
  }];

  const expectedRawTransactions = [{
    hash: '324D62BFB7C4F9934AED588AD9153508307907B1191454098201E7EA692F654B',
    date: 1620498274,
    amount: {
      nano: 10000000000000000000000000000,
      currency: 0.098
    },
    type: 1,
    details: [{
      id: 0,
      name: 'test',
      description: 'test',
      barcode: 'test',
      category: 'test',
      price: 0,
      extra: 'test',
      amount: 1
    }]
  }, {
    hash: '62B5DF659FE4FD7E4BB108731E1AA1FB011A4E402EFC35139D422E25E038962F',
    date: 1620498274,
    amount: {
      nano: 20000000000000000000000000000,
      currency: 0.196
    },
    type: 1,
    details: null
  }];

  const expectedPrettyItems = [{
    id: 0,
    name: 'test',
    description: 'test',
    barcode: 'test',
    category: 'test',
    price: '00.00',
    extra: 'test'
  }];

  const expectedRawItems = [{
    id: 0,
    name: 'test',
    description: 'test',
    barcode: 'test',
    category: 'test',
    price: 0,
    extra: 'test'
  }];

  const expectedOutput = {
    loading: false,
    settings: expectedSettings,
    currentNanoPrice: expectedNanoPrice,
    balance: {
      total: '00.03',
      today: '00.00',
    },
    prettyTransactions: expectedPrettyTransactions,
    rawTransactions: expectedRawTransactions,
    prettyItems: expectedPrettyItems,
    rawItems: expectedRawItems
  };

  const result = await getInfo(db, address);
  expect(result).toEqual(expectedOutput);
});

it('Should delete any transactions inside the database', async () => {
  db = await initializeDB();

  await db.exec(`
    INSERT INTO transactions (
      hash, account, amount, date, type
    ) VALUES ('test1', 'test1', 1, 1, 1);
  `);

  await deleteTransactions(db);

  const result = await db.all('SELECT * FROM transactions;');
  expect(result).toEqual([]);
});

it('Should insert the items of a csv file into the database', async () => {
  /* The following issue may help with any problems regarding manual mocks of
  submodules: https://github.com/facebook/jest/issues/11136#issuecomment-793481624 
  */

  jest.mock('fs');
  jest.mock('fs/promises');

  const fs = require('fs');

  fs.setMockFiles({
    './test1.csv': `
      "id","name","category","price"
      "1","name1","category1","1.1"
      "2","name2","category2","2.2"
    `,
    './test2.csv': `
      "id","category","price"
      "1","category1","1.1"
      "2","category2","2.2"
    `
  });

  const { insertItemsCSV } = require('../src/background/manageCSV');

  db = await initializeDB();

  await db.exec(`
    INSERT INTO items (
      id,
      name,
      description,
      barcode,
      category,
      price,
      extra
    ) VALUES (0, 'test0', 'test0', 'test0', 'test0', 0, 'test0');
  `);

  await insertItemsCSV(db, './test1.csv');

  const expectedOutput = [
    {
      id: 0,
      name: 'test0',
      description: 'test0',
      barcode: 'test0',
      category: 'test0',
      price: 0,
      extra: 'test0'
    }, {
      id: 1,
      name: 'name1',
      description: null,
      barcode: null,
      category: 'category1',
      price: 1.1,
      extra: null
    }, {
      id: 2,
      name: 'name2',
      description: null,
      barcode: null,
      category: 'category2',
      price: 2.2,
      extra: null
    }
  ];

  let result = await db.all('SELECT * FROM items;');

  expect(result).toHaveLength(3);
  for (let i = 0; i < result.length; i++) {
    expect(result[i]).toEqual(expect.objectContaining(expectedOutput[i]));
  }

  await db.exec('DELETE FROM items;');
  await insertItemsCSV(db, './test2.csv');

  result = await db.all('SELECT * FROM items;');
  expect(result).toEqual([]);
});