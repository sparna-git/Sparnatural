_[Home](index.html) > Customize colors_


# How to customize colors of Sparnatural ?

_/!\This feature is available since version 8.1 of Sparnatural._

## Include a theme CSS

To customize the colors of Sparnatural, you need to include an additionnal "sparnatural-theme" CSS in your webpage and overwrite the color variables declaration inside it. This reference needs to be placed _after_ the reference to Sparnatural main CSS

```html
	<!-- Sparnatural Main CSS -->
  <link href="sparnatural.css" rel="stylesheet" />
  <!-- Sparnatural Theme CSS, place after Sparnatual main one to override the variables declaration -->
  <link href="themes/sparnatural-theme-sea.css" rel="stylesheet" />
```

Some default themes are provided under the "themes" subfolder of the distribution.

To get started, copy one of the theme css that are under the "themes" subfolder and adjust the values inside.

