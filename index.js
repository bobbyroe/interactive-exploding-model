import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getLayer from "./libs/getLayer.js";
import { OBJLoader } from "jsm/loaders/OBJLoader.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const pointerPos = new THREE.Vector2();
function initScene(data) {
  let { geometry } = data;
  geometry.center();

  const numFaces = geometry.attributes.position.count / 3;
  const colors = new Float32Array(numFaces * 3 * 3);
  const displacement = new Float32Array(numFaces * 3 * 3);
  const color = new THREE.Color();
  for (let f = 0; f < numFaces; f++) {
    const index = 9 * f;
    let lightness = 0.3 + Math.random() * 0.7;
    color.setHSL(0.0, 1.0, lightness);
    let d = 10 * (0.5 - Math.random());
    for (let i = 0; i < 3; i++) {
      let { r, g, b } = color;
      colors[index + 3 * i] = r;
      colors[index + 3 * i + 1] = g;
      colors[index + 3 * i + 2] = b;

      displacement[index + 3 * i] = d;
      displacement[index + 3 * i + 1] = d;
      displacement[index + 3 * i + 2] = d;
    }
  }
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
  );
  geometry.setAttribute(
    "displacement",
    new THREE.BufferAttribute(displacement, 3)
  );

  const uniforms = {
    mousePosition: { value: new THREE.Vector2(0.0, 0.0) },
    lightPosition: { value: new THREE.Vector3(1, 1, 2) },
  };
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("vertexshader").textContent,
    fragmentShader: document.getElementById("fragmentshader").textContent,
  });
  const mesh = new THREE.Mesh(geometry, shaderMaterial);
  mesh.scale.setScalar(2.0)
  scene.add(mesh);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
  scene.add(hemiLight);

  // Sprites BG
  const gradientBackground = getLayer();
  scene.add(gradientBackground);

  function animate() {
    requestAnimationFrame(animate);
    let { x, y } = pointerPos;
    shaderMaterial.uniforms.mousePosition.value = { x, y };
    renderer.render(scene, camera);
    controls.update();
  }
  animate();
}

const sceneData = {
  mesh: null,
}
const manager = new THREE.LoadingManager();
manager.onLoad = () => initScene(sceneData);
const loader = new OBJLoader(manager);
loader.load("./models/head.obj", function (res) {
  let geometry;
  res.traverse(function (child) {
    if (child.type === "Mesh") {
      geometry = child.geometry;
    }
  });
  sceneData.geometry = geometry;
});

window.addEventListener('mousemove', (evt) => {
  pointerPos.set(
    (evt.clientX / window.innerWidth) * 2 - 1,
    -(evt.clientY / window.innerHeight) * 2 + 1
  );
});



function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);