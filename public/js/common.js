// ----------------------- Loading Content ----------------------------------
const addLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Adding...`;

const generalLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
                    
// ------------------------- Utility Methods --------------------------------------------

// Common data
var notifications = [];
var isUpdating = false;

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
            <button class="btn btn-danger btn-sm" id="notif-del-${notif._id}" onClick="removeNotification('${notif._id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

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

// =========================== Notification CRUD ========================
const showNotifications = () => {
    var notiHtml = ``;

    for(var i = 0; i < notifications.length; i++){
        var notification = notifications[i];

        notiHtml += generateNotif(notification);
    }

    document.querySelector("#notifications").innerHTML = notiHtml;
}

const removeNotification = async (id) => {
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