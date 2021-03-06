import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/Game'
import LoginState from './states/Login'

// const input = require('./plugins/phaser-input')



import config from './config'

const width = config.gameWidth
const height = config.gameHeight

class Game extends Phaser.Game {
  constructor() {
    const docElement = document.documentElement
    // const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth
    // const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight

    super(width, height, Phaser.CANVAS, 'content', null)
    // super(width, height, Phaser.CANVAS, null, null)
    // super({
    //   width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    //   height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    //   transparent: false,
    //   enableDebug: true
    // });
   

    // plugin
    // console.log('i',input.Plugin)

    
    


    this.state.add('Boot', BootState, false)
    this.state.add('Splash', SplashState, false)
    this.state.add('Game', GameState,false)
    this.state.add('Login', LoginState,false)


    // start(key, clearWorld, clearCache, parameter)
    this.state.start('Boot')
  }

}

window.game = new Game()