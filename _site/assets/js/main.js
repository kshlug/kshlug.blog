// This file contains JavaScript code required to display some bits on http://sanlug.ir

// main.js

// Central global variable
var sanlug = {};



// Get code tags and change their dir attribute to ltr.
// TODO: Find a solution to generate this during the build
var codeTags = document.getElementsByTagName('code');
for (var i = 0; i < codeTags.length; i++) {
	codeTags[i].setAttribute('dir', 'ltr');
}