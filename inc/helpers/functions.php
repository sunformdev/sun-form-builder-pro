<?php
if (!defined('ABSPATH')) exit;

require_once __DIR__ . '/../lib/twig/vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\ArrayLoader;

class SFBuilder_Pro_Helper
{
    private $twig;

    public function __construct()
    {
        $this->twig = new Environment(new ArrayLoader());
    }

    public function sunformbuilder_render_template($html, $data = [])
    {
        try {
            if (!$this->twig) {
                throw new \Exception("Twig is not initialized.");
            }

            $template = $this->twig->createTemplate($html);
            return $template->render($data);
        } catch (\Exception $e) {
            return 'Error rendering template: ' . $e->getMessage();
        }
    }

    public function sunformbuilder_get_form_settings($post_id, $form_ID)
    {
        $post = get_post($post_id);

        if (!$post) {
            return null;
        }

        $blocks = parse_blocks($post->post_content);

        foreach ($blocks as $block) {
            if (in_array($block['blockName'], ['sunformbuilder/form', 'sunformbuilder/multi-step-form']) && $block['attrs']['form']['id'] === $form_ID) {
                $block_attributes = $block['attrs'] ?? [];
                unset($block_attributes['state'], $block_attributes['css']);
                return $block_attributes;
            }
        }
        return null;
    }

    public function sunformbuilder_get_form_data($settings, $subbmit_data)
    {
        $data = [];
        $fields = !empty($settings['fields']) ? $settings['fields'] : [];
        foreach ($fields as $key => $item) {
            if (!isset($subbmit_data[$item['name']])) {
                continue;
            }

            $raw_value  = $subbmit_data[$item['name']];
            $field_type = isset($item['type']) ? $item['type'] : 'text';

            if (is_array($raw_value)) {
                $sanitized_parts = [];
                foreach ($raw_value as $part) {
                    $sanitized_parts[] = $this->sunformbuilder_sanitize_field_value($part, $field_type);
                }
                $value = implode(',', $sanitized_parts);
            } else {
                $value = $this->sunformbuilder_sanitize_field_value($raw_value, $field_type);
            }

            $data[$item['name']] = [
                'value' => $value,
                'label' => $item['label'],
                'type'  => $field_type,
            ];
        }
        return $data;
    }

    /**
     * Sanitize a submitted field value according to its declared field type.
     *
     * Guards against XSS / header / template injection when the resulting
     * $submit_data is propagated to email rendering, third-party API payloads
     * (Mailchimp, Mailerlite, Zoho CRM, Stripe, ...), redirects, or the DB.
     *
     * @param mixed  $value Raw value coming from $_POST.
     * @param string $type  Field type as declared in the form settings.
     * @return string Sanitized scalar value (empty string for unsupported inputs).
     */
    public function sunformbuilder_sanitize_field_value($value, $type)
    {
        if (is_array($value) || is_object($value) || is_null($value)) {
            return '';
        }

        $value = wp_unslash((string) $value);

        switch ($type) {
            case 'email':
                return sanitize_email($value);
            case 'url':
                return esc_url_raw($value);
            case 'textarea':
                return sanitize_textarea_field($value);
            case 'number':
                return is_numeric($value) ? (string) $value : '';
            case 'file_upload':
            case 'image_upload':
            case 'stripe_card':
                return sanitize_text_field($value);
            default:
                return sanitize_text_field($value);
        }
    }

    public function sunformbuilder_get_content_email_template($id)
    {
        $email_content = get_post_meta($id, '_sunformbuilder_email_template', true);
        return $email_content;
    }

    public function sunformbuilder_get_value_repeater_api($data, $field_name, $fields_map)
    {
        if ($field_name == 'custom_value') {
            $value = !empty($fields_map['custom_value']) ? $fields_map['custom_value'] : '';
        } else {
            $value = !empty($data[$field_name]) ? $data[$field_name]['value'] : '';
        }
        return $value;
    }

