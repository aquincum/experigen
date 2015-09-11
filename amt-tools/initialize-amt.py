#!/usr/bin/python2.7

import optparse
import subprocess
import os
import os.path
import amtlib


def main(): 
    parser = amtlib.initOptParse()

    (options, args) = parser.parse_args()

    inputfn = "%s.input" % options.filename
    questionfn = "%s.question" % options.filename
    propertiesfn = "%s.properties" % options.filename


    amtlib.testFile(inputfn)
    amtlib.testFile(questionfn)
    amtlib.testFile(propertiesfn)
    
    callargs = ["-input",
                inputfn,
                "-question",
                questionfn,
                "-properties",
                propertiesfn,
                "-label",
                options.filename]
    
    amtlib.makeCall("loadHITs", callargs, options)

if __name__ == "__main__":
    main()
