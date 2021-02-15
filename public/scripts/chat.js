

function addChatMessage(data) {
	var d = new Date();
	var date = '<span class="chatarea-date">[' + d.getHours() + ':' + d.getMinutes() + ']</span>';
	var username = '<span class="chatarea-username"> ' + data.username + '</span>';
	var content = '<span class="chatarea-content">: ' + data.content + '</span>';

	var message = '<li class="chatarea-message">' + date + username + content + '</li>';
	$("#chatarea-messages").append(message);
}

$(document).ready(function() {
	var socket = io();
	var username = "nickname";

	$("#chatarea-controls").hide();
	$("#chatarea-login").click(function() {
		username = $("#chatarea-user").val().trim();
		if(username) {
			$("#chatarea-username").hide();
			$("#chatarea-controls").show();

			var live = window.location.pathname;
			socket.emit("join room", live);

			// Whenever the server emits 'new message', update the chat body
			socket.on("new message", function(data) {
				addChatMessage(data);
			});

			// Whenever the server emits 'new message', update the chat body
			socket.on("viewer count", function(data) {
			});
		}
	});

	$("#chatarea-send").click(function() {
		var txt = $("#chatarea-text").val().trim();
		$("#chatarea-text").val("");

		if (txt)
		{
			socket.emit("new message", username, txt);
			addChatMessage({ username: username, content: txt });
		}
	});
});