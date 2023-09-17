const fetch = require("node-fetch");
const { USDMClient  } = require('binance');
const client = new USDMClient({});

const getCoinsPrice = async () => {
    const coins = await client.get24hrChangeStatistics();
    return coins;
}

const updateInstruments = (prices, cSupply) => {
    const latestPrices = {};

    prices.forEach(({ symbol, lastPrice, priceChange, priceChangePercent, volume }) => {
        latestPrices[symbol] = {};
        latestPrices[symbol]["price"] = parseFloat(lastPrice);
        latestPrices[symbol]["priceChange"] = parseFloat(priceChange);
        latestPrices[symbol]["priceChangePercent"] = parseFloat(priceChangePercent);
        latestPrices[symbol]["volume"] = parseFloat(volume);

        if(cSupply[symbol]){
            const coinSupply = parseFloat(cSupply[symbol]);
            const marketCap = parseFloat(lastPrice) * coinSupply;
            latestPrices[symbol]["cSupply"] = coinSupply;
            latestPrices[symbol]["marketCap"] = marketCap;
        }
    });

    return latestPrices;
}

const getCiculatingSupply = async () => {
    const response = await fetch("https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-products?includeEtf=true");
    const prices = await response.json();

    const cSupply = {};
    prices.data.forEach(({s, cs, c}) => {
        cSupply[s] = parseFloat(cs);
    });

    return cSupply;
}

module.exports = {
    getCoinsPrice: getCoinsPrice,
    updateInstruments: updateInstruments,
    getCiculatingSupply: getCiculatingSupply
}