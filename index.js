let editor = ace.edit("editor", {
    selectionStyle: "text",
    theme: "ace/theme/monokai"
});
editor.setOptions({
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
    mergeUndoDeltas: "always"
});

let output = document.getElementById("output");

let lexer = new Tokenizr();

lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
    ctx.accept("id");
});
lexer.rule(/[+-]?[0-9]+/, (ctx, match) => {
    ctx.accept("number", parseInt(match[0]));
});
lexer.rule(/"((?:\\"|[^\r\n])*)"/, (ctx, match) => {
    ctx.accept("string", match[1].replace(/\\"/g, "\""));
});
lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx, match) => {
    ctx.ignore();
});
lexer.rule(/[ \t\r\n]+/, (ctx, match) => {
    ctx.ignore();
});
lexer.rule(/./, (ctx, match) => {
    ctx.accept("char");
});

function log() {
    let cfg = editor.getValue();
    let outstr = "";
    lexer.input(cfg);
    lexer.debug(true);
    lexer.tokens().forEach((token) => {
        outstr += (token.toString() + "\n");
    });
    output.innerText = outstr;
}

//Code below from https://stackoverflow.com/a/14603254

function parseHexString(str) {
    let result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));

        str = str.substring(2, str.length);
    }

    return result;
}

function intArrayToString(arr) {
    let result = "";
    let z;

    for (let i = 0; i < arr.length; i++) {
        let str = arr[i].toString(16);

        z = 8 - str.length + 1;
        str = Array(z).join("0") + str;

        result += str;
    }

    return result;
}

let file = new File(parseHexString("00112233445566778899aabbccddeeff"), "test")
console.log(file);

