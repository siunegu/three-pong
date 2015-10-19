/* 
 * Copyright (c) 2015 Eugenius Lai
 * ThreeJS experiment
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
        FIELD_WIDTH = 800,
        FIELD_LENGTH = 2000,
        BALL_RADIUS = 20,
        PADDLE_WIDTH = 200,
        PADDLE_HEIGHT = 30

    // declare members.
    let container, renderer, camera, mainLight,
        scene, ball, player1, player2, field, running;

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
            scene.add(this.mesh);
        }

        init() {
            let ballGeometry = this.ballGeometry,
                ballMaterial = this.ballMaterial,
                mesh = new THREE.Mesh(ballGeometry, ballMaterial);

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

        processBallMovement() {
            if (!this._velocity) {
                this.startBallMovement();
            }

            if (this.isPaddle1Collision()) {
                this.hitBallBack(player1);
            }

            if (this.isPaddle2Collision()) {
                this.hitBallBack(player2);
            }

            if (this.isSideCollision()) {
            		this._velocity.x *= -1
            }
            console.log(this.isSideCollision())

            this.updateBallPosition()
        }

        updateBallPosition() {
            let ballPos = this.mesh.position;

            // update the ball's position
            ballPos.x += this._velocity.x;
            ballPos.z += this._velocity.z;
        }

        isPastPaddle1() {
            return ball.position.z > player1.position.z + 100;
        }

        isPastPaddle2() {
            return ball.position.z < paddle2.position.z - 100;
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

        isSideCollision() {
        		let ballX = ball.mesh.position.x
        		// console.log("half field width " + FIELD_WIDTH / 2)
        		// console.log(ballX - BALL_RADIUS)

        		return ballX + BALL_RADIUS >= FIELD_WIDTH || -ballX - BALL_RADIUS >= -FIELD_WIDTH
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
        camera.position.set(0, 100, FIELD_LENGTH / 2 + 500);

        scene = new THREE.Scene();
        scene.add(camera);

        field = new Field(
            new THREE.CubeGeometry(FIELD_WIDTH, 5, FIELD_LENGTH, 1, 1, 1),
            new THREE.MeshLambertMaterial({
                color: 0xf98233
            })
        );

        ball = new Ball(
            new THREE.SphereGeometry(BALL_RADIUS, 16, 16),
            new THREE.MeshLambertMaterial({
                color: 0x0EE3FC
            })
        );
        // console.log(ball.mesh.position.z += 1200)
        player1 = addPaddle();
        player1.position.z = FIELD_LENGTH / 2;
        player2 = addPaddle();
        player2.position.z = -FIELD_LENGTH / 2;

        mainLight = new THREE.HemisphereLight(0xFFFFFF, 0x1c75a1);
        scene.add(mainLight);

        renderer.domElement.addEventListener('mousemove', containerMouseMove)
    }

    init();
    render();
})(window, window.document, window.THREE);