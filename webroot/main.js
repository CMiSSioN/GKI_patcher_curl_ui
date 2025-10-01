import { fullScreen, exec, toast } from './kernelsu.js'

var loading_releases = 0;
var kernel_major = -1;
var kernel_minor = -1;
var kernel_suffix = -1;
var kernel_android = -1;
var curl_binary = "curl";
var shellRunning = false;
var currentFontSize = 12;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 24;
let initialPinchDistance = null;
let releases_url = "";
let is_oneplus = false;
let oneplus_model = "";
let localizationDATA = null;
let OnePlus_releases = null;
let GKI_releases = null;
let selectCurrentScrollPosition = 0;

function appendToOutput(content) {
	const output = document.querySelector('.output-terminal-content');
	if (content.trim() === "") {
			const lineBreak = document.createElement('br');
			output.appendChild(lineBreak);
	} else {
			const line = document.createElement('p');
			line.className = 'output-content';
			line.innerHTML = content.replace(/ /g, ' ');
			output.appendChild(line);
	}
	output.scrollTop = output.scrollHeight;
	window.scrollTo(0, document.body.scrollHeight);
}

function appendToFetchError(content) {
	const output = document.getElementById('version_error');
	if (content.trim() === "") {
			const lineBreak = document.createElement('br');
			output.appendChild(lineBreak);
	} else {
			const line = document.createElement('p');
			line.className = 'output-content';
			line.innerHTML = content.replace(/ /g, ' ');
			output.appendChild(line);
	}
}

async function getTranslation(locale) {
	try {
		//appendToOutput(`cat /data/adb/modules/gki_patcher_curl_ui/webroot/lang/${locale}.json`);
		const translate_result = await exec(`cat /data/adb/modules/gki_patcher_curl_ui/webroot/lang/${locale}.json`);
		if(translate_result.errno == 0){
			return translate_result.stdout;
		}
		return "";
	} catch (error){
		appendToOutput(error);
	}
	return "";
}

async function doTranslate(){
	let curLocale = "en-US";
	const locale_regex = /^([a-zA-Z]+)-([a-zA-Z]+).*$/;
	const locale_result = await exec("getprop persist.sys.locale");
	if(locale_result.errno == 0) {
	 	const locale_res = locale_regex.exec(locale_result.stdout);
	 	if (locale_res !== null){
			curLocale = locale_res[1]+"-"+locale_res[2];
		}
	}
	//curLocale = "er-ER";
	let localeData = await getTranslation(curLocale);
	//appendToOutput("localeData length:"+localeData.length);
	if(localeData.length == 0){
		localeData = await getTranslation("en-US");
	}
	//appendToOutput(localeData);
	localizationDATA = JSON.parse(localeData);
	let locElements = document.querySelectorAll('.localize');
	locElements.forEach(function(element){
		element.innerHTML = localizationDATA[element.id];
	});
}


/**
 * Spawns shell process with ksu spawn
 * @param {string} command - The command to execute
 * @param {string[]} [args=[]] - Array of arguments to pass to the command
 * @returns {Object} A child process object with:
 *                   stdout: Stream for standard output
 *                   stderr: Stream for standard error
 *                   stdin: Stream for standard input
 *                   on(event, listener): Attach event listener ('exit', 'error')
 *                   emit(event, ...args): Emit events internally
 */
function spawn(command, args = []) {
    const child = {
        listeners: {},
        stdout: { listeners: {} },
        stderr: { listeners: {} },
        stdin: { listeners: {} },
        on: function(event, listener) {
            if (!this.listeners[event]) this.listeners[event] = [];
            this.listeners[event].push(listener);
        },
        emit: function(event, ...args) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(listener => listener(...args));
            }
        }
    };
    ['stdout', 'stderr', 'stdin'].forEach(io => {
        child[io].on = child.on.bind(child[io]);
        child[io].emit = child.emit.bind(child[io]);
    });
    const callbackName = `spawn_callback_${Date.now()}`;
    window[callbackName] = child;
    child.on("exit", () => delete window[callbackName]);
    try {
        ksu.spawn(command, JSON.stringify(args), "{}", callbackName);
    } catch (error) {
        child.emit("error", error);
        delete window[callbackName];
    }
    return child;
}

