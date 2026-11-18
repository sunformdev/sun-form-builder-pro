<?php
if (!defined('ABSPATH')) {
    exit;
}

class SFBuilder_Pro_Radio_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'radio';
    }

    public function get_control_template($attributes)
    {
        $label          = !empty($attributes['label']) ? $attributes['label'] : '';
        $radios         = $attributes['options'] ?? [];
        $default_value  = !empty($attributes['default_value']) ? $attributes['default_value'] : '';
        $parent_tag = !empty($attributes['use_fieldset']) ? 'fieldset' : 'div';
        $label_tag = !empty($attributes['use_fieldset']) ? 'legend' : 'label';
        $required = !empty($attributes['required']) ? true : false;

        $radio_attributes = [
            'type'     => 'radio',
            'name'     => !empty($attributes['name']) ? $attributes['name'] : '',
            'id'       => !empty($attributes['id']) ? $attributes['id'] : '',
            'class'    => 'wpformbuilder-form-control__field ' . (!empty($attributes['input_size']) ? $attributes['input_size'] : ''),
        ];

        $label_attributes = [
            'class' => 'wpformbuilder-form-group__label'
        ];

        $group_attributes = [
            'class'             => 'wpformbuilder-form-group ' . (!empty($attributes['id']) ? $attributes['id'] : ''),
            'data-field-label'  => $label,
            'data-required'      => $required,
            'data-type'          => $this->get_type(),
            'data-required-message' => !empty($attributes['required_message']) ? $attributes['required_message'] : 'This field is required.',
        ];

        return "
            <$parent_tag " . $this->get_render_attributes($group_attributes) . ">
                <$label_tag " . $this->get_render_attributes($label_attributes) . ">" . esc_html($label) . "</$label_tag>
                <div class='wpformbuilder-form-control radio'>
                    " . $this->render_radio_items($radios, $default_value, $radio_attributes) . "
                </div>
                <div class='wpformbuilder-form-group__required' style='display: none;'>This field is required</div>
            </$parent_tag>
        ";
    }

    public function render_radio_items($radios, $default_value, $attributes)
    {
        $html = '';
        $i = 1;

        foreach ($radios as $option) {
            $opt_label = isset($option['label']) ? $option['label'] : '';
            $opt_value = isset($option['value']) ? $option['value'] : '';

            $radio_item_attribute = $attributes;
            $radio_item_attribute['id']    = $attributes['id'] . '-' . $i;
            $radio_item_attribute['value'] = $opt_value;

            // Chỉ để required cho radio đầu tiên
            if ($i !== 1 && isset($radio_item_attribute['required'])) {
                unset($radio_item_attribute['required']);
            }

            $checked = ($default_value === $opt_value) ? ' checked' : '';

            $html .= '
                <div class="wpformbuilder-radio-item">
                    <div class="wpformbuilder-radio-item__input">
                        <input ' . $this->get_render_attributes($radio_item_attribute) . $checked . '>
                    </div>
                    <label for="' . esc_attr($radio_item_attribute['id']) . '">' . esc_html($opt_label) . '</label>
                </div>
            ';

            $i++;
        }

        return $html;
    }
}