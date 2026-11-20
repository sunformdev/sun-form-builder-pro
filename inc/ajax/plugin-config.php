<?php

function sunformbuilder_pro_license_api_url($action)
{
    $activate = apply_filters(
        'sunformbuilder_pro_license_endpoint',
        'http://localhost/wpformbuilder/wp-json/license-active/v1/activate'
    );
    $base = preg_replace('#/activate/?$#', '', untrailingslashit((string) $activate));
    return $base . '/' . rawurlencode((string) $action);
}

function sunformbuilder_pro_current_domain()
{
    $url = home_url('/');
    $host = strtolower((string) wp_parse_url($url, PHP_URL_HOST));
    $port = wp_parse_url($url, PHP_URL_PORT);
    $path = trim((string) wp_parse_url($url, PHP_URL_PATH), '/');
    $domain = $host;
    if ($port) {
        $domain .= ':' . (int) $port;
    }
    if ($path !== '') {
        $domain .= '/' . $path;
    }
    return $domain;
}

function sunformbuilder_pro_license_request($action, array $extra = [])
{
    $ssl_disabled = get_option('sunformbuilder_pro_ssl_plugin_config');
    $body = array_merge([
        'domain' => sunformbuilder_pro_current_domain(),
        'meta_data' => [
            's_version' => defined('SFBUILDER_PRO') ? SFBUILDER_PRO : '',
            'wp_version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
        ],
    ], $extra);

    $response = wp_remote_post(sunformbuilder_pro_license_api_url($action), [
        'timeout' => 20,
        'redirection' => 5,
        'sslverify' => $ssl_disabled !== 'yes',
        'body' => $body,
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('license_http', "Can't connect to server.");
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($data)) {
        return new WP_Error('license_http', "Can't retrieve license from server.");
    }
    $data['http_status'] = (int) wp_remote_retrieve_response_code($response);
    return $data;
}

function sunformbuilder_pro_store_license(array $data)
{
    update_option('sun_activation_license_key', sanitize_text_field((string) ($data['license_key'] ?? '')));
    update_option('sun_activation_domain', sanitize_text_field((string) ($data['domain'] ?? sunformbuilder_pro_current_domain())));
    update_option('sun_activation_sites_used', absint($data['sites_used'] ?? 0));
    update_option('sun_activation_sites_limit', absint($data['sites_limit'] ?? 0));
    update_option('sun_activation_sites_label', sanitize_text_field((string) ($data['sites_label'] ?? '')));
    if (isset($data['features'])) {
        update_option('sun_plugin_features', wp_json_encode($data['features']));
    }
}

function sunformbuilder_pro_clear_license()
{
    delete_option('sun_activation_license_key');
    delete_option('sun_activation_domain');
    delete_option('sun_activation_sites_used');
    delete_option('sun_activation_sites_limit');
    delete_option('sun_activation_sites_label');
    delete_option('sun_plugin_features');
}

function sunformbuilder_pro_refresh_license_status()
{
    $key = (string) get_option('sun_activation_license_key', '');
    if ($key === '') {
        return null;
    }

    $data = sunformbuilder_pro_license_request('status', ['license_key' => $key]);
    if (is_wp_error($data)) {
        return $data;
    }
    if (($data['status'] ?? '') === 'success') {
        sunformbuilder_pro_store_license($data);
        return $data;
    }

    sunformbuilder_pro_clear_license();
    return new WP_Error(
        'license_inactive',
        (string) ($data['msg_err'] ?? 'This site is no longer activated.')
    );
}

class SFBuilder_Pro_Ajax_Plugin_Config
{
    public function __construct()
    {
        add_action('wp_ajax_sunformbuilder_pro_plugin_config', [$this, 'sunformbuilder_pro_plugin_config']);
        add_action('wp_ajax_sunformbuilder_pro_control_ssl', [$this, 'sunformbuilder_pro_control_ssl']);
    }

    private function verified_request()
    {
        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
        if ($nonce === '' || !wp_verify_nonce($nonce, 'sunformbuilder_pro_nonce')) {
            wp_send_json(['status' => 'error', 'msg_err' => 'Nonce verification failed.']);
        }
        if (!current_user_can('manage_options')) {
            wp_send_json(['status' => 'error', 'msg_err' => 'You are not allowed to manage this license.']);
        }
    }

    public function sunformbuilder_pro_plugin_config()
    {
        $this->verified_request();
        $action = isset($_POST['s']) ? sanitize_text_field(wp_unslash($_POST['s'])) : '';
        if ($action === 'activate') {
            $this->sunformbuilder_pro_activate_license();
        }
        $this->sunformbuilder_pro_deactivate_license();
    }

    public function sunformbuilder_pro_activate_license()
    {
        $license_key = isset($_POST['license_key']) ? sanitize_text_field(wp_unslash($_POST['license_key'])) : '';
        if ($license_key === '') {
            wp_send_json(['status' => 'error', 'msg_err' => 'Enter a license key.']);
        }

        $data = sunformbuilder_pro_license_request('activate', ['license_key' => $license_key]);
        if (is_wp_error($data)) {
            wp_send_json(['status' => 'error', 'msg_err' => $data->get_error_message()]);
        }
        if (($data['status'] ?? '') === 'success') {
            sunformbuilder_pro_store_license($data);
        }
        unset($data['http_status']);
        wp_send_json($data);
    }

    public function sunformbuilder_pro_deactivate_license()
    {
        $license_key = (string) get_option('sun_activation_license_key', '');
        if ($license_key === '') {
            sunformbuilder_pro_clear_license();
            wp_send_json(['status' => 'success']);
        }

        $data = sunformbuilder_pro_license_request('deactivate', ['license_key' => $license_key]);
        if (is_wp_error($data)) {
            wp_send_json(['status' => 'error', 'msg_err' => $data->get_error_message()]);
        }

        $http_status = (int) ($data['http_status'] ?? 0);
        unset($data['http_status']);
        if (($data['status'] ?? '') === 'success' || in_array($http_status, [403, 404], true)) {
            sunformbuilder_pro_clear_license();
            $data['status'] = 'success';
        }
        wp_send_json($data);
    }

    public function sunformbuilder_pro_control_ssl()
    {
        $this->verified_request();
        $ssl = isset($_POST['ssl']) ? sanitize_text_field(wp_unslash($_POST['ssl'])) : '';
        update_option('sunformbuilder_pro_ssl_plugin_config', $ssl === 'true' ? 'yes' : 'no');
        wp_send_json(['status' => 'success']);
    }
}
new SFBuilder_Pro_Ajax_Plugin_Config();
