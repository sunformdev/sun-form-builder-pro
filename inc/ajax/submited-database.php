<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SFBuilder_Pro_Form_Submissions{
    public function __construct(){
        add_action( 'wp_ajax_sunformbuilder_action_form_submissions', [$this, 'sunformbuilder_action_form_submissions'] );
    }
    public function sunformbuilder_action_form_submissions(){
        if (
            !isset($_POST['nonce'], $_POST['data'])
            || !is_array($_POST['data'])
            || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'sunformbuilder_pro_nonce')
        ) {
            wp_send_json_error(['message' => esc_html__('Nonce verification failed.', 'sunformbuilder-pro')]);
        }

        $data = map_deep(wp_unslash($_POST['data']), 'sanitize_text_field');

        if (!isset($data['post'], $data['action'])) {
            wp_send_json_error(['message' => esc_html__('Invalid request.', 'sunformbuilder-pro')]);
        }

        $posts = is_array($data['post']) ? array_map('absint', $data['post']) : absint($data['post']);
        $action = sanitize_key($data['action']);
        $submissions = !empty($data['submissions']) ? true : false;

        if($submissions){
            if($action == 'trash'){
                wp_trash_post($posts);
            }else if($action == 'delete'){
                wp_delete_post($posts, true);
            }else{
                wp_publish_post($posts);
            }
        }else{
            if(!empty($posts)){
                foreach($posts as $key => $value){
                    if($action == 'trash'){
                        wp_trash_post($value);
                    }else if($action == 'restore'){
                        wp_publish_post($value);
                    }else{
                        wp_delete_post($value, true);
                    }
                }
            }
        }

        $redirect_args = [
            'post_type' => 'sun_forms',
            'page'      => 'sunformbuilder_submissions',
        ];

        if (!empty($data['post_status']) && in_array($data['post_status'], ['publish', 'trash'], true)) {
            $redirect_args['post_status'] = $data['post_status'];
        } elseif (!empty($data['page_url'])) {
            $parsed_url = wp_parse_url($data['page_url']);
            if (!empty($parsed_url['query'])) {
                parse_str($parsed_url['query'], $query_args);
                if (!empty($query_args['post_status']) && in_array($query_args['post_status'], ['publish', 'trash'], true)) {
                    $redirect_args['post_status'] = sanitize_key($query_args['post_status']);
                }
            }
        }

        wp_send_json_success([
            'url' => add_query_arg($redirect_args, admin_url('edit.php')),
        ]);
    }
}
new SFBuilder_Pro_Form_Submissions();
