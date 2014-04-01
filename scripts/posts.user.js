// ==UserScript==
// @name	Stack Exchange Post Utilities
// @namespace	sescripts-sepu
// @version	0.2
// @description	Adds revision and timeline links to all posts
// @match       http://*.askubuntu.com/questions/*
// @match       http://*.mathoverflow.net/questions/*
// @match       http://*.serverfault.com/questions/*
// @match       http://*.stackapps.com/questions/*
// @match       http://*.stackexchange.com/questions/*
// @match       http://*.stackoverflow.com/questions/*
// @match       http://*.superuser.com/questions/*
// @copyright	2014 - present FEichinger@VAD-Systems.de
// ==/UserScript==

var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.sepu = {};

var sepu = ns.sescripts.sepu;

sepu.initInterval = 0;
sepu.settings = null;

sepu.loadDefaultSettings = function() {
	return {active: ["sepu"], sepu: ["timeline", "revision"]};
};

sepu.loadSettings = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === null) {
			settings = sepu.loadDefaultSettings();
		}

		if(settings.active === undefined) {
			settings.active = sepu.loadDefaultSettings().active;
		}
		if(settings.sepu === undefined) {
			settings.sepu = sepu.loadDefaultSettings().sepu;
		}

		sepu.settings = settings;
	});
};

sepu.initialize = function() {
	if(sepu.settings === null) return;

	window.clearInterval(sepu.initInterval);

	if(sepu.settings.active.indexOf("sepu") >= 0) {
		sepu.execute();
	}
};

sepu.execute = function() {
	if(sepu.settings.sepu.indexOf("revision") >= 0) {
		sepu.addRevisionLinks();
	}

	if(sepu.settings.sepu.indexOf("timeline") >= 0) {
		sepu.addTimelineLink();
	}
};

sepu.addRevisionLinks = function() {
	var question = document.getElementById("question");
	var qID = question.dataset.questionid;
	ns.sescripts.sepu.addRevisionLink(question, qID);
	var answers = document.getElementsByClassName("answer");
	for(var i = 0; i < answers.length; i++) {
		var answer = answers[i];
		var aID = answer.dataset.answerid;
		sepu.addRevisionLink(answer, aID);
	}
};

sepu.addRevisionLink = function(post, id) {
	var row = post.getElementsByClassName("fw")[0].rows[0];
	if(row.children.length == 2) {
		var td = document.createElement("td");
		td.align = "right";
		td.className = "post-signature";

		var userInfo = document.createElement("div");
		userInfo.className = "user-info";
		
		var userActionTime = document.createElement("div");
		userActionTime.className = "user-action-time";

		var revisionLink = document.createElement("a");
		revisionLink.href = "/posts/" + id + "/revisions";
		revisionLink.title = "show all edits to this post";
		revisionLink.innerHTML = "revision history";

		userActionTime.appendChild(revisionLink);
		userInfo.appendChild(userActionTime);
		td.appendChild(userInfo);
		row.insertBefore(td, row.children[1]);
	}
};

sepu.addTimelineLink = function() {
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
	timelineLink.title = "view the timeline for this post";
	menu.appendChild(timelineLink);
};

sepu.loadSettings();
sepu.initInterval = window.setInterval(sepu.initialize, 10);