if(!require(Rexperigen)){
    install.packages("Rexperigen")
    library(Rexperigen)
}

## The Experigen server you're using 
experigen.database <- "http://db.phonologist.org/"

setExperigenServer(experigen.database)

## where your experiment is hosted
## removing initial "http://" and tildes
## and substituting slashes, etc. with periods
## no hyphens/dashes, alas (known bug)
##
## With the newer server version (>=2), the server
## can help cleaning the URL
experigen.sourceURL <-
    ifelse(versionMain() < 2,
           "www.awesomeuniversity.edu.iamawesome.questionnaire",
           cleanURL("http://www.awesomeuniversity.edu/~iamawesome/questionnaire")
           )

## the following information comes from your settings.js file:
experigen.experimentName <- "Default"

## first, send some info to the server with the current 
## sourceURL and experimentName by submitting at least one screen
## to the server.
## otherwise, the server will return an error message

## check for usage of the experiment (number of page views per participant)
experigen.users <- getUsers(experigen.sourceURL, experigen.experimentName)


## read the experimental results from the server
xp <- downloadExperiment(experigen.sourceURL, experigen.experimentName)
xp$time = as.POSIXct(strptime(as.character(xp$time), "%a %b %d %H:%M:%S %Y"))
meta  <- downloadExperiment(experigen.sourceURL, experigen.experimentName, "demographics.csv")
meta$time = as.POSIXct(strptime(as.character(meta$time), "%a %b %d %H:%M:%S %Y"))

## assuming all went well, write to disk
## so that the results are saved even after the database server is gone
## it would be unwise not to keep a local copy of your results
write.csv(xp, "xp.csv")
write.csv(meta, "meta.csv")

## optional cleanup: remove all variables that begin with "experigen."
rm(list=ls(pattern="^experigen."))
