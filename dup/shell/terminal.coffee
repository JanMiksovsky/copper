###
Link the terminal to the topmost page.
###

window.terminal = 

  clear: ->
    @page().clear()

  readln: ( callback ) ->
    @page().readln callback

  page: ->
    $( "body" ).control()

  prompt: ( s ) ->
    @page().prompt s

  write: ( s ) ->
    @page().write s

  writeln: ( s ) ->
    @page().writeln s
