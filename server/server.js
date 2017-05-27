"use strict";
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var cors = require('cors')

var Player = require('./player');

// 1600-32-8 = 1522

const TILE_WIDTH = 1560
const TILE_HEIGHT = 1552-8

app.use(cors())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var colors = ['#999999', '#CCCCCC', '#00FF00', '#0000FF', '#FF0000', '#FFFF00'];
var users = [];
var particules = [];
var INTERVAL = 100;``
var COLLECTIBLES_SPAWN_AMOUNT = 100;

var snapshot = {
    players: [],
    bullets: [],
    collectibles: []
};

var area = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
}

var randomPosition = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

var spawnCollectibles = () => {
    snapshot.collectibles.forEach(function(collectible) {
        if(collectible.isCollected) {
            let now = new Date();
            collectible.id = now.getTime();
            collectible.x = randomPosition(area.minX, TILE_WIDTH);
            collectible.y = randomPosition(area.minY, TILE_HEIGHT);
            collectible.isCollected = false; 
        }
    }, this);
}

for(var i = 0; i < COLLECTIBLES_SPAWN_AMOUNT; i++) {
    console.log(i)
    let now = new Date();
    let collectible = {
        id: now.getTime(),
        x: randomPosition(area.minX, TILE_WIDTH),
        y: randomPosition(area.minY, TILE_HEIGHT),
        isCollected: false
    };
    snapshot.collectibles[collectible.id] = collectible;
}

