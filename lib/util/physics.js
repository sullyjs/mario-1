const physics = {
  update(data) {
    // detect entity collisions
    this.collisionDetection(data);
    this.sceneryCollisionDetection(data);
    this.marioFallingCheck(data);

    // apply gravity to all entities
    this.gravity(data.entities.mario);

    data.entities.goombas.forEach((goomba) => {
      this.gravity(goomba);
    });

  },

  collisionDetection(data) {
    const collidables = [
      data.entities.coins,
      data.entities.goombas,
    ];

    const entityCollisionCheck = (entity) => {
      if (data.entities.mario.xPos < entity.xPos + entity.width &&
        data.entities.mario.xPos + data.entities.mario.width > entity.xPos &&
        data.entities.mario.yPos < entity.yPos + entity.height &&
        data.entities.mario.height + data.entities.mario.yPos > entity.yPos) {
        // Collision Occured
        this.handleCollision(data, entity);
      }
    };

    collidables.forEach(entities =>
      entities.forEach((entity) => { entityCollisionCheck(entity); }),
    );
  },


  handleCollision(data, entity) {
    const mario = data.entities.mario;

    if (entity.type === 'goomba' &&
      mario.type !== 'invincible') {
      // mario's right
      if (mario.xPos < entity.xPos && mario.velY <= entity.velY) {
        mario.xPos = entity.xPos - mario.width;
        // slide shell instead of death
        if (
          entity.currentState === entity.states.hiding) {
          entity.direction = 'right';
          entity.xPos += 5;

          setTimeout(() => {
            entity.currentState = entity.states.sliding;
          }, 50);
        } else {
          if (mario.bigMario) {
            this.marioShrink(mario);
          } else {
            mario.currentState = mario.states.dead;
            this.marioDeath(data);
          }
        }
      }
      // mario's left
      if (mario.xPos > entity.xPos && mario.velY <= entity.velY) {
        mario.xPos = entity.xPos + mario.width;

        if (
          entity.currentState === entity.states.hiding) {
          entity.direction = 'left';
          entity.xPos -= 5;

          setTimeout(() => {
            entity.currentState = entity.states.sliding;
          }, 50);
        } else {
          if (mario.bigMario) {
            this.marioShrink(mario);
          } else {
            mario.currentState = mario.states.dead;
            this.marioDeath(data);
          }
        }
      }
      //  Mario bot
      if (mario.yPos < entity.yPos &&
        (mario.xPos + mario.width) > entity.xPos &&
        mario.xPos < (entity.xPos + entity.width) &&
        mario.velY >= entity.velY) {
        mario.currentState = mario.states.standing;
        mario.yPos = entity.yPos - mario.height;
        mario.velY = 0;

        if (entity.type === 'goomba') {
          this.enemyDeath(entity, data);
        }

        if (mario.yPos > entity.yPos &&
          (mario.xPos + mario.width) >= entity.xPos &&
          mario.xPos < (entity.xPos + entity.width)) {
          mario.velY = 1.2;
          mario.xPos = entity.xPos;
          if (mario.bigMario) {
            this.marioShrink(mario);
          } else {
            mario.currentState = mario.states.dead;
            this.marioDeath(data);
          }
        }
      }
    }

    if (entity.type === 'coin') {
      data.entities.score.value += 50;
      data.entities.score.coinCount += 1;

      const index = data.entities.coins.indexOf(entity);
      delete data.entities.coins[index];
    }
  },

  marioFallingCheck(data) {
    if (data.entities.mario.yPos >= 210) {
      data.userControl = false;

      setTimeout(() => {
        data.reset();
      }, 3000);
    }
  },

  marioDeath(data) {
    data.userControl = false;

    setTimeout(() => {
      data.entities.mario.height = 16;
      data.entities.mario.type = 'dead';
      data.entities.mario.velY -= 13;
    }, 500);

    setTimeout(() => {
      data.reset();
    }, 3000);
  },


  enemyDeath(entity, data) {
    if (entity.type === 'goomba') {
      data.entities.score.value += 100;
      entity.currentState = entity.states.dead;
      entity.type = 'dying';

      setTimeout(() => {
        const index = data.entities.goombas.indexOf(entity);
        delete data.entities.goombas[index];
      }, 800);
    } else {
      data.entities.score.value += 100;
      entity.velY -= 10;
      entity.type = 'dead';

    }
  },

  levelFinish(data) {
    data.entities.mario.velX = 0;
    data.entities.mario.velY = 0;
    data.entities.mario.xPos += 3;

    setTimeout(() => {
      data.reset();
    }, 6000);
  },

  sceneryCollisionDetection(data) {
    this.sceneryCollisionCheck(data, [data.entities.mario], data.entities.scenery);
    this.sceneryCollisionCheck(data, data.entities.goombas, data.entities.scenery);
  },

  sceneryCollisionCheck(data, entities, scenery) {
    entities.forEach((entity) => {
      scenery.forEach((scene) => {
        if (entity.xPos < scene.xPos + scene.width &&
          entity.xPos + entity.width > scene.xPos &&
          entity.yPos < scene.yPos + scene.height &&
          entity.height + entity.yPos > scene.yPos) {
          // Collision Occured
          if (scene.type === 'flag') {
            this.levelFinish(data);
          } else if (scene.type !== 'shrub' &&
            scene.type !== 'cloud' &&
            scene.type !== 'mountain') {
            this.sceneryCollision(data, entity, scene);
          }
        }
      });
    });
  },

  sceneryCollision(data, entity, scene) {
    // Left side
    if (entity.xPos < scene.xPos && entity.yPos >= scene.yPos) {
      if (scene.type === 'pipe' || scene.type === 'brick') {
        entity.xPos = scene.xPos - entity.width - 1;
      } else {
        entity.xPos = scene.xPos - entity.width;
      }

      if (entity.type === 'goomba') {
        entity.direction = entity.direction === 'left' ? 'right' : 'left';
      }
    }
    // Right side
    if (entity.xPos > scene.xPos && entity.yPos >= scene.yPos) {
      entity.xPos = scene.xPos + scene.width;

      if (entity.type === 'goomba') {
        entity.direction = entity.direction === 'left' ? 'right' : 'left';
      }
    }
    // Top
    if (entity.yPos < scene.yPos &&
      (entity.xPos + entity.width) > scene.xPos &&
      entity.xPos < (scene.xPos + scene.width) && entity.velY >= 0) {

      if (entity.type !== 'dead') { // fall through ground when dead
        if (entity.type === 'mario') {
          if (entity.bigMario) {
            entity.currentState = entity.states.bigStanding;
          } else {
            entity.currentState = entity.states.standing;
          }
        }
        entity.yPos = scene.yPos - entity.height - 1;
        entity.velY = 0;
      }
    }
    // Bot
    if (entity.yPos >= scene.yPos &&
      (entity.xPos + entity.width) >= scene.xPos &&
      entity.xPos < (scene.xPos + scene.width) && entity.velY < 0) {
      if (scene.type === 'block') {
        if (scene.contents === 'coin') {
          scene.collectCoin(data);
        }
        scene.sprite = scene.used;
      } else if (scene.type === 'breakable') {
        if (entity.bigMario) {
          scene.type = 'shrub';
          const index = data.mapBuilder.breakableEntities.indexOf(scene);
          delete data.mapBuilder.breakableEntities[index];
        } else {
        }
      }
      entity.yPos = entity.yPos + entity.height;
      entity.xPos = scene.xPos;
      entity.velY = 1.2;
    }
  },

  gravity(entity) {
    entity.velY += 1.2;
    entity.yPos += entity.velY;
  },
};

export { physics as default };
