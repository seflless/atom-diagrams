{View} = require 'space-pen'
fs = require 'fs'

# View that renders the audio of an {AudioEditor}.
module.exports =
class SVGView extends View
    @content: ->
        @div class: 'atom-diagrams-svg-container'

    attached: ->
        this[0].innerHTML = @svgText;

    initialize: (editor) ->
        @svgText = fs.readFileSync(editor.getURI());
