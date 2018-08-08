//To DO: first, make a ball for each user. then, in an RTC connection, along with the voice info, send the position of the ball.



//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
    apiKey: "AIzaSyCymOh_cE-oA2jZo9PeruW1jacINPCxshQ",
    authDomain: "testingwebrtc-d087c.firebaseapp.com",
    databaseURL: "https://testingwebrtc-d087c.firebaseio.com",
    projectId: "testingwebrtc-d087c",
    storageBucket: "testingwebrtc-d087c.appspot.com",
    messagingSenderId: "864357972075"
  };
  firebase.initializeApp(config);

var database = firebase.database().ref();
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");
var otherfriendsVideo = document.getElementById("otherfriendsVideo");
var yourId; //
var sender;
var target;
var initialtarget;
var initiatorpc01;
var initiatorpc02;
var initiatorpc12;





//-----------------------------------------------------------------
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var ball = {
  pos: {x: 500,y: 300},
      direction: { x: 0, y: 0 },
  speed: 5,
      brake: 0.9, // smaller number stop faster, max 0.99999
};
var FPS = 30;
  /*window.onload = function() {
    setInterval(function() {
          animate();
      gameBack();
    }, 1000/FPS);
  };*/
  function animate() {
	  if (ball.pos.x > 0  && ball.pos.x < 1999 || ball.pos.x <0 && ball.direction.x >0  ||  ball.pos.x > 800 && ball.direction.x <0  ) {
      ball.pos.x += ball.direction.x * ball.speed;
	  }
	  if(ball.pos.y> 0  && ball.pos.y< 1999 || ball.pos.y <0 && ball.direction.y >0  ||  ball.pos.y > 600 && ball.direction.y <0 ){
	  ball.pos.y += ball.direction.y * ball.speed;
	  }
      ball.direction.x *= ball.brake;
      ball.direction.y *= ball.brake;
  }
  // background code
  function gameBack() {
    drawRect(0,0,canvas.width,canvas.height, 'Pink');
    colorCircle(ball.pos.x,ball.pos.y,10, 'Black');
  }
  // Rectangle Code
  function drawRect(leftX,topY,width,height, drawColor) {
    ctx.fillStyle = drawColor;
    ctx.fillRect(leftX,topY,width,height);
  }
  //Circle Code
  function colorCircle(centerX,centerY,radius, drawColor) {
    ctx.fillStyle = drawColor;
    ctx.beginPath();
    ctx.arc(centerX,centerY,radius,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
  }
  //Game Controls
  document.addEventListener('keydown', event => {
      if (event.keyCode === 37) { //Left
        xBall(-1);
      } else if (event.keyCode === 39) { //Right
        xBall(1);
      } else if (event.keyCode === 38) { //Up
        yBall(-1);
      } else if (event.keyCode === 40) { //Down
        yBall(1);
      }
  });
  function yBall(offset) {
    ball.direction.y += offset;
  }
  function xBall(offset) {
    ball.direction.x += offset;
  }
  //-------------------------------------------------------

function setID(ID){
  console.log("success " + ID);
  yourId = ID;
}


//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': '13111994','username': 'bassemsafieldeen@gmail.com'} with the information from your account
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': '13111994','username': 'bassemsafieldeen@gmail.com'}]};
var pc01 = new RTCPeerConnection(servers);
var pc02 = new RTCPeerConnection(servers);
var pc12 = new RTCPeerConnection(servers);


var sendchannel;
var receivechannel;
function startnow() {
if (yourId == 0){
sendchannel = pc01.createDataChannel('dataChannel', {
  // This configuration basically makes it act like a UDP connection, which is
  // useful for games. You can specify different options to a get more TCP-like
  // connection instead.
  maxRetransmits: 0,
  reliable: false
});
sendchannel.onopen = () => sendchannel.send("hello world, god damn it!");
sendchannel.onmessage = () => console.log("got message at 0");
console.log(sendchannel.readyState);
}

if(yourId == 1){
pc01.ondatachannel = function (event) {
  receivechannel = event.channel;
  receivechannel.onmessage = () => console.log("got message at 1");
  console.log(receivechannel.readyState);
};

}}

pc01.onicecandidate = (event => initiatorpc01==yourId?(event.candidate?sendMessage(yourId, initialtarget, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice")):(event.candidate?sendMessage(yourId, target, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice")) );
pc02.onicecandidate = (event => initiatorpc02==yourId?(event.candidate?sendMessage(yourId, initialtarget, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice")):(event.candidate?sendMessage(yourId, target, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice")) );
pc12.onicecandidate = (event => initiatorpc12==yourId?(event.candidate?sendMessage(yourId, initialtarget, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice")):(event.candidate?sendMessage(yourId, target, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice")) );


pc01.onaddstream = (event => yourId==0?friendsVideo.srcObject = event.stream:yourId==1?otherfriendsVideo.srcObject = event.stream:console.log("whatever"));
pc02.onaddstream = (event => yourId==2?friendsVideo.srcObject = event.stream:yourId==0?otherfriendsVideo.srcObject = event.stream:console.log("whatever"));
pc12.onaddstream = (event => yourId==1?friendsVideo.srcObject = event.stream:yourId==2?otherfriendsVideo.srcObject = event.stream:console.log("whatever"));

function sendMessage(senderId, targetId, data) {
    var msg = database.push({ sender: senderId, target: targetId, message: data });
    msg.remove();
}


function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    sender = data.val().sender;
    target = data.val().target;
    if (target==yourId && target==0 && sender==1  ||  target==yourId && target==1 && sender==0) {
        console.log("01");
        if (msg.ice != undefined){
            console.log("01a");
            pc01.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("01b");
            target = sender;
            pc01.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc01.createAnswer())
              .then(answer => pc01.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc01.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("01c");
            pc01.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
    if (target==yourId && target==0 && sender==2  ||  target==yourId && target==2 && sender==0) {
        console.log("02");
        if (msg.ice != undefined){
            console.log("02a");
            pc02.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("02b");
            target = sender;
            pc02.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc02.createAnswer())
              .then(answer => pc02.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc02.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("02c");
            pc02.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
    if (target==yourId && target==1 && sender==2  ||  target==yourId && target==2 && sender==1) {
        console.log("12");
        if (msg.ice != undefined){
            console.log("12a");
            pc12.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("12b");
            target = sender;
            pc12.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc12.createAnswer())
              .then(answer => pc12.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc12.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("12c");
            pc12.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
};

database.on('child_added', readMessage);

function showMyFace() {
  navigator.mediaDevices.getUserMedia({audio:true, video:false})
    .then(stream => yourVideo.srcObject = stream);
    //.then(stream => pc12.addStream(stream))
    //.then(stream => pc02.addStream(stream))
    //.then(stream => pc01.addStream(stream));
    showMyFaceAgain(pc01);
    showMyFaceAgain(pc02);
    showMyFaceAgain(pc12);
    setInterval(function() {
          animate();
      gameBack();
    }, 1000/FPS);
}

function showMyFaceAgain(PeerConnection) {
  navigator.mediaDevices.getUserMedia({audio:true, video:false})
  .then(stream => PeerConnection.addStream(stream));
}

function showFriendsFace() {
  sender = yourId;
  initialtarget = (yourId+1)%3;   //defining target for the first time
  if (yourId==0) {
     initiatorpc01 = yourId;
     pc01.createOffer()
         .then(offer => pc01.setLocalDescription(offer) )
         .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc01.localDescription})) );
  }
  if(yourId==1) {
  initiatorpc12 = yourId;
     pc12.createOffer()
         .then(offer => pc12.setLocalDescription(offer) )
         .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc12.localDescription})) );
  }
  if(yourId==2) {
    initiatorpc02 = yourId;
    pc02.createOffer()
        .then(offer => pc02.setLocalDescription(offer) )
        .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc02.localDescription})) );
  }
}


