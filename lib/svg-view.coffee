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
        file = new File(editor.filePath)
        editor.onDispose(@dispose, this)

        @svgText = fs.readFileSync(editor.filePath);
        self = this;
        @onDidChangeDisposable = file.onDidChange () ->
            self.svgText = fs.readFileSync(file.getPath());
            self.attached()

        @onDidRenameDisposable = file.onDidRename () ->
            editor.uri = file.getPath();
            editor.tabTitle = path.parse(editor.uri).base;
            editor.emitter.emit('did-change-title');
