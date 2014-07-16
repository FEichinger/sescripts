var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.seeu = ns.sescripts.seeu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.seeu = ns.sescripts.settings.seeu || {};

/* Main SEEU */
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