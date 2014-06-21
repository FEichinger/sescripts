// ==UserScript==
// @name		Stack Exchange Chat Utilities
// @namespace	sescripts-secu
// @version		1.1
// @description	Extends chat with word-monitoring (alerts), easy-to-use buttons, and a `clear` button to wipe the visible transcript.
// @match		*://chat.stackexchange.com/rooms/*
// @match		*://chat.stackoverflow.com/rooms/*
// @match		*://chat.meta.stackexchange.com/rooms/*
// @copyright	2014 - present FEichinger@VAD-Systems.de
// ==/UserScript==

var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.secu = {};
ns.sescripts.secu.alerts = {};
ns.sescripts.secu.buttons = {};
ns.sescripts.secu.clear = {};

/* Default Settings Fallback */
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.defaults = ns.sescripts.settings.defaults || {};
ns.sescripts.settings.defaults.settingsData = ns.sescripts.settings.defaults.settingsData || {active: ["secu", "sepu", "seeu"], sepu: ["timeline", "revision", "abbreviations"], secu: ["alerts", "buttons", "clear"]};
ns.sescripts.settings.defaults.secu = ns.sescripts.settings.defaults.secu || {};
ns.sescripts.settings.defaults.secu.buttons = ns.sescripts.settings.defaults.secu.buttons || {data: [{name:"shrug",code:"*shrug*",send:false},{name:"shrug&ast;",code:"*shrug*",send:true}]};
ns.sescripts.settings.defaults.secu.alerts = ns.sescripts.settings.defaults.secu.alerts || {data: [], sound: false};
ns.sescripts.settings.defaults.sepu = ns.sescripts.settings.defaults.sepu || {};
ns.sescripts.settings.defaults.sepu.abbreviations = ns.sescripts.settings.defaults.sepu.abbreviations || {data: []};
/* End Default Settings Fallback */

ns.sescripts.secu.initInterval = 0;
ns.sescripts.secu.settings = null;

ns.sescripts.secu.alerts.checkOldInterval = 0;
ns.sescripts.secu.alerts.freshAlerts = [];
ns.sescripts.secu.alerts.lastChecked = 0;

ns.sescripts.secu.loadDefaultSettings = function() {
	return ns.sescripts.settings.defaults.settingsData;
};

ns.sescripts.secu.loadSettings = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === null || settings === undefined) {
			settings = ns.sescripts.secu.loadDefaultSettings();
		}
		
		if(settings.active === undefined) {
			settings.active = ns.sescripts.secu.loadDefaultSettings().active;
		}
		if(settings.secu === undefined) {
			settings.secu = ns.sescripts.secu.loadDefaultSettings().secu;
		}
		
		ns.sescripts.secu.settings = settings;
	});
};

ns.sescripts.secu.initialize = function() {
	if(ns.sescripts.secu.settings === null) return;
	
	window.clearInterval(ns.sescripts.secu.initInterval);
	
	if(ns.sescripts.secu.settings.active.indexOf("secu") >= 0) {
		ns.sescripts.secu.execute();
	}
};

