<?php
if (!defined('ABSPATH')) {
    exit;
}

class SFBuilder_Pro_Stripe_Card_Control extends SFBuilder_Pro_Base_Control
{
    public function get_type()
    {
        return 'stripe_card';
    }

    public function get_control_template($attributes)
    {
        wp_enqueue_script('wpformbuilder-stripe-js');

        $label = !empty($attributes['label']) ? $attributes['label'] : '';
        $hide_label = !empty($attributes['hide_label']) ? true : false;
        $id = !empty($attributes['id']) ? $attributes['id'] : '';
        $custom_options = !empty($attributes['stripe_custom_options']) ? true : false;
        if($custom_options){
            $stripe_options_raw = !empty($attributes['stripe_options_raw']) ? $attributes['stripe_options_raw'] : '';
            $stripe_options_raw = str_replace(["\r\n", "\r", "\n"], ' ', $stripe_options_raw);
            $stripe_options_raw = preg_replace('/\s+/', ' ', trim($stripe_options_raw));
            $stripe_options = $attributes['stripe_options'] ?? [];
        }else{
            $stripe_options_raw = '';
            $stripe_options = [
                'hidePostalCode' => true,
                'iconStyle' => 'solid',
                'style' => [
                    'base' => [
                        'fontSize' => '15px',
                        'color' => '#333',
                        '::placeholder' => [
                            'color' => '#999',
                        ],
                    ],
                    'invalid' => [
                        'color' => '#e53935',
                    ],
                ],
            ];
        }

        $publishable_key = get_option('sunformbuilder_stripe_publishable_key');

        $label_attributes = [
            'for' => $id,
            'class' => 'wpformbuilder-form-group__label'
        ];

        $group_attributes = [
            'class' => 'wpformbuilder-form-group ' . $id,
            'data-field-label' => $label,
            'data-required-message' => !empty($attributes['required_message']) ? $attributes['required_message'] : 'This field is required.',
            'data-msg-required' => !empty($attributes['required_message']) ? $attributes['required_message'] : 'This field is required.',
        ];

        // Hidden field placeholder (optional): later you can populate it on submit with a PaymentMethod id/token.
        // $hidden_attributes = [
        //     'type' => 'hidden',
        //     'name' => $name ? ($name . '_stripe_payment_method') : 'stripe_payment_method',
        //     'value' => '',
        //     'class' => 'wpformbuilder-stripe-payment-method',
        // ];

        $stripe_wrapper_attrs = [
            'class' => 'wpformbuilder-form-control stripe-mount',
            'style' => 'width: 100%;padding: 0px 8px;',
        ];

        $label_html = $hide_label ? '' : ('<label ' . $this->get_render_attributes($label_attributes) . '>' . esc_html($label) . '</label>');

        $missing_key_html = '';
        if (empty($publishable_key)) {
            $missing_key_html = '<div class="wpformbuilder-stripe-placeholder" style="color:#b32d2e;font-size:12px;margin-top:6px;">Stripe publishable key is missing.</div>';
        }

        return "
            <div " . $this->get_render_attributes($group_attributes) . ">
                " . $label_html . "
                <div class='wpformbuilder-stripe-wrapper' data-stripe-options='" . json_encode($stripe_options) . "' data-stripe-options-raw='" . esc_attr($stripe_options_raw) . "'><div " . $this->get_render_attributes($stripe_wrapper_attrs) . "></div></div>
                " . $missing_key_html . "
            </div>
        ";
    }
}
