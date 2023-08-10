var binanceAllPricesAPI = "https://api.binance.com/api/v1/ticker/allPrices";
var baCoinsPriceList = {};
var baAlerts = [];
var baValidator = {};

// Get prices from binance api and start monitoring
const baGetPrices = async () => {
    const jsonData = await fetch(binanceAllPricesAPI);
    const prices = await jsonData.json();

    baCoinsPriceList = updateInstruments(prices);
    await baFetchAlerts();
    await baFetchNotification();
    await baUpdateTable();
    await baCheckCondition();
    showNotifications();
    playSound();

    setTimeout(async () => {
        baGetPrices();
    }, 10000);
}

// Convert the binance api data to simple objects
const updateInstruments = (prices) => {

    const latestPrices = {};

    prices.forEach(({ symbol, price }) => {
        latestPrices[symbol] = parseFloat(price)
    });

    return latestPrices;
}

// Fetch Users basic alerts
const baFetchAlerts = async () => {
    const response = await fetch("/basic-alerts");
    const alerts = await response.json();
    baAlerts = alerts;
    return alerts;
}

// Display Basic Alerts
const baUpdateTable = async () => {
    if(baAlerts.length === 0){
        const response = await fetch("/basic-alerts");
        const alerts = await response.json();
        baAlerts = alerts;
    }

    var alertHtml = "";

    for(var i = 0; i < baAlerts.length; i++){
        var currentAlert = baAlerts[i];

        alertHtml += baTableRow(currentAlert);
    }

    document.querySelector("#ba-tbody").innerHTML = alertHtml;
}

