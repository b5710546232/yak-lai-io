import Phaser from 'phaser'
    
import Player from '../prefabs/player'
import Enemy from '../prefabs/enemy'
import ClientPlayer from '../prefabs/ClientPlayer'

import io from 'socket.io-client'

import Bullet from '../prefabs/bullet'
import Pool from '../utils/pool'

import Config from '../config'

export default class extends Phaser.State {
    preload() {
            this.load.image('bg', 'assets/images/bg.png');
            this.load.spritesheet('btn','assets/images/btn_clean.png');
            //this.game.add.plugin(PhaserInput.Plugin);
        }
    create(){
        this.add.image(0, 0, 'bg');
        
        var login = this.game.add.text(game.width / 2, 100, 'Log in to this awesome game!', {
                font: '30px Arial',
                fill: '#ffffff'
            });
            login.anchor.set(0.5);
        
      
        
        var submitBtn = this.add.button(this.world.centerX-95,this.world.centerY + 100, 'btn',function(){
            console.log('press');
            this.game.state.start('Game');
        });
        
 
        
          /*var user = this.game.add.inputField(game.width / 2 - 85, 180 - 17, {
                font: '18px Arial',
                fill: '#212121',
                fillAlpha: 0,
                fontWeight: 'bold',
                width: 150,
                max: 20,
                padding: 8,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 6,
                placeHolder: 'Username',
                textAlign: 'center',
                zoom: true
            });
            user.setText('prefilled name');
            user.blockInput = false;*/
        
    }
}