'use strict';
import Phaser from 'phaser'

const PLAYER_SPEED = 100

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

        this.SHOT_DELAY = 300
        this.NUMBER_OF_BULLETS = 20

    }
    create() {

    }
    death() {
        this.x = Math.floor((Math.random() * 10) + 1)
        this.y = Math.floor((Math.random() * 10) + 1)

    }

    setup() {

        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.body.setSize(32, 48, 6, 0)
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
    setBulletPool(pool) {
        this.bulletPool = pool;

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
    shootTo(x, y) {
        if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0
        if (this.game.time.now - this.lastBulletShotAt < this.SHOT_DELAY) return
        this.lastBulletShotAt = this.game.time.now

        let bullet = this.bulletPool.init(this.position.x, this.position.y)
        if (bullet === null || bullet === undefined) return
        bullet.setPlayerId(this.id)
        bullet.fireTo(x, y)
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
     death(){
        this.x = Math.floor((Math.random() * 10) + 1)
        this.y = Math.floor((Math.random() * 10) + 1)
        this.isAlive = false;
    }

    move(enemy_info) {
        this.enemy_info = enemy_info

        this.id = enemy_info.id;
        this.username = '';
        this.color = enemy_info.color;
        this.mass = enemy_info.mass;
        this.speed_base = 5000;
        this.speed = enemy_info.speed;
        this.width = enemy_info.width;
        this.height = enemy_info.height;
        this.x = enemy_info.x
        this.y = enemy_info.y
        if (enemy_info.anim_action != this.anim_action) {
            this.anim_action = enemy_info.anim_action
            this.animations.play(enemy_info.anim_action)
        }



    }



    update() {}



}