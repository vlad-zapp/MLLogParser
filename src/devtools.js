///<reference path="chrome-api-vsdoc.js"/>
//create custom log parser panel when opening devtools
var panel = chrome.experimental.devtools.panels.create("Logs", "icon.png", "panel.html");

//not working in chrome :-(
//function addActions(panel) {
//    panel.onSearch.addListener(function(action, queryString) {
//        alert("hi");
//    });
//}
