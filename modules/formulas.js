const DEG = Math.PI/180;

function randomTriplet(){
	return Math.floor(10**(2+Math.random()));
};

function randomDegrees(){
	return Math.floor(Math.asin(Math.sin(4*DEG)+(Math.sin(86*DEG)-Math.sin(4*DEG))*Math.random())/DEG);
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
		return {text, answer, args};
	}
	const text = match_template(template, getDummy(func.length));
	return {text, generate};
};

const multiplication = make_formula({
	template: "\\( @1 \\times @2 \\)",
	func: ((a, b) => a*b)
});
multiplication.hint = function hint([a,b], slide_rule){
	a = a/100;
	b = b/100;
	let to_moving = 1;
	if(a*b>10){
		to_moving = 10;
		if(a<b){
			[a, b] = [b, a];
		}
	} else {
		if(a>b){
			[a, b] = [b, a];
		}
	}
	slide_rule.moveSlide({to_moving, to_fixed:a});
	slide_rule.moveCursor({scale:'C', to:b});
};

const division = make_formula({
	template: "\\( \\dfrac{ @1 }{ @2 } \\)",
	func: ((a, b) => a/b)
});
division.hint = function hint([a,b],slide_rule){
	const to_fixed = a>b ? 1 : 10;
	slide_rule.moveSlide({to_fixed, to_moving:b/100});
	slide_rule.moveCursor({scale:'C', to:a/100});
};

const mul_mul_div = make_formula({
	template: "\\( \\dfrac{ @1 \\times @2 }{ @3 } \\)",
	func: ((a, b, c) => a*b/c)
});
mul_mul_div.hint = function hint([a,b,c], slide_rule){
	a /= 100;
	b /= 100;
	c /= 100;
	const ans = a*b/c;
	if(ans < 1){
		//Shown is the second step. Is there a 1-step solution?
		slide_rule.moveCursor({to:a*b});
		slide_rule.moveSlide({to_fixed:a*b, to_moving:c});
	} else if (ans > 10) {
		//Shown is the second step. Is there a 1-step solution?
		slide_rule.moveCursor({to:a*b/10});
		slide_rule.moveSlide({to_fixed:a*b/10, to_moving:c});
	} else {
		// 1<ans<10
		slide_rule.moveSlide({to_fixed:a, to_moving:c});
		slide_rule.moveCursor({to:b, scale:'C'});
	}
};

const mul_div_div = make_formula({
	template: "\\( \\dfrac{ @1 }{ @2 \\times @3 } \\)",
	func: ((a, b, c) => a/(b*c))
});
mul_div_div.hint = function hint([a, b, c], slide_rule){
	a /= 100;
	b /= 100;
	c /= 100;
	const ans = a/(b*c);	
	if(b<c){
		[b, c] = [c, b];
	}
	if(ans > 1){
		//Shown is the second step. Is there a 1-step solution?
		slide_rule.moveCursor({to:a/b});
		slide_rule.moveSlide({to_fixed:a/b, to_moving:c});
	} else if (ans < 0.1) {
		//Shown is the second step. Is there a 1-step solution?
		slide_rule.moveCursor({to:a/b*10});
		slide_rule.moveSlide({to_fixed:a/b*10, to_moving:c});
	} else {
		slide_rule.moveSlide({to_fixed:a, to_moving:b});
		slide_rule.moveCursor({to:c, scale:'CI'});
	}
};

const circle_area_from_diameter = make_formula({
	template: "\\( \\pi \\dfrac{ @1 ^2 }{ 4 } \\)",
	func: (d => Math.PI * d**2 /4)
});
circle_area_from_diameter.hint = function hint([d], slide_rule){
	if(d**2*Math.PI > 40_000){
		slide_rule.moveSlide({to_fixed:Math.PI, scale_fixed:'A', to_moving:4, scale_moving:'B'});
	} else {
		slide_rule.moveSlide({to_fixed:Math.PI*100, scale_fixed:'A', to_moving:4, scale_moving:'B'});
	}
	slide_rule.moveCursor({to: d/100, scale:'C'});
};

const sqrt_of_product = function(){
	const template = "\\( \\sqrt{ @1 \\times @2 } \\)";
	function generate(){
		let [a, b] = getTriplets(2);
		b *= 10**(Math.random()>0.5);
		const text = match_template(template, [a, b]);
		const answer = mantissa(Math.sqrt(a*b));
		return {text, answer, args:[a, b]};
	};
	const text = match_template(template, getDummy(2));
	return {text, generate};
}();
sqrt_of_product.hint = function hint([a,b], slide_rule){
	a /= 100;
	b /= 100;
	let to_moving = 1;
	if(a*b>100){
		to_moving = 100;
		if(a<b){
			[a, b] = [b, a];
		}
	} else {
		if(a>b){
			[a, b] = [b, a];
		}
	}
	slide_rule.moveSlide({to_moving, scale_moving:'B', to_fixed:a, scale_fixed:'A'});
	slide_rule.moveCursor({scale:'B', to:b});;
};

const sine = function(){
	const template = "\\( @1 \\sin( @2 ^\\circ ) \\)";
	function generate(){
		const multiple = randomTriplet();
		const angle = randomDegrees();
		const text = match_template(template, [multiple, angle]);
		const answer = mantissa(multiple * Math.sin(angle * Math.PI / 180));
		return {text, answer, args:[multiple, angle]};
	};
	const text = match_template(template, [123, 45]);
	return {text, generate};
}();
sine.hint = function hint([a, b], slide_rule){
	const to_moving = (a * Math.sin(b*Math.PI/180) > 100) ? 10 : 1;
	slide_rule.moveSlide({to_moving, to_fixed:b, scale_fixed:'S'});
	slide_rule.moveCursor({to:a/100, scale:'C'});
};

export default {multiplication, division, mul_mul_div, mul_div_div, circle_area_from_diameter, sqrt_of_product, sine};