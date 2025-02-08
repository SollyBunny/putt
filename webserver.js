#!/usr/bin/env node

// https://github.com/SollyBunny/ZISS
// ZISS: Ziss Is So Silly

/*
	0. Foreword
		Created by SollyBunny (find me on Discord)
		You can do almost anything with this: share, fork, use (look at license)

	1. Config File

	1.1 Location
		Default location for config file is `./conf.json`
		The first argument overrides this
		Arguments starting with + add to it
		Both relative and absolute file paths work
		Note: *1
	1.2	Format
		JSON :)
	1.3 Properties
		"NAME":
			Specifies the name of the server
			Default: "NodeJS Web Server"
		"DIRFILES":
			The directory of the files to be served
			Note: *1
			Default "files"
		"DIRKEY":
			The path to the key file for https
			Note: Both DIRKEY and DIRCERT must be specified and valid for https to be enabled
			Note: *1
			Default: undefined
		"DIRCERT":
			The path to the cert file for https
			Note: Both DIRKEY and DIRCERT must be specified and valid for https to be enabled
			Note: *1
			Default: undefined
		"FORCEHTTPS":
			Regardless of DIRKEY and DIRCERT, enable https with true, otherwise false
			NOTE: This will most likely mess with websockets
		"ERRFOLDER":
			The file to use if the path is a folder
			The folder will be passed in the query string
			If none is specified, a "folder" message is sent in it's place
			Note: *1
			Default: undefined
		"ERRPERM":
			The file to use if the user doesn't have permission to access a path
			The path will be passed in the query string
			If none is specified, a 403 message is sent in it's place
			Note: *1
			Default: undefined
		"PORT":
			The port to use for server
			If none is specified, 80 is used for http and 443 for https
			Default: undefined
		"DEV":
			If set to true will remove all caching
			Default: false
		"USER":
			A dictionary of user, password pairs
			(See 2.1 Users)
			Default: {}
		"HEAD":
			A dictionary of file extension, [ mime, (ttl), (cors) ] pairs
			This shoudn't need to be changed unless you need new formats
			Default: { <a big dictionary> }
		"REPL":
			If set to true will run the REPL (read eval print loop) on startup
			Default: false
	1.4 Example
		```json
			{
				"NAME"      : "Solly's Web Server",
				"DIRFILES"  : "files",
				"DIRFOLDER" : "files/explorer/index.html",
				"DIRKEY"    : "files/admin/cert/privkey.pem",
				"DIRCERT"   : "files/admin/cert/fullchain.pem",
				"PORT"      : 6567,
				"USER"      : {
					"admin": "password123"
					"solly": "bunny"
				},
			}
		```

	2. Permissions

	2.1 Users
		Users can be given special permissions to folders
		This can be used to protect folders
		The users credentials should be stored in cookies in u for user and p for password
		(See 2.2 .perm)

	2.2 .perm
		.perm files can be placed in any directory 1 deep in DIRFILES
		Inside is a comma delimited list of users who have exclusive access to the folder and it's contents
		An example could be "admin,solly,bunny"

	3. Scripts

	3.1 Builtin Functions
		Both fs and url modules are in the global scope
		There is also conf for the current config
		There are also util methods
		util.typeof(file: String) => Enum
			Returns what type of file file is
			-1: doesn't exist (or error preventing it from being opened)
			 0: regular file
			 1: directory
			 2: script
			 3: wsscript
			 4: uscript (both script and wsscript)
		util.checkperm(file: String, user: String, pass: String) => Boolean
			Checks wether a user has access to a file
			If you have access to the cookie object you can pass in
			cookie.u as the user and
			cookie.p as the pass
		util.parsecookie(cookie) => Object<key: value>
			Parses a cookie into an object
		util.fetch(url: String) => Promise<String>
			Fetch a url of the interwebs
		util.require(file: String) => Object
			Here be dragons: You aren't meant to be able to do this
			Similar to NodeJS require but will always assume the source file is Javascript (thus not requiring .(m)js extension)

	3.2 Web Scripts
		Web Scripts are pages whose output are completely determined by a script run on server side
		This opens up both possibilities to offer dynamic content, api endpoints and form endpoints, but they also open up possibilities to be exploited
		Please make use to sanitize any input and use the function url.checkperm to see if a user has access to a file
		Web scripts use the identifier `// ZISS SCRIPT` at the start to mark them
		Here is the format of a web script
		```js
			// ZISS SCRIPT
			module.exports.handle = (req, res) => {
				res.writeHead(200);
				res.end("Hello World");
			};
		```
		You can use the NodeJS documentation to figure out how to use this
		There are also properties which are added to the req object
			req.ip     : the users IP
			req.url    : a url object to the original request
			req.cookie : a parsed cookie object

	3.3 Websocket Scripts (wsscripts)
		Wsscripts provide a neat interface for the websockets
		They the identifier `// ZISS WSSCRIPT` at the start to mark them
		Here is the format of a websocket script
		```js
			// ZISS WSSCRIPT
			module.exports.open = (ws) => {
				
			}
			module.exports.msg = (ws, msg) => {
				
			}
			module.exports.close = (ws) => {
				
			}
		```
		Note: all of the functions are optional
		There are also properties which are added to the req object (you can add more, and they will be remembered)
			ws.ip     : the users IP
			ws.url    : a url object to the original upgrade request
			ws.cookie : a parsed cookie object

	3.4: Universal Scripts (uscripts)
		Uscripts are a combination of both scripts and websocket scripts
		If fetched by a browser they will run execute the handle method
		If a websocket attempts to connect to it, it will run the websocket methods
		United scripts use the identifier `// ZISS USCRIPT` at the start to mark them
		Here is the format of a joint script
		```js
			// ZISS USCRIPT
			module.exports.open = (ws) => {
				
			};
			module.exports.msg = (ws, msg) => {
				
			}
			module.exports.close = (ws) => {
				
			}
			module.exports.handle = (req, res) => {
				
			}
		```
	*1:	all relative file paths are always relative to the folder this file is in
		for files in the DIRFILES folder, you still must specify the full relative path	
*/

