/* globals __DEV__ */
import Phaser from 'phaser'

import Player from '../prefabs/player'
import Enemy from '../prefabs/enemy'
import ClientPlayer from '../prefabs/clientPlayer'

import io from 'socket.io-client'

import Bullet from '../prefabs/bullet'
import Pool from '../utils/pool'

import Config from '../config'

export default class extends Phaser.State {

  preload() { }

  create() {
    const bannerText = 'yak-lai'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    banner.font = 'Bangers'
    banner.padding.set(10, 16)
    banner.fontSize = 40
    banner.fill = '#77BFA3'
    banner.smoothed = false
    banner.anchor.setTo(0.5)


    this.map = this.game.add.tilemap('tilemap');
    this.map.addTilesetImage('tile-sheet-yak', 'tiles');

    

    this.groundLayer = this.map.createLayer('GroundLayer');
    this.wallLayer = this.map.createLayer('WallLayer');

 
    //Change the world size to match the size of this layer
    this.groundLayer.resizeWorld();


    


    // set bound of world

    this.game.world.setBounds(0, 0, Config.gameWidth * Config.worldSize, Config.gameHeight * Config.worldSize)

    this.setEventHandlers();
    // this.game.add.e
    this.t_bullet = new Bullet({
      game: this,
      x: 30,
      y: 30
    });
    this.game.add.existing(this.t_bullet);

    // for show fps
    this.game.time.advancedTiming = true;

    this.players = [];
    this.playerGroup = this.game.add.group()

    this.initBullets();

    //////// Snapshot
    // this.snapshot = {};

    let music = game.add.audio('soundtrack');
    music.loop = true;
    music.play();
    music.volume = 0.1;
  }

