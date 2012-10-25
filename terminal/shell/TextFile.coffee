class window.TextFile extends File

  constructor: ( @name, @parent, @contents ) ->
    super @name, @parent, @contents
    if not @contents?
      @contents = ""

  write: ( s ) ->
    @contents += s

  writeln: ( s ) ->
    @write s + "\n"