// Alert row template 
const baTableRow = (currentAlert) => {
    return `
        <tr id="ba-${currentAlert._id}">
            <td>${currentAlert.coinName}</td>
            <td>${baCoinsPriceList[currentAlert.coinName]}</td>
            <td>${currentAlert.targetPrice}</td>
            <td>${currentAlert.direction.toUpperCase()}</td>
            <td>${formatDate(currentAlert.dateAdded)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="showNote('${currentAlert._id}')"><i class="fas fa-eye"></i></button>
                
                <button class="btn btn-danger btn-sm" id="rec-del-${currentAlert._id}" onclick="baInitiateDelete('${currentAlert._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

// Add Basic Alert
const addBasicAlert = async () => {
    const baCoinNameInput = document.querySelector("#ba-coin_name");
    const baTargetPriceInput = document.querySelector("#ba-target_price");
    const baAddedDate = document.querySelector("#ba-date_added");
    const baDirection = document.querySelector("#ba-direction");
    const baNote = document.querySelector("#ba-note");

    const coin = baCoinNameInput.value.toUpperCase() + "USDT";
    const targetPrice = parseFloat(baTargetPriceInput.value);
    const direction = baDirection.value.trim();
    const addedDate = new Date(baAddedDate.value).toISOString();
    const note = baNote.value;
    const coinCurrentPrice = parseFloat(baCoinsPriceList[coin]);


    if(coinCurrentPrice < targetPrice && direction === "down"){
        baValidator.showErrors({
            "baTargetPrice": "Target price should not be higher than the current price for down direction."
        });
    }else if(coinCurrentPrice > targetPrice && direction === "up"){
        baValidator.showErrors({
            "baTargetPrice": "Target price should not be less than the current price for up direction."
        });
    }else{
        try{
            showLoader("#btn-add", {content: addLoader});
    
            const response = await fetch("/basic-alerts", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    coinName: coin,
                    targetPrice: targetPrice,
                    direction: direction,
                    dateAdded: addedDate,
                    note: note
                })
            });
        
            const alert = await response.json();
    
            if(alert.error){
                return showError({msg: alert.error});
            }
    
            showSuccess({msg: "Alert Added Succesfully"});
    
            baAlerts.push(alert);
            const tbody = document.querySelector("#ba-tbody");
            tbody.innerHTML = tbody.innerHTML + baTableRow(alert);
        }catch(e){
            showError({msg: "Unable to add alert. Please try again"});
        }finally{
            baValidator.resetForm();
            hideLoader("#btn-add", {content: "Add Alert"});
            closeModal("basic-alert-modal");
        }
    }

    
}

// Alert for deleting an alert
const baInitiateDelete = (id) => {    
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this information!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            baRemoveAlert(id);   
        }
    });
}

// Remove an alert 
const baRemoveAlert = async (id) => {
    const url = "/basic-alerts/" + id;

    showLoader("#rec-del-" + id, {content: generalLoader});

    try{
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        });
    
        const alert = await response.json();
    
        if(alert.error){
            return showError({msg: alert.error});
        }
        
        showSuccess({msg: "Alert deleted successfully!"});
        document.querySelector("#ba-" + id).remove();
        baAlerts = baAlerts.filter((a) => {
            return a._id !== id;
        });
    }catch(e){
        showError({msg: "Something went wrong. Unable to delete alert!"});
        hideLoader("#rec-del-" + id, {content: `<i class="fas fa-trash"></i>`});
    }
}

// Show note 
const showNote = (id) => {
    const selectedAlert = baAlerts.find((alert) => {
        return alert._id === id;
    });

    document.querySelector("#note-element").textContent = selectedAlert.note;
    showModal("showNoteModal");
}


// =================================== Alert Login ===================================

const baCheckCondition = async () => {
    const alerts = baAlerts;

    for(var i = 0; i < alerts.length; i++){
        var currentAlert = alerts[i];
        var currentPrice = parseFloat(baCoinsPriceList[currentAlert.coinName]);
        var notif = {
            _id: currentAlert._id,
            coinName: currentAlert.coinName, 
            targetPrice: currentAlert.targetPrice, 
            direction: currentAlert.direction, 
            note:currentAlert.note,
            dateAdded: currentAlert.dateAdded,
            alertType: "basic",
        };

        if(currentAlert.direction === "up" && currentPrice >= currentAlert.targetPrice){
            notif.message = notif.coinName + " has gone up to the target price of " + currentAlert.targetPrice;
            await baAddNotification(notif);
            await baRemoveAlert(currentAlert._id);
        }else if(currentAlert.direction === "down" && currentPrice <= currentAlert.targetPrice){
            notif.message = notif.coinName + " has gone down to the target price of " + currentAlert.targetPrice;
            await baAddNotification(notif);
            await baRemoveAlert(currentAlert._id);
        }
    }
}

const baFetchNotification = async () => {
    try{
        const response = await fetch("/notifications");
        const notis = await response.json();
        notifications = notis;
        return notis;
    }catch(e){
        console.log(e);
    }
}

const baAddNotification = async (notification) => {
    try{
        const response = await fetch("/notifications", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notification)
        });
    
        const notif = await response.json();

        if(notif.error){
            return showError({msg: notif.error});
        }

        notifications.push(notif);
        const notifDiv = document.querySelector("#notifications");
        notifDiv.innerHTML = notifDiv.innerHTML + generateNotif(notif);
    }catch(e){
        showError({msg: e.message});
    }
}

const baRemoveNotification = async (id) => {
    const url = "/notifications/" + id;

    showLoader("#notif-del-" + id, {content: generalLoader});

    try{
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        });
    
        const notif = await response.json();
    
        if(notif.error){
            return showError({msg: notif.error});
        }
        
        showSuccess({msg: "Notification deleted successfully!"});
        document.querySelector("#notif-box-" + id).remove();
        notifications = notifications.filter((n) => {
            return n._id !== id;
        });
        playSound();
    }catch(e){
        showError({msg: "Something went wrong. Unable to delete notification!"});
        hideLoader("#notif-del-" + id, {content: `<i class="fas fa-trash"></i>`});
    }
}

const showNotifications = () => {
    var notiHtml = ``;

    for(var i = 0; i < notifications.length; i++){
        var notification = notifications[i];

        notiHtml += generateNotif(notification);
    }

    document.querySelector("#notifications").innerHTML = notiHtml;
}

$(document).ready(() => {
    const baForm = $("#basic-alert-form");

    baValidator = baForm.validate({
        rules:{
            baCoinName: {
                required: true,
                isCoinExist: true
            },
            baTargetPrice:{
                required: true,
            },
            baDirection:{
                required: true
            },
            baDateAdded:{
                required: true
            }
        }
    });

    baForm.on("submit", function(e){
        e.preventDefault();

        if(baForm.valid()){
            addBasicAlert();
        }
    });
});

baGetPrices();