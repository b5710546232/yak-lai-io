/* globals __DEV__ */
import Phaser from 'phaser'

import Player from '../prefabs/player'
import Enemy from '../prefabs/enemy'
import ClientPlayer from '../prefabs/ClientPlayer'
import Collectible from '../prefabs/collectible'

import io from 'socket.io-client'

import Bullet from '../prefabs/bullet'
import Pool from '../utils/pool'

import Config from '../config'

// import phaserTouchControl from '../plugins/phaser-touch-control'
import phaserTouchControl from '../plugins/vjoy'


import {
  centerGameObjects
} from '../utils'


export default class extends Phaser.State {
  init() {
    this.user_info = this.game.user_info
    // console.log('user_info', this.user_info.uid)
  }
  preload() {}

  create() {


    // console.log(this.game.userName);



    // this.game.virtualShooter = this.add.plugin(phaserTouchControl)





    const bannerText = 'yak-lai'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    banner.font = 'Bangers'
    banner.padding.set(10, 16)
    banner.fontSize = 40
    banner.fill = '#77BFA3'
    banner.smoothed = false
    banner.anchor.setTo(0.5)



    // particle



    this.map = this.game.add.tilemap('tilemap');
    this.map.addTilesetImage('tile-sheet-yak', 'tiles');




    this.groundLayer = this.map.createLayer('GroundLayer');
    this.wallLayer = this.map.createLayer('WallLayer');

    //Change the world size to match the size of this layer
    this.groundLayer.resizeWorld();





    // particle

    this.emitter = this.game.add.emitter(0, 0, 30);
    this.emitter.makeParticles("square_16x16");
    this.emitter.maxParticleScale = 0.1 * 5;
    this.emitter.minParticleScale = 0.05 * 5;



    // set bound of world

    // this.game.world.setBounds(0, 0, Config.gameWidth * Config.worldSize, Config.gameHeight * Config.worldSize)

    this.setEventHandlers();
    // this.game.add.e


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

    this.collectibles = [];
    this.collectibleGroup = this.game.add.group();

    this.deadscreen = this.add.image((game.width / 2) - 250, game.height / 2 - 200, 'dead_scene')
    this.respawnButton = this.add.button(game.width / 2 - 120, game.height / 2, 'continueBtn', () => {

    });
    this.respawnButton.onInputDown.add(() => {
      this.player.isDie = false
      this.player.alpha = 1
      this.player.respawn()
      this.closeDeadScene()
    })
    this.deadscreen.fixedToCamera = true;
    this.respawnButton.fixedToCamera = true;

    this.closeDeadScene()


    this.score = 0
    this.scoreStr = `score : ${this.score}`
    this.scoreText = this.game.add.text(50, 50, this.scoreStr)
    this.scoreText.fill = '#FFFFFF'
    this.scoreText.align = 'center'
    this.scoreText.font = '10px Barrio'
    this.scoreText.stroke = '#000000';
    this.scoreText.strokeThickness = 2;
    // this.scoreText.anchor.setTo(0.5)
    this.scoreText.fixedToCamera = true;


    // this.topScoreText = gameSelf.add.text(gameSelf.camera.width - 250, 100 + (index * 25), topScore.name + ' : ' + topScore.score);
    this.topScoreText = this.game.add.text(this.game.camera.width - 250, 20, ' Top 5 Score');
    this.topScoreText.fill = "#FFFFFF";
    this.topScoreText.align = "center";
    this.topScoreText.font = '10px Barrio'
    this.topScoreText.stroke = '#000000';
    this.topScoreText.strokeThickness = 2;
    this.topScoreText.fixedToCamera = true;



    ////////////////////////////
    // init  Receive top 5 scores from firebase

    this.game.database.ref('users/').orderByChild('score').limitToLast(5).
    on('value', (snapshot) => {
      let index = 5;
      this.topScore = 'Top 5 Score \n'
      snapshot.forEach((user) => {
        let topScore = user.val();
        this.topScore += topScore.name + ' : ' + topScore.score + "\n"
        index--;

      });
      this.topScoreText.setText(this.topScore || 'Top 5 Score')
    });



    // virtual-joy
    this.game.virtualInput = this.add.plugin(phaserTouchControl)
    this.game.virtualInput.configImage({
      compass: 'compass',
      touch: 'touch'
    })
    if (!this.game.device.desktop) {
      // this.game.virtualInput.inputEnable({ width: this.camera.width, side: 'LEFT' });
      this.game.shootButton = this.add.button(700, 350, 'touch_shoot');

      this.game.shootButton.fixedToCamera = true;
      this.game.virtualInput.inputEnable()
    }



  }
  updateScore(newScore) {
    this.scoreText.setText(`Your score : ${newScore}`)
    if (this.game.user_info.username) {
      this.game.database.ref('users/' + this.game.user_info.username).set({
        "name": this.user_info.username,
        "score": parseInt(newScore)
      });
    }


  }
  showDeadScene() {
    this.deadscreen.visible = true
    this.respawnButton.visible = true
  }
  closeDeadScene() {
    this.deadscreen.visible = false
    this.respawnButton.visible = false

    this.leaderboard = [];

  }

