<?php
if (!defined('ABSPATH')) {
    exit;
}

class SFBuilder_Pro_Form_Block extends SFBuilder_Pro_Helper
{
    public function __construct()
    {
        // Register the block on init
        add_action('init', [$this, 'register_block']);

        $controls = glob(__DIR__ . '/../controls/*.php');
        foreach ($controls as $control) {
            require_once $control;
        }
    }

    public function register_block()
    {
        register_block_type('sunformbuilder/form', [
            'render_callback' => [$this, 'render_form_block'],
        ]);
    }

    public function render_form_block($attributes)
    {
        //echo "<pre>"; var_dump($attributes['fields']);die('Đã vào đây');
        $submit_button_size = $attributes['button']['size'] ?? 'sm';
        if (!in_array($submit_button_size, ['xs', 'sm', 'md', 'lg', 'xl'], true)) {
            $submit_button_size = 'sm';
        }
        $submit_button_text = $attributes['button']['name'] ?? 'Submit';
        $form_id = isset($attributes['form']['id']) ? sanitize_key((string) $attributes['form']['id']) : '';
        $post_form_id = isset($attributes['form']['post_form']) ? absint($attributes['form']['post_form']) : 0;
        $form_data = !empty($attributes['fields']) ? $attributes['fields'] : [];
        $validate_type = isset($attributes['form']['validate_type']) ? strtolower($attributes['form']['validate_type']) : 'html5';
        // Remove semantic mode: keep backward compatibility by mapping old saved "semantic" to "inline"
        if ($validate_type === 'semantic') {
            $validate_type = 'inline';
        }
        if (!in_array($validate_type, ['html5', 'inline'], true)) {
            $validate_type = 'html5';
        }
        $has_recaptcha_v3 = !empty(get_option('sunformbuilder_recaptcha_v3_site_key')) && !empty(get_option('sunformbuilder_recaptcha_v3_secret_key')) && !empty($attributes['action_submit_settings']['recaptcha_v3']['enabled']);
        $has_recaptcha_v2 = !empty(get_option('sunformbuilder_recaptcha_v2_site_key')) && !empty(get_option('sunformbuilder_recaptcha_v2_secret_key')) && $this->has_recaptcha_v2($attributes['fields']);
        if ($has_recaptcha_v3) {
            wp_enqueue_script(
                'wpformbuilder-recaptcha-v3',
                'https://www.google.com/recaptcha/api.js?render=' . esc_js(get_option('sunformbuilder_recaptcha_v3_site_key')),
                [],
                SFBUILDER_PRO,
                true
            );
        }

        if ($has_recaptcha_v2) {
            wp_enqueue_script(
                'wpformbuilder-recaptcha-v2',
                'https://www.google.com/recaptcha/api.js',
                [],
                SFBUILDER_PRO,
                true
            );
        }

        $html = '';
        if (!empty($form_data)) {
            // Kiểm tra xem form có field type file_upload không
            $has_file_upload = false;
            foreach ($form_data as $item) {
                if (!empty($item['type']) && $item['type'] === 'file_upload') {
                    $has_file_upload = true;
                    break;
                }
            }

            $enctype_attr = $has_file_upload ? ' enctype="multipart/form-data"' : '';
            // If we use JS validation (inline), disable native browser validation
            $novalidate_attr = ($validate_type !== 'html5') ? ' novalidate="novalidate"' : '';
            
            $html .= '<div class="wpformbuilder-form wpformbuilder-form-' . esc_attr($form_id) . '">';
            $html .= '<form class="wpformbuilder-box-form wpformbuilder-form-validate-' . esc_attr($validate_type) . '" data-form-id="' . esc_attr($form_id) . '" data-post-form="' . esc_attr($post_form_id) . '" data-validate-type="' . esc_attr($validate_type) . '"' . $enctype_attr . $novalidate_attr . '><div class="wpformbuilder-form__inner">';
            if ($has_recaptcha_v3) {
                $html .= '<input type="hidden" name="recaptcha_v3_token" id="wpformbuilder-recaptcha-v3-token" >';
                if (!empty($attributes['action_submit_settings']['recaptcha_v3']['hide_badge'])) {
                    wp_enqueue_style('formbuilder-form-style');
                    wp_add_inline_style('formbuilder-form-style', '.grecaptcha-badge{visibility:hidden;}');
                }
            }
            $html .= '<input type="hidden" name="post_id" value="' . esc_attr((string) get_the_ID()) . '">';
            foreach ($form_data as $key => $item) {
                $type = !empty($item['type']) ? $item['type'] : '';
                $class_name = 'SFBuilder_Pro_' . ucfirst($type) . '_Control';
                $item['input_size'] = $attributes['form']['input_size'];
                if (class_exists($class_name)) {
                    $html .= (new $class_name())->get_control_template($item);
                }
            }

            $html .= '</div><div class="wpformbuilder-form__button">' . $this->render_submit_button_html($attributes['button'] ?? [], $submit_button_text, $submit_button_size);
            $html .= '<div class="wpformbuilder-message">';
            if(!empty($attributes['action_submit']) && in_array('Stripe Payment', $attributes['action_submit'])){
                $html .= '<div class="wpformbuilder-message__stripe"></div>';
            }
            $html .= '<div class="wpformbuilder-message__submit"></div>';
            $html .= '</div></form><div class="wpformbuilder-overlay" hidden></div></div>';
        }
        return $html;
    }

