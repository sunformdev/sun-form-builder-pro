<?php
if (!defined('ABSPATH')) {
    exit;
}

class SFBuilder_Pro_Multi_Step_Form_Block extends SFBuilder_Pro_Helper
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
        register_block_type('sunformbuilder/multi-step-form', [
            'render_callback' => [$this, 'render_multi_step_form_block'],
        ]);
    }

    public function render_multi_step_form_block($attributes)
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
        //echo "<pre>"; var_dump($form_data);die('Đã vào đây');
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
        //var_dump($has_recaptcha_v2);
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
            //var_dump(get_the_ID());
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
            $step_ids = !empty($attributes['steps']) && is_array($attributes['steps']) ? $attributes['steps'] : [];
            $previous_button_label = $attributes['button']['previous']['label'] ?? 'Previous';

            $step_panels = [];
            $current_panel = [];
            foreach ($form_data as $item) {
                $current_panel[] = $item;
                $item_type = !empty($item['type']) ? $item['type'] : '';
                if ($item_type === 'step') {
                    $step_panels[] = $current_panel;
                    $current_panel = [];
                }
            }
            if (!empty($current_panel)) {
                $step_panels[] = $current_panel;
            }

            $num_panels = count($step_panels);
            $step_settings = (isset($attributes['step_settings']) && is_array($attributes['step_settings']))
                ? $attributes['step_settings']
                : [];
            $progress_type = isset($step_settings['type']) ? (string) $step_settings['type'] : 'text';
            if (!in_array($progress_type, ['none', 'text', 'number', 'number_text', 'icon', 'icon_text'], true)) {
                $progress_type = 'text';
            }
            $progress_shape = (!empty($step_settings['shape']) && $step_settings['shape'] === 'square') ? 'square' : 'circle';
            $num_class = 'wpformbuilder-multi-step-form__progress-num ' . ($progress_shape === 'square' ? 'square' : 'circle');

            if ($progress_type !== 'none' && $num_panels > 1) {
                if (in_array($progress_type, ['icon', 'icon_text'], true)) {
                    wp_enqueue_style('formbuilder-fontawesome-icons');
                }
                $html .= '<nav class="wpformbuilder-multi-step-form__progress ' . esc_attr($progress_type) . '" role="navigation" aria-label="' . esc_attr__('Form steps', 'sunformbuilder-pro') . '">';
                $html .= '<ol class="wpformbuilder-multi-step-form__progress-list">';
                for ($i = 0; $i < $num_panels; $i++) {
                    $step_num = $i + 1;
                    $is_first = ($i === 0);
                    $panel_for_title = $step_panels[$i] ?? [];
                    $panel_count = count($panel_for_title);
                    $last_field = ($panel_count > 0) ? $panel_for_title[$panel_count - 1] : [];
                    $last_is_step = !empty($last_field['type']) && $last_field['type'] === 'step';
                    $step_title = ($last_is_step && isset($last_field['label']) && $last_field['label'] !== '')
                        ? trim((string) $last_field['label'])
                        : '';
                    $step_icon_raw = [];
                    if ($last_is_step && isset($last_field['step_icon']) && is_array($last_field['step_icon'])) {
                        $step_icon_raw = $last_field['step_icon'];
                    }
                    $step_icon_markup = $this->render_step_progress_icon_html($step_icon_raw);

                    $step_inner = '';
                    if ($progress_type === 'number_text') {
                        $step_inner = '<span class="' . esc_attr($num_class) . '">' . (int) $step_num . '</span>';
                        $step_inner .= '<span class="wpformbuilder-multi-step-form__progress-title">' . esc_html($step_title) . '</span>';
                    } elseif ($progress_type === 'text') {
                        $step_inner = '<span class="wpformbuilder-multi-step-form__progress-title">' . esc_html($step_title) . '</span>';
                    } elseif ($progress_type === 'icon_text') {
                        $step_inner = '<span class="' . esc_attr($num_class) . '">' . $step_icon_markup . '</span>';
                        $step_inner .= '<span class="wpformbuilder-multi-step-form__progress-title">' . esc_html($step_title) . '</span>';
                    } elseif ($progress_type === 'number') {
                        $step_inner = '<span class="' . esc_attr($num_class) . '">' . (int) $step_num . '</span>';
                    } elseif ($progress_type === 'icon') {
                        $step_inner = '<span class="' . esc_attr($num_class) . '">' . $step_icon_markup . '</span>';
                    } else {
                        $step_inner = '<span class="' . esc_attr($num_class) . '">' . (int) $step_num . '</span>';
                        if ($step_title !== '') {
                            $step_inner .= '<span class="wpformbuilder-multi-step-form__progress-title">' . esc_html($step_title) . '</span>';
                        }
                    }

                    $html .= '<li class="wpformbuilder-multi-step-form__progress-item' . ($is_first ? ' is-active' : '') . '" data-step-index="' . (int) $i . '"' . ($is_first ? ' aria-current="step"' : '') . '>';
                    $html .= '<div class="wpformbuilder-multi-step-form__progress-step ' . esc_attr($last_field['id'] ?? '') . '">';
                    $html .= $step_inner;
                    $html .= '</div>';
                    if ($i < $num_panels - 1) {
                        $html .= '<span class="wpformbuilder-multi-step-form__progress-connector" aria-hidden="true"></span>';
                    }
                    $html .= '</li>';
                }
                $html .= '</ol></nav>';
            }

            foreach ($step_panels as $panel_index => $panel_fields) {
                $html .= '<div class="wpformbuilder-multi-step-form__panel" data-step-index="' . (int) $panel_index . '" style="width: 100%;">';
                $html .= '<div class="wpformbuilder-multi-step-form__panel-inner" style="width: 100%;">';
                $fields_wrap_open = false;
                foreach ($panel_fields as $item) {
                    $type = !empty($item['type']) ? $item['type'] : '';
                    if ($type === 'step') {
                        if ($fields_wrap_open) {
                            $html .= '</div>';
                            $fields_wrap_open = false;
                        }
                        $class_name = 'SFBuilder_Pro_Step_Control';
                        $found = array_search($item['id'] ?? '', $step_ids, true);
                        $item['index_step'] = ($found !== false) ? (int) $found : 0;
                        $item['previous_label'] = $previous_button_label;
                        $item['steps_count'] = max(1, count($step_ids));
                        $item['submit_button'] = $attributes['button'] ?? [];
                        $item['input_size'] = $attributes['form']['input_size'];
                        if (class_exists($class_name)) {
                            $html .= (new $class_name())->get_control_template($item);
                        }
                        continue;
                    }
                    if (!$fields_wrap_open) {
                        $html .= '<div class="wpformbuilder-multi-step-form__panel-fields">';
                        $fields_wrap_open = true;
                    }
                    $class_name = 'SFBuilder_Pro_' . ucfirst($type) . '_Control';
                    $item['input_size'] = $attributes['form']['input_size'];
                    if (class_exists($class_name)) {
                        $html .= (new $class_name())->get_control_template($item);
                    }
                }
                if ($fields_wrap_open) {
                    $html .= '</div>';
                }
                $html .= '</div></div>';
            }

            // Nút submit nằm trong control step (một bước hoặc bước cuối); không render thêm submit toàn form để tránh trùng.
            if (empty($step_ids)) {
                $html .= '</div><div class="wpformbuilder-form__button">' . $this->render_submit_button_html($attributes['button'] ?? [], $submit_button_text, $submit_button_size);
            } else {
                $html .= '</div>';
            }
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

    /**
     * Icon trong thanh tiến trình (tương đương renderIcon trong assets JS).
     *
     * @param array<string,mixed> $icon
     */
    private function render_step_progress_icon_html(array $icon)
    {
        if (empty($icon) || ($icon['type'] ?? '') === 'none') {
            return '';
        }
        if (($icon['type'] ?? '') === 'upload' && !empty($icon['url'])) {
            return '<img src="' . esc_url($icon['url']) . '" alt="" />';
        }
        if (($icon['type'] ?? '') === 'icon_lib' && !empty($icon['name']) && !empty($icon['group'])) {
            return '<i class="fa-' . esc_attr($icon['group']) . ' fa-' . esc_attr($icon['name']) . '" aria-hidden="true"></i>';
        }

        return '';
    }
}
new SFBuilder_Pro_Multi_Step_Form_Block();