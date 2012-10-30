###
Basic web server in Node.js + Express
###

app = require( "express" )()
fs = require "fs"
server = require( "http" ).createServer app
nodemailer = require "nodemailer"

port = process.env.PORT ? 5000
server.listen port

messageTemplates =
  intro:
    from: "Ann Williams <ann.williams@facebook.com>" # sender address
    subject: "Not quite sure about the Dept. of Unified Protection" # Subject line
    html: """
    <p>
    Sorry for bothering you, but it looks like you registered on that Department
    of Unified Protection site, and that agency may be prioritizing "security"
    over the needs of the average person. Several parts of the country are
    reporting odd actions that have been undertaken by the D.U.P, and some of
    that activity seems quiet suspicious.
    </p>
    <p>
    Since you don't live too far away, I thought I'd give you a heads up. Until
    we can all find out more, I'd avoid cooperating with them.
    </p>
    <p>
    A concerned neighbor,
    </p>
    <p>
    Ann Williams
    <a href="http://apps.facebook.com/400736616662108">Find me on Facebook</a>
    </p>
    """

# Very basic file server.
app.get /(.*)/, ( request, response ) ->
  console?.log "get: #{request.params[0]}"
  sendFile request.params[0], response

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
  console?.log "post: #{request.params[0]}"
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
