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
        socket
    }) {

        super(game, x, y, 'blank_48x48')

        // this.game.add.sprite(x, y,this);


        this.game.add.existing(this);
        // this.animations.play("down", 4, true);

        this.character = this.game.make.sprite(0, 0, asset)
        this.character.anchor.setTo(0.5)

        this.character.animations.add("idle", [0, 1, 2, 3, 4], 12, true);
        this.character.animations.add("run", [5, 6, 7, 8, 9], 12, true);
        this.character.animations.play("idle");

        this.character.smoothed = false;
        this.addChild(this.character);

        this.indicator = this.game.make.sprite(-2, -30, 'indicator')
        this.indicator.anchor.setTo(0.5)
        this.addChild(this.indicator);
        this.indicator.smoothed = false;


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
        this.anim_action = 'idle'

        this.anchor.setTo(0.5)
        this.setup()
        this.initInput()

        this.SHOT_DELAY = 300
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


        let direction = { x: 0, y: 0 };
        // Vertical
        if (this.cursors.up.isDown || this.upButton.isDown) {
            direction.y = -1;
        } else if (this.cursors.down.isDown || this.downButton.isDown) {
            direction.y = 1;
        }

        // Horizontal
        if (this.cursors.left.isDown || this.leftButton.isDown) {
            direction.x = -1;
            //this.scale.x = -1;
        } else if (this.cursors.right.isDown || this.rightButton.isDown) {
            direction.x = 1;
            //this.scale.x = 1;
        }

        return direction;
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

        if (this.isAlive) {
            this.direction = this.handleInputs();
            if (game.input.activePointer.isDown) {
                this.shoot();
            }
        } else {
            this.respawn();
        }

        if (this.arms.animations.name == 'attack') {
            if (this.arms.animations.currentAnim.isFinished) {
                this.arms.animations.play('idle')
            }
        }

        let newx = this.game.input.worldX - this.x
        let newy = this.game.input.worldY - this.y
        this.arrow.rotation = this.game.physics.arcade.angleToXY(this.arrow, newx, newy)
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
        console.log('res-spawn')
        let playerInfo = {
            id: this.id
        };
        this.socket.emit('respawn', playerInfo);
        // if(this.respawnButton.isDown) {
        //     let playerInfo = {
        //         id: this.id
        //     };
        //     this.socket.emit('respawn', playerInfo);
        // }
    }

}