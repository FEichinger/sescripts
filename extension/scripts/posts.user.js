// ==UserScript==
// @name		Stack Exchange Post Utilities
// @namespace	sescripts-sepu
// @version		1.1
// @description	Extends post functionality with revision and timeline links.
// @match		*://*.stackexchange.com/questions/*
// @match		*://*.stackoverflow.com/questions/*
// @match		*://*.serverfault.com/questions/*
// @match		*://*.superuser.com/questions/*
// @match		*://*.askubuntu.com/questions/*
// @match		*://*.mathoverflow.net/questions/*
// @match		*://*.stackapps.com/questions/*
// @copyright	2014 - present FEichinger@VAD-Systems.de
// ==/UserScript==

var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.sepu = {};
ns.sescripts.sepu.revision = {};
ns.sescripts.sepu.timeline = {};
ns.sescripts.sepu.abbreviations = {};

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

ns.sescripts.sepu.initInterval = 0;
ns.sescripts.sepu.settings = null;

ns.sescripts.sepu.loadDefaultSettings = function() {
	return ns.sescripts.settings.defaults.settingsData;
};

ns.sescripts.sepu.loadSettings = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === null || settings === undefined) {
			settings = ns.sescripts.sepu.loadDefaultSettings();
		}

		if(settings.active === undefined) {
			settings.active = ns.sescripts.sepu.loadDefaultSettings().active;
		}
		if(settings.sepu === undefined) {
			settings.sepu = ns.sescripts.sepu.loadDefaultSettings().sepu;
		}

		ns.sescripts.sepu.settings = settings;
	});
};

ns.sescripts.sepu.initialize = function() {
	if(ns.sescripts.sepu.settings === null) return;

	window.clearInterval(ns.sescripts.sepu.initInterval);

	if(ns.sescripts.sepu.settings.active.indexOf("sepu") >= 0) {
		ns.sescripts.sepu.execute();
	}
};

ns.sescripts.sepu.execute = function() {
	if(ns.sescripts.sepu.settings.sepu.indexOf("revision") >= 0) {
		ns.sescripts.sepu.revision.execute();
	}

	if(ns.sescripts.sepu.settings.sepu.indexOf("timeline") >= 0) {
		ns.sescripts.sepu.timeline.execute();
	}
	
	if(ns.sescripts.sepu.settings.sepu.indexOf("abbreviations") >= 0) {
		ns.sescripts.sepu.abbreviations.execute();
	}
};

ns.sescripts.sepu.revision.execute = function() {
	var question = document.getElementById("question");
	var qID = question.dataset.questionid;
	ns.sescripts.sepu.revision.addRevisionLink(question, qID);
	var answers = document.getElementsByClassName("answer");
	for(var i = 0; i < answers.length; i++) {
		var answer = answers[i];
		var aID = answer.dataset.answerid;
		ns.sescripts.sepu.revision.addRevisionLink(answer, aID);
	}
};

/* Revision Links */
ns.sescripts.sepu.revision.addRevisionLink = function(post, id) {
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

/* Timeline Link */
ns.sescripts.sepu.timeline.execute = function() {
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

/* Abbreviations */
ns.sescripts.sepu.abbreviations.execute = function() {
	return;
	var posts = {};
	posts.question = {};
	posts.question.title = document.querySelector("#question-header a.question-hyperlink");
	posts.question.body = document.querySelectorAll("#question div.post-text p");
	posts.question.tags = document.querySelectorAll("#question div.post-taglist a.post-tag");
	
	console.log("Question:");
	console.log("Title:")
	console.log(posts.question.title);
	console.log("Body:");
	console.log(posts.question.body);
	console.log("Tags:");
	console.log(posts.question.tags);
	
	posts.answers = [];
	var answers = document.querySelectorAll("div.answer");
	for(var i = 0; i < answers.length; i++) {
		posts.answers[i] = {};
		posts.answers[i].body = answers.item(i).querySelectorAll("div.post-text p");
		console.log("Answer #" + i);
		console.log(posts.answers[i].body);
	}
	
	console.log("Assembled Posts Object:");
	console.log(posts);
}

ns.sescripts.sepu.loadSettings();
ns.sescripts.sepu.initInterval = window.setInterval(ns.sescripts.sepu.initialize, 10);