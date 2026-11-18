<?php

class SFBuilder_Pro_Ajax_Plugin_Config{
    public function __construct(){
        add_action( 'wp_ajax_sunformbuilder_pro_plugin_config', [$this, 'sunformbuilder_pro_plugin_config'] );
        add_action( 'wp_ajax_sunformbuilder_pro_control_ssl', [$this, 'sunformbuilder_pro_control_ssl'] );
    }
    public function sunformbuilder_pro_plugin_config(){
        if (isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'sunformbuilder_pro_nonce')) {
            $action = $_POST['s'];
            if($action == 'activate'){
                $this->sunformbuilder_pro_activate_license();
            }else{
                $this->sunformbuilder_pro_deactivate_license();
            }
        }else{
            echo "Nonce verification failed.";
        }
        
    }
    public function sunformbuilder_pro_activate_license(){
        $email = !empty($_POST['email']) ? $_POST['email'] : '';
        $password = !empty($_POST['password']) ? $_POST['password'] : '';
        $domain = preg_replace( '/^www\./', '', wp_parse_url( get_option('siteurl'), PHP_URL_HOST ) );
        $ssl = get_option( 'sun_ssl_plugin_config' );
        $ssl = $ssl === false || $ssl === 'no' ? true : false;
        $u = apply_filters(
            'sunformbuilder_pro_license_endpoint',
            'http://localhost/test_plugin/wp-json/license-active/v1/activate'
        );
        if(!empty($email) && !empty($password)){
            $data = [
                'method' => 'POST',
                'timeout'     => 45,
                'redirection' => 5,
                'sslverify'   => $ssl,
                'body' => [
                    'domain' => $domain,
                    'email' => $email,
                    'password' => $password,
                    'action'    => 'login',
                    'meta_data' => [
                        's_version' => defined('SFBUILDER_PRO') ? SFBUILDER_PRO : '',
                        'wp_version' => get_bloginfo( 'version' ),
                        'php_version' => PHP_VERSION
                    ]
                ],
            ];
            $response = wp_remote_post($u ,$data);
            $body = wp_remote_retrieve_body($response);
            if(is_wp_error($response)){
                $msg_err = $response->get_error_message();
                echo json_encode(['status' => 'error', 'msg_err' => "Can't connect to server."]);
            }elseif(is_wp_error($body)){
                $msg_err = $body->get_error_message();
                echo json_encode(['status' => 'error', 'msg_err' => "Can't retrieve license to server."]);
            }else{
                $license = json_decode($body);
                if($license->status == 'success'){
                    update_option('sun_activation_license_key', $license->license_key);
                    update_option('sun_plugin_features', json_encode($license->features));
                }
                echo $body;
            }
        }else{
            echo "Email and password can't empty.";
        }
        wp_die();
    }
    public function sunformbuilder_pro_deactivate_license(){
        delete_option('sun_activation_license_key');
        delete_option('sun_plugin_features');
        echo 200;
        wp_die();
    }
    public function sunformbuilder_pro_control_ssl(){
        if (isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'sunformbuilder_pro_nonce')) {
            $ssl = $_REQUEST['ssl'];
            if($ssl == 'true'){
                update_option( 'sunformbuilder_pro_ssl_plugin_config', 'yes' );
            }else{
                update_option( 'sunformbuilder_pro_ssl_plugin_config', 'no' );
            }
        }else{
            echo "Nonce verification failed.";
        }
        wp_die();
    }
}
new SFBuilder_Pro_Ajax_Plugin_Config();