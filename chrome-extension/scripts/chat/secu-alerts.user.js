var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.secu = ns.sescripts.secu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.secu = ns.sescripts.settings.secu || {};

/* Alerts */
ns.sescripts.secu.alerts = {};

ns.sescripts.secu.alerts.checkOldInterval = 0;
ns.sescripts.secu.alerts.freshAlerts = [];
ns.sescripts.secu.alerts.lastChecked = 0;

ns.sescripts.secu.alerts.saveSettings = function() {
	var alert_data = document.getElementById("secu-alerts-settings").getElementsByClassName("secu-alerts-alert-data");
	var storage_object = {};
	storage_object.data = [];
	for(var i = 0; i < alert_data.length; i++) {
		storage_object.data.push(alert_data[i].getElementsByClassName("secu-alerts-alert-data-alert")[0].value);
	}
	storage_object.sound = document.getElementById("secu-alerts-settings-sound").checked;
	chrome.storage.local.set({sescripts_secu_alerts: storage_object}, function () {
		ns.sescripts.settings.secu.alerts = storage_object;
	});
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
	
	alertData = ns.sescripts.settings.secu.alerts;
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
};

ns.sescripts.secu.alerts.checkNode = function(node, init) {
	alertData = ns.sescripts.settings.secu.alerts;
	
	var ret = false;
	var alerts = alertData.data;
	var sound = alertData.sound;
	var matched = false;
	if(node.nodeType == 3) {
		var s = new RegExp(alerts.join("|"), "ig");
		var m = node.nodeValue.match(s);
		if(m !== null) {
			matched = true;
			var newNode = document.createElement("span");
			var split = node.nodeValue.split(s);
			for(var i = 0; i < split.length-1; i++) {
				split[i] += "<span class=\"secu-alerts-alert\">" + m[i] + "</span>";
			}
			newNode.innerHTML = split.join("");
			
			node.parentElement.replaceChild(newNode, node);
			
			if(!init && sound) {
				document.getElementById("jp_audio_0").play();
			}
			
			ret = true;
		}
	}
	else {
		for(var i = 0; i < node.childNodes.length; i++) {
			if(ns.sescripts.secu.alerts.checkNode(node.childNodes[i], init)) {
				ret = true;
			}
		}
	}
	return ret;
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
	li.querySelector(".secu-alerts-alert-data-alert").focus();
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
		
		var alertData = ns.sescripts.settings.secu.alerts;
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
