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

export default class Player extends Phaser.Sprite {


    constructor({
        game,
        x,
        y,
        asset,
        socket
    }) {
        super(game, x, y, asset)
        // this.game.add.sprite(x, y,this);
        this.game.add.existing(this);
        // this.animations.play("down", 4, true);
        this.animations.add("idle", [0, 1, 2, 3, 4], 12, true);
        this.animations.add("run", [5, 6, 7, 8, 9], 12, true);
        this.animations.play("idle", true);

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

        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.body.setSize(32, 48, 6, 0)
        this.body.collideWorldBounds = true

    }
    moveLeft() {
        this.body.velocity.x = -PLAYER_SPEED
        this.animations.play("run");
        this.anim_action = 'run'
        this.current_cmd_action = CMD_ACTION.MOVE_LEFT
        this.scale.x = -1
    }

    idle() {
        this.body.velocity.x = 0
        this.body.velocity.y = 0
        this.animations.play("idle");
        this.anim_action = 'idle'
        this.current_cmd_action = CMD_ACTION.IDLE
    }

    moveRight() {
        this.body.velocity.x = PLAYER_SPEED
        this.animations.play("run");
        this.anim_action = 'run'
        this.current_cmd_action = CMD_ACTION.MOVE_RIGHT
        this.scale.x = 1
    }
    moveUp() {
        this.body.velocity.y = -PLAYER_SPEED;
        this.animations.play("run");
        this.anim_action = 'run'
        this.current_cmd_action = CMD_ACTION.MOVE_UP
    }
    moveDown() {
        this.body.velocity.y = PLAYER_SPEED;
        this.animations.play("run");
        this.anim_action = 'run'
        this.current_cmd_action = CMD_ACTION.MOVE_DOWN
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

    handleInput() {
        if (this.cursors.left.isDown || this.leftButton.isDown) {

            this.moveLeft()
        }
        if (this.cursors.right.isDown || this.rightButton.isDown) {

            this.moveRight()

        }
        if (this.upButton.isDown) {
            this.moveUp()
        }
        if (this.downButton.isDown) {
            this.moveDown()
        } else if (!this.downButton.isDown && !this.upButton.isDown && !this.rightButton.isDown && !this.leftButton.isDown) {
            this.idle()
        }

        if (this.shootButton.isDown) {
            this.shoot()
            // console.log('shoot')

        }
        if (this.countBullet.isDown) {
            // console.log('dead = ', this.hero.bulletPool.countDead(), '; livling = ', this.hero.bulletPool.countLiving());
        }

    }
    initInput() {
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.shootButton = this.game.input.keyboard.addKey(Phaser.Keyboard.J)
        this.countBullet = this.game.input.keyboard.addKey(Phaser.Keyboard.K)
        this.leftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.A)
        this.downButton = this.game.input.keyboard.addKey(Phaser.Keyboard.S)
        this.rightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.D)
        this.upButton = this.game.input.keyboard.addKey(Phaser.Keyboard.W)

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
        let x = this.game.input.activePointer.x 
        // ((this.game.input.activePointer.x *this.game.input.activePointer.x) +(this.game.input.activePointer.y + this.game.input.activePointer.y))
        let y = this.game.input.activePointer.y
        bullet.fireTo(x,y)
        // console.log('bullet',bullet.toJson());
        this.socket.emit('shoot', bullet.toJson());

    }

    // fire(bullets) {
    //     if (this.game.time.now > this.nextFire && bullets.countDead() > 0) {
    //         nextFire = game.time.now + fireRate;


    //         bullet.reset(sprite.x - 8, sprite.y - 8);

    //         this.game.physics.arcade.moveToPointer(bullet, 300);
    //     }

    // }

    update() {
        if (this.isAlive) {
            this.socket.emit('move_player', this.toJson());
        } else {
            this.x = this.game.world.randomX;
            this.y = this.game.world.randomY;
            0;
            this.socket.emit('move_player', this.toJson());
            this.isAlive = true;
        }
        this.handleInput()
        if (game.input.activePointer.isDown) {
            this.shoot()

        }


    }





}