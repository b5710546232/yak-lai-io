import Phaser from 'phaser'

const BULLET_SPEED = 400
const LIFE_TIME = 700

export default class Bullet extends Phaser.Sprite {
    constructor({
        game,
        x,
        y,
        asset = 'rock',
        particle
    }) {
        super(game, x, y, asset)
        this.game = game
        this.anchor.setTo(0.5)
        this.setup()
        this.emitter = particle;
    }

    setup() {
        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.body.setCircle(16)
        this.checkWorldBounds = true
        this.outOfBoundsKill = true
        this.outOfCameraBoundsKill = true
        this.body.allowGravity = false
        this.scale.x = 2
        this.scale.y = 2
        this.smoothed = false;
    }
    reset(x, y) {
        super.reset(x, y)
        this.isBreak = false;
    }


    fireTo(x, y) {
        this.game.physics.arcade.moveToXY(this, x, y, BULLET_SPEED);
        // this.game.time.events.add(Phaser.Timer.SECOND * 1, this.resetBullet, this);
        this.lifespan = LIFE_TIME;

    }
    resetBullet() {
        this.kill()
    }
    setPlayerId(id) {
        this.player_id = id;
    }
    break() {
        this.isBreak = true;
        this.emitter.x = this.x
        this.emitter.y = this.y
        this.emitter.start(true, 1000, null, 10);
        this.kill();
    }

    toJson() {

        let vec_x = (this.game.input.worldX - this.x)
        let vec_y = (this.game.input.worldY - this.y)
        return {
            id: this.player_id,
            start_x: this.x,
            start_y: this.y,
            end_x: this.game.input.worldX,
            end_y: this.game.input.worldY,
            vec_x: vec_x,
            vec_y: vec_y,
            player_id: this.player_id
        }
    }

    update() {
        if (this.lifespan < 0) {
            if (!this.isBreak) {
                this.break()

            }

        }
    }


    render() {
        this.game.debug.body(this)
    }

}