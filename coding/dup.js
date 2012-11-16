var code = "";
var ahead = [];     // cache for scanning blocks,strings,comments
var ip = 0;
var stack = [];     // stack.push(n); n=stack.pop();
var ret = [];       // ret.push(ip); ip = ret.pop();
var vars = {};      // cells and pointers, contains 'a'..'z' and 0..
var ini = 0;        // index into input

// space is cheap, only have cell addressing, char == cell
//  i.e. mandate the JavaScript side effect:  0: 3;
//  a-z are disjoint, only non-negative indices supported
//  up to user to track here  (e.g. use h):
//    h;$"string"h:{str}
//    create: {var}h;\:
//    comma: {d}h;: h;1+h:
//    allot: {n}h;+h:
//
// string:
//  {addr}"string"{addr+len}  lays down a string at given address
//    so string mode parse(c) { var i=stack.pop(); vars[i] = c; stack.push(++i) }
//  store uncounted:
//   {base}$"string"^-{str len}
//  store counted:
//   {base}$1+"string"{base end}^-1-\:
//  count: {cstr}$1+\;{str len}
//  type:  {str len}[$][\$;,1+\1-]#%%
//  type:  {str end}\[^^>][$;,1+]#%%
//
// array:
//  set {d a i}+:
//  get   {a i}+;{d}

// TODO: since = isn't needed  (=[t][f]? same as -[f][t]?)
//  use = for enhanced variables
//  1234=z
//  z  {1234}
//  [block]=f
//  f!  {execute block}

Array.prototype.pick = function(n) { return this[this.length-n-1] }

function encode(s) {
    var e = s.replace(/&/g, "&amp;");
        e = e.replace(/</g, "&lt;");
        e = e.replace(/>/g, "&gt;");
        e = e.replace(/ /g, "&nbsp;");
    return  e.replace(/\n/g, "<br>");
}
function dump() {
    var s = "";
    for (var p in vars)
        s += p + '=' + vars[p] + ' ';
    // document.getElementById("vars").value = s;
    console.log( "vars: " + s );
    // document.getElementById("stack").value = stack.join();
    console.log( "stack: " + stack.join() );
    s = [];
    for (var i=0; i<ret.length; ++i) {
        if (ret[i]>=0 && ret[i]<code.length)
            s.push(ret[i] + code.charAt(ret[i]));
        else
            s.push(ret[i]);
    }
    // document.getElementById("ret").value = s.join();
    console.log( "ret: " + s.join() );
    
    // document.getElementById("code").innerHTML
    //     = encode(code.substring(0,ip))
    //         + '<span style="background: pink">'
    //         + encode(code.charAt(ip))
    //         + "</span>"
    //         + encode(code.substring(ip+1));
}

function seek(c) {
    if (!ahead[ip])
        ahead[ip] = ip + code.substring(ip).indexOf(c);
    return ahead[ip];
}
var braces = {
    "{":function() { return seek("}") },
    '"':function() { ++ip; return seek('"') },
    "'":function() { return ip+1 },
    "[":matching_brace
}
function matching_brace() {
    var start = ip;
    if (!ahead[start]) {
        while (ip < code.length) {
            var c = code.charAt(++ip);
            if (c == ']')
                break;
            if (braces[c])
                ip = braces[c]();
        }
        ahead[start] = ip;
    }
    return ahead[start];
}

function put(s) {
    // var text = document.getElementById("output").innerHTML + s;
    var text = s;
    text = text.replace(/\n/g,"<br>").replace(/ /g,"&nbsp;");
    // document.getElementById("output").innerHTML = text;
    console.log( text );
}
function getc() { 
    // var s = document.getElementById("input").value;
    var s = "";
    return ini < s.length ? s.charCodeAt(ini++) : -1;
}

