###
Copper server in Node.js

Provides endpoints:
* Email
* IVR (Interactive Voice Response) system
* Web pages

Routing to these endpoints is handled by Express (http://expressjs.com/).
###

app = require( "express" )()

server = require( "http" ).createServer app
port = process.env.PORT ? 5000
server.listen port

# Phone verification endpoint for Angel.com
app.get "/verifyPhone", ( request, response ) ->
  IvrHandler.handlePhoneVerificationRequest request, response

# Password verification endpoint for Angel.com
app.get "/verifyPassword", ( request, response ) ->
  IvrHandler.handlePasswordVerificationRequest request, response

# Web page endpoint.
app.get /(.*)/, ( request, response ) ->
  WebHandler.handleWebRequest request, response

# Email notification endpoint.
app.post "/email/:template/:email", ( request, response ) ->
  EmailHandler.handleEmailRequest request, response

# Handle general POSTs just like GETs.
# (Facebook wants to retrieve a canvas page via a POST.)
app.post /(.*)/, ( request, response ) ->
  WebHandler.handleWebRequest request, response
