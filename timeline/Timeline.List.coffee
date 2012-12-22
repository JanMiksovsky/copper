###
A fake Facebook timeline.
###

class window.Timeline extends List

  inherited:
    class: "clearfix"
    itemClass: "TimelinePost"
    
  author: Control.property()

  tag: "ol"

  _setupControl: ( control ) ->
    control.author @author()
    control.authorPage "."