###
Copper web server

This is a basic web server in Node.js + Express.
This also ties in the nodemailer module for sending email via SMTP.
###

app = require( "express" )()
fs = require "fs"
server = require( "http" ).createServer app
nodemailer = require "nodemailer"

port = process.env.PORT ? 5000
server.listen port

PasswordValidator = ( require "./build/password.js" ).PasswordValidator

# Password verification endpoint for Angel.com
app.get "/verify", ( request, response ) ->
  { phone, password } = request.query
  console?.log "Verifying password #{password} for phone #{phone}"
  validator = new PasswordValidator phone
  result = validator.validate password
  console?.log "Validation result: #{result}"
  response.send result

# Very basic file server.
# This simply maps URLs to file paths within the /client folder.
app.get /(.*)/, ( request, response ) ->
  # console?.log "get: #{request.params[0]}"
  sendFile request.params[0], response

# Email notification endpoint.
# Used during registration process.
app.post "/email/:template/:email", ( request, response ) ->
  console?.log "Sending #{request.params.template} message to #{request.params.email}"
  message = messageTemplates[ request.params.template ]
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
