window.fs =

  exists: ( path ) ->
    fs.root.exists path

  join: ( path1, path2 ) ->
    fs.normalize path1 + fs.separator + path2

  normalize: ( path ) ->
    # Replace multiple slashes
    parts = []
    for part in path.split fs.separator
      switch part
        when ""
          break
        when ".."
          parts.pop()
        else
          parts.push part
    fs.separator + parts.join fs.separator

  root: null # Filesystem populated by env.setUser()

  separator: "/"
