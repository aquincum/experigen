#!/usr/bin/python2.7

import amtlib


def main(): 
    parser = amtlib.initOptParse()

    (options, args) = parser.parse_args()

    successfn = "%s.success" % options.filename
    outputfn = "%s.results" % options.filename


    callargs = ["-successfile",
                successfn,
                "-outputfile",
                outputfn]
    
    amtlib.makeCall("getResults", callargs, options)

if __name__ == "__main__":
    main()
