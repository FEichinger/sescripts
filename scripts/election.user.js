// ==UserScript==
// @name	Stack Exchange Election Utilities
// @namespace	sescripts-seeu
// @version	0.1
// @description	Utility script for the election page
// @match       http://*.askubuntu.com/election*
// @match       http://*.mathoverflow.net/election*
// @match       http://*.serverfault.com/election*
// @match       http://*.stackapps.com/election*
// @match       http://*.stackexchange.com/election*
// @match       http://*.stackoverflow.com/election*
// @match       http://*.superuser.com/election*
// @copyright	2014 - present FEichinger@VADSystems.de
// ==/UserScript==

var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.seeu = {};

var seeu = ns.sescripts.seeu;

seeu.initInterval = 0;
seeu.settings = null;

seeu.loadDefaultSettings = function() {
	return {active: ["seeu"]};
};

seeu.loadSettings = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === null) {
			settings = seeu.loadDefaultSettings();
		}

		if(settings.active === undefined) {
			settings.active = seeu.loadDefaultSettings().active;
		}

		seeu.settings = settings;
	});
};

seeu.initialize = function() {
	if(seeu.settings === null) return;

	window.clearInterval(seeu.initInterval);

	if(seeu.settings.active.indexOf("seeu") >= 0) {
		seeu.execute();
	}
};

seeu.execute = function() {
	var permalink = document.getElementsByClassName("youarehere");
	permalink = permalink[0].href;
	var links = document.getElementsByClassName("comment");
	for(var i = 0; i < links.length; i++) {
		var id = links[i].id;
		var text = links[i].getElementsByClassName("comment-date");
		var link = document.createElement("a");
		link.dir = text[0].dir;
		link.class = text[0].class;
		link.href = permalink + "#" + id;
		link.appendChild(text[0].firstChild);
		text[0].appendChild(link);
	}
};

seeu.loadSettings();
seeu.initInterval = window.setInterval(seeu.initialize, 10);