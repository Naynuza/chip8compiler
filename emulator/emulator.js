// Emulator variables
let opcode;
let memory = new Array(4096);
let V = new Array(16);
let gfx = new Array(64 * 32);
let stack = new Array(16);
let key = new Array(16);
/*if (Object.seal) {
    Object.seal(memory);
    Object.seal(V);
    Object.seal(gfx);
    Object.seal(stack);
    Object.seal(key);
}*/
let I;
let pc;
let delay_timer;
let sound_timer;
let sp;
let myChip8;
let chip8_fontset = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, //0
    0x20, 0x60, 0x20, 0x20, 0x70, //1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, //2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, //3
    0x90, 0x90, 0xF0, 0x10, 0x10, //4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, //5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, //6
    0xF0, 0x10, 0x20, 0x40, 0x40, //7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, //8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, //9
    0xF0, 0x90, 0xF0, 0x90, 0x90, //A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, //B
    0xF0, 0x80, 0x80, 0x80, 0xF0, //C
    0xE0, 0x90, 0x90, 0x90, 0xE0, //D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, //E
    0xF0, 0x80, 0xF0, 0x80, 0x80  //F
]
let romfile;
let drawFlag = false;

class chip8 {
    constructor() {

    }
    initialize() {
        // Initialize registers and memory once
        pc = 0x200;
        opcode = 0;
        I = 0;
        sp = 0;

        for (let i = 0; i < 2048; ++i) {
            gfx[i] = 0;
        }

        for (let i = 0; i < 16; ++i) {
            stack[i] = 0;
            key[i] = 0;
            V[i] = 0;
        }

        for (let i = 0; i < 4096; ++i) {
            memory[i] = 0;
        }

        for (let i = 0; i < 80; ++i) {
            memory[i] = chip8_fontset[i];
        }
    }
    emulateCycle() {
        // Fetch opcode
        opcode = memory[pc] << 8 | memory[pc + 1];

        // Decode opcode
        switch(opcode & 0xF000) {

            // Execute opcode
            case 0x0000:
                switch(opcode & 0x000F) {// 0x453A & 0x00FF == 0x003A
                    case 0x0000:
                        // Clear the screen
                        for (let i = 0; i < 2048; ++i) {
                            gfx[i] = 0;
                        }
                        drawFlag = true;
                        pc += 2;
                        break;
                    case 0x000E:
                        // Jump to return address
                        --sp;
                        pc = stack[sp];
                        pc += 2;
                        break;
                    default:
                        console.error("Unknown opcode [0x0000]: 0x" + opcode.toString(16));
                }
                break;
            case 0x1000:
                // Jump to label
                pc = opcode & 0x0FFF;
                break;
            case 0x2000:
                // Call subroutines
                stack[sp] = pc;
                ++sp;
                pc = opcode & 0x0FFF;
                break;
            case 0x3000:
                // Skip if 0x0X00<Vx> = 0x00XX<byte>
                if (getVx() == opcode&0xFF) {
                    pc += 4;
                } else {
                    pc += 2;
                }
                break;
            case 0x4000:
                // Skip if 0x0X00<Vx> != 0x00XX<byte>
                if (getVx() != opcode&0xFF) {
                    pc += 4;
                } else {
                    pc += 2;
                }
                break;
            case 0x5000:
                // Skip if 0x0X00<Vx> != 0x00X0<Vy>
                if (getVx() == getVy()) {
                    pc += 4;
                } else {
                    pc += 2;
                }
                break;
            case 0x6000:
                // Load 0x00XX<byte> into 0x0X00<Vx>
                setVx(opcode&0xFF);
                pc += 2;
                break;
            case 0x7000:
                // Vx = 0x0X00<Vx> + 0x00XX<byte>
                setVx(getVx() + opcode&0xFF);
                pc += 2;
                break;
            case 0x8000:
                switch(opcode & 0x000F) {
                    case 0x0000:
                        // Load 0x00X0<Vy> into 0x0X00<Vx>
                        setVx(getVy());
                        pc += 2;
                        break;
                    case 0x0001:
                        // Vx = 0x0X00<Vx> OR 0x00X0<Vy>
                        setVx(getVx() | getVy());
                        pc += 2;
                        break;
                    case 0x0002:
                        // Vx = 0x0X00<Vx> AND 0x00X0<Vy>
                        setVx(getVx() & getVy());
                        pc += 2;
                        break;
                    case 0x0003:
                        // Vx = 0x0X00<Vx> XOR 0x00X0<Vy>
                        setVx(getVx() && !getVy() ) || ( !getVx() && getVy());
                        break;
                    case 0x0004:
                        // 0x0X00<Vx> += 0x00X0<Vy>
                        if (getVy() > getVx())
                            V[0xF] = 1; //carry
                        else
                            V[0xF] = 0;
                        setVx(getVx() + getVy());
                        pc += 2;
                        break;
                    case 0x0005:
                        // 0x0X00<Vx> -= 0x00X0<Vy>
                        if (getVy() > getVx())
                            V[0xF] = 1; //carry
                        else
                            V[0xF] = 0;
                        setVx(getVx() - getVy());
                        pc += 2;
                        break;
                    case 0x0006:
                        V[0xF] = getVx() & 0x1;
                        V[(opcode&0x0F00)>>>2] >>= 1;
                        pc += 2;
                        break;
                    case 0x0007:
                        // 0x0X00<Vx> -= 0x00X0<Vy>
                        if (getVy() > getVx())
                            V[0xF] = 1; //carry
                        else
                            V[0xF] = 0;
                        setVx(getVx() - getVy());
                        pc += 2;
                        break;
                    case 0x000E:
                        V[0xF] = getVx()>>>7;
                        V[(opcode&0x0F00)>>>2] <<= 1;
                        pc += 2;
                        break;
                    default:
                        console.error("Unknown opcode [0x8000]: 0x" + opcode.toString(16));
                }
                break;
            case 0x9000:
                if (getVx() != getVy())
                    pc += 4;
                else
                    pc += 2;
                break;
            case 0xA000:
                I = opcode & 0x0FFF;
                pc += 2;
                break;
            case 0xB000:
                pc = (opcode & 0x0FFF) + V[0];
                break;
            case 0xC000:
                setVx(Math.floor(Math.random() * (256)) & (opcode & 0x00FF));
                pc += 2;
                break;
            case 0xD000:
                let x = getVx();
                let y = getVy();
                let height = opcode & 0x000F;
                let pixel;

                V[0xF] = 0;
                for (let yline = 0; yline < height; yline++) {
                    pixel = memory[I + yline];
                    for (let xline = 0; xline < 8; xline++) {
                        if ((pixel & (0x80 >>> xline)) != 0) {
                            if (gfx[(x + xline + ((y + yline) * 64))] == 1) {
                                V[0xF] = 1
                            }
                            gfx[x + xline + ((y + yline) * 64)] ^= 1;
                        }
                    }
                }

                drawFlag = true;
                pc += 2;
                break;
            case 0xE000:
                switch(opcode&0x00FF) {
                    case 0x009E:
                        if (key[getVx()] != 0) {
                            pc += 4;
                        } else {
                            pc += 2;
                        }
                        break;
                    case 0x00A1:
                        if (key[getVx()] == 0) {
                            pc += 4;
                        } else {
                            pc += 2;
                        }
                        break;
                    default:
                        console.error("Unknown opcode [0xE000]: 0x" + opcode.toString(16));
                }
                break;
            case 0xF000:
                switch(opcode&0xFF) {
                    case 0x7:
                        setVx(delay_timer);
                        pc += 2;
                        break;
                    case 0xA:
                        let key_pressed = false;

                        for (let i = 0; i < 16; ++i) {
                            if (key[i] != 0) {
                                setVx(i);
                                key_pressed = true;
                            }
                        }

                        if (!key_pressed) {
                            return;
                        }
                        
                        pc += 2;
                        break;
                    case 0x15:
                        delay_timer = getVx();
                        pc += 2;
                        break;
                    case 0x18:
                        sound_timer = getVx();
                        pc += 2;
                        break;
                    case 0x1E:
                        if (I + getVx() > 0xFFF)
                            V[0xF] = 1;
                        else
                            V[0xF] = 0;
                        I += getVx();
                        pc += 2;
                        break;
                    case 0x29:
                        I = getVx() * 0x5;
                        pc += 2;
                        break;
                    case 0x33:
                        memory[I] = getVx() / 100;
                        memory[I + 1] = (getVx() / 10) % 10;
                        memory[I + 2] = getVx() % 10;
                        pc += 2;
                        break;
                    case 0x55:
                        for (let i = 0; i < ((opcode&0x0F00)>>>2); ++i) {
                            memory[I + i] = V[i];
                        }

                        I += ((opcode&0x0F00)>>>2) + 1;
                        pc += 2;
                        break;
                    case 0x65:
                        for (let i = 0; i < ((opcode&0x0F00)>>>2); ++i) {
                            V[i] = memory[I + i];
                        }

                        I += ((opcode&0x0F00)>>>2) + 1;
                        pc += 2;
                        break;
                    default:
                        console.error("Unknown opcode [0xF000]: 0x" + opcode.toString(16));
                }
                break
            default:
                console.error("Unknown opcode: 0x" + opcode.toString(16));
        }
        
        // Update timers
        if (delay_timer > 0)
            --delay_timer;

        if (sound_timer > 0) {
            if (sound_timer == 1) {
                // TODO: Add sound
            }
            --sound_timer;
        }

        //console.log("Ran opcode: 0x" + opcode.toString(16) + " at address: " + pc.toString(10));
    }
    load(file) {
        this.initialize()
        console.log("Loading in ROM file: " + file);

        getFile();
        if (!romfile) {
            console.error("Failed to open ROM");
        }

        let rom_size = romfile.size;

        if ((4096-512) > rom_size) {
            let reader = new FileReader();
            let fileByteArray = [];
            reader.readAsArrayBuffer(romfile);
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    let arrayBuffer = evt.target.result,
                        array = new Uint8Array(arrayBuffer);
                        for (let i = 0; i < rom_size; ++i) {
                            memory[i + 512] = array[i];
                        }
                }
            }
            console.log(memory);
        }
    }
}

