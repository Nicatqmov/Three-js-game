import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const controls = new PointerLockControls(camera, document.body);
// document.addEventListener('click', () => {
//     controls.lock();
// });
// controls.addEventListener('lock', () => {
//     // Hide instructions or UI elements indicating how to unlock
// });
// controls.addEventListener('unlock', () => {
//     // Show instructions or UI elements indicating how to lock
// });
// scene.add(controls.getObject()); // Add the camera to the scene

// Load sky texture
const EXRTextureLoader = new EXRLoader();
EXRTextureLoader.load('assets/sky/kloofendal_43d_clear_puresky_1k.exr', function (texture) {
    texture.minFilter = THREE.NearestFilter;
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    const skyDome = new THREE.Mesh(geometry, material);
    skyDome.scale.set(-1, 1, 1);
    scene.add(skyDome);
});

// Set camera  position
camera.position.set(0, 10, -3);
// camera.rotation.z=Math.PI/2
camera.rotation.x=Math.PI/3-0.3
camera.rotation.y=Math.PI

// Add ambient light
const light = new THREE.AmbientLight(0xffffff, 1);
light.position.set(1, 4, 1); // Set the light's position
scene.add(light);

//  !player movement!



const planeSize = 1000
const loader = new THREE.TextureLoader()
const texture = loader.load('./assets/plain/GroundDirtRocky020_COL_1K.jpg')
texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.RepeatWrapping
texture.magFilter = THREE.NearestFilter
const repeats = planeSize / 2
texture.repeat.set(repeats, repeats)

// plane for board
const geometry = new THREE.PlaneGeometry(planeSize, planeSize)
const material = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide
})
const board = new THREE.Mesh(geometry, material)

board.position.set(0, 0, 0)
board.rotation.x = Math.PI/2
scene.add(board)

function updateCameraPosition() {
    if (!playerObject) return; 
    const playerPos = playerObject.position;
    const cameraPos = controls.getObject().position;

    cameraPos.copy(playerPos).add(new THREE.Vector3(0, 8, -8));
}

//player


const Ploader = new FBXLoader();
let mixer;
let playerObject; // Define playerObject in a scope accessible to both functions
let action
Ploader.load('./assets/player/Astronauta.fbx', function (object) {
    playerObject = object; // Assign the loaded object to playerObject
    mixer = new THREE.AnimationMixer(playerObject);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('./assets/player/texture/multpaleta.png', function (texture) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = texture;
            }
        });
    });

    object.position.y = 0;
    object.rotation.y = Math.PI;
    action = mixer.clipAction(playerObject.animations[14]);

    //show animation list
    console.log(playerObject.animations)

    action.play();
    scene.add(playerObject);
});

const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
};

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': // Move forward (W)
            action = mixer.clipAction(playerObject.animations[9]);
            action.play();
            moveState.forward = true;
            break;
        case 'KeyS': // Move backward (S)
            moveState.backward = true;
            action = mixer.clipAction(playerObject.animations[9]);
            action.play();
            break;
        case 'KeyA': // Move left (A)
            moveState.left = true;
            action = mixer.clipAction(playerObject.animations[9]);
            action.play();
            break;
        case 'KeyD': // Move right (D)
            moveState.right = true;
            action = mixer.clipAction(playerObject.animations[9]);
            action.play();
            break;
        case 'ShiftLeft': // Move right (D)
            console.log("shift")
            moveState.run = true;
            action = mixer.clipAction(playerObject.animations[12]);
            action.play();
            break;
    }
});
document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            moveState.forward = false;
            action.stop(); // Stop the current animation
            action = mixer.clipAction(playerObject.animations[14]);
            action.play();
            break;
        case 'KeyS':
            moveState.backward = false;
            action.stop(); // Stop the current animation
            action = mixer.clipAction(playerObject.animations[14]);
            action.play();
            break;
        case 'KeyA':
            moveState.left = false;
            action.stop(); // Stop the current animation
            action = mixer.clipAction(playerObject.animations[14]);
            action.play();
            break;
        case 'KeyD':
            moveState.right = false;
            action.stop(); // Stop the current animation
            action = mixer.clipAction(playerObject.animations[14]);
            action.play();
            break;
        case 'ShiftLeft': // Move right (D)
            // console.log("shift")
            moveState.run = false;
           
            break;
    }
});

function updatePlayerPosition() {
    if (!playerObject) return; // Check if playerObject is defined
    let speed = 0.0312; // Movement speed
    if(moveState.run){
        speed*=2
    }else{
        speed =0.0312
    }
    const pos = playerObject.position;
    const y = pos.y; // Save current Y position for only move x,z
    pos.y = 0; // Set Y position to 0 for movement calculation

    // Movement 
    if (moveState.forward) {
        playerObject.position.z += speed
        playerObject.rotation.y = 0;
    }
    if (moveState.backward) {
       
        playerObject.position.z -= speed
        playerObject.rotation.y = Math.PI;
    }
    if (moveState.left) {
      
        playerObject.position.x += speed
        playerObject.rotation.y = Math.PI / 2;
    }
    if (moveState.right) {
       
        playerObject.position.x -= speed
        playerObject.rotation.y = -Math.PI / 2;
    }
    

    // Diaogonal animations only 
    if (moveState.forward & moveState.right) {
        playerObject.rotation.y = -Math.PI / 4;
    }
    if (moveState.forward && moveState.left) {
        playerObject.rotation.y = Math.PI / 4;
    }
    if (moveState.backward && moveState.right) {
        playerObject.rotation.y = -2*Math.PI / 3;
    }
    if (moveState.backward && moveState.left) {
        playerObject.rotation.y = 2*Math.PI / 3;
    }
        pos.y = y; // Restore original Y position
}


const clock = new THREE.Clock();

function animate() {
    const deltaTime = clock.getDelta();
    updateCameraPosition();
    updatePlayerPosition();
    requestAnimationFrame(animate);
    if (mixer) {
        mixer.update(deltaTime); // Update the animation mixer with the time delta
    }
    renderer.render(scene, camera);
}
animate()
