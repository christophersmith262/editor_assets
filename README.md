## Synopsis

This module provides a system for injecting Drupal asset libraries into the
frame of an editor. A generic API is provided to allow use with any editor
that exposes a 'document' object.

By default a CKEditor plugin is provided for the default Drupal CKEditor
implementation.

Note that this does not actually inject libraries into the editor out of the
box. It is an API for developers to facilitate the development of consistent
editor experiences by injecting the assets needed to render certain widgets
or embedded entities in the wysiwyg.

## Motivation

Much of the code in this module is inspired by the
[Wysiwyg Custom Js](https://www.drupal.org/project/wysiwyg_custom_js) module
that [david_rothstein](https://www.drupal.org/u/david_rothstein) wrote for
Drupal 7, but has been adapted for the much improved library system in D8.

Since the original referenced contrib module only supports injecting javascript
assets into the editor, a more general solution that supports javascript
settings, css, and other Drupal library options was desired.

## Enabling the Asset Manager for an Editor

### For CKEditor

This module provides a property on the CKEditor `editor` instance after the
`contentDom` event has finished: `editor.drupalAssets`. See below for an
explaination of how this property can be used.

### For Other Editors

This module provides API functions for managing assets on a DOM document.

To create a new asset manager for an editor instance, you must first include
the editor library:

```
$editor_element['#attached']['library'][] = 'editor_assets/core';
```

On the front end, you can attach an asset manager to an editor instance by
calling:

```
Drupal.editor_assets.createManager(<unique_editor_instance_id>, <document>);
```

The `document` is the HTML Document you want to manage assets for.

## Adding Assets to the Manager

Asset managers are [Backbone collections](http://backbonejs.org/). Each model
in the collection represents an asset. An asset model looks like:

```
{
  "id": "<unique_id_to_prevent_multiple_loads>",
  "type": "<js|css|settings>",
  "data": "<url|inline_data|settings_array>",
  "location": "<header|footer>",
}
```

### With javascript

To add an asset to an editor in javascript:

```
editor.drupalAssets.add({
  'id': 'path/to/file.js',
  'type': 'file',
  'data': '/path/to/file.js'.
  'location': 'footer',
}, {merge: true});
```

Note that the `merge: true` option is used to merge Drupal settings.

### In a render array

To add an asset to an editor in php:

```
$render_element['#attached']['drupalSettings']['editor_assets']['<unique_editor_id>'] = [
  [
    'id': 'path/to/file.js',
    'type': 'file',
    'data': '/path/to/file.js'.
    'location': 'footer',
  ]
];
```

### Through an AJAX Command

To add an asset to an editor in an AJAX response:

```
use Drupal\editor_assets\Ajax\AddEditorAssets;

$command = new AddEditorAssets('<unique_editor_id>', [
  [
    'id': 'path/to/file.js',
    'type': 'file',
    'data': '/path/to/file.js'.
    'location': 'footer',
  ]
]);
```

## Automatic Asset Generation

Most of the time we don't have a hard-coded set of assets to deliver. It's
based on whatever we are rendering in the editor.

The module provides a service for simplifying asset model creation based on
the bubbleable metadata in a render array:

```
use Drupal\Core\Render\RenderContext;

$asset_processor = \Drupal::service('editor_assets.processor');
$renderer = \Drupal::service('renderer');

$build['#attached']['library'][] = 'core/drupal';
$context = new RenderContext();
$markup[ = $renderer->executeInRenderContext($context, function() use ($renderer, $build) {
  return $renderer->render($build);
});

// Get a raw list of asset models.
$asset_processor->processAttachments($context->pop()->getAttachments());

// Get an AJAX command to deliver the assets.
$asset_processor->ajaxLoadAssets('<editor_id>', $context->pop()->getAttachments());

// Attach the asset models to config
$editor_element = [];
$asset_processor->ajaxLoadAssets('<editor_id>', $editor_element, $context->pop()->getAttachments());
```
