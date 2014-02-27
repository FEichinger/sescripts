var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.settings = {};

ns.sescripts.settings.initialize = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === undefined) {
			settings = {active: ["seca", "secb", "setu", "sepu", "seeu"]};
		}

		var scriptBlocks = document.getElementsByClassName("script-settings-container");
		for(var i = 0; i < scriptBlocks.length; i++) {
			var script = scriptBlocks[i].id;
			var active = !(settings.active.indexOf(script) < 0);
			ns.sescripts.settings.toggleDisplay(script, active);
		}

		ns.sescripts.settings.saveSettings();
	});
};

ns.sescripts.settings.toggleDisplay = function(script, active) {
		if(active) {
			document.getElementById(script).getElementsByTagName("input")[0].checked = true;
			document.getElementById(script).getElementsByClassName("active")[0].style.display = "block";
			document.getElementById(script).getElementsByClassName("inactive")[0].style.display = "none";
		}
		else {
			document.getElementById(script).getElementsByTagName("input")[0].checked = false;
			document.getElementById(script).getElementsByClassName("active")[0].style.display = "none";
			document.getElementById(script).getElementsByClassName("inactive")[0].style.display = "block";
		}

		document.getElementById(script).getElementsByTagName("input")[0].onchange = function() {
			ns.sescripts.settings.toggleScript(script);
		};
};

ns.sescripts.settings.saveSettings = function() {
	var storageObject = {};
	storageObject.active = [];

	var scriptBlocks = document.getElementsByClassName("script-settings-container");
	for(var i = 0; i < scriptBlocks.length; i++) {
		var script = scriptBlocks[i].id;
		var active = scriptBlocks[i].getElementsByTagName("input")[0].checked;
		if(active) {
			storageObject.active.push(script);
		}
	}

	chrome.storage.sync.set({sescripts: storageObject});

	return storageObject;
};

ns.sescripts.settings.toggleScript = function(script) {
	var scriptBlock = document.getElementById(script);
	var active = scriptBlock.getElementsByTagName("input")[0].checked;

	ns.sescripts.settings.toggleDisplay(script, active);

	ns.sescripts.settings.saveSettings();
};

ns.sescripts.settings.initialize();