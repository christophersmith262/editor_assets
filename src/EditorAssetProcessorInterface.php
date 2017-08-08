<?php

namespace Drupal\editor_assets;

interface EditorAssetProcessorInterface {
  public function processAttachments(array $attachments);
  public function attachAssetSettings($editor_id, array &$element, array $attachments);
  public function ajaxLoadAssets($editor_id, array $attachments);
}
