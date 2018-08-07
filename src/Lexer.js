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

export default class Lexer{
	static get Token(){
		return Token;
	}
	
	constructor(){
		//Inspired by LLVM's Kaleidoscope but adapted to robotics in gay es.
		this.tree = [];
		this.input = '';
		this.index = 0;
	}
	
	reset(){
		this.tree.length = 0;
		this.input = '';
		this.index = 0;
	}
		
	lex(str){
		this.input = str + String.fromCharCode(4);
		let token = 0;
		while(token.type != Token.EOF){
			token = this.getToken();
			
			switch(token.type){
				case Token.UNK: {
					throw("Err: Unknown token: ", token);
					break;
				}
				
				case Token.ACT: {
					this.tree.push(token);
					break;
				}
				
				case Token.NUM: {
					this.tree.push(token);
					break;
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
	};