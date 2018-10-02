var parser, xmlDoc;
var habs;
var canvas;
var rows = [];
var margin = 25;
var globalwid = 120;
var globalhei = 130;
var pontos = 1;
var levels = 1;
var loaded = false;
var xmltotal = "";
var curclass = 0;
var cdesc = [];
var urlparams = "";
var urlloaded = false;
var url = window.location.href;

function httpGet(url){
	try{
		var xmlhttp = new XMLHttpRequest();
		if (!window.XMLHttpRequest){ //Ie da desgrasa
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		xmlhttp.addEventListener("load", function(){
			console.log("xml loaded");
		});
		xmlhttp.open("GET", url, false);
		xmlhttp.send();
		return xmlhttp.responseText;
	}catch(err){
	}
}
function reqListener () {
}

function load(){
	var tsvonline = "";
	tsvonline = httpGet("https://raw.githubusercontent.com/mazorx/gakriv/master/habilidades.tsv");
	
    var x, i, txt, xmlDoc;
	parser = new DOMParser();
	var xmltext = "";
	//xmltext = document.getElementById("xmlarea").value + "";
	if(xmltext != ""){
		if(xmltext.substring(0,7) == "<class>"){
			xmltotal = xmltext;
		}else{
			xmltotal = convert(xmltext);
		}
	}else if(tsvonline != ""){
		xmltotal = convert(tsvonline);
	}else{
		xmltotal = xmlstring;
	}
	
	xmlfinal = getTags("class",xmltotal)[curclass];
	
	loadclasses();
	
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
	
	resetPts();
	refreshPts();
	loaded = true;
	//chave(200,300,250,0);
	
	sincPosition();
	loadUrl();
	save();
}

function loadUrl(){
	if(!urlloaded){
		urlloaded = true;
		var url = window.location.href;
		
		var curc = "";
		var lvl = "";
		var sel = [];
		try{
			var curc = url.split("curclass=")[1].split("&")[0];
		}catch{
		}
		if(curc == ""){
			curc = 0;
		}
		try{
			var allsel = url.split("selected=")[1].split("&")[0];
			if(allsel.split("%2C").length > 1){
				var sel = allsel.split("%2C");
			}else{
				var sel = allsel.split(",");
			}
		}catch{
		}
		try{
			var lvl = url.split("level=")[1].split("&")[0];
		}catch{
		}
		if(lvl == ""){
			lvl = 1;
		}
		sClass(curc);
		document.getElementById("lvlselect").selectedIndex = lvl-1;
		levels = lvl;
		pontos = lvl;
		setLevels();
		for(var i = 0; i < sel.length; i++){
			try{
				selectHab(habs[sel[i]].getCod());
			}catch(err){
			}
		}
		document.getElementById("pts").innerHTML = pontos;
	}
}

function restate(){
	curclass = 0;
	levels = 1;
	pontos = 1;
	document.getElementById("lvlselect").selectedIndex = levels-1;
	sClass(curclass);
	setLevels();
}

function save(){
	try{
		var curp = "?";
		curp += "curclass="+curclass+"&";
		curp += "level="+levels+"&";
		curp += "selected=";
		var sel = 0;
		for (var i = 0; i < habs.length; i++){
			if(habs[i].isSelected()){
				sel++;
				curp += i+",";
			}
		}
		if(sel>0){
			curp = curp.substring(0,curp.length-1) + "&";
		}else{
			curp = curp.substring(0,curp.length-9);
		}
		
		curp = curp.substring(0,curp.length-1);
		window.history.pushState('Hability Viewer', 'Hability Viewer', curp);
	}catch(err){
	}
}

function loadclasses(){
	var classes = getTags("class",xmltotal);
	var html = "";
	cdesc = [];
	for(var i = 0; i < classes.length; i++){
		try{
			var name = getTag("cname",0,classes[i]);
			var img = getTag("cimg",0,classes[i]);
			cdesc = cdesc.concat(decode(getTag("cdesc",0,classes[i]) + "<br/>" + getTag("passiva",0,classes[i])));
			var bs = "";
			var gs = 0;
			if(curclass == i){
				var bs = "box-shadow: 0px 0px 10px 5px rgba(255, 255, 255, 1);";
			}
			html += `<div id="`+i+`" onclick="sClass(`+i+`)" style="display:inline-block;
			text-align:center;
			width:110px;
			height:110px;
			border-radius: 50px;
			
			filter:grayscale(`+gs+`%);">
			<img style="
			width:100px;
			height:100px;
			border-radius: 50px;
			`+bs+`"
			src="`+img+`"></img><br/>
			`+name+`
			</div>`;
		}catch(err){
		}
	}
	document.getElementById("classes").innerHTML = html;
}

function sincPosition(){
	if(cdesc.length > 0){
		document.getElementById("cadd").innerHTML = cdesc[curclass];
		var x = $("#canv").offset();
		document.getElementById("habs").style.top = x.top +"px";
	}
	setTimeout(sincPosition, 100);
}

function sClass(c){
	curclass = c;
	if(cdesc.length > 0){
		document.getElementById("cadd").innerHTML = cdesc[curclass];
	}
	load();
	save();
}

function reload(){
	load();
}

function click(cod){
	if(loaded){
		var pos;
		for (var p = 0; p < habs.length; p++){
			if(habs[p].getCod() == cod){
				pos = p;
			}
		}
		if(habs[pos].isSelected()){
			desselectHab(cod);
		}else{
			selectHab(cod);
		}
		refreshPts();
	}else{
	}
	save();
}

function setLevels(){
	levels = document.getElementById("lvlselect").value;
	resetPts();
	save();
}

function selectHab(cod){
	var pos;
	for (var p = 0; p < habs.length; p++){
		if(habs[p].getCod() == cod){
			pos = p;
		}
	}
	var rh = habs[pos].getReqHab();
	if(rh != ""){
		for(var i = 0; i < rh.length; i++){
			selectHab(rh[i]);
		}
		if(pontos > 0 & !habs[pos].isSelected() & levels >= parseInt(habs[pos].reqlvl)){
			pontos--;
			habs[pos].select();
		}
	}else{
		if(pontos > 0 & !habs[pos].isSelected() & levels >= parseInt(habs[pos].reqlvl)){
			pontos--;
			habs[pos].select();
		}
		stop = true;
	}
}

function desselectHab(cod){
	var subs = false;
	var pos;
	for (var p = 0; p < habs.length; p++){
		if(habs[p].getCod() == cod){
			pos = p;
		}
	}
	for(var i = 0; i < habs.length; i++){
		var rh = habs[i].getReqHab();
		var todes = false;
		for(var r = 0; r < rh.length; r++){
			if(rh[r] == habs[pos].getCod()){
				desselectHab(habs[i].getCod());
			}
		}
	}
	if(habs[pos].isSelected()){
		habs[pos].desselect();
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
			click(code+"")
		};
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
		this.distance = "";
		if(getTag("distance",0,xml)+"" != ""){
			this.distance = decode("Alcânce: "+decode(getTag("distance",0,xml)) + "<br/>");
		}
		this.cooldown = "";
		if(getTag("cooldown",0,xml)+"" != ""){
			this.cooldown = "Tempo de Recarga: "+decode(getTag("cooldown",0,xml)) + "<br/>";
		}
		this.mana = "";
		if(getTag("mana",0,xml)+"" != ""){
			this.mana = "<b style=\"color:#00f6ff;\">Custo de Mana: </b>" + decode(getTag("mana",0,xml)) + "<br/>";
		}else{
			this.mana = "";
		}
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
		+"<img id=\"im"+this.cod+"\" style=\"filter: grayscale("+this.grayscale+"%); box-shadow: 0px 0px 0px yellow; \" src=\""
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
		+this.distance
		+this.cooldown
		+this.mana
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
		var color = "rgba(255, 255, 200, 0.2)";
		var size = "2px"
		var gausian = "8px";
		var bs = ""+size+" "+size+" "+gausian+" "+color+", "+size+" -"+size+" "+gausian+" "+color+", -"+size+" -"+size+" "+gausian+" "+color+", -"+size+" "+size+" "+gausian+" "+color+"";
		document.getElementById("im"+this.cod).style.filter=gs;
		document.getElementById("im"+this.cod).style["boxShadow"] = bs;
	}
	
	desselect(){
		this.grayscale = 100;
		var gs = "grayscale("+this.grayscale+"%)";
		var bs = "0px 0px 0px yellow";
		document.getElementById("im"+this.cod).style.filter=gs;
		document.getElementById("im"+this.cod).style["boxShadow"]=bs;
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


function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}

function convert(tsv){
	var xml = "";
	
	var tables = tsv.split("\n--												");
	
	for(var t = 0; t < tables.length; t++){
		if(tables[t].length > 4){
			xml +="<class>";
			xml +="<cname>"+tables[t].split("	")[0]+"</cname>";
			xml +="<cimg>"+tables[t].split("	")[1]+"</cimg>";
			xml +="<passiva>"+tables[t].split("	")[11]+"</passiva>";
			xml +="<cdesc>"+tables[t].split("	")[12]+"</cdesc>";
			
			var rows = tables[t].split("\n");
			for(var i = 1; i < rows.length; i++){
				try{
					var vals = rows[i].split("	");
					var a = parseInt(vals[0]) + "";
					if(a != "NaN"){
						var cod = vals[0];
						var img = vals[1];
						var title = vals[2];
						var row = vals[3];
						var r1 = vals[4] + "";
						var r2 = vals[5] + "";
						var r3 = vals[6] + "";
						var dist = vals[7] + "";
						var cd = vals[8] + "";
						var mana = vals[9] + "";
						var lvl = vals[10];
						var type = vals[11];
						var desc = vals[12];
						var reqtext = "";
						if(r1 != ""){
							reqtext += "<reqhab>"+r1+"</reqhab>";
						}
						if(r2 != ""){
							reqtext += "<reqhab>"+r2+"</reqhab>";
						}
						if(r3 != ""){
							reqtext += "<reqhab>"+r3+"</reqhab>";
						}
						var bracket = `
						<hability>
							<cod>`+cod+`</cod>
							<image>`+img+`</image>
							<title>`+title+`</title>
							<row>`+row+`</row>
							<requires>`+reqtext+`</requires>
							<reqlvl>`+lvl+`</reqlvl>
							<type>`+type+`</type>
							<cooldown>`+cd+`</cooldown>
							<distance>`+dist+`</distance>
							<mana>`+mana+`</mana>
							<description>`+desc+`</description>
						</hability>
						`;
						xml += bracket;
					}
				}catch(err){
					
				}
				
				
			}
			xml +="</class>";
		}
	}
	return xml;
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

var xmlstring = `
`;
