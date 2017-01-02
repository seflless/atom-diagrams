const path = require("path");
const SVGPreviewer = require("./svg-previewer");
const debounce = require('throttle-debounce/debounce');
const {allowUnsafeEval} = require('loophole');
//const Split = require('split')

const supportedExtensions = {
        ".dot": true,
        ".sequence": true
    };

module.exports = {
    activate: function() {

        // Listen for addition/removal of
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
                editor.element.shadowRoot.querySelector('.editor--private').style.width = `${remainingWidth}px`;

                lastWidth = editor.element.parentElement.clientWidth;
            }
            requestAnimationFrameId = requestAnimationFrame(checkForResize);
        }
        checkForResize();

        let lastMarker = null;
        function markError(lineNumber, errorDescription){
            let line = editor.getBuffer().lineForRow(lineNumber);
            let range = [[lineNumber,0], [lineNumber, line.length]];
            lastMarker = editor.markBufferRange(range, {invalidate: 'touch'});
            editor.decorateMarker(lastMarker, {
                type: 'highlight',
                class: 'diagrams-highlight-red'
            });
            editor.decorateMarker(lastMarker, {
                type: 'line-number',
                class: 'diagrams-line-number-red'
            });

            //create popup overlay
            let errorElement = document.createElement('div');
            errorElement.innerHTML = errorDescription;
            errorElement.className = "diagrams-line-number-red";

            editor.decorateMarker(lastMarker, {
                type: 'block',
                position: 'after',
                item: errorElement
            });
        }

        const debouncedSequenceUpdate = debounce( 100, () => {
            const Diagram = require('./sequence-diagram-min.js');

            // Clear any previous error markers
            if(lastMarker){
                lastMarker.destroy();
                lastMarker = null;
            }

            // Parse the text and catch errors
            let diagram;
            try{
                diagram = Diagram.parse(editor.getBuffer().getText());
            } catch(err){
                const matches = err.message.match(/(.*) on line (\d*):/);
                const lineNumber = parseInt(matches[2])-1;
                const errorDescription = matches[1];
                markError(lineNumber, errorDescription);
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
                        var Viz = require('viz.js');

                        // Clear any previous error markers
                        if(lastMarker){
                            lastMarker.destroy();
                            lastMarker = null;
                        }
                        allowUnsafeEval( () => {
                            try {
                                const svg = Viz(editor.getBuffer().getText(), { format: "svg", engine: "dot" });
                                previewElement.innerHTML = svg;
                            } catch(err){
                                const matches = err.match(/Error: ((.*) in line (\d*))/);
                                const errorDescription = matches[1];
                                const lineNumber = parseInt(matches[3])-1;
                                markError(lineNumber, errorDescription);
                            }
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
        });
    }
}
