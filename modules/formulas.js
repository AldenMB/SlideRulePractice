function randomTriplet(){
	return Math.floor(100+900*Math.random());
};

function randomDegrees(){
	return Math.floor(4+82*Math.random());
};

function getTriplets(n){
	return Array(n).fill(null).map(() => randomTriplet());
};

function getDummy(n){
	const base = [123, 456, 789];
	return Array(n).fill(null).map((x,i) => base[i]);
};

function mantissa(x){
	return Math.round(x*10**(2-Math.floor(Math.log10(x))));
};

function match_template(str, arr){
	let result = str;
	for(const [i, x] of arr.entries()){
		result = result.replace('@'+(i+1), x);
	}
	return result;
}

function make_formula({func, template}){
	function generate(){
		const args = getTriplets(func.length);
		const text = match_template(template, args);
		const answer = mantissa(func(...args));
		return {text, answer};
	}
	const text = match_template(template, getDummy(func.length));
	return {text, generate};
};

const multiplication = make_formula({
	template: "\\( @1 \\times @2 \\)",
	func: ((a, b) => a*b)
});

const division = make_formula({
	template: "\\( \\dfrac{ @1 }{ @2 } \\)",
	func: ((a, b) => a/b)
});

const mul_mul_div = make_formula({
	template: "\\( \\dfrac{ @1 \\times @2 }{ @3 } \\)",
	func: ((a, b, c) => a*b/c)
});

const mul_div_div = make_formula({
	template: "\\( \\dfrac{ @1 }{ @2 \\times @3 } \\)",
	func: ((a, b, c) => a/(b*c))
});

const circle_area_from_diameter = make_formula({
	template: "\\( \\pi \\dfrac{ @1 ^2 }{ 4 } \\)",
	func: (d => Math.PI * d**2 /4)
});

const sqrt_of_product = make_formula({
	template: "\\( \\sqrt{ @1 \\times @2 } \\)",
	func: ((a, b) => Math.sqrt(a*b))
});

const sine = function(){
	const template = "\\( @1 \\sin( @2 ^\\circ ) \\)";
	function generate(){
		const multiple = randomTriplet();
		const angle = randomDegrees();
		const text = match_template(template, [multiple, angle]);
		const answer = mantissa(multiple * Math.sin(angle * Math.PI / 180));
		return {text, answer};
	};
	const text = match_template(template, [123, 45]);
	return {text, generate};
}();

export default {multiplication, division, mul_mul_div, mul_div_div, circle_area_from_diameter, sqrt_of_product, sine};