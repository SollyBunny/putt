const Settings = {}
Settings._settings = localStorage["s"].split(",").map(i => {
	return window.decodeURIComponent(i);
}); // Persistent Settings
Settings.NAME           = Settings._settings[0];
Settings.COLOR          = parseInt(Settings._settings[1], 16);
Settings.SENSITIVITY    = parseInt(Settings._settings[2]) / 10000;
Settings.ARROWDISTANCE  = parseInt(Settings._settings[3]);
Settings.FOV            = parseInt(Settings._settings[4]);
Settings.RENDERDISTANCE = parseInt(Settings._settings[5]);
Settings.BGCOLOR        = parseInt(Settings._settings[6], 16);
Settings.MAXFPS         = parseInt(Settings._settings[7]);
Settings.FOG            = parseInt(Settings._settings[8]);
Settings.DUST           = parseInt(Settings._settings[9]);
Settings.LIGHTING       = parseInt(Settings._settings[10]);
Settings.HIPOLYBALL     = parseInt(Settings._settings[11]);
export default Settings;
