import { OBJLoader } from "jsm/loaders/OBJLoader.js";

// 0) load Model
const manager = new THREE.LoadingManager();
const loader = new OBJLoader(manager);
let sceneData = {};
manager.onLoad = () => initScene(sceneData);
loader.load("./models/head.obj", (obj) => {
  let geometry;
  obj.traverse((child) => {
    if (child.type === "Mesh") {
      geometry = child.geometry;
    }
  });
  sceneData.geometry = geometry;
});

// 1) init scene
function initScene(data) {
  let { geometry } = data;
  geometry.center();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffff00,
  });
  const mesh = new THREE.Mesh(geometry, mat);
  scene.add(mesh);

}

// 2) color vertices
const numFaces = geometry.attributes.position.count / 3;
const colors = new Float32Array(numFaces * 3 * 3);
const displacement = new Float32Array(numFaces * 3 * 3);
const color = new THREE.Color();
for (let f = 0; f < numFaces; f++) {
  const index = 9 * f;
  let lightness = 0.7 + Math.random() * 0.2;
  color.setHSL(0.56, 1.0, lightness);

  const d = 10 * (0.5 - Math.random());
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
  "customColor",
  new THREE.BufferAttribute(colors, 3)
);
geometry.setAttribute(
  "displacement",
  new THREE.BufferAttribute(displacement, 3)
);

// 3) shader material
const uniforms = {
  mousePosition: { value: new THREE.Vector2(0.0, 0.0) },
  lightPosition: { value: new THREE.Vector3(1, 1, 2) },
};
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: document.getElementById("vertexshader").textContent,
  fragmentShader: document.getElementById("fragmentshader").textContent,
});

// 4) Mouse Interactivity
const pointerPos = new THREE.Vector2(0, 0);

// function animate() {
//   requestAnimationFrame(animate);
  let { x, y } = pointerPos;
  // mesh.rotation.y -= 0.002;
  uniforms.mousePosition.value = { x, y };
//   renderer.render(scene, camera);
//   controls.update();
// }
animate();
window.addEventListener('mousemove', (evt) => {
  pointerPos.set(
    (evt.clientX / window.innerWidth) * 2 - 1,
    -(evt.clientY / window.innerHeight) * 2 + 1
  );
});


// try different colors
// try another material with onBeforeCompile
// try another model
// or an animated model
