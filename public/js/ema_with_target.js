// ================= Global Data ===============================
var temaForm = {};
var temaValidator = {};
var temaAlerts = [];

// ============ ema target form manupulation ====================
const temaInputContainer = document.querySelector("#tema-ema-inputs");
const temaInputAddBtn = document.querySelector("#tema-input-add-btn");

temaInputAddBtn.addEventListener("click", () => {
    const inputHtml = `
        <div class="tema-ema-input-box">
            <div class="item-row">
                <select onClick="temaValidateEMAInputs()" class="tema-time-input form-control">
                    <option value="" selected disabled>Timeframe</option>
                    <option value="1m">1m</option>
                    <option value="3m">3m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="30m">30m</option>
                    <option value="1h">1H</option>
                    <option value="2h">2H</option>
                    <option value="4h">4H</option>
                    <option value="6h">6H</option>
                    <option value="8h">8H</option>
                    <option value="12h">12H</option>
                    <option value="1d">1D</option>
                    <option value="3d">3D</option>
                    <option value="1w">1W</option>
                    <option value="1M">1M</option>
                </select>
                <select onClick="temaValidateEMAInputs()" class="tema-ema-direction form-control">
                    <option value="" disabled selected>Direction</option>
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                </select>
                <input onChange="temaValidateEMAInputs()" type="number" placeholder="EMA Range">
                <button type="button" onClick="temaRemoveEmaInput(this)" class="btn btn-danger btn-sm">X</button>
            </div>
            <p class="error hide">Inputs cannot be empty</p>
        </div>
    `;

    temaInputContainer.insertAdjacentHTML("beforeend", inputHtml);
});

const temaRemoveEmaInput = (e) => {
    e.parentElement.parentElement.remove()
}

// ============ Target EMA CRUD Operations =========================
const temaFetchAlert = async () => {
    const response = await fetch("/ema-target-alerts");
    const alerts = await response.json();
    return alerts;
}

const temaAdd = async () => {
    const CoinNameInput = document.querySelector("#tema-coin_name");
    const TargetPriceInput = document.querySelector("#tema-target_price");
    const AddedDateInput = document.querySelector("#tema-date_added");
    const DirectionInput = document.querySelector("#tema-direction");
    const NoteInput = document.querySelector("#tema-note");

    const coin = CoinNameInput.value.toUpperCase() + "USDT";
    const targetPrice = parseFloat(TargetPriceInput.value);
    const direction = DirectionInput.value.trim();
    const addedDate = new Date(AddedDateInput.value).toISOString();
    const note = NoteInput.value;
    const coinCurrentPrice = parseFloat(baCoinsPriceList[coin]);

    if(coinCurrentPrice < targetPrice && direction === "down"){
        return temaValidator.showErrors({
            "temaTargetPrice": "Target price should not be higher than the current price for down direction."
        });
    }else if(coinCurrentPrice > targetPrice && direction === "up"){
        return temaValidator.showErrors({
            "temaTargetPrice": "Target price should not be less than the current price for up direction."
        });
    }

    if(!temaValidateEMAInputs()){
       return; 
    }

    try{
        showLoader("#tema-add", {content: addLoader});

        const response = await fetch("/ema-target-alerts", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coinName: coin,
                targetPrice: targetPrice,
                direction: direction,
                dateAdded: addedDate,
                note: note,
                emaTargets: temaGetEMAInputsData()
            })
        });
    
        const alert = await response.json();

        if(alert.error){
            return showError({msg: alert.error});
        }

        showSuccess({msg: "Alert Added Succesfully"});

        temaAlerts.push(alert);
        const tbody = document.querySelector("#tema-tbody");
        tbody.innerHTML = tbody.innerHTML + temaTableRow(alert);
    }catch(e){
        showError({msg: "Unable to add alert. Please try again"});
    }finally{
        temaValidator.resetForm();
        temaForm[0].reset();
        hideLoader("#tema-add", {content: "Add Alert"});
        closeModal("ema-target-modal");
        const emaInputBoxes = temaInputContainer.querySelectorAll(".tema-ema-input-box");

        emaInputBoxes.forEach((box, index) => {
            if(index !== 0){
                box.remove();
            }
        });
    }
}

