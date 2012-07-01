var osc   = require('osc'),
    spawn = require('child_process').spawn,
    kinet = spawn('/usr/bin/python', ['osc-kinet.py']),
    ether = spawn('/usr/bin/sh', ['ifconfig eth0 10.0.0.1']);

kinet.stdout.on('data', function (data) {
    console.log('KINET: ' + data);
});

kinet.stderr.on('data', function (data) {
    console.log('KINET ERROR: ' + data);
});

ether.stdout.on('data', function (data) {
    console.log('IFCONFIG: ' + data);
});

var numdevices = 12;

var lightStates = new Array(numdevices);
for (var ii=0; ii<numdevices; ii++) {
    lightStates[ii] = { h: 0.0, s: 0.0, v: 0.0, freq: 0, lastevent: Date.now() };
}

setRing(0, "h", 1.0);
setRing(0, "s", 1.0);
setRing(0, "v", 1.0);

setRing(1, "h", 0.75);
setRing(1, "s", 1.0);
setRing(1, "v", 1.0);
setRing(1, "freq", 2000);

setRing(2, "h", 0.4);
setRing(2, "s", 1.0);
setRing(2, "v", 1.0);
setRing(2, "freq", 250);

pushUpdate();

var oscServer = new osc.Server(3333, 'localhost');
oscServer.on("message", function (msg, rinfo) {
    console.log(msg);
    console.log(rinfo);
  
    var change = false;
    
    var addrpath = msg[0].split('/');
  
    if (addrpath[0] == 'ring') {
        change = true;
        setRing(addrpath[1], addrpath[2], msg[1]);
    } else if (addrpath[0] == 'quad') {
        change = true;
        setQuad(addrpath[1], addrpath[2], msg[1]);
    }
    
    //if (change) {
    //    pushUpdate();
    //}

});

setInterval(function(){ pushUpdate(); }, 10);

function pushUpdate()
{
    var now = Date.now();
    for (var light=0; light < numdevices; light++) {
        if (lightIsOn(light, now)) {
            sendtoKinet(light, "HSV", lightStates[light].h, 
                                      lightStates[light].s, 
                                      lightStates[light].v);
        } else {
            sendtoKinet(light, "HSV", 0, 
                                      0, 
                                      0);
        }            
    }
    goKinet();
}

function lightIsOn(light, now) {
    var f = lightStates[light].freq;
    if (f === 0) { 
        return true;
    }
    var elapsed = now - lightStates[light].lastevent;
    if (elapsed < f/2.0) {
        return false;
    } else if (elapsed > f) {
        lightStates[light].lastevent = now;
        return true;
    } else {
        return true;
    }
}    
function setRing(ringNum, prop, val) {
    var ids = { 0: [1, 5, 8, 11],
                1: [2, 4, 7, 10],
                2: [3, 6, 9, 12] };
    var ring = ids[ringNum];
    for (var ii=0; ii<4; ii++)
    {
        lightStates[ring[ii]-1][prop] = val;
    }
}

function setQuad(quadNum, prop, val) {
    var ids = { 0: [1, 2, 3],
                1: [4, 5, 6],
                2: [7, 8, 9],
                3: [10, 11, 12]};
    var quad = ids[quadNum];
    for (var ii=0; ii<3; ii++)
    {
        lightStates[quad[ii]-1][prop] = val;
    }
}

function sendtoKinet(addr, str, x, y, z)
{
    var out = addr + " " + str + " " + x + " " + y + " " + z + "\n";
    //console.log( "Sending >> " + out);
    try {
        kinet.stdin.write(out);
    }
    catch (e) {
        console.log( "Couldn't transmit to Kinet! " + e.message);
    }
}

function goKinet()
{
    //console.log( "Sending go()" );
    kinet.stdin.write("g\n");
}
