const startApp = async () => {
    const jsonData = await fetch(binanceAllPricesAPI);
    const prices = await jsonData.json();
    baCoinsPriceList = updateInstruments(prices);

    baStartAlert();
    temaStartAlert();

    setTimeout(async () => {
        startApp();
    }, 10000);
}

startApp();