io.on('connection', function (socket) {
    // console.log("CONNECTION");
    var me = false;

    socket.on('new_player', function (user) {
        // 1.
        ///////////////////////////////////////////////////////
        // Broadcast about this new player to other players
        ///////////////////////////////////////////////////////
        // socket.emit('getParticules', particules);
        // for (var k in users) {
        //     socket.emit('new_player', users[k]);
        // }

        // users[me.id] = me;
        // console.log('user-id', me.id);
        // socket.broadcast.emit('new_player', user);
        //////////////////////////////////////////

        // 2.
        /////////////////////////////////////////
        // Add new player to current snapshot
        /////////////////////////////////////////
        if(snapshot.players[user.id]) {
            socket.emit('exist', true);
        } else {
            me = user;
            snapshot.players[user.id] = new Player(
                user.id,
                user.username,
                colors[randomPosition(0, colors.length)],
                randomPosition(area.minX, area.maxX),
                randomPosition(area.minY, area.maxY)
            );
            // console.log('[NEW PLAYER] ID = ', user.id, ' Username = ', user.username, "PLAYER_INFO", snapshot.players[user.id]);
        }
        //////////////////////////////////////////

        spawnCollectibles();
    });

    // socket.on('update_particles', function (id) {
    //     particules[id] = {
    //         x: randomIntInc(0, 3000),
    //         y: randomIntInc(0, 3000),
    //         color: color[randomIntInc(0, 5)],
    //         id: id,
    //         mass: 1
    //     };
    //     io.emit('update_particles', particules[id]);
    // });

    socket.on('move_player', function (playerData) {
        // users[me.id] = user;
        // socket.broadcast.emit('move_player', user);

        ////////////////////////////////////////////////
        // Update requested user's position
        ////////////////////////////////////////////////
        let player = snapshot.players[playerData.id];
        // console.log("[MOVE]", player.x);
        if (player) {
            // console.log("[BEFORE] Update player's position: (", player.x, ",", player.y,")");
            let check_horizontal_bound =    player.x + playerData.direction.x * player.speed * INTERVAL / 1000 <= TILE_WIDTH 
                                            && player.x + playerData.direction.x * player.speed * INTERVAL / 1000 >= 32+8

            let check_vertical_bound =  player.y + playerData.direction.y * player.speed * INTERVAL / 1000 <= TILE_HEIGHT && player.y +
                                            playerData.direction.y * player.speed * INTERVAL / 1000 >=32 + 16
            if (check_horizontal_bound && check_vertical_bound) {
                player.x += playerData.direction.x * player.speed * INTERVAL / 1000;
                player.y += playerData.direction.y * player.speed * INTERVAL / 1000;
            }

            // console.log("[AFTER] Update player's position: (", player.x, ",", player.y,")");
        }
    });

    socket.on('shoot', function (bulletInfo) {

        // 1.
        //////////////////////////////////////////////
        // Player throws a projectile
        // Broadcast about the projectile
        /////////////////////////////////////////////
        // users[me.id] = user;
        // socket.broadcast.emit('shoot', user);
        ///////////////////////////////////////////////

        // 2.
        ///////////////////////////////////////////////
        // Update snapshot that there is a projectile spawned
        ///////////////////////////////////////////////
        let bullet = {
            ownerId: bulletInfo.id,
            startX: bulletInfo.start_x,
            startY: bulletInfo.start_y,
            endX: bulletInfo.end_x,
            endY: bulletInfo.end_y,

        };
        // console.log("bullet", bullet);
        snapshot.bullets.push(bullet);
    });

    socket.on('kill_player', function (user) {

        /////////////////////////////////////////////
        // Kill shot player 
        // Broadcast killed player
        //////////////////////////////////////////////
        // users[me.id] = user;
        // socket.emit('kill_player', user);

        //////////////////////////////////////////////
        // Update snapshot that someone has been shot
        //////////////////////////////////////////////
        snapshot.players[user.id].isAlive = false;
    });

    socket.on('disconnect', function () {
        console.log(me);
        if (!me) {
            return false;
        }
        // console.log("[DISCONNECTION]", me);
        delete users[me.id];

        /////////////////////////////////////////
        // Remove player from snapshot
        delete snapshot.players[me.id];

        socket.broadcast.emit('logout', me.id);
    });

    socket.on('playArea', function (play_area) {
        // console.log("[PLAY_AREA_SIZE] Received", play_area);
        if (area.maxX == 0 && area.maxY == 0) {
            area.minX = play_area.offset;
            area.minY = play_area.offset;
            area.maxX = play_area.x_max - play_area.offset;
            area.maxY = play_area.y_max - play_area.offset;
            console.log(area);
        }
    });

    socket.on('hitPlayer', function (hitPlayerInfo) {
        let dealer = snapshot.players[hitPlayerInfo.dealerId];
        let taker = snapshot.players[hitPlayerInfo.takerId];
        if (dealer && taker) {
            taker.health -= dealer.damage;
            taker.isAlive = (taker.health <= 0) ? false : true;
            if(!taker.isAlive) {
                dealer.killPlayer();
                taker.x = randomPosition(area.minX, area.maxX);
                taker.y = randomPosition(area.minY, area.maxY);
            }
        }
    });

    socket.on('respawn', function (playerInfo) {
        let player = snapshot.players[playerInfo.id];
        // player.x = randomPosition(area.minX, area.maxX);
        // player.y = randomPosition(area.minY, area.maxY);
        player.reset();
    });

    socket.on('collect', function (playerInfo) {
        let player = snapshot.players[playerInfo.id];
        player.collect();
        // console.log(player.username, "'s score =", player.score);
    });

});

server.listen(3000, function () {
    console.log('listening on *:3000');
});

function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

setInterval(() => {
    //////////////////////////////////////////
    // Update server snapshot
    //////////////////////////////////////////
    // console.log("Broadcasting...", snapshot.players);
    let currentSnapshot = {
        players: Object.assign({}, snapshot.players),
        bullets: Object.assign({}, snapshot.bullets),
        collectibles: Object.assign({}, snapshot.collectibles)
    };
    snapshot.bullets.splice(0, snapshot.bullets.length);
    io.emit('update_snapshot', currentSnapshot);
    // io.emit('update_snapshot', snapshot);
}, INTERVAL)