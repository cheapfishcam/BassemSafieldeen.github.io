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
var yourId = 10000; //
var sender;
var target;
var initialtarget;
var initiatorpc1 = 10000;
var initiatorpc2 = 10000;

function setID(ID){
  console.log("success " + ID);
  yourId = ID;
}


//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': '13111994','username': 'bassemsafieldeen@gmail.com'} with the information from your account
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': '13111994','username': 'bassemsafieldeen@gmail.com'}]};
var pc1 = new RTCPeerConnection(servers);
var pc2 = new RTCPeerConnection(servers);

/*if (yourId==0)  //first connection pc1: 0 <-> 1 and 0 <-> 2
pc1.onicecandidate = (event => event.candidate?sendMessage(yourId, 1, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
if (yourId==1)
pc1.onicecandidate = (event => event.candidate?sendMessage(yourId, 0, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
if (yourId==2)
pc1.onicecandidate = (event => event.candidate?sendMessage(yourId, 0, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );

pc1.onaddstream = (event => friendsVideo.srcObject = event.stream);


/*if (yourId==0)
pc2.onicecandidate = (event => event.candidate?sendMessage(yourId, 2, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
if (yourId==1)
pc2.onicecandidate = (event => event.candidate?sendMessage(yourId, 0, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
if (yourId==2)
pc2.onicecandidate = (event => event.candidate?sendMessage(yourId, 1, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );


pc2.onaddstream = (event => otherfriendsVideo.srcObject = event.stream);*/



//0 creates offer . 0 sends ice (sender here is not defined because it first gets defined when readmessage is called.) -> 2 receives offer, creates answer, sends ice.
if (initiatorpc2 == yourId) {
pc2.onicecandidate = (event => event.candidate?sendMessage(yourId, initialtarget, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc2.onaddstream = (event => otherfriendsVideo.srcObject = event.stream);
} else {
pc2.onicecandidate = (event => event.candidate?sendMessage(yourId, target, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc2.onaddstream = (event => otherfriendsVideo.srcObject = event.stream);
}
if (initiatorpc1 == yourId) {
pc1.onicecandidate = (event => event.candidate?sendMessage(yourId, initialtarget, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc1.onaddstream = (event => friendsVideo.srcObject = event.stream);
} else {
pc1.onicecandidate = (event => event.candidate?sendMessage(yourId, target, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc1.onaddstream = (event => friendsVideo.srcObject = event.stream);
}



function sendMessage(senderId, targetId, data) {
    var msg = database.push({ sender: senderId, target: targetId, message: data });
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    sender = data.val().sender;
    target = data.val().target;
    if (target==yourId && target==0 && sender==1) {
        console.log("01");
        if (msg.ice != undefined){
            console.log("01a");
            pc1.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("01b");
            target = sender;
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc1.createAnswer())
              .then(answer => pc1.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc1.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("01c");
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
    if (target==yourId && target==0 && sender==2) {
        console.log("02");
        if (msg.ice != undefined){
            console.log("02a");
            pc2.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("02b");
            target = sender;
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc2.createAnswer())
              .then(answer => pc2.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc2.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("02c");
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
    if (target==yourId && target==1 && sender==2) {
        console.log("12");
        if (msg.ice != undefined){
            console.log("12a");
            pc1.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("12b");
            target = sender;
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc1.createAnswer())
              .then(answer => pc1.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc1.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("12c");
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
    if (target==yourId && target==1 && sender==0) {
        console.log("10");
        if (msg.ice != undefined){
            console.log("10a");
            pc2.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("10b");
            target = sender;
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc2.createAnswer())
              .then(answer => pc2.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc2.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("10c");
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
    if (target==yourId && target==2 && sender==0) {
        console.log("20");
        if (msg.ice != undefined){
            console.log("20a");
            pc1.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("20b");
            target = sender;
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc1.createAnswer())
              .then(answer => pc1.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc1.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("20c");
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
    if (target==yourId && target==2 && sender==1) {
        console.log("21");
        if (msg.ice != undefined){
            console.log("21a");
            pc2.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("21b");
            target = sender;
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc2.createAnswer())
              .then(answer => pc2.setLocalDescription(answer))
              .then(() => sendMessage(yourId, target, JSON.stringify({'sdp': pc2.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("21c");
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
};

database.on('child_added', readMessage);

function showMyFace() {
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => yourVideo.srcObject = stream)
    .then(stream => pc2.addStream(stream))
    .then(stream => pc1.addStream(stream));
}

function showFriendsFace() {
  initiatorpc1 = yourId;
  sender = yourId;
  initialtarget = (yourId+1)%3;   //defining target for the first time
  if (yourId==0)
  pc1.createOffer()
    .then(offer => pc1.setLocalDescription(offer) )
    .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc1.localDescription})) );
  if(yourId==1)
  pc1.createOffer()
    .then(offer => pc1.setLocalDescription(offer) )
    .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc1.localDescription})) );
  if(yourId==2)
    pc1.createOffer()
      .then(offer => pc1.setLocalDescription(offer) )
      .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc1.localDescription})) );
}


function showOtherFriendsFace() {
  initiatorpc2 = yourId;
  sender = yourId;
  initialtarget = (yourId+2)%3;   //defining target for the first time
  if (yourId==0)
    pc2.createOffer()
       .then(offer => pc2.setLocalDescription(offer) )
       .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc2.localDescription})) );
  if(yourId==1)
    pc2.createOffer()
       .then(offer => pc2.setLocalDescription(offer) )
       .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc2.localDescription})) );
  if(yourId==2)
    pc2.createOffer()
       .then(offer => pc2.setLocalDescription(offer) )
       .then(() => sendMessage(yourId,initialtarget, JSON.stringify({'sdp': pc2.localDescription})) );
}
