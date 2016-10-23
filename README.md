### Overview
An Atom Package for easily creating diagrams such as Flowcharts, Sequences, Graphviz's DOT, and Railroad diagrams using
an easy to understand and very productive text format.

###### Atom Package Features
 - Includes an **.svg** graphics viewer that you can use to view generated diagrams
 - The SVG viewers will automatically reload when the **.svg** file changes on your hard drive
 - Coming soon, is syntax highlighting for the diagram text file formats

<table>
<tr>
<td>Example sequence diagram</td>
<td>Generated SVG Graphic File</td>
</tr>
<tr>
  <td>
  <pre>
<code>
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
</code>
  </pre>
  </td>
  <td>
    <img src="http://francoislaberge.github.io/diagrams/docs/sequence.png" width="350px" />
  </td>
</tr>
</table>

See underlying [diagrams](https://github.com/francoislaberge/diagrams) project for more diagram types & formats.

#### Documentation

##### Textual DSL Syntax
See underlying [diagrams](https://github.com/francoislaberge/diagrams) project for documentation.

##### Previewing Diagrams in Atom
Use the following flow when working on diagram files.

 1. Install this **diagrams** package
 2. Install [diagram](http://npmjs.org/diagrams) CLI.
 3. Create or load an existing (**.flowchart**, **.sequence**, **.dot**, or **.railroad**) file.
 4. Use the diagram CLI to automatically generate .svg visualizes of the diagram files.
    Run the following from the root folder that has all of your diagram files

        diagrams watch --build .

 5. Open the .svg files that the above CLI will generate as you work on diagram files.
 6. I recommend using split panes (Coming at some point we could integrate the svg previewer more tightly.
    At least making the SVG viewer auto reload on file change)

<img src="http://francoislaberge.com/atom-diagrams/screenshot-atom.gif"/>
