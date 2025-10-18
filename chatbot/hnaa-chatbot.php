<?php
/**
 * Plugin Name: HNAA Chatbot (NestJS API) – Modal Ready
 * Description: ショートコード [hnaa_chatbot api="https://your-nest-api.example.com/chat" display="modal"] でモーダル表示に対応。NestJS API へ POST します。
 * Version: 1.1.0
 * Author: You
 */

if (!defined('ABSPATH')) { exit; }

function hnaa_chatbot_enqueue_assets_modal() {
    $plugin_url = plugin_dir_url(__FILE__);
    wp_enqueue_style('hnaa-chatbot-style', $plugin_url . 'assets/styles.css', array(), '1.1.0');
    wp_enqueue_script('hnaa-chatbot-script', $plugin_url . 'assets/chat.js', array(), '1.1.0', true);
}
add_action('wp_enqueue_scripts', 'hnaa_chatbot_enqueue_assets_modal');

/**
 * Shortcode attributes:
 * [hnaa_chatbot
 *   api="https://api.example.com/chat"
 *   title="AIアシスタント"
 *   placeholder="質問を入力..."
 *   theme="light|dark"
 *   botname="Assistant"
 *   display="inline|modal"
 *   launcher_text="ご相談はこちら"
 *   launcher_position="bottom-right|bottom-left|top-right|top-left"
 *   start_open="false|true"
 * ]
 */
function hnaa_chatbot_shortcode_modal($atts) {
    $atts = shortcode_atts(array(
        'api' => '',
        'title' => 'AIアシスタント',
        'placeholder' => '質問を入力...',
        'theme' => 'light',
        'botname' => 'Assistant',
        'display' => 'inline',
        'launcher_text' => 'チャット',
        'launcher_position' => 'bottom-right',
        'start_open' => 'false',
    ), $atts, 'hnaa_chatbot');

    if (empty($atts['api'])) {
        return '<div class="hnaa-chatbot-error">[hnaa_chatbot] に api="" を指定してください。</div>';
    }

    $id = 'hnaa-chatbot-' . wp_generate_uuid4();
    $is_modal = strtolower($atts['display']) === 'modal';
    ob_start();
    ?>
    <div id="<?php echo esc_attr($id); ?>" class="hnaa-chatbot-root"
         data-api="<?php echo esc_attr($atts['api']); ?>"
         data-title="<?php echo esc_attr($atts['title']); ?>"
         data-placeholder="<?php echo esc_attr($atts['placeholder']); ?>"
         data-theme="<?php echo esc_attr($atts['theme']); ?>"
         data-botname="<?php echo esc_attr($atts['botname']); ?>"
         data-display="<?php echo esc_attr($atts['display']); ?>"
         data-launcher-text="<?php echo esc_attr($atts['launcher_text']); ?>"
         data-launcher-position="<?php echo esc_attr($atts['launcher_position']); ?>"
         data-start-open="<?php echo esc_attr($atts['start_open']); ?>">
        <?php if (!$is_modal): ?>
          <!-- inline container: chat UI will render here -->
        <?php else: ?>
          <!-- modal/launcher mode: JS will inject launcher button and modal -->
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('hnaa_chatbot', 'hnaa_chatbot_shortcode_modal');
