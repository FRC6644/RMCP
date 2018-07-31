var RMCP = (function () {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function appendNode(node, target) {
		target.appendChild(node);
	}

	function insertNode(node, target, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function addListener(node, event, handler) {
		node.addEventListener(event, handler, false);
	}

	function removeListener(node, event, handler) {
		node.removeEventListener(event, handler, false);
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = noop;

		this._fragment.d(detach !== false);
		this._fragment = null;
		this._state = {};
	}

	function _differs(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._bind = options._bind;

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;
	}

	function on(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		this.root._lock = true;
		callAll(this.root._beforecreate);
		callAll(this.root._oncreate);
		callAll(this.root._aftercreate);
		this.root._lock = false;
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			this.fire("state", { changed: changed, current: this._state, previous: oldState });
			this._fragment.p(changed, this._state);
			this.fire("update", { changed: changed, current: this._state, previous: oldState });
		}
	}

	function callAll(fns) {
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	var proto = {
		destroy,
		get,
		fire,
		on,
		set,
		_recompute: noop,
		_set,
		_mount,
		_differs
	};

	class Token{
		static UNK(){
			return -2;
		}
		
		static get EOF(){
			return -1;
		}
		
		static get ACT(){
			return 1;
		}
		
		static get NUM(){
			return 2;
		}
		
		constructor(type, data){
			this.type = type;
			this.data = data;
		}
	}

	class Lexer{
		constructor(){
			//Inspired by LLVM's Kaleidoscope but adapted to robotics in gay es.
			this.tree = [];
			this.input = '';
			this.index = 0;
		}
		
		reset(){
			this.tree.length = 0;
		}
			
		lex(str){
			this.input = str + String.fromCharCode(4);
			let token = 0;
			while(token.type != Token.EOF){
				token = this.getToken();
				
				switch(token.type){
					case Token.UNK: {
						throw(token);
						break;
					}
					
					case Token.ACT: {
						this.tree.push(token);
						break;
					}
					
					case Token.NUM: {
						this.tree.push(token);
					}
				}
				
				//console.log(token);
			}
			return this.tree;
		}
			
		isAlphaNumeric(str){
			return (str.search(/^[a-z0-9]+$/i) != -1);
			//https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript/25352300
		}
			
		isAlpha(str){
			return (str.search(/^[a-z]+$/i) != -1);
		}
			
		isDigit(str){
			return (str.search(/^[0-9]+$/i) != -1);
		}
			
		getToken(){
			while(this.input[this.index] == ' ' || this.input[this.index] == '\n'){
				this.index++;
			}
				
			if(this.isAlpha(this.input[this.index])){
				let identifier = '';
				while(this.isAlphaNumeric(this.input[this.index])){
					identifier += this.input[this.index];
					this.index++;
				}
				
				return new Token(Token.ACT, identifier);
				}
				
				
				if(this.isDigit(this.input[this.index]) || this.input[this.index] == '.'){
					let numberString = '';
					while(this.isDigit(this.input[this.index]) || this.input[this.index] == '.'){
						numberString += this.input[this.index];
						this.index++;
					}
					
					return new Token(Token.NUM, Number(numberString));
				}
				
				if(String.fromCharCode(4) == this.input[this.index]){
					return new Token(Token.EOF);
				}
				
				return new Token(Token.UNK, this.input[this.index]);
			}
		}

	/* src\bit.html generated by Svelte v2.9.7 */

	class Command{
		constructor(direction, distance){
			this.direction = direction;
			this.distance = distance;
		}

	}

	function data() {
				return {
					compiled: [],
				};
			}
	var methods = {
		clear(){
			this.set({compiled: []});
		},
		decompile(){
			let arr = this.compile();
			let temp = [];
			for(let i = 0 ; i < arr.length; i ++){
				temp[i] = arr[i] >> 4;
				switch(temp[i]){
					case 4:
						temp[i] = new Command('up', arr[i] & 0x0F);
						break;
					case 3:
						temp[i] = new Command('down', arr[i] & 0x0F);
						break;
					case 2:
						temp[i] = new Command('right', arr[i] & 0x0F);
						break;
					case 1: 
						temp[i] = new Command('up', arr[i] & 0x0F);
						break;
				}
			
			}
			console.log(temp);
		},
		lex(){
			let l = new Lexer();
			let data = l.lex(this.refs.input.value);
			console.log(data);
		},
		compile(){
			var list = this.get().compiled;
			var arr = new Uint8Array(list.length);
			for(let i = 0 ; i < list.length; i++){
				switch(list[i]){
					case 'up':
						arr[i] = (4 << 4) | 15;
						break;
					case 'down':
						arr[i] = (3 << 4) | 15;
						break;
					case 'right':
						arr[i] = (2 << 4) | 8;
						break;
					case 'left':
						arr[i] = (1 << 4) | 8;
						break;
				}
			}
			console.log(arr);
			return arr;
		},
		addList(str){
			let data = this.get();
			data.compiled.push(str);
			this.set({compiled:data.compiled});
		}
	};

	function create_main_fragment(component, ctx) {
		var button, text_1, button_1, text_3, button_2, text_5, button_3, text_7, button_4, text_9, button_5, text_11, button_6, text_13, button_7, text_15, textarea, text_16, ul;

		function click_handler(event) {
			component.addList("up");
		}

		function click_handler_1(event) {
			component.addList("right");
		}

		function click_handler_2(event) {
			component.addList("down");
		}

		function click_handler_3(event) {
			component.addList("left");
		}

		function click_handler_4(event) {
			component.compile();
		}

		function click_handler_5(event) {
			component.decompile();
		}

		function click_handler_6(event) {
			component.clear();
		}

		function click_handler_7(event) {
			component.lex();
		}

		var each_value = ctx.compiled;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c() {
				button = createElement("button");
				button.textContent = "forward";
				text_1 = createText("\r\n");
				button_1 = createElement("button");
				button_1.textContent = "right";
				text_3 = createText("\r\n");
				button_2 = createElement("button");
				button_2.textContent = "back";
				text_5 = createText("\r\n");
				button_3 = createElement("button");
				button_3.textContent = "left";
				text_7 = createText("\r\n");
				button_4 = createElement("button");
				button_4.textContent = "compile";
				text_9 = createText("\r\n");
				button_5 = createElement("button");
				button_5.textContent = "decompile";
				text_11 = createText("\r\n");
				button_6 = createElement("button");
				button_6.textContent = "clear";
				text_13 = createText("\r\n");
				button_7 = createElement("button");
				button_7.textContent = "lex";
				text_15 = createText("\r\n");
				textarea = createElement("textarea");
				text_16 = createText("\r\n");
				ul = createElement("ul");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addListener(button, "click", click_handler);
				addListener(button_1, "click", click_handler_1);
				addListener(button_2, "click", click_handler_2);
				addListener(button_3, "click", click_handler_3);
				addListener(button_4, "click", click_handler_4);
				addListener(button_5, "click", click_handler_5);
				addListener(button_6, "click", click_handler_6);
				addListener(button_7, "click", click_handler_7);
				setStyle(textarea, "resize", "none");
				setStyle(textarea, "height", "80%");
			},

			m(target, anchor) {
				insertNode(button, target, anchor);
				insertNode(text_1, target, anchor);
				insertNode(button_1, target, anchor);
				insertNode(text_3, target, anchor);
				insertNode(button_2, target, anchor);
				insertNode(text_5, target, anchor);
				insertNode(button_3, target, anchor);
				insertNode(text_7, target, anchor);
				insertNode(button_4, target, anchor);
				insertNode(text_9, target, anchor);
				insertNode(button_5, target, anchor);
				insertNode(text_11, target, anchor);
				insertNode(button_6, target, anchor);
				insertNode(text_13, target, anchor);
				insertNode(button_7, target, anchor);
				insertNode(text_15, target, anchor);
				insertNode(textarea, target, anchor);
				component.refs.input = textarea;
				insertNode(text_16, target, anchor);
				insertNode(ul, target, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}
			},

			p(changed, ctx) {
				if (changed.compiled) {
					each_value = ctx.compiled;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(button);
				}

				removeListener(button, "click", click_handler);
				if (detach) {
					detachNode(text_1);
					detachNode(button_1);
				}

				removeListener(button_1, "click", click_handler_1);
				if (detach) {
					detachNode(text_3);
					detachNode(button_2);
				}

				removeListener(button_2, "click", click_handler_2);
				if (detach) {
					detachNode(text_5);
					detachNode(button_3);
				}

				removeListener(button_3, "click", click_handler_3);
				if (detach) {
					detachNode(text_7);
					detachNode(button_4);
				}

				removeListener(button_4, "click", click_handler_4);
				if (detach) {
					detachNode(text_9);
					detachNode(button_5);
				}

				removeListener(button_5, "click", click_handler_5);
				if (detach) {
					detachNode(text_11);
					detachNode(button_6);
				}

				removeListener(button_6, "click", click_handler_6);
				if (detach) {
					detachNode(text_13);
					detachNode(button_7);
				}

				removeListener(button_7, "click", click_handler_7);
				if (detach) {
					detachNode(text_15);
					detachNode(textarea);
				}

				if (component.refs.input === textarea) component.refs.input = null;
				if (detach) {
					detachNode(text_16);
					detachNode(ul);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (11:0) { #each compiled as command }
	function create_each_block(component, ctx) {
		var p, text_value = ctx.command, text;

		return {
			c() {
				p = createElement("p");
				text = createText(text_value);
			},

			m(target, anchor) {
				insertNode(p, target, anchor);
				appendNode(text, p);
			},

			p(changed, ctx) {
				if ((changed.compiled) && text_value !== (text_value = ctx.command)) {
					text.data = text_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.command = list[i];
		child_ctx.each_value = list;
		child_ctx.command_index = i;
		return child_ctx;
	}

	function Bit(options) {
		init(this, options);
		this.refs = {};
		this._state = assign(data(), options.data);
		this._intro = true;

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Bit.prototype, proto);
	assign(Bit.prototype, methods);

	return Bit;

}());
