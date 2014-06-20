// ==UserScript==
// @name		Stack Exchange Chat Utilities
// @namespace	sescripts-secu
// @version		1.0.2
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

var secu = ns.sescripts.secu;

secu.initInterval = 0;
secu.settings = null;

secu.alerts.checkOldInterval = 0;
secu.alerts.freshAlerts = [];
secu.alerts.lastChecked = 0;

secu.loadDefaultSettings = function() {
	return {active: ["secu"], secu: ["buttons", "clear", "alerts"]};
};

secu.loadSettings = function() {
	chrome.storage.sync.get("sescripts", function(items) {
		var settings = items.sescripts;
		if(settings === null || settings === undefined) {
			settings = secu.loadDefaultSettings();
		}
		
		if(settings.active === undefined) {
			settings.active = secu.loadDefaultSettings().active;
		}
		if(settings.secu === undefined) {
			settings.secu = secu.loadDefaultSettings().secu;
		}
		
		secu.settings = settings;
	});
};

secu.initialize = function() {
	if(secu.settings === null) return;
	
	window.clearInterval(secu.initInterval);
	
	if(secu.settings.active.indexOf("secu") >= 0) {
		secu.execute();
	}
};

secu.execute = function() {
	if(secu.settings.secu.indexOf("buttons") >= 0) {
		secu.buttons.execute();
	}
	
	if(secu.settings.secu.indexOf("clear") >= 0) {
		secu.clear.execute();
	}
	
	if(secu.settings.secu.indexOf("alerts") >= 0) {
		secu.alerts.execute();
	}
};

secu.buttonsOverride = function() {
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
secu.buttons.saveSettings = function() {
	var button_data = document.getElementById("secb-settings").getElementsByClassName("secb-button-data");
	var storage_object = {};
	storage_object.data = [];
	for(var i = 0; i < button_data.length; i++) {
		var button_object = {};
		button_object.name = button_data[i].getElementsByClassName("secb-button-data-name")[0].value;
		button_object.code = button_data[i].getElementsByClassName("secb-button-data-code")[0].value;
		button_object.send = button_data[i].getElementsByClassName("secb-button-data-send")[0].checked;
		storage_object.data.push(button_object);
	}
	localStorage.setItem("secb:buttons", JSON.stringify(storage_object));
	secu.buttons.reloadButtons();
};

secu.buttons.addSettingsRow = function(name, code, send) {
	var li = document.createElement("li");
	li.className = "secb-button-data";
	li.innerHTML += "<input class=\"secb-button-data-name\" type=\"text\" value=\"" + name + "\" />";
	li.innerHTML += "<textarea class=\"secb-button-data-code\">" + code + "</textarea>";
	li.innerHTML += "<input class=\"secb-button-data-send\" type=\"checkbox\"" + (send ? "checked=\"checked\"" : "") + " />";
	var button_delete = document.createElement("button");
	button_delete.innerHTML = "x";
	button_delete.onclick = function() {
		li.remove();
	};
	li.appendChild(button_delete);
	document.getElementById("secb-settings").appendChild(li);
};

secu.buttons.addEmptySettingsRow = function() {
	secu.buttons.addSettingsRow("", "", false);
};

secu.buttons.toggleSettingsMenu = function() {
	var settings_menu = document.getElementById("secb-settings");
	var button_settings = document.getElementById("secb-settings-button");
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
		button_save.onclick = secu.buttons.saveSettings;
		var button_add = document.createElement("button");
		button_add.innerHTML = "+";
		button_add.onclick = secu.buttons.addEmptySettingsRow;
		
		var li = document.createElement("li");
		li.appendChild(button_save);
		li.appendChild(button_add);
		settings_menu.appendChild(li);
		
		/* Button Data */
		var buttons = JSON.parse(localStorage.getItem("secb:buttons"));
		buttons.data.forEach(function(button) {
			secu.buttons.addSettingsRow(button.name, button.code, button.send);
		});
		
		settings_menu.style.display = "block";
	}
};

