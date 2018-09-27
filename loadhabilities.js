var parser, xmlDoc;
var habs;
var canvas;
var rows = [];
var margin = 25;
var globalwid = 110;
var globalhei = 130;
var pontos = 1;
var levels = 1;
var loaded = false;

function load(){
  var xmlonline = $.ajax({
                    url: "https://rawgit.com/mazorx/gakriv/master/habilidades.xml",
                    async: false
                 }).responseText;
	
    var x, i, txt, xmlDoc;
	parser = new DOMParser();
	//xmlstring = xmlonline;
	xmlfinal = xmlstring;
	
	canvas = document.getElementById("canv");
	canvas.width = screen.width;
	canvas.height = screen.height;
	
    txt = "";
    x = getTags("hability");
	habs = new Array(x.length);
	setRows();
	
	for(var i = 0; i < x.length; i++){
		habs[i] = new hability(x[i]);
	}
	
	setPositions();
	
	canvas.width = firstWid() + 150;
	canvas.height = (rows.length * globalhei) + (margin * 2) + 150;
	
	drawAll();
	
	refreshPts();
	loaded = true;
	//chave(200,300,250,0);
}

function reload(){
  var xmlonline = $.ajax({
                    url: "https://rawgit.com/mazorx/gakriv/master/habilidades.xml",
                    async: false
                 }).responseText;
	
    var x, i, txt, xmlDoc;
	parser = new DOMParser();
	xmltext = document.getElementById("xmlarea").value + "";
	//xmlstring = xmlonline;
	if(xmltext != ""){
		xmlfinal = xmltext;
	}else{
		xmlfinal = xmlstring;
	}
	
	canvas = document.getElementById("canv");
	canvas.width = screen.width;
	canvas.height = screen.height;
	
    txt = "";
    x = getTags("hability");
	habs = new Array(x.length);
	setRows();
	
	for(var i = 0; i < x.length; i++){
		habs[i] = new hability(x[i]);
	}
	
	setPositions();
	
	canvas.width = firstWid() + 150;
	canvas.height = (rows.length * globalhei) + (margin * 2) + 150;
	
	drawAll();
	
	refreshPts();
	loaded = true;
	//chave(200,300,250,0);
}

function click(cod){
	if(loaded){
		if(habs[cod].isSelected()){
			desselectHab(cod);
		}else{
			selectHab(cod);
		}
		refreshPts();
	}else{
	}
}

function setLevels(){
	levels = document.getElementById("lvlselect").value;
	resetPts();
}

function selectHab(cod){
	var rh = habs[cod].getReqHab();
	if(rh != ""){
		for(var i = 0; i < rh.length; i++){
			selectHab(rh[i]);
		}
		if(pontos > 0 & !habs[cod].isSelected()){
			pontos--;
			habs[cod].select();
		}
	}else{
		if(pontos > 0 & !habs[cod].isSelected()){
			pontos--;
			habs[cod].select();
		}
		stop = true;
	}
}

function desselectHab(cod){
	var subs = false;
	for(var i = 0; i < habs.length; i++){
		var rh = habs[i].getReqHab();
		var todes = false;
		for(var r = 0; r < rh.length; r++){
			if(rh[r] == habs[cod].getCod()){
				desselectHab(i);
			}
		}
	}
	if(habs[cod].isSelected()){
		habs[cod].desselect();
		pontos++;
	}
}

function resetPts(){
	for(var i = 0; i < habs.length; i++){
		habs[i].desselect();
	}
	pontos = levels;
	refreshPts();
}

function refreshPts(){
	document.getElementById("pts").innerHTML = pontos;
}

function firstWid(){
	var toret = 0;
	for(var i = 0; i < habs.length; i++){
		if(habs[i].getRow() == 1){
			toret += habs[i].getWid();
		}
	}
	return toret;
}

function setRowsPerLevel(){
	var x = getTags("hability");
    for (i = 0; i < x.length; i++) {
		var checkrow = false;
		for(var r = 0; r < rows.length; r++){
			if(getTag("reqlvl",i) == rows[r]){
				checkrow = true;
			}
		}
		if(!checkrow){
			rows = rows.concat(getTag("reqlvl",i));
		}
    }
	rows.sort();
}

function setRowsTag(){
	rows = getTag("rows",0).split(",");
}

function setRows(){
	var x = getTags("row");
	var rquant = 0;
    for (i = 0; i < x.length; i++) {
		if(x[i] > rquant){
			rquant = x[i];
		}
	}
	
	rows = [];
	for(var i = 0; i < rquant; i++){
		rows = rows.concat(i+1);
	}
	//log(rows);
}

