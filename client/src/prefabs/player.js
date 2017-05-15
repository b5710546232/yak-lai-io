'use strict';
import Phaser from 'phaser'

const PLAYER_SPEED = 100

export default class Player extends Phaser.Sprite {
    constructor({
        game,
        x,
        y,
        asset,
        id
    }) {
        super(game, x, y, asset)


        //for pixel art
         this.smoothed = false;

        this.game.add.existing(this);
        // this.animations.play("down", 4, true);
        this.animations.add("idle", [0, 1, 2, 3, 4], 12, true);
        this.animations.add("run", [5, 6, 7, 8, 9], 12, true);
        this.animations.play("idle", true);
        // this.enemy_info = enemy_info
        this.anchor.setTo(0.5)
        this.setup()
        this.anim_action = 'idle'

        this.SHOT_DELAY = 750
        this.NUMBER_OF_BULLETS = 20

<<<<<<< HEAD
        this.isAlive = true;

        this.indicator = this.game.make.sprite(-2, -30, 'indicator')
        this.indicator.anchor.setTo(0.5)
        this.addChild(this.indicator);
        this.indicator.smoothed = false;

        this.arms = this.game.make.sprite(0, 0, 'yak_arm')
        this.arms.anchor.setTo(0.5)
        this.arms.animations.add("attack", [0, 1, 2, 3, 4,5], 16,false);
        this.arms.animations.add("idle", [5], 1);
        this.arms.animations.play("idle");
        this.arms.smoothed = false;
        this.addChild(this.arms);

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
=======
        this.id = id;
>>>>>>> da4dcb5ed616c3b0513581ba3b36091a315075a3

        this.arms = this.game.make.sprite(0, 0, 'yak_arm')
        this.arms.anchor.setTo(0.5)
        this.arms.animations.add("attack", [0, 1, 2, 3, 4,5], 16,false);
        this.arms.animations.add("idle", [5], 1);
        this.arms.animations.play("idle");
        this.arms.smoothed = false;
        this.addChild(this.arms);
    }
    create() {

    }
    // death() {
    //     this.x = Math.floor((Math.random() * 10) + 1)
    //     this.y = Math.floor((Math.random() * 10) + 1)

    // }

    setup() {

        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.body.setSize(32, 48, 6, 0)
        this.body.collideWorldBounds = true

        // this.id = this.enemy_info.id;
        this.username = '';
        // this.color = this.enemy_info.color;
        // this.mass = this.enemy_info.mass;
        // this.speed_base = 5000;
        // this.speed = this.enemy_info.speed;
        // this.width = this.enemy_info.width;
        // this.height = this.enemy_info.height;


    }
    setBulletPool(pool) {
        this.bulletPool = pool;

    }
    moveLeft() {
        this.body.velocity.x = -PLAYER_SPEED
        this.animations.play("run");
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
<<<<<<< HEAD

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


        game.add.audio('throw_sfx').play();
        bullet.setPlayerId(this.id)

        let _x = this.game.input.worldX
        let _y = this.game.input.worldY
        // let x = _x*100/Math.sqrt((_x*_x)+(_y*_y))
        // let y = _y*100/Math.sqrt((_x*_x)+(_y*_y))
        let x = _x
        let y = _y
        console.log('x,y', x, y);
        this.arms.animations.play("attack");
        bullet.fireTo(x, y)
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
            game.add.audio('dead_sfx').play();
            this.x = this.game.world.randomX;
            this.y = this.game.world.randomY;
            0;
            this.socket.emit('move_player', this.toJson());
            this.isAlive = true;
=======
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
>>>>>>> da4dcb5ed616c3b0513581ba3b36091a315075a3
        }



    }



    update() {}



}