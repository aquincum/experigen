if (!require(MTurkR)){
    install.packages("MTurkR")
    library(MTurkR)
}

# set these below to your credentials and info about the HIT:
AMT.access_key = ""
AMT.secret_key = ""
AMT.url = ""
AMT.frame_height = 600
AMT.sandbox = TRUE

options('MTurkR.sandbox' = AMT.sandbox)
credentials(c(AMT.access_key, AMT.secret_key))

# Hiding the patterns to run below in a light library. However,
# feel free to use MTurkR directly.

AMT.usecredentials = function () {
    acc = readline("Please enter your AMT access key: ")
    sec = readline("Please enter your AMT secret key: ")
    AMT.access_key = acc
    AMT.secret_key = sec
    credentials(c(AMT.access_key, AMT.secret_key))
    print("Credentials set.")
}

AMT.createHIT = function () {
    eq = GenerateExternalQuestion(AMT.url, AMT.frame_height)
    hit = CreateHIT(
        question = eq,                       # No need to change this
        expiration = seconds(days = 30),     # Expiration of the HIT
        assignments = "100",                 # How many assignments to assign (has to be a string!)
        title = "Test experiment",           # Title of experiment to show the Turkers
        description = "This is a fun experiment!",
                                             # Description of the experiment, available to the Turkers
        reward = "0.15",                     # Reward for experiment, in USD (has to be a string!)
        duration = seconds(hours = 1),       # Duration of the HIT
        keywords = "experiment,linguistics", # Keywords to search for
        qual.req = NULL                      # NULL if no qualification is required. Use GenerateQualificationRequirement
        )
    
    # hit now contains the Hit ID. Do not forget to save it some way!

    return hit
}
