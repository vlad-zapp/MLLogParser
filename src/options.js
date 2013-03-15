// Saves options to localStorage.
function save_options() {
    localStorage["logFileURLs"] = document.getElementById("logFileURLs").value;
}

// Loads options from localStorage.
function load_options() {
    document.getElementById("logFileURLs").value = localStorage["logFileURLs"];
}

function clickHandler(e) {
	save_options();
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', clickHandler);
  load_options();
});