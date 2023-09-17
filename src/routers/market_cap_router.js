const express = require("express");
const binance = require("../binance/binance_futures.js");

const router = new express.Router();

router.get("/market-cap", async (req, res) => {
    try{
        const limit = req.query.limit || 21000000;

        circulatingSupply = await binance.getCiculatingSupply();
        unFilteredPrices = await binance.getCoinsPrice();
        coinsCurrentPrices = binance.updateInstruments(unFilteredPrices, circulatingSupply);
        
        coinsName = Object.keys(coinsCurrentPrices);
        filteredCoins = [];

        for(var i = 0; i < coinsName.length; i++){
            const cName = coinsName[i];
            
            if(circulatingSupply[cName]){
                const supply = circulatingSupply[cName];
                const marketCap = coinsCurrentPrices[cName].price * supply;

                if(marketCap <= parseFloat(limit) && cName.includes("USDT")){
                    filteredCoins.push({
                        symbol: cName,
                        circulatingSupply: supply,
                        marketCap: marketCap,
                        currentPrice: coinsCurrentPrices[cName].price
                    });
                }
            }
        }   

        res.send(filteredCoins);
    }catch(e){
        res.send({error: e.message});
        console.log(e);
    }
});

module.exports = router;