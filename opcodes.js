let opcodes = {
    // 00E0
    /**
     * Clears the screen
     */
    clear() {
        return 0x00E0;
    },

    // 00EE
    /**
     * Return from subroutine
     */
    ret() {
        return 0x00EE;
    },

    // 1nnn
    /**
     * Jump to address
     * @param {Number} addr 
     */
    jump(addr) {
        return parseInt("0x1" + pad(addr, 3));
    },

    // 2nnn
    /**
     * Call subroutine
     * @param {Number} addr 
     */
    call(addr) {
        return parseInt("0x2" + pad(addr, 3));
    },

    // 3xkk
    /**
     * Skip next instruction if Vx = byte
     * @param {Number} Vx 
     * @param {Number} byte 
     */
    se_byte(Vx, byte) {
        return parseInt("0x3" + Vx + pad(byte, 2));
    },

    // 4xkk
    /**
     * Skip next instruction if Vx != byte
     * @param {Number} Vx 
     * @param {Number} byte 
     */
    sne_byte(Vx, byte) {
        return parseInt("0x4" + Vx + pad(byte, 2));
    },

    // 5xy0
    /**
     * Skip next instruction if Vx = Vy
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    se_var(Vx, Vy) {
        return parseInt("0x5" + Vx + Vy + "0");
    },

    // 6xkk
    /**
     * Put value byte into Vx
     * @param {Number} Vx 
     * @param {Number} byte 
     */
    load_byte(Vx, byte) {
        return parseInt("0x6" + Vx + pad(byte, 2));
    },

    // 7xkk
    /**
     * Adds byte to the value of register Vx, stores into Vx
     * @param {Number} Vx 
     * @param {Number} byte 
     */
    add_byte(Vx, byte) {
        return parseInt("0x7" + Vx + pad(byte, 2));
    },

    // 8xy0
    /**
     * Put value at Vy into Vx
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    load_var(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "0");
    },

    // 8xy1
    /**
     * Set Vx to the result of Vx OR Vy
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    or(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "1");
    },

    // 8xy2
    /**
     * Set Vx to the result of Vx AND Vy
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    and(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "2");
    },

    // 8xy3
    /**
     * Set Vx to the result of Vx XOR Vy
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    xor(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "3");
    },

    // 8xy4
    /**
     * Set Vx to the result of Vx + Vy
     * If result is greater than 8 bits (> 255), VF is set to 1, otherwise 0
     * Lowest 8 bits are kept and stored in Vx
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    add_var(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "4");
    },

    // 8xy5
    /**
     * Set Vx to the result of Vx - Vy
     * If Vx > Vy, VF is set to 1, otherwise 0
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    sub_var(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "5");
    },

    // 8xy6
    /**
     * Set Vx to the result of Vx SHR 1
     * If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0
     * Then Vx is divided by 2
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    shift_right(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "6");
    },

    // 8xy7
    /**
     * Set Vx to the result of Vy - Vx
     * If Vy > Vx, VF is set to 1, otherwise 0
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    sub_inverse_var(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "7");
    },

    // 8xyE
    /**
     * Set Vx to the result of Vx SHL 1
     * If the most-significant bit of Vx is 1, then VF is set to 1, otherwise 0
     * Then Vx is multiplied by 2
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    shift_left(Vx, Vy) {
        return parseInt("0x8" + Vx + Vy + "E");
    },

    // 9xy0
    /**
     * Skip next instruction if Vx != Vy
     * @param {Number} Vx 
     * @param {Number} Vy 
     */
    sne_var(Vx, Vy) {
        return parseInt("0x9" + Vx + Vy + "0");
    },

    // Annn
    /**
     * Set the value of register I to addr
     * @param {Number} addr 
     */
    load_I(addr) {
        return parseInt("0xA" + pad(addr, 3));
    },

    // Bnnn
    /**
     * Jump to location at addr plus value of V0
     * @param {Number} addr 
     */
    jump_offset(addr) {
        return parseInt("0xB" + pad(addr, 3));
    },

    // Cxkk
    /**
     * Set Vx to the result of random byte AND kk (byte)
     * @param {Number} Vx 
     * @param {Number} byte 
     */
    random_and(Vx, byte) {
        return parseInt("0xC" + Vx + pad(byte, 2));
    },

    // Dxyn
    /**
     * Display n-byte sprite starting at memory location I at display coordinates (Vx, Vy), set VF = collision
     * @param {Number} Vx 
     * @param {Number} Vy 
     * @param {Number} nibble 
     */
    draw_sprite(Vx, Vy, nibble) {
        return parseInt("0xD" + Vx + Vy + nibble);
    },

    // Ex9E
    /**
     * Skip next instruction if key with the value of Vx is pressed
     * @param {Number} Vx 
     */
    skip_keydown(Vx) {
        return parseInt("0xE" + Vx + "9E");
    },

    // ExA1
    /**
     * Skip next instruction if key with the value of Vx is not pressed
     * @param {Number} Vx 
     */
    skip_keyup(Vx) {
        return parseInt("0xE" + Vx + "A1");
    },

    // Fx07
    /**
     * Set Vx to the delay timer value
     * @param {Number} Vx 
     */
    load_delay(Vx) {
        return parseInt("0xF" + Vx + "07");
    },

    // Fx0A
    /**
     * Wait for a keypress, store the value of the key in Vx
     * @param {Number} Vx 
     */
    load_key(Vx) {
        return parseInt("0xF" + Vx + "0A");
    },

    // Fx15
    /**
     * Set the delay timer to Vx
     * @param {Number} Vx 
     */
    load_register_delay(Vx) {
        return parseInt("0xF" + Vx + "15");
    },

    // Fx18
    /**
     * Set the sound timer to Vx
     * @param {Number} Vx 
     */
    load_register_sound(Vx) {
        return parseInt("0xF" + Vx + "18");
    },

    // Fx1E
    /**
     * Set I to the result of I + Vx
     * @param {Number} Vx 
     */
    add_I(Vx) {
        return parseInt("0xF" + Vx + "1E");
    },

    // Fx29
    /**
     * Set I to the location of sprite for digit Vx
     * @param {Number} Vx 
     */
    load_sprite_I(Vx) {
        return parseInt("0xF" + Vx + "29");
    },

    // Fx33
    /**
     * Store BCD representation of Vx in memory locations I, I+1, I+2
     * @param {Number} Vx 
     */
    load_BCD(Vx) {
        return parseInt("0xF" + Vx + "33");
    },

    // Fx55
    /**
     * Store registers V0 through Vx in memory starting at location I
     * @param {Number} Vx 
     */
    load_reg_to_mem(Vx) {
        return parseInt("0xF" + Vx + "55");
    },

    // Fx65
    /**
     * Read registers V0 through Vx from memory starting at location I
     * @param {Number} Vx 
     */
    load_reg_from_mem(Vx) {
        return parseInt("0xF" + Vx + "65");
    }
}


function pad(num, length) {
    let str = "" + num;
    let pad = "";
    for (let i = 0; i < length; i++) {
        pad += "0"
    }
    return pad.substring(0, pad.length - str.length) + str;
}