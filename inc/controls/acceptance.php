<?php
if (!defined('ABSPATH')) {
    exit;
}
class SFBuilder_Pro_Acceptance_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'acceptance';
    }
    public function get_control_template($attributes)
    {
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $label_text = !empty($attributes['acceptance_text']) ? $attributes['acceptance_text'] : '';
        $acceptance_attributes = [
            'type' => 'checkbox',
            'name' => !empty($attributes['name']) ? $attributes['name'] : '',
            'value' => !empty($attributes['acceptance_value']) ? $attributes['acceptance_value'] : '',
            'id' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-control__field ' . $attributes['input_size'] . '',
            'required' => $attributes['required'] ? 'required' : false,
        ];

        $label_attributes = [
            'class' => 'wpformbuilder-form-group__label'
        ];
        $group_attributes = [
            'class' => 'wpformbuilder-form-group ' . $attributes['id'],
            'data-field-label' => $label
        ];
        return "
            <div " . $this->get_render_attributes($group_attributes) . ">
                <label " . $this->get_render_attributes($label_attributes) . ">" . esc_html($label) . "</label>
                <div class='wpformbuilder-acceptance-field'>
                    <div class='wpformbuilder-form-control acceptance'>
                        <input " . $this->get_render_attributes($acceptance_attributes) . ">
                    </div>
                    <label for=" . esc_attr($acceptance_attributes['id']) . ">" . wp_kses_post($label_text) . "</label>
                </div>
            </div>
        ";
    }
}
