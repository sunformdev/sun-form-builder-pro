import ShortUniqueId from 'short-unique-id';
import { createResponsiveStyle } from '../includes/functions';
const generateID = new ShortUniqueId({ length: 5, dictionary: 'alpha_lower' });

/**
 * Create a fresh set of default render attributes for a field.
 * NOTE: Must return a NEW object every time to avoid shared references in nested objects/arrays.
 */
const createRenderAttributesDefaults = () => ({
    id: 'wp' + generateID.rnd(),
    type: 'text',
    label: '',
    autocomplete: 'off',
    name: generateID.rnd(),
    placeholder: '',
    default_value: '',
    acceptance_value: 'On',
    acceptance_text: '',
    min_length: '',
    max_length: '',
    min: '',
    max: '',
    step: '',
    rows: '4',
    pattern: '',
    pattern_error_message: 'Invalid format.',
    options_width_group: false,
    use_fieldset: false,
    options: [],
    options_group: {},
    required: false,
    multiple: false,
    date_language: 'en',
    attachment_to: ['Email'],
    layout: 'icon',
    min_date: '',
    max_date: '',
    date_format: 'Y-m-d',
    required_message: 'This field is required.',
    email_error_message: 'Please enter a valid email address.',
    url_error_message: 'Please enter a valid URL.',
    number_error_message: 'Please enter a valid number.',
    min_length_error_message: 'Please enter at least {0} characters.',
    max_length_error_message: 'Please enter no more than {0} characters.',
    default_date: '',
    file_accept: '',
    max_size: 5,
    files_limit: false,
    max_files: 10,
    min_files: 1,
    error_msg: 'An error occurred.',
    error_type: 'Invalid format.',
    error_max_size: 'File {file_name} has exceeded the maximum size limit.',
    error_min_files: 'Please upload at least {min} files.',
    error_max_files: 'You can only upload a maximum of {max} files.',
    change_upload_directory: false,
    upload_directory: 'sunformbuilder',
    preview_width: 100,
    preview_height: 100,
    label_upload: 'Choose File',
    stripe_custom_options: false,
    stripe_options_raw: 'hidePostalCode: true,\niconStyle: "solid",\nstyle:\{\n\tbase:{\n\t\tfontSize:"15px",\n\t\tcolor: "#333",\n\t\t"::placeholder": {\n\t\t\tcolor: "#999"\n\t\t}\n\t},\n\tinvalid: {\n\t\tcolor: "#e53935"\n\t}\n\}',
    stripe_options: {
        hidePostalCode: true,
        iconStyle: 'solid',
        style: {
            base: {
                fontSize: '15px',
                color: '#333',
                '::placeholder': {
                    color: '#999',
                },
            },
            invalid: {
                color: '#e53935',
            },
        },
    },
    flatpickr_custom_options: false,
    flatpickr_options_raw: 'dateFormat: "Y-m-d",\nminDate:"today",\nmaxDate: null,\nallowInput: true,\nclickOpens: true',
    flatpickr_options: {
        dateFormat: 'Y-m-d',
        minDate: 'today',
        maxDate: null,
        allowInput: true,
        clickOpens: true
    },
    column_width: {
        desktop: '100%',
        tablet: '100%',
        mobile: '100%'
    },
    recaptcha_v2_error_message: 'Error verifying reCAPTCHA. Please try again.',
    recaptcha_v2_required_message: 'Please verify that you are not a robot.',
    previous_icon: {
        type: 'none',
        group: '',
        name: '',
        id: '',
        url: '',
        mime: '',
        position: 'right',
        spacing: '10px'
    },
    next_icon: {
        type: 'none',
        group: '',
        name: '',
        id: '',
        url: '',
        mime: '',
        position: 'right',
        spacing: '10px'
    },
    step_icon: {
        type: 'none',
        group: '',
        name: '',
        id: '',
        url: '',
        mime: '',
        spacing: '10px'
    }
});