function setPositions(){
	//Posições mais basicas
	for(var i = 1; i < rows.length+1; i++){
		var currow = i;
		var curx = margin;
		for(var h = 0; h < habs.length; h++){
			var hr = -1;
			if(habs[h].getRow() == i){
				habs[h].setX(curx);
				habs[h].setY((currow-1)*globalhei + margin);
				curx = curx + habs[h].getWid();
				try{
					if(habs[h].getReqHab().length > 0){
						var quant = 0;
						var tot = 0;
						for(var r = 0; r < habs[h].getReqHab().length; r++){
							tot += getposX(habs[h].getReqHab()[r]);
							quant++;
						}
						var x = tot / quant;
						x = x == 0 ? margin : x;
						x = colideX(x,h);
						habs[h].setX(x);
					}
				}catch(err){
					//log(err);
				}
			}
		}
	}
}

function getposX(cod){
	for(var i = 0; i < habs.length; i++){
		if(habs[i].getCod() == cod){
			return habs[i].getX();
		}
	}
	return 0;
}

function colideX(x,cod){
	var toret = x;
	var y = habs[cod].getY();
	for(var i = 0; i < habs.length; i++){
		var samereq = compareReqHab(cod,i);
		//log(samereq);
		if(habs[i].getCod() != habs[cod].getCod() & habs[cod].getCod() != 0){
			if((habs[i].getX() <= x & habs[i].getX() + habs[i].getWid() >= x) &
				(habs[i].getY() <= y & habs[i].getY() + globalhei > y)){
					toret = colideX(habs[i].getX() + habs[i].getWid()+1,cod);
			}else if(habs[i].getX() == x & samereq){
				toret = colideX(x+habs[i].getWid(),cod);
			}
		}
	}
	return toret;
}

function compareReqHab(cod1,cod2){
	var r1 = habs[cod1].getReqHab();
	var r2 = habs[cod2].getReqHab();
	var same = r1.length == r2.length;
	for(var i = 0; i < r1.length; i++){
		var ss = false;
		for(var r = 0; r < r2.length; r2++){
			if(r1[i] == r2[r]){
				ss = true;
			}
		}
		same = ss;
	}
	return same;
}

function getSubs(cod){
	var toret = 0;
	var tags = getTags("hability");
	for(var i = 0; i < tags.length; i++){
		var rr = getTags("reqhab",tags[i]);
		var rc = getTags("cod",tags[i]);
		for(var r = 0; r < rr.length; r++){
			if(rr[r] == cod){
				toret++;
				var subsubs = getSubs(rc[0].split("\n")[0]);
				if(subsubs != 0){
					toret += (subsubs -1);
				}
			}
		}
	}
	return toret;
}

function log(str){
	document.getElementById("debug").innerHTML = document.getElementById("debug").innerHTML + safe_tags(str) + "<br/>";
}

function drawAll(){
	document.getElementById("habs").innerHTML = "";
	for(var h = 0; h < habs.length; h++){
		var i = h;
		habs[i].setHtml();
		document.getElementById("habs").insertAdjacentHTML('beforeend',habs[i].getHtml());
		var ccc = habs[i].getCod();
		document.getElementById("h"+ccc).onclick = function(){
			var code = this.getAttributeNode("id").value;
			code = code.substring(1);
			click(code+"")};
	}
	drawAllKeys();
}

function getTags(tag,xml=xmlfinal){
	var c = xml.split("<"+tag+">").length -1;
	var toret = [];
	for(var i = 0; i < c; i++){
		try{
			toret[i] = getTag(tag,i,xml);
		}catch(err){
			try{
				toret.concat(getTag(tag,i,xml));
			}catch(err){
				
			}
		}
	}
	return toret;
}

function getTag(tag,i,xml=xmlfinal){
	var toret = "";
		var s1 = xml.split("<"+tag+">")[i+1];
		toret = s1.split("</"+tag+">")[0].replace("	","");
		if(toret.substring(toret.length-1) == "\n"){
			toret = toret.substring(0,toret.length-1);
		}
	try{
	}catch(err){
	}
	return toret;
}

function safe_tags(str) {
	try{
		return str.replace(/&/g,'&amp;').replace(/</g,'&lt;');
	}catch(err){
		return str;
	}
}

function levelup(cod){
}

function createLine(x1, y1, x2, y2) {
    var a = x1 - x2,
        b = y1 - y2,
        c = Math.sqrt(a * a + b * b);

    var sx = (x1 + x2) / 2,
        sy = (y1 + y2) / 2;

    var x = sx - c / 2,
        y = sy;

    var alpha = Math.PI - Math.atan2(-b, a);

    return createLineElement(x, y, c, alpha);
}

function chave(x1,y1,x2,y2){
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.moveTo(x1, y1);
	var halfy = y1 > y2 ? (y1-y2)/2 : (y2-y1)/2;
	ctx.strokeStyle="#fff";
	ctx.bezierCurveTo(x1, y2, x2, y1, x2, y2);
	ctx.stroke();
}