//"https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases"

async function onePlusDetect(){
	const model_result = await exec("getprop ro.product.model");
	if(model_result.errno == 0){
		is_oneplus = true;
		if(model_result.stdout == "PJA110"){ oneplus_model = "OP-ACE-2-PRO"; }else
		if(model_result.stdout == "PHK110"){ oneplus_model = "OP-ACE-2"; }else
		if(model_result.stdout == "PKG110"){ oneplus_model = "OP-ACE-5"; }else
		if(model_result.stdout == "CPH2661"){ oneplus_model = "OP-NORD-4"; }else
		if(model_result.stdout == "RMX3852"){ oneplus_model = "OP-NORD-4"; }else
		if(model_result.stdout == "RMX3851"){ oneplus_model = "OP-NORD-4"; }else
		if(model_result.stdout == "CPH2663"){ oneplus_model = "OP-NORD-4"; }else
		if(model_result.stdout == "PHN110"){ oneplus_model = "OP-OPEN"; }else
		if(model_result.stdout == "CPH2551"){ oneplus_model = "OP-OPEN"; }else
		if(model_result.stdout == "CPH2499"){ oneplus_model = "OP-OPEN"; }else
		if(model_result.stdout == "OPD2404"){ oneplus_model = "OP-PAD-2"; }else
		if(model_result.stdout == "OPD2403"){ oneplus_model = "OP-PAD-2"; }else
		if(model_result.stdout == "NE2210"){ oneplus_model = "OP10pro"; }else
		if(model_result.stdout == "NE2211"){ oneplus_model = "OP10pro"; }else
		if(model_result.stdout == "NE2213"){ oneplus_model = "OP10pro"; }else
		if(model_result.stdout == "NE2215"){ oneplus_model = "OP10pro"; }else
		if(model_result.stdout == "NE2217"){ oneplus_model = "OP10pro"; }else
		if(model_result.stdout == "RMX3709"){ oneplus_model = "OP10t"; }else
		if(model_result.stdout == "CPH2413"){ oneplus_model = "OP10t"; }else
		if(model_result.stdout == "CPH2415"){ oneplus_model = "OP10t"; }else
		if(model_result.stdout == "CPH2417"){ oneplus_model = "OP10t"; }else
		if(model_result.stdout == "CPH2419"){ oneplus_model = "OP10t"; }else
		if(model_result.stdout == "CPH2487"){ oneplus_model = "OP11r"; }else
		if(model_result.stdout == "PHB110"){ oneplus_model = "OP11"; }else
		if(model_result.stdout == "CPH2447"){ oneplus_model = "OP11"; }else
		if(model_result.stdout == "CPH2449"){ oneplus_model = "OP11"; }else
		if(model_result.stdout == "CPH2451"){ oneplus_model = "OP11"; }else
		if(model_result.stdout == "CPH2585"){ oneplus_model = "OP12r"; }else
		if(model_result.stdout == "CPH2609"){ oneplus_model = "OP12r"; }else
		if(model_result.stdout == "CPH2611"){ oneplus_model = "OP12r"; }else
		if(model_result.stdout == "CPH2573"){ oneplus_model = "OP12"; }else
		if(model_result.stdout == "CPH2581"){ oneplus_model = "OP12"; }else
		if(model_result.stdout == "RMX3800"){ oneplus_model = "OP12"; }else
		if(model_result.stdout == "CPH2583"){ oneplus_model = "OP12"; }else
		if(model_result.stdout == "RMX5011"){ oneplus_model = "OP13"; }else
		if(model_result.stdout == "CPH2655"){ oneplus_model = "OP13"; }else
		if(model_result.stdout == "CPH2653"){ oneplus_model = "OP13"; }else
		if(model_result.stdout == "CPH2649"){ oneplus_model = "OP13"; }else
		if(model_result.stdout == "CPH2645"){ oneplus_model = "OP13r"; }else
		if(model_result.stdout == "CPH2647"){ oneplus_model = "OP13r"; }else
		if(model_result.stdout == "CPH2691"){ oneplus_model = "OP13r"; }else
		if(model_result.stdout == "CPH2723"){ oneplus_model = "OP13S"; }else
		if(model_result.stdout == "CPH2621"){ oneplus_model = "OP-ACE-3V"; }else
//		if(model_result.stdout == "Armor 25T Pro"){ oneplus_model = "OP-ACE-2"; }else
		if(model_result.stdout == "PJF110"){ oneplus_model = "OP-ACE-3V"; } else {
			oneplus_model = model_result.stdout;
			is_oneplus = false;
		}
	}
	document.getElementById("toggle-is-oneplus").checked = is_oneplus;
}