  initBullets() {
    let entity_data = {
      game: this.game,
      x: 0,
      y: 0
    }
    this.bulletPool = new Pool(this.game, Bullet, 2, entity_data)
  }
  setEventHandlers() {

    let target = 'http://localhost:3000'
    // let target = 'http://128.199.253.181:3000/'
    
    this.socket = io.connect(target);
    this.socket.on('connect', () => {

      ///////////////////////////////////////////////
      // Tell server about play area
      ///////////////////////////////////////////////
      let play_area = {
        x_min: 0,
        x_max: this.game.width,
        y_min: 0,
        y_max: this.game.height,
        offset: this.game.cache.getImage('player').height
      };
      this.socket.emit('playArea', play_area);
      ///////////////////////////////////////////////////

      // this.player = new Player({
      //   this.player = new ClientPlayer({
      //   game: this.game,
      //   x: this.world.centerX,
      //   y: this.world.centerY,
      //   asset: 'player',
      //   socket: this.socket
      // })


      // this.player.setBulletPool(this.bulletPool);
      let playerData = {
        id: this.socket.io.engine.id,
        username: this.socket.io.engine.id,
      };

      this.socket.emit('new_player', playerData);


      ///////////////////////////////////////////////////////
      // Receive new player
      ////////////////////////////////////////////////////
      // this.socket.on('new_player', (newPlayer) => {
      //   // console.log('new-player', enemy);
      //   // this.players[enemy.id] = new Enemy({
      //     this.players[newPlayer.id] = new Player({
      //     game: this.game,
      //     // x: enemy.x,
      //     // y: enemy.y,
      //     x: newPlayer.x,
      //     y: newPlayer.y,
      //     asset: 'player',
      //     // enemy_info: enemy
      //     player_info: newPlayer
      //   })
      //   // this.playerGroup.add(this.players[enemy.id])
      //   // this.players[enemy.id].setBulletPool(this.bulletPool);
      //   this.playerGroup.add(this.players[newPlayer.id])
      //   this.players[newPlayer.id].setBulletPool(this.bulletPool);
      // })
      //////////////////////////////////////////////////

      /////////////////////////////////////////////////
      // Move players
      ////////////////////////////////////////////////
      // this.socket.on('move_player', (enemy) => {
      //   if (this.players[enemy.id]) {
      //     // this.players[enemy.id].move(enemy);
      //     this.players[enemy.id].x = enemy.x;
      //     this.players[enemy.id].y = enemy.y;
      //   }
      // });
      //////////////////////////////////////////////

      this.socket.on('shoot', (enemy) => {
        if (this.players[enemy.id]) {
          // console.log('shoot-enemy',enemy);
          this.players[enemy.id].shootTo(enemy.end_x, enemy.end_y)


        }
      });
      /////////////////////////////////////////////////////////

      this.socket.on('kill_player', (data) => {
        console.log(this.player.id, data.enemy_id);
        if (this.players[data.enemy_id]) {
          this.players[data.enemy_id].isAlive = false;
          this.players[data.enemy_id].x = 0;
          this.players[data.enemy_id].y = 0;
        }
        else if (this.player.id == data.enemy_id) {
          this.player.isAlive = false;
        }
      });

      ///////////////////////////////////////////////////
      // Player disconnect from server
      //////////////////////////////////////////////////
      this.socket.on('logout', (id) => {
        // for (let i in this.players) {
        //   console.log(i, this.players[i], this.players[id]);
        // }
        this.players[id].kill();
        delete this.players[id];
      });
      /////////////////////////////////////////////////////

      ///////////////////////////////////////////////
      // Update snapshot from server
      ///////////////////////////////////////////////
      this.socket.on('update_snapshot', (snapshot) => {

        // console.log("Updating snapshot...", snapshot);
        // console.log("# of PLAYERS =", snapshot.players);
        for (let socket_id in snapshot.players) {
          // console.log(snapshot.players[socket_id]);
          let current_player = snapshot.players[socket_id];
          // console.log("[ID]", snapshot.players[current_player].username);
          if (!this.players[current_player.id]) {
            // console.log("Is client player" , "from session ", this.socket.io.engine.id, "from server ", current_player.id );
            if (this.socket.io.engine.id == current_player.id) {
              console.log("[NEW] Client")
              let clientPlayer = new ClientPlayer({
                game: this.game,
                x: current_player.x,
                y: current_player.y,
                asset: 'player',
                socket: this.socket
              });
              this.players[current_player.id] = clientPlayer;
              this.player = clientPlayer;

              // set camera follow player
              this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON)


              clientPlayer.setBulletPool(this.bulletPool);
            } else {
              console.log("[NEW] Other Player");
              let newPlayer = new Player({
                game: this.game,
                x: current_player.x,
                y: current_player.y,
                asset: 'player',
                id: current_player.id
                // enemy_info: current_player
              });
              this.players[current_player.id] = newPlayer;
              newPlayer.setBulletPool(this.bulletPool);
            }
            this.playerGroup.add(this.players[current_player.id]);
          } else {
            //////////////////////////////////////////////////////
            // Update exisiting player
            let updating_player = this.players[current_player.id];

            // add animation


            let new_x = parseFloat(updating_player.x).toFixed(0);
            let old_x = parseFloat(current_player.x).toFixed(0);

            let new_y = parseFloat(updating_player.y).toFixed(0);
            let old_y = parseFloat(current_player.y).toFixed(0);


            let threshold = 5;


            if (Math.abs(new_x - old_x) > threshold || Math.abs(new_y - old_y) > threshold) {
              // console.log('walk',new_x,old_x,updating_player.animations.name )
              if (updating_player.character.animations.name !== 'run') {
                // console.log('walk',new_x,old_x,updating_player.animations.name )
                updating_player.character.animations.play("run")
              }
            } else {
              // console.log('idle',new_x,old_x,updating_player.animations.name )
              updating_player.character.animations.play("idle")
            }


            //////////////////////////////////////////
            // Find horizontal direction
            updating_player.scale.x = (current_player.x > updating_player.x) ? 1 : -1;

            if (updating_player.alive && updating_player.exists && updating_player.visible) {
              //////////////////////////////////////////
              // Tween with Linear interpolation
              this.game.add.tween(updating_player).to({
                x: [current_player.x],
                y: [current_player.y],
              }, 200, null, true, 0, 0, false);
            }
          }

          /////////////////////////////////////////////////////////
          // Died player is killed
          let currentPlayer = this.players[current_player.id];
          currentPlayer.isAlive = current_player.isAlive;
          if (!currentPlayer.isAlive) {
            if (currentPlayer.alive && currentPlayer.exists && currentPlayer.visible) {
              console.log(this.players[current_player.id].id, "died.");
              this.players[current_player.id].kill();
            }
          }
          ///////////////////////////////////////////////////
          // Respawn player is alive again
          else {
            if (currentPlayer.isAlive) {
              if (!currentPlayer.alive && !currentPlayer.exists && !currentPlayer.visible) {
                // this.players[current_player.id].revive();
                // this.players[current_player.id].x = current_player.x;
                // this.players[current_player.id].y = current_player.y;
                this.players[current_player.id].reset(current_player.x, current_player.y);
              }
            }
          }

        }

        // console.log(snapshot.bullets);
        for (let bulletInfo in snapshot.bullets) {
          let currentBullet = snapshot.bullets[bulletInfo];
          // console.log(currentBullet);
          // console.log(this.players[currentBullet.ownerId], "shot");
          if (currentBullet.ownerId != this.player.id) {
            this.players[currentBullet.ownerId].shootTo(currentBullet.endX, currentBullet.endY);
            this.players[currentBullet.ownerId].arms.animations.play("attack")
            console.log('attack')
          }
        }
      });
      //////////////////////////////////////////////////

      ////////////////////////////////////////////////
      // Disconnect from server
      ////////////////////////////////////////////////
      this.socket.on('disconnect', () => {
        console.log("[DISCONNECT] USER_2_SERVER");
      });
      ////////////////////////////////////////////////      

    })
  }

  render() {
    if (__DEV__) {
      this.game.debug.text('Active Bullets: ' + this.bulletPool.countLiving() + ' / ' + this.bulletPool.total, 32, 32);
      // this.game.debug.spriteInfo(this.player, 32, 32)
      this.game.debug.text('fps: ' + this.game.time.fps || '--', 32, 140);
      // if (this.player) {
      //   this.game.debug.body(this.player);
      // }
      if (this.playerGroup) {
        for (let i in this.players) {
          this.game.debug.body(this.players[i]);
        }
      }
      this.game.debug.body(this.t_bullet)

    }

  }




  update() {


    this.game.physics.arcade.overlap(this.playerGroup, this.bulletPool, this.clientBulletOverlapHandler, this.bulletProcessCallback, this);


  }

  clientBulletOverlapHandler(player, bullet) {

    ////////////////////////////////////////
    // Favor client shot someone else
    if (bullet.player_id == this.player.id) {
      console.log(bullet.player_id, "[HIT]", player.id);
      let hitPlayerInfo = {
        dealerId: this.player.id,
        takerId: player.id
      }
      this.socket.emit("hitPlayer", hitPlayerInfo);
    }
    bullet.kill();
    // //////////////////////////////////////
    // // Someone else shot someone else
    // else if( bullet.player_id !== this.player.id) {
    //   console.log( "NOT client", bullet.player_id, "[HIT]", player.id);
    //   bullet.kill();
    // }


  }

  bulletProcessCallback(player, bullet) {
    let isProcessable = false;
    /////////////////////////////////////
    // Check if the bullet is killed
    isProcessable = (bullet.alive && bullet.exists && bullet.visible) ? true : false;
    isProcessable = (player.id == bullet.player_id) ? false : true;
    return isProcessable;
  }

  enemyBulletOverlapHandler(player, bullet) {

  }


}