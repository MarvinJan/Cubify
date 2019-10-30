# Cubify JS plugin 

## Make your DIVs into 3d cubes

You can see simple demo on a project's [webpage](https://marvinjan.github.io/cubify)

This plugin allows to bundle up to 6 (obviously :) ) DIVs into one 3d interactive cube!

## Usage

Link the script in your head tag

```
<script src='*YOUR__PATH*/cubify.js'></script>
```

Then choose the DIV you wish to be the front and initiate the plugin passing it as a first parameter: 

```
new Cubify(*YOUR__FRONT__DIV*, options)
```

## Options

Second parameter of the plugin, must be an **object**, which can include:

### faces : object

With it you can set another five DIVs as each of five remaining cube faces:

```
faces: {
    back: *YOUR__BACK__DIV*
    left: *YOUR__LEFT__DIV*
    right: *YOUR__RIGHT__DIV*
    top: *YOUR__TOP__DIV*
    bottom: *YOUR__BOTTOM__DIV*
}
```
### interactive : boolean

Option to allow user rotation of the cube via mouse. Default - **false**

### width

The width (and, since it's, you know - a cube - height and depth) of the cube. Default - largest dimension (meaning height or width) of all passed DIVs; 