<?php
if (!defined('ABSPATH')) {
    exit;
}
class SFBuilder_Pro_Image_Upload_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'image_upload';
    }
    public function get_control_template($attributes)
    {
        wp_enqueue_script('wpformbuilder-image-upload-js');
        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $preview_width = !empty($attributes['preview_width']) ? $attributes['preview_width'] : 100;
        $preview_height = !empty($attributes['preview_height']) ? $attributes['preview_height'] : 100;
        // NOTE: preview_width/height có thể là string; ép numeric an toàn.
        $image_placeholder_width = (int) ceil(((float) $preview_width) / 2);
        $image_placeholder_height = (int) ceil(((float) $preview_height) / 2);

        $image_upload_attributes = [
            'type' => 'file',
            'name' => !empty($attributes['name']) ? $attributes['name'] . '[]' : '',
            'id' => !empty($attributes['id']) ? $attributes['id'] : '',
            'class' => 'wpformbuilder-form-control__field',
            'accept' => !empty($attributes['file_accept']) ? $attributes['file_accept'] : '',
            'multiple' => !empty($attributes['multiple']) ? $attributes['multiple'] : false,
            'required' => $attributes['required'] ? 'required' : false,
            'style' => 'display: none;'
        ];

        $image_upload_options = [
            'maxSize' => !empty($attributes['max_size']) ? $attributes['max_size'] : 5,
            'multiple' => !empty($attributes['multiple']) ? $attributes['multiple'] : false,
            'errorMsg' => !empty($attributes['error_msg']) ? $attributes['error_msg'] : 'An error occurred.',
            'errorType' => !empty($attributes['error_type']) ? $attributes['error_type'] : 'Invalid format.',
            'errorMaxSize' => !empty($attributes['error_max_size']) ? $attributes['error_max_size'] : 'File size exceeds maximum limit.',
            'errorMinFiles' => !empty($attributes['error_min_files']) ? $attributes['error_min_files'] : 'Please upload at least {min} files.',
            'errorMaxFiles' => !empty($attributes['error_max_files']) ? $attributes['error_max_files'] : 'You can only upload a maximum of {max} files.',
            'previewWidth' => $preview_width,
            'previewHeight' => $preview_height,
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
                <div class='wpformbuilder-form-control image-upload wpformbuilder-image-upload' data-image-upload-options='" . esc_attr(json_encode($image_upload_options)) . "'>
                    <input " . $this->get_render_attributes($image_upload_attributes) . ">
                    <div class='wpformbuilder-image-upload-preview icon' data-preview-width='" . esc_attr($preview_width) . "' data-preview-height='" . esc_attr($preview_height) . "'>
                        <label class='wpformbuilder-image-upload-label' for='" . esc_attr($image_upload_attributes['id']) . "' style='width: " . esc_attr($preview_width) . "px; height: " . esc_attr($preview_height) . "px;'>
                            <img class='wpformbuilder-image-upload-icon' width='" . esc_attr($image_placeholder_width) . "' height='" . esc_attr($image_placeholder_height) . "' srcSet='" . esc_url(plugin_dir_url(__FILE__)) . "../../assets/images/image_add.png' src='" . esc_url(plugin_dir_url(__FILE__)) . "../../assets/images/image_add.png' />
                        </label>
                    </div>
                    <div class='wpformbuilder-form-notification-upload'></div>
                </div>
            </div>";
    }
}