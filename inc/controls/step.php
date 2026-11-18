<?php
if (!defined('ABSPATH')) {
    exit;
}
class SFBuilder_Pro_Step_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'step';
    }

    /**
     * Nút submit giống block form (icon, size) — dùng trong step (1 bước hoặc bước cuối).
     */
    private function render_submit_button_html($button, $submit_text, $submit_size)
    {
        $html = '<button type="submit" class="wpformbuilder-multi-step-form__button--submit wpformbuilder-form__button--submit wpformbuilder-button-submit-' . esc_attr($submit_size) . '"><span class="wpformbuilder-form__button--submit__content">';
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
        $html .= '</span></button>';

        return $html;
    }

    public function get_control_template($attributes)
    {
        $next_label = !empty($attributes['next_label']) ? $attributes['next_label'] : 'Next';
        $previous_label = !empty($attributes['previous_label']) ? $attributes['previous_label'] : 'Previous';
        $index_step = isset($attributes['index_step']) ? (int) $attributes['index_step'] : 0;
        $steps_count = isset($attributes['steps_count']) ? (int) $attributes['steps_count'] : 1;
        if ($steps_count < 1) {
            $steps_count = 1;
        }
        $submit_btn = isset($attributes['submit_button']) && is_array($attributes['submit_button']) ? $attributes['submit_button'] : [];
        $submit_text = !empty($submit_btn['name']) ? $submit_btn['name'] : 'Submit';
        $submit_size = !empty($submit_btn['size']) ? $submit_btn['size'] : 'sm';

        $group_attributes = [
            'class' => 'wpformbuilder-multiple-step-form-button ' . $attributes['id'] . ($index_step === 0 ? ' flex-one' : ''),
            'style' => 'width: 100%;',
        ];

        $buttons = '';
        if ($steps_count === 1) {
            $buttons .= $this->render_submit_button_html($submit_btn, $submit_text, $submit_size);
        } elseif ($index_step === 0) {
            $buttons .= '<button type="button" class="wpformbuilder-multi-step-form__button--next">' . esc_html($next_label) . '</button>';
        } elseif ($index_step < $steps_count - 1) {
            $buttons .= '<button type="button" class="wpformbuilder-multi-step-form__button--previous">' . esc_html($previous_label) . '</button>';
            $buttons .= '<button type="button" class="wpformbuilder-multi-step-form__button--next">' . esc_html($next_label) . '</button>';
        } else {
            $buttons .= '<button type="button" class="wpformbuilder-multi-step-form__button--previous">' . esc_html($previous_label) . '</button>';
            $buttons .= $this->render_submit_button_html($submit_btn, $submit_text, $submit_size);
        }

        return "
            <div " . $this->get_render_attributes($group_attributes) . ">
                {$buttons}
            </div>
        ";
    }

}