const formStyle = {
    column_gap: {
        value: '10px',
        unit: 'px'
    },
    row_gap: {
        value: '10px',
        unit: 'px'
    }
}
const labelStyle = {
    spacing: '',
    'font-weight': '400',
    'font-size': '',
    'text-transform': '',
    'font-style': '',
    'text-decoration': '',
    'line-height': '',
    'letter-spacing': '',
    'word-spacing': '',
    color: ''
}
const fieldStyle = {
    color: '',
    'background-color': '',
    'font-weight': '400',
    'font-size': '',
    'text-transform': '',
    'font-style': '',
    'text-decoration': '',
    'line-height': '',
    'letter-spacing': '',
    'word-spacing': '',
    border: {
        type: '',
        style: '',
        width: {
            top: '',
            right: '',
            bottom: '',
            left: '',
            link: '',
            unit: 'px',
            link: true
        },
        color: '',
        hoverColor: '',
        focusColor: '',
        radius: {
            top: '',
            right: '',
            bottom: '',
            left: '',
            link: '',
            unit: 'px',
            link: true
        }
    },
    padding: {
        top: '',
        right: '',
        bottom: '',
        left: '',
        link: '',
        unit: 'px',
        link: true
    },
    margin: {
        top: '',
        right: '',
        bottom: '',
        left: '',
        link: '',
        unit: 'px',
        link: true
    }
}
const buttonStyle = {
    'justify-content': '',
    'font-weight': '400',
    'font-size': '',
    'text-transform': '',
    'font-style': '',
    'text-decoration': '',
    'line-height': '',
    'letter-spacing': '',
    'word-spacing': '',
    'width': '100%',
    border: {
        type: '',
        style: '',
        width: {
            top: '',
            right: '',
            bottom: '',
            left: '',
            link: '',
            unit: 'px',
            link: true
        },
        color: '',
        hoverColor: '',
        focusColor: '',
        radius: {
            top: '',
            right: '',
            bottom: '',
            left: '',
            link: '',
            unit: 'px',
            link: true
        }
    },
    color: '',
    hoverColor: '',
    'background-color': '',
    backgroundHoverColor: '',
    step_padding: '',
    padding: {
        top: '',
        right: '',
        bottom: '',
        left: '',
        link: '',
        unit: 'px',
        link: true
    },
    margin: {
        top: '',
        right: '',
        bottom: '',
        left: '',
        link: '',
        unit: 'px',
        link: true
    }
}
const default_fields = [
    {
        ...createRenderAttributesDefaults(),
        type: 'text',
        label: 'First Name',
        required: false,
        name: 'fname',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    },
    {
        ...createRenderAttributesDefaults(),
        type: 'text',
        label: 'Last Name',
        required: false,
        name: 'lname',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    },
    {
        ...createRenderAttributesDefaults(),
        type: 'email',
        label: 'Email',
        required: false,
        name: 'email',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    }
]

/** Defaults when inserting the Multi Step Form block (two panels: names → contact). */
const default_multi_step_fields = [
    {
        ...createRenderAttributesDefaults(),
        type: 'text',
        label: 'First Name',
        required: false,
        name: 'fname',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    },
    {
        ...createRenderAttributesDefaults(),
        type: 'text',
        label: 'Last Name',
        required: false,
        name: 'lname',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    },
    {
        ...createRenderAttributesDefaults(),
        type: 'step',
        label: 'Personal',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    },
    {
        ...createRenderAttributesDefaults(),
        type: 'email',
        label: 'Email',
        required: false,
        name: 'email',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    },
    {
        ...createRenderAttributesDefaults(),
        type: 'tel',
        label: 'Phone',
        required: false,
        name: 'phone',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    },
    {
        ...createRenderAttributesDefaults(),
        type: 'step',
        label: 'Contact',
        column_width: {
            desktop: '100%',
            tablet: '100%',
            mobile: '100%'
        }
    }
]

const createStepsFromFields = (fields = []) => (
    fields
        .filter((field) => field?.type === 'step')
        .map((field) => field?.id)
        .filter(Boolean)
);

