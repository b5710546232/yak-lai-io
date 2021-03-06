"use strict";
const PLAYER_STARTING_STATS = {
    HEALTH: 1,
    DAMAGE: 1,
    SPEED: 75,
    SCORE: 0,
    EXP: 0
};

const SCORE_TYPES = {
    KILL: 10,
    COLLECT: 1
}

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

    killPlayer() {
                console.log(this.username, "'s before score =", this.score);
        // if(this.score) {
        // }
        this.score += SCORE_TYPES.KILL;
        console.log(this.username, "'s after score =", this.score);
    }

    collect() {
        console.log(this.username, "'s before score =", this.score);
        // if(this.score) {
        // }
        this.score += SCORE_TYPES.COLLECT;
        console.log(this.username, "'s after score =", this.score);
    }

}

module.exports = Player