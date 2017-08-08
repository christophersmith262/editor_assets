<?php

namespace Drupal\editor_assets;

use Drupal\Core\Asset\AttachedAssets;
use Drupal\Core\Asset\AssetResolverInterface;
use Drupal\editor_assets\Ajax\AddEditorAssets;

class EditorAssetProcessor implements EditorAssetProcessorInterface {

  /**
   * The asset resolver service.
   *
   * @var \Drupal\Core\Asset\AssetResolverInterface
   */
  protected $assetResolver;

  public function __construct(AssetResolverInterface $asset_resolver) {
    $this->assetResolver = $asset_resolver;
  }

  /**
   * {@inheritdoc}
   */
  public function processAttachments(array $attachments) {
    $items = [];

    $assets = new AttachedAssets();
    $assets->setLibraries(isset($attachments['library']) ? $attachments['library'] : [])
      ->setSettings(isset($attachments['drupalSettings']) ? $attachments['drupalSettings'] : []);
    $css_assets = $this->assetResolver->getCssAssets($assets, FALSE);
    list($js_assets_header, $js_assets_footer) = $this->assetResolver->getJsAssets($assets, FALSE);

    foreach ($css_assets as $id =>$info) {
      $items['css:' . $id] = $this->createModel('css', $info, 'header');
    }

    foreach ($js_assets_header as $id => $info) {
      if ($info['type'] != 'setting') {
        $items['js:' . $id] = $this->createModel('js', $info, 'header');
      }
    }

    foreach ($js_assets_footer as $id => $info) {
      if ($info['type'] != 'setting') {
        $items['js:' . $id] = $this->createModel('js', $info, 'footer');
      }
    }

    $settings = $assets->getSettings();
    if ($settings) {
      $items['settings'] = $this->createModel('settings', ['data' => $settings]);
    }

    foreach ($items as $id => $item) {
      $items[$id]['id'] = $id;
    }

    return $items;
  }

  /**
   * {@inheritdoc}
   */
  public function attachAssetSettings($editor_id, array &$element, array $attachments) {
    $element['#attached']['drupalSettings']['editor_assets'][$editor_id] += $this->processAttachments($attachments);
  }

  /**
   * {@inheritdoc}
   */
  public function ajaxLoadAssets($editor_id, array $attachments) {
    return new AddEditorAssets($editor_id, $this->processAttachments($attachments));
  }

  protected function createModel($type, array $asset, $location = NULL) {
    if ($type == 'js' || $type == 'css') {
      if ($asset['type'] != 'external') {
        $asset['data'] = file_url_transform_relative(file_create_url($asset['data']));
      }
    }

    $model = [
      'type' => $type,
      'data' => $asset['data'],
    ];

    if (!empty($asset['type'])) {
      $model['source'] = $asset['type'];
    }

    if ($location) {
      $model['location'] = $location;
    }

    return $model;
  }

}
