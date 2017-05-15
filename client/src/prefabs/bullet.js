import Phaser from 'phaser'

const BULLET_SPEED = 400
const LIFE_TIME = 1000

export default class Bullet extends Phaser.Sprite {
    constructor({
        game,
        x,
        y,
        asset = 'rock'
    }) {
        super(game, x, y, asset)
        this.game = game
        this.anchor.setTo(0.5)
        this.setup()
    }

    setup() {
        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        // this.body.setCircle(16)
        this.body.setSize(16,16, 8, 8)
        this.checkWorldBounds = true
        this.outOfBoundsKill = true
        this.outOfCameraBoundsKill = true
        this.body.allowGravity = false
        this.scale.x = 2
        this.scale.y = 2
<<<<<<< HEAD
        this.smoothed = false;
=======
        this.smoothed =false;
>>>>>>> da4dcb5ed616c3b0513581ba3b36091a315075a3
    }

   
    fireTo(x, y) {
        this.game.physics.arcade.moveToXY(this, x, y, BULLET_SPEED);
<<<<<<< HEAD
=======
        // this.game.time.events.add(Phaser.Timer.SECOND * 1, this.resetBullet, this);
>>>>>>> da4dcb5ed616c3b0513581ba3b36091a315075a3
        this.lifespan = 1000;
       
    }
    resetBullet(){
        this.kill()
    }
    setPlayerId(id) {
        this.player_id = id;
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

    }


    render() {
        this.game.debug.body(this)
    }

}