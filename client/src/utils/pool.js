import Phaser from 'phaser'
export default class Pool extends Phaser.Group {
    constructor(game, entityType, pool_size = 1, entityData) {
        super(game, game.world)
        this.game = game
        this.entityType = entityType
        this.entityData = entityData
        if (pool_size > 0) {
            let obj
            for (let i = 0; i < pool_size; i++) {
                obj = this.add(new entityType(entityData))
                obj.kill()
            }
        }
        this.game.add.existing(this)
        return this
    }

    init(x, y) {
        // create obj pool
        let obj = this.getFirstDead()
        if (!obj) {
            obj = new this.entityType(this.entityData)
            this.add(obj, true)
        }
        obj.reset(x, y)
        obj.initial()
        return obj
    }
}