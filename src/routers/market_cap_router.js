const express = require("express");
const {fetchCoinMarketCap} = require("../logic/market-cap.js");

const router = new express.Router();

router.get("/market-cap", async (req, res) => {
    try{
        const limit = req.query.limit || 21000000;

        const coins = await fetchCoinMarketCap();
        const filteredCoins = coins.filter(c => c.marketCap <= parseFloat(limit));
        
        if(filteredCoins){
            return res.send(filteredCoins);
        }

        res.send([]);
    }catch(e){
        res.send({error: e.message});
        console.log(e);
    }
});

module.exports = router;