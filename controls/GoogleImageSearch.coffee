###
Renders the first photo returned by a Google image search query.
This can be useful for generating a placeholder image on a particular theme.
###

class window.GoogleImageSearch extends Control

  inherited:
    content: "search result goes here"

  # The Google API key which should be used to perform the search.
  # This can be obtained using the Google API console.
  apiKey: Control.property ->
    @_refresh()

  # The desired size of the image
  # Typical values: "icon", "medium", "xxlarge", "huge"
  imageSize: Control.property()

  query: Control.property ->
    @_refresh()

  # The identifier for a Google custom search engine.
  # The search engine should be set up with "Enable image search" on.
  searchEngine: Control.property ->
    @_refresh()

  tag: "img"

  _refresh: ->
    
    apiKey = @apiKey()
    query = @query()
    searchEngine = @searchEngine()
    unless apiKey? and query? and searchEngine?
      return
    
    imageSize = @imageSize()
    sizeParam = if imageSize? then "imgSize=#{imageSize}" else ""
    url = "https://www.googleapis.com/customsearch/v1?key=#{apiKey}&cx=#{searchEngine}&q=#{query}&searchType=image&imgType=photo&#{sizeParam}&num=1&alt=json&callback=?"
    $.getJSON url, ( data ) =>
      if data?.items?.length > 0
        @prop "src", data.items[0].link
