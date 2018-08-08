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
var fb = firebase.initializeApp(config);

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



var handleDataChannelOpen;

var flag = 0;

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

var ball2 = {
  pos: {x: 500,y: 300},
      direction: { x: 0, y: 0 },
  speed: 5,
      brake: 0.9, // smaller number stop faster, max 0.99999
};
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

      if (flag == 1){
     handleDataChannelOpen();
     //console.log("flag flipped to 1");
   }
  }
  // background code
  function gameBack() {
    drawRect(0,0,canvas.width,canvas.height, 'Pink');
    colorCircle(ball.pos.x,ball.pos.y,10, 'Black');
    colorCircle(ball2.pos.x,ball2.pos.y,10, 'Green');
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
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
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
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
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

/*document.onkeydown = KD;
       function KD(e) {
         event.returnValue = false;
       }*/




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

function startnow() {
/*pc01.ondatachannel = () => console.log("data channel created")
channel = pc01.createDataChannel('dataChannel');
pc01.ondatachannel = () => console.log("data channel created")
console.log(channel.readyState);
channel.onopen = () => channel.send("hello world, god damn it!");
channel.onmessage = () => console.log("got message at 0");
console.log(channel.readyState);
pc01.ondatachannel = function (event) {
  receivechannel = event.channel;
  receivechannel.onmessage = () => console.log("got message at 1");
  console.log(receivechannel.readyState);
};*/


/* WebRTC Demo
 * Allows two clients to connect via WebRTC with Data Channels
 * Uses Firebase as a signalling server
 * http://fosterelli.co/getting-started-with-webrtc-data-channels
 */

/* == Announcement Channel Functions ==
 * The 'announcement channel' allows clients to find each other on Firebase
 * These functions are for communicating through the announcement channel
 * This is part of the signalling server mechanism
 *
 * After two clients find each other on the announcement channel, they
 * can directly send messages to each other to negotiate a WebRTC connection
 */

// Announce our arrival to the announcement channel
var sendAnnounceChannelMessage = function() {
  announceChannel.remove(function() {
    announceChannel.push({
      sharedKey : sharedKey,
      id : id
    });
    console.log('Announced our sharedKey is ' + sharedKey);
    console.log('Announced our ID is ' + id);
  });
};

// Handle an incoming message on the announcement channel
var handleAnnounceChannelMessage = function(snapshot) {
  var message = snapshot.val();
  if (message.id != id && message.sharedKey == sharedKey) {
    console.log('Discovered matching announcement from ' + message.id);
    remote = message.id;
    initiateWebRTCState();
    connect();
  }
};

/* == Signal Channel Functions ==
 * The signal channels are used to delegate the WebRTC connection between
 * two peers once they have found each other via the announcement channel.
 *
 * This is done on Firebase as well. Once the two peers communicate the
 * necessary information to 'find' each other via WebRTC, the signalling
 * channel is no longer used and the connection becomes peer-to-peer.
 */

// Send a message to the remote client via Firebase
var sendSignalChannelMessage = function(message) {
  message.sender = id;
  database.child('messages').child(remote).push(message);
};

// Handle a WebRTC offer request from a remote client
var handleOfferSignal = function(message) {
  running = true;
  remote = message.sender;
  initiateWebRTCState();
  startSendingCandidates();
  peerConnection.setRemoteDescription(new RTCSessionDescription(message));
  peerConnection.createAnswer(function(sessionDescription) {
    console.log('Sending answer to ' + message.sender);
    peerConnection.setLocalDescription(sessionDescription);
    sendSignalChannelMessage(sessionDescription.toJSON());
  }, function(err) {
    console.error('Could not create offer', err);
  });
};

// Handle a WebRTC answer response to our offer we gave the remote client
var handleAnswerSignal = function(message) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(message));
};

// Handle an ICE candidate notification from the remote client
var handleCandidateSignal = function(message) {
  var candidate = new RTCIceCandidate(message);
  peerConnection.addIceCandidate(candidate);
};

// This is the general handler for a message from our remote client
// Determine what type of message it is, and call the appropriate handler
var handleSignalChannelMessage = function(snapshot) {
  var message = snapshot.val();
  var sender = message.sender;
  var type = message.type;
  console.log('Recieved a \'' + type + '\' signal from ' + sender);
  if (type == 'offer') handleOfferSignal(message);
  else if (type == 'answer') handleAnswerSignal(message);
  else if (type == 'candidate' && running) handleCandidateSignal(message);
};

/* == ICE Candidate Functions ==
 * ICE candidates are what will connect the two peers
 * Both peers must find a list of suitable candidates and exchange their list
 * We exchange this list over the signalling channel (Firebase)
 */

