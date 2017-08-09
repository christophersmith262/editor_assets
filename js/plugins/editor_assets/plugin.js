/**
 * @file
 * Drupal CKEditor Widget Filter Plugin.
 *
 * This replaces the default widget drop target finder with a proxy class that
 * will track data associated with a DnD operation and allow filtering of drop
 * locations based on that data.
 *
 * @ignore
 */
(function (Drupal, drupalSettings, CKEDITOR) {

  'use strict';

  CKEDITOR.plugins.add('editor_assets', {
    icons: null,
    hidpi: false,

    beforeInit: function(editor) {
      editor.drupalAssets = Drupal.editor_assets.createManager(editor.name, drupalSettings.editor_assets);
    },

    init: function(editor) {
      editor.on('contentDom', function(evt) {
        if (editor.drupalAssets) {
          editor.drupalAssets.start(editor.window.$);
        }
      });
      editor.on('contentDomUnload', function(evt) {
        if (editor.drupalAssets) {
          editor.drupalAssets.stop();
        }
      });
    },
  });

})(Drupal, drupalSettings, CKEDITOR);
