import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //

    this.load.image('rock', 'assets/sprites/rock.png')
    this.load.image('indicator', 'assets/sprites/indicator.png')
    this.load.spritesheet('player', 'assets/sprites/player_sheet.png', 48, 48)
    this.load.spritesheet('yak_arm', 'assets/sprites/yak-arms.png', 48, 48)

    this.load.audio('soundtrack', ('assets/sound/soundtrack.mp3'));
    this.load.audio('dead_sfx', ('assets/sound/dead_sound.mp3'));
    this.load.audio('throw_sfx', ('assets/sound/throwing_sound.wav'));

<<<<<<< HEAD

=======
>>>>>>> da4dcb5ed616c3b0513581ba3b36091a315075a3
  }

  create () {
    this.state.start('Game')
  }
}