// Add listener functions to ICE Candidate events
var startSendingCandidates = function() {
  peerConnection.oniceconnectionstatechange = handleICEConnectionStateChange;
  peerConnection.onicecandidate = handleICECandidate;
};

// This is how we determine when the WebRTC connection has ended
// This is most likely because the other peer left the page
var handleICEConnectionStateChange = function() {
  if (peerConnection.iceConnectionState == 'disconnected') {
    console.log('Client disconnected!');
    sendAnnounceChannelMessage();
  }
};

// Handle ICE Candidate events by sending them to our remote
// Send the ICE Candidates via the signal channel
var handleICECandidate = function(event) {
  var candidate = event.candidate;
  if (candidate) {
    candidate = candidate.toJSON();
    candidate.type = 'candidate';
    console.log('Sending candidate to ' + remote);
    sendSignalChannelMessage(candidate);
  } else {
    console.log('All candidates sent');
  }
};

/* == Data Channel Functions ==
 * The WebRTC connection is established by the time these functions run
 * The hard part is over, and these are the functions we really want to use
 *
 * The functions below relate to sending and receiving WebRTC messages over
 * the peer-to-peer data channels
 */

// This is our receiving data channel event
// We receive this channel when our peer opens a sending channel
// We will bind to trigger a handler when an incoming message happens
var handleDataChannel = function(event) {
  event.channel.onmessage = handleDataChannelMessage;
};

// This is called on an incoming message from our peer
// You probably want to overwrite this to do something more useful!
var handleDataChannelMessage = function(event) {
  //console.log('Recieved Message: ' + event.data);
  var Str = event.data;
  ball2.pos.x = Str.substring(0,Str.lastIndexOf(":"));
  ball2.pos.y = Str.substring(Str.lastIndexOf(":")+1,Str.lastIndexOf(";"));
  //document.write(event.data + '<br />');
};

// This is called when the WebRTC sending data channel is offically 'open'
handleDataChannelOpen = function() {
  console.log('Data channel created!' + dataChannel.readyState);
  //dataChannel.send('Hello! I am ' + id);
  flag = 1;
  dataChannel.send(ball.pos.x + ":" + ball.pos.y + ";");
};

// Called when the data channel has closed
var handleDataChannelClosed = function() {
  console.log('The data channel has been closed!');
};

// Function to offer to start a WebRTC connection with a peer
var connect = function() {
  running = true;
  startSendingCandidates();
  peerConnection.createOffer(function(sessionDescription) {
    console.log('Sending offer to ' + remote);
    peerConnection.setLocalDescription(sessionDescription);
    sendSignalChannelMessage(sessionDescription.toJSON());
  }, function(err) {
    console.error('Could not create offer', err);
  });
};

// Function to initiate the WebRTC peerconnection and dataChannel
var initiateWebRTCState = function() {
  peerConnection = new RTCPeerConnection(servers);
  peerConnection.ondatachannel = handleDataChannel;
  dataChannel = peerConnection.createDataChannel('myDataChannel');
  dataChannel.onmessage = handleDataChannelMessage;
  dataChannel.onopen = handleDataChannelOpen;
  //dataChannel.onopen = () => setInterval(function() {handleDataChannelOpen;}, 1000/FPS);
};

var id;              // Our unique ID
var sharedKey;       // Unique identifier for two clients to find each other
var remote;          // ID of the remote peer -- set once they send an offer
var peerConnection;  // This is our WebRTC connection
var dataChannel;     // This is our outgoing data channel within WebRTC
var running = false; // Keep track of our connection state

// Generate this browser a unique ID
// On Firebase peers use this unique ID to address messages to each other
// after they have found each other in the announcement channel
id = Math.random().toString().replace('.', '');

// Unique identifier for two clients to use
// They MUST share this to find each other
// Each peer waits in the announcement channel to find its matching identifier
// When it finds its matching identifier, it initiates a WebRTC offer with
// that client. This unique identifier can be pretty much anything in practice.
sharedKey = prompt("Please enter a shared identifier");

// Fill this with the config in your Firebase dashboard
// You'll find it under "Add Firebase to your web app"

// Setup database and channel events
//var fb = firebase.initializeApp(config);
//var database = fb.database().ref();
var announceChannel = database.child('announce');
var signalChannel = database.child('messages').child(id);
signalChannel.on('child_added', handleSignalChannelMessage);
announceChannel.on('child_added', handleAnnounceChannelMessage);

// Send a message to the announcement channel
// If our partner is already waiting, they will send us a WebRTC offer
// over our Firebase signalling channel and we can begin delegating WebRTC
sendAnnounceChannelMessage();


}
