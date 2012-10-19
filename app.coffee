###
Basic web server in Node.js + Express
###

app = require( "express" )()
fs = require "fs"
server = require( "http" ).createServer app
nodemailer = require "nodemailer"

port = process.env.PORT ? 5000
server.listen port

# Very basic file server.
app.get /(.*)/, ( request, response ) ->
  filePath = request.params[0]
  if filePath == "/"
    filePath = "index.html"
  if filePath.substr( 0, 1 ) != "/"
    filePath = "/#{filePath}"
  filePath = __dirname + filePath
  if fs.existsSync filePath
    response.sendfile filePath

# Create reusable transport method (opens pool of SMTP connections).
smtpTransport = nodemailer.createTransport "SMTP",
  service: "Gmail"
  auth:
    user: "copper.mailer@gmail.com"
    pass: "copper.mailer"

verificationMessage =
  from: "Copper <copper.mailer@gmail.com>" # sender address
  subject: "Department of Unified Protection email verification required" # Subject line
  text: "Hello world!" # plaintext body
  html: "Hello <i>world</i>!" # html body

app.post "/verify/:email", ( request, response ) ->
  console?.log "Sending verification message to #{request.params.email}"
  verificationMessage.to = request.params.email
  smtpTransport.sendMail verificationMessage, ( error, result ) =>
    confirmation = {}
    if error
      confirmation.sent = false
      confirmation.error = error
    else
      confirmation.sent = true
    response.send confirmation
