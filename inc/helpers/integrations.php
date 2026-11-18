<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SFBuilder_Pro_Integration_Manager extends SFBuilder_Pro_Helper
{
    public function __construct()
    {
        add_action('rest_api_init', function () {
            register_rest_route('sunform/v1', '/integrations', [
                'methods' => 'POST',
                'callback' => [$this, 'sunformbuilder_integrations_request'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ]);
        });
    }
    public function sunformbuilder_integrations_request(WP_REST_Request $request)
    {
        $service = $request->get_param('service');
        $settings = $request->get_param('settings');
        $method_name = "sunformbuilder_{$service}_get_data";
        $data = [];
        if (method_exists($this, $method_name)) {
            $data = $this->$method_name($settings);
        } else {
            return new WP_Error('Invalid Service', 'Service not supported', ['status' => 400]);
        }
        $data['loading'] = false;
        return new WP_REST_Response([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    public function sunformbuilder_constantcontact_get_data($settings)
    {
        $constantcontact_access_token = get_option('sunformbuilder_constantcontact_access_token');
        $constantcontact_token_expires = get_option('sunformbuilder_constantcontact_time_token_expires');
        $list_ids = [['label' => '-- Select List --', 'value' => '', 'disabled' => true]];
        $fields = [
            ['label' => '-- Select Tag --', 'value' => '', 'disabled' => true],
            ['label' => 'First Name', 'value' => 'first_name'],
            ['label' => 'Last Name', 'value' => 'last_name'],
            ['label' => 'Email Address', 'value' => 'email_address'],
            ['label' => 'Phone Number', 'value' => 'phone_number'],
            ['label' => 'Company Name', 'value' => 'company_name'],
            ['label' => 'Birthday Month', 'value' => 'birthday_month'],
            ['label' => 'Birthday Day', 'value' => 'birthday_day'],
            ['label' => 'Anniversary', 'value' => 'anniversary'],
            ['label' => 'Street', 'value' => 'street'],
            ['label' => 'Street 2', 'value' => 'street2'],
            ['label' => 'City', 'value' => 'city'],
            ['label' => 'State', 'value' => 'state'],
            ['label' => 'Postal Code', 'value' => 'postal_code'],
            ['label' => 'Country', 'value' => 'country'],
            ['label' => 'Taggings', 'value' => 'taggings']
        ];
        if (time() >= (int)$constantcontact_token_expires) {
            $constantcontact_access_token = $this->sunformbuilder_constantcontact_refresh_token();
        }
        $list_data =  wp_remote_get('https://api.cc.email/v3/contact_lists?limit=50&include_count=false', [
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $constantcontact_access_token,
                'Content-Type' => 'application/json'
            ],
            'httpversion' => '1.1'
        ]);
        $list_data = json_decode(wp_remote_retrieve_body($list_data))->lists ?? [];
        if (!empty($list_data)) {
            foreach ($list_data as $item) {
                array_push($list_ids, ['label' => $item->name, 'value' => $item->list_id]);
            }
        }
        // Get fields
        $field_data = wp_remote_get('https://api.cc.email/v3/contact_custom_fields', [
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $constantcontact_access_token,
                'Content-Type' => 'application/json'
            ],
            'httpversion' => '1.1'
        ]);
        $field_data = json_decode(wp_remote_retrieve_body($field_data))->custom_fields ?? [];
        //echo "<pre>"
        if (!empty($field_data)) {
            foreach ($field_data as $tag) {
                array_push($fields, ['label' => $tag->label, 'value' => $tag->custom_field_id]);
            }
        }
        return [
            'list_ids' => $list_ids,
            'fields' => $fields,
            'loaded' => true
        ];
    }

    public function sunformbuilder_zohocrm_get_data($settings)
    {
        $zoho_domain = get_option('sunformbuilder_zoho_api_domain');
        $zoho_module = $settings['zohocrm']['module_selected'];
        $zoho_request_url = "$zoho_domain/crm/v2/settings/fields?module=$zoho_module";
        $zoho_fields = $settings['zohocrm']['fields'];
        $zoho_required_fields = $settings['zohocrm']['fields_required'];
        $zoho_mapping_default = $settings['zohocrm']['mappings_default'];
        $zoho_expires_time = get_option('sunformbuilder_zoho_expires_in');

        if (empty($zoho_module)) return false;
        if (time() >= (int) $zoho_expires_time) {
            $token_reset = $this->sunformbuilder_zohocrm_refresh_token();
            if(!$token_reset['status']){
                return [
                    'helper_text_field' => $token_reset['message']
                ];
            }
        }
        $zoho_token = get_option('sunformbuilder_zoho_access_token');
        $zoho_fields[$zoho_module] = [['label' => '-- Select Tag --', 'value' => '', 'disabled' => true]];
        $zoho_required_fields[$zoho_module] = [];
        $zoho_mapping_default[$zoho_module] = [];

        $args = [
            'headers' => [
                'Authorization' => 'Zoho-oauthtoken ' . $zoho_token,
                'Content-Type' => 'application/x-www-form-urlencoded'
            ],
            'httpversion' => '1.1',
        ];
        $response = wp_remote_get($zoho_request_url, $args);
        $response = json_decode(wp_remote_retrieve_body($response));
        $fields = $response->fields;
        foreach ($fields as $field) {
            $label = $field->field_label . "  ({$field->data_type})";
            if ($field->data_type == 'date' || $field->data_type == 'boolean') {
                $name = $field->api_name . '@' . $field->data_type;
            } elseif ($field->data_type == 'multiselectpicklist') {
                $name = $field->api_name . '@' . $field->data_type;
            } else {
                $name = $field->api_name;
                $label = $field->field_label;
            }

            array_push($zoho_fields[$zoho_module], ['label' => $label, 'value' => $name]);

            if ($field->system_mandatory) {
                array_push($zoho_required_fields[$zoho_module], $name);
                array_push($zoho_mapping_default[$zoho_module], ['tag_name' => $name, 'field_name' => '', 'custom_value' => '']);
            }
        }
        // }
        return [
            'fields' => $zoho_fields,
            'fields_required' => $zoho_required_fields,
            'mappings_default' => $zoho_mapping_default,
            'helper_text_field' => 'Click to reload fields from Zoho CRM.',
            'loaded' => true
        ];
    }

    public function sunformbuilder_mailerlite_get_data($settings)
    {
        $token_type = isset($settings['mailerlite']['type']) ? $settings['mailerlite']['type'] : false;
        $list_ids = [['label' => '-- Select List --', 'value' => '', 'disabled' => true]];
        $fields = [['label' => '-- Select Tag --', 'value' => '', 'disabled' => true]];
        $token = $token_type === 'custom' ? $settings['mailerlite']['api_key_cusom'] : get_option('sunformbuilder_mailerlite_api_token');
        if (!empty($token)) {
            $args = [
                'headers' => [
                    'X-MailerLite-ApiKey' => $token
                ],
                'httpversion' => '1.1',
            ];
            $response = wp_remote_get('https://api.mailerlite.com/api/v2/groups', $args);
            $list_data = json_decode(wp_remote_retrieve_body($response));
            foreach ($list_data as $item) {
                array_push($list_ids, ['label' => $item->name, 'value' => (string)$item->id]);
            };
            // Get fields
            $fields_request = wp_remote_get('https://api.mailerlite.com/api/v2/fields', $args);
            $fields_data = json_decode(wp_remote_retrieve_body($fields_request));
            foreach ($fields_data as $item) {
                array_push($fields, ['label' => $item->title, 'value' => $item->key]);
            }
            return [
                'list_ids' => $list_ids,
                'fields' => $fields,
                'loaded' => true
            ];
        } else {
            return [
                'list_help_text' => 'Please enter API Token to load lists.'
            ];
        }
    }

    public function sunformbuilder_sendfox_get_data($settings)
    {
        $token_type = isset($settings['sendfox']['type']) ? $settings['sendfox']['type'] : false;
        $list_ids = [['label' => '-- Select List --', 'value' => '', 'disabled' => true]];
        $token = $token_type === 'custom' ? $settings['sendfox']['api_key_cusom'] : get_option('sunformbuilder_sendfox_access_token');
        if (!empty($token)) {
            $url = 'https://api.sendfox.com/lists';
            $args = [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token
                ],
                'httpversion' => '1.1',
            ];
            $response = wp_remote_get($url, $args);
            $list_data = json_decode(wp_remote_retrieve_body($response))->data;
            if (!empty($list_data)) {
                foreach ($list_data as $key => $item) {
                    array_push($list_ids, ['label' => $item->name, 'value' => $item->id]);
                }
            }

            return [
                'list_ids' => $list_ids,
                'loaded' => true,
                'fields' => [['label' => '-- Select Tag --', 'value' => '', 'disabled' => true], ['label' => 'First Name', 'value' => 'first_name'], ['label' => 'Last Name', 'value' => 'last_name'], ['label' => 'IP Address', 'value' => 'ip_address']]
            ];
        } else {
            return [
                'list_help_text' => 'Please enter Access Token to load lists.'
            ];
        }
    }

    public function sunformbuilder_brevo_get_data($settings)
    {
        $api_key_type = isset($settings['brevo']['type']) ? $settings['brevo']['type'] : false;
        $list_ids = [['label' => '-- Select List --', 'value' => '', 'disabled' => true]];
        $fields = [['label' => '-- Select Tag --', 'value' => '', 'disabled' => true], ['label' => 'EMAIL', 'value' => 'EMAIL']];
        $api_key = $api_key_type === 'custom' ? $settings['brevo']['api_key_cusom'] : get_option('sunformbuilder_brevo_api_key');
        if (!empty($api_key)) {
            $args = [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'api-key' => $api_key
                ]
            ];
            $response = wp_remote_get("https://api.brevo.com/v3/contacts/lists?limit=50&offset=0&sort=desc", $args);
            $result = json_decode(wp_remote_retrieve_body($response));
            if (!empty($result->code) && !empty($result->message)) {
                return [
                    'list_ids' => [],
                    'fields' => [],
                    'list_help_text' => $result->message
                ];
            } else {
                foreach ($result->lists as $item) {
                    array_push($list_ids, ['label' => $item->name, 'value' => $item->id]);
                }
                //Get Field
                $fields_result = wp_remote_get("https://api.brevo.com/v3/contacts/attributes", $args);
                $fields_result = json_decode(wp_remote_retrieve_body($fields_result));
                if (!empty($fields_result->attributes)) {
                    foreach ($fields_result->attributes as $item) {
                        if ($item->category == 'normal') {
                            array_push($fields, ['label' => $item->name, 'value' => $item->name]);
                        }
                    }
                }
                return [
                    'list_ids' => $list_ids,
                    'fields' => $fields,
                    'list_help_text' => 'Select the Brevo list to which you want to add contacts.',
                    'loaded' => true
                ];
            }
        } else {
            return [
                'list_help_text' => 'Please enter API Key to load lists.'
            ];
        }
    }

    public function sunformbuilder_activecampaign_get_data($settings)
    {
        $api_type = isset($settings['activecampaign']['type']) ? $settings['activecampaign']['type'] : false;
        $api_url = $api_type === 'custom' ? $settings['activecampaign']['api_url_cusom'] : get_option('sunformbuilder_activecampaign_api_url');
        $api_key = $api_type === 'custom' ? $settings['activecampaign']['api_key_cusom'] : get_option('sunformbuilder_activecampaign_api_key');
        if (!empty($api_key) && !empty($api_url)) {
            $params = [
                'api_key' => $api_key,
                'api_action' => 'list_list',
                'api_output' => 'serialize',
                'ids' => 'all',
                'full' => 1,
            ];
            $query = "";
            foreach ($params as $key => $value)
                $query .= urlencode($key) . '=' . urlencode($value) . '&';
            $query = rtrim($query, '& ');
            $api_url = rtrim($api_url, '/ ');
            $api = "$api_url/admin/api.php?$query";
            $response = wp_remote_get($api);
            $response = wp_remote_retrieve_body($response);
            if (!$response) {
                return [
                    'list_id_help_text' => 'Could not connect to ActiveCampaign. Please check your API URL and API Key.'
                ];
            }
            $result = unserialize($response);
            $listID = [['label' => '-- Select List --', 'value' => '', 'disabled' => true]];
            foreach ($result as $key => $value) {
                if (isset($value['id']) && isset($value['name'])) {
                    array_push($listID, ['label' => $value['name'], 'value' => $value['id']]);
                }
            }
            $fields = $this->sunformbuilder_activecampaign_get_field($api_key, $api_url);
            return [
                'list_ids' => $listID,
                'fields' => $fields,
                'loaded' => true
            ];
        } else {
            return [
                'list_id_help_text' => 'Please enter API URL and API Key to load lists.'
            ];
        }
    }

    public function sunformbuilder_activecampaign_get_field($api_key, $api_url)
    {
        $params = [
            'api_key' => $api_key,
            'api_action' => 'list_field_view',
            'api_output' => 'serialize',
            'ids' => 'all',
        ];
        $query = "";
        foreach ($params as $key => $value)
            $query .= urlencode($key) . '=' . urlencode($value) . '&';
        $query = rtrim($query, '& ');

        $api_url = rtrim($api_url, '/ ');
        $api = $api_url . '/admin/api.php?' . $query;

        $response = wp_remote_get($api);
        $response = wp_remote_retrieve_body($response);
        if (!$response) {
            return false;
        }
        $result = unserialize($response);
        $fields = [['label' => 'First Name', 'value' => 'firstName'], ['label' => 'Last Name', 'value' => 'lastName'], ['label' => 'Phone', 'value' => 'phone']];
        foreach ($result as $key => $value) {
            if (!empty($value['tag']) && $value['tag'] != 's' && $value['tag'] != 'S') {
                array_push($fields, ['label' => $value['perstag'], 'value' => $value['id']]);
            }
        }
        return $fields;
    }
    public function sunformbuilder_mailchimp_get_data($settings)
    {
        $api_key_type = isset($settings['mailchimp']['type']) ? $settings['mailchimp']['type'] : false;
        $api_key = $api_key_type === 'custom' ? $settings['mailchimp']['api_key_cusom'] : get_option('sunformbuilder_mailchimp_api_key');
        if (!empty($api_key)) {
            $url_get_list = 'https://' . substr($api_key, strpos($api_key, '-') + 1) . '.api.mailchimp.com/3.0/lists/';
            $list_id_selected = isset($settings['mailchimp']['list_id_selected']) ? $settings['mailchimp']['list_id_selected'] : '';
            //Get List
            $lists = $this->sunformbuilder_mailchimp_get_connect($url_get_list, 'GET', $api_key, ['fields' => 'lists', 'count' => 100])->lists ?? [];
            $list_ids = [['label' => '-- Select List --', 'value' => '', 'disabled' => true]];
            foreach ($lists as $item) {
                array_push($list_ids, ['label' => $item->name, 'value' => $item->id]);
            }
            if (!empty($list_id_selected)) {
                $groups = $this->sunformbuilder_mailchimp_get_groups($api_key, $list_id_selected);
                $fields = $this->sunformbuilder_mailchimp_get_fields($api_key, $list_id_selected);
            }

            return [
                "fields" => $fields ?? [],
                "groups" => $groups ?? [],
                "list_ids" => $list_ids ?? [],
                "loaded" => true
            ];
        } else {
            return false;
        }
    }
    public function sunformbuilder_mailchimp_get_groups($api_key, $list_id)
    {
        $groups = [];
        $url_get_group = "https://" . substr($api_key, strpos($api_key, '-') + 1) . ".api.mailchimp.com/3.0/lists/$list_id/interest-categories/";
        $interest_categories = $this->sunformbuilder_mailchimp_get_connect($url_get_group, 'GET', $api_key, ['count' => 100])->categories;
        foreach ($interest_categories as $cat) {
            $categorys = $this->sunformbuilder_mailchimp_get_groups_category($api_key, $list_id, $cat->id, $cat->title);
            foreach ($categorys as $key => $val) {
                $groups[$key] = $val;
            }
        }
        return $groups;
    }

    public function sunformbuilder_mailchimp_get_groups_category($api_key, $list_id, $group_id, $title)
    {
        $data = [
            'count' => 100,
        ];
        $category = [];
        $url_get_cat = "https://" . substr($api_key, strpos($api_key, '-') + 1) . ".api.mailchimp.com/3.0/lists/$list_id/interest-categories/$group_id/interests/";
        $result = $this->sunformbuilder_mailchimp_get_connect($url_get_cat, 'GET', $api_key, $data);
        foreach ($result->interests as $item) {
            $category["$title-{$item->name}"] = $item->id;
        }
        return $category;
    }

    public function sunformbuilder_mailchimp_get_fields($api_key, $list_id)
    {
        $fields = [['label' => 'Tags', 'value' => 'tags']];
        $url_get_fields = "https://" . substr($api_key, strpos($api_key, '-') + 1) . ".api.mailchimp.com/3.0/lists/$list_id/merge-fields/";
        $merge_fields = $this->sunformbuilder_mailchimp_get_connect($url_get_fields, 'GET', $api_key, ['count' => 100])->merge_fields ?? [];
        foreach ($merge_fields as $key => $item) {
            array_push($fields, ['label' => $item->name, 'value' => $item->tag]);
        }
        return $fields;
    }
    public function sunformbuilder_mailchimp_get_connect($url, $request_type, $api_key, $data = [])
    {
        $args = [
            'method' => $request_type,
            'sslverify' => false,
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode('user:' . $api_key),
                'Content-Type' => 'application/json'
            ],
        ];
        if ($request_type != 'GET') {
            $args['body'] = json_encode($data);
        }
        $response = wp_remote_request($url, $args);
        return json_decode(wp_remote_retrieve_body($response));
    }
}
new SFBuilder_Pro_Integration_Manager();
