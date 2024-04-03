// const io = require('../node_modules/socket.io/client-dist/socket.io')
const test = io.connect('http://localhost:9000');

test.on('init', (initData) => {
    console.log(initData);
    orbs = initData.orbs;
});
