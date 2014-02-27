// ==UserScript==
// @name	Stack Exchange Chat Alerts
// @namespace	feichinger-seca
// @version	0.1
// @description	Adds quick-post buttons to chat
// @match       http://chat.stackexchange.com/rooms/*
// @match       http://chat.stackoverflow.com/rooms/*
// @match       http://chat.meta.stackoverflow.com/rooms/*
// @copyright	2014 - present FEichinger@AskUbuntu
// ==/UserScript==

var ns = ns || {};

ns.seca = {}

ns.seca.initInterval;

ns.seca.saveSettings = function() {
	var alert_data = document.getElementById("seca-settings").getElementsByClassName("seca-alert-data");
	var storage_object = {};
	storage_object.data = [];
	for(var i = 0; i < alert_data.length; i++) {
		storage_object.data.push(alert_data[i].getElementsByClassName("seca-alert-data-alert")[0].value);
	}
	storage_object.sound = document.getElementById("seca-settings-sound").checked;
	localStorage.setItem("seca:alerts", JSON.stringify(storage_object));
};

ns.seca.loadData = function() {
	var alerts = localStorage.getItem("seca:alerts");
	if(alerts === null) {
		return {data: [], sound: false};
	}
	else {
		return JSON.parse(alerts);
	}
};

ns.seca.saveData = function(storageObject) {
	localStorage.setItem("seca:alerts", JSON.stringify(storageObject));
};

ns.seca.initialize = function() {
	if(!ns.seca.isLoaded()) return;

	window.clearInterval(ns.seca.initInterval);
	var alerts = ns.seca.loadData().data;

	var chat = document.getElementById("chat");
	var messages = chat.getElementsByClassName("content");
	for(var i = 0; i < messages.length; i++) {
		content = messages[i];
		if(content.parentElement.parentElement.parentElement.className.match("mine") === null) {
			alerts.forEach(function(search) {
				for(var m = 0; m < content.childNodes.length; m++) {
					var node = content.childNodes[m];
					if(node.nodeType == 3 && node.nodeValue.match(search) !== null) {
						var newNode = document.createElement("span");
						newNode.innerHTML = node.nodeValue.split(search).join("<span class=\"seca-alert\">" + search + "</span>");
						content.replaceChild(newNode, node);
					}
				}
			});
			if(content.parentElement.parentElement.parentElement.className.match("seca-checked") === null) {
				content.parentElement.parentElement.parentElement.className += " seca-checked";
			}
		}
	};

	window.setInterval(ns.seca.checkNewMessages, 30);
};

ns.seca.checkNewMessages = function() {
	var alerts = ns.seca.loadData().data;
	var sound = ns.seca.loadData().sound;

	var chat = document.getElementById("chat");
	var monologues = chat.getElementsByClassName("monologue");
	for(var i = 0; i < monologues.length; i++) {
		var monologue = monologues[i];
		if(monologue.className.match("seca-checked") === null && monologue.className.match("mine") === null) {
			var messages = monologue.getElementsByClassName("messages");
			messages = messages[0].getElementsByClassName("message");
			for(var k = 0; k < messages.length; k++) {
				var message = messages[k];
				var content = message.getElementsByClassName("content");
				content = content[0];
				alerts.forEach(function(search) {
					for(var m = 0; m < content.childNodes.length; m++) {
						var node = content.childNodes[m];
						if(node.nodeType == 3 && node.nodeValue.match(search) !== null) {
							var newNode = document.createElement("span");
							newNode.innerHTML = node.nodeValue.split(search).join("<span class=\"seca-alert\">" + search + "</span>");
							content.replaceChild(newNode, node);
							if(sound) {
								document.getElementById("jp_audio_0").play();
							}
						}
					}
				});
			};
			monologue.className += " seca-checked";
		}
	};
};

ns.seca.addEmptySettingsRow = function() {
	ns.seca.addSettingsRow("");
};

ns.seca.addSettingsRow = function(alert) {
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

ns.seca.toggleSettingsMenu = function() {
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
		var alerts = ns.seca.loadData().data;
		var sound = ns.seca.loadData().sound;

		/* Menu Buttons */
		var button_save = document.createElement("button");
		button_save.innerHTML = "Save";
		button_save.onclick = ns.seca.saveSettings;
		var button_add = document.createElement("button");
		button_add.innerHTML = "+";
		button_add.onclick = ns.seca.addEmptySettingsRow;
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
			ns.seca.addSettingsRow(alert);
		});

		settings_menu.style.display = "block";
	}
};

ns.seca.loadCSS = function() {
	var seca_style = document.createElement("style");
	document.head.appendChild(seca_style);
	seca_style.innerHTML += "#seca-settings { width: 200px; height: 300px; list-style-type: none; margin: 0; padding: 0; background-color: #fff; border: 1px solid #eee; position: fixed; z-index: 10; display: none; overflow: auto; }";
	seca_style.innerHTML += ".seca-alert { background-color: #DDBBBB; }";
};

ns.seca.isLoaded = function() {
	return (document.getElementById("loading") === null);
};

ns.seca.execute = function() {
	/* Grab and override the button cell */
	var html_buttons = document.getElementById("chat-buttons");
	var custom_buttons;
	custom_buttons = document.getElementById("custom-buttons");
	if(custom_buttons === null) {
		var custom_buttons = document.createElement("span");
		custom_buttons.id = "custom-buttons";
		html_buttons.appendChild(custom_buttons);
	}

	/* Setup for the settings button */
	var button_settings = document.createElement("button");
	button_settings.className = "button";
	button_settings.id = "seca-settings-button";
	button_settings.innerHTML = "alerts";
	button_settings.onclick = ns.seca.toggleSettingsMenu;
	custom_buttons.appendChild(button_settings);
	custom_buttons.appendChild(document.createTextNode(" "));

	/* Create Settings menu */
	var settings_menu = document.createElement("ul");
	settings_menu.id = "seca-settings";
	document.body.appendChild(settings_menu);

	ns.seca.initInterval = window.setInterval(ns.seca.initialize, 10);
	ns.seca.loadCSS();
};

ns.seca.execute();