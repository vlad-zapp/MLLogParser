//<reference path="chrome-api-vsdoc.js"/>

var prt = chrome.extension.connect();
prt.onMessage.addListener(message);

function initForm() {
    var logFileURLs = localStorage["logFileURLs"].split("\n");
    for (var i = 0; i < logFileURLs.length; i++) {
        parent.top_frame.logParamsForm.logFileSelect.add(new Option(logFileURLs[i]));
    }

    parent.top_frame.logParamsForm.logFileSelect.selectedIndex = localStorage["currentFileIndex"];
    //formUpdated();
}

function parseString(string, stringNum) {
    var stringFormatted = '';
    if (stringNum == 0)
        stringFormatted += '<tr><th style="width: 200px;">Date</th><th style="width: 70px;">Type</th><th style="width: 70px;">Application</th><th>Description</th></tr>';


    string = string.replace(/&/g, '&amp;').replace(/</g, '&lt;') + "<br \>";
    stringArr = string.split(" ");
    stringFormatted += '<tr>';
    stringFormatted += '<td>' + stringArr[0] + ' ' + stringArr[1] + '</td>';
    stringFormatted += '<td>' + stringArr[2].substring(0, stringArr[2].length - 1) + '</td>';

    if (stringArr[3].search(':') != -1) {
        stringFormatted += '<td>' + stringArr[3].substring(0, stringArr[3].length - 1) + '</td>';
        stringFormatted += '<td>' + stringArr.splice(4).join(' ') + '</td>';
    } else {
        stringFormatted += '<td>System</td>';
        stringFormatted += '<td>' + stringArr.splice(3).join(' ') + '</td>';
    }
    stringFormatted += '</tr>';
    return stringFormatted;
}

function message(msg) {
    //process message from background script

    if (msg == "update") {
        //request to update logs
        formUpdated();
    } else {
        //parse logs (response)1
        parent.bottom_frame.document.write('<link rel="stylesheet" href="style.css" />');
        parent.bottom_frame.document.write('<table class="logsTable"><tr>');
        for (var i = 0; i < msg.length; i++)
            parent.bottom_frame.document.write(parseString(msg[i], i));
        parent.bottom_frame.document.write('</tr></table>');
	parent.bottom_frame.scrollTo(0,parent.bottom_frame.document.body.scrollHeight);
    }
}

function updateButtonPressed() {
    localStorage["currentFileIndex"] = parent.top_frame.logParamsForm.logFileSelect.selectedIndex;
    formUpdated();
}

function formUpdated() {
    //update log filter according to selected parameters

    //clear log frame
    parent.bottom_frame.document.open();
    parent.bottom_frame.document.close();

    //save form elements values in logRequest object
    logRequest = new Object();
    logRequest.file = parent.top_frame.logParamsForm.logFileSelect.value;
    logRequest.oldestFirst = parent.top_frame.logParamsForm.oldestFirst.checked;
    logRequest.includeSystemLogs = parent.top_frame.logParamsForm.includeSystemLogs.checked;

    if (parent.top_frame.logParamsForm.selectApp.checked)
        logRequest.appName = parent.top_frame.logParamsForm.appName.value;
    else
        logRequest.appName = '';

    logRequest.logLevels = new Array();

    if (!parent.top_frame.logParamsForm.logLevels.disabled) {
        for (var i = 0; i < parent.top_frame.logParamsForm.logLevels.length; i++) {
            if (parent.top_frame.logParamsForm.logLevels[i].selected) {
                logRequest.logLevels.push(parent.top_frame.logParamsForm.logLevels[i].value);
            }
        }
    }

    if (parent.top_frame.logParamsForm.updateByTimeout.checked) {
        //TODO:add try-catch here
        try {
            logRequest.timeout = parseInt(parent.top_frame.logParamsForm.timeout.value);
        } catch (error) {
            alert("bad format of the timeout value");
        }
    }
    if (parent.top_frame.logParamsForm.updateByUrl.checked) {
        logRequest.url = parent.top_frame.logParamsForm.url.value;
    }

    //logRequest
    prt.postMessage(logRequest);
}

document.addEventListener('DOMContentLoaded', function () {
    initForm();
    
    allLevels = ['Finest', 'Finer', 'Fine', 'Debug', 'Config', 'Info', 'Warning', 'Notice', 'Error', 'Critical', 'Alert', 'Emergency'];
    
     for (var i = 0; i < allLevels.length; i++){
         parent.top_frame.logParamsForm.logLevels.add(new Option(allLevels[i]));
     }

    //UI Events bindings
    parent.top_frame.logParamsForm.submitButton.addEventListener('click', updateButtonPressed );
    parent.top_frame.logParamsForm.selectApp.addEventListener('click', function(){ parent.top_frame.logParamsForm.appName.disabled = !parent.top_frame.logParamsForm.selectApp.checked; } );
    parent.top_frame.logParamsForm.enableLoglevels.addEventListener('click', function(){ parent.top_frame.logParamsForm.logLevels.disabled = !parent.top_frame.logParamsForm.enableLoglevels.checked; } );
    parent.top_frame.logParamsForm.updateByTimeout.addEventListener('click', function(){ parent.top_frame.logParamsForm.timeout.disabled = !parent.top_frame.logParamsForm.updateByTimeout.checked; } );
    parent.top_frame.logParamsForm.updateByUrl.addEventListener('click', function(){ parent.top_frame.logParamsForm.url.disabled = !parent.top_frame.logParamsForm.updateByUrl.checked; } );
});