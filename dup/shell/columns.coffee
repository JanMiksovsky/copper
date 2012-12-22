###
Format arrays of text into columns for "ls" command output.
###

window.columns =

  bestColumnWidths: ( lengths ) ->
    for columnCount in [ lengths.length .. 1 ]
      widths = columns.columnWidths lengths, columnCount
      lineLength = columns.lineLength widths
      if lineLength <= columns.maxLineLength
        return widths
    widths # Fall back to widths for 1 column

  columnSpacing: 2

  columnWidths: ( lengths, columnCount ) ->
    widths = ( 0 for i in [ 1..columnCount ] )
    for i in [ 0 .. lengths.length - 1 ]
      column = i % columnCount
      widths[ column ] = Math.max widths[ column ], lengths[ i ]
    widths

  # Main entry point to format an array of strings into columns.
  format: ( strings ) ->
    lengths = ( s.length for s in strings )
    columnWidths = columns.bestColumnWidths lengths
    columns.formatColumns strings, columnWidths

  formatColumns: ( strings, columnWidths ) ->
    columnCount = columnWidths.length
    stringCount = strings.length
    margin = columns.repeat " ", columns.columnSpacing
    result = ""
    for s, i in strings
      column = i % columnCount
      padded = columns.pad s, columnWidths[ column ]
      result += padded
      if column < columnCount - 1
        result += margin
      else if i < stringCount - 1
        result += "\n"
    result

  lineLength: ( widths ) ->
    length = 0
    for width in widths
      length += width
    length += ( widths.length - 1 ) * columns.columnSpacing
    length

  # The desired maximum length of a line.
  maxLineLength: 78

  pad: ( s, length ) ->
    spaces = columns.repeat " ", length - s.length
    s + spaces

  repeat: ( s, count ) ->
    ( new Array count + 1 ).join s