function fetchError(error){
	document.getElementById("kernel_select_info").style.display = '';
	document.getElementById("kernel_select_info_container").classList.remove("toggle-border");
	document.getElementById("kernel_select_icon").style.display = 'none';
	document.getElementById("version_error_container").style.display = '';
	appendToFetchError(error);
}

function fetchReleases(){
	document.getElementById("toggle-is-oneplus").disabled = true;
	try{
		const url = "https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases";
		fetch(url).then(response => {
			try{
				if (!response.ok) {
					fetchError("GKI_KernelSU_SUSFS HTTP Error:"+response.status);
					return;
				}
				return response.json();
			}catch(error){
				fetchError(url+" content is not a JSON:"+error);
			}
		})
		.then(data => {
			GKI_releases = data;
		})
		.catch(error => {
			if(error instanceof TypeError){
				fetchError(url + " is not a valid JSON");
			} else {
				fetchError(url + " "+error);
			}
		});
	} catch (error){
		fetchError(error+" ");
	}
	try{
		const url = "https://api.github.com/repos/WildKernels/OnePlus_KernelSU_SUSFS/releases";
		fetch(url).then(response => {
			try{
				if (!response.ok) {
					fetchError("OnePlus_KernelSU_SUSFS HTTP Error:"+response.status);
					return;
				}
				return response.json();
			}catch(error){
				fetchError(url+" content is not a JSON:"+error);
			}
		})
		.then(data => {
			OnePlus_releases = data;
		})
		.catch(error => {
			if(error instanceof TypeError){
				fetchError(url + " is not a valid JSON");
			} else {
				fetchError(url + " "+error);
			}
		});
	} catch (error){
		fetchError(error+" ");
	}
	waitForReleases();
}

function waitForReleases(){
	if( (GKI_releases === null) || (OnePlus_releases === null) ){
		setTimeout(waitForReleases, 100);
	} else {
		document.getElementById("toggle-is-oneplus").disabled = false;
		fillKernels();
	}
}

function extractVersion(name){
	try {
		if(is_oneplus){
			let regex = /^AnyKernel3_([a-zA-Z0-9\-]+)_android([0-9]+).([0-9\.]+)_[a-zA-Z]+_([0-9]+)_.*zip$/;
			const ver = regex.exec(name);
			if(ver !== null){
				const model = ver[1];
				const android = ver[2];
				const kernel = ver[3];
				const driver = ver[4];
				return [true, model, 0, 0, 0, android, driver];
			} else {
				return [false, "", 0, 0, 0, 0, ""];
			}
		} else {
			let regex = /^([a-zA-Z0-9\-]+)-android([0-9]+).([0-9]+).([0-9]+).([0-9]+)-.*-AnyKernel3.zip$/;
			const ver = regex.exec(name);
			if(ver !== null){
				const driver = ver[1];
				const android = ver[2];
				const major = ver[3];
				const minor = ver[4];
				const suffix = ver[5];
				return [true, "", major, minor, suffix, android, driver];
			} else {
				return [false, "", 0, 0, 0, 0, ""];
			}
		}
	} catch (error) {
		appendToOutput("ERROR:"+error);
	}
}

