# where your experiment is hosted
experigen.sourceURL = "www.awesomeuniversity.edu.iamawesome.questionnaire"
# this information comes from your settings.js file
experigen.experimentName = "Default"
experigen.database = "http://db.phonologist.org/"

# read the experimental results from the server
experigen.url  =  paste(experigen.database, "makecsv.cgi?experimentName=", experigen.experimentName, "&sourceurl=", experigen.sourceURL, sep="")
exp  = read.csv(experigen.url, sep="\t")
exp$time = as.POSIXct(strptime(as.character(exp$time), "%a %b %d %H:%M:%S %Y"))
meta = read.csv(paste(experigen.url, "&file=demographics.csv", sep=""), sep="\t")
meta$time = as.POSIXct(strptime(as.character(meta$time), "%a %b %d %H:%M:%S %Y"))

# assuming all went well, write to disk
# so that the results are saved even after the database server is gone
write.csv(exp, "exp.csv")
write.csv(meta, "meta.csv")