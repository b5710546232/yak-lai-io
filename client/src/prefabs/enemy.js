'use strict';
import Phaser from 'phaser'

const PLAYER_SPEED = 100

const CMD_ACTION = {
    IDLE: 'IDLE',
    MOVE_LEFT: 'MOVE_LEFT',
    MOVE_UP: 'MOVE_UP',
    MOVE_DOWN: 'MOVE_DOWN',
    MOVE_RIGHT: 'MOVE_RIGHT',
}
export default class Enemy extends Phaser.Sprite {
    constructor({
        game,
        x,
        y,
        asset,
        enemy_info
    }) {
        super(game, x, y, asset)
        // this.game.add.sprite(x, y,this);
        this.game.add.existing(this);
        // this.animations.play("down", 4, true);
        this.animations.add("idle", [0, 1, 2, 3, 4], 12, true);
        this.animations.add("run", [5, 6, 7, 8, 9], 12, true);
        this.animations.play("idle", true);
        this.enemy_info = enemy_info
        this.anchor.setTo(0.5)
        this.setup()
        this.anim_action = 'idle'


    }
    create() {

    }

    setup() {

        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.body.setCircle(16)
        this.body.collideWorldBounds = true

        this.id = this.enemy_info.id;
        this.username = '';
        this.color = this.enemy_info.color;
        this.mass = this.enemy_info.mass;
        this.speed_base = 5000;
        this.speed = this.enemy_info.speed;
        this.width = this.enemy_info.width;
        this.height = this.enemy_info.height;


    }
    moveLeft() {
        this.body.velocity.x = -PLAYER_SPEED
        this.animations.play("run");
    }

    idle() {
        this.body.velocity.x = 0
        this.body.velocity.y = 0
        this.animations.play("idle");
    }

    moveRight() {
        this.body.velocity.x = PLAYER_SPEED
        this.animations.play("run");
    }
    moveUp() {
        this.body.velocity.y = -PLAYER_SPEED;
        this.animations.play("run");
    }
    moveDown() {
        this.body.velocity.y = PLAYER_SPEED;

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
            width: this.width
        };
    }

    move(enemy_info) {
        if (!this.alive) {
            this.kill();
        }
        this.enemy_info = enemy_info

        this.id = enemy_info.id;
        this.username = '';
        this.color = enemy_info.color;
        this.mass = enemy_info.mass;
        this.speed_base = 5000;
        this.speed = enemy_info.speed;
        this.width = enemy_info.width;
        this.height = enemy_info.height;
        this.position.x = enemy_info.x
        this.position.y = enemy_info.y
        if(enemy_info.anim_action != this.anim_action){
            this.anim_action = enemy_info.anim_action
            this.animations.play(enemy_info.anim_action,true)
        }
        
        // switch (enemy_info.cmd_action) {
        //     case CMD_ACTION.IDLE:
        //         this.idle();
        //         break;
        //     case CMD_ACTION.MOVE_LEFT:
        //         this.moveLeft();
        //         break;
        //     case CMD_ACTION.MOVE_RIGHT:
        //         this.moveRight();
        //         break;
        //     case CMD_ACTION.MOVE_UP:
        //         this.moveUp();
        //         break;
        //     case CMD_ACTION.MOVE_DOWN:
        //         this.moveDown();
        //         break;
        //     // default:
        //         // this.idle();

        // }

    }



    update() {}



}