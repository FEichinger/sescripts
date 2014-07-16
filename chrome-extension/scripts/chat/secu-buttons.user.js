var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.secu = ns.sescripts.secu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.secu = ns.sescripts.settings.secu || {};

/* Buttons */
ns.sescripts.secu.buttons = {};
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
		ns.sescripts.settings.secu.buttons = storage_object;
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
	li.querySelector(".secu-buttons-button-data-name").focus();
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
	var buttons = ns.sescripts.settings.secu.buttons;
	
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
