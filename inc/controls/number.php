<?php
if (!defined('ABSPATH')) {
    exit;
}
class SFBuilder_Pro_Number_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'number';
    }
    public function get_control_template($attributes)
    {
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $number_attributes = [
            'type' => 'number',
            'name' => !empty($attributes['name']) ? $attributes['name'] : '',
            'value' => !empty($attributes['default_value']) ? $attributes['default_value'] : '',
            'id' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-control__field ' . $attributes['input_size'] . '',
            'min' => !empty($attributes['min']) ? $attributes['min'] : '',
            'max' => !empty($attributes['max']) ? $attributes['max'] : '',
            'step' => !empty($attributes['step']) ? $attributes['step'] : '',
            'autocomplete' => !empty($attributes['autocomplete']) ? $attributes['autocomplete'] : '',
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
            'data-msg-number' => !empty($attributes['number_error_message']) ? $attributes['number_error_message'] : 'Please enter a valid number.',
        ];
        
        return "
            <div " . $this->get_render_attributes($group_attributes) . ">
                <label " . $this->get_render_attributes($label_attributes) . ">" . esc_html($label) . "</label>
                <div class='wpformbuilder-form-control number'>
                    <input " . $this->get_render_attributes($number_attributes) . ">
                </div>
            </div>
        ";
    }

}