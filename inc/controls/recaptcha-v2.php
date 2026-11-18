<?php
if (!defined('ABSPATH')) {
    exit;
}

class SFBuilder_Pro_Recaptcha_V2_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'recaptcha_v2';
    }
    public function get_control_template($attributes)
    {
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $recaptcha_v2_site_key = esc_attr(get_option('sunformbuilder_recaptcha_v2_site_key'));
        $required_msg = $attributes['recaptcha_v2_required_message'] ?? 'Please verify that you are not a robot.';

        $label_attributes = [
            'for' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-group__label'
        ];
        $group_attributes = [
            'class' => 'wpformbuilder-form-group ' . $attributes['id'],
            'data-field-label' => $label
        ];

        return "
            <div " . $this->get_render_attributes($group_attributes) . ">
                <label " . $this->get_render_attributes($label_attributes) . ">" . esc_html($label) . "</label>
                <div class='wpformbuilder-form-control recaptcha_v2'>
                    <div class='g-recaptcha' data-sitekey=" . $recaptcha_v2_site_key . " data-callback='recaptchaCallback'></div>
                    <div class='wpformbuilder-form-group__required' style='display: none;'>" . $required_msg . "</div>
                </div>
            </div>
        ";
    }
}
