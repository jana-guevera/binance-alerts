const fetch = require("node-fetch");

const fetchCoinPrices = async () => {
    const response = await fetch("https://api.binance.com/api/v1/ticker/allPrices");
    const prices = await response.json();
    return updateInstruments(prices);
}

const updateInstruments = (prices) => {

    const latestPrices = {};

    prices.forEach(({ symbol, price }) => {
        latestPrices[symbol] = parseFloat(price)
    });

    return latestPrices;
}

module.exports = fetchCoinPrices;