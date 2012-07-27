var spawn = require('child_process').spawn,
    kinet = spawn('/usr/bin/python', ['osc-kinet.py']);

    kinet.stdout.on('data', function (data) {
        console.log('KINET: ' + data);
    });

    kinet.stderr.on('data', function (data) {
        console.log('KINET ERROR: ' + data);
    });
 
var t = 0;
var numCycles = 0;
var useNetworkTime = true;

var dgram = require("dgram"),
    server = dgram.createSocket("udp4");

server.on("message", function (msg, rinfo) {
    if (useNetworkTime) {
        var args = msg.toString().trim().split(":");
        //numCycles = args[0];
        //t = args[1];
        if (args[1] == 0) {
            numCycles++;
            t = 0;
            console.log("C=" + numCycles + " f=" + t);
        }
    }
});

server.on("listening", function () {
    var address = server.address();
    console.log("server listening " +
        address.address + ":" + address.port);
});

server.bind(1138);

setInterval(
    function() {
        pushUpdate();
        if (useNetworkTime) {
            t++;
        } else {
            if (t == 5759) { 
                numCycles++; 
            }
            t = (t + 1) % 5760;
        }
    },
    41 // 41ms ~= 24fps
);

var numdevices = 120;

var lightStates = new Array(numdevices);
for (var ii=0; ii<numdevices; ii++) {
    lightStates[ii] = { r: 0.0, g: 0.0, b: 0.0, freq: 0, lastevent: Date.now() };
}

function pushUpdate()
{
    animate();
    
    for (var light=0; light < numdevices; light++) {
            sendtoKinet(light, "RGB", lightStates[light].r, 
                                      lightStates[light].g, 
                                      lightStates[light].b);            
    }
    goKinet();
}

function sendtoKinet(addr, str, x, y, z)
{
    if (isNaN(addr) || !(str == "RGB" || str == "HSV")) {
       return;
    }

    x = (isNaN(x) ? 0 : x);
    y = (isNaN(y) ? 0 : y);
    z = (isNaN(z) ? 0 : z);
    var out = addr + " " + 
              str + " " + 
              Math.floor(x) + " " +
              Math.floor(y) + " " +
              Math.floor(z) + "\n"; 
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

// animate function modified from simulator

function animate() 
{    
    // animate physical motion
    for(var i=1; i<16; i++)
    {
      angles[i] = 30 * Math.cos(2*Math.PI*(t/24.0)/periods[i-1]);
    }
       
    updateGroups();
       
    // animate lights
    groupcolors = [[255,0,0], [0,0,255], [0,255,0], [255,0,255], [0,255,255], [255,255,0], [255,128,0], [128,0, 255]];
    for (pendulum in sculpture) {
        sculpture[pendulum] = sweep(getgroupcolor(pendulum, groupcolors));
        for (ii=0;ii<8;ii++) {
           lightStates[(pendulum-1)*8+ii].r = sculpture[pendulum][ii][0];
           lightStates[(pendulum-1)*8+ii].g = sculpture[pendulum][ii][1];
           lightStates[(pendulum-1)*8+ii].b = sculpture[pendulum][ii][2];
        }
    }   
       
}

// Pendulum code cut-and-pasted from simulator 
var angles = [];

var sculpture = { };

var periods = [
4.800000,
4.705882,
4.615385,
4.528302,
4.444444,
4.363636,
4.285714,
4.210526,
4.137931,
4.067797,
4.000000,
3.934426,
3.870968,
3.809524,
3.750000,
];

var lengths = [
5.7252,
5.5029,
5.2933,
5.0954,
4.9084,
4.7316,
4.5641,
4.4054,
4.2548,
4.1118,
3.9758,
3.8466,
3.7235,
3.6062,
3.4944,
];

for(var i=0; i<15; i++)
{
   var p = {};
   for (var j=0; j<8; j++)
   {
      p[j] = [0,0,0];
   }
   sculpture[i+1] = p;
   angles[i+1] = 30;
}


var group = [[],[],[],[],[],[]];
var indextogroup = [];

//var group_keyframes = {
//  0:    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
//  959:  [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3],
//  1151: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
//  1440: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
//  1919: [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
//  2303: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
//  2879: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
//  3455: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
//  3839: [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
//  4319: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],  
//  4607: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
//  4799: [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3],
//  5759: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
//};

var group_keyframes = {
  0:    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  959:  [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4],
  1151: [8, 9, 10, 11, 12, 8, 9, 10, 11, 12, 8, 9, 10, 11, 12],
  1440: [13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15],
  1919: [17, 18, 19, 17, 18, 19, 17, 18, 19, 17, 18, 19, 17, 18, 19],
  2303: [8, 9, 10, 11, 12, 8, 9, 10, 11, 12, 8, 9, 10, 11, 12],
  2879: [20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20],
  3455: [8, 9, 10, 11, 12, 8, 9, 10, 11, 12, 8, 9, 10, 11, 12],
  3839: [17, 18, 19, 17, 18, 19, 17, 18, 19, 17, 18, 19, 17, 18, 19],
  4319: [13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15],  
  4607: [8, 9, 10, 11, 12, 8, 9, 10, 11, 12, 8, 9, 10, 11, 12],
  4799: [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4],
  5759: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};
  
function updateGroups()
{
  group = {1:[],2:[],3:[],4:[],5:[],6:[]};

  if (t < 600 || t >= 5250) { // 0, 5759
     group[1] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
     indextogroup = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  } else if ((t >= 600 && t < 1250) || (t >= 3150 && t < 3700) || (t >= 4450 && t < 5250)) { // 1145, 3475, 4600
     group[1] = [1,  6, 11];
     group[2] = [2,  7, 12];
     group[3] = [3,  8, 13];
     group[4] = [4,  9, 14];
     group[5] = [5, 10, 15];
     indextogroup = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5];     
   } else if ((t >= 1250 && t < 1650) || (t >= 4000 && t < 4450)) { // 1400, 4300
     group[1] = [1,  5,  9, 13];
     group[2] = [2,  6, 10, 14];
     group[3] = [3,  7, 11, 15];
     group[4] = [4,  8, 12];
     indextogroup = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3];     
   } else if ((t >= 1650 && t < 2400) || (t >= 3700 && t < 4000)) { // 1900, 3850
     group[1] = [1,  4,  7, 10, 13];
     group[2] = [2,  5,  8, 11, 14];
     group[3] = [3,  6,  9, 12, 15];
     indextogroup = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];     
   } else if (t >= 2400 && t < 3150) { // 2900
     group[1] = [1,  3,  5,  7,  9, 11, 13, 15];
     group[2] = [2,  4,  6,  8, 10, 12, 14];
     indextogroup = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1];
  }   
  else 
  {
     console.log("Unexpected group result for time " + t);
     group[2] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
     indextogroup = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
  }
}

