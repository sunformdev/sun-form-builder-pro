<?php
if (!defined('ABSPATH')) {
    exit;
}
class SFBuilder_Pro_Date_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'date';
    }
    public function get_control_template($attributes)
    {
        wp_enqueue_script('wpformbuilder-date-field-js');
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $custom_options = !empty($attributes['flatpickr_custom_options']) ? true : false;
        if($custom_options){
            $flatpickr_options_raw = !empty($attributes['flatpickr_options_raw']) ? $attributes['flatpickr_options_raw'] : '';
            $flatpickr_options_raw = str_replace(["\r\n", "\r", "\n"], ' ', $flatpickr_options_raw);
            $flatpickr_options_raw = preg_replace('/\s+/', ' ', trim($flatpickr_options_raw));
            $flatpickr_options = $attributes['flatpickr_options'] ?? [];
        }else{
            $flatpickr_options_raw = '';
            $flatpickr_options = [
                'dateFormat' => $attributes['date_format'],
                'allowInput' => true,
            ];
            if (!empty($attributes['min_date'])) {
                $flatpickr_options['minDate'] = $attributes['min_date'];
            }
            if (!empty($attributes['max_date'])) {
                $flatpickr_options['maxDate'] = $attributes['max_date'];
            }
            if (!empty($attributes['date_language'])) {
                $flatpickr_options['locale'] = $attributes['date_language'];
            }
            if (!empty($attributes['default_date'])) {
                $flatpickr_options['defaultDate'] = $attributes['default_date'];
            }
        }
        $date_attributes = [
            'type' => 'text',
            'name' => !empty($attributes['name']) ? $attributes['name'] : '',
            'id' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-control__field date ' . $attributes['input_size'] . '',
            'required' => $attributes['required'] ? 'required' : false,
            'placeholder' => $attributes['placeholder'],
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
                <div class='wpformbuilder-form-control date' data-flatpickr-options='" . json_encode($flatpickr_options) . "' data-flatpickr-options-raw='" . esc_attr($flatpickr_options_raw) . "' data-date-language='" . esc_attr($attributes['date_language']) . "'>
                    <input " . $this->get_render_attributes($date_attributes) . ">
                </div>
            </div>
        ";
    }

}