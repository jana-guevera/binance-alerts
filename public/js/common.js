// ----------------------- Loading Content ----------------------------------
const addLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Adding...`;

const generalLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
                    
// ------------------------- Utility Methods --------------------------------------------

// Common data
var notifications = [];

// Welcome Message
swal({
    text: "Welcome, Happy Trading!",
    button: false,
});

// Audio Settings
var alertSoundBtn = document.querySelector("#alert-sound-btn");
var isAlertBtnOn = true;
var isAudioPlaying = false;
var audio = new Audio("/alert.mp3");

const showSuccess = (data) => {
    toastr.success(data.msg);
}

const showError = (data) => {
    toastr.error(data.msg)
}

const showModal = (modalId) => {
    $("label.error").hide();
    $(".error").removeClass("error");
    $('#' + modalId).modal("show");
}

const closeModal = (modalId) => {
    $('#' + modalId).modal("hide");
}

const showLoader = (selector, data) => {
    const element = document.querySelector(selector);
    element.disabled = true;
    element.innerHTML = data.content;
}

const hideLoader = (selector, data) => {
    const element = document.querySelector(selector);
    element.disabled = false;
    element.innerHTML = data.content;
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
}

const generateNotif = (notif) => {
    return `
        <div class="alert alert-warning" role="alert" id="notif-box-${notif._id}">
            <p>${notif.message}</p>
            <button class="btn btn-danger btn-sm" id="notif-del-${notif._id}" onClick="baRemoveNotification('${notif._id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// const sendAlertEmail = async (data) => {
//     try{
//         const response = await fetch("/send-alert-email", {
//             method: "POST",
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//         });
    
//         const result = await response.json();

//         if(result.error){
//             return showError({msg: result.error});
//         }
//     }catch(e){
//         showError({msg: e.message});
//     }
// }

jQuery.validator.addMethod("isCoinExist", function(value, element){
    var coin = value.toUpperCase() + "USDT";

    if(!baCoinsPriceList[coin]){
        return false;
    }else{
        return true;
    }
}, "Invalid coin name");

// Alert sound on off
alertSoundBtn.addEventListener("click", () => {
    if(isAlertBtnOn){
        alertSoundBtn.textContent = "On Alerts";
        isAlertBtnOn = false; 
        stopSound();
    }else{
        alertSoundBtn.textContent = "Mute Alerts"
        isAlertBtnOn = true;
        playSound();
    }
});

function playSound(){
    if(isAlertBtnOn && !isAudioPlaying && notifications.length > 0){
        audio.loop = true;
        audio.play();
    }else{
        audio.pause();
    }
}

function stopSound(){
    audio.pause();
}