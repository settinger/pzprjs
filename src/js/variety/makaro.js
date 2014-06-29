//
// パズル固有スクリプト部 マカロ版 makaro.js v3.4.1
//
pzpr.classmgr.makeCustom(['makaro'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart){ this.inputqnum_makaro();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if(this.isBorderMode()){ this.inputborder();}
				else                   { this.inputarrow_cell();}
			}
			else if(this.mouseend && this.notInputted()){
 				this.inputqnum_makaro();
			}
		}
	},

	inputarrow_cell_main : function(cell, dir){
		cell.setQnum(-1);
		cell.setAnum(-1);
		if(cell.qdir!==dir){
			cell.setQdir(dir);
			cell.setQues(1);
		}
		else{
			cell.setQdir(cell.NDIR);
			cell.setQues(0);
		}
	},

	inputqnum_makaro : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			if(this.owner.editmode){
				if(this.inputcell_makaro_edit(cell)){ return;}
			}
			
			if(cell.ques!==1){
				this.inputqnum_main(cell);
			}
		}
		this.mouseCell = cell;
	},
	inputcell_makaro_edit : function(cell){
		var val = null;
		if(cell.ques===1 && cell.qdir!==cell.NDIR){
			val = -3;
		}
		else if(cell.ques===1 && cell.qdir===cell.NDIR){
			if     (this.btn.Left) { val = -2;}
			else if(this.btn.Right){ val = -1;}
		}
		/* inputqnum_mainの空白-?マーク間に黒マスのフェーズを挿入する */
		else if(cell.ques===0 && cell.qnum===-1){
			if(this.btn.Left){ val = -3;}
		}
		else if(cell.qnum===-2){
			if(this.btn.Right){ val = -3;}
		}

		if(val===-3){
			cell.setQues(1);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-1);
			cell.setAnum(-1);
			cell.draw();
		}
		else if(val===-1){
			cell.setQues(0);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-1);
			cell.setAnum(-1);
			cell.draw();
		}
		else if(val===-2){
			cell.setQues(0);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-2);
			cell.setAnum(-1);
			cell.draw();
		}

		return (val!==null);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		var cell = this.cursor.getc();
		
		if(this.owner.editmode){
			if(this.key_inputcell_makaro_edit(cell,ca)){ return;}
		}
		
		if(cell.ques!==1){
			this.key_inputqnum(ca);
		}
	},

	key_inputcell_makaro_edit : function(cell, ca){
		var retval = false;
		
		if(ca===' '){
			cell.setQues(0);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-1);
			cell.setAnum(-1);
			retval = true;
		}
		else if(ca==='-'){
			cell.setQues(cell.ques===0 ? 1 : 0);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-1);
			cell.setAnum(-1);
			retval = true;
		}
		else if(this.key_inputdirec(ca)){
			/* 数字とは排他になる */
			cell.setQues(1);
			cell.setQnum(-1);
			cell.setAnum(-1);
			retval = true;
		}
		
		if(retval){ cell.draw();}
		
		return retval;
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		return Math.min(99, this.owner.board.rooms.getCntOfRoomByCell(this));
	}
},
Border:{
	isBorder : function(){
		return this.isnull || this.ques>0 || !!(this.sidecell[0].ques===1 || this.sidecell[1].ques===1);
	}
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustCellArrow(key,d);
	}
},

