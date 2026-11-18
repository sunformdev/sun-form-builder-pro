<?php
if (!defined('ABSPATH')) {
    exit;
}

class SFBuilder_Pro_Checkbox_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'checkbox';
    }

    public function get_control_template($attributes)
    {
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $checkboxes = $attributes['options'] ?? [];
        $default_value = !empty($attributes['default_value']) ? $attributes['default_value'] : '';
        $selected = array_map('trim', explode(',', $default_value));
        $parent_tag = !empty($attributes['use_fieldset']) ? 'fieldset' : 'div';
        $label_tag = !empty($attributes['use_fieldset']) ? 'legend' : 'label';
        $required = !empty($attributes['required']) ? true : false;

        $checkbox_attributes = [
            'type' => 'checkbox',
            'name' => !empty($attributes['name']) ? $attributes['name'] . '[]' : '',
            'id' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-control__field ' . (!empty($attributes['input_size']) ? $attributes['input_size'] : ''),
        ];

        $label_attributes = [
            'class' => 'wpformbuilder-form-group__label'
        ];

        $group_attributes = [
            'class' => 'wpformbuilder-form-group ' . (!empty($attributes['id']) ? $attributes['id'] : ''),
            'data-field-label' => $label,
            'data-required'      => $required,
            'data-type'          => $this->get_type(),
            'data-required-message' => !empty($attributes['required_message']) ? $attributes['required_message'] : 'This field is required.',
        ];

        return "
            <$parent_tag " . $this->get_render_attributes($group_attributes) . ">
                <$label_tag " . $this->get_render_attributes($label_attributes) . ">" . esc_html($label) . "</$label_tag>
                <div class='wpformbuilder-form-control checkbox'>
                    " . $this->render_checkbox_items($checkboxes, $selected, $checkbox_attributes) . "
                </div>
                <div class='wpformbuilder-form-group__required' style='display: none;'>This field is required</div>
            </$parent_tag>
        ";
    }

    public function render_checkbox_items($checkboxes, $selected, $attributes)
    {
        $html = '';
        $i = 1;

        foreach ($checkboxes as $option) {
            // Mỗi option phải có label + value
            $opt_label = isset($option['label']) ? $option['label'] : '';
            $opt_value = isset($option['value']) ? $option['value'] : '';

            $checkbox_item_attribute = $attributes;
            $checkbox_item_attribute['id'] = $attributes['id'] . '-' . $i;
            $checkbox_item_attribute['value'] = $opt_value;

            $checked = in_array($opt_value, $selected, true) ? ' checked' : '';

            $html .= '
                <div class="wpformbuilder-checkbox-item">
                    <div class="wpformbuilder-checkbox-item__input">
                        <input ' . $this->get_render_attributes($checkbox_item_attribute) . $checked . '>
                    </div>
                    <label for="' . esc_attr($checkbox_item_attribute['id']) . '">' . esc_html($opt_label) . '</label>
                </div>
            ';

            $i++;
        }

        return $html;
    }
}
