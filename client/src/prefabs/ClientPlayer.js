'use strict';
import Phaser from 'phaser'

const PLAYER_SPEED = 100

import Config from '../config.js'

const CMD_ACTION = {
    IDLE: 'IDLE',
    MOVE_LEFT: 'MOVE_LEFT',
    MOVE_UP: 'MOVE_UP',
    MOVE_DOWN: 'MOVE_DOWN',
    MOVE_RIGHT: 'MOVE_RIGHT',
}


export default class ClientPlayer extends Phaser.Sprite {

    constructor({
        game,
        x,
        y,
        asset,
        socket,
        score
    }) {

        super(game, x, y, 'blank_48x48')

        // this.game.add.sprite(x, y,this);


        this.game.add.existing(this);
        // this.animations.play("down", 4, true);

        this.textname = this.game.make.text(0, 40, this.game.user_info.username);
        this.textname.fill = '#FFFFFF'
        this.textname.align = 'center'
        this.textname.font = '10px Barrio'
        this.textname.stroke = '#000000';
        this.textname.strokeThickness = 2;
        this.textname.anchor.setTo(0.5)
        this.addChild(this.textname);
        // text.align = 'center';

        // text.font = 'Arial Black';
        // text.fontSize = 70;
        // text.fontWeight = 'bold';
        // text.fill = '#ec008c';


        this.character = this.game.make.sprite(0, 0, asset)
        this.character.anchor.setTo(0.5)

        this.character.animations.add("idle", [0, 1, 2, 3, 4], 10, true);
        this.character.animations.add("run", [5, 6, 7, 8, 9], 10, true);
        this.character.animations.play("idle");

        this.character.smoothed = false;
        this.addChild(this.character);

        this.indicator = this.game.make.sprite(-2, -30, 'indicator')
        this.indicator.anchor.setTo(0.5)
        this.indicator.smoothed = false;
        this.addChild(this.indicator);



        this.arrow = this.game.make.sprite(0, 0, 'arrow');
        //this.arrow = this.game.add.sprite(0,0,'arrow');
        this.arrow.anchor.y = 0.5;
        this.arrow.anchor.x = 0.3;
        this.arrow.smoothed = false;
        this.arrow.allowRotation = false;
        this.arrow.fixedToCamer = false;
        this.addChild(this.arrow);


        this.socket = socket
        this.current_cmd_action = CMD_ACTION
        this.id = socket.io.engine.id;
        // this.id = this.game.user_info.uid;
        this.anim_action = 'idle'

        this.anchor.setTo(0.5)
        this.setup()
        this.initInput()

        this.SHOT_DELAY = 450
        this.NUMBER_OF_BULLETS = 20

        this.isAlive = true;

        console.log('World width:', this.game.world.width);
        console.log('World height:', this.game.world.height);
        console.log("Player's sprite width:", this.width);
        console.log("Player's sprite height:", this.height);


        this.arms = this.game.make.sprite(0, 0, 'yak_arm')
        this.arms.anchor.setTo(0.5)
        this.arms.animations.add("attack", [0, 1, 2, 3, 4, 5], 16);
        this.arms.animations.add("idle", [5], 1);
        this.arms.animations.play("idle");
        this.arms.smoothed = false;
        this.addChild(this.arms);





        this.direction = {
            x: 0,
            y: 0
        };

        this.game.time.events.loop(Phaser.Timer.SECOND * 0.100, this.sendDirection, this);

        this.score = score;

        // this.scoretext = this.game.add.text(this.game.camera.width - 250, 40, "Your score: " + this.score);
        // this.scoretext.fill = '#FFFFFF';
        // this.scoretext.align = 'center';
        // this.scoretext.fixedToCamera = true;
        // this.
    }
    death() {
        this.x = Math.floor((Math.random() * 10) + 1)
        this.y = Math.floor((Math.random() * 10) + 1)
        this.isAlive = false;
    }
    rebirth() {
        this.isAlive = true;
    }
    setBulletPool(pool) {
        this.bulletPool = pool;

    }
    create() {

    }

    setup() {

        console.log(this.width, this.height, 'check')
        console.log(this.character.width, this.character.height, 'char')
        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.body.setSize(32, 48, 6, 0)
        this.body.collideWorldBounds = true


    }




    toJson() {
        return {
            id: this.id,
            username: this.username,
            speed: this.speed,
            mass: this.mass,
            color: this.color,
            x: this.x,
            y: this.y,
            height: this.height,
            width: this.width,
            anim_action: this.anim_action
        };
    }



