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
//var testval = document.getElementById("id").value;
//console.log("test");
function setID(ID){
  console.log("success" + ID);
  yourId = ID;


}
//var flag1 = 1;
//var flag2 = 2;
//var yourId = 1;
//var friendsId = 2;
//var otherfriendsId = 3;
//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': '13111994','username': 'bassemsafieldeen@gmail.com'} with the information from your account
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': '13111994','username': 'bassemsafieldeen@gmail.com'}]};
var pc1 = new RTCPeerConnection(servers);
var pc2 = new RTCPeerConnection(servers);
pc1.onicecandidate = (event => event.candidate?sendMessage(yourId, (yourId+1)%3, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc1.onaddstream = (event => friendsVideo.srcObject = event.stream);
pc2.onicecandidate = (event => event.candidate?sendMessage(yourId,(yourId+2)%3, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc2.onaddstream = (event => otherfriendsVideo.srcObject = event.stream);

function sendMessage(senderId, targetId, data) {
    var msg = database.push({ sender: senderId, target: targetId, message: data });
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    var target = data.val().target;
    if (target==yourId && sender==(yourId+1)%3) {
        console.log("In first if");
        if (msg.ice != undefined){
            console.log("In first first sub if");
            pc1.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type == "offer"){
            console.log("In first second sub if");
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc1.createAnswer())
              .then(answer => pc1.setLocalDescription(answer))
              .then(() => sendMessage(yourId, (yourId+1)%3, JSON.stringify({'sdp': pc1.localDescription})));
        }
        else if (msg.sdp.type == "answer"){
            console.log("In first third sub if");
            pc1.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }


    if (target==yourId && sender==(yourId+2)%3) {
      console.log("In second if");
        if (msg.ice != undefined)
            pc2.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer")
            pc2.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc2.createAnswer())
              .then(answer => pc2.setLocalDescription(answer))
              .then(() => sendMessage(yourId,(yourId+2)%3, JSON.stringify({'sdp': pc2.localDescription})));
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
    .then(() => sendMessage(yourId,(yourId+1)%3, JSON.stringify({'sdp': pc1.localDescription})) );
}

function showOtherFriendsFace() {
  pc2.createOffer()
    .then(offer => pc2.setLocalDescription(offer) )
    .then(() => sendMessage(yourId,(yourId+2)%3, JSON.stringify({'sdp': pc2.localDescription})) );
}
