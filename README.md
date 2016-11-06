### Overview
An Atom Package for easily creating diagrams such as Flowcharts, Sequence, and
graphviz's dot. Diagrams are generated using easy to understand and very productive
text notation.

Has an accompanying command line tool to generate SVG from these files. See [diagrams](https://www.npmjs.com/package/diagrams).

###### Atom Package Features
 - Preview the diagram graphics
 - The diagrams preview updates in real time per key stroke
 - Syntax highlighting and error checking of text notation
 - Includes an **.svg** previewer

<img src="http://francoislaberge.com/atom-diagrams/screenshot-atom.gif"/>

### Documentation

##### Usage
Use the following flow when working on diagram files.

 1. Install the [diagrams](https://atom.io/packages/diagrams) Atom package
 2. Create or load an existing (**.sequence**, **.dot**, or **.flowchart**) file
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
