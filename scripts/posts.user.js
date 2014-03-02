// ==UserScript==
// @name	Stack Exchange Post Utilities
// @namespace	feichinger-sepu
// @version	0.1
// @description	Adds revision link to all posts
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
ns.sescripts.sepu = {};

ns.sescripts.sepu.execute = function() {
	var question = document.getElementById("question");
	var qID = question.dataset.questionid;
	ns.sescripts.sepu.fixRevisionLink(question, qID);
	var answers = document.getElementsByClassName("answer");
	for(var i = 0; i < answers.length; i++) {
		var answer = answers[i];
		var aID = answer.dataset.answerid;
		ns.sescripts.sepu.fixRevisionLink(answer, aID);
	}
};

ns.sescripts.sepu.fixRevisionLink = function(post, id) {
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

chrome.storage.sync.get("sescripts", function(items) {
	var settings = items.sescripts;
	if(settings === null) {
		settings = {active: ["sepu"]};
	}

	if(!(settings.active.indexOf("sepu") < 0)) {
		ns.sescripts.sepu.execute();
	}
});