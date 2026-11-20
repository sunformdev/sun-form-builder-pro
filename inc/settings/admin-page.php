<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SFBuilder_Pro_Admin_Settings
{
    public static function sunformbuilder_admin_notice_success($msg)
    {
?>
        <div class="notice notice-success is-dismissible">
            <p><?php echo esc_html($msg); ?></p>
        </div>
        <?php
        add_action('admin_notices', 'sunformbuilder_admin_notice_success');
    }

    public static function sunformbuilder_admin_notice_error($msg)
    {
        $class = 'notice notice-error';
        printf(
            '<div class="%1$s"><p>%2$s</p></div>',
            esc_attr($class),
            esc_html($msg)
        );
        add_action('admin_notices', 'sunformbuilder_admin_notice_error');
    }

    public function sunformbuilder_generate_html_api_input($key, $name, $payment = false)
    {
        ob_start();

        $loading_icon = plugin_dir_url(__FILE__) . '../../assets/images/loading.gif';
        $preview_key = $this->sunformbuilder_hide_api_key($key, $payment);
        $input_name = $name;

        if (!empty($key)) {
        ?>
            <div style="display:flex;">
                <input type="text" class="regular-text wpformbuilder-preview-key" value="<?php echo esc_attr($preview_key); ?>"
                    disabled />
                <input type="hidden" class="regular-text wpformbuilder-hidden-key" value=""
                    name="<?php echo esc_attr($input_name); ?>" />
                <button type="button" class="wpformbuilder-api-save has-preview" data-name="<?php echo esc_attr($input_name); ?>"
                    style="display:none;">
                    <img class="wpformbuilder-loading-icon-save-options" src="<?php echo esc_url($loading_icon); ?>"
                        alt="Loading" />Save
                </button>
                <button type="button" class="wpformbuilder-api-change">Change</button>
                <button type="button" class="wpformbuilder-api-cancel" style="display:none;">Cancel</button>
                <div class="wpformbuilder-notification-save-settings"><?php esc_html_e('Settings Saved.', 'sunformbuilder-pro'); ?>
                </div>
            </div>
        <?php
        } else {
        ?>
            <input type="text" class="regular-text" name="<?php echo esc_attr($input_name); ?>" value="" />
            <button type="button" class="wpformbuilder-api-save" data-name="<?php echo esc_attr($input_name); ?>">
                <img class="wpformbuilder-loading-icon-save-options" src="<?php echo esc_url($loading_icon); ?>"
                    alt="Loading" />Save
            </button>
            <div class="wpformbuilder-notification-save-settings"><?php esc_html_e('Settings Saved.', 'sunformbuilder-pro'); ?></div>
<?php
        }

        return ob_get_clean();
    }
    public function sunformbuilder_hide_api_key($key, $payment = false)
    {
        if (!empty($key) || $key != false) {
            if ($payment) {
                return substr($key, 0, 10) . '******************' . substr($key, -5);
            } else {
                return '****************************' . substr($key, -5);
            }
        }
        return '';
    }
}
$sfbuilder_admin_setting = new SFBuilder_Pro_Admin_Settings();
$sfbuilder_ssl_is_checked = get_option('sunformbuilder_pro_ssl_plugin_config');
$sfbuilder_ssl_is_checked = $sfbuilder_ssl_is_checked === false || $sfbuilder_ssl_is_checked === 'no' ? '' : 'checked';
?>
<!-- Teamplate -->
<div class="wrap">
    <h2>Settings</h2>
    <?php
    // Read-only flag appended by options.php after a verified settings save.
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if (isset($_GET['settings-updated'])) { ?>
        <div id="message" class="updated">
            <p><strong>
                    <?php esc_html_e('Settings saved.', 'sunformbuilder-pro') ?>
                </strong></p>
        </div>
    <?php } ?>
    <div class="wpformbuilder-admin-tab-container">
        <ul class="wpformbuilder-admin-tab-heading">
            <li><a data-tab="api-setting">Integrations</a></li>
            <li><a data-tab="payment-setting">Payment Integrations</a></li>
            <li><a data-tab="license-setting">Licenses</a></li>
        </ul>
        <div class="wpformbuilder-admin-tab-content">
            <form method="post" action="options.php">
                <?php
                settings_fields('sunformbuilder_admin_settings');
                do_settings_sections('sunformbuilder_admin_settings');
                ?>
                <div class="wpformbuilder-admin-tab-content_item api-settings active" data-tab-item="api-setting">
                    <div class="wpformbuilder-admin-tab-api__inner">
                        <div class="wpformbuilder-admin-tab-api-content">
                            <!-- Mailchimp -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table"
                                data-api-name="mailchimp">
                                <?php
                                $sfbuilder_mailchimp_api_key = esc_attr(get_option('sunformbuilder_mailchimp_api_key'));
                                ?>
                                <h4 class="payment-title">Mailchimp</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">API Key</th>
                                        <td>

                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_mailchimp_api_key, 'sunformbuilder_mailchimp_api_key');
                                            ?>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <!-- Activecampaign -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table"
                                data-api-name="activecampaign">
                                <?php
                                $sfbuilder_activecampaign_api_url = esc_attr(get_option('sunformbuilder_activecampaign_api_url'));
                                $sfbuilder_activecampaign_api_key = esc_attr(get_option('sunformbuilder_activecampaign_api_key'));
                                ?>
                                <h4 class="payment-title">Activecampaign</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">API URL</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_activecampaign_api_url, 'sunformbuilder_activecampaign_api_url');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">API Key</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_activecampaign_api_key, 'sunformbuilder_activecampaign_api_key');
                                            ?>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <!-- reCAPTCHA v2 -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table"
                                data-api-name="recaptcha-v2">
                                <?php
                                $sfbuilder_recaptcha_v2_site_key = esc_attr(get_option('sunformbuilder_recaptcha_v2_site_key'));
                                $sfbuilder_recaptcha_v2_secret_key = esc_attr(get_option('sunformbuilder_recaptcha_v2_secret_key'));
                                ?>
                                <h4 class="payment-title">Google reCAPTCHA (v2)</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">Site Key</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_recaptcha_v2_site_key, 'sunformbuilder_recaptcha_v2_site_key');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Secret Key</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_recaptcha_v2_secret_key, 'sunformbuilder_recaptcha_v2_secret_key');
                                            ?>
                                            <a style="display:block; margin-top:10px;" class="wpformbuilder-zoho-helper" target="_blank"
                                                href="https://www.google.com/recaptcha/admin/create">How to generate a Site Key and Secret Key</a>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <!-- reCAPTCHA v3 -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table"
                                data-api-name="recaptcha-v3">
                                <?php
                                $sfbuilder_recaptcha_v3_site_key = esc_attr(get_option('sunformbuilder_recaptcha_v3_site_key'));
                                $sfbuilder_recaptcha_v3_secret_key = esc_attr(get_option('sunformbuilder_recaptcha_v3_secret_key'));
                                ?>
                                <h4 class="payment-title">Google reCAPTCHA (v3)</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">Site Key</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_recaptcha_v3_site_key, 'sunformbuilder_recaptcha_v3_site_key');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Secret Key</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_recaptcha_v3_secret_key, 'sunformbuilder_recaptcha_v3_secret_key');
                                            ?>
                                            <a style="display:inline-block; margin-top:10px;" class="wpformbuilder-zoho-helper" target="_blank"
                                                href="https://www.google.com/recaptcha/admin/create">How to generate a Site Key and Secret Key</a>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <!-- Google Sheets -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table" data-api-name="google-sheets">
                                <?php
                                $sfbuilder_google_sheets_client_id = get_option('sunformbuilder_google_sheets_client_id');
                                $sfbuilder_google_sheets_client_secret = get_option('sunformbuilder_google_sheets_client_secret');
                                $sfbuilder_google_sheets_redirect_url = admin_url('admin.php?page=sunformbuilder_settings');
                                ?>
                                <h4 class="payment-title">Google Sheets</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">Client ID</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_google_sheets_client_id, 'sunformbuilder_google_sheets_client_id');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Client Secret</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_google_sheets_client_secret, 'sunformbuilder_google_sheets_client_secret');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Authorized Redirect URIs</th>
                                        <td>

                                            <input type="text" class="regular-text"
                                                value="<?php echo esc_url($sfbuilder_google_sheets_redirect_url); ?>" readonly />
                                            <div>
                                                <a style="display:inline-block;" class="wpformbuilder-zoho-helper" target="_blank"
                                                    href="https://console.developers.google.com/flows/enableapi?apiid=sheets.googleapis.com">How
                                                    to create client id and Client Screct</a>
                                                <span style="font-style: italic;display:block"><b>Note:</b> Save information before
                                                    authenticate.</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row"></th>
                                        <td>
                                            <?php
                                            $sfbuilder_google_sheets_oauth = 'https://accounts.google.com/o/oauth2/auth?redirect_uri=' . $sfbuilder_google_sheets_redirect_url . '&client_id=' . $sfbuilder_google_sheets_client_id . '&response_type=code&scope=https://www.googleapis.com/auth/spreadsheets&approval_prompt=force&access_type=offline&state=' . rawurlencode(wp_create_nonce('sunformbuilder_google_sheets_oauth'));
                                            ?>
                                            <?php if (!empty($sfbuilder_google_sheets_client_id) && !empty($sfbuilder_google_sheets_client_secret)): ?>
                                                <a id="wpformbuilder-authenticate-zoho-crm" href="<?php echo esc_url($sfbuilder_google_sheets_oauth); ?>"
                                                    class="button button-primary">Authenticate Google Sheets</a>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                    <?php
                                    $sfbuilder_google_sheets_oauth_code  = isset($_GET['code']) ? sanitize_text_field(wp_unslash($_GET['code'])) : '';
                                    $sfbuilder_google_sheets_oauth_scope = isset($_GET['scope']) ? sanitize_text_field(wp_unslash($_GET['scope'])) : '';
                                    $sfbuilder_google_sheets_oauth_state = isset($_GET['state']) ? sanitize_text_field(wp_unslash($_GET['state'])) : '';
                                    if (
                                        $sfbuilder_google_sheets_oauth_code !== ''
                                        && wp_verify_nonce($sfbuilder_google_sheets_oauth_state, 'sunformbuilder_google_sheets_oauth')
                                        && false !== strpos($sfbuilder_google_sheets_oauth_scope, 'spreadsheets')
                                        && current_user_can('manage_options')
                                    ) {
                                            $sfbuilder_google_sheets_response = wp_remote_post('https://oauth2.googleapis.com/token', [
                                                'body' => [
                                                    'code'          => $sfbuilder_google_sheets_oauth_code,
                                                    'client_id'     => $sfbuilder_google_sheets_client_id,
                                                    'client_secret' => $sfbuilder_google_sheets_client_secret,
                                                    'redirect_uri'  => $sfbuilder_google_sheets_redirect_url,
                                                    'grant_type'    => 'authorization_code'
                                                ]
                                            ]);
                                            $sfbuilder_google_sheets_response = json_decode(wp_remote_retrieve_body($sfbuilder_google_sheets_response));
                                            update_option('sunformbuilder_google_sheets_access_token', $sfbuilder_google_sheets_response->access_token);
                                            update_option('sunformbuilder_google_sheets_refresh_token', $sfbuilder_google_sheets_response->refresh_token);
                                            update_option('sunformbuilder_google_sheets_expires_in', time() + $sfbuilder_google_sheets_response->expires_in);
                                            SFBuilder_Pro_Admin_Settings::sunformbuilder_admin_notice_success('Google Sheets authentication successful!');
                                    } elseif ($sfbuilder_google_sheets_oauth_code !== '' && false !== strpos($sfbuilder_google_sheets_oauth_scope, 'spreadsheets')) {
                                            SFBuilder_Pro_Admin_Settings::sunformbuilder_admin_notice_error('Google Sheets authentication failed!');
                                    }
                                    ?>
                                </table>
                            </div>
                            <!-- Brevo -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table"
                                data-api-name="brevo">
                                <?php
                                $sfbuilder_brevo_api_key = esc_attr(get_option('sunformbuilder_brevo_api_key'));
                                ?>
                                <h4 class="payment-title">Brevo</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">API Key</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_brevo_api_key, 'sunformbuilder_brevo_api_key');
                                            ?>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <!-- Sendfox -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table"
                                data-api-name="sendfox">
                                <?php
                                $sfbuilder_sendfox_access_token = esc_attr(get_option('sunformbuilder_sendfox_access_token'));
                                ?>
                                <h4 class="payment-title">Sendfox</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">Access Token</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_sendfox_access_token, 'sunformbuilder_sendfox_access_token');
                                            ?>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <!-- Mailerlite -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table"
                                data-api-name="mailerlite">
                                <?php
                                $sfbuilder_mailerlite_api_token = esc_attr(get_option('sunformbuilder_mailerlite_api_token'));
                                ?>
                                <h4 class="payment-title">Mailerlite</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">API Token</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_mailerlite_api_token, 'sunformbuilder_mailerlite_api_token');
                                            ?>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <!-- Zoho CRM -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table" data-api-name="zohocrm" id="zohocrm">
                                <?php
                                $sfbuilder_zoho_domains = ["accounts.zoho.com", "accounts.zoho.com.au", "accounts.zoho.eu", "accounts.zoho.in", "accounts.zoho.com.cn"];
                                $sfbuilder_zoho_domain = get_option('sunformbuilder_zoho_domain');
                                $sfbuilder_zohocrm_client_id = esc_attr(get_option('sunformbuilder_zohocrm_client_id'));
                                $sfbuilder_zohocrm_client_secret = esc_attr(get_option('sunformbuilder_zohocrm_client_secret'));
                                $sfbuilder_zoho_redirect_url = admin_url('admin.php?page=sunformbuilder_settings');
                                ?>
                                <h4 class="payment-title">Zoho CRM</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">Domain</th>
                                        <td>
                                            <select name="sunformbuilder_zoho_domain">
                                                <?php foreach ($sfbuilder_zoho_domains as $sfbuilder_zoho) {
                                                    if ($sfbuilder_zoho_domain == $sfbuilder_zoho) {
                                                        echo '<option value="' . esc_attr($sfbuilder_zoho) . '" selected>' . esc_html($sfbuilder_zoho) . '</option>';
                                                    } else {
                                                        echo '<option value="' . esc_attr($sfbuilder_zoho) . '">' . esc_html($sfbuilder_zoho) . '</option>';
                                                    }
                                                } ?>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Client ID</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_zohocrm_client_id, 'sunformbuilder_zohocrm_client_id');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Client Secret</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_zohocrm_client_secret, 'sunformbuilder_zohocrm_client_secret');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Authorized Redirect URIs</th>
                                        <td>
                                            <input type="text" class="regular-text" value="<?php echo esc_url($sfbuilder_zoho_redirect_url); ?>" readonly />
                                            <a class="wpformbuilder-zoho-helper" target="_blank"
                                                href="https://accounts.zoho.com/developerconsole">How to create client
                                                id
                                                and Screct key</a>
                                            <span style="font-style: italic;"><b>Note:</b> Save information before
                                                authenticate.</span>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row"></th>
                                        <td>
                                            <?php
                                            $sfbuilder_button_auth_class = !empty($sfbuilder_zoho_domain) && !empty($sfbuilder_zohocrm_client_id) && !empty($sfbuilder_zohocrm_client_secret) ? '' : ' wpformbuilder-hidden';
                                            $sfbuilder_zoho_scope = 'ZohoCRM.modules.all,ZohoCRM.settings.all';
                                            $sfbuilder_zoho_oauth = 'https://' . $sfbuilder_zoho_domain . '/oauth/v2/auth?scope=' . $sfbuilder_zoho_scope . '&client_id=' . $sfbuilder_zohocrm_client_id . '&response_type=code&access_type=offline&redirect_uri=' . $sfbuilder_zoho_redirect_url;
                                            ?>
                                            <a id="wpformbuilder-authenticate-zoho-crm" href="<?php echo esc_url($sfbuilder_zoho_oauth); ?>" class="button button-primary<?php echo esc_attr($sfbuilder_button_auth_class); ?>">Authenticate Zoho CRM</a>
                                        </td>
                                    </tr>
                                    <?php
                                    if (!empty($_REQUEST['code']) && !empty($_REQUEST['accounts-server'])) {
                                        $sfbuilder_zoho_response = wp_remote_post('https://' . $sfbuilder_zoho_domain . '/oauth/v2/token', [
                                            'body' => [
                                                'client_id'     => $sfbuilder_zohocrm_client_id,
                                                'client_secret' => $sfbuilder_zohocrm_client_secret,
                                                'grant_type'    => 'authorization_code',
                                                'redirect_uri'  => $sfbuilder_zoho_redirect_url,
                                                'code'          => sanitize_text_field(wp_unslash($_REQUEST['code']))
                                            ]
                                        ]);
                                        $sfbuilder_zoho_response = json_decode(wp_remote_retrieve_body($sfbuilder_zoho_response));
                                        if (!empty($sfbuilder_zoho_response->access_token)) {
                                            update_option('sunformbuilder_zoho_access_token', $sfbuilder_zoho_response->access_token);
                                            update_option('sunformbuilder_zoho_refresh_token', $sfbuilder_zoho_response->refresh_token);
                                            update_option('sunformbuilder_zoho_api_domain', $sfbuilder_zoho_response->api_domain);
                                            update_option('sunformbuilder_zoho_expires_in', time() + $sfbuilder_zoho_response->expires_in);
                                            SFBuilder_Pro_Admin_Settings::sunformbuilder_admin_notice_success('Zoho CRM authentication successful!');
                                        } else {
                                            SFBuilder_Pro_Admin_Settings::sunformbuilder_admin_notice_error('Zoho CRM authentication failed!');
                                        }
                                    }
                                    ?>
                                </table>
                            </div>
                            <!-- Constantcontact -->
                            <div class="wpformbuilder-admin-api-tab wpformbuilder-admin-table"
                                data-api-name="constantcontact" id="constant-contact">
                                <?php
                                $sfbuilder_constantcontact_api_key = esc_attr(get_option('sunformbuilder_constantcontact_api_key'));
                                $sfbuilder_constantcontact_secret_key = esc_attr(get_option('sunformbuilder_constantcontact_secret_key'));
                                $sfbuilder_constantcontact_redirect_uri = admin_url('admin.php?page=sunformbuilder_settings');
                                $sfbuilder_constantcontact_auth_url = esc_url("https://authz.constantcontact.com/oauth2/default/v1/authorize?client_id=$sfbuilder_constantcontact_api_key&scope=contact_data+campaign_data+account_update+account_read+offline_access&response_type=code&redirect_uri=" . urlencode($sfbuilder_constantcontact_redirect_uri) . "&state=wpformbuilder");
                                ?>
                                <h4 class="payment-title">Constantcontact</h4>
                                <table class="form-table">
                                    <tr valign="top">
                                        <th scope="row">API Key</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_constantcontact_api_key, 'sunformbuilder_constantcontact_api_key');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Secret Key</th>
                                        <td>
                                            <?php
                                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                            echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_constantcontact_secret_key, 'sunformbuilder_constantcontact_secret_key');
                                            ?>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row">Redirect URI</th>
                                        <td>
                                            <input type="text" class="regular-text"
                                                value="<?php echo esc_url($sfbuilder_constantcontact_redirect_uri); ?>" readonly />
                                            <a style="margin-top: 10px; margin-bottom: 5px; display:block;" class="wpformbuilder-zoho-helper" target="_blank"
                                                href="https://app.constantcontact.com/pages/dma/portal/">How to get API
                                                key
                                                and Screct key</a>
                                            <span style="font-style: italic;"><b>Note:</b> Save information before
                                                authenticate.</span>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <th scope="row"></th>
                                        <td>
                                            <?php if (!empty($sfbuilder_constantcontact_api_key) && !empty($sfbuilder_constantcontact_secret_key)): ?>
                                                <a id="wpformbuilder-authenticate-constantcontact"
                                                    href="<?php echo esc_url($sfbuilder_constantcontact_auth_url); ?>"
                                                    class="button button-primary">Authenticate Constantcontact</a>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                    <?php
                                    if (!empty($_GET['code']) && $_GET['state'] == 'wpformbuilder') {
                                        $sfbuilder_constantcontact_response = wp_remote_post('https://authz.constantcontact.com/oauth2/default/v1/token', [
                                            'headers' => [
                                                'Authorization' => 'Basic ' . base64_encode($sfbuilder_constantcontact_api_key . ':' . $sfbuilder_constantcontact_secret_key),
                                                'Content-Type' => 'application/x-www-form-urlencoded'
                                            ],
                                            'body' => [
                                                'grant_type'    => 'authorization_code',
                                                'redirect_uri'  => $sfbuilder_zoho_redirect_url,
                                                'code'          => sanitize_text_field(wp_unslash($_REQUEST['code']))
                                            ]
                                        ]);
                                        $sfbuilder_constantcontact_result = json_decode(wp_remote_retrieve_body($sfbuilder_constantcontact_response));
                                        if (!empty($sfbuilder_constantcontact_result->access_token)) {
                                            update_option('sunformbuilder_constantcontact_access_token', $sfbuilder_constantcontact_result->access_token);
                                            update_option('sunformbuilder_constantcontact_refresh_token', $sfbuilder_constantcontact_result->refresh_token);
                                            update_option('sunformbuilder_constantcontact_time_token_expires', time() + 7000);
                                            SFBuilder_Pro_Admin_Settings::sunformbuilder_admin_notice_success('Constant Contact authentication successful!');
                                        } else {
                                            SFBuilder_Pro_Admin_Settings::sunformbuilder_admin_notice_success('Constant Contact authentication failed!');
                                        }
                                    }
                                    ?>
                                </table>
                            </div>
                        </div>
                        <div class="wpformbuilder-admin-tab-panel">
                            <div class="wpformbuilder-admin-control-api" style="text-align: center;">
                                <button type="button" class="wpformbuilder-admin-control-api__button check">Show
                                    all</button>
                                <button type="button" class="wpformbuilder-admin-control-api__button uncheck">Hidden
                                    all</button>
                            </div>
                            <ul>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item" id="mailchimp"
                                        name="api_name" value="mailchimp" />
                                    <label for="mailchimp"> Mailchimp</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item"
                                        id="activecampaign" name="api_name" value="activecampaign" />
                                    <label for="activecampaign"> Activecampaign</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item"
                                        id="recaptcha-v2" name="api_name" value="recaptcha-v2" />
                                    <label for="recaptcha-v2"> Google recaptcha (v2)</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item"
                                        id="recaptcha-v3" name="api_name" value="recaptcha-v3" />
                                    <label for="recaptcha-v3"> Google recaptcha (v3)</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item" id="google-sheets"
                                        name="api_name" value="google-sheets" />
                                    <label for="google-sheets"> Google Sheets</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item" id="zoho-crm"
                                        name="api_name" value="zohocrm" />
                                    <label for="zoho-crm"> Zoho CRM</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item" id="mailerlite"
                                        name="api_name" value="mailerlite" />
                                    <label for="mailerlite"> Mailerlite</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item" id="brevo"
                                        name="api_name" value="brevo" />
                                    <label for="brevo"> Brevo</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item" id="sendfox"
                                        name="api_name" value="sendfox" />
                                    <label for="sendfox"> Sendfox</label>
                                </li>
                                <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item"
                                        id="constantcontact" name="api_name" value="constantcontact" />
                                    <label for="constantcontact"> Constantcontact</label>
                                </li>
                                <!-- <li>
                                    <input type="checkbox" class="wpformbuilder-admin-api-input-item" id="twilio-sms"
                                        name="api_name" value="twilio-sms" disabled />
                                    <label for="twilio-sms"> Twilio SMS</label><a class="wpformbuilder-get-version-pro"
                                        title="Get pro version now" href="#"> (Only pro)</a>
                                </li> -->
                            </ul>
                            <hr>
                            <?php submit_button(); ?>
                        </div>
                    </div>
                </div>
                <div class="wpformbuilder-admin-tab-content_item payment-settings" data-tab-item="payment-setting">
                    <div class="wpformbuilder-admin-tab-wrap" style="width: 100%;">
                        <div class="wpformbuilder-admin-tab-api__inner">
                            <div class="wpformbuilder-admin-tab-api-content">
                                <!-- Stripe Payment -->
                                <div class="wpformbuilder-admin-tab-payment stripe" data-api-name="stripe">
                                    <?php
                                    $sfbuilder_stripe_publishable_key = esc_attr(get_option('sunformbuilder_stripe_publishable_key'));
                                    $sfbuilder_stripe_secret_key = esc_attr(get_option('sunformbuilder_stripe_secret_key'));
                                    ?>
                                    <h4 class="payment-title">Stripe</h4>
                                    <table class="form-table">
                                        <tbody>
                                            <tr>
                                                <td>Publishable key</td>
                                                <td>
                                                    <?php
                                                    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                                    echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_stripe_publishable_key, 'sunformbuilder_stripe_publishable_key', 'stripe');
                                                    ?>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Secret key</td>
                                                <td>

                                                    <?php
                                                    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                                    echo $sfbuilder_admin_setting->sunformbuilder_generate_html_api_input($sfbuilder_stripe_secret_key, 'sunformbuilder_stripe_secret_key', 'stripe');
                                                    ?>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="wpformbuilder-admin-tab-panel">
                                <div class="wpformbuilder-admin-control-api" style="text-align: center;">
                                    <button type="button" class="wpformbuilder-admin-control-api__button check">Show
                                        all</button>
                                    <button type="button" class="wpformbuilder-admin-control-api__button uncheck">Hidden
                                        all</button>
                                </div>
                                <ul>
                                    <li>
                                        <input type="checkbox" class="wpformbuilder-admin-api-input-item" id="stripe"
                                            name="api_name" value="stripe" />
                                        <label for="stripe"> Stripe Payment</label>
                                    </li>
                                </ul>
                                <hr>
                                <?php submit_button(); ?>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <div class="wpformbuilder-admin-tab-content_item license-settings" data-tab-item="license-setting">
                <div class="wpformbuilder-admin-tab-wrap">
                    <div class="wpformbuilder-admin-tab-api__license">
                        <div class="wpformbuilder-tab-license-content">
                            <?php
                            $sfbuilder_license_key = (string) get_option('sun_activation_license_key', '');
                            $sfbuilder_license_notice = '';
                            if ($sfbuilder_license_key !== '' && function_exists('sunformbuilder_pro_refresh_license_status')) {
                                $sfbuilder_license_refresh = sunformbuilder_pro_refresh_license_status();
                                if (is_wp_error($sfbuilder_license_refresh) && $sfbuilder_license_refresh->get_error_code() === 'license_inactive') {
                                    $sfbuilder_license_notice = $sfbuilder_license_refresh->get_error_message();
                                    $sfbuilder_license_key = '';
                                }
                            }
                            $sfbuilder_license_domain = (string) get_option('sun_activation_domain', '');
                            $sfbuilder_license_sites = (string) get_option('sun_activation_sites_label', '');
                            if ($sfbuilder_license_sites === '' && $sfbuilder_license_key !== '') {
                                $sfbuilder_sites_used = (int) get_option('sun_activation_sites_used', 0);
                                $sfbuilder_sites_limit = (int) get_option('sun_activation_sites_limit', 0);
                                $sfbuilder_license_sites = $sfbuilder_sites_used . ' / ' . ($sfbuilder_sites_limit > 0 ? (string) $sfbuilder_sites_limit : 'Unlimited');
                            }
                            ?>
                            <?php if ($sfbuilder_license_key !== '') : ?>
                                <form method="post" id="sun-action-deactivate" class="wpformbuilder-license-card">
                                    <div class="wpformbuilder-license-card__header">
                                        <h3>Plugin License</h3>
                                        <p>This site is activated.</p>
                                    </div>
                                    <div class="wpformbuilder-license-form">
                                        <div class="wpformbuilder-license-status">
                                            <div class="wpformbuilder-license-status__row">
                                                <span>License key</span>
                                                <strong class="wpformbuilder-license-key-value"><?php echo esc_html($sfbuilder_license_key); ?></strong>
                                            </div>
                                            <div class="wpformbuilder-license-status__row">
                                                <span>Domain</span>
                                                <strong><?php echo esc_html($sfbuilder_license_domain); ?></strong>
                                            </div>
                                            <div class="wpformbuilder-license-status__row">
                                                <span>Site activations</span>
                                                <strong><?php echo esc_html($sfbuilder_license_sites); ?></strong>
                                            </div>
                                        </div>
                                        <div class="sun-license-eror-msg" role="alert"></div>
                                        <div class="sun-license-active-buttons">
                                            <button type="submit" class="button button-secondary button-license-deactivate">
                                                <i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
                                                <span>Deactivate License</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            <?php else : ?>
                                <form method="post" id="sun-action-activate" class="wpformbuilder-license-card">
                                    <div class="wpformbuilder-license-card__header">
                                        <h3>Activate The Plugin License</h3>
                                        <p>Enter the license key from your Sun Form Builder account.</p>
                                    </div>
                                    <div class="wpformbuilder-license-form">
                                        <div class="wpformbuilder-license-group wpformbuilder-license-group-field">
                                            <label class="wpformbuilder-license-label" for="license_key">License key</label>
                                            <div class="wpformbuilder-license-control">
                                                <input type="text" name="license_key" id="license_key"
                                                    placeholder="XXXX-XXXX-XXXX-XXXX" autocomplete="off" spellcheck="false">
                                            </div>
                                        </div>
                                        <div class="wpformbuilder-license-options">
                                            <label class="wpformbuilder-license-toggle sun-license-label" for="disable-ssl"
                                                title="Use only if your server does not have valid SSL (not recommended)">
                                                <input type="checkbox" class="license-disable-ssl"
                                                    id="disable-ssl"
                                                    title="Use only if your server does not have valid SSL (not recommended)" <?php echo esc_attr($sfbuilder_ssl_is_checked); ?>>
                                                <span>Disable SSL verify</span>
                                            </label>
                                        </div>
                                        <div class="sun-license-eror-msg" role="alert"><?php echo esc_html($sfbuilder_license_notice); ?></div>
                                        <div class="sun-license-active-buttons">
                                            <button type="submit" class="button button-primary button-license-activate">
                                                <i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
                                                <span>Activate License</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
        $sfbuilder_debug_api = get_option('sunformbuilder_debug_mode');
        ?>
        <!-- Debug Mode -->
        <div class="wpformbuilder-debug-mode" style="display: none;"><label>Debug mode</label><input type="text"
                name="sunformbuilder_debug_mode" value="<?php echo esc_attr($sfbuilder_debug_api); ?>"></div>

        <!-- </form> -->
    </div>