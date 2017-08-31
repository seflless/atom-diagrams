### Overview
An Atom Package for easily creating diagrams such as Sequence and Graphviz's Dot format.
Diagrams are generated using easy to understand and very productive text notation.

Has an accompanying command line tool to generate SVG from these files. See [diagrams](https://www.npmjs.com/package/diagrams).

###### Atom Package Features
 - Preview the diagram graphics
 - Real time per key stroke updating of the diagram previewer
 - Syntax highlighting and error checking of text notation
 - Includes an SVG previewer
 - Previewer can be dynamically resized by dragging the left side

<img src="http://francoislaberge.com/atom-diagrams/screenshot-atom.gif"/>

### Documentation

##### Usage
Use the following flow when working on diagram files.

 1. Install the [diagrams](https://atom.io/packages/diagrams) Atom package
 2. Create or load an existing **.sequence** or **.dot** file
 3. Edit them and preview the results in realtime.
 3. (Optionally) Use the diagram CLI to automatically generate .svg visualizes of the diagram files
    Run the following from the root folder that has all of your diagram files

        diagrams watch --build .

##### Reference
See underlying [diagrams](https://www.npmjs.com/package/diagrams) project for documentation.

#### Generating SVG
This project doesn't generate .svg files, but might in the future. The current focus
is having an easy way to edit the content and preview the diagrams that will be generated
using the diagrams command line tool.

See the [diagrams](https://www.npmjs.com/package/diagrams) command line tool for more information.
