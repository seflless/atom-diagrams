### Overview
An Atom Package for easily creating diagrams such as Flowcharts, Sequences, Graphviz's DOT, and Railroad diagrams. P
is easy to edit that can generate a corresponding .SVG file.
 - [x] Adds an SVG viewer that you can open in another tab/pane to view the generated diagram.
 - [ ] Will provide syntax highlighting of diagram files (PR's welcome, only just started on this)
   - [ ] `.flowchart`
   - [x] `.sequence` (started)
   - [ ] `.dot`
   - [ ] `.railroad`


#### Documentation

##### Textual DSL Syntax
See underlying [diagrams](https://github.com/francoislaberge/diagrams) project for documentation.

##### Previewing Diagrams in Atom
Use the following flow when working on diagram files.

 1. Install this `diagrams` package
 2. Install [diagram](http://npmjs.org/diagrams) CLI.
 3. Create or load an existing (`.flowchart`, `.sequence`, `.dot`, or `.railroad`) file.
 4. Use the diagram CLI to automatically generate .svg visualizes of the diagram files.
    Run the following from the root folder that has all of your diagram files

         diagrams watch --build .

 5. Open the .svg files that the above CLI will generate as you work on diagram files.
 6. I recommend using split panes (Coming at some point we could integrate the svg previewer more tightly.
    At least making the SVG viewer auto reload on file change)
    
<img src="http://francoislaberge.com/atom-diagrams/screenshot-atom.gif"/>
