import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

window.onload = () => loadmodel();

function loadmodel() {
  const loader = new GLTFLoader();
  loader.load(
    "public/avatar.glb",
    (gltf) => {
      // 2- Appelée quand le chargement est terminé
      setupScene(gltf);
      // 2.1- Retrait du pourcentage de chargement une fois le model chargé
      document.getElementById("avatar-loading").style.display = "none";
    },
    (xhr) => {
      // 1- Appelée pendant le chargement
      // 1.1- Récupération du pourcentage de chargement
      const percentCompletion = Math.round((xhr.loaded / xhr.total) * 100);
      // 1.2- Affichage de ce pourcentage à l'écran
      document.getElementById("avatar-loading").innerText =
        `Chargement.. ${percentCompletion}%`;
      // console.log(`Chargement du model.. ${percentCompletion}%`);
    },
    (error) => {
      // 3?- Appelée en cas d'erreur pendant le chargement
      console.error(error);
    },
  );
}

function setupScene(gltf) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const container = document.getElementById("avatar-container");
  // Définition des dimensions du renderer à l'espace dédié à l'avatar
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Ajout du canvas à la div contenant l'avatar (avatar-container)
  container.appendChild(renderer.domElement);

  // Ajout de la caméra
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
  );
  camera.position.set(-0.1, 2, 3);

  // Ajout de l'OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minDistance = 3;
  controls.minPolarAngle = 1.4;
  controls.maxPolarAngle = 1.4;
  controls.target = new THREE.Vector3(0, 0.75, 0);
  controls.update();

  // Mise en place de la scène
  const scene = new THREE.Scene();

  // Ajout des lumières
  scene.add(new THREE.AmbientLight());

  const spotlight = new THREE.SpotLight(0xffffff, 18, 8, 1);
  spotlight.penumbra = 0.5;
  spotlight.position.set(0, 8, 2);
  spotlight.castShadow = true;
  scene.add(spotlight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(1, 1, 2);
  keyLight.lookAt(new THREE.Vector3());
  scene.add(keyLight);

  // Chargement de l'avatar
  const avatar = gltf.scene;
  avatar.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  avatar.position.y -= 0.5;
  scene.add(avatar);

  // Création du piédestal
  const groundGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.08, 64);
  const groundMaterial = new THREE.MeshStandardMaterial();
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.castShadow = false;
  groundMesh.receiveShadow = true;
  groundMesh.position.y -= 0.5;
  // scene.add(groundMesh);

  // Chargement des animations
  const mixer = new THREE.AnimationMixer(avatar);
  const clips = gltf.animations;
  const waveClip = THREE.AnimationClip.findByName(clips, "waving");
  const stumbleClip = THREE.AnimationClip.findByName(clips, "salut");
  const waveAction = mixer.clipAction(waveClip);
  const stumbleAction = mixer.clipAction(stumbleClip);

  container.addEventListener("mousedown", (ev) => {
    const coords = {
      x: (ev.offsetX / container.clientWidth) * 2 - 1,
      y: -(ev.offsetY / container.clientHeight) * 2 + 1,
    };

    console.log(coords);
  });

  // Boucle d'animation
  const clock = new THREE.Clock();
  function animate() {
    // avatar.rotation.y += 0.01;
    // avatar.rotation.z += 0.01;

    requestAnimationFrame(animate);
    mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  }

  animate();
  waveAction.play();
}
