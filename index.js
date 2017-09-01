var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

function drawMap(width, height, size) {
  var w = Math.floor(width/size);
  var h = Math.floor(height/size);
  ctx.beginPath();
  for (var x = 0; x < w; x++) {
    ctx.moveTo(x*size, 0);
    ctx.lineTo(x*size, height);
  }
  for (var y = 0; y < w; y++) {
    ctx.moveTo(0, y*size);
    ctx.lineTo(width, y*size);
  }
  ctx.stroke();
}

function drawSquare(x, y, color) {
  if (!mapData[x][y] || mapcomp() >= 80 && !won()) {
    mapData[x][y] = color;
    ctx.fillStyle = color;
    ctx.fillRect(x*size, y*size, size, size);
    drawMiniMap(205, (img)=>{
  	  document.querySelector("#img").innerHTML = "";
      document.querySelector("#img").appendChild(img);
      document.querySelector("#scores").innerHTML = "";
      var s = stats();
      for (var i = 0; i < Object.keys(s).length; i++) {
        var key = Object.keys(s)[i];
        document.querySelector("#scores").innerHTML += '<div style="background: '+key+'" class="c">'+s[key]+'</div>';
      }
      if (won()) {
        document.querySelector("#results").style.display = "inherit";
        var keys = Object.keys(s).slice(0,5);
        document.querySelector("#final-scores").innerHTML = "";
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          document.querySelector("#final-scores").innerHTML += '<div style="background: '+key+'" class="c">'+s[key]+'</div>';
        }
      }
    });
  }
}

function drawMiniMap(size, cb) {
  var c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  var s = size/50;
  var ct = c.getContext("2d");
  for (var x = 0; x < 50; x++) {
    for (var y = 0; y < 50; y++) {
      if (mapData[x][y]) {
        ct.fillStyle = mapData[x][y];
        ct.fillRect(x*s, y*s, s, s);
      }
    }
  }
  cb(c);
}

function stats() {
  var mapStats = {};
  for (var x = 0; x < 50; x++) {
    for (var y = 0; y < 50; y++) {
      if (mapData[x][y]) {
        if (!mapStats[mapData[x][y]]) mapStats[mapData[x][y]] = 0;
        mapStats[mapData[x][y]] += 1;
      }
    }
  }
  var sort = [];
  for (var color in mapStats) {
    sort.push([color, mapStats[color]]);
  }
  sort.sort(function(a, b) {
    return b[1] - a[1];
  });
  var obj = {};
  for (var i = 0; i < sort.length; i++) {
    obj[sort[i][0]] = sort[i][1];
  }
  return obj;
}

function won() {
  for (var x = 0; x < 50; x++) {
    for (var y = 0; y < 50; y++) {
      if (!mapData[x][y]) {
        return false;
      }
    }
  }
  return true;
}

function mapcomp() {
  var s = stats();
  var p = 0;
  for (var i = 0; i < Object.values(s).length; i++) {
    p += Object.values(s)[i];
  }
  return (p/2500)*100;
}

function newColor() {
  var c = '#'+Math.floor(Math.random()*16777215).toString(16);
  while (c.length < 7) {
    c = '#'+Math.floor(Math.random()*16777215).toString(16);
  }
  return c;
}

var speed = 50;
var size = 100;
var color = newColor();
var players = [];
var room = "#"+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);
document.querySelector("#link").innerHTML = "http://plir.us/"+room;
document.querySelector("#link").href = document.querySelector("#link").innerHTML.slice(15);

if (window.location.hash != "") {
  room = window.location.hash;
  window.onload = removeScreen;
}

var mapData = [];
for (var x = 0; x < 50; x++) {
  mapData[x] = [];
  for (var y = 0; y < 50; y++) {
    mapData[x][y] = undefined;
  }
}

drawMap(5000,5000,100);

var fx = new fox("game", room, (raw)=>{
  var data = JSON.parse(raw);
  if (raw[0] == "[") {
    mapData = data;
    for (var x = 0; x < mapData.length; x++) {
      for (var y = 0; y < mapData[0].length; y++) {
        if (mapData[x][y] != null) {
          drawSquare(x, y, mapData[x][y]);
        }
      }
    }
  } else if (data.type == "cmd") {
    drawSquare(data.x, data.y, data.color);
  }
});

var lastUser = undefined;
fx.addUser = (id)=>{
  console.log(id)
  if (!lastUser) {
    lastUser = id;
    console.log("sending")
    fx.msg(JSON.stringify(mapData));
  }
}

fx.removeUser = (id)=>{
  console.log(id);
  if (id == lastUser) {
    console.log("romoving");
    lastUser = undefined;
  }
}

// Controls
var map = {};
onkeydown = onkeyup = (e)=>{
    e = e || event;
    map[e.keyCode] = e.type == "keydown";
    var x = 0;
    var y = 0;
    // Up
    if (map[87]) {
      y -= speed;
    }
    if (map[65]) {
      x -= speed;
    }
    if (map[83]) {
      y += speed;
    }
    if (map[68]) {
      x += speed;
    }
    window.scrollBy(x, y);
}

document.querySelector("#canvas").addEventListener("click", (e)=> {
  var x = Math.floor(e.pageX/size);
  var y = Math.floor(e.pageY/size);
  drawSquare(x,y,color)
  fx.msg(JSON.stringify({type:"cmd",x:x,y:y,color:color}));
});

function removeScreen() {
  document.querySelector("#bg").style.display = "none";
  document.querySelector("body").style.overflow = "inherit";
  document.querySelector("html").style.overflow = "inherit";
}

function pwf() {
  removeScreen();
}

function pn() {
  startBots(5);
  removeScreen();
}

function startBots(amt) {
  for (var i = 0; i < amt; i++) {
    bot();
  }
}

function bot() {
  var botColor = newColor();
  var x = Math.floor(Math.random()*50);
  var y = Math.floor(Math.random()*50);
  if (mapData[x][y] == undefined) {
    drawSquare(x,y,botColor)
    setInterval(() => {
      x = Math.min(Math.max((Math.floor(Math.random()*3)-1)+x,0),49);
      y = Math.min(Math.max((Math.floor(Math.random()*3)-1)+y,0),49);
      drawSquare(x,y,botColor);
    },270);
  } else {
    console.log("taken");
    bot();
  }
}