//disable scroll bar moving when arrow key is pressed down

document.onkeydown = KD;
       function KD(e) {
         event.returnValue = false;
       }
	   



function showOtherFriendsFace() {

  /*if (yourId == 0)
  pc01dc = pc01.createDataChannel('dataChannel', {
    // This configuration basically makes it act like a UDP connection, which is
    // useful for games. You can specify different options to a get more TCP-like
    // connection instead.
    maxRetransmits: 0,
    reliable: false
  });
  
  



  //pc01dc.onopen = () => pc01dc.send("Hello World!");

  if(yourId == 1)
  pc01dc.onmessage = () => console.log("got message here");

  if (yourId == 1)
  console.log(pc01dc.readyState);

  //if (yourId == 0)
  //pc01dc.send("Hello World!");*/



  sender = yourId;
  initialtarget = (yourId+2)%3;   //defining target for the first time
  if (yourId==0) {
     initiatorpc02 = yourId;
     pc02.createOffer()
         .then(offer => pc02.setLocalDescription(offer) )
         .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc02.localDescription})) );
  }
  if(yourId==1) {
    initiatorpc01 = yourId;
    pc01.createOffer()
        .then(offer => pc01.setLocalDescription(offer) )
        .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc01.localDescription})) );
  }
  if(yourId==2) {
    initiatorpc12 = yourId;
    pc12.createOffer()
        .then(offer => pc12.setLocalDescription(offer) )
        .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc12.localDescription})) );
  }
}

