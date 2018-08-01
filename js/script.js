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
var yourId = Math.floor(Math.random()*1000000000);
var flag1 = 1;
var flag2 = 2;
//var yourId = 1;
//var friendsId = 2;
//var otherfriendsId = 3;
//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': '13111994','username': 'bassemsafieldeen@gmail.com'} with the information from your account
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': '13111994','username': 'bassemsafieldeen@gmail.com'}]};
var pc1 = new RTCPeerConnection(servers);
var pc2 = new RTCPeerConnection(servers);
pc1.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc1.onaddstream = (event => friendsVideo.srcObject = event.stream);
pc2.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc2.onaddstream = (event => otherfriendsVideo.srcObject = event.stream);

function sendMessage(senderId, data) {
    var msg = database.push({ sender: senderId, message: data });
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != yourId && flag1 == 1 || sender == flag1) {
        flag1 = sender;
        if (msg.ice != undefined)
            pc1.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer")
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc1.createAnswer())
              .then(answer => pc1.setLocalDescription(answer))
              .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc1.localDescription})));
        else if (msg.sdp.type == "answer")
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
    if (sender != yourId && flag2 == 2 && sender != flag1 || sender == flag2) {
        flag2 = sender;
        if (msg.ice != undefined)
            pc2.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer")
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc2.createAnswer())
              .then(answer => pc2.setLocalDescription(answer))
              .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc2.localDescription})));
        else if (msg.sdp.type == "answer")
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
};

database.on('child_added', readMessage);

function showMyFace() {
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => yourVideo.srcObject = stream)
    .then(stream => pc1.addStream(stream))
    .then(stream => pc2.addStream(stream));
}

function showFriendsFace() {
  pc1.createOffer()
    .then(offer => pc1.setLocalDescription(offer) )
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc1.localDescription})) );
}

function showOtherFriendsFace() {
  pc2.createOffer()
    .then(offer => pc2.setLocalDescription(offer) )
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc2.localDescription})) );
}
