var osc   = require('osc'),
    spawn = require('child_process').spawn,
    kinet = spawn('/usr/bin/python', ['osc-kinet.py']);

kinet.stdout.on('data', function (data) {
    console.log('KINET: ' + data);
});

kinet.stderr.on('data', function (data) {
    console.log('KINET ERROR: ' + data);
});

var r = 0;
var g = 0;
var b = 0;
var h = 0;
var s = 0;
var v = 0;
var numdevices = 12;
var theta = 0;
var tail = Math.PI/3.0;

var oscServer = new osc.Server(3333, 'localhost');
oscServer.on("message", function (msg, rinfo) {
    console.log(msg);
    console.log(rinfo);
  
    var updateRGB = false;
    var updateHSV = false;
  
    if (msg[0] == '/RGB') {
        updateRGB = true;
    } else if (msg[0] == '/RGB/r') {
        r = msg[1]; updateRGB = true;
    } else if (msg[0] == '/RGB/g') {
        g = msg[1]; updateRGB = true;
    } else if (msg[0] == '/RGB/b') {
        b = msg[1]; updateRGB = true;
    }
  
    if (msg[0] == '/RGB/xy/1') 
    {
        /*
        var x = msg[1] - 0.5;
        var y = msg[2] - 0.5;
  
        theta = Math.atan2(y,x) + Math.PI;
        console.log("Angle (radians): " + theta + "\n");

        for(var ii=0; ii<numdevices; ii++)
        {
            var val = 0;
            var di = ii*2*Math.PI/(1.0*numdevices);
            if (di >= theta && di < theta + tail)
                val = 1.0 - (di - theta)/(tail*1.0);
            console.log("di: " + di + " val: " + val + " tail: " + tail);

            sendtoKinet(ii, "HSV", h, 1, val);
        }
        goKinet();
        */
    }

    if (msg[0] == '/HSV') {
        updateHSV = true;
    } else if (msg[0] == '/HSV/h') {
        h = msg[1]; updateHSV = true;
    } else if (msg[0] == '/HSV/s') {
        s = msg[1]; updateHSV = true;
    } else if (msg[0] == '/HSV/v') {
	    v = msg[1]; updateHSV = true;
    }
    
    if (updateRGB === true)
    {
        sendtoKinet("*", "RGB", Math.round(255*r), Math.round(255*g), Math.round(255*b));
        //respond(rinfo, "/RGB/r", r);
        //respond(rinfo, "/RGB/g", g);
        //respond(rinfo, "/RGB/b", b);
    }
    if (updateHSV === true)
    {
        sendtoKinet("*", "HSV", h, s, v);
        //respond(rinfo, "/HSV/h", h);
        //respond(rinfo, "/HSV/s", s);
        //respond(rinfo, "/HSV/v", v);
    }
});

function sendtoKinet(addr, str, x, y, z)
{
    var out = addr + " " + str + " " + x + " " + y + " " + z + "\n";
    console.log( "Sending >> " + out);
    try {
        kinet.stdin.write(out);
    }
    catch (e) {
        console.log( "Couldn't transmit to Kinet! " + e.message);
    }
}

function goKinet()
{
    console.log( "Sending go()" );
    kinet.stdin.write("g\n");
}

function respond(rinfo, addr, msgargs)
{
    var client = new osc.Client(rinfo.address, rinfo.port);
    var message = new osc.Message(addr, msgargs[0]);
    client.send(message);
}