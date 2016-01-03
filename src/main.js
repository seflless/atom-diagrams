"use babel";

import {CompositeDisposable} from 'atom';
import path from 'path';
import flowchart from './vendors/flowchart';

var diagrams = {
    activate: function(){
        this.disposable = new CompositeDisposable();

        let onActivePaneItemChange = (editor) => {
            if(editor && editor.constructor && editor.constructor.name === 'TextEditor') {
                let ext = path.extname(editor.getPath());
                if(ext === '.flowchart') {
                    console.log(editor);
                    this.updatePreviewPanelVisibility(true, editor);
                    return;
                } else {
                    this.updatePreviewPanelVisibility(false);
                }
            }
        };
        this.disposable.add(atom.workspace.observeActivePaneItem( function(editor) {
            onActivePaneItemChange(editor);
        }));

        this.createPreviewPanel();

        onActivePaneItemChange(atom.workspace.getActiveTextEditor());
    },

    deactivate: function(){
        this.disposable.dispose();
        if(this.onChangeDisposable){
            this.onChangeDisposable.dispose();
            this.onChangeDisposable = undefined;
        }
    },

    createPreviewPanel(){
        this.previewPanel = document.createElement('div');
        this.previewPanel.id = "atom-diagrams-preview";

        this.disposable.add(
            atom.workspace.addRightPanel({
                item: this.previewPanel,
                priority: 1//,
                //visible: false
            })
        );
    },

    updatePreviewPanelVisibility(show, editor){
        // Find the preview panel and toggle it's visibility
        let rightPanels = atom.workspace.getRightPanels();
        rightPanels.forEach( (panel) => {
            if( panel.item === this.previewPanel && show === true){
                panel.show();

                if(this.onChangeDisposable){
                    this.onChangeDisposable.dispose();
                    this.onChangeDisposable = undefined;
                }

                function updatePreview(){
                    try{
                        var diagram = flowchart.parse(editor.getText());
                        // Clear the preview svg and draw the new version
                        document.getElementById('atom-diagrams-preview').innerHTML = "";
                        diagram.drawSVG('atom-diagrams-preview');
                    } catch(err){
                        // TODO: Detect and communicate errors, ideally via Atom TextEditor mechanisms
                        document.getElementById('atom-diagrams-preview').innerHTML = "Syntax Error";
                    }
                }
                updatePreview();

                this.onChangeDisposable = editor.onDidChange( () => {
                    updatePreview();
                });

                //this.previewPanel.innerHTML =
            } else if( panel.item === this.previewPanel && show === false ){
                panel.hide();

                if(this.onChangeDisposable){
                    this.onChangeDisposable.dispose();
                    this.onChangeDisposable = undefined;
                }
            }
        })
    }
};

module.exports = diagrams;
