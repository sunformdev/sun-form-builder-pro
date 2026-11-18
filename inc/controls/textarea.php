<?php
if (!defined('ABSPATH')) {
    exit;
}
class SFBuilder_Pro_Textarea_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'textarea';
    }
    public function get_control_template($attributes)
    {
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $default_value = empty($attributes['default_value']) ? $attributes['default_value'] : '';
        $textarea_attributes = [
            'name' => !empty($attributes['name']) ? $attributes['name'] : '',
            'id' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-control__field ' . $attributes['input_size'] . '',
            'minlength' => !empty($attributes['min_length']) ? $attributes['min_length'] : '',
            'maxlength' => !empty($attributes['max_length']) ? $attributes['max_length'] : '',
            'autocomplete' => !empty($attributes['autocomplete']) ? $attributes['autocomplete'] : '',
            'rows' => !empty($attributes['rows']) ? $attributes['rows'] : '4',
            'required' => !empty($attributes['required']) ? 'required' : false
        ];

        $label_attributes = [
            'for' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-group__label'
        ];
        $group_attributes = [
            'class' => 'wpformbuilder-form-group ' . $attributes['id'],
            'data-field-label' => $label,
            'data-required-message' => !empty($attributes['required_message']) ? $attributes['required_message'] : 'This field is required.',
            // Store messages on wrapper (submit.js will hydrate to input for inline validation)
            'data-msg-required' => !empty($attributes['required_message']) ? $attributes['required_message'] : 'This field is required.',
            'data-msg-minlength' => !empty($attributes['min_length_error_message']) ? $attributes['min_length_error_message'] : 'Please enter at least {0} characters.',
            'data-msg-maxlength' => !empty($attributes['max_length_error_message']) ? $attributes['max_length_error_message'] : 'Please enter no more than {0} characters.'
        ];

        return "
            <div " . $this->get_render_attributes($group_attributes) . ">
                <label " . $this->get_render_attributes($label_attributes) . ">" . esc_html($label) . "</label>
                <div class='wpformbuilder-form-control textarea'>
                    <textarea " . $this->get_render_attributes($textarea_attributes) . ">" . esc_textarea($default_value) . "</textarea>
                </div>
            </div>
        ";
    }
}
