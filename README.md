# Summary
The Measurement Lab (M-Lab) Browser Extension is intended to be an in-browser suite of M-Lab tests that people can run from wherever they connect. Features will include: 
* Ability to run M-Lab tests and see vizualizations of results over time
* Annotate results with user-defined metadata
* Save and export user test information locally in addition to uploading test data to M-Lab

# Development environment setup 

1. Follow the instructions to download/install the Mozilla
Add-On SDK: [here](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation)

2. Clone this repo. 

3. From that repo directory, run 
`cfx xpi`
which will generate an xpi that you can install into the browser.

Protip: Use the Extension Autoinstaller plugin. See 'Developing 
without cfx run' on 
[this page](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_started)

# Architecture
The M-Lab Browser Extension for Firefox is implemented using the Mozilla Add On SDK, primarily in Javascript. It has been designed to add M-Lab tests as "plugins" inside of a common framework. The most commonly used M-Lab test, NDT, is the initial working plugin prototype. 

Test plugins are located in: /lib/plugins/

The NDT plugin prototype in: / lib/plugins/NDT/ 
can be used as a prototype for additional tests.

User Interface components are located in: /data/
