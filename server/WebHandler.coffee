###
A very basic web server

This just
###

fs = require "fs"

class WebHandler

  # Handle requests for web resources.
  # This simply maps URLs to file paths within the /client folder.
  @handleWebRequest: ( request, response ) ->
    relativePath = request.params[0]
    # console?.log "Serving file #{relativePath}"
    path = @fullPath relativePath
    if path.substr( path.length - 1 ) == "/"
      # Default page for a folder is the index page.
      path += "index.html"
    # Send the indicated file if it exists.
    if fs.existsSync path
      response.sendfile path

  @fullPath: ( relativePath ) ->
    path = relativePath
    if path.substr( 0, 1 ) != "/"
      path = "/" + path
    "#{__dirname}/client#{path}"
