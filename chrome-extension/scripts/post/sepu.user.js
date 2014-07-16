var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.sepu = ns.sescripts.sepu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.sepu = ns.sescripts.settings.sepu || {};

/* Main SEPU */
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

ns.sescripts.sepu.loadSettings();
ns.sescripts.sepu.initInterval = window.setInterval(ns.sescripts.sepu.initialize, 10);