function fillKernels(){
	try {
		//document.querySelector('.output-terminal-content').innerHTML = '';
		//appendToOutput("fillKernels:"+is_oneplus.toString());
		const versionsSel = document.getElementById("versions");
		const content = document.getElementById("content");
		const versionsCont = document.getElementById("versions_container");
		const isAnyBuild = document.getElementById("toggle-is-any-build");
		const versions_select_box = document.getElementById('versions_select_box');
		versionsCont.style.display = "none";
		document.getElementById("kernel_select_info_container").classList.add("toggle-border");
		document.getElementById("kernel_select_info").style.display = 'none';
		document.getElementById("version_success").style.display = 'none';
		document.getElementById("version_fail").style.display = 'none';
		document.getElementById("version_abcent").style.display = 'none';
		document.getElementById("kernel_select_icon").style.display = '';
		document.getElementById("action_button").style.display = 'none';
		isAnyBuild.disabled = true;
		versions_select_box.style.display = "none";
		versionsSel.innerHTML = "";
		var release_index = 0;
		let data = structuredClone(GKI_releases);
		if(is_oneplus){
			data = structuredClone(OnePlus_releases);
		}
		loading_releases = 0;
		var version_selected_val = "";
		var version_selected_text = "";
		var has_any_version = false;
		let last_driver = "";
		let drivers_counter = 0;
		const options = [ ["", "&nbsp;" + localizationDATA.str_version_unchoosen] ];
		data.forEach(function(release){
			release.assets.sort(function (a,b) { return a.name > b.name ? -1 : 1; });
			release.assets.forEach(function(asset) {
				if(drivers_counter > 3) { return; }
				const [good, model, major, minor, build, android, driver] = extractVersion(asset.name);
				if(good){
					if(is_oneplus){
						if(model != oneplus_model) { return; }
						if(driver != last_driver){ last_driver = driver; drivers_counter = drivers_counter + 1; }
						if(drivers_counter > 3) { return; }
						const option = [asset.browser_download_url, "&nbsp;" + asset.name.replace("AnyKernel3_","")];
						options.push(option);
						has_any_version = true;
						if(version_selected_val.length < 10){
							version_selected_val = asset.browser_download_url;
							version_selected_text = asset.name;
							//option.selected = true;
						}
					} else {
						if(major != kernel_major){ return; }
						if(minor != kernel_minor){ return; }
						if(!isAnyBuild.checked){
							if(build != kernel_suffix){ return; }
						}
						if(kernel_android > 0){
							if(android != kernel_android) { return; }
						}
						if(driver != last_driver){ last_driver = driver; drivers_counter = drivers_counter + 1; }
						if(drivers_counter > 3) { return; }
						const option = [asset.browser_download_url, "&nbsp;" + asset.name.replace("-AnyKernel3.zip","")];
						options.push(option);
						has_any_version = true;
						if(version_selected_val.length < 10){
							if((android == kernel_android) && (major == kernel_major) && (minor == kernel_minor) && (build == kernel_suffix)){
								version_selected_val = asset.browser_download_url;
								version_selected_text = asset.name;
							}
						}
					}
				}
			});
		});
		if(!has_any_version){
			data.forEach(function(release){
				release.assets.forEach(function(asset) {
					if(drivers_counter > 3) { return; }
					const [good, model, major, minor, build, android, driver] = extractVersion(asset.name);
					if(good){
						if(is_oneplus){
							if(driver != last_driver){ last_driver = driver; drivers_counter = drivers_counter + 1; }
							if(drivers_counter > 3) { return; }
							const option = [asset.browser_download_url, "&nbsp;" + asset.name.replace("AnyKernel3_","")];
							options.push(option);
							has_any_version = true;
						} else {
							if(major != kernel_major){ return; }
							if(minor != kernel_minor){ return; }
							if(kernel_android > 0){
								if(android != kernel_android) { return; }
							}
							if(driver != last_driver){ last_driver = driver; drivers_counter = drivers_counter + 1; }
							if(drivers_counter > 3) { return; }
							const option = [asset.browser_download_url, "&nbsp;" + asset.name.replace("-AnyKernel3.zip","")];
							options.push(option);
							has_any_version = true;
						}
					}
				});
			});
		}
		document.getElementById("kernel_select_icon").style.display = 'none';
		document.getElementById("toggle-is-oneplus").disabled = false;
		isAnyBuild.disabled = false;
		document.getElementById("kernel_select_info").style.display = '';
		document.getElementById("kernel_select_info_container").classList.remove("toggle-border");
		const selected_kernel_version = document.getElementById("selected_kernel_version");
		options.forEach(function(option){
			const optionli = document.createElement('div');
			optionli.innerHTML = option[1];
			optionli.setAttribute("link", option[0]);
			optionli.classList.add("toggle-list");
			optionli.classList.add("toggle-border");
			optionli.classList.add("ripple-element");
			optionli.classList.add("toggle-list-select");
			if(option[0] == version_selected_val){
				optionli.classList.add("toggle-list-selected");
			} else {
				optionli.classList.add("toggle-list-unselected");
			}
			optionli.addEventListener('click', (event) => {
				selected_kernel_version.innerHTML = event.currentTarget.innerHTML;
				selected_kernel_version.setAttribute("link",event.currentTarget.getAttribute("link"));

				const elementsArray = Array.from(document.getElementsByClassName('toggle-list-selected'));
				elementsArray.forEach(element => {
					element.classList.remove("toggle-list-selected");
					element.classList.add("toggle-list-unselected");
				});
				event.currentTarget.classList.remove("toggle-list-unselected");
				event.currentTarget.classList.add("toggle-list-selected");
				setTimeout(() => {
					versions_select_box.style.display = "none";
					content.style.display = "";
					setTimeout(() => { document.documentElement.scrollTop = selectCurrentScrollPosition; }, 100);
				}, 1000);
			});
			versionsSel.appendChild(optionli);
		});
		if(version_selected_val.length > 0){
			selected_kernel_version.innerHTML = version_selected_text;
			selected_kernel_version.setAttribute("link", version_selected_val);
			document.getElementById("version_success").style.display = '';
			document.getElementById("version_fail").style.display = 'none';
			document.getElementById("version_abcent").style.display = 'none';
		} else {
			selected_kernel_version.innerHTML = localizationDATA.str_version_unchoosen;
			selected_kernel_version.setAttribute("link", "");
			if(has_any_version === true){
				document.getElementById("version_success").style.display = 'none';
				document.getElementById("version_fail").style.display = '';
				document.getElementById("version_abcent").style.display = 'none';
			} else {
				document.getElementById("version_success").style.display = 'none';
				document.getElementById("version_fail").style.display = 'none';
				document.getElementById("version_abcent").style.display = '';
			}
		}
		if(has_any_version === true){
			document.getElementById("action_button").style.display = '';
			versionsCont.style.display = '';
		} else {
			versionsCont.style.display = 'none';
		}
	} catch (error){
		document.getElementById("kernel_select_icon").style.display = 'none';
		document.getElementById("version_error_container").style.display = '';
		document.getElementById("version_error").innerHTML = "ERROR:"+error;
	}
}

