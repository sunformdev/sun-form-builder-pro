<?php
if (!defined('ABSPATH')) {
    exit;
}
class SFBuilder_Pro_File_Upload_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'file_upload';
    }
    public function get_control_template($attributes)
    {
        wp_enqueue_script('wpformbuilder-file-upload-js');
        $label_upload = !empty($attributes['label_upload']) ? $attributes['label_upload'] : 'Choose File';
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $file_upload_attributes = [
            'type' => 'file',
            'name' => !empty($attributes['name']) ? $attributes['name'] . '[]' : '',
            'id' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-control__field wpformbuilder-file-upload',
            'accept' => !empty($attributes['file_accept']) ? $attributes['file_accept'] : '',
            'multiple' => !empty($attributes['multiple']) ? $attributes['multiple'] : false,
            'required' => $attributes['required'] ? 'required' : false,
            'style' => 'display: none;'
        ];

        $file_upload_options = [
            'maxSize' => !empty($attributes['max_size']) ? $attributes['max_size'] : 5,
            'multiple' => !empty($attributes['multiple']) ? $attributes['multiple'] : false,
            'errorMsg' => !empty($attributes['error_msg']) ? $attributes['error_msg'] : 'An error occurred.',
            'errorType' => !empty($attributes['error_type']) ? $attributes['error_type'] : 'Invalid format.',
            'errorMaxSize' => !empty($attributes['error_max_size']) ? $attributes['error_max_size'] : 'File size exceeds maximum limit.',
            'errorMinFiles' => !empty($attributes['error_min_files']) ? $attributes['error_min_files'] : 'Please upload at least {min} files.',
            'errorMaxFiles' => !empty($attributes['error_max_files']) ? $attributes['error_max_files'] : 'You can only upload a maximum of {max} files.',
            'previewWidth' => !empty($attributes['preview_width']) ? $attributes['preview_width'] : 100,
            'previewHeight' => !empty($attributes['preview_height']) ? $attributes['preview_height'] : 100,
            'filesLimit' => !empty($attributes['files_limit']) ? $attributes['files_limit'] : false,
            'maxFiles' => !empty($attributes['max_files']) ? $attributes['max_files'] : '',
            'minFiles' => !empty($attributes['min_files']) ? $attributes['min_files'] : '',
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
                <div class='wpformbuilder-form-control file-upload' data-file-upload-options='" . esc_attr(json_encode($file_upload_options)) . "'>
                    <input " . $this->get_render_attributes($file_upload_attributes) . ">
                    <label for=" . esc_attr($file_upload_attributes['id']) . " class='wpformbuilder-button-file-upload'>" . esc_html($label_upload) . "</label>
                    <div class='wpformbuilder-file-upload-preview " . esc_attr($attributes['layout']) . "' data-layout='" . esc_attr($attributes['layout']) . "' data-preview-width='" . esc_attr($attributes['preview_width']) . "' data-preview-height='" . esc_attr($attributes['preview_height']) . "'></div>
                    <div class='wpformbuilder-form-notification-upload'></div>
                </div>
            </div>
        ";
    }

}