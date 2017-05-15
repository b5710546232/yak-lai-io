

const PLAYER_STARTING_STATS = {
    HEALTH: 1,
    DAMAGE: 1,
    SPEED: 75,
    SCORE: 0,
    EXP: 0
};

class Player {

    constructor(id, username, color, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        // this.anim_action = anim_action;
        this.speed = PLAYER_STARTING_STATS.SPEED;
        this.isAlive = true;
        this.health = PLAYER_STARTING_STATS.HEALTH;
        this.damage = PLAYER_STARTING_STATS.DAMAGE;
        this.username = username;
        this.score = PLAYER_STARTING_STATS.SCORE;
        this.exp = PLAYER_STARTING_STATS.EXP;
    }

    reset() {
        this.speed = PLAYER_STARTING_STATS.SPEED;
        this.isAlive = true;
        this.health = PLAYER_STARTING_STATS.HEALTH;
        this.damage = PLAYER_STARTING_STATS.DAMAGE;
        this.score = PLAYER_STARTING_STATS.SCORE;
        this.exp = PLAYER_STARTING_STATS.EXP;
    }

}

module.exports = Player