function circular_hue_lerp(h1, h2, s)
{
   if (Math.abs(h2 - h1) <= 0.5) {
      return h1 + s*(h2 - h1);
   } else if (h1 < h2) {
      return (h1+1 - s*(h1+1 - h2)) % 1.0;
   } else {
      return (h1 + s*(h2+1 - h1)) % 1.0;
   }
}

function s_curve(s)
{
  return -2*Math.pow(s,3) + 3*Math.pow(s,2);
}

function hsv_interpolate(c1, c2, s)
{
   var hsv1 = rgbToHsv(c1[0], c1[1], c1[2]);
   var hsv2 = rgbToHsv(c2[0], c2[1], c2[2]);

   var oh = [ circular_hue_lerp(hsv1[0], hsv2[0], s_curve(s)),
              hsv1[1] + s*(hsv2[1] - hsv1[1]),
              hsv1[2] + s*(hsv2[2] - hsv1[2]) ];

   return hsvToRgb(oh[0], oh[1], oh[2]); 
}

function getgroupcolor(index, groupcolors)
{
   var prev_t, next_t;
   var prev_color = [0,0,0], next_color = [0,0,0];
   for (key in group_keyframes)
   {
      var group = group_keyframes[key][index-1] - 1;

      if (key < t || key == 0 && t == 0) 
      {
         prev_t = key;
         prev_color = groupcolors[(group + numCycles*21) % groupcolors.length];
      }
      if (key >= t && key > 0)
      {
         next_t = key;
         next_color = groupcolors[(group + numCycles*21) % groupcolors.length];
         break;
      }
   }

   var s = (t - prev_t)/(next_t - prev_t);
   return hsv_interpolate(prev_color, next_color, s);
}

function solid(c) { return [c,c,c,c,c,c,c,c];}

function sweep(startcolor, endcolor, period)
{
   if (period == null) { period = 40; }
   if (endcolor == null) {
      var h = rgbToHsv(startcolor[0], startcolor[1], startcolor[2]);
      h[2] *= 0.3;
      endcolor = hsvToRgb(h[0], h[1], h[2]);  
   }
   
   var lights = [];
   for (var light=0; light<8; light++) {
     var k = ((parseInt(light) + 1 + (t*1.5%period)/5.0) % 8)/8.0; 
     lights[light] = [startcolor[0] + (endcolor[0]-startcolor[0])*k,
                      startcolor[1] + (endcolor[1]-startcolor[1])*k,
                      startcolor[2] + (endcolor[2]-startcolor[2])*k]
   }
   return lights;
}

function stripe(color1, color2, period)
{
   if (period == null) { period = 16; }
   if (color2 == null) {
      var h = rgbToHsv(color1[0], color1[1], color1[2]);
      h[2] *= 0.4;
      color2 = hsvToRgb(h[0], h[1], h[2]);  
   }

   var lights = [];
   for (var light=0; light<8; light++) {
      lights[light] = (light%2 == ((t%period>8)?0:1)) ? color1 : color2;
   }
   return lights;
}

// source: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

