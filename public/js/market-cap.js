const marketCapSearch = async () => {
    const limit = document.querySelector(".market-cap-search input").value;
    const url = "/market-cap?limit=" + limit;

    showLoader("#market-cap-btn", {content: generalLoader});

    try{
        const response = await fetch(url);
        const coins = await response.json();

        if(coins.error){
            return showError({msg: coins.error});
        }

        if(coins.length < 1){
            return showError({msg: "No coins found with the selected market cap!"});
        }

        var tbodyHtml = "";
        
        coins.forEach(coin => {
            tbodyHtml += `
                <tr>
                    <td>${coin.symbol}</td>
                    <td>${coin.currentPrice}</td>
                    <td>${getNumber(coin.circulatingSupply)}</td>
                    <td>${getNumber(coin.marketCap)}</td>
                </tr>
            `;
        });

        document.querySelector("#market-cap-tbody").innerHTML = tbodyHtml;
        hideLoader("#market-cap-btn", {content: "Search"});
    }catch(e){
        showError({msg: e.message});
    }
}

const getNumber = (num) => {
    var units = ["M","B","T","Q"]
    var unit = Math.floor((num / 1.0e+1).toFixed(0).toString().length)
    var r = unit%3
    var x =  Math.abs(Number(num))/Number('1.0e+'+(unit-r)).toFixed(2)
    return x.toFixed(2)+ ' ' + units[Math.floor(unit / 3) - 2]
}