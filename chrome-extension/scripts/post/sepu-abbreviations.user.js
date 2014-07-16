var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.sepu = ns.sescripts.sepu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.sepu = ns.sescripts.settings.sepu || {};

/* Abbreviations */
ns.sescripts.sepu.abbreviations = {};
ns.sescripts.sepu.abbreviations.execute = function() {
	return console.log("Abbreviations script not running. INDEV.");
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
};
