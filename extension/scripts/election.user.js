// ==UserScript==
// @name		Stack Exchange Election Utilities
// @namespace	sescripts-seeu
// @version		1.1
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

/* Default Settings Fallback */
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.defaults = ns.sescripts.settings.defaults || {};
ns.sescripts.settings.defaults.settingsData = ns.sescripts.settings.defaults.settingsData || {active: ["secu", "sepu", "seeu"], sepu: ["timeline", "revision", "abbreviations"], secu: ["alerts", "buttons", "clear"]};
ns.sescripts.settings.defaults.secu = ns.sescripts.settings.defaults.secu || {};
ns.sescripts.settings.defaults.secu.buttons = ns.sescripts.settings.defaults.secu.buttons || {data: [{name:"shrug",code:"*shrug*",send:false},{name:"shrug&ast;",code:"*shrug*",send:true}]};
ns.sescripts.settings.defaults.secu.alerts = ns.sescripts.settings.defaults.secu.alerts || {data: [], sound: false};
ns.sescripts.settings.defaults.sepu = ns.sescripts.settings.defaults.sepu || {};
ns.sescripts.settings.defaults.sepu.abbreviations = ns.sescripts.settings.defaults.sepu.abbreviations || {data: []};
/* End Default Settings Fallback */

ns.sescripts.seeu.initInterval = 0;
ns.sescripts.seeu.settings = null;

ns.sescripts.seeu.loadDefaultSettings = function() {
	return ns.sescripts.settings.defaults.settingsData;
};

ns.sescripts.seeu.loadSettings = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === null || settings === undefined) {
			settings = ns.sescripts.seeu.loadDefaultSettings();
		}

		if(settings.active === undefined) {
			settings.active = ns.sescripts.seeu.loadDefaultSettings().active;
		}

		ns.sescripts.seeu.settings = settings;
	});
};

ns.sescripts.seeu.initialize = function() {
	if(ns.sescripts.seeu.settings === null) return;

	window.clearInterval(ns.sescripts.seeu.initInterval);

	if(ns.sescripts.seeu.settings.active.indexOf("seeu") >= 0) {
		ns.sescripts.seeu.execute();
	}
};

ns.sescripts.seeu.execute = function() {
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

ns.sescripts.seeu.loadSettings();
ns.sescripts.seeu.initInterval = window.setInterval(ns.sescripts.seeu.initialize, 10);