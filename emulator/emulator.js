let arr = [];


// Emulator variables
let opcode;
let memory = new Array(4096);
let V = new Array(16);
let gfx = new Array(64 * 32);
let stack = new Array(16);
let key = new Array(16);
if (Object.seal) {
    Object.seal(memory);
    Object.seal(V);
    Object.seal(gfx);
    Object.seal(stack);
    Object.seal(key);
}
let I;
let pc;
let delay_timer;
let sound_timer;
let myChip8;

class chip8 {
    constructor() {

    }
    initialize() {
        // Initialize registers and memory once
    }
    emulateCycle() {
        // Fetch opcode
        opcode = memory[pc] << 8 | memory[pc + 1];

        // Decode opcode
        switch(opcode & 0xF000) {

            // Execute opcode
            case 0x0000:
                if (opcode & 0x0FF == 0x00E0) { // 0x453A & 0x00FF == 0x003A
                    // Clear the screen
                    instructions.clearScreen();
                }
        }
        
        // Update timers
    }
}


function setup() {
    createCanvas(1000, 1000);

    for (let i = 0; i < 70; i++) {
        arr.push(i);
    }
}

function setupGraphics() {
    background(220);
    textAlign(CENTER, CENTER);

    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 64; x++) {
            let xpos = x * 10;
            let ypos = y * 10;

            let index = y * 64;

            if (inside(xpos, ypos, 10, 10)) {
                fill(255, 0, 0);
            } else {
                fill(255);
            }

            stroke(0);
            rect(xpos, ypos, 10, 10);

            let h = map(index, 0, 69, 0, 255);
            fill(h);
            noStroke();
            text(arr[index], xpos, ypos, 10, 10);
        }
    }

    for (let i = 0; i < height; i++) {
        colorMode(HSB);
        let h = map(i, 0, height, 10, 18);
        stroke(h, 80, 80);
        line(700, i, 1000, i);
    }

    colorMode(RGB);
}

function draw() {
   setupGraphics();

   myChip8.initialize();
   myChip8.loadGame("pong");

   {
       myChip8.emulateCycle();

       if (myChip8.drawFlag) {
           drawGraphics();
       }

       myChip8.setKeys();
   }
}

function inside(x, y, w, h) {
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        return true;
    } else {
        return false;
    }
}

