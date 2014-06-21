var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.settingsData = {};

ns.sescripts.settings.initialize = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		ns.sescripts.settings.settingsData = items.sescripts;
		
		if(ns.sescripts.settings.settingsData === undefined) {
			ns.sescripts.settings.settingsData = ns.sescripts.settings.defaults.settingsData;
		}
		if(ns.sescripts.settings.settingsData.active === undefined) {
			ns.sescripts.settings.settingsData = ns.sescripts.settings.defaults.settingsData.active;
		}
		if(ns.sescripts.settings.settingsData.sepu === undefined) {
			ns.sescripts.settings.settingsData.sepu = ns.sescripts.settings.defaults.settingsData.sepu;
		}
		if(ns.sescripts.settings.settingsData.secu === undefined) {
			ns.sescripts.settings.settingsData.secu = ns.sescripts.settings.defaults.settingsData.secu;
		}
		var scriptblocks = document.querySelectorAll("div.script-settings-container");
		for(var i = 0; i < scriptblocks.length; i++) {
			ns.sescripts.settings.initializeScriptSettings(scriptblocks[i]);
		}
	});
	
	ns.sescripts.settings.initializeOverlay();
};

/* Setup */
ns.sescripts.settings.initializeScriptSettings = function(scriptBlock) {
	// Setup Toggle
	var toggle = scriptBlock.querySelector("div.script-settings input[data-setting=toggle]");
	var script = scriptBlock.dataset.script;
	ns.sescripts.settings.toggleScriptDisplay(toggle, (ns.sescripts.settings.settingsData.active.indexOf(script) >= 0));
	toggle.onchange = function() {
		ns.sescripts.settings.toggleScript(script);
	};
	
	// Setup Subsettings
	var subsettings = scriptBlock.querySelectorAll("div.script-subsettings li");
	for(var i = 0; i < subsettings.length; i++) {
		ns.sescripts.settings.initializeScriptSubsettings(subsettings[i]);
	}
};

ns.sescripts.settings.initializeScriptSubsettings = function(subsettingItem) {
	// Setup Toggle
	var toggle = subsettingItem.querySelector("input[type=checkbox]");
	var script = subsettingItem.parentNode.parentNode.parentNode.parentNode.dataset.script;
	var subsetting = subsettingItem.dataset.subsetting;
	ns.sescripts.settings.toggleScriptSubsettingDisplay(toggle, (ns.sescripts.settings.settingsData[script].indexOf(subsetting) >= 0));
	toggle.onchange = function() {
		ns.sescripts.settings.toggleScriptSubsetting(script, subsetting);
	};
	
	// Setup Options Links
	var optionlinks = subsettingItem.querySelectorAll("a.options-link");
	for(var i = 0; i < optionlinks.length; i++) {
		ns.sescripts.settings.initializeScriptSubsettingsOptionlinks(optionlinks[i]);
	}
};

ns.sescripts.settings.initializeScriptSubsettingsOptionlinks = function(optionLink) {
	optionLink.onclick = function() {
		var script = optionLink.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.script;
		var subsetting = optionLink.parentNode.dataset.subsetting;
		var option = optionLink.dataset.option;
		ns.sescripts.settings.triggerScriptSubsettingOption(script, subsetting, option);
	};
};

ns.sescripts.settings.initializeOverlay = function() {
	document.addEventListener('keydown', function(e) {
		if (e.keyCode == 27) {
			ns.sescripts.settings.closeOverlay();
		}
	});
	
	var overlay = document.querySelector(".overlay");
	var closebuttons = overlay.querySelectorAll(".close-button");
	for(var i = 0; i < closebuttons.length; i++) {
		closebuttons[i].onclick = function() {
			ns.sescripts.settings.closeOverlay();
		};
	}
};

