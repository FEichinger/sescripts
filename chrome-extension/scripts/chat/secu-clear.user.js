var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.secu = ns.sescripts.secu || {};
ns.sescripts.settings = ns.sescripts.settings || {};
ns.sescripts.settings.secu = ns.sescripts.settings.secu || {};

/* Clear */
ns.sescripts.secu.clear = {};
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
};

ns.sescripts.secu.clear.clearTranscript = function() {
	var monologues = document.getElementsByClassName("monologue");
	while(monologues.length) {
		monologues[0].parentNode.removeChild(monologues[0]);
	}
};
