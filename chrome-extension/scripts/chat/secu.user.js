var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.secu = ns.sescripts.secu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.secu = ns.sescripts.settings.secu || {};

/* Main SECU */
ns.sescripts.secu.loadedSettings = 0;
ns.sescripts.secu.initInterval = 0;

ns.sescripts.secu.loadSettings = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === null || settings === undefined) {
			settings = ns.sescripts.settings.defaults.settingsData;
		}
		
		if(settings.active === undefined) {
			settings.active = ns.sescripts.settings.defaults.settingsData.active;
		}
		if(settings.secu === undefined) {
			settings.secu = ns.sescripts.settings.defaults.settingsData.secu;
		}
		
		ns.sescripts.settings.overallSettings = settings;
		ns.sescripts.secu.loadedSettings++;
	});
	
	chrome.storage.local.get("sescripts_secu_alerts", function(items) {
		var settings = items.sescripts_secu_alerts;
		if(settings === null || settings === undefined) {
			settings = ns.sescripts.settings.defaults.secu.alerts;
		}
		
		// Clean Up Duplicates
		var s = [];
		for(var i = 0; i < settings.length; i++) {
			var x = false;
			for(var k = i; k < settings.length; k++) {
				if(settings[i].toUpperCase() == settings[k].toUpperCase()) x = true;
			}
			if(!x) s.push(settings[i]);
		}
		// End
		
		ns.sescripts.settings.secu.alerts = settings;
		ns.sescripts.secu.loadedSettings++;
	});
	
	chrome.storage.local.get("sescripts_secu_buttons", function(items) {
		var settings = items.sescripts_secu_buttons;
		if(settings === null || settings === undefined) {
			settings = ns.sescripts.settings.defaults.secu.buttons;
		}
		
		ns.sescripts.settings.secu.buttons = settings;
		ns.sescripts.secu.loadedSettings++;
	});
	
	chrome.storage.local.get("sescripts_secu_clear", function(items) {
		var settings = items.sescripts_secu_clear;
		if(settings === null || settings === undefined) {
			settings = ns.sescripts.settings.defaults.secu.clear;
		}
		
		ns.sescripts.settings.secu.clear = settings;
		ns.sescripts.secu.loadedSettings++;
	});
};

ns.sescripts.secu.execute = function() {
	if(ns.sescripts.settings.overallSettings.secu.indexOf("buttons") >= 0) {
		ns.sescripts.secu.buttons.execute();
	}
	
	if(ns.sescripts.settings.overallSettings.secu.indexOf("clear") >= 0) {
		ns.sescripts.secu.clear.execute();
	}
	
	if(ns.sescripts.settings.overallSettings.secu.indexOf("alerts") >= 0) {
		ns.sescripts.secu.alerts.execute();
	}
};

ns.sescripts.secu.initialize = function() {
	if(ns.sescripts.secu.loadedSettings < 4) return;
	
	window.clearInterval(ns.sescripts.secu.initInterval);
	
	if(ns.sescripts.settings.overallSettings.active.indexOf("secu") >= 0) {
		ns.sescripts.secu.execute();
	}
};

ns.sescripts.secu.buttonsOverride = function() {
	var html_buttons = document.getElementById("chat-buttons");
	var custom_buttons;
	custom_buttons = document.getElementById("custom-buttons");
	if(custom_buttons === null) {
		custom_buttons = document.createElement("span");
		custom_buttons.id = "custom-buttons";
		html_buttons.appendChild(custom_buttons);
	}
	
	return custom_buttons;
};

ns.sescripts.secu.loadSettings();
ns.sescripts.secu.initInterval = window.setInterval(ns.sescripts.secu.initialize, 10);