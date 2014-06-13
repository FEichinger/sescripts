// ==UserScript==
// @name		Stack Exchange Election Utilities
// @namespace	sescripts-seeu
// @version		1.0.1
// @description	Adds permanent links to comments on the election page.
// @match		*://*.stackexchange.com/election/*
// @match		*://*.stackoverflow.com/election/*
// @match		*://*.serverfault.com/election/*
// @match		*://*.superuser.com/election/*
// @match		*://*.askubuntu.com/election/*
// @match		*://*.mathoverflow.net/election/*
// @match		*://*.stackapps.com/election/*
// @copyright	2014 - present FEichinger@VAD-Systems.de
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
		if(settings === null || settings === undefined) {
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