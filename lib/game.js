import render from './util/render';
import input from './util/input';
import animation from './util/animation';
import movement from './util/movement';
import physics from './util/physics';

import { levelOne } from './map/level_1-1';
import MapBuilder from './map/map_builder';

import Mario from './entities/mario';
import Goomba from './entities/goomba';
import Score from './entities/score';

class Game {
  init() {
    const canvasEl = document.getElementById('game-canvas');
    const ctx = canvasEl.getContext('2d');
    ctx.scale(3, 3);

    const canvas = {
      canvas: canvasEl,
      ctx,
    };

    const viewport = {
      width: 760,
      height: 600,
      vX: 0,
      vY: 0,
    };

    const spriteSheet = new Image();
    spriteSheet.src = './assets/sprites/spritesheet.png';

    const tileset = new Image();
    tileset.src = './assets/sprites/tileset_gutter.png';

    spriteSheet.addEventListener('load', () => {
      const data = {
        spriteSheet,
        canvas,
        viewport,
        animationFrame: 0,
        mapBuilder: new MapBuilder(levelOne, tileset, spriteSheet),
        entities: {},
        userControl: true,
        reset: this.reset,
      };

      const mario = new Mario(spriteSheet, 175, 0, 16, 16);
      const score = new Score(270, 15);

      input.init(data);
      data.entities.mario = mario;
      data.entities.score = score;
      data.entities.coins = [];
      data.entities.mushrooms = [];
      data.entities.goombas = [];

      // Load enemies from map

      levelOne.goombas.forEach((goomba) => {
        data.entities.goombas.push(
          new Goomba(spriteSheet, goomba[0], goomba[1], goomba[2], goomba[3]));
      });

      render.init(data);
      this.run(data);
    });
  }

  run(data) {
    const loop = () => {
      input.update(data);
      animation.update(data);
      movement.update(data);
      physics.update(data);

      Game.updateView(data);
      render.update(data);

      data.animationFrame += 1;
      window.requestAnimationFrame(loop);
    };

    loop();
  }

  // Update viewport to follow Mario
  static updateView(data) {
    const viewport = data.viewport;
    const margin = viewport.width / 6;
    const center = {
      x: data.entities.mario.xPos + (data.entities.mario.width * 0.5),
      y: data.entities.mario.yPos + (data.entities.mario.height * 0.5),
    };

    if (center.x < viewport.vX + (margin * 2)) {
      viewport.vX = Math.max(center.x - margin, 0);
    } else if (center.x > (viewport.vX + viewport.width) - (margin * 2)) {
      viewport.vX = Math.min((center.x + margin) - viewport.width, 3400 - viewport.width);
    }
  }

  reset() {
    location.reload();
  }
}

const game = new Game();
game.init();
