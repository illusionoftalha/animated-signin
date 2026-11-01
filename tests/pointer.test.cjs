const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

test('pointer bursts use one geometry read and the latest viewport coordinates per frame', () => {
    const frames = [], values = [];
    let reads = 0, mousemove, click;
    const input = {type:'password', focus() {this.focused=true;}};
    const nodes = {
        beam:{getBoundingClientRect() {reads++; return {right:20,width:10,top:10,height:10};}},
        eyeball:{addEventListener(name, fn) {click=fn;}}, password:input
    };
    const context = {
        document: {
            documentElement:{addEventListener(name, fn) {mousemove=fn;}, style:{setProperty(k,v) {values.push(v);}}},
            getElementById:id=>nodes[id], body:{classList:{toggle(){}}}
        },
        requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}
    };
    vm.runInNewContext(fs.readFileSync(require.resolve('../script.js'),'utf8'), context);
    for(let i=0;i<100;i++) mousemove({clientX:i,clientY:i+10,pageX:i+500,pageY:i+510});
    assert.equal(frames.length,1);
    assert.equal(reads,0);
    frames.shift()();
    assert.equal(reads,1);
    assert.deepEqual(values,[`${Math.atan2(25-99,15-109)*(20/Math.PI)*-1-350}deg`]);
    mousemove({clientX:0,clientY:0});
    frames.shift()();
    assert.equal(reads,2);
    click({preventDefault(){}});
    assert.equal(input.type,'text');
    assert.equal(input.focused,true);
});
