import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init() { }

  preload() {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //

    this.load.image('rock', 'assets/sprites/rock.png')
    this.load.image('indicator', 'assets/sprites/indicator.png')
    this.load.image('blank_48x48', 'assets/sprites/blank_48x48.png')
    this.load.image('square_16x16', 'assets/sprites/square_16x16.png')
    this.load.image('bg', 'assets/images/background.png');

    this.load.image('dead_scene', 'assets/images/dead_scene.png')
    

    this.load.spritesheet('cont', 'asset/images/continue_button.png')
    this.load.spritesheet('player', 'assets/sprites/player_sheet.png', 48, 48)
    this.load.spritesheet('yak_arm', 'assets/sprites/yak-arms.png', 48, 48)
    this.load.spritesheet('btn', 'assets/images/start_button.png');

    this.load.audio('soundtrack', ('assets/sound/soundtrack.mp3'));
    this.load.audio('dead_sfx', ('assets/sound/dead_sound.mp3'));
    this.load.audio('throw_sfx', ('assets/sound/throwing_sound.wav'));


    this.load.image('compass', 'assets/sprites/joy_base.png');
    this.load.image('touch_segment', 'assets/sprites/blank_48x48.png');
    this.load.image('touch', 'assets/sprites/joy_hat.png');
    this.load.image('touch_shoot', 'assets/sprites/shootButton.png');



  
    this.game.load.tilemap('tilemap', 'assets/map/map_01.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/map/tile-sheet-yak.png');


    this.load.image('arrow', 'assets/sprites/fixed-arrow.png');

   

  }

  create() {
    // this.state.start('Game')
    this.state.start('Login')
  }
}
