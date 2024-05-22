const net = require('net');
const Store = require('electron-store');

const store = new Store();
const client = new net.Socket();
let ip = store.get('ip', '0.0.0.0');
let port = store.get('port', 3001);

function connect() {
    client.connect(port, ip, function() {
        //console.log('Соединение установлено');
    });
}

client.on('data', function(data) {
    const message = data.toString().trim();
    const values = message.split(',');
    if (values.length > 0) {
        updateSlidersAndButtons(values);
        document.getElementById('dataDisplay').textContent = message;
    }
});

client.on('close', function() {
    //console.log('Соединение закрыто, попытка переподключения...');
    setTimeout(connect, 5000);
});

client.on('error', function(err) {
    //console.error('Ошибка соединения: ', err);
    client.destroy();
});
