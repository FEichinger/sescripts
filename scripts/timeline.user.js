// ==UserScript==
// @name	Stack Exchange Timeline Utilities
// @namespace	feichinger-setu
// @version	0.1
// @description	Adds timeline link to question tools
// @match       http://*.askubuntu.com/questions/*
// @match       http://*.mathoverflow.net/questions/*
// @match       http://*.serverfault.com/questions/*
// @match       http://*.stackapps.com/questions/*
// @match       http://*.stackexchange.com/questions/*
// @match       http://*.stackoverflow.com/questions/*
// @match       http://*.superuser.com/questions/*
// @copyright	2014 - present FEichinger@AskUbuntu
// ==/UserScript==

var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.setu = {};

ns.sescripts.setu.execute = function() {
	var question = document.getElementById("question");
	var qID = question.dataset.questionid;
	var menu = question.getElementsByClassName("post-menu")[0];

	var lsep = document.createElement("span");
	lsep.className = "lsep";
	lsep.innerHTML = "|";
	menu.appendChild(lsep);

	var timelineLink = document.createElement("a");
	timelineLink.href = "/posts/" + qID + "/timeline";
	timelineLink.innerHTML = "timeline";
	menu.appendChild(timelineLink);
};

chrome.storage.sync.get("sescripts", function(items) {
	var settings = items.sescripts;
	if(settings === null) {
		settings = {active: ["seca", "secb", "setu", "seeu"]};
	}

	if(!(settings.active.indexOf("setu") < 0)) {
		ns.sescripts.setu.execute();
	}
});