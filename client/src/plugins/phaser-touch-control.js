/* global Phaser */
/**
  * Phaser Touch Control Plugin
  * It adds a movement control for mobile and tablets devices

	The MIT License (MIT)

	Copyright (c) 2014 Eugenio Fage
	https://twitter.com/eugenioclrc

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

	Contact: https://github.com/eugenioclrc, @eugenioclrc

  */

var MAX_DISTANCE_IN_PIXEL = 50;

(function (window, Phaser) {
	'use strict';
	/**
	  * TouchControl Plugin for Phaser
	  */
	Phaser.Plugin.TouchControl = function (game, parent, option) {
		/* Extend the plugin */
		Phaser.Plugin.call(this, game, parent);
		this.input = this.game.input;
		this.imageGroup = [];
	};


	//Extends the Phaser.Plugin template, setting up values we need
	Phaser.Plugin.TouchControl.prototype = Object.create(Phaser.Plugin.prototype);
	Phaser.Plugin.TouchControl.prototype.constructor = Phaser.Plugin.TouchControl;

	Phaser.Plugin.TouchControl.prototype.settings = {
		// max distance from itial touch
		maxDistanceInPixels: MAX_DISTANCE_IN_PIXEL,
		singleDirection: false
	};


	Phaser.Plugin.TouchControl.prototype.cursors = {
		up: false, down: false, left: false, right: false
	};

	Phaser.Plugin.TouchControl.prototype.speed = {
		x: 0, y: 0
	};

	Phaser.Plugin.TouchControl.prototype.configImage = function (image) {
		var offsetX = 150
		var offsetY = 400
		this.initX = this.game.camera.x + offsetX
		this.initY = this.game.camera.y + offsetY
		console.log(this.initY, this.initX, 'y')
		this.compass = this.game.add.sprite(this.initX, this.initY, image.compass)
		this.button_hat = this.game.add.sprite(this.initX, this.initY, image.touch)
		this.imageGroup.push(this.compass);
		this.imageGroup.push(this.button_hat);
		this.imageGroup.push(this.game.add.sprite(this.initX, this.initY, 'touch_segment'));
		this.imageGroup.push(this.game.add.sprite(this.initX, this.initY, 'touch_segment'));

		this.imageGroup.forEach(function (e) {
			e.anchor.set(0.5);
			e.alpha = .3;
			e.visible = false;
			e.fixedToCamera = true;
		});
	}

	Phaser.Plugin.TouchControl.prototype.inputEnable = function (option) {
		this.cameraWidth = option.width
		this.SIDE = option.side

		this.input.onDown.add(createCompass, this, option);
		this.input.onUp.add(removeCompass, this);
	};

	Phaser.Plugin.TouchControl.prototype.inputDisable = function () {
		this.input.onDown.remove(createCompass, this);
		this.input.onUp.remove(removeCompass, this);
	};

	var initialPoint;
	var createCompass = function (option) {

		
		// if (check && this.SIDE == 'RIGHT') {

		// 	// console.log('hello-should-active-right')
		// 	// this.imageGroup.forEach(function (e) {
		// 	// 	e.visible = true;
		// 	// 	e.bringToTop();

		// 	// 	e.cameraOffset.x = this.input.worldX;
		// 	// 	e.cameraOffset.y = this.input.worldY;

		// 	// }, this);

		// 	// this.preUpdate = setDirection.bind(this);

		// 	// initialPoint = this.input.activePointer.position.clone();

		// }
		var holding_down = this.game.input.activePointer.isDown; 
		if (holding_down) {
			var RIGHT = 0, LEFT = 1;
			var check = this.game.input.position.x + this.game.camera.x >= this.game.camera.x + this.cameraWidth / 2
			// if (!check && this.SIDE == 'LEFT') {
				if(Math.floor(this.game.input.x/(this.game.width/2)) === RIGHT){
				console.log('hello-should-active-left')
				this.imageGroup.forEach(function (e) {
					e.visible = true;
					// e.bringToTop();

					e.cameraOffset.x = this.input.worldX;
					e.cameraOffset.y = this.input.worldY;

				}, this);

				this.preUpdate = setDirection.bind(this);

				initialPoint = this.input.position.clone();



			}
		}


	};
	var removeCompass = function () {
		this.imageGroup.forEach(function (e) {
			// e.visible = false;
			e.alpha = 0.3;
		});
		this.button_hat.cameraOffset.x = this.compass.cameraOffset.x
		this.button_hat.cameraOffset.y = this.compass.cameraOffset.y

		this.cursors.up = false;
		this.cursors.down = false;
		this.cursors.left = false;
		this.cursors.right = false;

		this.speed.x = 0;
		this.speed.y = 0;

		this.preUpdate = empty;
	};

	var empty = function () {
	};

	var setDirection = function () {
		var d = initialPoint.distance(this.input.activePointer.position);
		var maxDistanceInPixels = this.settings.maxDistanceInPixels;

		var deltaX = this.input.activePointer.position.x - initialPoint.x;
		var deltaY = this.input.activePointer.position.y - initialPoint.y;

		this.deltaX = deltaX
		this.deltaY = deltaY

		if (this.settings.singleDirection) {
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				deltaY = 0;
				this.input.activePointer.position.y = initialPoint.y;
			} else {
				deltaX = 0;
				this.input.activePointer.position.x = initialPoint.x;
			}
		}
		var angle = initialPoint.angle(this.input.activePointer.position);


		if (d > maxDistanceInPixels) {
			deltaX = (deltaX === 0) ? 0 : Math.cos(angle) * maxDistanceInPixels;
			deltaY = (deltaY === 0) ? 0 : Math.sin(angle) * maxDistanceInPixels;
		}

		this.speed.x = parseInt((deltaX / maxDistanceInPixels) * 100 * -1, 10);
		this.speed.y = parseInt((deltaY / maxDistanceInPixels) * 100 * -1, 10);


		this.cursors.up = (deltaY < 0);
		this.cursors.down = (deltaY > 0);
		this.cursors.left = (deltaX < 0);
		this.cursors.right = (deltaX > 0);

		this.imageGroup.forEach(function (e, i) {
			e.cameraOffset.x = initialPoint.x + (deltaX) * i / 3;
			e.cameraOffset.y = initialPoint.y + (deltaY) * i / 3;
		}, this);

	};
	Phaser.Plugin.TouchControl.prototype.preUpdate = empty;
	module.exports = Phaser.Plugin.TouchControl

}(window, Phaser));
