const path = require("path");
const SVGPreviewer = require("./svg-previewer");
const debounce = require('throttle-debounce/debounce');

const supportedExtensions = {
        ".dot": true,
        ".sequence": true
    };

const CSS = `
    svg text {
      fill: #000;
      stroke: none;
      font-size: 12pt;
      font-family: 'Andale Mono', monospace;
    }
    svg :not(text) {
      fill: none;
      stroke: #000;
      stroke-width: 2;
    }
    .textbg {
      fill: #fff;
      stroke: none;
    }
    .rect {
      fill: #fff;
    }
    .signal-solid {
      stroke-dasharray: 0;
    }
    .signal-dotted {
      stroke-dasharray: 5;
    }
    .arrow-filled {
      marker-end: url(#arrow-filled);
    }
    .arrow-open {
      marker-end: url(#arrow-open);
    }
    `;

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

        console.log(editor);
        console.log(document.body.querySelector('.item-views').clientWidth);

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

        const debouncedSequenceUpdate = debounce( 100, () => {
            const Diagram = require('./sequence-diagram-min.js');

            // Parese the text and catch errors
            let diagram;
            try{
                diagram = Diagram.parse(editor.getBuffer().getText());
            } catch(err){
                console.log(err.message);
                return;

            }

            const stylesheet = document.createElement('style');
            stylesheet.type = 'text/css';
            stylesheet.innerHTML = CSS;

            // Clear out previous svg
            previewElement.innerHTML = "";

            // Render new SVG
            try{
                diagram.drawSVG(previewElement, stylesheet);
            } catch(err){
                console.log(err);
            }
        });

        editor.onDidChange( () => {

            switch( path.extname( editor.getPath() ) ) {
                case ".dot":
                    var Viz = require('viz.js');
                    try{
                        const svg = Viz(editor.getBuffer().getText(), { format: "svg", engine: "dot" });
                        previewElement.innerHTML = svg;
                    } catch(err){
                        console.log(err);
                    }
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
