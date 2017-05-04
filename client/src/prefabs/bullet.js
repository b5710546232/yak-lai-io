import Phaser from 'phaser'

const BULLET_SPEED = 250
const LIFE_TIME = 1000

export default class Bullet extends Phaser.Sprite {
    constructor({ game, x, y, asset = 'rock' }) {
        super(game, x, y, asset)
        this.game = game
        this.anchor.setTo(0.5)
        this.setup()
    }

    setup() {
        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.checkWorldBounds = true
        this.outOfBoundsKill = true
        this.outOfCameraBoundsKill = true
        this.body.allowGravity = false
    }

    fire() {
        // this.body.velocity.x = Math.cos(angle) * BULLET_SPEED
        // this.body.velocity.y = Math.sin(angle) * BULLET_SPEED
        this.game.physics.arcade.moveToPointer(this, BULLET_SPEED);
        setTimeout(() => {
            this.kill()
        }, LIFE_TIME)
    }

    update() {}

}