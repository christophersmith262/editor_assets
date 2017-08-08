<?php

namespace Drupal\Tests\editor_assets\Kernel;

use Drupal\Core\Render\RenderContext;
use Drupal\KernelTests\KernelTestBase;
use Drupal\editor_assets\EditorAssetProcessor;

/**
 * @coversDefaultClass Drupal\editor_assets\EditorAssetProcessor
 *
 * @group editor_assets
 */
class EditorAssetProcessorKernelTest extends KernelTestBase {

  public function processAttachmentsDataProvider() {
    return [
      [
        ['#attached' => ['library' => ['core/jquery']]],
        [
          'js:core/assets/vendor/jquery/jquery.min.js' => [
            'type' => 'js',
            'source' => 'file',
            'data' => '/core/assets/vendor/jquery/jquery.min.js',
            'location' => 'footer',
            'id' => 'js:core/assets/vendor/jquery/jquery.min.js',
          ],
        ],
      ],

      [
        ['#attached' => ['library' => ['core/drupal']]],
        [
          'js:core/assets/vendor/domready/ready.min.js' => [
            'type' => 'js',
            'data' => '/core/assets/vendor/domready/ready.min.js',
            'source' => 'file',
            'location' => 'footer',
            'id' => 'js:core/assets/vendor/domready/ready.min.js',
          ],
          'js:core/misc/drupalSettingsLoader.js' => [
            'type' => 'js',
            'data' => '/core/misc/drupalSettingsLoader.js',
            'source' => 'file',
            'location' => 'footer',
            'id' => 'js:core/misc/drupalSettingsLoader.js',
          ],
          'js:core/misc/drupal.js' => [
            'type' => 'js',
            'data' => '/core/misc/drupal.js',
            'source' => 'file',
            'location' => 'footer',
            'id' => 'js:core/misc/drupal.js',
          ],
          'js:core/misc/drupal.init.js' => [
            'type' => 'js',
            'data' => '/core/misc/drupal.init.js',
            'source' => 'file',
            'location' => 'footer',
            'id' => 'js:core/misc/drupal.init.js',
          ],
          'settings' => [
            'type' => 'settings',
            'data' => [
              'path' => [
                'baseUrl' => NULL,
                'scriptPath' => NULL,
                'pathPrefix' => NULL,
                'currentPath' => NULL,
                'currentPathIsAdmin' => NULL,
                'isFront' => NULL,
                'currentLanguage' => NULL,
              ],
              'pluralDelimiter' => NULL,
            ],
            'id' => 'settings',
          ],
        ],
      ],

      [
        ['#attached' => ['drupalSettings' => ['test' => 'value']]],
        [
          'settings' => [
            'type' => 'settings',
            'data' => ['test' => 'value'],
            'id' => 'settings',
          ],
        ],
      ],
      [
        ['#attached' => ['library' => ['core/jquery.ui']]],
        [
          'css:core/assets/vendor/jquery.ui/themes/base/core.css' => [
            'type' => 'css',
            'data' => '/core/assets/vendor/jquery.ui/themes/base/core.css',
            'source' => 'file',
            'location' => 'header',
            'id' => 'css:core/assets/vendor/jquery.ui/themes/base/core.css',
          ],
          'css:core/assets/vendor/jquery.ui/themes/base/theme.css' => [
            'type' => 'css',
            'data' => '/core/assets/vendor/jquery.ui/themes/base/theme.css',
            'source' => 'file',
            'location' => 'header',
            'id' => 'css:core/assets/vendor/jquery.ui/themes/base/theme.css',
          ],
          'js:core/assets/vendor/jquery/jquery.min.js' => [
            'type' => 'js',
            'data' => '/core/assets/vendor/jquery/jquery.min.js',
            'source' => 'file',
            'location' => 'footer',
            'id' => 'js:core/assets/vendor/jquery/jquery.min.js',
          ],
          'js:core/assets/vendor/jquery.ui/ui/core-min.js' => [
            'type' => 'js',
            'data' => '/core/assets/vendor/jquery.ui/ui/core-min.js',
            'source' => 'file',
            'location' => 'footer',
            'id' => 'js:core/assets/vendor/jquery.ui/ui/core-min.js',
          ],
        ],
      ],
    ];
  }

  /**
   * @dataProvider processAttachmentsDataProvider
   */
  public function testProcessAttachments(array $build, array $expected) {
    $processor = new EditorAssetProcessor($this->container->get('asset.resolver'));
    $attachments = $this->getRenderAttachments($build);
    $this->assertEquals($processor->processAttachments($attachments), $expected);
  }

  protected function getRenderAttachments(array $build) {
    $renderer = $this->container->get('renderer');
    $context = new RenderContext();
    $renderer->executeInRenderContext($context, function() use ($renderer, $build) {
      $renderer->render($build);
    });
    return $context->pop()->getAttachments();
  }
}
