var express = require('express');
var app = express();
var path = require("path");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');

app.use("/stylesheets", express.static(__dirname + '/stylesheets'));
app.use("/js", express.static(__dirname + '/js'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//DB conenction and schema
mongoose.connect('mongodb://localhost:27017/test');
mongoose.model('users', {
	name: String,
	status: Boolean,
	timestamp: { type: Date, default: Date.now } 	
});
var Messages = mongoose.model('messages', {
	message: String,
	senderId: String,
	senderName: String,
	chatGroupId: Number,
	timestamp: { type: Date, default: Date.now } 
});
var ChatGroups = mongoose.model('chatgroups', {
	groupName: String,
	chatMemberIds: [String],
	timestamp: { type: Date, default: Date.now } 
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/users', function (req, res) {
	mongoose.model('users').find(function(err, result){
		if(err){
			console.log(err);
		}
		res.send(result);
	});
});

app.put('/userStatusUpdate/:id', function(req, res) {
	var id = req.params.id;
	mongoose.model('users').update({ _id: mongoose.Types.ObjectId(id) }, {
			$set: { status: true }
		}, 
		function(err) {
			if(err) { console.log(err); }
		});
});

app.get('/messages/:id', function (req, res) {
	var id = req.params.id;
	mongoose.model('messages').find({chatGroupId: id}, function(err, result){
		if(err){
			console.log(err);
		}
		res.send(result);
	});
});

app.post('/messages', function(req, res) {
	
	var chatMessage = new Messages(req.body); 

	chatMessage.save(function(err) {
		if(err) { console.log(err); }
	});

});

app.post('/getGroupId', function(req, res) {
	
	var memberIDs = req.body.memberIDs;

		console.log(memberIDs);

	mongoose.model('chatgroups').find({
		chatMemberIds: { $all: memberIDs }
	}, function(err, result){
		if(err){
			console.log(err);
			return;
		}
		//If result array is empty, then insert a new group
		if(result.length <= 0) {
			var chatGroup = new ChatGroups({
				groupName: 'Some chat name',
				chatMemberIds: memberIDs,
				timestamp: Date.now()
			});

			chatGroup.save(function(err, returnObject) {
				if(err) { console.log(err); }
				return returnObject._id;
			});
		}
		else {
			console.log('prev chat');
			console.log(result);

		}
	});
});

app.listen(3000, function () {
  console.log('chatApp listening on port 3000!');
});

module.exports = app;