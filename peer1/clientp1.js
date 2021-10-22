const fs = require('fs');
const dgram = require('dgram');
const ip = require('ip');

const localhost = ip.address();
const my_port = 8080; // peer1
const peer2_port = 8081;
const peer3_port = 8082;

const folder = "toShare/";

const server = dgram.createSocket('udp4');

server.on('error', (e) => {
    console.log('server error:' + e.stack);
    server.close();
});

// quando recebe uma mensagem
server.on('message', (msg, rinfo) => {
    console.log('message: ' + msg + ' from ' + rinfo.address + ":" + rinfo.port);

    // cria um file com a mensagem recebida
    const fileName = msg + '.txt';
    fs.writeFileSync(folder + fileName, msg, (err) => {
        if (err) throw err;
        console.log('File created!');
    });

});

server.on('listening', () => {
    const address = server.address();
    console.log('server listening ' + address.address + ":" + address.port);
});

server.bind({
    address: localhost,
    port: my_port
});

// manda mensagem para peers
const sendMessage = (msg) => {
    const data = Buffer.from(msg);
    console.log('file to send: ' + data);
    
    // cria o arquivo da msg que envia
    fs.writeFileSync(folder + data + '.txt', data, (err) => {
        if (err) throw err;
        console.log('File created and sent!');
    });

    // envia a msg para peers
    server.send(data, peer2_port, localhost);
    server.send(data, peer3_port, localhost);
};

// para sair digite 'exit'
process.openStdin().addListener('data', function (d) {
    if (d.toString().trim() === 'exit') {
        return process.exit();
    }
    // caso contrário envia a mensagem
    sendMessage(d.toString().trim());
})