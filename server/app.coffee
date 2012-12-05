###
Copper web server

Endpoints for:
* A basic web server using Express (http://expressjs.com/)
* Email to players via nodemailer (https://github.com/andris9/Nodemailer)
* IVR (Interactive Voice Response) backend support for IVR hosted at angel.com.
###

app = require( "express" )()
fs = require "fs"
server = require( "http" ).createServer app
nodemailer = require "nodemailer"

port = process.env.PORT ? 5000
server.listen port

# Phone verification endpoint for Angel.com
app.get "/verifyPhone", ( request, response ) ->
  InteractiveVoiceResponse.verifyPhone request, response

# Password verification endpoint for Angel.com
app.get "/verifyPassword", ( request, response ) ->
  InteractiveVoiceResponse.verifyPassword request, response

# Very basic file server.
# This simply maps URLs to file paths within the /client folder.
app.get /(.*)/, ( request, response ) ->
  # console?.log "get: #{request.params[0]}"
  sendFile request.params[0], response

# Email notification endpoint.
# Used during registration process.
# TODO: Don't require/allow client to specify recipient email address, because
# that could be abused. Instead, obtain email address from player account.
app.post "/email/:template/:email", ( request, response ) ->
  # console?.log "Sending #{request.params.template} message to #{request.params.email}"
  message = templates[ request.params.template ]
  message.to = request.params.email
  smtpTransport.sendMail message, ( error, result ) =>
    confirmation = {}
    if error
      confirmation.sent = false
      confirmation.error = error
    else
      confirmation.sent = true
    response.send confirmation

# Handle general POSTs just like GETs
# (Facebook wants to get a canvas page via a POST.)
app.post /(.*)/, ( request, response ) ->
  # console?.log "post: #{request.params[0]}"
  sendFile request.params[0], response

# Send the indicated file (if it exists) using the indicated response.
sendFile = ( filePath, response ) ->
  if filePath == "/"
    filePath = "index.html"
  if filePath.substr( 0, 1 ) != "/"
    filePath = "/#{filePath}"
  filePath = "#{__dirname}/client#{filePath}"
  if fs.existsSync filePath
    response.sendfile filePath

# Create reusable transport method (opens pool of SMTP connections).
smtpTransport = nodemailer.createTransport "SMTP",
  service: "Gmail"
  auth:
    user: "copper.mailer@gmail.com"
    pass: "copper.mailer"
