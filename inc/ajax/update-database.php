<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SFBuilder_Pro_Ajax_Update_Database_Submissions extends SFBuilder_Pro_Helper
{
    public function __construct()
    {
        parent::__construct();
        add_action('wp_ajax_sunformbuilder_update_database', [$this,'sunformbuilder_update_database']);
    }
    public function sunformbuilder_update_database()
    {
        if (
            isset($_POST['nonce'], $_POST['data'])
            && is_array($_POST['data'])
            && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'sunformbuilder_pro_nonce')
        ) {
            $data = map_deep(wp_unslash($_POST['data']), 'sanitize_text_field');
            if (!isset($data['post_id'])) {
                echo esc_html__('Invalid request.', 'sunformbuilder-pro');
                wp_die();
            }
            $data['post_id'] = absint($data['post_id']);
            $name = array_keys($data)[0];
            $post = get_post($data['post_id']);
            $content = $this->sfbuilder_pro_decode_submission_json($post->post_content);
            if (is_array($content->$name)) {
                $key = isset($data['repeater_key']) ? absint($data['repeater_key']) : 0;
                if (!empty($content->$name[$key]->value) && is_array($content->$name[$key]->value)) {
                    $new_content_arr = [];
                    $new_value = array_values($data['repeater']);
                    $labels = $content->$name[$key]->label;
                    foreach ($new_value as $k => $val) {
                        if (!is_array($val)) {
                            $string = !empty($labels[$k]) ? '<span style="font-weight:700;">' . esc_html($labels[$k]) . ':&#160;</span>' . esc_html($val) : esc_html($val);
                            array_push($new_content_arr, $string);
                        } else {
                            $data['repeater'][$k] = implode(',', $val);
                        }

                    }
                    $new_content = implode('<br>', $new_content_arr);
                    $content->$name[$key]->content = $new_content;
                    $content->$name[$key]->value = array_values($data['repeater']);
                    echo wp_json_encode($content->$name[$key]);
                }
            } else {
                $content->$name->value = $data[$name];
            }
            $post->post_content = $this->sfbuilder_pro_encode_submission_json($content);
            $post_id_update = wp_update_post($post);
            echo $post_id_update ? esc_html($post_id_update) : esc_html__("Update failed.", "sunformbuilder-pro");
        } else {
            echo esc_html__("Nonce verification failed.", "sunformbuilder-pro");
        }
        wp_die();
    }
}
new SFBuilder_Pro_Ajax_Update_Database_Submissions();