    handleInputs() {


        let direction = {
            x: 0,
            y: 0
        };
        // Vertical
        if (this.cursors.up.isDown || this.upButton.isDown || this.game.virtualInput.cursors.up) {
            direction.y = -1;
        } else if (this.cursors.down.isDown || this.downButton.isDown || this.game.virtualInput.cursors.down) {
            direction.y = 1;
        }

        // Horizontal
        if (this.cursors.left.isDown || this.leftButton.isDown || this.game.virtualInput.cursors.left) {
            direction.x = -1;

        } else if (this.cursors.right.isDown || this.rightButton.isDown || this.game.virtualInput.cursors.right) {
            direction.x = 1;

        }

        return direction;
    }

    disableInputMove() {
        this.game.virtualInput.inputDisable()
    }
    enableInputMove() {
        this.game.virtualInput.inputEnable();
    }

    initInput() {
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.shootButton = this.game.input.keyboard.addKey(Phaser.Keyboard.J)
        this.countBullet = this.game.input.keyboard.addKey(Phaser.Keyboard.K)
        this.leftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.A)
        this.downButton = this.game.input.keyboard.addKey(Phaser.Keyboard.S)
        this.rightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.D)
        this.upButton = this.game.input.keyboard.addKey(Phaser.Keyboard.W)
        this.respawnButton = this.game.input.keyboard.addKey(Phaser.Keyboard.R)

        this.game.input.keyboard.addCallbacks(this, null, null, (keycode) => {
            console.log('key : ', keycode)
        })
    }

    shoot() {

        if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0
        if (this.game.time.now - this.lastBulletShotAt < this.SHOT_DELAY) return
        this.lastBulletShotAt = this.game.time.now

        let bullet = this.bulletPool.init(this.position.x, this.position.y)
        if (bullet === null || bullet === undefined) return


        bullet.setPlayerId(this.id)

        let _x = this.game.input.worldX
        let _y = this.game.input.worldY

        // mobile
        if (this.game.device.desktop) {
            _x = this.game.input.worldX
            _y = this.game.input.worldY
        } else {
            _x = this.x + this.game.virtualInput.deltaX
            _y = this.y + this.game.virtualInput.deltaY
        }



        // let x = _x*100/Math.sqrt((_x*_x)+(_y*_y))
        // let y = _y*100/Math.sqrt((_x*_x)+(_y*_y))
        let x = _x
        let y = _y
        console.log('x,y', x, y);
        bullet.fireTo(x, y)
        // console.log('bullet',bullet.toJson());

        this.arms.animations.play("attack")
        this.socket.emit('shoot', bullet.toJson());

    }

    update() {
        if (this.isAlive && !this.isDie) {
            this.direction = this.handleInputs();
            if (this.game.input.activePointer.isDown && this.game.device.desktop) {
                this.shoot();
            } else {
                // handle for mobile
            }
        } else {
            // if (this.isDie) {
            //     this.respawn();
            // }
        }

        if (this.arms.animations.name == 'attack') {
            if (this.arms.animations.currentAnim.isFinished) {
                this.arms.animations.play('idle')
            }
        }

        let newx = this.game.input.worldX - this.x
        let newy = this.game.input.worldY - this.y

        //test in desk-top
        if (this.game.device.desktop) {
            this.arrow.rotation = this.game.physics.arcade.angleToXY(this.arrow, newx, newy)
        }
        // mobile
        else {
            let newx = this.game.virtualInput.deltaX
            let newy = this.game.virtualInput.deltaY

            if(newx && newy){
                this.arrow.rotation = this.game.physics.arcade.angleToXY(this.arrow, newx, newy)
            }


            // this.arrow.rotation = this.game.physics.arcade.angleToXY(this.arrow, this.game.virtualInput.deltaX, this.game.virtualInput.deltaY)
        }

    }

    sendDirection() {
        let playerData = {
            id: this.id,
            username: this.username,
            direction: this.direction
        };
        // console.log(playerData.direction);
        this.socket.emit('move_player', playerData);
    }

    respawn() {
        let playerInfo = {
            id: this.id
        };
        this.isAlive = true
        // if(!this.isAlive){
        this.socket.emit('respawn', playerInfo);
        console.log('res-spawn')
        // }
        // if(this.respawnButton.isDown) {
        //     let playerInfo = {
        //         id: this.id
        //     };
        //     this.socket.emit('respawn', playerInfo);
        // }
    }

}