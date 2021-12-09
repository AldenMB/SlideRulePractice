import formulas from "./modules/formulas.js";
import {make_rule} from "./modules/svg_slide_rule.js";

window.onload = function() {
	const config = document.getElementById("config");
	const exercise_display = document.getElementById("exercise_display");
	const svg_display = document.getElementById("hint_rule");
	const guess = document.getElementById("guess");
	const generate_button = document.getElementById("generate");
	const hint_button = document.getElementById("hint");
	const give_up_button = document.getElementById("give up");
	const feedback = document.getElementById("feedback");
	const formula_selections = document.getElementById("formula_selections");
	
	for(const [name, formula] of Object.entries(formulas)){
		const div = document.createElement("div");
		div.classList.add("formula");
		
		const formula_box = document.createElement("input");
		formula_box.setAttribute("type", "checkbox");
		formula_box.setAttribute("name", name);
		formula_box.setAttribute("id", name);
		formula_box.checked = true;
		div.appendChild(formula_box);
		
		const formula_label = document.createElement("label");
		formula_label.setAttribute("for", name);
		formula_label.innerText = formula.text;
		div.appendChild(formula_label);
		
		formula_selections.appendChild(div);	
	}
	
	let formula_pool;
	let close_threshold = 2;
	let exact_threshold = 0;
	get_config();
	config.addEventListener("input", get_config);
	
	guess.form.addEventListener("submit", check_answer);
	
	let exercise;
	let formula;
	generate_button.addEventListener("click", generate);
	generate();
	
	give_up_button.addEventListener("click", give_up);
	hint_button.addEventListener("click", hint);
	
	const slide_rule = make_rule({length:Number(svg_display.getAttribute('width')-20), scales:'A B C CI D S L'.split(' ')});
	svg_display.appendChild(slide_rule.svg);
	
	slide_rule.moveSlide({to_fixed:4, to_moving:Math.PI, scale_fixed:'A', scale_moving:'B'});
	slide_rule.moveCursor({scale:'C', to:4});
	
	function hint(){
		if('hint' in formula){
			formula.hint(exercise.args, slide_rule);
		} else {
			feedback.innerText = "Sorry, this exercise has no hint";
		}
	};
	
	function get_config(){
		const data = new FormData(config);
		formula_pool = (
			Array.from(
				data.entries(),
				([name]) => name
			)
			.filter(name => (name in formulas))
			.map(name => formulas[name])
		);
		close_threshold = data.get("closeness");
		exact_threshold = data.get("exactness");
	};
	
	function check_answer(event){
		event.preventDefault();
		const entry = Number(guess.value);
		const distance = Math.abs(entry-exercise.answer);
		if(distance <= exact_threshold){
			feedback.innerText = "Correct!";
		} else if (distance <= close_threshold){
			feedback.innerText = "So close!";
		} else {
			feedback.innerText = "Guess again!";
		}
	};
	
	function generate(){
		if(formula_pool.length < 1){
			exercise_display.innerText = "Please select at least one formula";
			return;
		}
		formula = randomChoice(formula_pool);
		exercise = formula.generate();
		exercise_display.innerText = exercise.text;
		feedback.innerText = "Type your guess above.";
		guess.value = '';
		MathJax.typeset();
	};
	
	function give_up(){
		feedback.innerText = `The correct answer was ${exercise.answer}.`;
	};
};

function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
};