### Overview
An Atom Package for easily creating diagrams such as Flowcharts, Sequences, Graphviz's DOT, and Railroad diagrams using
an easy to understand and very productive text format. Example:
<table>
<tr>
<td><strong>Example sequence diagram's file content</strong></td>
<td><strong>Generated SVG Graphic File</strong></td>
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


**Additional Features**
 - Adds an SVG viewer that you can open in another tab/pane to view the generated diagram.
 - The SVG file live reloads on each change.

#### Coming Soon
 - Will provide syntax highlighting of diagram files
   - **.sequence** (started)
   - **.flowchart**
   - **.dot**
   - **.railroad**


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
