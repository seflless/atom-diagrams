{View} = require 'space-pen'
{File} = require 'atom'
fs = require 'fs'

# View that renders the audio of an {AudioEditor}.
module.exports =
class SVGView extends View
    @content: ->
        @div class: 'atom-diagrams-svg-container'

    attached: ->
        this[0].innerHTML = this.svgText;

    dispose: (self) ->
        self.onDidChangeDisposable.dispose();
        self.onDidRenameDisposable.dispose();

    initialize: (editor) ->
        file = new File(editor.getURI())
        editor.onDispose(@dispose, this)

        @bob = true;

        console.log(editor.getURI());
        @svgText = fs.readFileSync(editor.getURI());
        self = this;
        @onDidChangeDisposable = file.onDidChange () ->
            self.svgText = fs.readFileSync(editor.getURI());
            self.attached()

        @onDidRenameDisposable = file.onDidRename () ->
            console.log('onDidRename');
            editor.uri = file.getPath();
            editor.tabTitle = path.parse(editor.uri).base;
            editor.emitter.emit('did-change-title');
