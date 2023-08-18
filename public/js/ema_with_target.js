// ================= Global Data ===============================
var temaForm = {};
var temaValidator = {};
var temaAlerts = [];

// ============ Tema Form Manupulation ====================
const temaInputContainer = document.querySelector("#tema-ema-inputs");
const temaInputAddBtn = document.querySelector("#tema-input-add-btn");
const temaTargetPriceToggle = document.querySelector("#tema-target-price-toggle");
const temaTargetPriceInputContainer = document.querySelector("#target-price-input-container");
var temaIsTargetPriceNeeded = false;

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

temaTargetPriceToggle.addEventListener("click", () => {
    if(temaIsTargetPriceNeeded){
        temaIsTargetPriceNeeded = false;
        temaTargetPriceInputContainer.setAttribute("class", "hide");
        temaTargetPriceToggle.textContent = "Add Target Price";
    }else{
        temaIsTargetPriceNeeded = true;
        temaTargetPriceInputContainer.setAttribute("class", "");
        temaTargetPriceToggle.textContent = "Remove Target Price";
    }
});

const temaRemoveEmaInput = (e) => {
    e.parentElement.parentElement.remove()
}

// ============ Target EMA CRUD Operations =========================

const temaAdd = async () => {
    const CoinNameInput = document.querySelector("#tema-coin_name");
    const TargetPriceInput = document.querySelector("#tema-target_price");
    const AddedDateInput = document.querySelector("#tema-date_added");
    const DirectionInput = document.querySelector("#tema-direction");
    const NoteInput = document.querySelector("#tema-note");

    const coin = CoinNameInput.value.toUpperCase() + "USDT";
    const addedDate = new Date(AddedDateInput.value).toISOString();
    const note = NoteInput.value;
    const coinCurrentPrice = parseFloat(baCoinsPriceList[coin]);
    var targetPrice = parseFloat(TargetPriceInput.value);
    var direction = DirectionInput.value.trim();

    if(temaIsTargetPriceNeeded){
        if(!targetPrice){
            return temaValidator.showErrors({
                "temaTargetPrice": "Target Price should not be empty."
            });
        }

        if(!direction){
            return temaValidator.showErrors({
                "temaDirection": "A direction should be selected."
            });
        }
    }else{
        targetPrice = undefined;
        direction = undefined;
    }

    if(temaIsTargetPriceNeeded){
        if(coinCurrentPrice < targetPrice && direction === "down"){
            return temaValidator.showErrors({
                "temaTargetPrice": "Target price should not be higher than the current price for down direction."
            });
        }else if(coinCurrentPrice > targetPrice && direction === "up"){
            return temaValidator.showErrors({
                "temaTargetPrice": "Target price should not be less than the current price for up direction."
            });
        }
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
    var targetPrice = currentAlert.targetPrice ? currentAlert.targetPrice: "Not Set";
    var direction = currentAlert.direction ? currentAlert.direction.toUpperCase() : "Not Set";

    return `
        <tr id="tema-tr-${currentAlert._id}">
            <td>${currentAlert.coinName}</td>
            <td>${baCoinsPriceList[currentAlert.coinName]}</td>
            <td>${targetPrice}</td>
            <td>${direction}</td>
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

const temaUpdateTable = () => {
    var alertHtml = "";

    for(var i = 0; i < temaAlerts.length; i++){
        var currentAlert = temaAlerts[i];

        alertHtml += temaTableRow(currentAlert);
    }

    document.querySelector("#tema-tbody").innerHTML = alertHtml;
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
