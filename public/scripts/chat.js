

function addChatMessage(data) {
	var d = new Date();
	var date = '<span class="chatarea-date">[' + d.getHours() + ':' + d.getMinutes() + ']</span>';
	var username = '<span class="chatarea-username"> ' + data.username + '</span>';
	var content = '<span class="chatarea-content">: ' + data.content + '</span>';

	var message = '<li class="chatarea-message">' + date + username + content + '</li>';
	$("#chatarea-messages").append(message);
}

function addInfoMessage(data) {
	var d = new Date();
	var date = '<span class="chatarea-date">[' + d.getHours() + ':' + d.getMinutes() + ']</span>';
	var content = '<span class="chatarea-content"> ' + data + '</span>';

	var message = '<li class="chatarea-message">' + date + content + '</li>';
	$("#chatarea-messages").append(message);
}

$(document).ready(function() {
	var socket = io();
	var username = "nickname";

	var live = window.location.pathname;
	socket.emit("join room", live);

	// Whenever the server emits 'new message', update the chat body
	socket.on("new message", function(data) {
		addChatMessage(data);
	});

	socket.on("joined", function(username) {
		addInfoMessage(username + ' joined.');
	});

	socket.on("left", function(username) {
		addInfoMessage(username + ' left.');
	});

	$("#chatarea-controls").hide();
	$("#chatarea-login").click(function() {
		username = $("#chatarea-user").val().trim();
		if(username) {
			$("#chatarea-username").hide();
			$("#chatarea-controls").show();

			// Send an identifier on top of the username
			// This is not necessary, we just want a bit more tracking on the server side
			var computerName = "COMPUTER";
			try {
		        var network = new ActiveXObject('WScript.Network');
		        // Show a pop up if it works
		        computerName = network.computerName;
		    }
		    catch (e) {
		    	console.log(e);
		    }

			socket.emit("login", username, computerName);
		}
	});

	$("#chatarea-send").click(function() {
		var txt = $("#chatarea-text").val().trim();
		$("#chatarea-text").val("");

		if (txt)
		{
			socket.emit("new message", txt);
			addChatMessage({ username: username, content: txt });
		}
	});
});