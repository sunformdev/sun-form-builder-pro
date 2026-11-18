<?php
if (!defined('ABSPATH')) {
    exit;
}
class SFBuilder_Pro_Select_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'select';
    }
    public function get_control_template($attributes)
    {
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $options = $attributes['options'] ?? [];
        $default_value = !empty($attributes['default_value']) ? $attributes['default_value'] : '';
        $select_attributes = [
            'name' => !empty($attributes['name']) ? $attributes['name'] : '',
            'id' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-control__field ' . $attributes['input_size'] . '',
            'required' => !empty($attributes['required']) ? 'required' : false,
            'multiple' => !empty($attributes['multiple']) ? 'multiple' : false
        ];

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
                <div class='wpformbuilder-form-control select'>
                    <select " . $this->get_render_attributes($select_attributes) . ">
                    " . $this->render_options_select($options, $default_value) . "
                    </select>
                </div>
            </div>
        ";
    }

    public function render_options_select($options, $default_value)
    {
        $html = '';
        $selected = explode(',', str_replace(' ', '', $default_value));
        foreach ($options as $key => $item) {
            if (in_array($item['value'], $selected)) {
                $html .= '<option value="' . esc_attr($item['value']) . '" selected>' . esc_html($item['label']) . '</option>';
            } else {
                $html .= '<option value="' . esc_attr($item['value']) . '">' . esc_html($item['label']) . '</option>';
            }
        }
        return $html;
    }
}