import Phaser from 'phaser'
    
import Player from '../prefabs/player'
import Enemy from '../prefabs/enemy'
import ClientPlayer from '../prefabs/ClientPlayer'

import io from 'socket.io-client'

import Bullet from '../prefabs/bullet'
import Pool from '../utils/pool'

import Config from '../config'

import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
    preload() {
            this.load.image('bg', 'assets/images/background.png');
            this.load.spritesheet('btn','assets/images/start_button.png');
            //this.game.add.plugin(PhaserInput.Plugin);
        }
    create(){
        this.menuBg = this.add.image(this.game.world.centerX, this.game.world.centerY, 'bg')
        
        
        
        this.login_text = this.game.add.text(game.width / 2, 100, '', {
                font: '30px Barrio',
                fill: '#ffffff'
            });

        
      
        
        centerGameObjects([this.menuBg,this.login_text])
        
          var user = this.game.add.inputField(game.width / 2 -180, game.height/2+30, {
              font: '20px Barrio',
              fill: '#212325',
              width: 300,
              padding: 12,
              borderWidth: 3,
              borderColor: '#101213',
              backgroundColor: '#f0f0f0',
              min: 1,
              align: 'center',
              max: 25,
              zoom: false,
              placeHolder: 'INSERT YOUR NAME HERE'
        });
          user.blockInput = false;


          var submitBtn = this.add.button(this.world.centerX - 140, this.world.centerY + 100, 'btn', function () {

              this.game.userName = user.value;
              console.log(this.game.userName);
              this.game.state.start('Game');

          });

    }


}