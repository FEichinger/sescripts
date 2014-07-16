var ns = ns || {};
ns.sescripts = ns.sescripts || {};
ns.sescripts.settings = ns.sescripts.settings || {};

ns.sescripts.settings.defaults = {};
ns.sescripts.settings.defaults.settingsData = {active: ["secu", "sepu", "seeu"], sepu: ["timeline", "revision", "abbreviations"], secu: ["alerts", "buttons", "clear"]};
ns.sescripts.settings.defaults.secu = {};
ns.sescripts.settings.defaults.secu.buttons = {data: [{name:"shrug",code:"*shrug*",send:false},{name:"shrug&ast;",code:"*shrug*",send:true}]};
ns.sescripts.settings.defaults.secu.alerts = {data: [], sound: false};
ns.sescripts.settings.defaults.sepu = {};
ns.sescripts.settings.defaults.sepu.abbreviations = {data: [{abbreviation:"TK",action:{type:"title",value:"TeamKill"},casesensitive:true,highlight:false,tags:["league-of-legends"]}]};
