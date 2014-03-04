var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.settings = {};

ns.sescripts.settings.initialize = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === undefined) {
			settings = {active: ["seca", "secb", "sepu", "seeu"], sepu: ["timeline", "revision"]};
		}

		var scriptBlocks = document.getElementsByClassName("script-settings-container");
		for(var i = 0; i < scriptBlocks.length; i++) {
			var script = scriptBlocks[i].id;
			var active = !(settings.active.indexOf(script) < 0);
			ns.sescripts.settings.toggleScriptDisplay(script, active);

			var script_subsettings_items = scriptBlocks[i].getElementsByClassName("script-subsettings")[0].getElementsByTagName("li");
			for(var k = 0; k < script_subsettings_items.length; k++) {
				var checkbox = script_subsettings_items[k].getElementsByTagName("input")[0];
				var subsetting = checkbox.name.split("-")[1];
				var subsetting_active = !(settings[script].indexOf(subsetting) < 0);
				ns.sescripts.settings.toggleSubsettingDisplay(script, subsetting, subsetting_active);
			}

			ns.sescripts.settings.initializeScriptSettings(script);
		}

		ns.sescripts.settings.saveSettings();
	});
};

ns.sescripts.settings.initializeScriptSettings = function(script) {
	var script_settings = document.getElementById(script).getElementsByClassName("script-settings")[0];
	script_settings.getElementsByTagName("input")[0].onchange = function() {
		ns.sescripts.settings.toggleScript(script);
	};

	var script_subsettings = document.getElementById(script).getElementsByClassName("script-subsettings")[0];
	var script_subsettings_items = script_subsettings.getElementsByTagName("li");
	for(var i = 0; i < script_subsettings_items.length; i++) {
		ns.sescripts.settings.initializeSubsetting(script_subsettings_items[i]);
	}
};

ns.sescripts.settings.initializeSubsetting = function(item) {
	var checkbox = item.getElementsByTagName("input")[0];
	var script = checkbox.name.split("-")[0];
	var subsetting = checkbox.name.split("-")[1];

	checkbox.onchange = function() {
		ns.sescripts.settings.toggleSubsetting(script, subsetting);
	};
};

ns.sescripts.settings.toggleScriptDisplay = function(script, active) {
	var script_settings = document.getElementById(script).getElementsByClassName("script-settings")[0];

	if(active == null) {
		active = script_settings.getElementsByTagName("input")[0].checked;
	}

	if(active) {
		script_settings.getElementsByTagName("input")[0].checked = true;
		script_settings.getElementsByClassName("active")[0].style.display = "block";
		script_settings.getElementsByClassName("inactive")[0].style.display = "none";
	}
	else {
		script_settings.getElementsByTagName("input")[0].checked = false;
		script_settings.getElementsByClassName("active")[0].style.display = "none";
		script_settings.getElementsByClassName("inactive")[0].style.display = "block";
	}
};

ns.sescripts.settings.toggleSubsettingDisplay = function(script, subsetting, active) {
	var items = document.getElementById(script).getElementsByClassName("script-subsettings")[0].getElementsByTagName("li");
	var item = null;
	for(var i = 0; i < items.length; i++) {
		var checkbox = items[i].getElementsByTagName("input")[0];
		if(checkbox.name == script + "-" + subsetting) {
			item = checkbox;
		}
	}

	if(item !== null) {
		if(active == null) {
			active = item.checked;
		}

		if(active) {
			item.checked = true;
		}
		else {
			item.checked = false;
		}
	}
};

ns.sescripts.settings.saveSettings = function() {
	var storageObject = {};
	storageObject.active = [];

	var scriptBlocks = document.getElementsByClassName("script-settings-container");
	for(var i = 0; i < scriptBlocks.length; i++) {
		var script = scriptBlocks[i].id;
		var script_settings = scriptBlocks[i].getElementsByClassName("script-settings")[0];
		var active = script_settings.getElementsByTagName("input")[0].checked;
		if(active) {
			storageObject.active.push(script);
			storageObject[script] = [];
			var script_subsettings = scriptBlocks[i].getElementsByClassName("script-subsettings")[0];
			var script_subsettings_items = script_subsettings.getElementsByTagName("li");
			for(var k = 0; k < script_subsettings_items.length; k++) {
				var item = script_subsettings_items[k];
				var checkbox = item.getElementsByTagName("input")[0];
				var subsetting = checkbox.name.split("-")[1];
				var subsetting_active = checkbox.checked;
				if(subsetting_active) {
					storageObject[script].push(subsetting);
				}
			}
		}
	}

	chrome.storage.sync.set({sescripts: storageObject});

	return storageObject;
};

ns.sescripts.settings.toggleScript = function(script) {
	ns.sescripts.settings.toggleScriptDisplay(script, null);
	ns.sescripts.settings.saveSettings();
};

ns.sescripts.settings.toggleSubsetting = function(script, subsetting) {
	ns.sescripts.settings.toggleSubsettingDisplay(script, subsetting, null);
	ns.sescripts.settings.saveSettings();
};

ns.sescripts.settings.initialize();