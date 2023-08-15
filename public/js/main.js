// ====================== Socket.io ===========================
const socket = io();

socket.on("data", (data) => {
    baCoinsPriceList = data.coinsCurrentPrices;
    baAlerts = data.baAlerts;
    temaAlerts = data.temaAlerts;
    notifications = data.notifications;

    baUpdateTable();
    temaUpdateTable();
    showNotifications();
    playSound();
});


