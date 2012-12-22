###
Simple DUP "filesystem" manipulations.
###

class window.fs

  @absolutePath: ( path ) ->
    fullPath = @join env.currentDirectory.path(), path
    @normalize fullPath

  @exists: ( path ) ->
    @root.exists path

  @join: ( path1, path2 ) ->
    @normalize path1 + @separator + path2

  @normalize: ( path ) ->
    # Replace multiple slashes
    parts = []
    for part in path.split @separator
      switch part
        when ""
          break
        when ".."
          parts.pop()
        else
          parts.push part
    @separator + parts.join @separator

  @root: null # Filesystem populated by env.setUser()

  @separator: "/"
