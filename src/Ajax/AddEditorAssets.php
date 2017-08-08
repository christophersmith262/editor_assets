<?php

namespace Drupal\editor_assets\Ajax;

use Drupal\Core\Ajax\CommandInterface;

class AddEditorAssets implements CommandInterface {

  protected $editorId;
  protected $assets;

  public function __construct($editor_id, array $assets = []) {
    $this->assets = $assets;
    $this->editorId = $editor_id;
  }

  public function render() {
    return [
      'command' => 'add_editor_assets',
      'editorId' => $this->editorId,
      'assets' => $this->assets,
    ];
  }

}
