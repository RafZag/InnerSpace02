import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";

class ambientParticles {
  parentContainer;
  pos = new THREE.Vector3();
  direction = new THREE.Vector3(0, 0, 1);
  speed = 6;
  birthRate = 20;
  particleCount = 3000;
  frontBirthDistane = -150;
  backBirthDistane = 20;
  flying = false;
  spinRate = 0.0001;

  pointSpread = 100;

  particles; // THREE.Points(); - main object added to scene
  vertices = []; // particles verts
  color = new THREE.Color(0x4fcfae);

  constructor(cont) {
    this.parentContainer = cont;
    // this.pos.z = -200;
    this.buildParticles();
  }

  getPoint() {
    var u = Math.random();
    var v = Math.random();
    var theta = u * 2.0 * Math.PI;
    var phi = Math.acos(2.0 * v - 1.0);
    var r = Math.cbrt(Math.random()) * this.pointSpread;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);
    var x = r * sinPhi * cosTheta;
    var y = r * sinPhi * sinTheta;
    var z = r * cosPhi;
    return { x: x, y: y, z: z };
  }

  buildParticles() {
    let particlesParticlesGeo = new THREE.BufferGeometry();
    const sprite = new THREE.TextureLoader().load("./img/pointSprite.png");

    for (let i = 0; i < this.particleCount; i++) {
      const x = this.getPoint().x;
      const y = this.getPoint().y;
      const z = this.getPoint().z;

      this.vertices.push(x, y, z);
    }
    particlesParticlesGeo.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));

    let mat = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: true,
      map: sprite,
      depthTest: false,
      transparent: true,
    });

    mat.color.set(this.color);
    this.particles = new THREE.Points(particlesParticlesGeo, mat);
    this.parentContainer.add(this.particles);
  }

  spin() {
    this.particles.rotation.y += this.spinRate;
    this.particles.rotation.x -= this.spinRate * 0.5;
  }

  update() {
    this.spin();
  }
}

export { ambientParticles };
