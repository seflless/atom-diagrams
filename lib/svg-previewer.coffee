SVGView = require './svg-view'
path = require 'path'
fs = require 'fs'

module.exports =
  class SVGPreviewer
    atom.deserializers.add(this)

    constructor: (@uri, @filePath) ->
      @tabTitle = path.parse(@uri).base;
      @filePath = @filePath;

    getTitle: ->
      @tabTitle

    getViewClass: ->
      SVGView

    destroy: ->
      @onDestroy(@onDestroyContext)

    onDispose: (onDestroy,onDestroyContext) ->
        @onDestroy = onDestroy;
        @onDestroyContext = onDestroyContext;

    getURI: ->
      @uri

    serialize: ->
      {filePath: @uri, tabTitle: @tabTitle, deserializer: @constructor.name}

    @deserialize: ({filePath, tabTitle}) ->
      if fs.existsSync(filePath)
        new SVGPreviewer(tabTitle, filePath)
      else
        console.warn "Could not deserialize SVG previewer for path '#{filePath}' because that file no longer exists"