function updateFontSize(newSize) {
	currentFontSize = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
	const terminal = document.querySelector('.output-terminal-content');
	terminal.style.fontSize = `${currentFontSize}px`;
}


function runAction() {
	if (shellRunning) return;
	const kernel_url = document.getElementById('selected_kernel_version').getAttribute("link");
	const output = document.querySelector('.output-terminal-content');
	currentFontSize = 10;
	updateFontSize(currentFontSize);
	if(kernel_url.length < 10){
		output.innerHTML = localizationDATA.str_need_choose_kernel;
		return;
	}
	output.innerHTML = "";
	shellRunning = true;
	appendToOutput(kernel_url);
	appendToOutput(curl_binary);
	const scriptOutput = spawn("sh", [
		"/data/adb/modules/gki_patcher_curl_ui/do_action.sh", curl_binary, kernel_url
		, document.getElementById('toggle-dry-run').checked ? "1" : "0"
		, document.getElementById('toggle-active-slot-only').checked ? "1" : "0"
		, "0"
	]);
	scriptOutput.stdout.on('data', (data) => appendToOutput(data));
	scriptOutput.stderr.on('data', (data) => appendToOutput(data));
	scriptOutput.on('exit', () => {
			appendToOutput(localizationDATA.str_action_exit);
			if((!document.getElementById('toggle-dry-run').checked) && ((document.getElementById('toggle-active-slot').checked) || (document.getElementById('toggle-inactive-slot').checked)) ){
				appendToOutput(localizationDATA.str_reboot);
			}
			shellRunning = false;
	});
	scriptOutput.on('error', () => {
			appendToOutput("[!] Error: Fail to execute do_action.sh");
			appendToOutput("");
			shellRunning = false;
	});
}

