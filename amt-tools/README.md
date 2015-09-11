# How to set up AMT with Experigen

## Using the full _amt_ plugin

Using the _amt_ plugin is not recommended, as I believe it presents security risks. Also, it is far from being tested yet, for the same reason.

## Using _amtmini_

Using the smaller _amtmini_ plugin is safe if you pay attention to keep your AMT keys for yourself. To set up the plugin, just insert `"amtmini"` as a plugin in `settings.js`, and `sandbox: true` to pluginsettings in `settings.js` if you plan using sandbox.

The plugin will automatically process the info passed on by AMT, so that the Worker ID's of Turkers will be available in the Experigen results. The last view should contain a call to submitAMTButton(), which will register the results with AMT.

## Uploading HITs

To upload a HIT, you cannot use Amazon's web interface anymore, as for some puzzling reason, ExternalQuestions are only loadable from script/commandline. In this directory, some Python helping scripts are provided which wrap around the Command Line Tool interface. Make sure you have downloaded the AMT CLT!

To learn more about the Python wrappers, run e.g.:

> python initialize-amt.py --help

To upload with initialize-amt (or Amazon's CLT) you need 4 files present in this directory. They are provided already here but make sure to change according to your need;

- amtsurvey.input -- no changes needed (with Experigen, we do not need this)

- amtsurvey.properties -- properties of the experiment which you would fill out on the web interface otherwise

- amtsurvey.question -- An XML file where you have to enter the concrete URL link to the experiment

- mturk.properties -- enter your AMT credentials there. Some help is provided

 
