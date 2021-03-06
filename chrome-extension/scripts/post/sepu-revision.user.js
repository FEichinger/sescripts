var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.sepu = ns.sescripts.sepu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.sepu = ns.sescripts.settings.sepu || {};

/* Revision Links */
ns.sescripts.sepu.revision = {};
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