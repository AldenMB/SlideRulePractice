const NS = "http://www.w3.org/2000/svg";

function make_node(name, attrs = {}){
	const node = document.createElementNS(NS, name);
	for (const a in attrs) {
		node.setAttributeNS(null, a, String(attrs[a]));
	};
	return node;
};

const DEGREES = 180/Math.PI;

const DECADE = Array(10).fill(0).map((x, i) => i+1);
const DOUBLE_DECADE = [DECADE, DECADE.slice(1).map(x => x*10)].flat();
const TRIPLE_DECADE = [DOUBLE_DECADE, DECADE.slice(1).map(x => 100*x)].flat()
function first_digit(x){
	return {x, s:String(x)[0]};
};
function full_label(x){
	return {x, s:String(x)};
};

const SCALE = {
	A: {
		hanging: false,
		decades: DOUBLE_DECADE,
		labels: DOUBLE_DECADE.map(first_digit),
		func: ((x) => Math.log10(x)/2)
	},
	C: {
		hanging: false,
		decades: DECADE,
		labels: DECADE.map(first_digit),
		func: ((x) => Math.log10(x))
	},
	K: {
		hanging: false,
		decades: TRIPLE_DECADE,
		labels: TRIPLE_DECADE.map(first_digit),
		func: ((x) => Math.log10(x)/3)
	},
	S: {
		hanging: false,
		decades: [5.5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90],
		labels: [5.5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50, 60, 90].map(full_label),
		func: ((x) => Math.log10(Math.sin(x/DEGREES))+1)
	},
	T: {
		hanging: false,
		decades: [5.5, 6, 7, 8, 9, 10, 20, 30, 40, 45],
		labels: [5.5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45].map(full_label),
		func: ((x) => Math.log10(Math.tan(x/DEGREES))+1)
	},
	L:{
		hanging: false,
		decades: [0,1],
		labels: Array(11).fill(0).map((x, i) => i/10).map(full_label),
		func: (x => x)
	}
};
SCALE.B = Object.assign({}, SCALE.A, {hanging: true});
SCALE.D = Object.assign({}, SCALE.C, {hanging: true});
SCALE.CI = Object.assign({}, SCALE.C, {func: ((x) => 1-Math.log10(x))});

function tick_order(x, order){
	return {x, order};
}

function get_ticks_decade(func=(x=>x), low=0, high=1, min_separation=0.01, order=0){
	if(Math.abs(func(high) - func(low+0.9*(high-low))) > min_separation){
		// put all nine ticks and recurse
		return ( Array(9)
			.fill(0)
			.map((x, i) => low + (high-low)*(i+1)/10)
			.map((x, i) => tick_order(x, order+(i!=4)))
			.concat(
				...Array(10)
				.fill(0)
				.map((x, i) => i/10)
				.map((x) => get_ticks_decade(
					func,
					low + (high-low)*x,
					low + (high-low)*(x+0.1),
					min_separation,
					order+2
					)
				)
			)
		);
	} else if (Math.abs(func(high) - func(low+0.8*(high-low))) > min_separation) {
		// do only four ticks
		return ( Array(4)
			.fill(0)
			.map((x, i) => low + (high-low)*(i+1)/5)
			.map((x) => tick_order(x, order))
		);
	} else if (Math.abs(func(high) - func(low+0.5*(high-low))) > min_separation) {
		// do only one tick
		const x = (high+low)/2;
		return [{x, order}]; 
	} else {
		return [];
	}
};

function make_scale({name, height, length, min_separation}){
	const {func, labels, decades, hanging} = SCALE[name];
	const scale = make_node('g');
	const ticks = decades
		.slice(0, -1)
		.map((x, i) => get_ticks_decade(func, x, decades[i+1], min_separation, 1))
		.concat(
			decades.map(x => tick_order(x, 0))
		)
		.flat();
	for(const {x, order} of ticks){
		const x1 = length*func(x);
		const x2 = x1;
		let y1 = 0;
		let y2 = height * (0.75)**order;
		if(!hanging){
			y1 = height-y2;
			y2 = height;
		}
		scale.appendChild(make_node('line', {x1, x2, y1, y2, stroke:'black'}));
	}
	for(let {x, s} of labels){
		const t = make_node('text', {x: func(x)*length, y:height*hanging});
		t.setAttributeNS(null, 'text-anchor', 'middle');
		if(hanging){
			t.setAttributeNS(null, 'dominant-baseline', 'hanging');
		}
		t.setAttributeNS(null, 'font-size', 10);
		t.textContent = s;
		scale.appendChild(t);
	}
	const nametag = make_node('text', {x: -10, y:0})
	nametag.setAttributeNS(null, 'dominant-baseline', 'hanging');
	nametag.setAttributeNS(null, 'font-size', 10);
	nametag.textContent = name;
	scale.appendChild(nametag);
	return scale;
};

