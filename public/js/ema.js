function calculateEMA(closingPrices, period) {
    const k = 2 / (period + 1);
    let ema = closingPrices[0];
    for (let i = 1; i < closingPrices.length; i++) {
      ema = (closingPrices[i] * k) + (ema * (1 - k));
    }
  
    return ema;
}

// Function to get the closeing price
const getClosingPriceArray = (prices) => {
    const closingPrices = [];

    // for(var i = prices.length - 1; i >= 0; i--){
    //     closingPrices.push(prices[i][4]);
    // }

    for(var i = 0; i < prices.length; i++){
        closingPrices.push(prices[i][4]);
    }
    
    return closingPrices;
}
  
const calculate = async (symbol, interval, range) => {
    const response = await fetch("https://api.binance.com/api/v3/klines?symbol="+symbol+"&interval=" + interval);
    const prices = await response.json();
    const closingPrices = getClosingPriceArray(prices);
    const ema = calculateEMA(closingPrices, range);
    console.log(ema);
}


// Example usage
// const closingPrices = [100, 110, 105, 115, 120, 130, 140, 150, 145, 155];
// const ema = calculateEMA(closingPrices, 12);
// console.log(ema); 

calculate("LINKUSDT", "15m", 100);