/* Checkbox Display Toggles */
ns.sescripts.settings.toggleScriptDisplay = function(toggleInput, active) {
	if(active == null) {
		active = toggleInput.checked;
	}
	
	if(active) {
		toggleInput.checked = true;
		toggleInput.parentNode.querySelector("span.active").style.display = "block";
		toggleInput.parentNode.querySelector("span.inactive").style.display = "none";
	}
	else {
		toggleInput.querySelector("input").checked = false;
		toggleInput.parentNode.querySelector("span.active").style.display = "none";
		toggleInput.parentNode.querySelector("span.inactive").style.display = "block";
	}
};

ns.sescripts.settings.toggleScriptSubsettingDisplay = function(toggleInput, active) {
	if(active == null) {
		active = toggleInput.checked;
	}
	
	if(active) {
		toggleInput.checked = true;
	}
	else {
		toggleInput.checked = false;
	}
};

ns.sescripts.settings.saveSettings = function() {
	var storageObject = {};
	storageObject.active = [];
	
	var scriptblocks = document.querySelectorAll("div.script-settings-container");
	for(var i = 0; i < scriptblocks.length; i++) {
		var script = scriptblocks[i].dataset.script;
		var active = scriptblocks[i].querySelector("div.script-settings input").checked;
		if(active) {
			storageObject.active.push(script);
			storageObject[script] = [];
			var script_subsettings_items = scriptblocks[i].querySelectorAll("div.script-subsettings li");
			for(var k = 0; k < script_subsettings_items.length; k++) {
				var item = script_subsettings_items[k];
				var checkbox = item.querySelector("input[type=checkbox]");
				var subsetting = item.dataset.subsetting;
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
	ns.sescripts.settings.toggleScriptDisplay(script);
	ns.sescripts.settings.saveSettings();
};

ns.sescripts.settings.toggleScriptSubsetting = function(script, subsetting) {
	ns.sescripts.settings.toggleScriptSubsettingDisplay(script, subsetting);
	ns.sescripts.settings.saveSettings();
};

ns.sescripts.settings.triggerScriptSubsettingOption = function(script, subsetting, option) {
	if(option == "jsonedit") {
		var storageName = "sescripts_" + script + "_" + subsetting;
		var overlaypage = document.querySelector("#jsonedit");
		chrome.storage.local.get(storageName, function(items) {
			var data = items[storageName];
			if(data == null || data == undefined) {
				data = ns.sescripts.settings.defaults[script][subsetting];
			}
			overlaypage.querySelector("textarea").value = JSON.stringify(data);
			ns.sescripts.settings.showOverlayPage(overlaypage);
		});
		
		var close = function() {
			// Clear Textarea
			overlaypage.querySelector("textarea").value = "";
			// Close Overlay
			ns.sescripts.settings.closeOverlay();
		};
		
		var f = function() {
			// Store data
			var data = JSON.parse(overlaypage.querySelector("textarea").value);
			storage_object = {};
			storage_object[storageName] = data;
			chrome.storage.local.set(storage_object, function () {
				// Clean Up
				close();
			});
		};
		
		var f2 = function() {
			// Store data
			var data = ns.sescripts.settings.defaults[script][subsetting];
			storage_object = {};
			storage_object[storageName] = data;
			chrome.storage.local.set(storage_object, function () {
				overlaypage.querySelector("textarea").value = JSON.stringify(data);
			});
		};
		
		overlaypage.querySelector("button[type=submit]").onclick = f;
		overlaypage.querySelector("button[type=submit]").addEventListener('keydown', function(e) {
			if (e.keyCode == 13) {
				f();
			}
		});
		
		overlaypage.querySelector("button[type=reset]").onclick = f2;
		overlaypage.querySelector("button[type=reset]").addEventListener('keydown', function(e) {
			if (e.keyCode == 13) {
				f2();
			}
		});
	}
};

ns.sescripts.settings.showOverlayPage = function(overlayPage) {
	ns.sescripts.settings.openOverlay();
};

ns.sescripts.settings.openOverlay = function() {
	var overlay = document.querySelector(".overlay");
	overlay.style.display = "-webkit-box";
};

ns.sescripts.settings.closeOverlay = function() {
	var overlay = document.querySelector(".overlay");
	overlay.style.display = "none";
};

ns.sescripts.settings.initialize();