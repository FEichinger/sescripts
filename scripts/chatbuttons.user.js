// ==UserScript==
// @name	Stack Exchange Chat Buttons
// @namespace	feichinger-secb
// @version	0.2
// @description	Adds quick-post buttons to chat
// @match       http://chat.stackexchange.com/rooms/*
// @match       http://chat.stackoverflow.com/rooms/*
// @match       http://chat.meta.stackoverflow.com/rooms/*
// @copyright	2014 - present FEichinger@AskUbuntu
// ==/UserScript==

var ns = ns || {};

ns.secb = {};

ns.secb.saveSettings = function() {
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
	ns.secb.reloadButtons();
};

ns.secb.addSettingsRow = function(name, code, send) {
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

ns.secb.addEmptySettingsRow = function() {
	ns.secb.addSettingsRow("", "", false);
};

ns.secb.toggleSettingsMenu = function() {
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
		button_save.onclick = ns.secb.saveSettings;
		var button_add = document.createElement("button");
		button_add.innerHTML = "+";
		button_add.onclick = ns.secb.addEmptySettingsRow;

		var li = document.createElement("li");
		li.appendChild(button_save);
		li.appendChild(button_add);
		settings_menu.appendChild(li);

		/* Button Data */
		var buttons = JSON.parse(localStorage.getItem("secb:buttons"));
		buttons.data.forEach(function(button) {
			ns.secb.addSettingsRow(button.name, button.code, button.send);
		});

		settings_menu.style.display = "block";
	}
};

ns.secb.reloadButtons = function() {
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

ns.secb.loadCSS = function() {
	var secb_style = document.createElement("style");
	document.head.appendChild(secb_style);
	secb_style.innerHTML += "#secb-settings { width: 400px; height: 300px; list-style-type: none; margin: 0; padding: 0; background-color: #fff; border: 1px solid #eee; position: fixed; z-index: 10; display: none; overflow: auto; }";
	secb_style.innerHTML += "#secb-buttons { margin-left: 5px; }";
	secb_style.innerHTML += "#chat-buttons { line-height: 1em; padding: 2px !important; }";
};

ns.secb.execute = function() {
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
	button_settings.id = "secb-settings-button";
	button_settings.innerHTML = "buttons";
	button_settings.onclick = ns.secb.toggleSettingsMenu;

	/* Add the settings button and a new div for our buttons */
	custom_buttons.appendChild(button_settings);
	custom_buttons.appendChild(document.createTextNode(" "));
	var script_buttons = document.createElement("div");
	script_buttons.id = "secb-buttons";
	html_buttons.appendChild(script_buttons);

	/* Create Settings menu */
	var settings_menu = document.createElement("ul");
	settings_menu.id = "secb-settings";
	document.body.appendChild(settings_menu);

	ns.secb.reloadButtons();
	ns.secb.loadCSS();
};

ns.secb.checkWriteAccess = function() {
	if(document.getElementById("sayit-button") === null) return false;
	return true;
};

if(ns.secb.checkWriteAccess()) {
	ns.secb.execute();
}