function getVx() {
    return V[(opcode & 0x0F00)>>>2];
}
function getVy() {
    return V[(opcode & 0x00F0)>>>1];
}
function setVx(value) {
    V[(opcode & 0x0F00)>>>2] = value;
}
function setVy(value) {
    V[(opcode & 0x00F0)>>>1] = value;
}

function getFile() {
    let x = document.getElementById("myFile");
    let txt = "";
    if ("files" in x) {
        if (x.files.length == 0) {
            txt = "Select one or more files.";
        } else {
            for (let i = 0; i < x.files.length; i++) {
                txt += "<br><strong>" + (i+1) + ". file</strong><br>";
                let file = x.files[i];
                if ("name" in file) {
                    txt += "name: " + file.name + "<br>";
                }
                if ('size' in file) {
                    txt += "size: " + file.size + " bytes <br>";
                }
            }
            romfile = x.files[0];
        }
    }
    document.getElementById("demo").innerHTML = txt; 
    
}

function setup() {
    createCanvas(640, 320);
    setupGraphics();
    myChip8 = new chip8();
    myChip8.load();
}

function setupGraphics() {
    background(220);
    textAlign(CENTER, CENTER);

    
}

function draw() {
    myChip8.emulateCycle();

    if (drawFlag) {
        drawFlag = false;

        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 64; x++) {
                let xpos = x * 10;
                let ypos = y * 10;
    
                let index = (y * 64) + x;
    
                if (gfx[index] == 1) {
                    fill(255);
                } else {
                    fill(0);
                }
                //fill(index / (x + y));
                //stroke(0);
                noStroke();
                rect(xpos, ypos, 10, 10);
            }
        }
    }
    //console.log(frameRate());
}

function inside(x, y, w, h) {
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        return true;
    } else {
        return false;
    }
}