secu.buttons.reloadButtons = function() {
	var script_buttons = document.getElementById("secb-buttons");
	script_buttons.innerHTML = "";
	var buttons = localStorage.getItem("secb:buttons");
	if(buttons !== null) {
		buttons = JSON.parse(buttons);
	}
	else {
		buttons = {data: [{name:"shrug",code:"*shrug*",send:false},{name:"shrug&ast;",code:"*shrug*",send:true}]};
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
	localStorage.setItem("secb:buttons", JSON.stringify(buttons));
};

secu.buttons.loadCSS = function() {
	var secb_style = document.createElement("style");
	document.head.appendChild(secb_style);
	secb_style.innerHTML += "#secb-settings { width: 400px; height: 300px; list-style-type: none; margin: 0; padding: 0; background-color: #fff; border: 1px solid #eee; position: fixed; z-index: 10; display: none; overflow: auto; }";
	secb_style.innerHTML += "#secb-settings li { display: block; padding: 0.2em; }";
	secb_style.innerHTML += "#secb-settings li > * { vertical-align: middle; }";
	secb_style.innerHTML += "#secb-settings li input { max-width: 100px; }";
	secb_style.innerHTML += "#secb-settings li textarea { width: 200px; height: 2em; margin: 0 5px; }";
	secb_style.innerHTML += "#secb-buttons { margin-left: 5px; }";
	secb_style.innerHTML += "#chat-buttons { line-height: 1em; padding: 2px !important; }";
};

secu.buttons.execute = function() {
	if(!secu.buttons.checkWriteAccess()) return;
	
	/* Grab and override the button cell */
	var custom_buttons = secu.buttonsOverride();
	
	/* Setup for the settings button */
	var button_settings = document.createElement("button");
	button_settings.className = "button";
	button_settings.id = "secb-settings-button";
	button_settings.innerHTML = "buttons";
	button_settings.onclick = secu.buttons.toggleSettingsMenu;
	
	/* Add the settings button and a new div for our buttons */
	custom_buttons.appendChild(button_settings);
	custom_buttons.appendChild(document.createTextNode(" "));
	var script_buttons = document.createElement("div");
	script_buttons.id = "secb-buttons";
	document.getElementById("chat-buttons").appendChild(script_buttons);
	
	/* Create Settings menu */
	var settings_menu = document.createElement("ul");
	settings_menu.id = "secb-settings";
	document.body.appendChild(settings_menu);
	
	secu.buttons.reloadButtons();
	secu.buttons.loadCSS();
};

secu.buttons.checkWriteAccess = function() {
	if(document.getElementById("sayit-button") === null) return false;
	return true;
};

/* Clear */
secu.clear.execute = function() {
	/* Grab and override the button cell */
	var custom_buttons = secu.buttonsOverride();
	
	/* Setup for the clear button */
	var button_settings = document.createElement("button");
	button_settings.className = "button";
	button_settings.id = "secc-clear-button";
	button_settings.innerHTML = "clear";
	button_settings.onclick = secu.clear.clearTranscript;
	custom_buttons.appendChild(button_settings);
}

secu.clear.clearTranscript = function() {
	var monologues = document.getElementsByClassName("monologue");
	while(monologues.length) {
		monologues[0].parentNode.removeChild(monologues[0]);
	}
}

/* Alerts */
secu.alerts.saveSettings = function() {
	var alert_data = document.getElementById("seca-settings").getElementsByClassName("seca-alert-data");
	var storage_object = {};
	storage_object.data = [];
	for(var i = 0; i < alert_data.length; i++) {
		storage_object.data.push(alert_data[i].getElementsByClassName("seca-alert-data-alert")[0].value);
	}
	storage_object.sound = document.getElementById("seca-settings-sound").checked;
	localStorage.setItem("seca:alerts", JSON.stringify(storage_object));
};

secu.alerts.loadData = function() {
	var alerts = localStorage.getItem("seca:alerts");
	if(alerts === null) {
		return {data: [], sound: false};
	}
	else {
		return JSON.parse(alerts);
	}
};

secu.alerts.saveData = function(storageObject) {
	localStorage.setItem("seca:alerts", JSON.stringify(storageObject));
};

secu.alerts.checkOldMessages = function() {
	if(!secu.alerts.isLoaded()) return;
	
	window.clearInterval(secu.alerts.checkOldInterval);
	secu.alerts.checkNewMessages(true);
	secu.alerts.freshAlerts = [];
	
	window.setInterval(secu.alerts.checkNewMessages, 30, false);
};

secu.alerts.checkNewMessages = function(init) {
	secu.alerts.updateDisplay();
	
	var alerts = secu.alerts.loadData().data;
	var sound = secu.alerts.loadData().sound;
	
	var chat = document.getElementById("chat");
	var messages = chat.getElementsByClassName("content");
	var newLastChecked = secu.alerts.lastChecked;
	for(var i = (messages.length - 1); i >= 0; i--) {
		var content = messages[i];
		var monologue = content.parentElement.parentElement.parentElement;
		var message = content.parentElement;
		if((!init && (message.id.split("message-").join("") <= secu.alerts.lastChecked)) || i == 0) {
			if(secu.alerts.lastChecked != newLastChecked) secu.alerts.lastChecked = newLastChecked;
			return;
		}
		if(monologue.className.match("mine") === null && (monologue.style.display != "none")) {
			if(secu.alerts.checkNode(content, init)) {
				secu.alerts.freshAlerts.push(content.parentElement.id);
			}
			var id = content.parentElement.id.split("message-").join("");
			if(id >= newLastChecked) newLastChecked = id;
		}
	}
};

secu.alerts.checkNode = function(node, init) {
	var ret = false;
	var alerts = secu.alerts.loadData().data;
	var sound = secu.alerts.loadData().sound;
	if(node.nodeType == 3) {
		alerts.forEach(function(search) {
			if(node.nodeValue.match(search) !== null) {
				var newNode = document.createElement("span");
				newNode.innerHTML = node.nodeValue.split(search).join("<span class=\"seca-alert\">" + search + "</span>");
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
			if(secu.alerts.checkNode(node.childNodes[i], init)) {
				ret = true;
			}
		}
	}
	return ret;
};

secu.alerts.updateDisplay = function() {
	document.getElementById("seca-count").innerText = secu.alerts.freshAlerts.length;
};

secu.alerts.popAlert = function() {
	var id = secu.alerts.freshAlerts.pop();
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
		message.className += " seca-highlight";
		window.setTimeout(function() {
			message.className = message.className.split(" seca-highlight").join("");
		}, 1000);
	}
	secu.alerts.updateDisplay();
};

secu.alerts.addEmptySettingsRow = function() {
	secu.alerts.addSettingsRow("");
};

secu.alerts.addSettingsRow = function(alert) {
	var li = document.createElement("li");
	li.className = "seca-alert-data";
	li.innerHTML += "<input class=\"seca-alert-data-alert\" type=\"text\" value=\"" + alert + "\" />";
	var button_delete = document.createElement("button");
	button_delete.innerHTML = "x";
	button_delete.onclick = function() {
		li.remove();
	};
	li.appendChild(button_delete);
	document.getElementById("seca-settings").appendChild(li);
};

secu.alerts.toggleSettingsMenu = function() {
	var settings_menu = document.getElementById("seca-settings");
	var button_settings = document.getElementById("seca-settings-button");
	if(settings_menu.style.display == "block")  {
		/* Wipe */
		settings_menu.innerHTML = "";
		settings_menu.style.display = "none";
	}
	else {
		/* Position */
		settings_menu.style.top = (button_settings.getBoundingClientRect().top - 302) + "px";
		settings_menu.style.left = button_settings.getBoundingClientRect().left + "px";
		
		/* Load Data */
		var alerts = secu.alerts.loadData().data;
		var sound = secu.alerts.loadData().sound;
		
		/* Menu Buttons */
		var button_save = document.createElement("button");
		button_save.innerHTML = "Save";
		button_save.onclick = secu.alerts.saveSettings;
		var button_add = document.createElement("button");
		button_add.innerHTML = "+";
		button_add.onclick = secu.alerts.addEmptySettingsRow;
		var checkbox_sound = document.createElement("input");
		checkbox_sound.type = "checkbox";
		checkbox_sound.id = "seca-settings-sound";
		checkbox_sound.checked = sound;
		
		var li = document.createElement("li");
		li.appendChild(button_save);
		li.appendChild(button_add);
		li.appendChild(document.createTextNode("Sound: "));
		li.appendChild(checkbox_sound);
		settings_menu.appendChild(li);
		
		alerts.forEach(function(alert) {
			secu.alerts.addSettingsRow(alert);
		});
		
		settings_menu.style.display = "block";
	}
};

secu.alerts.loadCSS = function() {
	var seca_style = document.createElement("style");
	document.head.appendChild(seca_style);
	seca_style.innerHTML += "#seca-settings { width: 200px; height: 300px; list-style-type: none; margin: 0; padding: 0; background-color: #fff; border: 1px solid #eee; position: fixed; z-index: 10; display: none; overflow: auto; }";
	seca_style.innerHTML += "#seca-settings li { display: block; padding: 0.2em; }";
	seca_style.innerHTML += "#seca-settings li > * { vertical-align: middle; }";
	seca_style.innerHTML += "#seca-settings li input { max-width: 150px; }";
	seca_style.innerHTML += ".seca-alert { background-color: #DDBBBB; }";
	seca_style.innerHTML += ".seca-highlight { background-color: #EECCCC; }";
};

secu.alerts.isLoaded = function() {
	return ((document.getElementById("loading") === null) && (document.getElementById("chat") !== null));
};

secu.alerts.execute = function() {
	/* Grab and override the button cell */
	var custom_buttons = secu.buttonsOverride();
	
	/* Setup for the settings button */
	var button_settings = document.createElement("button");
	button_settings.className = "button";
	button_settings.id = "seca-settings-button";
	button_settings.innerHTML = "alerts";
	button_settings.onclick = secu.alerts.toggleSettingsMenu;
	custom_buttons.appendChild(button_settings);
	custom_buttons.appendChild(document.createTextNode(" "));
	
	/* Count Display */
	var alert_count = document.createElement("button");
	alert_count.className = "button";
	alert_count.id = "seca-count";
	alert_count.innerHTML = "0";
	alert_count.onclick = secu.alerts.popAlert;
	custom_buttons.appendChild(alert_count);
	custom_buttons.appendChild(document.createTextNode(" "));
	
	/* Create Settings menu */
	var settings_menu = document.createElement("ul");
	settings_menu.id = "seca-settings";
	document.body.appendChild(settings_menu);
	
	secu.alerts.checkOldInterval = window.setInterval(secu.alerts.checkOldMessages, 10);
	secu.alerts.loadCSS();
};

secu.loadSettings();
secu.initInterval = window.setInterval(secu.initialize, 10);