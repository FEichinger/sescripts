var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.sepu = ns.sescripts.sepu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.sepu = ns.sescripts.settings.sepu || {};

/* Timeline Link */
ns.sescripts.sepu.timeline = {};
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
