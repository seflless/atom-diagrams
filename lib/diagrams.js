const path = require("path");
const SVGPreviewer = require("./svg-previewer");
const debounce = require('throttle-debounce/debounce');
const uuidV1 = require('uuid/v1');
const SPLITTER_WIDTH = 4;

let dotWorker;

// A list of each open previewer instance
let previewers = {};

//const Split = require('split')

const supportedExtensions = {
        ".dot": true,
        ".sequence": true
    };

module.exports = {
    config: {
        previewWidth: {
            type: 'integer',
            description: "Sets the width of the preview pane. All preview instances read this value",
            default: 600,
            minimum: 10
        }
    },
    activate: function() {
        // let panel = document.createElement('div');
        // panel.style.width = "100px";
        // panel.style.height = "100%";
        // panel.style.background = "red";
        // atom.workspace.addRightPanel({
        //     item: panel,
        //     priority: 1
        // });

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

function getParentWidth(editor){
    if(!editor._previewer.element.parentElement.parentElement.parentElement.parentElement){
        return 10;
    }
    return parseInt(window.getComputedStyle(editor._previewer.element.parentElement.parentElement.parentElement.parentElement).width)
}

// Global drag handlers
let splitterToDrag = null;
let splitterToDragEditor = null;
let startWidth;
let startClientX;
function mouseMove(e){
    if( splitterToDrag !== null ) {
        let newWidth  = Math.max(10, startWidth - (e.clientX - startClientX) );
        newWidth = Math.min(getParentWidth(splitterToDragEditor)-10, newWidth );

        atom.config.set( 'diagrams.previewWidth', newWidth );
    }
}

function mouseUp(){
    if( splitterToDrag !== null ) {
        splitterToDrag = null;
    }
}

function doResize(editor){

    editor._previewer.element.style.width = `${editor._previewer.width}px`;
    editor._previewer.splitterHandle.style.padding = `0px ${SPLITTER_WIDTH}px`;
    editor._previewer.splitterHandle.style.right = `${editor._previewer.width - SPLITTER_WIDTH * 2}px`;

    const remainingWidth = Math.max(0, getParentWidth(editor) - editor._previewer.width );
    if( editor.element.querySelector('.editor--private') !== null){
        editor._previewer.element.querySelector('.editor--private').style.width = `${remainingWidth}px`;
    }

    editor._previewer.lastWidth = getParentWidth(editor);
}

document.addEventListener('mousemove', mouseMove );
document.addEventListener('mouseup', mouseUp );

function setupPreviewer(editor){
    // Make sure it's a text editor
    if( atom.workspace.isTextEditor( editor ) &&
        !!editor.getPath() &&
        supportedExtensions[ path.extname( editor.getPath() ) ]  ) {

        const previewContainer = document.createElement('div');

        previewContainer.innerHTML =
            '<div class="diagrams-previewer">'+
                '<div class="diagrams-previewer-container" style="border-left: 1px solid black; height: 100%; background: white; overflow: scroll; z-index: 1; position: absolute; right: 0px; top: 0px;"></div>'+
                '<div class="diagrams-previewer-splitter-handle" style="height: 100%; cursor: ew-resize; overflow: scroll; z-index: 1; position: absolute; top: 0px; width: 1px;"></div>'+
            '</div>';
        editor.element.appendChild(previewContainer);

        let previewElement = previewContainer.getElementsByClassName('diagrams-previewer-container')[0];
        let splitterHandleElement = previewContainer.getElementsByClassName('diagrams-previewer-splitter-handle')[0];

        // Attach the previewElement for access convenience to the editor instance
        editor._previewer = {
            element: previewElement,
            splitterHandle: splitterHandleElement,
            width: atom.config.get('diagrams.previewWidth'),
            lastWidth: null
        };
        editor._previewerId = uuidV1();
        previewers[editor._previewerId] = editor;

        splitterHandleElement.addEventListener('mousedown', (e) => {
            splitterToDrag = splitterHandleElement;
            splitterToDragEditor = editor;
            startClientX = e.clientX;
            startWidth = editor._previewer.width;
        });

        let requestAnimationFrameId;

        // Poll for changes in the parents size so we can adjust the previewer
        // and scroll window accordingly
        function checkForResize() {
            // Make sure this the text editor element has been attached before
            // trying to get it's parent
            //if( editor.element.parentElement !== null &&
            //    editor._previewer.lastWidth !== editor.element.parentElement.clientWidth) {
                doResize(editor);
            //}
            requestAnimationFrameId = requestAnimationFrame(checkForResize);
        }
        checkForResize();

        previewWidthObserverDisposable = atom.config.observe('diagrams.previewWidth', (newValue) => {
            // newValue = Math.min(getParentWidth(editor)-10, newValue);
            // newValue = Math.max(10, newValue);
            editor._previewer.width = newValue;
            doResize(editor);
        });

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
                                    previewers[msg.data.previewerId]._previewer.element.innerHTML = msg.data.svg;
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

            if(previewWidthObserverDisposable){
                previewWidthObserverDisposable.dispose();
                previewWidthObserverDisposable = null;
            }

            // Remove editor from previewers list
            delete previewers[editor._previewerId];
        });
    }
}
