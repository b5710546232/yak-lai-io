import Phaser from 'phaser'

export default class Collectible extends Phaser.Sprite {
    constructor({
        game,
        x,
        y,
        id,
        asset = 'rock',
        isCollected
    }) {
        super(game, x, y, asset);

        this.game = game;

        this.anchor.setTo(0.5)
        this.setup();

        this.id = id;
        this.game.add.existing(this);
    }

    setup() {
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.setCircle(8);
        this.checkWorldBounds = true;
        this.outofBoundsKill = false;
        this.outOfCameraBoundsKill = false;
        this.body.allowGravity = false;
        this.scale.x = 1;
        this.scale.y = 1;
        this.smoothed = false;
    }

    
}