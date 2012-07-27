
from kinet import *
from sys import stdin
from string import split

def rainbow_cycle(pds, pause=.1, steps=1000):
    div = steps / len(pds)
    for step in range(steps):
        ratio = 0
        for idx, fixture in enumerate(pds):
            ratio += (step + idx * div) % steps / float(steps)
            fixture.hsv = (ratio, 1.0, 1.0)
        print pds
        pds.go()
        time.sleep(pause)
        
# example of how to use the FadeIter
def fader(pds1, cnt):
    pds2 = pds1.copy()
    while cnt:
        pds1[random.randint(0, 2)][random.randint(0, 2)] = random.randint(0, 255)
        pds2[random.randint(0, 2)][random.randint(0, 2)] = random.randint(0, 255)
        print "%s => %s" % (pds1, pds2)
        fi1 = FadeIter(pds1, pds2, .5)
        fi2 = FadeIter(pds2, pds1, .5)
        fi1.go()
        fi2.go()
        pds1.clear()
        pds2.clear()
        cnt -= 1
        
def sendAllRGB(pds, r, g, b):
    for idx, fixture in enumerate(pds):
		fixture.rgb = (int(r), int(g), int(b))
    pds.go()

def sendAllHSV(pds, h, s, v):
	for idx, fixture in enumerate(pds):
		fixture.hsv = (float(h), float(s), float(v))
	pds.go()

if __name__ == '__main__':
    # Our ethernet attached power supply.
    pds = PowerSupply("192.168.1.20")
	
    # Our light fixtures
    for ii in range(120):
        pds.append(FixtureRGB(ii*3))
    
    while 1:
        try:
            line = stdin.readline()
        except KeyboardInterrupt:
			break
        if not line:
			break
        args = split(line)
        #print line
        if args[0] == "g":
	   		pds.go()
        elif args[0] == "*":
			if args[1] == "RGB":
				print "Sending RGB data: %s,%s,%s" % (args[2], args[3], args[4])
				sendAllRGB(pds,args[2],args[3],args[4])
			if args[1] == "HSV":
				print "Sending HSV data: %s,%s,%s" % (args[2], args[3], args[4])
				sendAllHSV(pds,args[2],args[3],args[4])
        else:
			index = int(args[0])
			if args[1] == "RGB" and index < len(pds):
				pds[index].rgb = (int(args[2]), int(args[3]), int(args[4]))
			if args[1] == "HSV":
				pds[index].hsv = (float(args[2]), float(args[3]), float(args[4]))
			
