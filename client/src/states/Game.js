/* globals __DEV__ */
import Phaser from 'phaser'

import Player from '../prefabs/player'
import Enemy from '../prefabs/enemy'

import io from 'socket.io-client'

import Bullet from '../prefabs/bullet'
import Pool from '../utils/pool'

import Config from '../config'

export default class extends Phaser.State {

  preload() {}

  create() {
    const bannerText = 'yak-lai'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    banner.font = 'Bangers'
    banner.padding.set(10, 16)
    banner.fontSize = 40
    banner.fill = '#77BFA3'
    banner.smoothed = false
    banner.anchor.setTo(0.5)
    this.game.world.setBounds(0, 0, Config.gameWidth, Config.gameHeight)
    this.setEventHandlers();

    this.t_bullet = new Bullet({
      game: this,
      x: 30,
      y: 30
    });

    this.game.add.existing(this.t_bullet);

    // for show fps
    this.game.time.advancedTiming = true;

    this.players = [];
    this.enemyGroup = this.game.add.group()

    this.initBullets();

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

    let url = 'http://158.108.139.18:3000'
    this.socket = io.connect(url);
    this.socket.on('connect', () => {
      this.player = new Player({
        game: this.game,
        x: this.world.centerX,
        y: this.world.centerY,
        asset: 'player',
        socket: this.socket
      })

      this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON)


      this.player.setBulletPool(this.bulletPool);
      this.socket.emit('new_player', this.player.toJson());

      // new player
      this.socket.on('new_player', (enemy) => {
        // console.log('new-player', enemy);
        this.players[enemy.id] = new Enemy({
          game: this.game,
          x: enemy.x,
          y: enemy.y,
          asset: 'player',
          enemy_info: enemy
        })
        this.enemyGroup.add(this.players[enemy.id])
        this.players[enemy.id].setBulletPool(this.bulletPool);
      })
      // Player
      this.socket.on('move_player', (enemy) => {
        if (this.players[enemy.id]) {
          this.players[enemy.id].move(enemy);
        }
      });


      this.socket.on('shoot', (enemy) => {
        if (this.players[enemy.id]) {
          // console.log('shoot-enemy',enemy);
          this.players[enemy.id].shootTo(enemy.end_x, enemy.end_y)
        }
      });


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


      // logout
      this.socket.on('logout', (id) => {
        for (let i in this.players) {
          console.log(i, this.players[i], this.players[id]);
        }
        this.players[id].kill();
        delete this.players[id];
      })

    })
  }

  render() {
    // if (__DEV__) {
    // this.game.debug.text('Active Bullets: ' + this.bulletPool.countLiving() + ' / ' + this.bulletPool.length, 32, 32);
    // // this.game.debug.spriteInfo(this.player, 32, 32)
    // this.game.debug.text('fps: ' + this.game.time.fps || '--', 32, 140);
    // if (this.player) {
    //   this.game.debug.body(this.player);
    // }
    // if (this.enemyGroup) {
    //   for (let i in this.players) {
    //     this.game.debug.body(this.players[i]);
    //   }
    // }

    // this.game.debug.body(this.t_bullet)

    // }

  }




  update() {
    // check enemyGroup with enemy
    // this.game.physics.arcade.collide(this.enemyGroup, this.player, collideCallback, processCallback, callbackContext) 
    this.game.physics.arcade.overlap(this.enemyGroup, this.bulletPool, (enemy, bullet) => {
      if (bullet.player_id !== enemy.id) {
        var data = {
          id: this.player.id,
          enemy_id: enemy.id,
          username: enemy.username,
          shooter_id: bullet.player_id
        };
        bullet.kill()
        this.socket.emit('kill_player', data);
      } 

    }, null, this)

    // // bullet -> player
    this.game.physics.arcade.overlap(this.player, this.bulletPool, (player, bullet) => {
      if (bullet.player_id != player.id ) {
        var data = {
          id: this.player.id,
          enemy_id: player.id,
          username: player.username,
          shooter_id: bullet.player_id
        };
        console.log('bullet')
        bullet.kill()
        this.socket.emit('kill_player', data);
      }
    }, null, this)

  }

  enemyBulletCollisionHandle(player, bullet) {

    // bullet.kill()
    // player.death()
    // this.socket.emit('kill_player',);
    // console.log('hit');
  }
}