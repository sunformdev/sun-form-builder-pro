<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SFBuilder_Pro_Ajax_Plugin_Control
{
    public function __construct()
    {
        add_action('wp_ajax_sunformbuilder_plugin_save_options', [$this, 'sunformbuilder_plugin_save_options']);
    }

    /**
     * Plugin settings option names allowed to be updated via AJAX.
     *
     * Must stay in sync with register_setting() in sunformbuilder_pro_key_settings().
     *
     * @return string[]
     */
    private function sunformbuilder_get_allowed_save_options()
    {
        return [
            'sunformbuilder_mailchimp_api_key',
            'sunformbuilder_activecampaign_api_url',
            'sunformbuilder_activecampaign_api_key',
            'sunformbuilder_brevo_api_key',
            'sunformbuilder_sendfox_access_token',
            'sunformbuilder_mailerlite_api_token',
            'sunformbuilder_zoho_domain',
            'sunformbuilder_zohocrm_client_id',
            'sunformbuilder_zohocrm_client_secret',
            'sunformbuilder_constantcontact_api_key',
            'sunformbuilder_constantcontact_secret_key',
            'sunformbuilder_recaptcha_v3_site_key',
            'sunformbuilder_recaptcha_v3_secret_key',
            'sunformbuilder_recaptcha_v2_site_key',
            'sunformbuilder_recaptcha_v2_secret_key',
            'sunformbuilder_google_sheets_client_id',
            'sunformbuilder_google_sheets_client_secret',
            'sunformbuilder_stripe_publishable_key',
            'sunformbuilder_stripe_secret_key',
        ];
    }

    /**
     * @return string[]
     */
    private function sunformbuilder_get_allowed_zoho_domains()
    {
        return [
            'accounts.zoho.com',
            'accounts.zoho.com.au',
            'accounts.zoho.eu',
            'accounts.zoho.in',
            'accounts.zoho.com.cn',
        ];
    }

    public function sunformbuilder_plugin_save_options()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => esc_html__('Insufficient permissions.', 'sunformbuilder-pro')]);
        }

        if (
            !isset($_POST['nonce'])
            || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'sunformbuilder_pro_nonce')
        ) {
            wp_send_json_error(['message' => esc_html__('Nonce verification failed.', 'sunformbuilder-pro')]);
        }

        if (!isset($_POST['data']) || !is_array($_POST['data'])) {
            wp_send_json_error(['message' => esc_html__('Invalid request.', 'sunformbuilder-pro')]);
        }

        $allowed_options = $this->sunformbuilder_get_allowed_save_options();
        $zoho_auth_options = [
            'sunformbuilder_zoho_domain',
            'sunformbuilder_zohocrm_client_id',
            'sunformbuilder_zohocrm_client_secret',
        ];
        $response_url = false;
        $data = wp_unslash($_POST['data']);

        foreach ($data as $option) {
            if (!is_array($option)) {
                continue;
            }

            $name = isset($option['name']) ? sanitize_text_field($option['name']) : '';
            if ($name === '' || !in_array($name, $allowed_options, true)) {
                continue;
            }

            $value = isset($option['value']) ? sanitize_text_field($option['value']) : '';

            if ($name === 'sunformbuilder_zoho_domain' && !in_array($value, $this->sunformbuilder_get_allowed_zoho_domains(), true)) {
                continue;
            }

            update_option($name, $value);

            if (in_array($name, $zoho_auth_options, true)) {
                $response_url = true;
            }
        }

        if ($response_url) {
            $domain = get_option('sunformbuilder_zoho_domain');
            $client_id = get_option('sunformbuilder_zohocrm_client_id');
            $client_secret = get_option('sunformbuilder_zohocrm_client_secret');
            $redirect = admin_url('admin.php?page=sunformbuilder_settings');
            if (!empty($domain) && !empty($client_id) && !empty($client_secret)) {
                $response_auth = 'https://' . $domain . '/oauth/v2/auth?scope=ZohoCRM.modules.all,ZohoCRM.settings.all&client_id=' . rawurlencode($client_id) . '&response_type=code&access_type=offline&redirect_uri=' . rawurlencode($redirect);
                wp_send_json_success(['url' => $response_auth]);
            }

            wp_send_json_success(['url' => false, 'message' => esc_html__('Options saved successfully.', 'sunformbuilder-pro')]);
        }

        wp_send_json_success(['message' => esc_html__('Options saved successfully.', 'sunformbuilder-pro')]);
    }
}
new SFBuilder_Pro_Ajax_Plugin_Control();
