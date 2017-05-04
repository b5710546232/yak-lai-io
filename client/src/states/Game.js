/* globals __DEV__ */
import Phaser from 'phaser'

import Player from '../prefabs/player'
import Enemy from '../prefabs/enemy'

import io from 'socket.io-client'

import Bullet from '../prefabs/bullet'
import Pool from '../utils/pool'

export default class extends Phaser.State {

  preload() {}

  create() {
    const bannerText = 'yak-lai-io'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    banner.font = 'Bangers'
    banner.padding.set(10, 16)
    banner.fontSize = 40
    banner.fill = '#77BFA3'
    banner.smoothed = false
    banner.anchor.setTo(0.5)

    this.setEventHandlers();

    // for show fps
    this.game.time.advancedTiming = true;

    this.players = [];

    this.initBullets();
  }

  initBullets() {
    let entity_data = {
      game: this.game,
      x: 0,
      y: 0
    }
    this.bulletPool = new Pool(this.game, Bullet, 2, entity_data)
    this.game.add.existing(this.bulletPool)
  }
  setEventHandlers() {

    let target = 'http://localhost:3000'
    this.socket = io.connect(target);
    this.socket.on('connect', () => {
      this.player = new Player({
        game: this.game,
        x: this.world.centerX,
        y: this.world.centerY,
        asset: 'player',
        socket: this.socket
      })

      this.player.setBulletPool(this.bulletPool);
      this.socket.emit('new_player', this.player.toJson());

      // new player
      this.socket.on('new_player', (enemy) => {
        console.log('new-player', enemy);
        this.players[enemy.id] = new Enemy({
          game: this.game,
          x: enemy.x,
          y: enemy.y,
          asset: 'player',
          enemy_info: enemy
        })
      })


      // Player
      this.socket.on('move_player', (enemy) => {
        if (this.players[enemy.id]) {
          this.players[enemy.id].move(enemy);
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
    if (__DEV__) {
      // this.game.debug.spriteInfo(this.player, 32, 32)
      this.game.debug.text('fps: ' + this.game.time.fps || '--', 32, 140);
    }
  }




  update() {}
}