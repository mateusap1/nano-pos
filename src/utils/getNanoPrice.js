const CoinGecko = require('coingecko-api');


async function getNanoPrice(currency, date) {
  const CoinGeckoClient = new CoinGecko();

  let data = await CoinGeckoClient.coins.fetchHistory('nano', {
    date: date,
    localization: false
  });

  return new Promise((resolve, reject) => {
    if (data['success'] === false) {
      return reject (data['message']);
    } else {
      return resolve(data['data']['market_data']['current_price'][currency]);
    }
  });
}

module.exports = { getNanoPrice };