var baCoinsPriceList = {};
var baAlerts = [];
var baValidator = {};
var baForm = {};

// Populate basic alert table
const baUpdateTable = () => {
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
            baForm[0].reset();
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
    document.querySelector("#alert-details").innerHTML = "";
    showModal("showNoteModal");
}

$(document).ready(() => {
    baForm = $("#basic-alert-form");

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

