#!/usr/bin/python2.7

import optparse
import subprocess
import os, sys, os.path

class FileNotFoundError(Exception):
    def __init__(self, txt):
        self.txt = txt
    def __str__(self):
        return "File not found: %s" % self.txt

class MTurkNotFoundError(Exception):
    def __init__(self, path):
        self.path = path
    def __str__(self):
        return "MTurk command line tools not found at %s" % self.path


def testFile(fn):
    if not os.path.isfile(fn):
        raise FileNotFoundError(fn)

def findAMT(script,opts):
    if not opts.mturkpath:
        s = script
    else:
        s = "%s/%s" % (opts.mturkpath, script)

    if os.name != "nt":
        s = "%s.sh" % s
    if not os.path.isfile(s):
        raise MTurkNotFoundError(s)
    return s


def initOptParse():
    parser = optparse.OptionParser()
    parser.add_option("-m", "--mturk-path", action="store", type="string", dest="mturkpath", help="path to the AMT Command Line Tools")
    parser.add_option("-s", "--sandbox", action="store_true", dest="sandbox", help="is the HIT in sandbox mode")
    parser.add_option("-f", "--filename", action="store", dest="filename", default="amtsurvey", help="root of the properties, input and question file names")
    return parser

def makeCall(script, args, opts):
    spath = findAMT(script, opts)
    call = args[:]
    call.insert(0, spath)
    if opts.sandbox:
        call.append("-sandbox")
    env = os.environ.copy()
    if os.name == "posix":
        env["JAVA_HOME"] = "/usr/"
    process = subprocess.Popen(call, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    while True:
        out = process.stdout.read(1)
        if out == '' and process.poll() != None:
            break
        if out != '':
            sys.stdout.write(out)
            sys.stdout.flush()
        

