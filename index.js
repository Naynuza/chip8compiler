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