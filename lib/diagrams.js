var path = require("path"),
    SVGPreviewer = require("./svg-previewer");

module.exports = {
    activate: function() {
        this.openerDisposable = atom.workspace.addOpener( function(uriToOpen){
                var extension = path.extname(uriToOpen).toLowerCase();

                if( extension === '.svg') {
                    return new SVGPreviewer(uriToOpen);
                }
            });
    },

    deactivate: function() {
        this.openerDisposable.dispose();
    }
};
