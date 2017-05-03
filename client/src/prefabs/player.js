'use strict';
import Phaser from 'phaser'

const PLAYER_SPEED = 100

const CMD_ACTION = {
    IDLE:'IDLE',
    MOVE_LEFT:'MOVE_LEFT',
    MOVE_UP:'MOVE_UP',
    MOVE_DOWN:'MOVE_DOWN',
    MOVE_RIGHT:'MOVE_RIGHT',
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


    }
    create() {

    }

    setup() {

        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.body.setCircle(16)
        this.body.collideWorldBounds = true

    }
    moveLeft() {
        this.body.velocity.x = -PLAYER_SPEED
        this.animations.play("run");
        this.anim_action = 'run'
        this.current_cmd_action = CMD_ACTION.MOVE_LEFT
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
            anim_action:this.anim_action 
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

    update() {
        this.handleInput()
        this.socket.emit('move_player', this.toJson());

    }



}