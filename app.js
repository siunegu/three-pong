/** 
 * Copyright (c) 2015 Eugenius Lai
 * ThreeJS experiment
 */

/**
 * Notes:
 * - Player logic should probably be refactored into a Player class.
 * - TODO: increment player score when ball is past a player paddle collision.
 */

'use strict';
(function(window, document, THREE) {
    // constants...
    const WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight,
        VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000,
        FIELD_WIDTH = 1000,
        FIELD_LENGTH = 2000,
        BALL_RADIUS = 20,
        PADDLE_WIDTH = 200,
        PADDLE_HEIGHT = 30

    // declare members.
    let container, renderer, camera, mainLight,
        scene, ball, player1, player2, field, running,

        player1Score, player2Score;

    class Field {
        constructor(fieldGeometry, fieldMaterial) {
            this.fieldGeometry = fieldGeometry;
            this.fieldMaterial = fieldMaterial;
            this.mesh = this.init();
        }

        init() {
            let fieldGeometry = this.fieldGeometry,
                fieldMaterial = this.fieldMaterial
            field = new THREE.Mesh(fieldGeometry, fieldMaterial);
            field.position.set(0, -50, 0);

            scene.add(field);
        }
    }

    class Ball {
        constructor(ballGeometry, ballMaterial) {
            this.ballGeometry = ballGeometry;
            this.ballMaterial = ballMaterial;
            this.mesh = this.init();
            this._velocity;
            this._stopped;
            scene.add(this.mesh);
        }

        init() {
            let ballGeometry = this.ballGeometry,
                ballMaterial = this.ballMaterial,
                mesh = new THREE.Mesh(ballGeometry, ballMaterial);
            mesh.position.set(0, 0, 0);
            camera.lookAt(mesh.position);

            return mesh;
        }

        startBallMovement() {
            let direction = Math.random() > 0.5 ? -1 : 1;
            this._velocity = {
                x: 0,
                z: direction * 20
            }
            this._stopped = false
        }

        stopBall() {
            this._stopped = true
        }

        processBallMovement() {
            if (!this._velocity) {
                this.startBallMovement();
            }

            if (this.isPaddle1Collision() && this.isAlignedWithPaddle(player1)) {
                this.hitBallBack(player1);
            }

            if (this.isPaddle2Collision() && this.isAlignedWithPaddle(player2)) {
                this.hitBallBack(player2);
            }

            if (this.isSideCollision()) {
                console.log("is side collision")
                this._velocity.x *= -0.3;
            }

            if (this.isPastPaddle1()) {
                this.stopBall();
                resetGame();
            }

            if (this.isPastPaddle2()) {
                this.stopBall();
                resetGame();
            }

            if (this._stopped) {
                return;
            }

            this.updateBallPosition()
        }

        updateBallPosition() {
            let ballPos = this.mesh.position;

            // update the ball's position
            ballPos.x += this._velocity.x;
            ballPos.z += this._velocity.z;
            ballPos.y = -((ballPos.z - 1) * (ballPos.z - 1) / 2000) + 435;
        }

        hitBallBack(paddle) {
            ball._velocity.x = (ball.mesh.position.x - paddle.position.x) / 5;
            ball._velocity.z *= -1;
        }

        isPaddle2Collision() {
            return ball.mesh.position.z - BALL_RADIUS <= player2.position.z
        }

        isPaddle1Collision() {
            return ball.mesh.position.z + BALL_RADIUS >= player1.position.z
        }

        isAlignedWithPaddle(player) {
            let ballPos = ball.mesh.position,
                playerPos = player.position;

            return (ballPos.x <= playerPos.x && ballPos.x >= playerPos.x - PADDLE_WIDTH / 2) || (ballPos.x >= playerPos.x && ballPos.x <= playerPos.x + PADDLE_WIDTH / 2)
        }

        isSideCollision() {
            let ballX = ball.mesh.position.x,
                halfFieldWidth = FIELD_WIDTH / 2;

            return (ballX + BALL_RADIUS > halfFieldWidth) || (ballX - BALL_RADIUS < -halfFieldWidth)
        }

        isPastPaddle1() {
            return ball.mesh.position.z > player1.position.z;
        }

        isPastPaddle2() {
            return ball.mesh.position.z < player2.position.z;
        }
    }

    // draw a paddle.
    let addPaddle = function paddle() {
        let paddleGeometry = new THREE.CubeGeometry(PADDLE_WIDTH, PADDLE_HEIGHT, 10, 1, 1, 1),
            paddleMaterial = new THREE.MeshLambertMaterial({
                color: 0xCCCCCC
            }),
            paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        scene.add(paddle);
        return paddle;
    }

    // handle mouse move.
    let containerMouseMove = function mousemove(e) {
        let mouseX = e.clientX;
        camera.position.x = player1.position.x = -((WIDTH - mouseX) / WIDTH * FIELD_WIDTH) + (FIELD_WIDTH / 2)
    }

    // game logic.
    let resetGame = function reset() {
        ball.mesh.position.set(0, 0, 0);
        ball._velocity = null;    		
    }

    // handle player score.
    let updateScore = function score(playerScore) {
        playerScore += 1;
    }()

    // render animation.
    let render = function render() {
        requestAnimationFrame(render);

        ball.processBallMovement();

        renderer.render(scene, camera);
    }

    // setup camera and renderer.
    let init = function init() {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(WIDTH, HEIGHT);
        renderer.setClearColor(0xfcfcfc, 1);
        document.body.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.position.set(0, 250, FIELD_LENGTH / 2 + 600);

        scene = new THREE.Scene();
        scene.add(camera);

        // initialize playing field.
        field = new Field(
            new THREE.CubeGeometry(FIELD_WIDTH, 5, FIELD_LENGTH, 1, 1, 1),
            new THREE.MeshLambertMaterial({
                color: 0xf98233
            })
        );

        // initialize the ball object.
        ball = new Ball(
            new THREE.SphereGeometry(BALL_RADIUS, 16, 16),
            new THREE.MeshLambertMaterial({
                color: 0x0EE3FC
            })
        );

        // initialize players.
        player1 = addPaddle();
        player1.position.z = FIELD_LENGTH / 2 - 40;

        player2 = addPaddle();
        player2.position.z = -FIELD_LENGTH / 2 + 40;

        // initialize scoreboard.
        player1Score = document.querySelector('.player1-score').innerHTML,
        player2Score = document.querySelector('.player1-score').innerHTML;

        mainLight = new THREE.HemisphereLight(0xFFFFFF, 0x1c75a1);
        scene.add(mainLight);

        renderer.domElement.addEventListener('mousemove', containerMouseMove)
    }

    init();
    render();
})(window, window.document, window.THREE);