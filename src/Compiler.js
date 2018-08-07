import Lexer from './Lexer.js';

class Command{
	
	constructor(name, payload){
		if(!Command.valid.has(name)){
			throw 'Unknown Command: ' + name;
		}
		
		this.type = Command.valid.get(name);
		this.payload = payload;
	}
}

Command.valid = new Map();
Command.valid.set('forward', 4);
Command.valid.set('back', 3);
Command.valid.set('right', 2);
Command.valid.set('left', 1);

export default class Compiler{
	constructor(){
		
	}
	
	generateTree(tokArray){
		let tree = [];
		for(let i = 0; i != tokArray.length; i+=2){
			if(tokArray[i].type === Lexer.Token.ACT && tokArray[i + 1].type === Lexer.Token.NUM){
				tree.push(new Command(tokArray[i].data, tokArray[i + 1].data));
			}else{
				throw "Error Generating tree: ";
			}
		}
		return tree;
	}
	
	compile(arr){
		let compiled = [];
		let tree = this.generateTree(arr);
		for(let i = 0; i != tree.length; i++){
			switch(tree[i].type){
				case Command.valid.get('forward'):
				case Command.valid.get('back'):
					let payload = tree[i].payload;
					while(payload != 0){
						compiled.push((tree[i].type << 4) | (payload * 10) & 15);
						payload = payload >> 15;
					}
					break;	
				case Command.valid.get('right'): 
				case Command.valid.get('left'):
					compiled.push((tree[i].type << 4) | ((16 * tree[i].payload) / 180) & 15);
					break;
			}
		}
		
		return compiled
	}
}