ns.sescripts.secu.execute = function() {
	if(ns.sescripts.secu.settings.secu.indexOf("buttons") >= 0) {
		ns.sescripts.secu.buttons.execute();
	}
	
	if(ns.sescripts.secu.settings.secu.indexOf("clear") >= 0) {
		ns.sescripts.secu.clear.execute();
	}
	
	if(ns.sescripts.secu.settings.secu.indexOf("alerts") >= 0) {
		ns.sescripts.secu.alerts.execute();
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
}

/* Buttons */
ns.sescripts.secu.buttons.saveSettings = function() {
	var button_data = document.getElementById("secu-buttons-settings").getElementsByClassName("secu-buttons-button-data");
	var storage_object = {};
	storage_object.data = [];
	for(var i = 0; i < button_data.length; i++) {
		var button_object = {};
		button_object.name = button_data[i].getElementsByClassName("secu-buttons-button-data-name")[0].value;
		button_object.code = button_data[i].getElementsByClassName("secu-buttons-button-data-code")[0].value;
		button_object.send = button_data[i].getElementsByClassName("secu-buttons-button-data-send")[0].checked;
		storage_object.data.push(button_object);
	}
	chrome.storage.local.set({sescripts_secu_buttons: storage_object}, function() {
		ns.sescripts.secu.buttons.reloadButtons();
	});
};

ns.sescripts.secu.buttons.addSettingsRow = function(name, code, send) {
	var li = document.createElement("li");
	li.className = "secu-buttons-button-data";
	li.innerHTML += "<input class=\"secu-buttons-button-data-name\" type=\"text\" value=\"" + name + "\" />";
	li.innerHTML += "<textarea class=\"secu-buttons-button-data-code\">" + code + "</textarea>";
	li.innerHTML += "<input class=\"secu-buttons-button-data-send\" type=\"checkbox\"" + (send ? "checked=\"checked\"" : "") + " />";
	var button_delete = document.createElement("button");
	button_delete.innerHTML = "x";
	button_delete.onclick = function() {
		li.remove();
	};
	li.appendChild(button_delete);
	document.getElementById("secu-buttons-settings").appendChild(li);
};

ns.sescripts.secu.buttons.addEmptySettingsRow = function() {
	ns.sescripts.secu.buttons.addSettingsRow("", "", false);
};

ns.sescripts.secu.buttons.toggleSettingsMenu = function() {
	var settings_menu = document.getElementById("secu-buttons-settings");
	var button_settings = document.getElementById("secu-buttons-settings-button");
	if(settings_menu.style.display == "block")  {
		/* Wipe */
		settings_menu.innerHTML = "";
		settings_menu.style.display = "none";
	}
	else {
		/* Position */
		settings_menu.style.top = (button_settings.getBoundingClientRect().top - 302) + "px";
		settings_menu.style.left = button_settings.getBoundingClientRect().left + "px";
		
		/* Menu Buttons */
		var button_save = document.createElement("button");
		button_save.innerHTML = "Save";
		button_save.onclick = ns.sescripts.secu.buttons.saveSettings;
		var button_add = document.createElement("button");
		button_add.innerHTML = "+";
		button_add.onclick = ns.sescripts.secu.buttons.addEmptySettingsRow;
		
		var li = document.createElement("li");
		li.appendChild(button_save);
		li.appendChild(button_add);
		settings_menu.appendChild(li);
		
		/* Button Data */
		chrome.storage.local.get("sescripts_secu_buttons", function(items) {
			var buttons = items.sescripts_secu_buttons;
			buttons.data.forEach(function(button) {
				ns.sescripts.secu.buttons.addSettingsRow(button.name, button.code, button.send);
			});
		});
		
		settings_menu.style.display = "block";
	}
};

ns.sescripts.secu.buttons.reloadButtons = function() {
	var script_buttons = document.getElementById("secu-buttons-buttons");
	script_buttons.innerHTML = "";
	chrome.storage.local.get("sescripts_secu_buttons", function(items) {
		var buttons = items.sescripts_secu_buttons;
		if(buttons == null || buttons == undefined) {
			buttons = ns.sescripts.settings.defaults.secu.buttons;
		}
		
		buttons.data.forEach(function(button) {
			var b = document.createElement("button");
			b.className = "button";
			b.innerHTML = button.name;
			if(button.send) {
				b.onclick = function() {
					document.getElementById("input").value += button.code + " ";
					document.getElementById("sayit-button").click();
				};
			}
			else {
				b.onclick = function() {
					document.getElementById("input").value += button.code + " ";
				};
			}
			script_buttons.appendChild(b);
			script_buttons.appendChild(document.createTextNode(" "));
		});
		
		chrome.storage.local.set({sescripts_secu_buttons: buttons});
	});
};

ns.sescripts.secu.buttons.loadCSS = function() {
	var secu_buttons_style = document.createElement("style");
	document.head.appendChild(secu_buttons_style);
	secu_buttons_style.innerHTML += "#secu-buttons-settings { width: 400px; height: 300px; list-style-type: none; margin: 0; padding: 0; background-color: #fff; border: 1px solid #eee; position: fixed; z-index: 10; display: none; overflow: auto; }";
	secu_buttons_style.innerHTML += "#secu-buttons-settings li { display: block; padding: 0.2em; }";
	secu_buttons_style.innerHTML += "#secu-buttons-settings li > * { vertical-align: middle; }";
	secu_buttons_style.innerHTML += "#secu-buttons-settings li input { max-width: 100px; }";
	secu_buttons_style.innerHTML += "#secu-buttons-settings li textarea { width: 200px; height: 2em; margin: 0 5px; }";
	secu_buttons_style.innerHTML += "#secu-buttons-buttons { margin-left: 5px; }";
	secu_buttons_style.innerHTML += "#chat-buttons { line-height: 1em; padding: 2px !important; }";
};

ns.sescripts.secu.buttons.execute = function() {
	if(!ns.sescripts.secu.buttons.checkWriteAccess()) return;
	
	/* Grab and override the button cell */
	var custom_buttons = ns.sescripts.secu.buttonsOverride();
	
	/* Setup for the settings button */
	var button_settings = document.createElement("button");
	button_settings.className = "button";
	button_settings.id = "secu-buttons-settings-button";
	button_settings.innerHTML = "buttons";
	button_settings.onclick = ns.sescripts.secu.buttons.toggleSettingsMenu;
	
	/* Add the settings button and a new div for our buttons */
	custom_buttons.appendChild(button_settings);
	custom_buttons.appendChild(document.createTextNode(" "));
	var script_buttons = document.createElement("div");
	script_buttons.id = "secu-buttons-buttons";
	document.getElementById("chat-buttons").appendChild(script_buttons);
	
	/* Create Settings menu */
	var settings_menu = document.createElement("ul");
	settings_menu.id = "secu-buttons-settings";
	document.body.appendChild(settings_menu);
	
	ns.sescripts.secu.buttons.reloadButtons();
	ns.sescripts.secu.buttons.loadCSS();
};

ns.sescripts.secu.buttons.checkWriteAccess = function() {
	if(document.getElementById("sayit-button") === null) return false;
	return true;
};

/* Clear */
ns.sescripts.secu.clear.execute = function() {
	/* Grab and override the button cell */
	var custom_buttons = ns.sescripts.secu.buttonsOverride();
	
	/* Setup for the clear button */
	var button_settings = document.createElement("button");
	button_settings.className = "button";
	button_settings.id = "secc-clear-button";
	button_settings.innerHTML = "clear";
	button_settings.onclick = ns.sescripts.secu.clear.clearTranscript;
	custom_buttons.appendChild(button_settings);
}

ns.sescripts.secu.clear.clearTranscript = function() {
	var monologues = document.getElementsByClassName("monologue");
	while(monologues.length) {
		monologues[0].parentNode.removeChild(monologues[0]);
	}
}

/* Alerts */
ns.sescripts.secu.alerts.saveSettings = function() {
	var alert_data = document.getElementById("secu-alerts-settings").getElementsByClassName("secu-alerts-alert-data");
	var storage_object = {};
	storage_object.data = [];
	for(var i = 0; i < alert_data.length; i++) {
		storage_object.data.push(alert_data[i].getElementsByClassName("secu-alerts-alert-data-alert")[0].value);
	}
	storage_object.sound = document.getElementById("secu-alerts-settings-sound").checked;
	chrome.storage.local.set({sescripts_secu_alerts: storage_object});
};

ns.sescripts.secu.alerts.checkOldMessages = function() {
	if(!ns.sescripts.secu.alerts.isLoaded()) return;
	
	window.clearInterval(ns.sescripts.secu.alerts.checkOldInterval);
	ns.sescripts.secu.alerts.checkNewMessages(true);
	ns.sescripts.secu.alerts.freshAlerts = [];
	
	window.setInterval(ns.sescripts.secu.alerts.checkNewMessages, 30, false);
};

ns.sescripts.secu.alerts.checkNewMessages = function(init) {
	ns.sescripts.secu.alerts.updateDisplay();
	
	chrome.storage.local.get("sescripts_secu_alerts", function(items) {
		var alertData = items.sescripts_secu_alerts;
		if(alertData == null || alertData == undefined) {
			alertData = {data: [], sound: false};
		}
		
		var alerts = alertData.data;
		var sound = alertData.sound;
		var chat = document.getElementById("chat");
		var messages = chat.getElementsByClassName("content");
		var newLastChecked = ns.sescripts.secu.alerts.lastChecked;
		for(var i = (messages.length - 1); i >= 0; i--) {
			var content = messages[i];
			var monologue = content.parentElement.parentElement.parentElement;
			var message = content.parentElement;
			if((!init && (message.id.split("message-").join("") <= ns.sescripts.secu.alerts.lastChecked)) || i == 0) {
				if(ns.sescripts.secu.alerts.lastChecked != newLastChecked) ns.sescripts.secu.alerts.lastChecked = newLastChecked;
				return;
			}
			if(monologue.className.match("mine") === null && (monologue.style.display != "none")) {
				if(ns.sescripts.secu.alerts.checkNode(content, init)) {
					ns.sescripts.secu.alerts.freshAlerts.push(content.parentElement.id);
				}
				var id = content.parentElement.id.split("message-").join("");
				if(id >= newLastChecked) newLastChecked = id;
			}
		}
	});
};

ns.sescripts.secu.alerts.checkNode = function(node, init) {
	chrome.storage.local.get("sescripts_secu_alerts", function(items) {
		var alertData = items.sescripts_secu_alerts;
		if(alertData == null || alertData == undefined) {
			alertData = ns.sescripts.settings.defaults.secu.alerts;
		}
		
		var ret = false;
		var alerts = alertData.data;
		var sound = alertData.sound;
		if(node.nodeType == 3) {
			alerts.forEach(function(search) {
				if(node.nodeValue.match(search) !== null) {
					var newNode = document.createElement("span");
					newNode.innerHTML = node.nodeValue.split(search).join("<span class=\"secu-alerts-alert\">" + search + "</span>");
					node.parentElement.replaceChild(newNode, node);
					if(!init && sound) {
						document.getElementById("jp_audio_0").play();
					}
					ret = true;
				}
			});
		}
		else {
			for(var i = 0; i < node.childNodes.length; i++) {
				if(ns.sescripts.secu.alerts.checkNode(node.childNodes[i], init)) {
					ret = true;
				}
			}
		}
		return ret;
	});
};

ns.sescripts.secu.alerts.updateDisplay = function() {
	document.getElementById("secu-alerts-count").innerText = ns.sescripts.secu.alerts.freshAlerts.length;
};

ns.sescripts.secu.alerts.popAlert = function() {
	var id = ns.sescripts.secu.alerts.freshAlerts.pop();
	if(id === undefined) {
		console.log("No alert found.");
		return;
	}
	
	var message = document.getElementById(id)
	if(message === null) {
		console.log("Message too old. Cannot scroll.");
	}
	else {
		message.scrollIntoView();
		message.className += " secu-alerts-highlight";
		window.setTimeout(function() {
			message.className = message.className.split(" secu-alerts-highlight").join("");
		}, 1000);
	}
	ns.sescripts.secu.alerts.updateDisplay();
};

ns.sescripts.secu.alerts.addEmptySettingsRow = function() {
	ns.sescripts.secu.alerts.addSettingsRow("");
};

ns.sescripts.secu.alerts.addSettingsRow = function(alert) {
	var li = document.createElement("li");
	li.className = "secu-alerts-alert-data";
	li.innerHTML += "<input class=\"secu-alerts-alert-data-alert\" type=\"text\" value=\"" + alert + "\" />";
	var button_delete = document.createElement("button");
	button_delete.innerHTML = "x";
	button_delete.onclick = function() {
		li.remove();
	};
	li.appendChild(button_delete);
	document.getElementById("secu-alerts-settings").appendChild(li);
};

ns.sescripts.secu.alerts.toggleSettingsMenu = function() {
	var settings_menu = document.getElementById("secu-alerts-settings");
	var button_settings = document.getElementById("secu-alerts-settings-button");
	if(settings_menu.style.display == "block")  {
		/* Wipe */
		settings_menu.innerHTML = "";
		settings_menu.style.display = "none";
	}
	else {
		/* Position */
		settings_menu.style.top = (button_settings.getBoundingClientRect().top - 302) + "px";
		settings_menu.style.left = button_settings.getBoundingClientRect().left + "px";
		
		chrome.storage.local.get("sescripts_secu_alerts", function(items) {
			var alertData = items.sescripts_secu_alerts;
			if(alertData == null || alertData == undefined) {
				alertData = {data: [], sound: false};
			}
			
			/* Load Data */
			var alerts = alertData.data;
			var sound = alertData.sound;
			
			/* Menu Buttons */
			var button_save = document.createElement("button");
			button_save.innerHTML = "Save";
			button_save.onclick = ns.sescripts.secu.alerts.saveSettings;
			var button_add = document.createElement("button");
			button_add.innerHTML = "+";
			button_add.onclick = ns.sescripts.secu.alerts.addEmptySettingsRow;
			var checkbox_sound = document.createElement("input");
			checkbox_sound.type = "checkbox";
			checkbox_sound.id = "secu-alerts-settings-sound";
			checkbox_sound.checked = sound;
			
			var li = document.createElement("li");
			li.appendChild(button_save);
			li.appendChild(button_add);
			li.appendChild(document.createTextNode("Sound: "));
			li.appendChild(checkbox_sound);
			settings_menu.appendChild(li);
			
			alerts.forEach(function(alert) {
				ns.sescripts.secu.alerts.addSettingsRow(alert);
			});
			
			settings_menu.style.display = "block";
		});
	}
};

ns.sescripts.secu.alerts.loadCSS = function() {
	var secu_alerts_style = document.createElement("style");
	document.head.appendChild(secu_alerts_style);
	secu_alerts_style.innerHTML += "#secu-alerts-settings { width: 200px; height: 300px; list-style-type: none; margin: 0; padding: 0; background-color: #fff; border: 1px solid #eee; position: fixed; z-index: 10; display: none; overflow: auto; }";
	secu_alerts_style.innerHTML += "#secu-alerts-settings li { display: block; padding: 0.2em; }";
	secu_alerts_style.innerHTML += "#secu-alerts-settings li > * { vertical-align: middle; }";
	secu_alerts_style.innerHTML += "#secu-alerts-settings li input { max-width: 150px; }";
	secu_alerts_style.innerHTML += ".secu-alerts-alert { background-color: #DDBBBB; }";
	secu_alerts_style.innerHTML += ".secu-alerts-highlight { background-color: #EECCCC; }";
};

ns.sescripts.secu.alerts.isLoaded = function() {
	return ((document.getElementById("loading") === null) && (document.getElementById("chat") !== null));
};

ns.sescripts.secu.alerts.execute = function() {
	/* Grab and override the button cell */
	var custom_buttons = ns.sescripts.secu.buttonsOverride();
	
	/* Setup for the settings button */
	var button_settings = document.createElement("button");
	button_settings.className = "button";
	button_settings.id = "secu-alerts-settings-button";
	button_settings.innerHTML = "alerts";
	button_settings.onclick = ns.sescripts.secu.alerts.toggleSettingsMenu;
	custom_buttons.appendChild(button_settings);
	custom_buttons.appendChild(document.createTextNode(" "));
	
	/* Count Display */
	var alert_count = document.createElement("button");
	alert_count.className = "button";
	alert_count.id = "secu-alerts-count";
	alert_count.innerHTML = "0";
	alert_count.onclick = ns.sescripts.secu.alerts.popAlert;
	custom_buttons.appendChild(alert_count);
	custom_buttons.appendChild(document.createTextNode(" "));
	
	/* Create Settings menu */
	var settings_menu = document.createElement("ul");
	settings_menu.id = "secu-alerts-settings";
	document.body.appendChild(settings_menu);
	
	ns.sescripts.secu.alerts.checkOldInterval = window.setInterval(ns.sescripts.secu.alerts.checkOldMessages, 10);
	ns.sescripts.secu.alerts.loadCSS();
};

ns.sescripts.secu.loadSettings();
ns.sescripts.secu.initInterval = window.setInterval(ns.sescripts.secu.initialize, 10);