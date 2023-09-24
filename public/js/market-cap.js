const marketCapSearch = async () => {
    showLoader("#market-cap-btn", {content: generalLoader});
    const limit = parseFloat(document.querySelector(".market-cap-search input").value);
    
    var tbodyHtml = "";
        
    const coins = Object.keys(baCoinsPriceList);
    var foundCoins = [];
    coins.forEach(coin => {
        const currentCoin = baCoinsPriceList[coin];

        if(parseFloat(currentCoin.marketCap) <= limit && coin.includes("USDT")){
            tbodyHtml += `
                <tr>
                    <td>${coin}</td>
                    <td>${reduceDecimal(currentCoin.price)}</td>
                    <td>${getNumber(currentCoin.cSupply)}</td>
                    <td>${getNumber(currentCoin.marketCap)}</td>
                </tr>
            `;

            foundCoins.push(currentCoin);
        }
    });

    if(foundCoins.length < 1){
        showError({msg: "No coin found with the selected market cap!"});
        
    } 
    
    document.querySelector("#market-cap-tbody").innerHTML = tbodyHtml;
    hideLoader("#market-cap-btn", {content: "Search"});
}

const getNumber = (num) => {
    var units = ["M","B","T","Q"]
    var unit = Math.floor((num / 1.0e+1).toFixed(0).toString().length)
    var r = unit%3
    var x =  Math.abs(Number(num))/Number('1.0e+'+(unit-r)).toFixed(2)
    return x.toFixed(2)+ ' ' + units[Math.floor(unit / 3) - 2]
}