function make_rule({
	length=500,
	scale_height=14,
	scale_separation=16,
	minimum_tick_separation = 3,
	scales = Object.keys(SCALE),
	color = 'AntiqueWhite',
	cursor_width = 60,
	cursor_stroke = 4,
	side_margin = 10
}){
	const svg = make_node('svg');
	
	//draw the wood
	const top_scales = 'T S A'.split(' ').filter(x => scales.includes(x));
	const slide_scales = 'B CI C'.split(' ').filter(x => scales.includes(x));
	const bottom_scales = 'D K L'.split(' ').filter(x => scales.includes(x));
	
	const top_height = (scale_height+scale_separation)*top_scales.length;
	const slide_height = (scale_height+scale_separation)*slide_scales.length - scale_separation;
	const bottom_height = (scale_height+scale_separation)*bottom_scales.length;
	const full_height = top_height+bottom_height+slide_height;
	svg.setAttributeNS(null, 'viewBox', `${-side_margin} 0 ${length+2*side_margin} ${full_height}`);
	
	svg.appendChild(make_node('rect', {width:length+2*side_margin, height:top_height, x:-side_margin, fill:color, stroke:'black'}));
	svg.appendChild(make_node('rect', {width:length+2*side_margin, height:bottom_height, x:-side_margin, y:top_height+slide_height, fill:color, stroke:'black'}));
	
	const slide = make_node('g');
	slide.appendChild(make_node('rect', {width:length+2*side_margin, height:slide_height, x:-side_margin, y:top_height, fill:color, stroke:'black'}));
	svg.appendChild(slide);
	const slide_translation = svg.createSVGTransform();
	slide.transform.baseVal.appendItem(slide_translation);
	
	// Draw the scales	
	function scale_group(scales, y=0){
		const group = make_node('g');
		for(const [i, name] of scales.entries()){
			const scale = make_scale({
				name,
				height:scale_height, 
				length,
				min_separation:minimum_tick_separation/length
			});
			const translate = svg.createSVGTransform();
			translate.setTranslate(0, (scale_separation+scale_height)*i+y);
			scale.transform.baseVal.appendItem(translate);
			group.appendChild(scale);
		}
		return group;
	};
	svg.appendChild(scale_group(top_scales, scale_separation));
	slide.appendChild(scale_group(slide_scales, top_height));
	svg.appendChild(scale_group(bottom_scales, top_height+slide_height));
	
	// Cursor on top
	const cursor = make_node('g');
	const cursor_rect = make_node('rect', {width:cursor_width, height:full_height, rx:10, x:-cursor_width/2, fill:'none', stroke:'black'});
	cursor_rect.setAttributeNS(null, 'stroke-width', cursor_stroke);
	cursor.appendChild(cursor_rect);
	cursor.appendChild(make_node('line', {x1:0, x2:0, y1:0, y2:full_height, stroke:'red'}));
	const cursor_translation = svg.createSVGTransform();
	cursor.transform.baseVal.appendItem(cursor_translation);
	svg.appendChild(cursor);
	
	// Make the slide rule move
	let offset = 0;
	function moveCursor({scale='D', to=1}){
		let x = SCALE[scale].func(to);
		if('B CI C'.split(' ').includes(scale)){
			x += offset;
		};
		cursor_translation.setTranslate(x*length, 0);
	};
	function moveSlide({scale_fixed='D', to_fixed=1, scale_moving='C', to_moving=1}){
		offset = SCALE[scale_fixed].func(to_fixed) - SCALE[scale_moving].func(to_moving);
		slide_translation.setTranslate(offset*length, 0);
	};
	return {moveCursor, moveSlide, svg};
};

export {make_rule, SCALE}