    /**
     * Render submit button markup with escaped block attribute values.
     *
     * @param array  $button      Button block attributes.
     * @param string $submit_text Submit button label.
     * @param string $submit_size Submit button size slug.
     * @return string
     */
    private function render_submit_button_html($button, $submit_text, $submit_size)
    {
        $html = '<button type="submit" class="wpformbuilder-form__button--submit wpformbuilder-button-submit-' . esc_attr($submit_size) . '"><span class="wpformbuilder-form__button--submit__content">';
        $has_icon = !empty($button['icon']['type']) && ($button['icon']['type'] ?? '') !== 'none'
            && (!empty($button['icon']['name']) || !empty($button['icon']['url']));
        if ($has_icon) {
            wp_enqueue_style('formbuilder-fontawesome-icons');
            $icon_spacing = isset($button['icon']['spacing']) ? $button['icon']['spacing'] : '10px';
            $icon_position = isset($button['icon']['position']) ? $button['icon']['position'] : 'right';
            if ($icon_position === 'left') {
                if ($button['icon']['type'] === 'icon_lib') {
                    $html .= '<span class="wpformbuilder-submit-button-icon" style="margin-right: ' . esc_attr($icon_spacing) . '"><i class="fa-' . esc_attr($button['icon']['group']) . ' fa-' . esc_attr($button['icon']['name']) . '"></i></span>';
                }
                if ($button['icon']['type'] === 'upload') {
                    $html .= '<span class="wpformbuilder-submit-button-icon" style="margin-right: ' . esc_attr($icon_spacing) . '"><img src="' . esc_url($button['icon']['url']) . '" alt="" /></span>';
                }
                $html .= '<span class="wpformbuilder-submit-button-text">' . esc_html($submit_text) . '</span>';
            }
            if ($icon_position === 'right') {
                $html .= '<span class="wpformbuilder-submit-button-text">' . esc_html($submit_text) . '</span>';
                if ($button['icon']['type'] === 'icon_lib') {
                    $html .= '<span class="wpformbuilder-submit-button-icon" style="margin-left: ' . esc_attr($icon_spacing) . '"><i class="fa-' . esc_attr($button['icon']['group']) . ' fa-' . esc_attr($button['icon']['name']) . '"></i></span>';
                }
                if ($button['icon']['type'] === 'upload') {
                    $html .= '<span class="wpformbuilder-submit-button-icon" style="margin-left: ' . esc_attr($icon_spacing) . '"><img src="' . esc_url($button['icon']['url']) . '" alt="" /></span>';
                }
            }
        } else {
            $html .= '<span class="wpformbuilder-submit-button-text">' . esc_html($submit_text) . '</span>';
        }
        $html .= '</span></button></div>';

        return $html;
    }
}
new SFBuilder_Pro_Form_Block();
