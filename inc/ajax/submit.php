<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SFBuilder_Pro_Ajax_Submit_Form extends SFBuilder_Pro_Helper
{
    public $redirect = [
        'enabled' => false,
        'link' => '',
        'open_in_new_tab' => false
    ];

    public $attachment_email = [];
    public $attachment_email_2 = [];
    public $submit_id = false;

    public $current_upload_directory = 'sunformbuilder';

    public function __construct()
    {
        parent::__construct();
        add_action('wp_ajax_sunformbuilder_submit_from', [$this, 'sunformbuilder_submit_from']);
        add_action('wp_ajax_nopriv_sunformbuilder_submit_from', [$this, 'sunformbuilder_submit_from']);
    }

    public function sunformbuilder_submit_from()
    {
        if (isset($_POST['nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'sunformbuilder_pro_nonce')) {
            //unset(); // Đang ở đây cần xóa bỏ một số ko cần thiết trong forn
            $form_data = $_POST;
            //echo "<pre>"; var_dump($_FILES); die('submit form');
            //$field_attribute = $_POST['field_attribute'];
            $form_ID = !empty($_POST['formID']) ? sanitize_text_field(wp_unslash($_POST['formID'])) : '';
            $post_form_id = !empty($_POST['post_form_id']) ? sanitize_text_field(wp_unslash($_POST['post_form_id'])) : '';
            $post_id = !empty($_POST['post_id']) ? absint(wp_unslash($_POST['post_id'])) : 0;
            $page_url = $post_id ? get_permalink($post_id) : '';

            $settings = $this->sunformbuilder_get_form_settings($post_form_id, $form_ID);
            $form_name = $settings['form']['name'] ?? $form_ID;
            $submit_data = $this->sunformbuilder_get_form_data($settings, $form_data);
            $save_to_database = isset($settings['form']['save_to_database']) ? true : false;

            // Recaptcha v2 check
            $has_recaptcha_v2 = !empty(get_option('sunformbuilder_recaptcha_v2_site_key')) && !empty(get_option('sunformbuilder_recaptcha_v2_secret_key')) && $this->has_recaptcha_v2($settings['fields']);
            if ($has_recaptcha_v2) {
                $has_recaptcha_v2_token = !empty($form_data['g-recaptcha-response']) ? sanitize_text_field(wp_unslash($form_data['g-recaptcha-response'])) : false;
                $recaptcha_data = $this->has_recaptcha_v2($settings['fields']);

                if ($has_recaptcha_v2_token) {
                    $recaptcha_v2_response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
                        'body' => [
                            'secret' => get_option('sunformbuilder_recaptcha_v2_secret_key'),
                            'response' => $has_recaptcha_v2_token,
                        ],
                    ]);
                    $recaptcha_v2_error_status = [
                        'status' => 'error',
                        'msg' => $recaptcha_data['recaptcha_v2_error_message'] ?? 'Error verifying reCAPTCHA. Please try again.'
                    ];

                    if (is_wp_error($recaptcha_v2_response)) {
                        $this->sunformbuilder_send_response_submit($recaptcha_v2_error_status, $recaptcha_v2_response);
                    } else {
                        $recaptcha_v2_body = wp_remote_retrieve_body($recaptcha_v2_response);
                        $recaptcha_v2_result = json_decode($recaptcha_v2_body, true);
                        if (empty($recaptcha_v2_result['success']) || !$recaptcha_v2_result['success']) {
                            $this->sunformbuilder_send_response_submit($recaptcha_v2_error_status, $recaptcha_v2_result);
                        }
                    }
                }
            }

            // Recaptcha v3 check
            $has_recaptcha_v3 = !empty(get_option('sunformbuilder_recaptcha_v3_site_key')) && !empty(get_option('sunformbuilder_recaptcha_v3_secret_key')) && !empty($settings['action_submit_settings']['recaptcha_v3']['enabled']);
            if ($has_recaptcha_v3) {
                $has_recaptcha_v3_token = !empty($form_data['recaptcha_v3_token']) ? sanitize_text_field(wp_unslash($form_data['recaptcha_v3_token'])) : false;

                if ($has_recaptcha_v3_token) {
                    $recaptcha_v3_response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
                        'body' => [
                            'secret' => get_option('sunformbuilder_recaptcha_v3_secret_key'),
                            'response' => $has_recaptcha_v3_token,
                        ],
                    ]);
                    $recaptcha_v3_error_status = [
                        'status' => 'error',
                        'msg' => $this->array_value_exists($settings, ['action_submit_settings', 'recaptcha_v3', 'error_message'], 'Error verifying reCAPTCHA. Please try again.')
                    ];

                    if (is_wp_error($recaptcha_v3_response)) {

                        $this->sunformbuilder_send_response_submit($recaptcha_v3_error_status, $recaptcha_v3_response);
                    } else {
                        $recaptcha_v3_body = wp_remote_retrieve_body($recaptcha_v3_response);
                        $recaptcha_v3_result = json_decode($recaptcha_v3_body, true);
                        if (!empty($recaptcha_v3_result['success']) && $recaptcha_v3_result['success']) {
                            $recaptcha_v3_score_threshold = !empty($settings['action_submit_settings']['recaptcha_v3']['score']) ? floatval($settings['action_submit_settings']['recaptcha_v3']['score']) : 0.5;
                            if ($recaptcha_v3_result['score'] < $recaptcha_v3_score_threshold) {
                                $this->sunformbuilder_send_response_submit($recaptcha_v3_error_status, $recaptcha_v3_result);
                            }
                        } else {
                            $this->sunformbuilder_send_response_submit($recaptcha_v3_error_status, $recaptcha_v3_result);
                        }
                    }
                }
            }
            //echo "<pre>"; var_dump($submit_data); die('submit_data');
            if (isset($_FILES)) {
                $uploaded_files = $this->sunformbuilder_upload_files($_FILES, $settings['fields']);
                $submit_data = array_merge($submit_data, $uploaded_files);
            }
            $action_submit = $settings['action_submit'] ?? ['Email'];
            if ($save_to_database) {
                array_push($action_submit, 'Save to Database');
            }
            $action_submit = $this->moveEmailsToEnd($action_submit);

            unset($form_data['action'], $form_data['field_attribute'], $form_data['formID'], $form_data['nonce']); // Xem viết hàm unset 1 lần cho khỏe

            /**
             * Filter dữ liệu submit trước khi xử lý các action.
             *
             * @param array  $submit_data   Dữ liệu form đã được xử lý.
             * @param array  $settings      Cấu hình của form.
             */
            $submit_data = apply_filters('sfbuilder_before_submit_data', $submit_data, $settings);

            /**
             * Action chạy trước khi xử lý submit form.
             * Cho phép bên thứ ba thực thi logic tùy chỉnh trước khi form được submit.
             *
             * @param array  $submit_data   Dữ liệu form đã được xử lý.
             * @param array  $settings      Cấu hình của form.
             * @param int    $post_id       ID trang chứa form.
             */
            do_action('sfbuilder_before_submit', $submit_data, $settings, $post_id);

            // Lấy settings từ form
            foreach ($action_submit as $action) {
                switch ($action) {
                    case 'Email':
                        $this->sunformbuilder_send_email($submit_data, $settings, $page_url);
                        break;
                    case 'Email 2':
                        $this->sunformbuilder_send_email2($submit_data, $settings, $page_url);
                        break;
                    case 'Mailchimp':
                        $this->sunformbuilder_action_mailchimp_submit($submit_data, $settings);
                        break;
                    case 'Active Campaign':
                        $this->sunformbuilder_action_activecampaign_submit($submit_data, $settings);
                        break;
                    case 'Brevo':
                        $this->sunformbuilder_action_brevo_submit($submit_data, $settings);
                    case 'SendFox';
                        $this->sunformbuilder_action_sendfox_submit($submit_data, $settings);
                        break;
                    case 'Mailerlite':
                        $this->sunformbuilder_action_mailerlite_submit($submit_data, $settings);
                        break;
                    case 'Zoho CRM':
                        $this->sunformbuilder_action_zohocrm_submit($submit_data, $settings);
                        break;
                    case 'Constantcontact':
                        $this->sunformbuilder_action_constantcontact_submit($submit_data, $settings);
                        break;
                    case 'Google Sheets':
                        $this->sunformbuilder_action_google_sheets_submit($submit_data, $settings);
                        break;
                    case 'Redirect':
                        $this->sunformbuilder_action_redirect_submit($submit_data, $settings);
                        // Hook
                        $this->redirect = apply_filters('sfbuilder_after_submit_redirect', $this->redirect, $submit_data, $form_name);
                        break;
                    case 'Save to Database':
                        $this->sunformbuilder_save_submit_data($submit_data, $settings, $post_form_id, $form_ID, $post_id);
                        break;
                }
            }
            /**
             * Action chạy sau khi tất cả action submit đã được xử lý xong.
             *
             * @param array  $submit_data   Dữ liệu form đã được xử lý.
             * @param array  $settings      Cấu hình của form.
             * @param string $form_name     Tên form.
             * @param string $form_ID       ID form.
             * @param string $post_form_id  ID post chứa form.
             * @param int    $post_id       ID trang chứa form.
             * @param int|false $submit_id  ID bản ghi submit đã lưu (nếu có).
             */
            do_action('sfbuilder_after_submit', $submit_data, $settings, $form_name, $form_ID, $post_form_id, $post_id, $this->submit_id);

            $ajax_form_status = [
                'status' => 'success',
                'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'success'], 'Your submission was successful.'),
                'redirect' => $this->redirect
            ];

            /**
             * Filter response trả về cho client sau khi submit thành công.
             *
             * @param array  $ajax_form_status Response trả về cho client.
             * @param array  $submit_data      Dữ liệu form.
             * @param array  $settings         Cấu hình của form.
             * @param string $form_name        Tên form.
             */
            $ajax_form_status = apply_filters('sfbuilder_submit_response', $ajax_form_status, $submit_data, $settings, $form_name);

            echo wp_json_encode($ajax_form_status);
            wp_die();
        } else {
            die("Nonce verification failed.");
        }
    }

    public function sunformbuilder_action_redirect_submit($submit_data, $settings)
    {
        $redirect_settings = $settings['action_submit_settings']['redirect'] ?? [];

        if (!empty($redirect_settings['link_to'])) {
            $redirect_open_in_new_tab = !empty($redirect_settings['open_in_new_tab']) ? true : false;
            $redirect_url_parameter = !empty($redirect_settings['url_parameter']) ? true : false;
            $redirect_query_parameter = '';

            if ($redirect_url_parameter) {
                $redirect_parameter_from = $redirect_settings['parameter'] ?? [];

                if (in_array("custom_value", $redirect_parameter_from)) {
                    unset($redirect_parameter_from[array_search("custom_value", $redirect_parameter_from)]);
                    $redirect_custom_parameter = $redirect_settings['custom_parameter'] ?? [];
                    $redirect_custom_parameter = $this->get_custom_parameter_rediect_url($redirect_custom_parameter);
                }
                $redirect_parameter_from = $this->get_parameter_form_redirec_url($redirect_parameter_from, $submit_data);
                $redirect_parameter = array_merge($redirect_parameter_from, $redirect_custom_parameter ?? []);
                $redirect_query_parameter = http_build_query($redirect_parameter);
            }
            $this->redirect  = [
                'enabled' => true,
                'link' => $redirect_settings['link_to'] . '?' . http_build_query($redirect_parameter),
                'open_in_new_tab' => $redirect_open_in_new_tab
            ];
        }
    }

    public function sunformbuilder_action_google_sheets_submit($submit_data, $settings)
    {
        $google_sheets_settings = $settings['action_submit_settings']['google_sheets'] ?? [];
        $google_sheets_data = [];
        $google_sheet_expires_in = get_option('sunformbuilder_google_sheets_expires_in');
        $google_sheets_mappings = $google_sheets_settings['mappings'] ?? [];
        if (!empty($google_sheets_mappings)) {
            $google_sheets_id = $google_sheets_settings['id'];
            $google_sheets_tab = $google_sheets_settings['tab_name'];
            if (time() > (int) $google_sheet_expires_in) {
                $this->sunformbuilder_google_sheets_refresh_token();
            }
            $google_sheets_access_token = get_option('sunformbuilder_google_sheets_access_token');
            foreach ($google_sheets_mappings as $item) {
                $google_sheets_data[$item['field_name']] = $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item);
            }

            $google_sheet_data_row = $this->google_sheets_build_row($google_sheets_mappings, $google_sheets_data);
            $google_response = $this->sunformbuilder_google_sheets_add_new_row($google_sheets_id, $google_sheets_tab, $google_sheet_data_row, $google_sheets_access_token);
            if (empty($google_response['spreadsheetId'])) {
                $google_sheets_status = [
                    'status' => 'error',
                    'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], $google_response['error']['message'])
                ];
                $this->sunformbuilder_send_response_submit($google_sheets_status, $google_response);
            }
        }
    }

    public function sunformbuilder_action_constantcontact_submit($submit_data, $settings)
    {
        $constantcontact_settings = $settings['action_submit_settings']['constantcontact'] ?? [];
        $constantcontact_acceptance = true;
        if (!empty($constantcontact_settings['acceptance_field']) && !empty($constantcontact_settings['acceptance_value'])) {
            $constantcontact_acceptance = !empty($submit_data[$constantcontact_settings['acceptance_value']]) ? true : false;
        }
        if ($constantcontact_acceptance) {
            $data_constantcontact = [];
            $constantcontact_token_expires = get_option('sunformbuilder_constantcontact_time_token_expires');
            if (time() >= (int)$constantcontact_token_expires) {
                $this->sunformbuilder_constantcontact_refresh_token();
            }
            $constantcontact_access_token = get_option('sunformbuilder_constantcontact_access_token');
            $constantcontact_fields_map = $constantcontact_settings['mappings'] ?? [];
            if (!empty($constantcontact_fields_map)) {
                foreach ($constantcontact_fields_map as $item) {
                    $constantcontact_tag = $item['tag_name'];
                    switch ($constantcontact_tag) {
                        case 'email_address':
                            if ($constantcontact_settings['update_contact']) {
                                $data_constantcontact['email_address'] = $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item);
                            } else {
                                $data_constantcontact['email_address'] = [
                                    'address' => $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item),
                                    'permission_to_send' => 'implicit'
                                ];
                            }
                            break;
                        case 'phone_number':
                            if ($constantcontact_settings['update_contact']) {
                                $data_constantcontact['phone_numbers'] = $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item);
                            } else {
                                $data_constantcontact['phone_numbers'] = [
                                    [
                                        'phone_number' => $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item),
                                        'kind' => $item['kind'] ?? 'home'
                                    ]
                                ];
                            }
                            break;
                        case 'taggings':
                            $taggings = $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item);
                            $data_constantcontact['taggings'] = explode(',', $taggings);
                            break;
                        case 'street':
                        case 'city':
                        case 'state':
                        case 'postal_code':
                        case 'country':
                            $constant_contact_street_addresses['street_addresses'][$constantcontact_tag] = $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item);
                            $constant_contact_street_addresses['street_addresses']['kind'] = $item['kind'] ?? 'home';
                            break;
                        default:
                            if (strlen($constantcontact_tag) > 32) {
                                $data_constantcontact['custom_fields'] = [
                                    [
                                        'custom_field_id' => $constantcontact_tag,
                                        'value' => $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item)
                                    ]
                                ];
                            } else {
                                $data_constantcontact[$constantcontact_tag] = $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item);
                            }
                    }
                }
            }
            $data_constantcontact['create_source'] = 'Contact';
            $data_constantcontact['list_memberships'] = explode(',', $constantcontact_settings['list_id_selected']);
            $constantcontact_response = $this->sunformbuilder_constantcontact_create_contact($constantcontact_access_token, json_encode($data_constantcontact), $constantcontact_settings['update_contact']);
            $constantcontact_response = json_decode($constantcontact_response);
            if (empty($constantcontact_response->contact_id)) {
                if (!empty($constantcontact_response[0]->error_key) && $constantcontact_response[0]->error_key == 'contacts.api.conflict') {
                    $constantcontact_status = [
                        'status' => 'error',
                        'msg' => $settings['additional_options']['messages']['member_exists'] ?? 'Member already added.'
                    ];
                } else {
                    $constantcontact_status = [
                        'status' => 'error',
                        'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                    ];
                }
                $this->sunformbuilder_send_response_submit($constantcontact_status, $constantcontact_response);
            }
        }
    }

    public function sunformbuilder_action_zohocrm_submit($submit_data, $settings)
    {
        $zohocrm_settings = $settings['action_submit_settings']['zohocrm'] ?? [];
        $zohocrm_acceptance = true;
        $zoho_module = $zohocrm_settings['module_selected'] ?? 'Leads';
        $zoho_domain = get_option('sunformbuilder_zoho_api_domain');
        $zoho_request_url = "$zoho_domain/crm/v2/$zoho_module";
        $zoho_expires_time = get_option('sunformbuilder_zoho_expires_in');
        if (!empty($zohocrm_settings['acceptance_field']) && !empty($zohocrm_settings['acceptance_value'])) {
            $zohocrm_acceptance = !empty($submit_data[$zohocrm_settings['acceptance_value']]) ? true : false;
        }

        if ($zohocrm_acceptance) {
            $zoho_data = [];
            $zohocrm_fields_map = $zohocrm_settings['mappings'][$zoho_module] ?? [];
            if (!empty($zohocrm_fields_map)) {
                foreach ($zohocrm_fields_map as $item) {
                    if (strpos($item['tag_name'], '@')) {
                        $zoho_field_type = substr($item['tag_name'], strpos($item['tag_name'], '@') + 1);
                        $zoho_tag_name = substr($item['tag_name'], 0, strpos($item['tag_name'], "@"));
                        if ($zoho_field_type == 'date') {
                            $zoho_data[$zoho_tag_name] = date_format(date_create($this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item)), 'Y-m-d');
                        } elseif ($zoho_field_type == 'boolean') {
                            $zoho_value = $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item);
                            $zoho_data[$zoho_tag_name] = $zoho_value ? true : false;
                        } elseif ($zoho_field_type == 'multiselectpicklist') {
                            $zoho_data[$zoho_tag_name] = explode(',', $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item));
                        }
                    } else {
                        $zoho_data[$item['tag_name']] = $this->sunformbuilder_get_value_repeater_api($submit_data, $item['field_name'], $item);
                    }
                }
                if (time() >= (int) $zoho_expires_time) {
                    $token_reset = $this->sunformbuilder_zohocrm_refresh_token();
                    if (!$token_reset['status']) {
                        $zohocrm_status = [
                            'status' => 'error',
                            'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                        ];
                        $this->sunformbuilder_send_response_submit($zohocrm_status);
                    }
                }
                $zoho_access_token = get_option('sunformbuilder_zoho_access_token');
                $zoho_result = $this->sunformbuilder_zohocrm_add_record($zoho_data, $zoho_request_url, $zoho_access_token);
                $zoho_result = json_decode($zoho_result);
                if (!empty($result->data[0]->code) && $result->data[0]->code != 'SUCCESS') {
                    $zohocrm_status = [
                        'status' => 'error',
                        'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                    ];
                    $this->sunformbuilder_send_response_submit($zohocrm_status, $zoho_result);
                }
            }
        }
    }

    public function sunformbuilder_action_mailerlite_submit($submit_data, $settings)
    {
        $mailerlite_settings = $settings['action_submit_settings']['mailerlite'] ?? [];
        $mailerlite_acceptance = true;
        if (!empty($mailerlite_settings['acceptance_field']) && !empty($mailerlite_settings['acceptance_value'])) {
            $mailerlite_acceptance = !empty($submit_data[$mailerlite_settings['acceptance_value']]) ? true : false;
        }

        if ($mailerlite_acceptance) {
            $data_mailerlite = [];
            $mailerlite_api_type = $mailerlite_settings['type'] ?? 'default';
            $mailerlite_access_token = $mailerlite_api_type === 'custom' ? $mailerlite_settings['api_key_cusom'] : get_option('sunformbuilder_mailerlite_api_token');
            $mailerlite_fields_map = $mailerlite_settings['mappings'] ?? [];
            $mailerlite_api_group = $mailerlite_settings['list_id_selected'] ?? '';

            if (!empty($mailerlite_fields_map)) {
                $mailerlite_api_url = !empty($mailerlite_api_group) ? 'https://api.mailerlite.com/api/v2/groups/' . $mailerlite_api_group . '/subscribers' : 'https://api.mailerlite.com/api/v2/subscribers';
                foreach ($mailerlite_fields_map as $field) {
                    $value = $this->sunformbuilder_get_value_repeater_api($submit_data, $field['field_name'], $field);
                    if (in_array($field['tag_name'], ['name', 'email'])) {
                        $data_mailerlite[$field['tag_name']] = $value;
                    } else {
                        $data_mailerlite['fields'][$field['tag_name']] = $value;
                    }
                }
                $subscribe = $this->sunformbuilder_mailerlite_get_subscriber($mailerlite_access_token, $data_mailerlite['email']);
                if ($subscribe == false || ($subscribe == true && $mailerlite_settings['update_contact'])) {
                    $mailerlite_result = $this->sunformbuilder_mailerlite_add_contact($mailerlite_access_token, $data_mailerlite, $mailerlite_api_url);
                    $code = wp_remote_retrieve_response_code($mailerlite_result);
                    if (is_wp_error($mailerlite_result) || !in_array($code, [200, 201])) {
                        $mailerlite_status = [
                            'status' => 'error',
                            'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                        ];
                        $this->sunformbuilder_send_response_submit($mailerlite_status, wp_remote_retrieve_body($mailerlite_result));
                    }
                } else {
                    $mailerlite_status = [
                        'status' => 'error',
                        'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'member_exists'], 'Member already added.')
                    ];
                    $this->sunformbuilder_send_response_submit($mailerlite_status, false);
                }
            }
        }
    }

    public function sunformbuilder_action_sendfox_submit($submit_data, $settings)
    {
        $sendfox_settings = $settings['action_submit_settings']['sendfox'] ?? [];
        $sendfox_acceptance = true;
        if (!empty($sendfox_settings['acceptance_field']) && !empty($sendfox_settings['acceptance_value'])) {
            $sendfox_acceptance = !empty($submit_data[$sendfox_settings['acceptance_value']]) ? true : false;
        }

        if ($sendfox_acceptance) {
            $data_sendfox = [];
            $sendfox_api_type = $sendfox_settings['type'] ?? 'default';
            $sendfox_access_token = $sendfox_api_type === 'custom' ? $sendfox_settings['api_key_cusom'] : get_option('sunformbuilder_sendfox_access_token');
            $sendfox_fields_map = $sendfox_settings['mappings'] ?? [];
            if (!empty($sendfox_fields_map)) {
                foreach ($sendfox_fields_map as $field) {
                    $value = $this->sunformbuilder_get_value_repeater_api($submit_data, $field['field_name'], $field);
                    $data_sendfox[$field['tag_name']] = $value;
                }
                $sendfox_result = json_decode($this->sunformbuilder_sendfox_add_contact($sendfox_access_token, $data_sendfox));
                if (!$sendfox_result->id) {
                    $sendfox_status = [
                        'status' => 'error',
                        'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                    ];
                    $this->sunformbuilder_send_response_submit($sendfox_status, $sendfox_result);
                }
            }
        }
    }

    public function sunformbuilder_action_brevo_submit($submit_data, $settings)
    {
        $brevo_settings = $settings['action_submit_settings']['brevo'] ?? [];
        $brevo_acceptance = true;
        if (!empty($brevo_settings['acceptance_field']) && !empty($brevo_settings['acceptance_value'])) {
            $brevo_acceptance = !empty($submit_data[$brevo_settings['acceptance_value']]) ? true : false;
        }
        if ($brevo_acceptance) {
            $data_brevo = [];
            $brevo_api_type = $brevo_settings['type'] ?? 'default';
            $brevo_api_key = $brevo_api_type === 'custom' ? $brevo_settings['api_key_cusom'] : get_option('sunformbuilder_brevo_api_key');
            $brevo_fields_map = $brevo_settings['mappings'] ?? [];
            if (!empty($brevo_fields_map)) {
                foreach ($brevo_fields_map as $field) {
                    $value = $this->sunformbuilder_get_value_repeater_api($submit_data, $field['field_name'], $field);
                    if (in_array($field['tag_name'], ['email', 'SMS', 'EXT_ID', 'WHATSAPP', 'LANDLINE_NUMBER'])) {
                        $data_brevo[$field['tag_name']] = $value;
                    } else {
                        if (strpos($field['tag_name'], '@multiple') != 0) {
                            $data_brevo['attributes'][str_replace('@multiple', '', $field['tag_name'])] = explode(",", $value);
                        } else {
                            $data_brevo['attributes'][$field['tag_name']] = $value;
                        }
                    }
                }
                $data_brevo['listIds'] = array_map('intval', (array) $brevo_settings['list_id_selected']) ?? [];
                $data_brevo['updateEnabled'] = false;
                $brevo_result = $this->sunformbuilder_brevo_add_contact($data_brevo, $brevo_api_key);
                $brevo_result = json_decode($brevo_result);

                if (!empty($brevo_result)) {
                    if (isset($brevo_result->code) && in_array($brevo_result->code, [400, 404, 'duplicate_parameter', 'invalid_parameter'])) {
                        $brevo_status = [
                            'status' => 'error',
                            'msg' => isset($brevo_result->message) ? $brevo_result->message : $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                        ];
                        $this->sunformbuilder_send_response_submit($brevo_status, $brevo_result);
                    }
                }
            }
        }
    }
    public function sunformbuilder_action_activecampaign_submit($submit_data, $settings)
    {
        $activecampaign_settings = $settings['action_submit_settings']['activecampaign'] ?? [];
        $activecampaign_acceptance = true;
        if (!empty($activecampaign_settings['acceptance_field']) && !empty($activecampaign_settings['acceptance_value'])) {
            $activecampaign_acceptance = !empty($submit_data[$activecampaign_settings['acceptance_value']]) ? true : false;
        }
        if ($activecampaign_acceptance) {
            $data_activecampaign = [];
            $activecampaign_api_type = $activecampaign_settings['type'] ?? 'default';
            $activecampaign_api_key = $activecampaign_api_type === 'custom' ? $activecampaign_settings['api_key_cusom'] : get_option('sunformbuilder_activecampaign_api_key');
            $activecampaign_api_url = $activecampaign_api_type === 'custom' ? $activecampaign_settings['api_url_cusom'] : get_option('sunformbuilder_activecampaign_api_url');
            $activecampaign_list_id = $activecampaign_settings['list_id_selected'] ?? '';
            $method = $activecampaign_settings['update_contact'] ? 'PUT' : 'POST';
            if (!empty($activecampaign_list_id)) {
                $data_activecampaign["p[{$activecampaign_list_id}]"] = $activecampaign_list_id;
                $data_activecampaign["status[{$activecampaign_list_id}]"] = 1;
                $data_activecampaign["instantresponders[{$activecampaign_list_id}]"] = 1;
                $data_activecampaign['ip4'] = $this->sunformbuilder_get_remote_ip();
            }
            $activecampaign_fields_map = $activecampaign_settings['mappings'] ?? [];
            if (!empty($activecampaign_api_key) && !empty($activecampaign_api_url)) {
                foreach ($activecampaign_fields_map as $field) {
                    if (in_array($field['tag_name'], ['email', 'firstName', 'lastName', 'phone'])) {
                        $data_activecampaign[$field['tag_name']] = $this->sunformbuilder_get_value_repeater_api($submit_data, $field['field_name'], $field);
                    } else {
                        $data_activecampaign['fieldValues'][] = [
                            'field' => $field['tag_name'],
                            'value' => $this->sunformbuilder_get_value_repeater_api($submit_data, $field['field_name'], $field)
                        ];
                    }
                }
            }
            $activecampaign_result = $this->sunformbuilder_activecampaign_add_member($activecampaign_api_key, $activecampaign_api_url, $data_activecampaign, $method);
            if (!$activecampaign_result->contact) {
                $activecampaign_status = [
                    'status' => 'error',
                    'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                ];
                $this->sunformbuilder_send_response_submit($activecampaign_status, $activecampaign_result);
            }
        }
    }

    public function sunformbuilder_send_email($submit_data, $settings, $page_url)
    {
        $email_settings = $settings['action_submit_settings']['email'] ?? [];
        $email_template_id = $email_settings['template'] ?? get_post_meta(254896, '_sunformbuilder_id_email_template_default', true);
        //Metadata
        $meta_data = $email_settings['meta_data'] ?? ['Date', 'Time', 'Page URL', 'User Agent', 'Remote IP'];
        $meta_data_string = $this->sunformbuilder_get_metadata_data($meta_data, $page_url);

        $email_data = [];
        foreach ($submit_data as $key => $item) {
            if (array_key_exists('value', $item)) {
                $email_data[$key] = $item['value'];
            }
        }
        $email_data['meta_data'] = $meta_data_string;
        $email_content_html = $this->sunformbuilder_get_content_email_template($email_template_id);
        $email_template_data = [
            'submit_id' => $this->submit_id,
            'meta_data' => $meta_data_string,
            'data' => $submit_data
        ];
        $email_template_data = array_merge($email_data, $email_template_data);
        $email_content = $this->sunformbuilder_render_template($email_content_html, $email_template_data);

        $email_to = explode(", ", $email_settings['to'] ?? get_option('admin_email'));
        $email_subject = $email_settings['subject'] ?? 'New message from ' . get_bloginfo('name');
        $email_from = $email_settings['from'] ?? str_ireplace('www.', '', wp_parse_url(home_url(), PHP_URL_HOST));
        $email_from_name = $email_settings['from_name'] ?? get_bloginfo('name');
        $email_reply_to = $email_settings['from_name'] ?? $email_from;

        if ($email_from) {
            $headers[] = "From: $email_from_name";
            $headers[] = "Reply-To: $email_reply_to";
        }
        if (!empty($email_settings['cc'])) {
            $headers[] = 'Cc: ' . $email_settings['cc'];
        }
        if (!empty($email_settings['bcc'])) {
            $headers[] = 'Bcc: ' . $email_settings['bcc'];
        }
        $headers[] = 'Content-Type: text/html; charset=UTF-8';
        if($this->str2_contains($email_content, 'Error rendering template:')){
            $email_status = [
                'status' => 'error',
                'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
            ];
            $this->sunformbuilder_send_response_submit($email_status, 'Please check your email configuration.');
        }
        $send_email = wp_mail($email_to, $email_subject, $email_content, $headers, $this->attachment_email);
        if (!$send_email) {
            $email_status = [
                'status' => 'error',
                'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
            ];
            $this->sunformbuilder_send_response_submit($email_status, 'Please check your email configuration.');
        }
    }

    public function sunformbuilder_send_email2($submit_data, $settings, $page_url)
    {
        $email_settings = $settings['action_submit_settings']['email2'] ?? [];
        $email_template_id = $email_settings['template'] ?? get_post_meta(254897, '_sunformbuilder_id_email2_template_default', true);
        //Metadata
        $meta_data = $email_settings['meta_data'] ?? ['Date', 'Time', 'Page URL', 'User Agent', 'Remote IP'];
        $meta_data_string = $this->sunformbuilder_get_metadata_data($meta_data, $page_url);

        $email_data = [];
        foreach ($submit_data as $key => $item) {
            if (array_key_exists('value', $item)) {
                $email_data[$key] = $item['value'];
            }
        }
        $email_data['meta_data'] = $meta_data_string;
        $email_content_html = $this->sunformbuilder_get_content_email_template($email_template_id);
        $email_template_data = [
            'submit_id' => $this->submit_id,
            'meta_data' => $meta_data_string,
            'data' => $submit_data
        ];
        $email_template_data = array_merge($email_data, $email_template_data);
        $email_content = $this->sunformbuilder_render_template($email_content_html, $email_template_data);

        $email_to = explode(", ", $email_settings['to'] ?? get_option('admin_email'));
        $email_subject = $email_settings['subject'] ?? 'New message from ' . get_bloginfo('name');
        $email_from = $email_settings['from'] ?? str_ireplace('www.', '', wp_parse_url(home_url(), PHP_URL_HOST));
        $email_from_name = $email_settings['from_name'] ?? get_bloginfo('name');
        $email_reply_to = $email_settings['from_name'] ?? $email_from;

        if ($email_from) {
            $headers[] = "From: $email_from_name";
            $headers[] = "Reply-To: $email_reply_to";
        }
        if (!empty($email_settings['cc'])) {
            $headers[] = 'Cc: ' . $email_settings['cc'];
        }
        if (!empty($email_settings['bcc'])) {
            $headers[] = 'Bcc: ' . $email_settings['bcc'];
        }
        $headers[] = 'Content-Type: text/html; charset=UTF-8';
        if($this->str2_contains($email_content, 'Error rendering template:')){
            $email_status = [
                'status' => 'error',
                'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
            ];
            $this->sunformbuilder_send_response_submit($email_status, 'Please check your email configuration.');
        }
        $send_email = wp_mail($email_to, $email_subject, $email_content, $headers, $this->attachment_email_2);
        if (!$send_email) {
            $email_status = [
                'status' => 'error',
                'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
            ];
            $this->sunformbuilder_send_response_submit($email_status, 'Please check your email configuration.');
        }
    }

    public function sunformbuilder_action_mailchimp_submit($submit_data, $settings)
    {
        $mailchimp_settings = $settings['action_submit_settings']['mailchimp'] ?? [];
        $mailchimp_acceptance = true;
        if (!empty($mailchimp_settings['acceptance_field']) && !empty($mailchimp_settings['acceptance_value'])) {
            $mailchimp_acceptance = !empty($submit_data[$mailchimp_settings['acceptance_value']]) ? true : false;
        }

        if ($mailchimp_acceptance) {
            $data_mailchimp = [];
            $mailchimp_api_type = $mailchimp_settings['type'] ?? 'default';
            $mailchimp_api_key = $mailchimp_api_type === 'custom' ? $mailchimp_settings['api_key_cusom'] : get_option('sunformbuilder_mailchimp_api_key');
            $mailchimp_list_id = $mailchimp_settings['list_id_selected'] ?? '';
            $mailchimp_groups = $mailchimp_settings['groups_id_selected'] ?? [];
            $mailchimp_fields_map = $mailchimp_settings['mappings'] ?? [];

            if (!empty($mailchimp_api_key) && !empty($mailchimp_list_id)) {
                if (!empty($mailchimp_groups)) {
                    foreach ($mailchimp_groups as $id) {
                        $data_mailchimp['interests'][$id] = true;
                    }
                }
                foreach ($mailchimp_fields_map as $field) {
                    switch ($field['tag_name']) {
                        case 'email_address':
                            $data_mailchimp[$field['tag_name']] = $this->sunformbuilder_get_value_repeater_api($submit_data, $field['field_name'], $field);
                            break;
                        case 'tags':
                            $tags = $this->sunformbuilder_get_value_repeater_api($submit_data, $field['field_name'], $field);
                            $data_mailchimp['tags'] = explode(',', $tags);
                            break;
                        case 'ADDRESS':
                            $mailchimp_address_fields = $field['address'] ?? [];
                            $data_mailchimp['merge_fields']['ADDRESS'] = $this->sunformbuilder_get_value_repeater_mailchimp_address($submit_data, $mailchimp_address_fields);
                            break;
                        case 'status':
                            $data_mailchimp['status'] = $mailchimp_settings['send_confirm_email'] ? 'pending' : $field['field_name'];
                        default:
                            $data_mailchimp['merge_fields'][$field['tag_name']] = $this->sunformbuilder_get_value_repeater_api($submit_data, $field['field_name'], $field);
                            break;
                    }
                }
                if ($mailchimp_settings['update_contact']) {
                    $member_id = md5(strtolower($data_mailchimp['email_address']));
                    $mailchimp_url = 'https://' . substr($mailchimp_api_key, strpos($mailchimp_api_key, '-') + 1) . '.api.mailchimp.com/3.0/lists/' . $mailchimp_list_id . '/members/' . $member_id . '';
                    $mailchimp_result = $this->sunformbuilder_mailchimp_curl_put_member($mailchimp_url, $mailchimp_api_key, $data_mailchimp);
                    if ((!empty($mailchimp_result->status) && $mailchimp_result->status != 'subscribed')) {
                        $mailchimp_status = [
                            'status' => 'error',
                            'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                        ];
                        $this->sunformbuilder_send_response_submit($mailchimp_status, $mailchimp_result);
                    }
                } else {
                    $mailchimp_url = 'https://' . substr($mailchimp_api_key, strpos($mailchimp_api_key, '-') + 1) . '.api.mailchimp.com/3.0/lists/' . $mailchimp_list_id . '/members/';
                    $mailchimp_result = $this->sunformbuilder_mailchimp_curl_post_member($mailchimp_url, $mailchimp_api_key, $data_mailchimp);
                    if (!empty($mailchimp_result->status) && $mailchimp_result->status != 'subscribed') {
                        $mailchimp_status = (!empty($mailchimp_result->title) && $mailchimp_result->title == 'Member Exists') ? [
                            'status' => 'error',
                            'msg' => $settings['additional_options']['messages']['member_exists'] ?? 'Member already added.'
                        ] : [
                            'status' => 'error',
                            'msg' => $this->array_value_exists($settings, ['additional_options', 'messages', 'error'], 'Your submission failed because of an error.')
                        ];
                        $this->sunformbuilder_send_response_submit($mailchimp_status, $mailchimp_result);
                    }
                }
            }
        }
    }

    public function sunformbuilder_save_submit_data($submit_data, $setting, $post_form_id, $form_ID, $post_id)
    {
        $meta_data = [
            '_date' => [
                'label' => 'Date',
                'value' => date_i18n(get_option('date_format'))
            ],
            '_time' => [
                'label' => 'Time',
                'value' => date_i18n(get_option('time_format'))
            ],
            '_page_url' => [
                'label' => 'Page Url',
                'value' => $post_id ? get_permalink($post_id) : '#',
                'id' => $post_id ?? '0'
            ],
            '_remote_ip' => [
                'label' => 'Remote IP',
                'value' => $this->sunformbuilder_get_remote_ip()
            ],
            '_user_agent' => [
                'label' => 'User Agent',
                'value' => $this->sunformbuilder_get_user_agent()
            ]
        ];
        $data_save = $this->sunformbuilder_get_data_save_db($submit_data, $setting['fields']);
        $data_save['read'] = 'unread';
        $data_save['form_id'] = $form_ID;
        $data_save['post_id'] = $post_id;
        $data_save['post_form_id'] = $post_form_id;
        $data_save['form_name'] = !empty($setting['form']['name']) ? $setting['form']['name'] : 'Form #' . $form_ID;
        $post_data = [
            'post_type' => 'sfb_submissions',
            'post_status' => 'publish',
            'post_title' => $form_ID,
            'post_content' => wp_json_encode($data_save, JSON_UNESCAPED_UNICODE),
            'meta_input' => [
                'meta_data' => $meta_data,
            ]
        ];
        $submit_id = wp_insert_post($post_data, true);
        if (is_wp_error($submit_id)) {
            $save_status = [
                'status' => 'error',
                'msg' => 'Save to database failed.'
            ];
            $this->sunformbuilder_send_response_submit($save_status, $submit_id->get_error_message());
        }else{
            $this->submit_id = $submit_id;
        }
    }

    public function sunformbuilder_send_response_submit(array $status, $response = false)
    {
        $debug_mode = '0'; //get_option('sunformbuilder_debug_mode');
        if ($status['status'] == 'error') {
            switch ($debug_mode) {
                case '1':
                    echo wp_json_encode($response);
                    break;
                default:
                    echo wp_json_encode($status);
                    break;
            }
            wp_die();
        }
    }

    public function moveEmailsToEnd(array $arr)
    {
        $emailItems = ['Email', 'Email 2'];
        return array_merge(
            array_filter($arr, fn($v) => !in_array($v, $emailItems)),
            array_filter($arr, fn($v) =>  in_array($v, $emailItems))
        );
    }

    public function get_parameter_form_redirec_url($params, $submit_data)
    {
        $redirect_params  = [];
        foreach ($params as $value) {
            $redirect_params[$value] = $this->sunformbuilder_get_value_repeater_api($submit_data, $value, []);
        }
        return $redirect_params;
    }

    public function get_custom_parameter_rediect_url($params)
    {
        $redirect_params = [];
        foreach ($params as $item) {
            if (!empty($item)) {
                $redirect_params[$item['key']] = $item['value'];
            }
        }
        return $redirect_params;
    }

    public function sunformbuilder_upload_files($files_data, $field_settings)
    {
        if (empty($files_data)) {
            return [];
        }

        $upload_overrides = [
            'test_form' => false,
        ];
        $results = [];

        foreach ($files_data as $field_name => $files) {
            if (empty($files['name'])) {
                continue;
            }

            // Lấy settings của field tương ứng với file name
            $field_setting = null;
            foreach ($field_settings as $setting) {
                if (isset($setting['name']) && $setting['name'] === $field_name) {
                    $field_setting = $setting;
                    break;
                }
            }

            // Kiểm tra xem có cần thay đổi upload directory không
            $use_custom_directory = false;
            $upload_directory = 'sunformbuilder'; // Giá trị mặc định

            if ($field_setting && isset($field_setting['change_upload_directory']) && $field_setting['change_upload_directory']) {
                $use_custom_directory = true;
                if (isset($field_setting['upload_directory']) && !empty($field_setting['upload_directory'])) {
                    $upload_directory = $field_setting['upload_directory'];
                }
            }

            // Khởi tạo cấu trúc kết quả cho field
            if (!isset($results[$field_name])) {
                $results[$field_name] = [
                    'label' => $field_setting['label'] ?? $field_name,
                    'type' => $field_setting['type'] ?? 'file_upload',
                    'value' => '',
                    'url' => [],
                    'path' => []
                ];
            }

            if ($use_custom_directory) {
                $this->current_upload_directory = $upload_directory;
                add_filter('upload_dir', [$this, 'sunformbuilder_custom_upload_dir']);
            }

            $normalized_files = $this->sunformbuilder_normalize_files_array($files);
            $uploaded_names = [];
            foreach ($normalized_files as $index => $file) {
                if (!empty($file['error']) && $file['error'] !== UPLOAD_ERR_OK) {
                    continue;
                }

                $upload = wp_handle_upload($file, $upload_overrides);
                if (isset($upload['error'])) {
                    continue;
                }

                // value: tên file SAU KHI WordPress đổi tên | url: url file | path: đường dẫn file
                // wp_handle_upload() có thể sanitize/đổi tên để tránh trùng, nên dùng basename của file/url sau upload
                $uploaded_name = function_exists('wp_basename')
                    ? wp_basename($upload['file'])
                    : basename($upload['file']);
                $uploaded_names[] = $uploaded_name;
                $results[$field_name]['url'][] = $upload['url'];
                $results[$field_name]['path'][] = $upload['file'];

                // Lưu attachment theo cấu hình field (attachment_to: ['Email'] hoặc ['Email 2'] hoặc cả hai)
                $attachment_to = $field_setting['attachment_to'] ?? [];
                if (is_string($attachment_to) && $attachment_to !== '') {
                    $attachment_to = [$attachment_to];
                }
                if (is_array($attachment_to)) {
                    if (in_array('Email', $attachment_to, true) && !in_array($upload['file'], $this->attachment_email, true)) {
                        $this->attachment_email[] = $upload['file'];
                    }
                    if (in_array('Email 2', $attachment_to, true) && !in_array($upload['file'], $this->attachment_email_2, true)) {
                        $this->attachment_email_2[] = $upload['file'];
                    }
                }
            }
            $results[$field_name]['value'] = implode(', ', $uploaded_names);

            if ($use_custom_directory) {
                remove_filter('upload_dir', [$this, 'sunformbuilder_custom_upload_dir']);
            }
        }

        return $results;
    }

    public function sunformbuilder_custom_upload_dir($dirs)
    {
        $folder_name = !empty($this->current_upload_directory) ? $this->current_upload_directory : 'sunformbuilder';
        $folder = '/' . trim($folder_name, '/');
        $path = $dirs['basedir'] . $folder;

        if (!file_exists($path)) {
            wp_mkdir_p($path);
        }

        $dirs['subdir'] = $folder;
        $dirs['path'] = $path;
        $dirs['url'] = $dirs['baseurl'] . $folder;
        return $dirs;
    }

    private function sunformbuilder_normalize_files_array(array $files)
    {
        $normalized = [];
        if (is_array($files['name'])) {
            foreach ($files['name'] as $index => $name) {
                $normalized[] = [
                    'name' => $name,
                    'type' => $files['type'][$index] ?? '',
                    'tmp_name' => $files['tmp_name'][$index] ?? '',
                    'error' => $files['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                    'size' => $files['size'][$index] ?? 0,
                ];
            }
        } else {
            $normalized[] = $files;
        }
        return $normalized;
    }
}
new SFBuilder_Pro_Ajax_Submit_Form(); // Kiểm tra empty field trong email