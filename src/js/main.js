recipe_selectors = [
	'.recipe-callout',
	'.tasty-recipes',
	'.easyrecipe',
	'.innerrecipe',
	'.recipe-summary.wide', // thepioneerwoman.com
	'.wprm-recipe-container',
	'.recipe-content',
	'.simple-recipe-pro',
	'.mv-recipe-card',
	'div[itemtype="http://schema.org/Recipe"]',
	'div[itemtype="https://schema.org/Recipe"]',
]

remove_selectors = [
	'img',
	'.adthrive-ad', // ads - not working
	'.wprm-template-trc-header'

	// 'a', // undesired side effects - needs work
]

titles = 'h1, h2, h3, h4, h5, h6';
items = 'li';

const closeButton = document.createElement('button');
closeButton.id = '_rf_closebtn';
closeButton.classList.add('_rfbtn');
closeButton.textContent = 'close recipe';

const disableButton = document.createElement('button');
disableButton.id = '_rf_disablebtn';
disableButton.classList.add('_rfbtn');
disableButton.textContent = 'disable on this site';

const focusButton = document.createElement('button');
focusButton.id = '_rf_focusbtn';
focusButton.classList.add('_rfbtn');
focusButton.textContent = 'focus on recipe';

const controls = document.createElement('div');
controls.id  = '_rf_header';
controls.appendChild(closeButton);
controls.appendChild(document.createTextNode('Recipe Filter'));
controls.appendChild(disableButton);
controls.appendChild(focusButton);

function hidePopup(){
	let highlight = document.getElementById('_rf_highlight');
	highlight.style.transition = 'opacity 400ms';
	highlight.style.opacity = 0;
}

chrome.runtime.onMessage.addListener(
	function(request) {
	  	if (request.action == "reshow_popup")
			reshowPopup();
});
  
function reshowPopup() {
	let existingPopup = document.getElementById('_rf_highlight');
	existingPopup.style.opacity = 1;
}

let clone = null;
let focus = false;
function toggleFocus() {
	if (!focus) {
		let recipe = document.getElementById('_rf_recipe');

		// remove problematic elements
		remove_selectors.forEach(function(s) {
			recipe.querySelectorAll(s).forEach(function(n) {
				n.remove();
			})
		})

		// apply slimmer formatting
		recipe.querySelectorAll(titles).forEach(function(n) {
			console.log(n.innerHTML);
			n.classList.add("_rfhdr");
		})

		recipe.querySelectorAll(items).forEach(function(n) {
			n.classList.add("_rfitem");
		})

		focus = true;
		focusButton.textContent = 'show complete recipe';
	} else {
		let recipe = document.getElementById('_rf_recipe');
		recipe.remove();

		let popup = document.getElementById('_rf_highlight');
		recipe = clone.cloneNode(true);
		recipe.id = '_rf_recipe';
		popup.appendChild(recipe);

		focus = false;
		focusButton.textContent = 'focus on recipe';
	}
}

function showPopup(){
	recipe_selectors.every(function(s){
		let original = document.querySelector(s);
		if (original){
			// clone the matched element
			clone = original.cloneNode(true);
			recipe = clone.cloneNode(true);
			recipe.id = '_rf_recipe';

			popup = document.createElement('div');
			popup.id = '_rf_highlight';

			popup.appendChild(controls);
			popup.appendChild(recipe);
			// add some control buttons
			popup.style.transition = 'opacity 500ms';
			popup.style.display = 'block';
			popup.style.opacity = 0;

			document.body.insertBefore(popup, document.body.firstChild);

			// handle the two new buttons we attached to the popup
			closeButton.addEventListener('click', hidePopup);
			disableButton.addEventListener('click', function(b){
				chrome.storage.sync.set({[document.location.hostname]: true}, hidePopup);
			});
			focusButton.addEventListener('click', toggleFocus);

			// add an event listener for clicking outside the recipe to close it
			let mouseUpHide = function(e) {
				console.log(e.target);
				if (e.target !== popup && !popup.contains(e.target) && event.target.type !== 'submit')
				{
						hidePopup();
						document.removeEventListener('mouseup', mouseUpHide);
				}
			};
			document.addEventListener('mouseup', mouseUpHide);

			window.setTimeout(() => {
				// fade in
				popup.style.opacity = 1;

				// scroll to top in case they hit refresh while lower in page
				document.scrollingElement.scrollTop = 0;
			}, 10);

			// it worked, stop iterating through recipe_selectors
			return false;
		}
		return true;
	});
}

// check the blacklist to see if we should run on this site
chrome.storage.sync.get(document.location.hostname, function(items) {
	if (!(document.location.hostname in items)) {
		showPopup();
	}
});
