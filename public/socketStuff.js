// const io = require('../node_modules/socket.io/client-dist/socket.io')
// const test = io.connect('http://localhost:9000');
const socket = io('http://127.0.0.1:9000', {
    withCredentials: false
});

const init = async () => {
    const initOrbs = await socket.emitWithAck('init', {
        playerName: player.name
    });

    console.log(initOrbs);
    orbs = initOrbs;
    draw();
};

socket.on('tick', (players) => {
    players = playersArray;
});
