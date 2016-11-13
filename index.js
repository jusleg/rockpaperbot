var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
	    userMove = convertMove(text)
	    if (userMove != 0){
		sendTextMessage(sender, outcome(userMove))
	    } else {
		sendTextMessage(sender, "Sorry, I was not able to process your move. Please pick one")
	    }
        }
    }
    res.sendStatus(200)
})

var token = "ENTER TOKEN HERE"
function sendTextMessage(sender, text) {
    messageData = {
        text:text,
        quick_replies: [
        {
        	content_type:"text",
        	title:String.fromCodePoint(9994),
        	payload:String.fromCodePoint(9994)
        },
        {
        	content_type:"text",
        	title:String.fromCodePoint(9995),
        	payload:String.fromCodePoint(9995)
        },
        {
        	content_type:"text",
        	title:String.fromCodePoint(9996),
        	payload:String.fromCodePoint(9996)
        }]
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function generateRandomMove(){
	return Math.floor(Math.random() * 3) + 1 
}

function convertMove(message){
	if(message.charCodeAt(0) == 9994){
		 return 1
	} else if (message.charCodeAt(0) == 9995){
		return 2
	} else if (message.charCodeAt(0) == 9996){
		return 3
	} else {
		return 0
	}
} 

function generateEmoji(number){
	return String.fromCodePoint(number+9993)
}

function outcome(usermove){
	compmove = generateRandomMove()
	if ((usermove == 1 && compmove == 3)||(usermove==2 && compmove ==1)||(usermove==3 && compmove ==2)){
		return generateEmoji(compmove)+" - You won. Pick your next move"
	} else if ((usermove==1 && compmove==2)||(usermove==2 && compmove==3)||(usermove==3 && compmove==1)){
		return generateEmoji(compmove)+" - You lost. Pick your next move"
	} else {
		return generateEmoji(compmove)+" - Tie. Pick your next move"
	}
}
