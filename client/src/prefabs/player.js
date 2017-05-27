import Phaser from 'phaser'

const PLAYER_SPEED = 100

export default class Player extends Phaser.Sprite {
    constructor({
        game,
        x,
        y,
        asset,
        id,
        username,
        score
    }) {
        super(game, x, y, 'blank_48x48')
        // this.game.add.sprite(x, y,this);
        this.game.add.existing(this);
        // this.animations.play("down", 4, true);



        this.textname = this.game.make.text(0, 40 , username);
        this.textname.fill = '#FFFFFF'
        this.textname.align = 'center'
        this.textname.anchor.setTo(0.5)
        this.addChild(this.textname);

        this.character = this.game.make.sprite(0, 0, asset)
        this.character.anchor.setTo(0.5)

        this.character.animations.add("idle", [0, 1, 2, 3, 4], 12, true);
        this.character.animations.add("run", [5, 6, 7, 8, 9], 12, true);
        this.character.animations.play("idle");

        this.character.smoothed = false;
        this.addChild(this.character);


        // this.enemy_info = enemy_info
        this.anchor.setTo(0.5)
        this.setup()
        this.anim_action = 'idle'

        this.SHOT_DELAY = 300
        this.NUMBER_OF_BULLETS = 20

        this.id = id;

        this.arms = this.game.make.sprite(0, 0, 'yak_arm')
        this.arms.anchor.setTo(0.5)
        this.arms.animations.add("attack", [0, 1, 2, 3, 4, 5], 16, false);
        this.arms.animations.add("idle", [5], 1);
        this.arms.animations.play("idle");
        this.arms.smoothed = false;
        this.addChild(this.arms);

        this.username = username;
        this.score = score;

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
    death() {
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



    update() {
        if (this.arms.animations.name == 'attack') {
            if (this.arms.animations.currentAnim.isFinished) {
                this.arms.animations.play('idle')
            }
        }
    }



}