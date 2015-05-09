if (!require(MTurkR)){
    install.packages("MTurkR")
    library(MTurkR)
}
require(plyr)

AMT = new.env(parent = emptyenv())

# set these below to your credentials and info about the HIT:
# PRIVATE KEYS BELOW, DON'T SHARE
AMT$access_key = ""
AMT$secret_key = ""
AMT$url = ""
AMT$frame_height = 600
AMT$sandbox = FALSE
AMT$currentHIT = NULL

options('MTurkR.sandbox' = AMT$sandbox)
credentials(c(AMT$access_key, AMT$secret_key))

# Hiding the patterns to run below in a light library. However,
# feel free to use MTurkR directly.

AMT$changeCredentials = function () {
    acc = readline("Please enter your AMT access key: ")
    sec = readline("Please enter your AMT secret key: ")
    AMT$access_key = acc
    AMT$secret_key = sec
    credentials(c(AMT$access_key, AMT$secret_key))
    print("Credentials set.")
}

AMT$createHIT = function () {
    eq = GenerateExternalQuestion(AMT$url, AMT$frame_height)
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

    AMT$currentHIT = hit
    return hit
}

AMT$dummyHIT = function (workerid){
    qtext = paste0('<QuestionForm xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd">',
        '<Overview>',
        '<Title>Dummy HIT for late payments</Title>',
        '<Text>This is only a dummy HIT. By Accepting it, we will be able to grant you the money we owe you. Only the following Worker ID(s) will be accepted: ',
        paste(workerid, collapse = ", "), 
        '. If you are not in this list above Worker, please do not Accept this HIT, as you will be rejected</Text>',
        '<Text>Thanks for your patience!</Text>',
        '</Overview>',
        '<Question>',
        '<QuestionIdentifier>remarks</QuestionIdentifier>',
        '<IsRequired>true</IsRequired>',
        '<QuestionContent><Text>Any remarks:</Text></QuestionContent>',
        '<AnswerSpecification><FreeTextAnswer>',
        '</FreeTextAnswer></AnswerSpecification>',
        '</Question>',
        '</QuestionForm>'
        )

    qname = "DummyPayment"
    if(!(qname %in% SearchQualificationTypes()$Name)){
        CreateQualificationType(name = qname,
                                description = paste0("With this qualification, you are able to accept our dummy HIT"),
                                status = "Active")
                                
    }
    qid = subset(SearchQualificationTypes(),Name == qname)$QualificationTypeId
    AssignQualifications(qid, workerid)
    qualreq = GenerateQualificationRequirement(qual = qid, comparator = "Exists", value="")
    
    hit = CreateHIT(title = "Dummy HIT for late payments",
        question = qtext, 
        description = "Only accept this HIT if you have been in contact with us with regards to a late payment! If you're not on our list for payment, your HIT will not be accepted",
        expiration = seconds(days = 5),
        duration = seconds(hours = 1),
        keywords = "dummy",
        reward = "2.00",
        assignments = length(workerid),
        qual.req = qualreq
        )
    list(url  = paste0("http://mturk.com/mturk/preview?groupId=",hit$HITTypeId),
         hit = hit,
         listassignments = function(){
             GetAssignment(hit = hit$HITId)
         },
         reward = function(){
             asses = GetAssignment(hit = hit$HITId)
             ApproveAssignment(asses[asses$WorkerId %in% workerid,]$AssignmentId,
                               feedback = "Thank you for your patience!")
             RejectAssignment(asses[!(asses$WorkerId %in% workerid),]$AssignmentId,
                               feedback = "Sorry, you were not on the list of eligible workers.")
         },
         kill = function(){
             ExpireHIT(hit = hit$HITId)
             DisposeHIT(hit = hit$HITId)
             RevokeQualification(qid, workerid)
         })
}



AMT$killHIT = function(){
    if(readline("Are you sure you want to kill the current hit (yes/no)? ")=="yes"){
        ExpireHIT(hit = AMT$currentHIT$HITId)
        DisposeHIT(hit = AMT$currentHIT$HITId)
    }
    else {
        print("Cancelled.")
    }
}



AMT$saveCurrentHIT = function(file = "hitinfo.csv"){
    write.table(AMT$currentHIT, file = file, sep=",", row.names=FALSE)
}

AMT$loadCurrentHIT = function(file = "hitinfo.csv") {
    AMT$currentHIT = read.table(file, header=TRUE, sep=",")
    return (AMT$currentHIT)
}

AMT$getAllAssignments = function(){
    hits = SearchHITs()
    hitids = hits[1]$HITs$HITId

    allinfo = ddply(hits[1]$HITs, .(HITId), function(hitid){
        return (GetAssignment(hit=hitid$HITId, return.all = TRUE))
    })
    allinfo
}

AMT$findWorkersAssignments = function(workerid){
    allinfo = AMT$getAllAssignments()
    return (allinfo[allinfo$WorkerId == workerid,])
}


## Identify Turkers who have completed at least n of our HITs in the past
AMT$findRegulars = function (n){
    # get all of the Turkers
    allinfo = AMT$getAllAssignments()
    # finiding all workers
    allworkers = ddply(allinfo, .(WorkerId), summarise,
        count = length(HITId),
        rejecteds = sum(AssignmentStatus == "Rejected"),
        firstassignment = AssignmentId[1])
    print(paste0("Number of assignments: ", sum(allworkers$count)))
    print(paste0("Number of unique workers: ", length(unique(allworkers$WorkerId))))
    regulars = allworkers[allworkers$count-allworkers$rejecteds >= n,]
    print(paste0("Number of unique workers with ",n,"+ HITs: ", length(unique(regulars$WorkerId))))
    regulars
}

## TASK 2: give workers a  bonus and possibly send them a link link
AMT$setupEntranceExam = function(workerids, assignments, link = "AMT LINK", bonus.amount = 0.05, reason = ""){
    bonusreason = paste0(reason, " To  take the eligibility test, follow this link: ", link)
    GrantBonus(workerids, assignments, reasons = bonusreason, amounts = bonus.amount)
    qname = "EligibleForTest"
    if(!(qname %in% SearchQualificationTypes()$Name)){
        CreateQualificationType(name = qname,
                                description = paste0("With this qualification, you are able to take the eligibility test for further HITs at ", link)
                                status = "Active")
                                
    }
    qid = subset(SearchQualificationTypes(),Name == qname)$QualificationTypeId
    AssignQualifications(qid, workerids)
}