// Update the alert isTargetHit Field to true
const temaUpdateAlertTargetHit = async (temaAlert) => {
    temaAlert.isTargetPriceHit = true;

    try{
        const response = await fetch("/ema-target-alerts", {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(temaAlert)
        });
    
        const alert = await response.json();

        if(alert.error){
            return console.log(alert.error);
        }
    }catch(e){
        console.log(e);
    }
}

const temaUpdateOrRemoveAlert = async (temaAlert, emaTargetId) => {
    try{
        const response = await fetch("/ema-target-alerts/update-or-delete/" + emaTargetId, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(temaAlert)
        });
    
        const alert = await response.json();

        if(alert.error){
            return console.log(alert.error);
        }


    }catch(e){
        console.log(e);
    }
}

const temaInitiateDelete = (id) => {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this information!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            temaRemoveAlert(id);   
        }
    });
}

const temaRemoveAlert = async (id) => {
    const url = "/ema-target-alerts/" + id;

    showLoader("#tema-del-" + id, {content: generalLoader});

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
        document.querySelector("#tema-tr-" + id).remove();
        temaAlerts = temaAlerts.filter((a) => {
            return a._id !== id;
        });
    }catch(e){
        showError({msg: "Something went wrong. Unable to delete alert!"});
        hideLoader("#tema-del-" + id, {content: `<i class="fas fa-trash"></i>`});
    }
}

const temaValidateEMAInputs = () => {
    const emaInputBoxes = temaInputContainer.querySelectorAll(".tema-ema-input-box");
    var isValid = true;

    emaInputBoxes.forEach((box) => {
        const time = box.querySelector(".tema-time-input").value;
        const direction = box.querySelector(".tema-ema-direction").value;
        const emaRange = box.querySelector("input").value;

        if(time && direction && emaRange){
            box.querySelector("p").classList.add("hide");
        }else{
            isValid = false;
            box.querySelector("p").classList.remove("hide");
        }
    });

    return isValid;
}

const temaGetEMAInputsData = () => {
    const emaInputBoxes = temaInputContainer.querySelectorAll(".tema-ema-input-box");
    var data = [];

    emaInputBoxes.forEach((box) => {
        const time = box.querySelector(".tema-time-input").value;
        const direction = box.querySelector(".tema-ema-direction").value;
        const emaRange = box.querySelector("input").value;

        data.push({
            time: time,
            direction: direction,
            emaRange: emaRange
        });
    });

    return data
}

