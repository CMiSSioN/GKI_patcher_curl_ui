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
		//if(model_result.stdout == "Armor 25T Pro"){ oneplus_model = "OP-ACE-2"; }else
		if(model_result.stdout == "PJF110"){ oneplus_model = "OP-ACE-3V"; } else {
			oneplus_model = model_result.stdout;
		}
	}
	const brand_result = await exec("getprop ro.product.product.brand");
	if(brand_result.errno == 0){
		let brand = brand_result.stdout.toUpperCase();
		//brand = "OPLUS";
		if( (brand == "ONEPLUS") || (brand == "OPLUS") || (brand == "REALME") ) {
			releases_url = "https://api.github.com/repos/WildKernels/OnePlus_KernelSU_SUSFS/releases";
			document.getElementById("toggle-is-oneplus").checked = true;
			is_oneplus = true;
			return;
		}
	}
	document.getElementById("toggle-is-oneplus").checked = false;
	releases_url = "https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases";
	is_oneplus = false;
}

function getKernels(){
	try {
		while(true){
			if(releases_url.length != 0){ break; }
		}
		const versionsSel = document.getElementById("versions");
		const versionsCont = document.getElementById("versions_container");
		versionsCont.style.display = "none";
		document.getElementById("version_success").style.display = 'none';
		document.getElementById("version_fail").style.display = 'none';
		document.getElementById("version_abcent").style.display = 'none';
		document.getElementById("kernel_select_icon").style.display = '';
		document.getElementById("toggle-is-oneplus").disabled = true;
		while (versionsSel.options.length > 1) {
			versionsSel.remove(1); // Repeatedly remove the first option
		}
		//versions.innerHTML = "получение доступных версий ядер .";
		//loading_releases = 1;
		//setTimeout(loadingReleasesTick, 500);
		fetch(releases_url).then(response => {
			// Check if the request was successful (status code 200-299)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
    // Parse the response body as JSON
			return response.json();
		})
		.then(data => {
			var release_index = 0;
			// data.every(function(release, index) {
			// 	if(release.body.includes("https://github.com/KernelSU-Next/KernelSU-Next/commit")){ release_index = index; return false; }
			// 	return true;
			// });
			let regex = /^([a-zA-Z0-9\-]+)-android([0-9]+).([0-9]+).([0-9]+).([0-9]+)-.*-AnyKernel3.zip$/;
			if(is_oneplus){
				regex = /^AnyKernel3_([a-zA-Z0-9\-]+)_android([0-9]+).([0-9]+).([0-9]+).([0-9]+)_.*zip$/;
			}
			loading_releases = 0;
			//const versionsSel = document.createElement("select");
			//versionsSel.id = 'kernel_select';
			//versionsSel.name = 'kernel_select';
			var version_selected = "";
			//const option = new Option("un", "");
			//versionsSel.add(option);
			var has_any_version = false;
			data.forEach(function(release){
				release.assets.forEach(function(asset) {
					const ver = regex.exec(asset.name);
					if(ver !== null){
						const model = ver[1];
						const android = ver[2];
						const major = ver[3];
						const minor = ver[4];
						const suffix = ver[5];
						//appendToOutput("'"+model+"' '"+);
						if(major != kernel_major){ return; }
						if(minor != kernel_minor){ return; }
						if(suffix != kernel_suffix){ return; }
						if(is_oneplus){
							if(model != oneplus_model) { return; }
						}
						const option = new Option(asset.name, asset.browser_download_url);
						versionsSel.add(option);
						has_any_version = true;
						if(version_selected.length < 10){
							if((android == kernel_android) && (major == kernel_major) && (minor == kernel_minor) && (suffix == kernel_suffix)){
								version_selected = asset.browser_download_url;
								option.selected = true;
							}
						}
					}
				});
			});
			if(has_any_version === false){
				data.forEach(function(release){
					release.assets.forEach(function(asset) {
						const ver = regex.exec(asset.name);
						if(ver !== null){
							const model = ver[1];
							const android = ver[2];
							const major = ver[3];
							const minor = ver[4];
							const suffix = ver[5];
							if(major != kernel_major){ return; }
							if(minor != kernel_minor){ return; }
							const option = new Option(asset.name, asset.browser_download_url);
							versionsSel.add(option);
							has_any_version = true;
						}
					});
				});
			}
			document.getElementById("kernel_select_icon").style.display = 'none';
			document.getElementById("toggle-is-oneplus").disabled = false;
			if(version_selected.length > 0){
				versionsSel.value = version_selected;
				document.getElementById("version_success").style.display = '';
				document.getElementById("version_fail").style.display = 'none';
				document.getElementById("version_abcent").style.display = 'none';
			} else {
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
			window.scrollTo(0, document.body.scrollHeight);
		})
		.catch(error => {
			document.getElementById("kernel_select_icon").style.display = 'none';
			document.getElementById("version_error_container").style.display = '';
			document.getElementById("version_error").innerHTML = "ERROR:"+error;
		});
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
	const kernel_url = document.getElementById('versions');
	const output = document.querySelector('.output-terminal-content');
	currentFontSize = 10;
	updateFontSize(currentFontSize);
	if(kernel_url.value.length < 10){
		output.innerHTML = localizationDATA.str_need_choose_kernel;
		return;
	}
	output.innerHTML = "";
	shellRunning = true;
	appendToOutput(kernel_url.value);
	appendToOutput(curl_binary);
	const scriptOutput = spawn("sh", [
		"/data/adb/modules/gki_patcher_curl_ui/do_action.sh", curl_binary, kernel_url.value
		, document.getElementById('toggle-dry-run').checked ? "1" : "0"
		, document.getElementById('toggle-active-slot').checked ? "1" : "0"
		, document.getElementById('toggle-inactive-slot').checked ? "1" : "0"
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
				releases_url = "https://api.github.com/repos/WildKernels/OnePlus_KernelSU_SUSFS/releases";
				is_oneplus = true;
			}else{
				releases_url = "https://api.github.com/repos/WildKernels/GKI_KernelSU_SUSFS/releases";
				is_oneplus = false;
			}
			getKernels();
		}
	})
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
			//kernel_android = 12;
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
	getKernels();
});