    public function sunformbuilder_get_value_by_name(string $name, array $data)
    {
        if (!isset($data[$name]) || !is_array($data[$name])) {
            return $name;
        }

        return array_key_exists('value', $data[$name]) ? $data[$name]['value'] : $name;
    }

    public function sunformbuilder_get_value_repeater_mailchimp_address($data, $address)
    {
        $address_value = [];
        foreach ($address as $key => $name) {
            $address_value[$key] = $data[$name]['value'] ?? '';
        }
        return $address_value;
    }

    public function sunformbuilder_mailchimp_curl_post_member($url, $api_key, $data)
    {
        $args = [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode("user:$api_key"),
                'Content-Type' => 'application/json'
            ],
            'body' => json_encode($data)
        ];
        $result = wp_remote_post($url, $args);
        return json_decode(wp_remote_retrieve_body($result));
    }

    public function sunformbuilder_mailchimp_curl_put_member($url, $api_key, $data)
    {
        $args = [
            'method' => 'PUT',
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode('user:' . $api_key),
                'Content-Type' => 'application/json'
            ],
            'body' => json_encode($data)
        ];
        $result = wp_remote_request($url, $args);
        return json_decode(wp_remote_retrieve_body($result));
    }

    public function sunformbuilder_activecampaign_add_member($key, $url, $data, $method)
    {
        $request_url = "$url/api/3/contacts";
        if ($method === 'PUT') {
            $contact_id = $this->sunformbuilder_activecampaign_get_member($data['email'], $key, $url);
            $request_url = $contact_id ? "$request_url/$contact_id" : $request_url;
            $method = $contact_id ? "PUT" : "POST";
        }
        $args = [
            'method' => $method,
            'headers' => [
                "Api-Token" => $key,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ],
            'body' => json_encode(['contact' => $data])
        ];
        $result = wp_remote_request($request_url, $args);
        $member_result = json_decode(wp_remote_retrieve_body($result));
        return $member_result;
    }

    public function sunformbuilder_brevo_add_contact($data, $key)
    {
        $args = [
            'headers' => [
                'Content-Type' => 'application/json',
                'api-key' => $key
            ],
            'body' => json_encode($data)
        ];
        $result = wp_remote_post('https://api.brevo.com/v3/contacts', $args);
        return wp_remote_retrieve_body($result);
    }

    public function sunformbuilder_sendfox_add_contact($token, $data)
    {
        $url = 'https://api.sendfox.com/contacts?' . http_build_query($data);
        $args = [
            'method' => 'POST',
            'headers' => [
                'Authorization' => 'Bearer ' . $token
            ],
            'httpversion' => '1.1',
        ];
        $response = wp_remote_post($url, $args);
        return wp_remote_retrieve_body($response);
    }

    public function sunformbuilder_activecampaign_get_member($email, $key, $url)
    {
        $request_url = $url . '/api/3/contacts?email=' . urlencode($email);
        $args = [
            'method' => 'GET',
            'headers' => [
                'Api-Token' => $key,
                'Accept' => 'application/json'
            ]
        ];
        $response = wp_remote_request($request_url, $args);
        if (is_wp_error($response)) {
            return false;
        }
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (!empty($body['contacts']) && isset($body['contacts'][0]['id'])) {
            return $body['contacts'][0]['id'];
        }
        return false;
    }

    public function sunformbuilder_mailerlite_add_contact($api_key, $data, $url)
    {
        $args = [
            'headers' => [
                'X-MailerLite-ApiKey' => $api_key,
                'Content-Type' => 'application/json'
            ],
            'body' =>  json_encode($data)
        ];
        $response = wp_remote_post($url, $args);
        return $response;
    }

    public function sunformbuilder_google_sheets_refresh_token()
    {
        $google_sheet_client_id = get_option('sunformbuilder_google_sheets_client_id');
        $google_sheet_client_secret = get_option('sunformbuilder_google_sheets_client_secret');
        $google_sheet_reset_token = get_option('sunformbuilder_google_sheets_refresh_token');
        $args = [
            'body' => [],
            'headers' => array(
                'Content-type' => 'application/x-www-form-urlencoded',
            ),
            'body' => [
                'client_id'     => $google_sheet_client_id,
                'client_secret' => $google_sheet_client_secret,
                'refresh_token' => $google_sheet_reset_token,
                'grant_type'    => 'refresh_token',
            ],
            'timeout' => 15
        ];
        $google_sheets_response = wp_remote_post('https://www.googleapis.com/oauth2/v4/token', $args);
        $google_sheets_response = json_decode(wp_remote_retrieve_body($google_sheets_response));
        if ($google_sheets_response->access_token) {
            update_option('sunformbuilder_google_sheets_access_token', $google_sheets_response->access_token);
            update_option('sunformbuilder_google_sheets_expires_in', time() + $google_sheets_response->expires_in);
        } else {
            echo "Unknown error occurred during Google Sheets token refresh.";
            wp_die();
        }
    }

    public function sunformbuilder_google_sheets_add_new_row($sheet_id, $sheet_tab, $google_sheet_data, $google_sheet_token)
    {
        $google_sheet_url = 'https://sheets.googleapis.com/v4/spreadsheets/'
            . $sheet_id
            . '/values/'
            . rawurlencode($sheet_tab) . '!A1:append'
            . '?valueInputOption=USER_ENTERED';

        $body = [
            'majorDimension' => 'ROWS',
            'values' => [
                $google_sheet_data,
            ],
        ];

        $response = wp_remote_post(
            $google_sheet_url,
            [
                'headers' => [
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $google_sheet_token,
                ],
                'body'    => wp_json_encode($body),
                'timeout' => 15,
            ]
        );

        if (is_wp_error($response)) {
            return $response;
        }

        return json_decode(wp_remote_retrieve_body($response), true);
    }

    public function google_sheets_column_letter_to_index($column)
    {
        $column = strtoupper($column);
        $index = 0;

        for ($i = 0; $i < strlen($column); $i++) {
            $index = $index * 26 + (ord($column[$i]) - 64);
        }

        return $index - 1;
    }

    public function google_sheets_build_row($map, $form_data)
    {
        $row = [];

        foreach ($map as $item) {
            if (empty($item['column_name'])) {
                continue;
            }

            $colIndex = $this->google_sheets_column_letter_to_index($item['column_name']);

            // Nếu là custom_value
            if ($item['field_name'] === 'custom_value') {
                $value = $item['custom_value'] ?? '';
            } else {
                $value = $form_data[$item['field_name']] ?? '';
            }

            $row[$colIndex] = $value;
        }

        // Đảm bảo đủ cột & đúng thứ tự
        ksort($row);
        $maxIndex = max(array_keys($row));
        $row = array_replace(array_fill(0, $maxIndex + 1, ''), $row);

        return $row;
    }


    public function sunformbuilder_constantcontact_refresh_token()
    {
        $constantcontact_api_key = get_option('sunformbuilder_constantcontact_api_key');
        $constantcontact_api_secret = get_option('sunformbuilder_constantcontact_secret_key');
        $constantcontact_refresh_token = get_option('sunformbuilder_constantcontact_refresh_token');
        $url = 'https://authz.constantcontact.com/oauth2/default/v1/token';
        $args = [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode($constantcontact_api_key . ':' . $constantcontact_api_secret),
                'Content-Type' => 'application/x-www-form-urlencoded'
            ],
            'body' => http_build_query([
                'grant_type'     => 'refresh_token',
                'refresh_token'  => $constantcontact_refresh_token
            ]),
            'method'      => 'POST',
            'data_format' => 'body'
        ];
        $response = wp_remote_post($url, $args);
        $response = json_decode(wp_remote_retrieve_body($response));
        if (!empty($response) && !empty($response->refresh_token)) {
            update_option('sunformbuilder_constantcontact_access_token', $response->access_token);
            update_option('sunformbuilder_constantcontact_refresh_token', $response->refresh_token);
            update_option('sunformbuilder_constantcontact_time_token_expires', time() + 7000);
        } else {
            echo esc_html(ucfirst((string) ($response->error_description ?? '')));
            wp_die();
        }
        return $response->access_token;
    }

    public function sunformbuilder_zohocrm_refresh_token()
    {
        $zoho_client_id = get_option('sunformbuilder_zohocrm_client_id');
        $zoho_client_secret = get_option('sunformbuilder_zohocrm_client_secret');
        $zoho_domain = get_option('sunformbuilder_zoho_domain');
        $zoho_refresh_token = get_option('sunformbuilder_zoho_refresh_token');
        $zoho_request_url = 'https://' . $zoho_domain . '/oauth/v2/token';
        $args = [
            'method' => 'POST',
            'body'   => [
                'refresh_token' => $zoho_refresh_token,
                'client_id'     => $zoho_client_id,
                'client_secret' => $zoho_client_secret,
                'grant_type'    => 'refresh_token',
            ],
        ];
        $response = wp_remote_post($zoho_request_url, $args);
        $zoho_response = json_decode(wp_remote_retrieve_body($response));
        if (!empty($zoho_response) && !empty($zoho_response->access_token)) {
            update_option('sunformbuilder_zoho_access_token', $zoho_response->access_token);
            update_option('sunformbuilder_zoho_api_domain', $zoho_response->api_domain);
            update_option('sunformbuilder_zoho_expires_in', time() + $zoho_response->expires_in);
            return [
                'status' => true,
                'access_token' => $zoho_response->access_token
            ];
        } else {
            return [
                'status' => false,
                'message' => $zoho_response->error_description ?? 'Unknown error occurred during Zoho CRM token refresh.'
            ];
        }
    }

    public function sunformbuilder_zohocrm_add_record($data, $url, $token)
    {
        $data = json_encode($data);
        $data = '{"data":[' . $data . ']}';
        $args = [
            'headers' => [
                'Authorization' => 'Zoho-oauthtoken ' . $token,
                'Content-Type' => 'application/x-www-form-urlencoded'
            ],
            'httpversion' => '1.1',
            'body' => $data
        ];
        $response = wp_remote_post($url, $args);
        return wp_remote_retrieve_body($response);
    }

    public function sunformbuilder_constantcontact_create_contact($token, $data, $update_contact)
    {
        $url = $update_contact ? 'https://api.cc.email/v3/contacts/sign_up_form' : 'https://api.cc.email/v3/contacts';
        $args = [
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json'
            ],
            'body' => $data,
            'httpversion' => '1.1'
        ];
        $response = wp_remote_post($url, $args);
        return wp_remote_retrieve_body($response);
    }

    public function sunformbuilder_mailerlite_get_subscriber($api_key, $email)
    {
        $url = 'https://api.mailerlite.com/api/v2/subscribers/' . $email;
        $args = [
            'headers' => [
                'X-MailerLite-ApiKey' => $api_key
            ],
            'httpversion' => '1.1',
        ];
        $response = wp_remote_get($url, $args);
        $response = json_decode(wp_remote_retrieve_body($response));
        if (empty($response->error)) {
            return true;
        } else {
            return false;
        }
    }

    public function sunformbuilder_get_metadata_data($meta_data, $page_url)
    {
        $meta_data_string = '';
        foreach ($meta_data as $meta_item) {
            switch ($meta_item) {
                case 'Date':
                    $meta_data_string .= 'Date: ' . date_i18n(get_option('date_format')) . '<br>';
                    break;
                case 'Time':
                    $meta_data_string .= 'Time: ' . date_i18n(get_option('time_format')) . '<br>';
                    break;
                case 'User Agent':
                    $meta_data_string .= "User Agent: " . esc_html($this->sunformbuilder_get_user_agent()) . '<br>';
                    break;
                case 'Remote IP':
                    $meta_data_string .= "Remote IP: " . $this->sunformbuilder_get_remote_ip() . '<br>';
                    break;
                case 'Page URL':
                    $meta_data_string .= "Page URL: " . esc_url($page_url) . '<br>';
                    break;
            }
        }
        return !empty($meta_data_string) ? "<br>-------<br>$meta_data_string" : '';
    }

    public function array_value_exists($array, $keys, $default = null)
    {
        foreach ($keys as $key) {
            if (!is_array($array) || !array_key_exists($key, $array)) {
                return $default;
            }
            $array = $array[$key];
        }
        return $array;
    }

    /**
     * Get the remote client's User-Agent string, safe for logging / email bodies.
     *
     * HTTP_USER_AGENT is an untrusted request header — clients can send arbitrary
     * content including HTML, JavaScript, CRLF sequences, or a payload thousands
     * of bytes long. We unslash, run it through sanitize_text_field() (which
     * strips tags and newlines) and cap its length so a spoofed header cannot
     * inject markup into HTML emails, break out of admin submission rendering,
     * or bloat DB rows.
     *
     * @return string Sanitized User-Agent, or empty string if none / unusable.
     */
    public function sunformbuilder_get_user_agent()
    {
        if (empty($_SERVER['HTTP_USER_AGENT'])) {
            return '';
        }

        $user_agent = sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT']));
        if (!is_string($user_agent)) {
            return '';
        }

        // Real-world User-Agent strings virtually never exceed a few hundred
        // characters; cap at 512 to bound the impact of oversized spoofed
        // headers on emails and DB storage.
        if (strlen($user_agent) > 512) {
            $user_agent = substr($user_agent, 0, 512);
        }

        return $user_agent;
    }

    public function sunformbuilder_get_remote_ip()
    {
        $candidates = [];

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $candidates[] = sanitize_text_field(wp_unslash($_SERVER['HTTP_CLIENT_IP']));
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $forwarded = sanitize_text_field(wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR']));
            foreach (explode(',', $forwarded) as $forwarded_ip) {
                $candidates[] = trim($forwarded_ip);
            }
        }
        if (!empty($_SERVER['REMOTE_ADDR'])) {
            $candidates[] = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']));
        }

        foreach ($candidates as $candidate) {
            if (!is_string($candidate) || $candidate === '') {
                continue;
            }
            $valid = filter_var($candidate, FILTER_VALIDATE_IP);
            if ($valid !== false) {
                return $valid;
            }
        }

        return '';
    }
    
    public function sunformbuilder_get_data_save_db($form_data, $settings)
    {
        foreach ($form_data as $key => &$field) {
            if (in_array($field['type'], ['checkbox', 'radio'])) {
                foreach ($settings as $setting) {
                    if (isset($setting['name']) && $setting['name'] === $key) {
                        $field['options'] = $setting['options'] ?? [];
                        break;
                    }
                }
            }
        }
        return $form_data;
    }
    public function has_recaptcha_v2($fields)
    {
        foreach ($fields as $field) {
            if (isset($field['type']) && $field['type'] === 'recaptcha_v2') {
                return $field;
            }
        }
        return false;
    }

    public function str2_contains(string $haystack, string $needle): bool
    {
        return $needle === '' || strpos($haystack, $needle) !== false;
    }
    
    public function sfbuilder_pro_decode_submission_json($json)
    {
        if (! is_string($json) || $json === '') {
            return null;
        }

        $decoded = json_decode($json);

        return (JSON_ERROR_NONE === json_last_error()) ? $decoded : null;
    }

    public function sfbuilder_pro_encode_submission_json($data)
    {
        return wp_json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    public function sfbuilder_pro_fix_submission_display_value($value)
    {
        if (! is_string($value) || ! preg_match('/u[0-9a-fA-F]{4}/', $value)) {
            return $value;
        }

        return preg_replace_callback(
            '/u([0-9a-fA-F]{4})/',
            static function ($matches) {
                return html_entity_decode('&#x' . $matches[1] . ';', ENT_NOQUOTES, 'UTF-8');
            },
            $value
        );
    }
}
