"use strict";

import { Pane } from './tweakpane-4.0.5.min.js'
const pane = new Pane();

let elements = [];
let sound;
let fft;
let state = false;
let mainCam;
let lerpCam;


// Element Property
const elementProperty = {
  nb: 100,
  size_min: 5,
  size_max: 40,
  colors: ""
};

pane.addBinding(elementProperty, "nb", {
  label: "Number of elements",
  step: 1,
  min: 50,
  max: 200
}).on("change", () => {
  setup();
  redraw();
});

pane.addBinding(elementProperty, "size_max", {
  label: "Size max",
  step: 1,
  min: 20,
  max: 50,
}).on("change", () => {
  setup();
  redraw();
});

// ["#999999", "#777777", "#555555", "#333333", "#111111"]
pane.addBinding(elementProperty, "colors", {
  label: "Color palet",
  options: {
    none: "",
    pink: ["#EABFCB", "#C191A1", "#A4508B", "#5F0A87", "#2F004F"],
    red: ["#FDFFFF", "#B10F2E", "#570000", "#280000", "#DE7C5A"],
    green: ["#E6FAFC", "#9CFC97", "#6BA368", "#515B3A", "#353D2F"],
    blue: ["#ADD7F6", "#87BFFF", "#3F8EFC", "#2667FF", "#3B28CC"]
  }
}).on("change", () => {
  setup();
  redraw();
});


// Canvas Property
const canvasProperty = {
  isOrbit: false,
};

pane.addBinding(canvasProperty, "isOrbit", {
  label: "Free move"
});


// Sound Property
const soundProperty = {
  volume: 0.05,
  sounds: ""
};

pane.addBinding(soundProperty, "volume", {
  label: "Volume",
  step: 0.05,
  min: 0.05,
  max: 2
});

// pane.addBinding(soundProperty, "sounds", {
//   label: "Sound choice",
//   options: {
//     tvoff: "assets/audio/tvoff.mp3",
//     GNX: "assets/audio/GNX.mp3",
//     caca: "assets/audio/caca.mp3",
//     ouioui: "assets/audio/ouiouihard"
//   }
// }).on("change", () => {
//   preload();
//   redraw();
// })


// Prelaod du son à jouer
function preload() {
  soundFormats("mp3", "ogg");
  sound = loadSound("assets/audio/tvoff.mp3");
}


// Initialisation du script
function setup() {
  // randomSeed(99);
  createCanvas(windowWidth, windowHeight, WEBGL);

  elements = [];

  for (let i = 0; i < elementProperty.nb; i++) {
    let x = random(-width * 0.5, width * 0.5);
    let y = random(-height * 0.5, height * 0.5);
    let z = random(-300, 300);
    let size = random(elementProperty.size_min, elementProperty.size_max + 1);
    let col = random(elementProperty.colors);

    elements.push({col, size, x, y, z});
  }

  
  // Initialisation des cameras
  mainCam = createCamera();
  lerpCam = createCamera();
  setCamera(mainCam);
  mainCam.setPosition(0, 0, 800);

  fft = new p5.FFT();
}


// Boucle de dessin
function draw() {

  fft.analyze();
  sound.setVolume(soundProperty.volume);

  let bass = map(fft.getEnergy("bass"), 0, 255, 1, 5);   // 20Hz - 140Hz
  let mid = map(fft.getEnergy("mid"), 0, 255, 1, 2.5);     // 140Hz - 4000Hz
  let treble = map(fft.getEnergy("treble"), 0, 255, 1, 1.5); // 4000Hz - 20000Hz

  console.log(`Bass: ${bass}, Mid: ${mid}, Treble: ${treble}`);

  // noCursor();

  smooth(); 
  ortho()
  background(25);
  noStroke();

  if (canvasProperty.isOrbit) {
    orbitControl();
    mainCam.lookAt(0, 0, 0);
  } else {
    mainCam.lookAt(0, 0, 0);
    let targetX = (mouseX - width * 0.5) * 0.1;
    let targetY = (mouseY - height * 0.5) * 0.1;
    let targetZ = 800;

    let currentX = mainCam.eyeX;
    let currentY = mainCam.eyeY;
    let currentZ = mainCam.eyeZ;

    let amt = 0.07;

    let lerpX = lerp(currentX, targetX, amt);
    let lerpY = lerp(currentY, targetY, amt);
    let lerpZ = lerp(currentZ, targetZ, amt);

    mainCam.setPosition(lerpX, lerpY, lerpZ);
  }
  
  for (let element of elements) {
    push();
    fill(element.col);

    translate(element.x, element.y, element.z); // Place les cube
    

    let scaleFactor;
    if (element.z < -100) {
      scaleFactor = bass;
    } else if (element.z < 100) {
      scaleFactor = mid;
    } else {
      scaleFactor = treble;
    }

    sphere(element.size * scaleFactor);

    pop();
  }
}

function keyPressed() {
  if (keyCode === 32 && state === false) {
    sound.play();
    state = true;
  } else if (keyCode === 32) {
    sound.pause();
    state = false;
  }
}


window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.preload = preload;