function drawAllKeys(){
	for(var i = 0; i < habs.length; i++){
		habs[i].drawKeys();
	}
}

class hability {
	constructor(xml){
		this.xml = xml;
		this.cod = decode(getTag("cod",0,xml).split("\n")[0]);
		this.img = decode(getTag("image",0,xml));
		this.title = decode(getTag("title",0,xml));
		this.type = decode(getTag("type",0,xml));
		this.description = decode(getTag("description",0,xml));
		this.reqlvl = decode(getTag("reqlvl",0,xml));
		this.reqhab = getTags("reqhab",xml);
		this.reqhabtitle = "- ";
		this.subs = getSubs(this.cod);
		this.row = decode(getTag("row",0,xml));
		this.grayscale = 100;
		
		this.pos=0;
		this.x = 0;
		this.y = 0;
		this.wid = globalwid * this.subs;
		if(this.wid == 0)
			this.wid = globalwid;
		try{
			if(this.reqhab.length > 0){
				this.reqhabtitle = "";
			}
			var thabs = getTags("hability");
			for(var i = 0; i < thabs.length; i++){
				for(var r = 0; r < this.reqhab.length; r++){
					if(getTag("cod",0,thabs[i]) == this.reqhab[r]){
						this.reqhabtitle += "<br/>" + decode(getTag("title",0,thabs[i])) + ", ";
					}
				}
			}
			this.reqhabtitle = this.reqhabtitle.substring(0,this.reqhabtitle.length-2);
		}
		catch(err){
			//log(err);
		}
		this.setHtml();
	}
	
	setHtml(){
	var textshadow = " -1px -1px 4px #000, ";
	var tsm = 6;
	var tsfinal = "";
	
	for(var i = 0; i < tsm; i++){
		tsfinal += textshadow;
	}
	
	tsfinal = tsfinal.substring(0,tsfinal.length-2);
		this.html = "<div id=\"h"+this.cod
		+"\" style=\"position:absolute;"
		+"left:"+this.x+"px;"
		+"top:"+this.y+"px;"
		+"width:"+this.wid+"px;"
		+"\""
		+" class=\"tooltip\"> <div style=\"position:relative;width:50px;left:calc(50% - 25px)\">"
		+"<img id=\"im"+this.cod+"\" style=\"filter: grayscale("+this.grayscale+"%);\" src=\""
		+ this.img
		+"\"/>"
		+"<div style=\"position:absolute;right:-20px;bottom:-5px;color:yellow;text-shadow: "+tsfinal+";\">LvL "+this.reqlvl+"</div>"
		+"</div>"
		+"<div style=\"background-color:black;\">"
		+this.title
		+"</div>"
		+"<span style=\"text-align:left;padding:5px;\" class=\"tooltiptext\">"
		+this.title
		+"<br/>TIPO: "
		+this.type
		+"<br/><b>"
		+decode("Pré Requisito: ")
		+this.reqhabtitle + " | Level " + this.reqlvl
		+"</b><br/>"
		+this.description
		+"</span></div>";
	}
	
	drawKeys(){
		for(var i = 0; i < habs.length; i++){
			for(var rr = 0; rr < this.reqhab.length; rr++){
				if(habs[i].getCod() == this.reqhab[rr]){
					var hx = habs[i].getX() + (habs[i].getWid()/2);
					var hy = habs[i].getY() + 70;
					var tx = this.x + (this.wid/2);
					var ty = this.y;
					chave(tx,ty,hx,hy);
				}
			}
		}
	}
	
	getRow(){
		return this.row;
	}
	
	getCod(){
		return this.cod;
	}
	
	hasParent(){
		return this.reqhabtitle != "-"
	}
	
	getReqHab(){
		return this.reqhab;
	}
	
	getTitle(){
		return this.title;
	}
	
	getLvl(){
		return this.reqlvl;
	}
	
	getPos(){
		return this.pos;
	}
	
	getX(){
		return this.x;
	}
	
	getY(){
		return this.y;
	}
	
	getWid(){
		return this.wid;
	}
	
	getHtml(){
		return this.html;
	}
	
	isSelected(){
		return this.grayscale != 100;
	}
	
	setX(x){
		this.x = x;
	}
	
	setY(y){
		this.y = y;
	}
	
	setPos(pos){
		this.pos = pos;
	}
	
	setWid(wid){
		this.wid = wid;
	}
	
	select(){
		this.grayscale = 0;
		var gs = "grayscale("+this.grayscale+"%)";
		document.getElementById("im"+this.cod).style.filter=gs;
	}
	
	desselect(){
		this.grayscale = 100;
		var gs = "grayscale("+this.grayscale+"%)";
		document.getElementById("im"+this.cod).style.filter=gs;
	}
}

