import Phaser from 'phaser'
// import WebFont from 'webfontloader'
import phaserInput from '../plugins/phaser-input'
// import phaserTouchControl from '../plugins/phaser-touch-control'

export default class extends Phaser.State {
  init(param) {

    //  this.game.input.maxPointers = 6;
    if (!this.game.device.desktop) {
       this.game.input.maxPointers = 2;
      //   this.game.input.multiInputOverride = Phaser.Input.TOUCH_OVERRIDES_MOUSE;
      // this.game.input.addPointer();
      // this.game.input.addPointer();
      // this.game.pointer1 = game.input.pointer1;
      // this.game.pointer2 = game.input.pointer2;

      // this.game.input.multiInputOverride = this.game.input.TOUCH_OVERRIDES_MOUSE
    }


    // plugin
    this.add.plugin(phaserInput.Plugin)
    // console.log('touch',phaserTouchControl.)





    // this.add.plugin(phaserTouchControl)


    // console.log('boot-parm',param);
    this.stage.backgroundColor = '#00000'
    // this.fontsReady = false
    // this.fontsLoaded = this.fontsLoaded.bind(this)

    // if (!this.game.device.desktop) {
    //   this.game.scale.startFullScreen(false);
    // }

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.game.scale.setScreenSize = true;
    this.game.scale.refresh();
    // this.scale.refresh();

    // 
    this.game.stage.disableVisibilityChange = true;

  }

  preload() {
    // WebFont.load({
    //   google: {
    //     families: ['Bangers']
    //   },
    //   active: this.fontsLoaded
    // })

    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', {
      font: '16px Arial',
      fill: '#dddddd',
      align: 'center'
    })
    text.anchor.setTo(0.5, 0.5)

    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')
  }

  render() {
    // if (this.fontsReady) {
    this.state.start('Splash')
    // }
  }

  fontsLoaded() {
    this.fontsReady = true
  }
}