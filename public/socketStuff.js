// const io = require('../node_modules/socket.io/client-dist/socket.io')
// const test = io.connect('http://localhost:9000');
const socket = io('http://127.0.0.1:9000', {
    withCredentials: false
});

const init = async () => {
    const initData = await socket.emitWithAck('init', {
        playerName: player.name
    });

    setInterval(() => {
        socket.emit('tock', {
            xVector: player.xVector ? player.xVector : 0.1,
            yVector: player.yVector ? player.yVector : 0.1
        });
    }, 33);

    orbs = initData.orbs;
    player.indexInPlayers = initData.indexInPlayers;
    draw();
};

socket.on('tick', (playersArray) => {
    console.log(players);
    players = playersArray;
    player.locX = players[player.indexInPlayers].playerData.locX;
    player.locY = players[player.indexInPlayers].playerData.locY;
});

socket.on('orbSwitch', (orbData) => {
    // server told us that an orb was absorbed, update the orbs array!
    orbs.splice(orbData.capturedOrbI, 1, orbData.newOrb);
});

socket.on('playerAbsorbed', (absorbData) => {
    console.log('=============================================');
    console.log(`player who was aborbed ${absorbData.absorbed}`);
    console.log(`player who absorbed another player ${absorbData.absorbedBy}`);
    console.log('=============================================');
});