AreaRoomManager:{
	enabled : true,

	isvalid : function(cell){ return (cell.ques===0);}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	cellcolor_func : "ques",
	arrowQuescolor : "white",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawShadedCells();

		this.drawCellArrows();
		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
	},

	// drawShadedCells用 オーバーライド
	getCellColor : function(cell){
		if(cell.ques!==1){ return null;}
		var info = cell.error || cell.qinfo;
		if     (info===0){ return this.quescolor;}
		else if(info===1){ return this.errcolor1;}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeMakaro();
	},
	encodePzpr : function(type){
		this.encodeBorder_makaro();
		this.encodeMakaro();
	},

	decodeMakaro : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if(this.include(ca,"0","9")){ cell.qnum = parseInt(ca,10)+1;}
			else if(ca == '-')          { cell.qnum = parseInt(bstr.substr(i+1,2),10)+1; i+=2;}
			else if(ca>='a' && ca<='e') { cell.ques = 1, cell.qdir = parseInt(ca,36)-10;}
			else if(ca>='g' && ca<='z') { c+=(parseInt(ca,36)-16);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeMakaro : function(){
		var cm = "", count = 0, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", cell=bd.cell[c], qn=cell.qnum;
			if     (qn>= 1&&qn< 11){ pstr =     (qn-1).toString(10);}
			else if(qn>=11&&qn<100){ pstr = "-"+(qn-1).toString(10);}
			else if(cell.ques===1) { pstr = (cell.qdir+10).toString(36);}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+15).toString(36);}

		this.outbstr += cm;
	},

	encodeBorder_makaro : function(){
		/* 同じ見た目のパズルにおけるURLを同じにするため、        */
		/* 一時的にcell.ques=1にしてURLを出力してから元に戻します */
		var bd = this.owner.board, sv_ques = [];
		for(var id=0;id<bd.bdmax;id++){
			sv_ques[id] = bd.border[id].ques;
			bd.border[id].ques = (bd.border[id].isBorder() ? 1 : 0);
		}
		
		this.encodeBorder();
		
		for(var id=0;id<bd.bdmax;id++){
			bd.border[id].ques = sv_ques[id];
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQuesData_makaro();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQuesData_makaro();
		this.encodeCellAnumsub();
	},

	decodeCellQuesData_makaro : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="t"){ cell.ques = 1; cell.qdir = 1;}
			else if(ca==="b"){ cell.ques = 1; cell.qdir = 2;}
			else if(ca==="l"){ cell.ques = 1; cell.qdir = 3;}
			else if(ca==="r"){ cell.ques = 1; cell.qdir = 4;}
			else if(ca==="#"){ cell.ques = 1; cell.qdir = 0;}
			else if(ca==="-"){ cell.qnum = -2;}
			else if(ca!=="."){ cell.qnum = parseInt(ca);}
		});
	},
	encodeCellQuesData_makaro : function(){
		this.encodeCell( function(cell){
			if(cell.ques===1){
				if     (cell.qdir===1){ return "t ";}
				else if(cell.qdir===2){ return "b ";}
				else if(cell.qdir===3){ return "l ";}
				else if(cell.qdir===4){ return "r ";}
				else                  { return "# ";}
			}
			else if(cell.qnum>=0)  { return (cell.qnum.toString()+" ");}
			else if(cell.qnum===-2){ return "- ";}
			else{ return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkDiffNumberInRoom(rinfo) ){ return 'bkDupNum';}

		if( !this.checkAdjacentDiffNumber() ){ return 'nmSameNum';}

		if( !this.checkPointAtBiggestNumber() ){ return 'arNotMax';}

		if( !this.checkEmptyCell() ){ return 'ceEmpty';}

		return null;
	},

	/* 矢印が盤外を向いている場合も、この関数でエラー判定します */
	/* 矢印の先が空白マスである場合は判定をスルーします         */
	checkPointAtBiggestNumber : function(){
		var result = true;
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(cell.ques!==1 || cell.qdir===cell.NDIR){ continue;}
			var list = cell.getdir4clist(), maxnum = -1, maxdir = cell.NDIR;
			var dupnum = false, isempty = false, invalidarrow = true;
			for(var i=0;i<list.length;i++){
				var num = list[i][0].getNum();
				if(num===-1){ /* 数字が入っていない場合何もしない */ }
				else if(num>maxnum){ maxnum=num; maxdir=list[i][1]; dupnum=false;}
				else if(num===maxnum){ maxdir=cell.NDIR; dupnum=true;}
				
				if(list[i][1]===cell.qdir){
					if(list[i][0].ques===0){ invalidarrow = false;}
					if(num===-1){ isempty = true;}
				}
			}
			
			if(invalidarrow || (!isempty && (dupnum || cell.qdir!==maxdir))){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				for(var i=0;i<list.length;i++){
					if(list[i][0].getNum()!==-1){ list[i][0].seterr(1);}
				}
				result = false;
			}
		}
		return result;
	},

	checkEmptyCell : function(){
		return this.checkAllCell( function(cell){ return cell.ques===0 && cell.noNum();} );
	}
},

FailCode:{
	bkDupNum : ["1つの部屋に同じ数字が複数入っています。","A room has two or more same numbers."],
	arNotMax : ["矢印の先が最も大きい数字でありません。", "An arrow doesn't point out biggest number."],
	ceEmpty : ["数字の入っていないマスがあります。","There is an empty cell."]
}
});