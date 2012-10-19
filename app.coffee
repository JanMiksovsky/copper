###
Basic web server in Node.js + Express
###

app = require( "express" )()
fs = require "fs"
server = require( "http" ).createServer app

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

app.post "/verify/:email", ( request, response ) ->
  console?.log "Request: #{request.params.email}"
  response.send result: "OK"