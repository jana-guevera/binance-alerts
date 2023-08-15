const fetch = require("node-fetch");

// Function to get the closeing price
const getClosingPriceArray = (prices) => {
    const closingPrices = [];

    for(var i = 0; i < prices.length; i++){
        closingPrices.push(prices[i][4]);
    }
    
    return closingPrices;
}

const calculateEMA = (closingPrices, period) => {
    const k = 2 / (period + 1);
    let ema = closingPrices[0];
    for (let i = 1; i < closingPrices.length; i++) {
      ema = (closingPrices[i] * k) + (ema * (1 - k));
    }
  
    return ema;
}

const fetchCandleData = async (symbol, interval) => {
    const response = await fetch("https://api.binance.com/api/v3/klines?symbol="+symbol+"&interval=" + interval);
    const prices = await response.json();
    return prices;
}

module.exports = {
    getClosingPriceArray:getClosingPriceArray,
    calculateEMA:calculateEMA,
    fetchCandleData: fetchCandleData
}