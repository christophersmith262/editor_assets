<?php

namespace Drupal\editor_assets\Plugin\CKEditorPlugin;

use Drupal\ckeditor\CKEditorPluginBase;
use Drupal\ckeditor\CKEditorPluginContextualInterface;
use Drupal\editor\Entity\Editor;

/**
 * Defines the "editor_assets" plugin.
 *
 * @CKEditorPlugin(
 *   id = "editor_assets",
 *   label = @Translation("Editor Asset Loader"),
 *   module = "editor_assets"
 * )
 */
class EditorAssets extends CKEditorPluginBase implements CKEditorPluginContextualInterface {

  /**
   * {@inheritdoc}
   */
  public function isEnabled(Editor $editor) {
    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return drupal_get_path('module', 'editor_assets') . '/js/plugins/editor_assets/plugin.js';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor) {
    return array(
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getButtons() {
    return array();
  }

  /**
   * {@inheritdoc}
   */
  function getLibraries(Editor $editor) {
    return array(
      'editor_assets/core',
    );
  }
}

