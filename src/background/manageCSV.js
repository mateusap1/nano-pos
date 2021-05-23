const parse = require('csv-parse/lib/sync');
const { readFile } = require('fs/promises');
const { insertItem } = require('./manageDB');


async function insertItemsCSV(db, inputPath) {
  const fileData = await readFile(inputPath);
  const rows = parse(fileData, {
    columns: true, trim: true, skipEmptyLines: true
  });

  for (item of rows) {
    const id = Number(item.id) || null;
    const name = item.name || null;
    const description = item.description || null;
    const barcode = item.barcode || null;
    const category = item.category || null;
    const price = +(item.price) || null;
    const extra = item.extra || null;

    // The id, name and price values are required
    if ([id, name, price].includes(null)) {
      continue;
    }

    await insertItem(
      db, id, name, description, barcode, category, price, extra);
  }
}

module.exports = { insertItemsCSV };