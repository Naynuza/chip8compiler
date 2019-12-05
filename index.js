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

lexer.rule(/clear/, (ctx, match) => {
    ctx.accept("keyword");
});
lexer.rule(/call/, (ctx, match) => {
    ctx.accept("keyword");
});
lexer.rule(/return/, (ctx, match) => {
    ctx.accept("keyword");
});
lexer.rule(/skip/, (ctx, match) => {
    ctx.accept("keyword");
});
lexer.rule(/\w+/, (ctx, match) => {
    ctx.accept("identifier");
});
lexer.rule(/\d+/, (ctx, match) => {
    ctx.accept("numeric");
});
lexer.rule(/0x[\da-fA-F]/, (ctx, match) => {
    ctx.accept("numeric");
});
lexer.rule(/0x[\da-fA-F]{2}/, (ctx, match) => {
    ctx.accept("numeric");
});
lexer.rule(/\$[\da-fA-F]/, (ctx, match) => {
    ctx.accept("numeric");
});
lexer.rule(/\#/, (ctx, match) => {
    ctx.accept("operator");
});
lexer.rule(/\@/, (ctx, match) => {
    ctx.accept("operator");
});
lexer.rule(/\+/, (ctx, match) => {
    ctx.accept("operator");
});
lexer.rule(/\-/, (ctx, match) => {
    ctx.accept("operator");
});
lexer.rule(/\_/, (ctx, match) => {
    ctx.accept("operator");
});
lexer.rule(/\&/, (ctx, match) => {
    ctx.accept("operator");
});
lexer.rule(/\=/, (ctx, match) => {
    ctx.accept("operator");
});
lexer.rule(/\!/, (ctx, match) => {
    ctx.accept("operator");
});
lexer.rule(/\{/, (ctx, match) => {
    ctx.accept("separator");
});
lexer.rule(/\}/, (ctx, match) => {
    ctx.accept("separator");
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