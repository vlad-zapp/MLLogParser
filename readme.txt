MLLogParser is a small plugin for google chrome which can parse MarkLogic logs from files,show and filter them.

1. Installation
Installation of plugin is pretty simple: just drag a "Log Parser.crx" file into Google Chrome.
Then click add in the popup window and the plugin will be added to the browser.

2. Configuration
In Google Chrome go to chrome://extensions page, search for the "Mark Logic Log Parser" plugin and click configure.
Configuration page will be opened. You need to enter all the addresses of all log files you want to trace here. One line should contain only one address.

Important: if your need to use HTTP authentification to acess log files you should include your credentials in the address string, e. g. "http://username:password@server.com/get-error-log.xqy?filename=ErrorLog.txt"

3. Usage 
Just press the F12 anytime in Chrome and open Logs tab. You can customize here all the filtering and updating rules. Also you should choose the log source here.
One more world about updating: logs can be updated by timeout(specified in msecs) and by request to specified URL. 
Update by timeout occurs when network activity is not present in current tab for specified time.
Update by URL occurs when any request to specified address was made.
If you combine that two triggers you get updated logs after some msecs from last request/responce from specified URL which is very useful, when you are trying to trace updates of MarkLogic logs.

4. Contacts
You can contact the author via email, or watch the plugin's repository on github.com
http://github.com/vlad-zapp/MLLogParser
vgrutsenko@mirantis.com