// Log
global.log = (m) => {
	log.raw(36, m);
};
log.raw = (c, m) => {
	console.log(`\x1b[${c}m[${log.time()}]\x1b[0m ${m}`);
}
log.warn = (m) => {
	log.raw(33, m);
};
log.error = (m) => {
	log.raw(31, m);
};
log.fake = (...m) => {
	let out = "";
	const old = process.stdout.write;
	process.stdout.write = (a, b, c) => {
		out += a;
	};
	console.log(...m);
	process.stdout.write = old;
	return out;
};
log.time = () => {
	const d = new Date();
	return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDay() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}.${String(d.getSeconds()).padStart(2, "0")}`
};

// args
const configdirs = [undefined];
for (let i = 2; i < process.argv.length; ++i) {
	const arg = process.argv[i];
	switch (arg[0]) {
		case "-":
			switch (arg.toLowerCase()) {
				case "-h":
				case "--help":
					console.log(`Usage: ${__filename.slice(__filename.lastIndexOf("/") + 1)} [CONFIGDIR] [...+CONFGIDIRADD] [...KEY=VALUE] -h/--help -s/--setcap`);
					process.exit(0);
				case "-s":
				case "--setcap":
					require("child_process").execSync(`sudo $(which setcap) "cap_net_bind_service=+ep" $(which ${process.argv[0]})`);
					process.exit(0);
				default:
					log.warn(`Config: Unknown flag ${process.argv[i]}`);
			}
			break;
		case "+":
			configdirs.push(arg.slice(1));
			break;
		default:
			if (arg.indexOf("=") !== -1) {
				configdirs.push(arg);
				break;
			}
			if (configdirs[0])
				log.warn(`Config: Config file ${configdirs[0]} overridden by ${arg}`);
			configdirs[0] = arg;
	}
}
configdirs[0] = configdirs[0] || "conf.json";

// Globals
global.fs   = require("fs");
global.url  = require("url");
global.path = require("path");
global.util = {};

// Utils
util.typeof = file => {
	/*
		Get the "type" of a file:
		-1: file doesn't exist (or error preventing it from being opened)
		0: normal file
		1: directory
		2: script
		3: wsscript
		4: uscript (both script and wsscript)
	*/
	let stat;
	try {
		stat = fs.statSync(file);
	} catch (e) {
		return -1;
	}
	if (stat.isDirectory()) return 1;
	let fd;
	try {
		fd = fs.openSync(file, "r");
	} catch (e) {
		return -1;
	}
	let buf = Buffer.alloc(16);
	try {
		fs.readSync(fd, buf, 0, 16, 0);
	} catch (e) {
		return -1;
	} finally {
		fs.closeSync(fd);
	}
	let str = buf.toString("utf-8");
	if (!str.startsWith("// ZISS ")) return 0;
	str = str.slice(8);
	if (str.startsWith("SCRIPT")) return 2;
	if (str.startsWith("WSSCRIPT")) return 3;
	if (str.startsWith("USCRIPT")) return 4;
	return 0;
};
util.checkperm = (file, user, pass) => {
	parts = "";
	if (file.endsWith("/"))
		file = file.slice(0, -1);
	while (1) {
		const path = `${file}/.perm`;
		const i = file.lastIndexOf("/");
		if (i === -1) break;
		file = file.slice(0, i);
		try {
			stat = fs.statSync(path);
		} catch (e) {
			if (e.code !== "ENOENT" && e.code != "ENOTDIR") throw e;
			continue;
		}
		if (!stat.isFile()) continue;
		if (
			!user ||
			!pass ||
			!conf.USER[user] ||
			conf.USER[user] !== pass ||
			fs.readFileSync(path).toString().trim().split(/[ ,]/g).indexOf(user) === -1
		) return false;
	}
	return true;
}
util.parsecookie = cookie => {
	if (!cookie) return {};
	let tempcookie = cookie.split(";");
	cookie = {};
	let m;
	for (let i = 0; i < tempcookie.length; ++i) {
		if ((m = tempcookie[i].indexOf("=")) === -1) continue;
		cookie[tempcookie[i].slice(0, m).trimLeft(" ")] = tempcookie[i].slice(m + 1);
	}
	return cookie;
}
util.requirecache = {};
util.require = file => {
	file = path.resolve(file);
	// if (!conf.DEV)
		if (util.requirecache[file]) return util.requirecache[file];
	let code;
	code = fs.readFileSync(file).toString(); // this should error on fail
	code = `(module,_import,__filename,__dirname)=>{${code}}`;
	code = eval(code);
	const fakeDirname = path.dirname(file);
	const fakeModule = { exports: {} };
	const fakeImport = path => {
		return import(`${fakeDirname}/${path}`);
	};
	code(fakeModule, fakeImport, file, fakeDirname);
	// if (!conf.DEV)
		util.requirecache[file] = fakeModule.exports;
	return fakeModule.exports;
};

// Check working dir
if (__dirname !== process.cwd()) process.chdir(__dirname);

// Config
global.conf = {
	"NAME"      : "NodeJS Web Server",
	"DIRFILES"  : "files",
	"DIRKEY"    : undefined,
	"DIRCERT"   : undefined,
	"FORCEHTTPS": false,
	"ERRFOLDER" : undefined,
	"ERRPERM"   : undefined,
	"ERR404"    : undefined,
	"PORT"      : undefined,
	"SCRIPTS"   : [],
	"WSSCRIPTS" : [],
	"USER"      : {},
	"HEAD"      : {
		"html"  : ["text/html"       , undefined],
		"htm"   : ["text/html"       , undefined],
		"css"   : ["text/css"        , undefined, "*"],
		"mjs"   : ["text/javascript" , undefined, "*"],
		"js"    : ["text/javascript" , undefined, "*"],
		"woff2" : ["font/woff2"      , 2147483647, "*"],
		"ttf"   : ["font/ttf"        , 2147483647, "*"],
		"otf"   : ["font/otf"        , 2147483647, "*"],
		"ico"   : ["image/x-image"   , 2147483647, "*"],
		"png"   : ["image/png"       , 2147483647, "*"],
		"jpg"   : ["image/jpeg"      , 2147483647, "*"],
		"jpeg"  : ["image/jpeg"      , 2147483647, "*"],
		"mp4"   : ["video/mp4"       , 2147483647, "*"],
		"mkv"   : ["video/x-matroska", 2147483647, "*"],
		"m4a"   : ["audio/m4a"       , 2147483647, "*"],
		"svg"   : ["image/svg+xml"   , 2147483647, "*"],
		"webp"  : ["image/webp"      , 2147483647, "*"],
		"weba"  : ["audio/weba"      , 2147483647, "*"],
		"webm"  : ["video/webm"      , 2147483647, "*"],
		"wav"   : ["audio/wav"       , 2147483647, "*"],
		"pdf"   : ["application/pdf" , 2147483647, "*"],
	},
	"REPL"      : false,
	"DEV"       : false,
	load: (file) => {
		{
			const i = file.indexOf("=");
			if (i !== -1) {
				const key = file.slice(0, i).toUpperCase();
				const value = file.slice(i + 1);
				if (key in conf) {
					log(`Config: Set ${key} to ${value || "undefined"}`);
					conf[key] = value ? JSON.parse(value) : undefined;
				} else {
					log.warn(`Config: ${key} is not a valid key`);
				}
				return;
			}
		}
		let data;
		try { // attempt to read file
			data = fs.readFileSync(file);
		} catch (e) {
			log.error(`Config: Failed to config file ${file}: ${e.code}`);
			return;
		}
		try { // attempt to load file
			data = JSON.parse(data);
		} catch (e) {
			log.error(`Config: Failed to parse config file ${file}: ${e.message[0].toLowerCase()}${e.message.slice(1, e.message.indexOf(","))}`);
		}
		for (let i in data) {
			key = i.toUpperCase();
			if (key in conf)
				conf[key] = data[key];
			else if (!key.startsWith("_"))
				log.warn(`Config: In ${file}, ${key} is not a valid key`);
		}
		log(`Config: Loaded ${file}`);
	}
}
configdirs.forEach(conf.load);

function populatereq(req) {
	req.ip     = req.headers["x-forwarded-for"] || (req.socket || req.connection).remoteAddress;
	req.url    = url.parse(req.url, false);
	req.cookie = util.parsecookie(req.headers.cookie);
	// parse url
	req.path = req.url.pathname;
	if (req.path.length < 1) { // no pathname
		req.path = "/";
	} else {
		req.path = decodeURIComponent(req.path); // remove any html entities
		req.path = req.path.replaceAll("/../", ""); // remove /.. in the start, middle
		while (req.path.endsWith("/..")) // remove /.. at end
			req.path = req.path.slice(0, -3);
		while (req.path.startsWith("../")) // remove ../ at end
			req.path = req.path.slice(3);
	}
	req.pathorig = req.path;
	req.path = `${conf.DIRFILES}/${req.path}`;
	return req;
}

// HTTPserver

function HTTPhandle(req, res) {
	populatereq(req);
	// main
	let depth = 0;
	const out = { code: 200, head: { "Content-Type": "text/html" } };
	function calcres() {
		if ((depth++) > 5) {
			out.code = 508;
			out.data = "Loop detected";
			return;
		}
		if (!util.checkperm(req.path, req.cookie.u, req.cookie.p)) {
			out.errperm = true;
			if (conf.ERRPERM) {
				req.path = `${conf.DIRFILES}/${conf.ERRPERM}`;
				calcres();
				return;
			}
			out.code = 401;
			out.data = "Unauthorized";
			return;
		}
		switch (util.typeof(req.path)) {
			case -1: // file doesn't exist
				out.err404 = true
				if (conf.ERR404) {
					req.path = `${conf.DIRFILES}/${conf.ERR404}`;
					calcres();
					return;
				}
				out.code = 404;
				out.data = "Not found";
				return;
			case 0: // normal file
				let ext = req.path.slice(req.path.lastIndexOf(".") + 1);
				if (conf.HEAD[ext]) {
					out.head["Content-Type"] = conf.HEAD[ext][0];
					if (conf.DEV) {
						out.head["Cache-Control"] = "max-age=0";
						out.head["Access-Control-Allow-Origin"] = "*";
					} else {
						if (conf.HEAD[ext][1]) // has cache
							out.head["Cache-Control"] = `max-age=${conf.HEAD[ext][1]}`;
						if (conf.HEAD[ext][2]) // has cors
							out.head["Access-Control-Allow-Origin"] = `${conf.HEAD[ext][2]}`;
					}
				}
				out.pipe = req.path;
				return;
			case 3: // wsscript
				out.pipe = req.path;
				out.head["Content-Type"] = "application/javascript";
				return;
			case 1: // directory
				out.errfolder = true;
				if (!req.pathorig.endsWith("/")) { // make sure directories end with a slash
					out.code = 307;
					out.head = {
						"Location": req.pathorig+ "/"
					};
					return;
				}
				if (!fs.existsSync(`${req.path}/index.html`)) { // this dir doesn't have a index page
					if (conf.ERRFOLDER) {
						req.path = `${conf.DIRFILES}/${conf.ERRFOLDER}`;
						calcres();
						return;
					} else {
						out.code = 200;
						out.head["Content-Type"] = "text/html";
						out.data = `<h1>Directory: ${req.path}</h1><br>`;
						if (req.path !== "/")
							out.data += `<a href="..">..</a><br>`;
						for (const file of fs.readdirSync(req.path)) {
							out.data += `<a href="./${file}">${file}</a><br>`;
						}
					}
				} else {
					out.pipe = `${req.path}/index.html`;
				}
				return;
			case 2: // script
			case 4: // uscript
				out.script = true;
				out.done = true;
				try {
					util.require(req.path).handle(req, res);
				} catch (e) {
					log.error(e);
				}
				return;
		}
	}
	calcres();
	const add = [];
	if (out.script) add.push("script");
	if (out.err404) add.push("404");
	if (out.errperm) add.push("perm");
	if (out.errfolder) add.push("dir");
	log(`${req.ip}: "${req.pathorig}"${req.headers.cookie ? ` "${req.headers.cookie}"` : ""} ${add.join(" ")}`);
	if (out.done) return;
	if (out.pipe) {
		const stat = fs.statSync(out.pipe);
		const range = req.headers.range;
		let start, end;
		if (range) {
			const parts = range.replace(/bytes=/, "").split("-");
			start = parseInt(parts[0], 10);
			end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
			if (start < 0 || end < 0 || start >= end || start >= stat.size || end >= stat.size) {
				out.head["Content-Range"] = `bytes */${stat.size}`;
				res.writeHead(out.code, out.head);
				res.end();
				return;
			}
			out.head["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
			out.head["Accept-Ranges"] = "bytes";
			out.head["Content-Length"] = end - start + 1;
		} else {
			out.head["Content-Length"] = stat.size;
		}
		res.writeHead(out.code ?? 206, out.head);
		const pipe = fs.createReadStream(out.pipe, { start, end });
		pipe.pipe(res);
		pipe.on("error", e => {
			res.end("error: " + e.message);
		});
	} else if (out.data) {
		out.head["Content-Length"] = out.data.length;
		res.writeHead(out.code, out.head);
		res.end(out.data);
	} else {
		res.writeHead(out.code, out.head);
		res.end();
	}
}
let HTTPserver;
let HTTPserversecure = false;
if ((conf.DIRKEY && conf.DIRCERT) || conf.FORCEHTTPS) {
	HTTPserver = require("https").createServer({
		key : conf.DIRKEY  && fs.readFileSync(conf.DIRKEY ),
		cert: conf.DIRCERT && fs.readFileSync(conf.DIRCERT),
	}, HTTPhandle);
	if (conf.PORT === undefined) conf.PORT = 443;
	HTTPserversecure = true;
} else {
	HTTPserver = require("http").createServer(HTTPhandle);
	if (conf.PORT === undefined) conf.PORT = 80;
}
HTTPserver.on("error", e => {
	switch (e.code)	 {
		case "EADDRINUSE":
			log.error(`HTTP: Failed to start as already running on port ${conf.PORT}`);
			break;
		case "EACCES":
			log.error(`HTTP: Failed to start due to perms: try ./${__filename.slice(__filename.lastIndexOf("/") + 1)} --setcap`);
			break;
		default: // unknown
			log.error(`HTTP: Failed to start:\n${e.stack}`);
	}
	process.exit(1);
});
HTTPserver.listen(conf.PORT, () => {
	log(`HTTP: ${HTTPserversecure ? "Secure server" : "Server"} started on port ${conf.PORT}`);
});

// WSserver
function WShandle(req, socket, head) {
	populatereq(req);
	if (!util.checkperm(req.url.pathname, req.cookie.u, req.cookie.p)) {
		socket.destroy();
		return;
	}
	switch (util.typeof(req.path)) {
		case 3: // wsscript
		case 4: // both script & wsscript
			break;
		default:
			socket.destroy();
			return;
	}
	WSserver.handleUpgrade(req, socket, head, ws => {
		ws.script = util.require(req.path);
		Object.defineProperty(ws, "ip",     { value: req.ip     });
		Object.defineProperty(ws, "url",    { value: req.url    });
		Object.defineProperty(ws, "cookie", { value: req.cookie });
		if (ws.script.open) ws.script.open(ws);
		WSserver.connections.push(ws);
		if (ws.script.msg) ws.on("message", msg => {
			ws.script.msg(ws, msg);
		});
		ws.on("close", () => {
			WSserver.connections = WSserver.connections.filter(i => i !== ws);
			if (ws.script.close) ws.script.close(ws);
		});
	});
	log(`${req.ip}: "${req.url.path}" "${req.headers.cookie || ""}" WS`);
}

let WSmodule = undefined;
try {
	WSmodule = require("ws");
} catch (e) { 
	log.warn("WS: Not installed, disabling");
}
if (WSmodule) {
	WSserver = new (WSmodule.WebSocketServer)({
		noServer: true,
		autoAcceptConnections: false,
		perMessageDeflate: true
	});
	WSserver.connections = [];
	HTTPserver.on("upgrade", WShandle);
	log(`WS: Server Started`);
}

// Error Handle
process.on("uncaughtException", e => {
	log.error(e.stack);
});

// REPL
if (require.main === module && conf.REPL)
	require("repl").start();