function addEventListeners(){
	const kernel_version = document.getElementById('kernel_version');
	kernel_version.addEventListener('click', () => {
		const kernel_version_full = document.getElementById('kernel_version_full');
		const kernel_version_short = document.getElementById('kernel_version_short');
		const kernel_version_icon = document.getElementById('kernel_version_icon');
		if(kernel_version_full.style.display == "none"){
			kernel_version_icon.classList.remove("fa-plus");
			kernel_version_icon.classList.add("fa-minus");
			kernel_version_short.style.display = "none";
			kernel_version_full.style.display = "block";
		} else {
			kernel_version_icon.classList.remove("fa-minus");
			kernel_version_icon.classList.add("fa-plus");
			kernel_version_short.style.display = "inline-block";
			kernel_version_full.style.display = "none";
		}
	});
	const ksu_version = document.getElementById('ksu_version');
	ksu_version.addEventListener('click', () => {
		const ksu_version_full = document.getElementById('ksu_version_full');
		const ksu_version_short = document.getElementById('ksu_version_short');
		const ksu_version_icon = document.getElementById('ksu_version_icon');
		if(ksu_version_full.style.display == "none"){
			ksu_version_icon.classList.remove("fa-plus");
			ksu_version_icon.classList.add("fa-minus");
			ksu_version_short.style.display = "none";
			ksu_version_full.style.display = "block";
		} else {
			ksu_version_icon.classList.remove("fa-minus");
			ksu_version_icon.classList.add("fa-plus");
			ksu_version_short.style.display = "inline-block";
			ksu_version_full.style.display = "none";
		}
	});
	const curl_version = document.getElementById('curl_version');
	curl_version.addEventListener('click', () => {
		const curl_version_full = document.getElementById('curl_version_full');
		const curl_version_short = document.getElementById('curl_version_short');
		const curl_version_icon = document.getElementById('curl_version_icon');
		if(curl_version_full.style.display == "none"){
			curl_version_icon.classList.remove("fa-plus");
			curl_version_icon.classList.add("fa-minus");
			curl_version_short.style.display = "none";
			curl_version_full.style.display = "block";
		} else {
			curl_version_icon.classList.remove("fa-minus");
			curl_version_icon.classList.add("fa-plus");
			curl_version_short.style.display = "inline-block";
			curl_version_full.style.display = "none";
		}
	});
	const versions_select_box = document.getElementById('versions_select_box');
	const content = document.getElementById('content');
	const selected_kernel_version_container = document.getElementById('selected_kernel_version_container');
	selected_kernel_version_container.addEventListener('click', () => {
		if(versions_select_box.style.display == "none"){
			selectCurrentScrollPosition = document.documentElement.scrollTop;
			versions_select_box.style.display = "";
			content.style.display = "none";
		} else {
			versions_select_box.style.display = "none";
			content.style.display = "";
		}
	});
	const clearButton = document.querySelector('.clear-terminal');
	const terminal = document.querySelector('.output-terminal-content');
	clearButton.addEventListener('click', () => {
			terminal.innerHTML = '';
			currentFontSize = 10;
			updateFontSize(currentFontSize);
	});
	const is_oneplus_box = document.getElementById("toggle-is-oneplus");
	is_oneplus_box.addEventListener('change', (event) => {
		if (!event.currentTarget.disabled) {
			if(event.currentTarget.checked){
				is_oneplus = true;
			}else{
				is_oneplus = false;
			}
			fillKernels();
		}
	})
	const is_any_build_box = document.getElementById("toggle-is-any-build");
	is_any_build_box.addEventListener('change', (event) => {
		if (!event.currentTarget.disabled) {
			fillKernels();
		}
	})
	const is_oneplus_container = document.getElementById("is_oneplus_container");
	const is_oneplus_help = document.getElementById("is_oneplus_help");
	const is_oneplus_text = document.getElementById("is_oneplus_text");
	const is_oneplus_icon = document.getElementById("is_oneplus_icon");
	is_oneplus_text.addEventListener('click', () => {
		if(is_oneplus_help.style.display == 'none'){
			is_oneplus_help.style.display = "";
			is_oneplus_container.classList.remove("toggle-border");
		} else {
			is_oneplus_help.style.display = "none";
			is_oneplus_container.classList.add("toggle-border");
		}
	});
	is_oneplus_icon.addEventListener('click', () => {
		if(is_oneplus_help.style.display == 'none'){
			is_oneplus_help.style.display = "";
			is_oneplus_container.classList.remove("toggle-border");
		} else {
			is_oneplus_help.style.display = "none";
			is_oneplus_container.classList.add("toggle-border");
		}
	});
	const is_any_build_container = document.getElementById("is_any_build_container");
	const is_any_build_help = document.getElementById("is_any_build_help");
	const is_any_build_text = document.getElementById("is_any_build_text");
	const is_any_build_icon = document.getElementById("is_any_build_icon");
	is_any_build_text.addEventListener('click', () => {
		if(is_any_build_help.style.display == 'none'){
			is_any_build_help.style.display = "";
			is_any_build_container.classList.remove("toggle-border");
		} else {
			is_any_build_help.style.display = "none";
			is_any_build_container.classList.add("toggle-border");
		}
	});
	is_any_build_icon.addEventListener('click', () => {
		if(is_any_build_help.style.display == 'none'){
			is_any_build_help.style.display = "";
			is_any_build_container.classList.remove("toggle-border");
		} else {
			is_any_build_help.style.display = "none";
			is_any_build_container.classList.add("toggle-border");
		}
	});
	const kernel_select_info_container = document.getElementById("kernel_select_info_container");
	const version_select_info = document.getElementById("version_select_info");
	kernel_select_info_container.addEventListener('click', () => {
		if(version_select_info.style.display == 'none'){
			version_select_info.style.display = "";
		} else {
			version_select_info.style.display = "none";
		}
	});
	// terminal.addEventListener('touchstart', (e) => {
	// 		if (e.touches.length === 2) {
	// 				e.preventDefault();
	// 				initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
	// 		}
	// }, { passive: false });
	// terminal.addEventListener('touchmove', (e) => {
	// 		if (e.touches.length === 2) {
	// 				e.preventDefault();
	// 				const currentDistance = getDistance(e.touches[0], e.touches[1]);
 //
	// 				if (initialPinchDistance === null) {
	// 						initialPinchDistance = currentDistance;
	// 						return;
	// 				}
 //
	// 				const scale = currentDistance / initialPinchDistance;
	// 				const newFontSize = currentFontSize * scale;
	// 				updateFontSize(newFontSize);
	// 				initialPinchDistance = currentDistance;
	// 		}
	// }, { passive: false });
	// terminal.addEventListener('touchend', () => {
	// 		initialPinchDistance = null;
	// });
	const action_button = document.getElementById('action_button');
	action_button.addEventListener('click', () => {
		try{
			runAction();
		} catch (error){
			appendToOutput(error);
		}
	});
}

