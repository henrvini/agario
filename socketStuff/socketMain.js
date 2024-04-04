const io = require('../servers').io;
const app = require('../servers').app;
const checkForOrbCollisions = require('./socketCollisions').checkForOrbCollisions;
const checkForPlayerCollisions = require('./socketCollisions').checkForPlayerCollisions;

const Player = require('./classes/Player');
const PlayerConfig = require('./classes/PlayerConfig');
const PlayerData = require('./classes/PlayerData');
const Orb = require('./classes/Orb');

const orbs = [];
const settings = {
    defaultNumberOfOrbs: 500,
    defaultSpeed: 6,
    defaultSize: 6,
    defaultZoom: 1.5,
    worldWidth: 500,
    worldHeight: 500,
    defaultGenericOrbSize: 5
};
const players = [];
const playersForUsers = [];
let tickTockInterval;

initGame();

io.on('connect', (socket) => {
    let player = {};

    socket.on('init', (playerObj, ackCallback) => {
        if (players.length === 0) {
            // someone is about to be added to players. Start tick-tocking
            tickTockInterval = setInterval(() => {
                io.to('game').emit('tick', playersForUsers);
            }, 33); // 1000/30=33.3333, there're 33, 30's in 1000 ms, 1/30th of a second, or 1 of 30fps
        }

        socket.join('game');
        const playerName = playerObj.playerName;
        const playerConfig = new PlayerConfig(settings);
        const playerData = new PlayerData(playerName, settings);
        player = new Player(socket.id, playerConfig, playerData);
        players.push(player); // server use only
        playersForUsers.push({ playerData });

        ackCallback({ orbs, indexInPlayers: playersForUsers.length - 1 });
    });

    socket.on('tock', (data) => {
        // a tock has come in before the player is set up.
        // this is because the client kept tocking after disconnect.
        if (!player.playerConfig) return;

        speed = player.playerConfig.speed;
        const xV = (player.playerConfig.xVector = data.xVector);
        const yV = (player.playerConfig.yVector = data.yVector);

        if ((player.playerData.locX > 5 && xV < 0) || (player.playerData.locX < settings.worldWidth && xV > 0)) {
            player.playerData.locX += speed * xV;
        }
        if ((player.playerData.locY > 5 && yV > 0) || (player.playerData.locY < settings.worldHeight && yV < 0)) {
            player.playerData.locY -= speed * yV;
        }

        // Orbs collisions
        const capturedOrbI = checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings);

        if (capturedOrbI != null) {
            // remove the orb consumed and add a new Orb
            orbs.splice(capturedOrbI, 1, new Orb(settings));
            // update the client with the new orb
            const orbData = {
                capturedOrbI,
                newOrb: orbs[capturedOrbI]
            };

            // emit to all sockets in game room
            io.to('game').emit('orbSwitch', orbData);
            io.to('game').emit('updateLeaderBoard', getLeaderBoard());
        }

        // Players collisions
        const absorbData = checkForPlayerCollisions(
            player.playerData,
            player.playerConfig,
            players,
            playersForUsers,
            socket.id
        );

        if (absorbData) {
            io.to('game').emit('playerAbsorbed', absorbData);
            io.to('game').emit('updateLeaderBoard', getLeaderBoard());
        }
    });

    socket.on('disconnect', () => {
        // check if players empty. If so, stop ticking
        if (players.length === 0) {
            clearInterval(tickTockInterval);
        }
    });
});

function initGame() {
    for (let i = 0; i < settings.defaultNumberOfOrbs; i++) {
        orbs.push(new Orb(settings));
    }
}

function getLeaderBoard() {
    const leaderBoardArray = players.map((curPlayer) => {
        if (curPlayer.playerData) {
            return {
                name: curPlayer.playerData.name,
                score: curPlayer.playerData.score
            };
        } else {
            return {};
        }
    });
    return leaderBoardArray;
}
