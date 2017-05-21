import Phaser from 'phaser'
// import WebFont from 'webfontloader'
import phaserInput from '../plugins/phaser-input'

export default class extends Phaser.State {
  init(param) {

    // plugin
    this.add.plugin(phaserInput.Plugin)


    // console.log('boot-parm',param);
    this.stage.backgroundColor = '#00000'
    // this.fontsReady = false
    // this.fontsLoaded = this.fontsLoaded.bind(this)

    if (!this.game.device.desktop) {
      this.game.scale.startFullScreen(false);
    }

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.scale.minWidth = 240;
    // this.scale.minHeight = 170;
    // this.scale.maxWidth = 2880;
    // this.scale.maxHeight = 1920;
    this.scale.pageAlignHorizontally = true;

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