// ============ Target EMA Display ===================
const temaTableRow = (currentAlert) => {
    return `
        <tr id="tema-tr-${currentAlert._id}">
            <td>${currentAlert.coinName}</td>
            <td>${baCoinsPriceList[currentAlert.coinName]}</td>
            <td>${currentAlert.targetPrice}</td>
            <td>${currentAlert.direction.toUpperCase()}</td>
            <td>${formatDate(currentAlert.dateAdded)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="temaShowNote('${currentAlert._id}')"><i class="fas fa-eye"></i></button>
                
                <button class="btn btn-danger btn-sm" id="tema-del-${currentAlert._id}" onclick="temaInitiateDelete('${currentAlert._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

const temaShowNote = (id) => {
    const selectedAlert = temaAlerts.find((alert) => {
        return alert._id === id;
    });

    if(selectedAlert.note.trim().length > 0){
        document.querySelector("#note-element").textContent = selectedAlert.note;
    }

    const alertDetailsElement = document.querySelector("#alert-details");
    var message = "<label>Alert Details:</label>";

    selectedAlert.emaTargets.forEach((target) => {
        message += `
            <p>
                => when the price of ${selectedAlert.coinName} goes  
                ${selectedAlert.direction} to ${selectedAlert.targetPrice} and its ${target.direction} 
                ${target.emaRange} EMA on ${target.time} timeframe.
            </p>
        `;
    });

    alertDetailsElement.innerHTML = message;

    showModal("showNoteModal");
}

const temaUpdateTable = () => {
    var alertHtml = "";

    for(var i = 0; i < temaAlerts.length; i++){
        var currentAlert = temaAlerts[i];

        alertHtml += temaTableRow(currentAlert);
    }

    document.querySelector("#tema-tbody").innerHTML = alertHtml;
}

// ============ Target EMA Logic ===================
const temaStartAlert = async () => {
    if(baCoinsPriceList["BTCUSDT"]){
        temaAlerts = await temaFetchAlert();
        temaUpdateTable();

        await temaCheckIfTargetPriceHit();
        await temaCalculateEmaForAlerts();
    }
}

const temaCheckIfTargetPriceHit = async () => {
    if(temaAlerts.length === 0){
        return;
    }

    for(var i = 0; i < temaAlerts.length; i++){
        var alert = temaAlerts[i];
        var currentPrice = parseFloat(baCoinsPriceList[alert.coinName]);

        if(alert.isTargetPriceHit){
            continue;
        }

        if(alert.direction === "up" && currentPrice >= alert.targetPrice){
            await temaUpdateAlertTargetHit(alert);
            alert.isTargetPriceHit = true;
        }else if(alert.direction === "down" && currentPrice <= alert.targetPrice){
            await temaUpdateAlertTargetHit(alert);
            alert.isTargetPriceHit = true;
        }
    }
}

const temaCalculateEmaForAlerts = async () => {
    if(temaAlerts.length === 0){
        return;
    }

    for(var i = 0; i < temaAlerts.length; i++){
        var alert = temaAlerts[i];

        if(!alert.isTargetPriceHit){
            continue;
        }

        for(var j = 0; j < alert.emaTargets.length; j++){
            var emaTarget = alert.emaTargets[j];
            const candleData =  await fetchCandleData(alert.coinName, emaTarget.time);
            const closingPrices = getClosingPriceArray(candleData);
            ema = calculateEMA(closingPrices, emaTarget.emaRange);

            const currentPrice = parseFloat(baCoinsPriceList[alert.coinName]);
            var notif = {
                _id: emaTarget._id,
                coinName: alert.coinName, 
                targetPrice: alert.targetPrice, 
                direction: alert.direction, 
                note:alert.note,
                dateAdded: alert.dateAdded,
                alertType: "tema",
            };

            if(emaTarget.direction === "above" && currentPrice >= ema){
                notif.message = notif.coinName + " has gone " + alert.direction +
                                " to the target price of " + alert.targetPrice +
                                " and is above the " + emaTarget.emaRange + 
                                " EMA on " + emaTarget.time + " timeframe.";

                const result = await addNotification(notif);
                if(!result.error){
                    await temaUpdateOrRemoveAlert(alert, emaTarget._id);
                }
            }else if(emaTarget.direction === "below" && currentPrice <= ema){
                notif.message = notif.coinName + " has gone " + alert.direction +
                                " to the target price of " + alert.targetPrice +
                                " and is below the " + emaTarget.emaRange + 
                                " EMA on " + emaTarget.time + " timeframe.";
                const result = await addNotification(notif);
                if(!result.error){
                    await temaUpdateOrRemoveAlert(alert, emaTarget._id);
                }
            }
        }
    }
}

// ============ Target EMA Form Validation ===================
$(document).ready(() => {
    temaForm = $("#tema-alert-form");

    temaValidator = temaForm.validate({
        rules:{
            temaCoinName: {
                required: true,
                isCoinExist: true
            },
            temaTargetPrice:{
                required: true,
            },
            temaDirection:{
                required: true
            },
            temaDateAdded:{
                required: true
            }
        }
    });

    temaForm.on("submit", function(e){
        e.preventDefault();

        if(temaForm.valid()){
            temaAdd();
        }
    });
});
