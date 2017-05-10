(function () {
    'use strict';

    var control = document.getElementById("control");
    var start = document.createElement("button");
    var pause = document.createElement("button");
    var canvas = document.getElementById("canv");
    var ctx = canvas.getContext("2d");

    const step = 30;

    var point = [];
    var walls = [];
    var stones = [];
    var plants = [];
    var plantEaters = [];

    function randomInt(min, max) {
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    }

    var directions = ['n', 'w', 'e', 's'];

    (function buildGrid() {
        for (var i = 0; i < 20; i++) {
            point.push(i * step);
        }
    })();

    function randomPoint(){
        return point[randomInt(1, point.length - 2)];
    }

    (function createWall() {
        for (var i = 0; i < 20; i++) {
            walls.push(new GameObject(point[i], point[0], step, step, '#a723f7'));
            walls.push(new GameObject(point[point.length - 1], point[i], step, step, '#a723f7'));
            walls.push(new GameObject(point[i], point[point.length - 1], step, step, '#a723f7'));
            walls.push(new GameObject(point[0], point[i], step, step, '#a723f7'));
        }
    })();

    (function createStone() {
        for (var i = 0; i < 18; i++) {
            stones.push(new GameObject(randomPoint(), randomPoint(), step, step, '#eee'));
        }
    })();

    function changeDirection(object, direction) {
        switch (direction) {
            case 'n': object.y -= step; break;
            case 'w': object.x -= step; break;
            case 'e': object.x += step; break;
            case 's': object.y += step; break;
        }
        return object;
    }

    var employedFields = walls.slice();
    stones.forEach(function (item) { employedFields.push(item); });

    function checkCollision(object) {
        var freeDirections = directions.slice();

        employedFields.forEach(function (item) {
            if (item.x === object.x && item.y === object.y - step)
                freeDirections.splice(freeDirections.indexOf('n'), 1);
            if (item.x === object.x - step && item.y === object.y)
                freeDirections.splice(freeDirections.indexOf('w'), 1);
            if (item.x === object.x + step && item.y === object.y)
                freeDirections.splice(freeDirections.indexOf('e'), 1);
            if (item.x === object.x && item.y === object.y + step)
                freeDirections.splice(freeDirections.indexOf('s'), 1);
        });

        object.direction = freeDirections[randomInt(0, freeDirections.length)];
        return object;
    }

    function GameObject(x, y, h, w, color) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.color = color;
    }

    function Plant(x, y, h, w, color, lifeTime, direction) {
        GameObject.apply(this, arguments);
        this.lifeTime = lifeTime;
        this.direction = direction;
    }

    Plant.prototype.grow = function() {
        plants.push(new Plant(this.x, this.y, step, step, '#37fa19', 0, 's', false));
        checkCollision(this);
        changeDirection(this, this.direction);
    };

    function PlantEater(x, y, h, w, color, lifeTime, direction) {
        GameObject.apply(this, arguments);
        this.lifeTime = lifeTime;
        this.direction = direction;
    }

    PlantEater.prototype.move = function() {
        checkCollision(this);
        changeDirection(this, this.direction);
        this.lifeTime -= 0.5;
    };

    PlantEater.prototype.eat = function() {
        var thisEater = this;
        plants.forEach(function (item, index) {
            if (item.x === thisEater.x && item.y === thisEater.y) {
                thisEater.lifeTime += 1;
                plants.splice(index, 1);
            }
        });
    };

    PlantEater.prototype.reproduce = function() {
        var thisEater = this;
        var otherEaters = plantEaters.slice();
        otherEaters.splice(plantEaters.indexOf(thisEater), 1);
        otherEaters.forEach(function (item) {
            if (item.x === thisEater.x && item.y === thisEater.y &&
                item.lifeTime === 30 && thisEater.lifeTime === 30)
                plantEaters.push(new PlantEater(thisEater.x, thisEater.y, step, step, '#55a3f1', 35, 's'));
        });
    };

    function createPlant() {
        plants.push(new Plant(randomPoint(), randomPoint(), step, step, '#37fa19', 0, 's', false));
    }

    function createPlantEater() {
        plantEaters.push(new PlantEater(randomPoint(), randomPoint(), step, step, '#55a3f1', 35, 's', false));
    }

    for (var i = 0; i < 6; i++) {
        createPlant();
        createPlantEater();
    }

    function plantsCycle() {
        plants.forEach(function (item) {
            item.lifeTime += 1;
            if (item.lifeTime % 25 === 0) item.grow();
            draw(item);
        });
    }

    function plantEatersCycle() {
        plantEaters.forEach(function (item, index) {
            if (item.lifeTime > 0) {
                erase(item);
                item.move();
                item.eat();
                item.reproduce();
                draw(item);
            } else {
                erase(item);
                plantEaters.splice(index, 1);
            }
        });
    }

    var scene = walls.slice();
    stones.forEach(function (item) { scene.push(item) });

    function draw(drawObj) {
        ctx.fillStyle = drawObj.color;
        ctx.fillRect(drawObj.x, drawObj.y, drawObj.w, drawObj.h);
    }

    function erase(eraseObj) {
        ctx.clearRect(eraseObj.x, eraseObj.y, eraseObj.w, eraseObj.h);
    }

    function World() {
        scene.forEach(function (item) { draw(item); });
        plantEatersCycle();
        plantsCycle();
    }

    start.className = "control-button";
    start.innerHTML = "<span class='fa fa-play'></span>";
    pause.className = "control-button";
    pause.innerHTML = "<span class='fa fa-pause'></span>";

    function addControlElem(value, func) {
        control.appendChild(value);
        value.addEventListener('click', func);
    }

    addControlElem(start, animateWorld);

    function animateWorld() {
        var timer = setTimeout(function tick() {
            World();
            timer = setTimeout(tick, 300);
        });
        control.removeChild(start);
        addControlElem(pause, function () {
            clearTimeout(timer);
            control.removeChild(pause);
            document.getElementById('control').appendChild(start);
        });
    }

})();