document.addEventListener('DOMContentLoaded', async () => {
	await doTranslate();
	const kernel_version_regex = /^Linux version ([0-9]+).([0-9]+).([0-9]+).*$/
	const kernel_android_regex = /^.*-android([0-9]+)-.*$/
	const ver_result = await exec("cat /proc/version");
	if(ver_result.errno == 0) {
		document.getElementById("kernel_version_full").innerHTML = ver_result.stdout;
		const kernel_ver = kernel_version_regex.exec(ver_result.stdout);
		const kernel_and = kernel_android_regex.exec(ver_result.stdout);
		if(kernel_ver !== null){
			kernel_major = kernel_ver[1];
			kernel_minor = kernel_ver[2];
			kernel_suffix = kernel_ver[3];
			//kernel_major = 5;
			//kernel_minor = 10;
			//kernel_suffix = 226;
		}
		if(kernel_and != null){
			kernel_android = kernel_and[1];
			//kernel_android = -1;
		}
		if(kernel_android <= 0){
			const kmi_result = await exec("/data/adb/ksud boot-info current-kmi");
			const kmi_android_regex = /^android([0-9]+)\-([0-9]+).([0-9]+)$/;
			if(kmi_result.errno == 0){
				const kmi_ver = kmi_android_regex.exec(kmi_result.stdout);
				if(kmi_ver != null){
					kernel_android = kmi_ver[1];
					kernel_major = kmi_ver[2];
					kernel_minor = kmi_ver[3];
				}
			}
		}
		if((kernel_major != -1) && (kernel_android != -1)){
			document.getElementById("kernel_version_short").innerHTML = kernel_major+"."+kernel_minor+"."+kernel_suffix+"-android"+kernel_android;
		} else {
			if(kernel_major != -1) {
				document.getElementById("kernel_version_short").innerHTML = kernel_major+"."+kernel_minor+"."+kernel_suffix;
			} else {
				document.getElementById("kernel_version_short").innerHTML = "error";
				document.getElementById("kernel_version_short").style.color = '#FFA500';
			}
		}
	} else {
		document.getElementById("kernel_version_short").innerHTML = "error " + ver_result.errno;
		document.getElementById("kernel_version_short").style.color = '#FFA500';
	}
	const ksud_result = await exec("/data/adb/ksud debug version");
	const ksu_version_regex = /^Kernel Version: ([0-9]+)*$/
	if(ksud_result.errno == 0) {
		document.getElementById("ksu_version_full").innerHTML = ksud_result.stdout;
		const ksu_ver = ksu_version_regex.exec(ksud_result.stdout);
		if(ksu_ver !== null){
			document.getElementById("ksu_version_short").innerHTML = ksu_ver[1];
		}
	}
	await onePlusDetect();
	addEventListeners();
	const curl_int_result = await exec("curl --version");
	if(curl_int_result.errno == 0) {
		document.getElementById("str_curl_version_system").style.display = "";
		document.getElementById("curl_version_full").innerHTML = curl_int_result.stdout;
		curl_binary = "curl"
	} else {
		const curl_ext_result = await exec("/data/adb/modules/gki_patcher_curl_ui/system/bin/curl --version");
		if(curl_ext_result.errno == 0) {
			//document.getElementById("curl_version_short").innerHTML = "встроенная";
			document.getElementById("str_curl_version_internal").style.display = "";
			document.getElementById("curl_version_full").innerHTML = curl_ext_result.stdout;
			curl_binary = "/data/adb/modules/gki_patcher_curl_ui/system/bin/curl"
		} else {
			document.getElementById("curl_version_short").innerHTML = "отсутствует";
			document.getElementById("str_curl_version_internal").style.display = "";
			document.getElementById("curl_version_short").setAttribute('style', 'color: #FFA500;');
			return;
		}
	}
	fetchReleases();
	//getKernels();
});
