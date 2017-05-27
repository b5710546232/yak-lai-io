import Phaser from 'phaser'

import Player from '../prefabs/player'
import Enemy from '../prefabs/enemy'
import ClientPlayer from '../prefabs/ClientPlayer'

import io from 'socket.io-client'

import Bullet from '../prefabs/bullet'
import Pool from '../utils/pool'

import Config from '../config'

import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
    preload() {
        this.load.image('bg', 'assets/images/background.png');
        this.load.spritesheet('btn', 'assets/images/start_button.png');
        //this.game.add.plugin(PhaserInput.Plugin);
    }
    create() {
        this.world.resize(this.game.width,this.game.height)
        this.menuBg = this.add.image(game.width / 2 ,game.height / 2, 'bg')
        this.login_text = this.game.add.text(game.width / 2, 100, '', {
            font: '30px Barrio',
            fill: '#ffffff'
        });




        centerGameObjects([this.menuBg, this.login_text])

        var user = this.game.add.inputField(game.width / 2 - 180, game.height / 2 + 30, {
            font: '20px Barrio',
            fill: '#212325',
            width: 300,
            padding: 12,
            borderWidth: 3,
            borderColor: '#101213',
            backgroundColor: '#f0f0f0',
            min: 1,
            align: 'center',
            max: 25,
            zoom: false,
            placeHolder: 'INSERT YOUR NAME HERE'
        });
        user.blockInput = false;


        var submitBtn = this.add.button(game.width / 2 - 140, game.height / 2 + 100, 'btn', () => {

            this.game.userName = user.value;
            console.log(this.game.userName);
            this.login(user.value);

            //   this.game.state.start('Game');

        });

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                let isAnonymous = user.isAnonymous;
                let uid = user.uid;
                console.log('user-id', uid)
                this.uid = uid;


                this.game.current_user = firebase.auth().currentUser;
                console.log('current-user', this.game.current_user)


            } else {
                firebase.auth().signInAnonymously().catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode === 'auth/operation-not-allowed') {
                        alert('You must enable Anonymous auth in the Firebase Console.');
                    } else {
                        console.error(error);
                    }
                });
            }
        });

    }
    login(username) {
        // clear input

        if (username.length > 0) {
            console.log('hello')
            this.game.database.ref('users/' + username).set({ "name": username, "score": 0 });
        }

        if (username != null && username.length > 0) {
            this.game.database.ref('users/' + username).once('value').then((snapshot) => {
                this.game.current_user.username = username;
                this.game.user_info = this.game.current_user
                let user_info = this.game.current_user

                // this.game.state.start('Game', true, false, user_info);                
                this.game.state.start('Game')
                return;

            }, (err) => {
                console.log('err', err)
            });
            return;

        }
        else {

        }

        console.log('error');
    }


}