const path = require("path");
const SVGPreviewer = require("./svg-previewer");
const debounce = require('throttle-debounce/debounce');
const uuidV1 = require('uuid/v1');

let dotWorker;

// A list of each open previewer instance
let previewers = {};

//const Split = require('split')

const supportedExtensions = {
        ".dot": true,
        ".sequence": true
    };

module.exports = {
    activate: function() {

        // Listen for addition/removal of editors
        this.textEditorObserverDisposable = atom.workspace.observeTextEditors( (editor) => {
            setupPreviewer(editor);
        });

        // Add SVG previewing
        this.openerDisposable = atom.workspace.addOpener( (uriToOpen) => {
                var extension = path.extname(uriToOpen).toLowerCase();

                if( extension === '.svg') {
                    return new SVGPreviewer(uriToOpen,uriToOpen);
                }
            });
    },

    deactivate: function() {
        this.openerDisposable.dispose();
        this.textEditorObserverDisposable.dispose();
    }
};

function setupPreviewer(editor){
    // Make sure it's a text editor
    if( atom.workspace.isTextEditor( editor ) &&
        supportedExtensions[ path.extname( editor.getPath() ) ]  ) {

        let width = 600;

        const previewElement = document.createElement('div');

        // Attach the previewElement for access convenience to the editor instance
        editor._previewElement = previewElement;
        editor._previewerId = uuidV1();
        previewers[editor._previewerId] = editor;

        previewElement.style.height = "100%";
        previewElement.style.background = "white";
        previewElement.style.overflow = "scroll";
        previewElement.style.zIndex = "1";
        previewElement.style.position = "absolute";
        previewElement.style.right = "0px";
        previewElement.style.top = "0px";
        editor.element.shadowRoot.appendChild(previewElement);


        let requestAnimationFrameId;

        // Poll for changes in the parents size so we can adjust the previewer
        // and scroll window accordingly
        let lastWidth = null;
        function checkForResize() {
            // Make sure this the text editor element has been attached before
            // trying to get it's parent
            if( editor.element.parentElement !== null &&
                lastWidth !== editor.element.parentElement.clientWidth) {

                previewElement.style.width = `${width}px`;

                const remainingWidth = Math.max(0, editor.element.parentElement.clientWidth - width );
                if( editor.element.shadowRoot.querySelector('.editor--private') !== null){
                  editor.element.shadowRoot.querySelector('.editor--private').style.width = `${remainingWidth}px`;
                }

                lastWidth = editor.element.parentElement.clientWidth;
            }
            requestAnimationFrameId = requestAnimationFrame(checkForResize);
        }
        checkForResize();

        editor._lastMarker = null;
        function markError(editor, lineNumber, errorDescription){
            let line = editor.getBuffer().lineForRow(lineNumber);
            let range = [[lineNumber,0], [lineNumber, line.length]];
            editor._lastMarker = editor.markBufferRange(range, {invalidate: 'touch'});
            editor.decorateMarker(editor._lastMarker, {
                type: 'highlight',
                class: 'diagrams-highlight-red'
            });
            editor.decorateMarker(editor._lastMarker, {
                type: 'line-number',
                class: 'diagrams-line-number-red'
            });

            //create popup overlay
            let errorElement = document.createElement('div');
            errorElement.innerHTML = errorDescription;
            errorElement.className = "diagrams-line-number-red";

            editor.decorateMarker(editor._lastMarker, {
                type: 'block',
                position: 'after',
                item: errorElement
            });
        }

        const debouncedSequenceUpdate = debounce( 100, () => {
            const Diagram = require('./sequence-diagram-min.js');

            // Clear any previous error markers
            if(editor._lastMarker){
                editor._lastMarker.destroy();
                editor._lastMarker = null;
            }

            // Parse the text and catch errors
            let diagram;
            try{
                diagram = Diagram.parse(editor.getBuffer().getText());
            } catch(err){
                const matches = err.message.match(/(.*) on line (\d*):/);
                const lineNumber = parseInt(matches[2])-1;
                const errorDescription = matches[1];
                markError(editor, lineNumber, errorDescription);
                return;
            }

            // Remove previous svg first
            previewElement.innerHTML = "";

            // Render new SVG
            try{
                diagram.drawSVG(previewElement, {theme: 'simple'});
            } catch(err){
                console.log(err);
            }
        });

        editor.onDidChange( () => {

            switch( path.extname( editor.getPath() ) ) {
                case ".dot":
                    process.nextTick( () => {
                        // Clear any previous error markers
                        if(editor._lastMarker){
                            editor._lastMarker.destroy();
                            editor._lastMarker = null;
                        }

                        if(!dotWorker){
                            dotWorker = new Worker("atom://diagrams/lib/dot-worker.js");
                            dotWorker.addEventListener('message', (msg) => {
                                if( msg.data.svg ) {
                                    previewers[msg.data.previewerId]._previewElement.innerHTML = msg.data.svg;
                                } else if( msg.data.error ) {
                                    markError(previewers[msg.data.previewerId], msg.data.error.lineNumber, msg.data.error.description);
                                }
                            });
                        }
                        dotWorker.postMessage({
                            previewerId: editor._previewerId,
                            text: editor.getBuffer().getText()

                        });
                    });
                    break;
                case ".sequence":
                    debouncedSequenceUpdate();
                    break;
            }

        });

        // Clear the last requestAnimationFrame call if the text editor is destroyed
        editor.onDidDestroy( () => {
            if(requestAnimationFrameId){
                cancelAnimationFrame(requestAnimationFrameId);
                requestAnimationFrameId = null;
            }

            // Remove editor from previewers list
            delete previewers[editor._previewerId];
        });
    }
}