var commands = {
    "%":function() { stack.pop() },
    "$":function() { stack.push(stack.pick(0)) },
    "^":function() { stack.push(stack.pick(1)) },           // DUP:  over
    "\\":function() { var t=stack.length-2; stack.splice(t,2,stack[t+1],stack[t]) },
    "@":function() { var t=stack.length-3; stack.splice(t,3,stack[t+1],stack[t+2],stack[t]) },
    "\xF8":function() { stack.push(stack.pick(stack.pop())) },  // "ø" pick
    "(":function() { ret.push(stack.pop()) },           // DUP:  >r
    ")":function() { stack.push(ret.pop()) },           // DUP:  r>
    
    "+":function() { stack.push(stack.pop()+stack.pop()) },
    "-":function() { stack.push(-stack.pop()+stack.pop()) },
    "*":function() { stack.push(stack.pop()*stack.pop()) },
    "/":function() {                        // DUP:  /mod
        var d = stack.pop(), n = stack.pop(), r = n/d;
        stack.push(n%d, r<0?Math.ceil(r):Math.floor(r));
    },
    "_":function() { stack.push(-stack.pop()) },

    "«":function() { var s=stack.pop(); stack.push(stack.pop()<<s) },   // DUP: lshift
    "»":function() { var s=stack.pop(); stack.push(stack.pop()>>>s) },  // DUP: rshift
    "&":function() { stack.push(stack.pop()&stack.pop()) },
    "|":function() { stack.push(stack.pop()^stack.pop()) },     // DUP: xor
    "~":function() { stack.push(~stack.pop()) },

    "<":function() { stack.push(-(stack.pop()>stack.pop())) },  // DUP: less than
    "=":function() { stack.push(-(stack.pop()==stack.pop())) },
    ">":function() { stack.push(-(stack.pop()<stack.pop())) },
    
    "{":function() { ip = seek("}") },
    "'":function() { stack.push(code.charCodeAt(++ip)) },
    '"':function() {                        // DUP: string store
        for (var i=stack.pop(); code.charAt(++ip) != '"'; ++i)
            vars[i] = code.charCodeAt(ip);
        stack.push(i);
    },
    ".":function() { put(stack.pop()) },
    ",":function() { put(String.fromCharCode(stack.pop())) },
    "`":function() { stack.push(getc()) },              // DUP: was ^ in FALSE
    "\xDF":function() {},  // "ß" flush (noop)

    //"=":function() { vars[code.charAt(++ip)] = stack.pop() }, // experiment: values instead of variables
    ":":function() { vars[stack.pop()] = stack.pop() },
    ";":function() { stack.push( vars[stack.pop()] ) },

    "[":function() { stack.push(ip); ip = matching_brace(); },
    "]":function() {
        var n = ret.length-3;
        if (n>=0 && code.charAt(ret[n]) == '#') {
            if (stack.pop()) {
                ret.push(ret[n+1], ret[n+2]);   // continue loop
            } else {
                ret.pop(); ret.pop();       // exit loop
            }
        };
        ip = ret.pop();
    },
    "!":function() { ret.push(ip); ip = stack.pop(); },
    "?":function() {                        // DUP: was just if-true in FALSE
        var f = stack.pop(), t = stack.pop();
        ret.push(ip); ip = stack.pop() ? t : f ;
    },
    "#":function() {
        ret.push(ip, stack.pick(1), stack.pop());  // ip, test, body
        // ip points to #, signals that we're doing a loop
        ip = stack.pop();        // execute test first
    },
    "⇒": function() {               // DUP: operator defining operator
        var op = stack.pop();
        commands[code.charAt(++ip)] = function() { ret.push(ip); ip = op; }
    }
}

function eval() {
    var c = code.charAt(ip);
    if (commands[c]) {
        commands[c]();
    } else
    if (/\d/.test(c)) {
        var sn = code.substring(ip);
        var num = sn.match(/\d+/)[0];
        stack.push(parseInt(num,10));
        ip += num.length;
        return;
    } else
    if (/\s/.test(c)) {
        var sn = code.substring(ip);
        var sp = sn.match(/\s+/)[0];
        ip += sp.length;
        return;
    } else
        stack.push(c);      // allows any non-number/operator as a variable; Unicode is your oyster!
        //stack.push(vars[c]);  // experiment: values instead of variables
    //else  alert("Bad char '" + c + "': " + code.charCodeAt(ip));
    ++ip;
}

function init() {
    ahead = [];
    ip = 0; ret=[]; stack=[]; vars={}; ini=0;
    
    // document.getElementById("output").innerHTML = "";
    dump();
}
function format(id) {
    //var el = document.getElementById(id);
    // code = el.value || el.textContent || el.innerText;
    init();
    //window.scroll(0,document.getElementById("code").offsetTop);
}

function step() {
    if (ip >= code.length) init(); else eval();
    dump();
}

function over() {
    var d = ret.length;
    do { eval() } while (d < ret.length);
    dump();
}

function up() {
    var d = ret.length;
    do { eval() } while (d <= ret.length);
    dump();
}

//TODO: slow(), runs on timer events so it is interruptable

function run() {
    //var start = new Date();
    if (ip >= code.length)
        init();
    while (ip < code.length)
        eval();
    //var elapsed = (new Date()).getTime() - start.getTime();
    dump();
    //alert("Elapsed time: " + elapsed + " ms");
}

//TODO: recode contact in DUP

function contact() {
    document.getElementById("src").value =
        '"moc.retskriuq@onai"'.split('').reverse().join('');
    format("src");run();
}