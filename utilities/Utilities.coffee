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


# After loading a page, seed the random number generator.
$ ->
  Math.seedrandom()