function getsubquant(cod){
	var x = xmlDoc.getElementsByTagName("hability");
	for(var i = 0;i < x.length;i++){
		
		if(x[i].getElementsByTagName("reqhab")){
			
		}
	}
}

function encode(s) {
	try{
		return unescape(encodeURIComponent(s));
	}catch(err){
		return s;
	}
}

function decode(s) {
	try{
		return decodeURIComponent(escape(s));
	}catch(err){
		return s;
	}
}

var xmlmodel = `
	<hability>
		<cod></cod>
		<image>
		
		</image>
		<title>
		
		</title>
		<row>1</row>
		<requires>
		<reqhab></reqhab>
		<reqlvl>1</reqlvl></requires>
		<type>
		
		</type>
		<description>
		
		</description>
	</hability>
`;

var xmlfinal = "";

var xmlstring = `<class>
	<hability>
		<cod>0</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0114.jpg
		</image>
		<title>
		Defender Impacto
		</title>
		<row>1</row>
		<requires>
		<reqhab></reqhab>
		<reqlvl>1</reqlvl></requires>
		<type>Ativa (Defensiva)</type>
		<description>
		Ganhe +1 permanente para usar o movimento Defender.
		</description>
	</hability>
	<hability>
		<cod>1</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0214.jpg
		</image>
		<title>
		Pancada Corporal
		</title>
		<row>1</row>
		<requires>
		<reqhab></reqhab>
		<reqlvl>1</reqlvl></requires>
		<type>
		Ativa (Ofensiva)
		</type>
		<description>
		Usa o próprio corpo para causar dano em um inimigo. O dano é equivalente a 1d6 +2 para cada 10 pontos de vida máxima.
		</description>
	</hability>
	<hability>
		<cod>2</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0314.jpg
		</image>
		<title>
		Reforçar Armadura
		</title>
		<row>1</row>
		<requires>
		<reqhab></reqhab>
		<reqlvl>1</reqlvl></requires>
		<type>
		Passiva
		</type>
		<description>
		Aumenta permanentemente a Armadura em +1.
		</description>
	</hability>
	<hability>
		<cod>3</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0414.jpg
		</image>
		<title>
		Reforçar Defesa Mágica
		</title>
		<row>1</row>
		<requires>
		<reqhab></reqhab>
		<reqlvl>1</reqlvl></requires>
		<type>
		Passiva
		</type>
		<description>
		Aumenta permanentemente a Defesa Mágica em +1.
		</description>
	</hability>
	<hability>
		<cod>4</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0514.jpg
		</image>
		<title>
		Vitalidade
		</title>
		<row>1</row>
		<requires>
		<reqhab></reqhab>
		<reqlvl>2</reqlvl></requires>
		<type>
		Passiva
		</type>
		<description>
		Ganha +1 de HP máximo para cada 2 níveis.
		</description>
	</hability>
	<hability>
		<cod>5</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0614.jpg
		</image>
		<title>
		Força de Espírito
		</title>
		<row>2</row>
		<requires>
		<reqhab>4</reqhab>
		<reqlvl>2</reqlvl></requires>
		<type>
		Passiva
		</type>
		<description>
		Regenera 1 de vida por turno para cada 10 pontos de HP máximo.
		</description>
	</hability>
	<hability>
		<cod>6</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0714.jpg
		</image>
		<title>
		Revestir
		</title>
		<row>2</row>
		<requires>
		<reqhab>2</reqhab>
		<reqhab>3</reqhab>
		<reqlvl>1</reqlvl></requires>
		<type>
		Ativa (Defensiva)
		</type>
		<description>
		Aumenta o bônus de Reforçar Armadura e Reforçar Defesa Mágica por +1 por 2 turnos.
		</description>
	</hability>
	<hability>
		<cod>7</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0815.jpg
		</image>
		<title>
		Pancada Estonteante
		</title>
		<row>4</row>
		<requires>
		<reqhab>1</reqhab>
		<reqlvl>5</reqlvl></requires>
		<type>
		Ativa (Ofensiva)
		</type>
		<description>
		Dá uma pancada forte no corpo de um oponente que lhe joga para longe e causa 1d8 de dano.
		</description>
	</hability>
	<hability>
		<cod>8</cod>
		<image>
		https://i.servimg.com/u/f58/16/36/10/96/0914.jpg
		</image>
		<title>
		Escudo Refletor
		</title>
		<row>4</row>
		<requires>
		<reqhab>0</reqhab>
		<reqlvl>5</reqlvl></requires>
		<type>
		Ativa (Utilitária)
		</type>
		<description>
		Ao ativar esta habilidade, ela durará por 3 turnos e devolverá 1d4 para cado dano recebido ao atacante automaticamente (se o atacante acertar a pancada no Tank, ele sofrerá o dano de retorno sem precisar de rolagem).
		</description>
	</hability>
</class>
`;