  initBullets() {
    let entity_data = {
      game: this.game,
      x: 0,
      y: 0,
      particle: this.emitter
    }
    this.bulletPool = new Pool(this.game, Bullet, 2, entity_data)
  }
  setEventHandlers() {

    let target = 'http://localhost:3000';
    // let target = 'http://128.199.253.181:3000';

    this.socket = io.connect(target);
    this.socket.on('connect', () => {


      this.socket.on('exist', (data) => {
        console.log("PLAYER EXIST", data);
        if (data) {
          this.state.start('Login')
        }
      });

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
        // id: this.user_info.uid,
        username: this.user_info.username,
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
        } else if (this.player.id == data.enemy_id) {
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
        // this.world.resize(this.game.width, this.game.height)
        // this.game.state.start('Login')
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
          if (this.player && this.player.id === current_player.id) {
            this.updateScore(current_player.score || 0)

          }

          // console.log("[ID]", snapshot.players[current_player].username);
          if (!this.players[current_player.id]) {
            // console.log("Is client player" , "from session ", this.socket.io.engine.id, "from server ", current_player.id );
            if (this.socket.io.engine.id == current_player.id) {
              // if (this.user_info.uid == current_player.id) {
              console.log("[NEW] Client")
              let clientPlayer = new ClientPlayer({
                game: this.game,
                x: current_player.x,
                y: current_player.y,
                asset: 'player',
                socket: this.socket,
                score: current_player.score
              });
              this.players[current_player.id] = clientPlayer;
              this.player = clientPlayer;

              if (!this.game.device.desktop) {

                this.game.shootButton.onInputDown.add(() => {
                  // let tween = this.game.add.tween(this.game.shootButton).to({x:1.5,y:1.5})
                  if (this.player) {
                    this.player.shoot()
                  }
                })
              }

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
                id: current_player.id,
                username: current_player.username,
                score: current_player.score
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



            // Find horizontal direction
            updating_player.character.scale.x = (current_player.x > updating_player.x) ? 1 : -1;

            if (updating_player.alive && updating_player.exists && updating_player.visible && updating_player.isAlive) {

              let new_x = parseFloat(updating_player.x).toFixed(0);
              let old_x = parseFloat(current_player.x).toFixed(0);

              let new_y = parseFloat(updating_player.y).toFixed(0);
              let old_y = parseFloat(current_player.y).toFixed(0);

              if (updating_player.alpha == 0) {
                let threshold_res = 50;
                if (Math.abs(new_x - old_x) <= threshold_res && Math.abs(new_y - old_y) <= threshold_res) {
                  updating_player.alpha = 1;
                  if (this.players[current_player.id].alpha == 1) {
                    if (this.player.id == current_player.id) {
                      // this.player.respawn()
                    }
                    // this.players[current_player.id].isDie = false
                  }

                  if (current_player.id === this.player.id) {
                    this.player.isAlive = true
                  }
                }
              }

              //////////////////////////////////////////
              // Tween with Linear interpolation
              let tween = this.game.add.tween(updating_player).to({
                x: [current_player.x],
                y: [current_player.y],
              }, 200, null, true, 0, 0, false);

              updating_player.tween = tween;
              // updating_player.x = current_player.x;
              // updating_player.y = current_player.y;


            }

            // gua method update score
            // updating_player.score = current_player.score;
            // if (this.player && updating_player && this.player.id == updating_player.id) {
            // updating_player.scoretext.setText("Your score: " + current_player.score);

            // }


          }

          /////////////////////////////////////////////////////////
          // Died player is killed
          let currentPlayer = this.players[current_player.id];
          currentPlayer.isAlive = current_player.isAlive;
          if (!currentPlayer.isAlive) {
            // if (currentPlayer.alive) {
              console.log(this.players[current_player.id].id, "died.");
              this.players[current_player.id].alpha = 0;
              if (this.players[current_player.id].alpha === 0) {
                this.players[current_player.id].isDie = true
                if (this.player && this.players[current_player.id].id == this.player.id && this.player.isDie) {
                  this.showDeadScene()
                }
              }
            // }
          }
          ///////////////////////////////////////////////////
          // Respawn player is alive again
          else {
            if (currentPlayer.isAlive) {
              // if (!currentPlayer.visible && !currentPlayer.exists && !currentPlayer.alive) {
              // if(currentPlayer.alpha == 0) {
              // this.game.remove(this.players[current_player.id]);
              // this.players[current_player.id].x = current_player.x;
              // this.players[current_player.id].y = current_player.y;
              // this.players[current_player.id].revive();
              // currentPlayer.alpha = 1;
              // this.players[current_player.id].reset(current_player.x, current_player.y);
              // }
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

        ///////////////////////////////////////////////////////////////////////////
        // Handle collectibles
        for (let collectibleInfo in snapshot.collectibles) {
          let currentCollectible = snapshot.collectibles[collectibleInfo]
          if (!this.collectibles[currentCollectible.id]) {
            let collectible = new Collectible({
              game: this,
              x: currentCollectible.x,
              y: currentCollectible.y,
              id: currentCollectible.id,
              asset: 'ball',
              isCollected: currentCollectible.isCollected
            });
            this.collectibles[collectible.id] = collectible;
            this.collectibleGroup.add(collectible);
            console.log(currentCollectible);
          }
          // else {
          //   let collectible = this.collectibles[currentCollectible.id];
          //   if(collectible.isCollected) {
          //     collectible.kill();
          //   }

          // }

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

    }

  }




  update() {

    // if (this.input.activePointer.position.x + this.camera.x >= this.camera.x + this.camera.width / 2 && this.game.virtualInput) {
    //   // shoot
    //   // this.game.virtualInput.inputDisable();
    //   // this.game.virtualShooter.inputEnable();
    //   console.log('shoot')

    // }
    // else {
    //   // this.game.virtualShooter.inputDisable();
    //   if (!this.inputEnable) {
    //     this.inputEnable = true;
    //     console.log('hello-enable')
    //     this.game.virtualInput.inputEnable({ width: this.camera.width / 2, side: 'LEFT' });
    //   }
    //   console.log('move')
    //   // move

    // }

    // Player w/ bullet
    this.game.physics.arcade.overlap(this.playerGroup, this.bulletPool, this.clientBulletOverlapHandler, this.bulletProcessCallback, this);

    // Bullet w/ bullet
    this.game.physics.arcade.overlap(this.bulletPool, this.bulletPool, this.bulletCollisionProcess, null, this);

    // Player w/ collectible
    this.game.physics.arcade.overlap(this.playerGroup, this.collectibleGroup, this.collectibleOverlapHandler, null, this);

  }
  bulletCollisionProcess(bulletA, bulletB) {
    // still not collsiion
    bulletA.break()
    bulletB.break()
  }

  clientBulletOverlapHandler(player, bullet) {

    ////////////////////////////////////////
    // Favor client shot someone else
    if (player.isAlive) {


      if (bullet.player_id == this.player.id) {
        this.emitter.x = bullet.x
        this.emitter.y = bullet.y
        this.emitter.start(true, 1000, null, 10);

        // console.log(bullet.player_id, "[HIT]", player.id);

        let hitPlayerInfo = {
          dealerId: this.player.id,
          takerId: player.id
        }
        this.socket.emit("hitPlayer", hitPlayerInfo);
      }
      bullet.break();

      //////////////////////////
      // // Send score to firebase
      // this.game.database.ref('users/' + player.username).set({
      //   "name": player.username || "",
      //   "score": player.score || 0
      // });


      this.game.database.ref('users/').orderByChild('score').limitToLast(5).
      on('value', (snapshot) => {
        let index = 5;
        this.topScore = 'Top 5 Score \n'
        snapshot.forEach((user) => {
          let topScore = user.val();
          this.topScore += topScore.name + ' : ' + topScore.score + "\n"
          index--;

        });
        this.topScoreText.setText(this.topScore || 'Top 5 Score')
      });


    }
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

  collectibleOverlapHandler(player, collectible) {

    if (player && this.player && (player.id == this.player.id)) {
      // console.log("Player collected ", collectible);
      let playerInfo = {
        id: this.player.id,
        collectibleId: collectible.id
      };
      this.socket.emit('collect', playerInfo);
      collectible.kill();
    }
  }

}