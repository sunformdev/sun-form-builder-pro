<?php
if (!defined('ABSPATH')) {
    exit;
}

class SFBuilder_Pro_Ajax_Stripe_Payment extends SFBuilder_Pro_Helper
{
    public function __construct()
    {
        parent::__construct();
        add_action('wp_ajax_sunformbuilder_stripe_payment', [$this, 'sunformbuilder_stripe_payment']);
        add_action('wp_ajax_nopriv_sunformbuilder_stripe_payment', [$this, 'sunformbuilder_stripe_payment']);
    }

    public function sunformbuilder_stripe_payment()
    {
        if (isset($_POST['nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'sunformbuilder_pro_nonce')) {
            // Unslash the raw submission. Per-field sanitization by declared field
            // type is performed inside sunformbuilder_get_form_data() so that the
            // resulting $submit_data is safe to propagate to the Stripe API,
            // email rendering and third-party integrations.
            $form_data = wp_unslash($_POST);
            $form_ID = !empty($form_data['formID']) ? sanitize_text_field($form_data['formID']) : '';
            $post_form_id = !empty($form_data['post_form_id']) ? sanitize_text_field($form_data['post_form_id']) : '';
            $settings = $this->sunformbuilder_get_form_settings($post_form_id, $form_ID);
            $stripe_settings = $settings['action_submit_settings']['stripe_payment'];
            $additional_options = $settings['additional_options'] ?? [];
            $payment_messages = $additional_options['messages'] ?? [];
            $submit_data = $this->sunformbuilder_get_form_data($settings, $form_data);
            $stripe_secret_key = get_option('sunformbuilder_stripe_secret_key');
            if (!empty($stripe_settings['receipt_email']) && !empty($stripe_settings['receipt_email_to'])) {
                $stripe_receipt_email = $stripe_settings['receipt_email_to'] === 'custom_value' ? $stripe_settings['receipt_email_to_custom'] : $this->sunformbuilder_get_value_by_name($stripe_settings['receipt_email_to'], $submit_data);
            }
            if (!empty($stripe_settings['description'])) {
                $stripe_description = $stripe_settings['description'] === 'custom_value' ? $stripe_settings['description_custom'] : $this->sunformbuilder_get_value_by_name($stripe_settings['description'], $submit_data);
            }

            try {
                $stripe_amount = $stripe_settings['amount'] === 'custom_value' ? $stripe_settings['amount_custom'] : $this->sunformbuilder_get_value_by_name($stripe_settings['amount'], $submit_data);
                $stripeIntent = [
                    'headers' => [
                        'Content-type' => 'application/x-www-form-urlencoded',
                        'Authorization' => 'Basic ' . base64_encode($stripe_secret_key)
                    ],
                    'body' => [
                        'amount' => floatval($stripe_amount) * 100,
                        'currency' => $stripe_settings['currency'] ?? 'USD',
                        'automatic_payment_methods' => [
                            'enabled' => 'true',
                            'allow_redirects' => 'never',
                        ],
                        'receipt_email' => $stripe_receipt_email ?? null,
                        'description' => $stripe_description ?? null,
                    ]
                ];
                $paymentIntent = wp_remote_retrieve_body(wp_remote_post('https://api.stripe.com/v1/payment_intents', $stripeIntent));
                $paymentIntent = json_decode($paymentIntent);
                $paymentData = [
                    'client_secret' => $paymentIntent->client_secret,
                    'billing_details' => $this->sunformbuilder_stripe_get_billing_details($stripe_settings, $submit_data),
                    'msg' => [
                        'success' => !empty($payment_messages['payment_success']) ? $payment_messages['payment_success'] : 'Payment Success.',
                        'falid' => !empty($payment_messages['payment_faild']) ? $payment_messages['payment_faild'] : 'Payment Faild.',
                        'pedding' => !empty($payment_messages['payment_pending']) ? $payment_messages['payment_pending'] : 'Payment Pending.',
                    ]
                ];
                echo wp_json_encode($paymentData);
            } catch (Error $e) {
                // Return a JSON error response so the frontend AJAX handler
                // (which expects JSON from the success branch above) can parse
                // it consistently. wp_send_json_error() also calls wp_die().
                wp_send_json_error(['message' => $e->getMessage()]);
            }
        }
        wp_die();
    }

    public function sunformbuilder_stripe_get_billing_details($settings, $data)
    {
        $billing_details = null;
        if (!empty($settings['billing_details'])) {
            $billing_details = [
                'email' => !empty($settings['billing_details_email']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_email'], $data) : null,
                'name' => !empty($settings['billing_details_name']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_name'], $data) : null,
                'phone' => !empty($settings['billing_details_phone']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_phone'], $data) : null,
            ];
            if (!empty($settings['billing_details_address'])) {
                $billing_details['address'] = [
                    'city' => !empty($settings['billing_details_city']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_city'], $data) : null,
                    'country' => !empty($settings['billing_details_country']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_country'], $data) : null,
                    'line1' => !empty($settings['billing_details_line1']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_line1'], $data) : null,
                    'line2' => !empty($settings['billing_details_line2']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_line2'], $data) : null,
                    'postal_code' => !empty($settings['billing_details_postal_code']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_postal_code'], $data) : null,
                    'state' => !empty($settings['billing_details_state']) ? $this->sunformbuilder_get_value_by_name($settings['billing_details_state'], $data) : null,
                ];
            }
            return $billing_details;
        }
        return $billing_details;
    }
}
new SFBuilder_Pro_Ajax_Stripe_Payment();
