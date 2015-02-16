#!/bin/bash

export JAVA_HOME=/usr

if [ $# -lt 1 ]
then
	AMTPATH=./
else
	AMTPATH=$1
fi
	
$AMTPATH/loadHITs.sh -input amtsurvey.input -properties amtsurvey.properties -question amtsurvey.question