const attributes = {
    action_submit: {
        type: 'array',
        default: ['Email']
    },
    action_submit_settings: {
        type: 'object',
        default: {
            email: {
                to: null,
                subject: null,
                template: null,
                from: null,
                from_name: null,
                reply_to: null,
                cc: null,
                bcc: null,
                meta_data: ['Date', 'Time', 'Page URL', 'User Agent', 'Remote IP']
            },
            email2: {
                to: null,
                subject: null,
                template: null,
                from: null,
                from_name: null,
                reply_to: null,
                cc: null,
                bcc: null,
                meta_data: ['Date', 'Time', 'Page URL', 'User Agent', 'Remote IP']
            },
            mailchimp: {
                type: 'default',
                loading: false,
                api_key_cusom: null,
                send_confirm_email: false,
                update_contact: false,
                acceptance_field: false,
                acceptance_value: '',
                list_ids: [],
                fields: [],
                groups: {},
                list_id_selected: null,
                groups_id_selected: [],
                mappings: [
                    { tag_name: 'email_address', field_name: '', custom_value: '', label: 'Email' },
                    { tag_name: 'status', field_name: 'subscribed', custom_value: '', label: 'Status' },
                ],
                list_help_text: 'Select the Mailchimp list to which you want to add contacts.',
                loaded: false
            },
            activecampaign: {
                loading: false,
                type: 'default',
                acceptance_field: false,
                acceptance_value: '',
                list_id_help_text: 'Select the ActiveCampaign list to which you want to add contacts.',
                api_key_cusom: null,
                api_url_cusom: null,
                update_contact: false,
                list_ids: {},
                fields: {},
                list_id_selected: null,
                mappings: [
                    { tag_name: 'email', field_name: '', custom_value: '', label: 'Email' }
                ],
                loaded: false
            },
            brevo: {
                loading: false,
                type: 'default',
                api_key_cusom: null,
                acceptance_field: false,
                acceptance_value: '',
                update_contact: false,
                list_ids: [],
                list_help_text: 'Select the Brevo list to which you want to add contacts.',
                fields: [],
                list_id_selected: null,
                mappings: [
                    { tag_name: 'email', field_name: '', custom_value: '', label: 'Email' }
                ],
                loaded: false
            },
            sendfox: {
                loading: false,
                type: 'default',
                access_token_cusom: null,
                acceptance_field: false,
                acceptance_value: '',
                update_contact: false,
                list_ids: [],
                list_help_text: 'Select the Sendfox list to which you want to add contacts.',
                fields: [],
                list_id_selected: null,
                mappings: [
                    { tag_name: 'email', field_name: '', custom_value: '', label: 'Email' }
                ],
                loaded: false
            },
            mailerlite: {
                loading: false,
                type: 'default',
                access_token_cusom: null,
                acceptance_field: false,
                acceptance_value: '',
                update_contact: false,
                list_ids: [],
                list_help_text: 'Select the Mailerlite list to which you want to add contacts.',
                fields: [],
                list_id_selected: null,
                mappings: [
                    { tag_name: 'email', field_name: '', custom_value: '', label: 'Email' }
                ],
                loaded: false
            },
            zohocrm: {
                module: [{ label: '-- Select Module --', value: '', disable: true }, { 'label': 'Leads', 'value': 'Leads' }, { 'label': 'Accounts', 'value': 'Accounts' }, { 'label': 'Contacts', 'value': 'Contacts' }, { 'label': 'Campaigns', 'value': 'Campaigns' }, { 'label': 'Deals', 'value': 'Deals' }, { 'label': 'Tasks', 'value': 'Tasks' }, { 'label': 'Cases', 'value': 'Cases' }, { 'label': 'Events', 'value': 'Events' }, { 'label': 'Calls', 'value': 'Calls' }, { 'label': 'Solutions', 'value': 'Solutions' }, { 'label': 'Products', 'value': 'Products' }, { 'label': 'Vendors', 'value': 'Vendors' }, { 'label': 'Pricebooks', 'value': 'Pricebooks' }, { 'label': 'Quotes', 'value': 'Quotes' }, { 'label': 'Sales_Orders', 'value': 'Sales_Orders' }, { 'label': 'Purchase_Orders', 'value': 'Purchase_Orders' }, { 'label': 'Invoices', 'value': 'Invoices' }, { 'label': 'Notes', 'value': 'Notes' }],
                module_selected: null,
                acceptance_field: false,
                acceptance_value: '',
                fields: {},
                helper_text_field: '',
                loading: false,
                mappings: {},
                mappings_default: {},
                fields_required: [],
                loaded: false
            },
            constantcontact: {
                loading: false,
                send_confirm_email: false,
                update_contact: false,
                acceptance_field: false,
                acceptance_value: '',
                list_ids: [],
                fields: [],
                list_id_selected: null,
                mappings: [
                    { tag_name: 'email_address', field_name: '', custom_value: '', label: 'Email Address' },
                ],
                list_help_text: 'Select the Constantcontact list to which you want to add contacts.',
                loaded: false
            },
            recaptcha_v3: {
                enabled: false,
                score_enabled: false,
                score: '0.5',
                hide_badge: false,
                error_message: 'Error verifying reCAPTCHA. Please try again.'
            },
            google_sheets: {
                id: null,
                tab_name: null,
                mappings: [
                    { field_name: '', column_name: '', custom_value: '' }
                ]
            },
            redirect: {
                link_to: '',
                open_in_new_tab: false,
                url_parameter: false,
                parameter: [],
                custom_parameter: [{ key: '', value: '' }]
            },
            stripe_payment: {
                amount: '',
                amount_custom: '',
                currency: 'USD',
                description: '',
                description_custom: '',
                receipt_email: false,
                receipt_email_to: '',
                receipt_email_to_custom: '',
                billing_details: false,
                billing_details_email: '',
                billing_details_name: '',
                billing_details_phone: '',
                billing_details_address: false,
                billing_details_city: '',
                billing_details_country: '',
                billing_details_line1: '',
                billing_details_line2: '',
                billing_details_postal_code: '',
                billing_details_state: '',
            }
        }
    },
    form: {
        type: 'object',
        default: {
            name: 'New Form',
            id: "",
            post_form: '',
            hide_label: false,
            input_size: 'small',
            validate_type: 'html5',
            save_to_database: true,
            preview: false
        }
    },
    state: {
        type: 'object',
        default: {
            repeater: '',
            openTab: 'setting',
            inRepeater: 'normal',
            step: 'inactive',
            openTypography: false,
            section: 'form-field'
        }
    },
    button: {
        type: 'object',
        default: {
            name: 'Submit',
            size: 'sm',
            icon: {
                type: 'none',
                group: '',
                name: '',
                id: '',
                url: '',
                mime: '',
                position: 'right',
                spacing: '10px'
            },
            previous: {
                label: 'Previous',
                icon: {
                    type: 'none',
                    group: '',
                    name: '',
                    id: '',
                    url: '',
                    mime: '',
                    position: 'right',
                    spacing: '10px'
                }
            }
        }
    },
    css: {
        type: 'object',
        default: {
            editor: '',
            custom: ''
        }
    },
    render_attributes: {
        type: "object",
        default: createRenderAttributesDefaults()
    },
    fields: {
        type: 'array',
        default: []
    },
    steps: {
        type: 'array',
        default: []
    },
    step_settings: {
        type: 'object',
        default: {
            type: 'text',
            shape: 'circle'
        }
    },
    style: {
        type: 'object',
        default: {
            form: {
                ...createResponsiveStyle(formStyle)
            },
            label: {
                ...createResponsiveStyle(labelStyle)
            },
            field: {
                ...createResponsiveStyle(fieldStyle)
            },
            button: {
                ...createResponsiveStyle(buttonStyle)
            },
            next_button: {
                ...createResponsiveStyle(buttonStyle)
            },
            previous_button: {
                ...createResponsiveStyle(buttonStyle)
            },
            step: {
                ...createResponsiveStyle(buttonStyle)
            }
        }
    },
    additional_options: {
        type: 'object',
        default: {
            messages: {
                success: 'Your submission was successful.',
                error: 'Your submission failed because of an error.',
                member_exists: 'Member already added.',
                required: 'This field is required.',
                payment_success: 'Payment Success.',
                payment_faild: 'Payment Faild.',
                payment_pending: 'Payment Pending.'
            }
        }
    }
}


export { attributes, default_fields, default_multi_step_fields, createStepsFromFields };