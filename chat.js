var firebaseConfig = {
   apiKey: "AIzaSyBAWt0_iZAZijVi1rrKOUjMGYHtyw9HQ64",
   authDomain: "aaravchat-44e73.firebaseapp.com",
   projectId: "aaravchat-44e73",
   storageBucket: "aaravchat-44e73.appspot.com",
   messagingSenderId: "234190306046",
   appId: "1:234190306046:web:dcc3e28dbc134dca1003af",
   measurementId: "G-3GB9TJSLT7"
};

firebase.initializeApp(firebaseConfig);

var storage = firebase.storage().ref();
var fileInput = document.getElementById("fileInput");
var fileDropArea = document.getElementById("fileDropArea");
var chatContainer = document.getElementById("chatContainer");
var messageInput = document.getElementById("messageInput");

fileDropArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

fileDropArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

fileDropArea.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.dataTransfer.files;
    handleFiles(files);
});

fileDropArea.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function() {
    handleFiles(fileInput.files);
});

function handleFiles(files) {
    var file = files[0];
    if (file.type.startsWith('image/')) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.src = e.target.result;
            chatContainer.appendChild(img);
            uploadToFirebase(file);
        };
        reader.readAsDataURL(file);
    } else {
        uploadToFirebase(file);
    }
}

function uploadToFirebase(file) {
    var fileRef = storage.child('chat_files/' + file.name);
    fileRef.put(file).then(function(snapshot) {
        console.log('Uploaded a file!');
        fileRef.getDownloadURL().then(function(url) {
            // Add a message with the file URL to the chat if needed
            var messageContent = url;
            firebase.database().ref("messages").push().set({
                content: messageContent
            });
        });
    });
}

function convertUrlsToLinks(text) {
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return text.replace(urlRegex, function(urlMatch) {
        return '<a href="' + (urlMatch.startsWith('www') ? 'http://' + urlMatch : urlMatch) + '" target="_blank">' + urlMatch + '</a>';
    });
}

// Load and send messages functionality
firebase.database().ref("messages").on("child_added", function(snapshot) {
    var message = snapshot.val();
    var messageElement = document.createElement("div");
    messageElement.classList.add("message");

    var contentElement = document.createElement("span");
    contentElement.classList.add("message-content");
    contentElement.innerHTML = convertUrlsToLinks(message.content);
    messageElement.appendChild(contentElement);

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

document.getElementById("sendButton").addEventListener("click", function() {
    var messageContent = messageInput.value.trim();
    if (messageContent !== "") {
        firebase.database().ref("messages").push().set({
            content: messageContent
        });
        messageInput.value = "";
    }
});
