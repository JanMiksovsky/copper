###
General-purpose utility functions
###

class window.Utilities

  # Return a copied of the given array shuffled with Fisher-Yates algorithm.
  # http://sedition.com/perl/javascript-fy.html
  @shuffle: ( array ) ->
    copy = array.slice()
    for i in [ copy.length - 1 .. 1 ]
      j = Math.floor Math.random() * ( i + 1 )
      temp = copy[i]
      copy[i] = copy[j]
      copy[j] = temp
    copy

  # Return the unique members of the given array (or string).
  @unique: ( array ) ->
    result = []
    for item in array
      if $.inArray( item, result ) < 0
        result.push item
    result

# After loading a page, seed the random number generator.
$ ->
  Math.seedrandom()
