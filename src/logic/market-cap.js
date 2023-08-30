const fetch = require("node-fetch");
const { USDMClient  } = require('binance');
const client = new USDMClient({});

const fetchCoinMarketCap = async () => {
    try{
        const coins = await client.getExchangeInfo();
        const usdtFuturesCoins = coins.symbols.filter((c) => {
            return c.quoteAsset === "USDT" && c.status === "TRADING";
        });

        const response = await fetch("https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-products?includeEtf=true");
        const prices = await response.json();
        const usdtPrices = prices.data.filter(p => p.q === "USDT");

        var coinsMarketCap = [];

        usdtFuturesCoins.forEach((futureCoin) => {
            const coinPriceObj = usdtPrices.find(x => x.s == futureCoin.symbol);
            
            if(coinPriceObj){
                const currentPrice = coinPriceObj.c;
                const coinSupply = coinPriceObj.cs;
                const marketCap = currentPrice * coinSupply;

                coinsMarketCap.push({
                    symbol: futureCoin.symbol,
                    circulatingSupply: coinSupply,
                    marketCap: marketCap,
                    currentPrice: currentPrice
                });
            }
        });

        return coinsMarketCap;
    }catch(e){
        console.log(e);
        return {error: e.message}
    }
    
}

module.exports = {
    fetchCoinMarketCap: fetchCoinMarketCap
}