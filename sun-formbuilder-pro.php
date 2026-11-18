<?php

/**
 * Plugin Name: Sun Form Builder Pro
 * Description: Powerful Form Builder for WordPress
 * Plugin URI:  https://wp-formbuilder.com/
 * Version:     1.0.0
 * Author:      Sun Form Builder Team
 * License: GPLv2 or later
 * Text Domain: sunformbuilder-pro
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Requires at least: 5.8
 * Requires PHP: 8.1
 */

if (! defined('ABSPATH')) exit;

define('SFBUILDER_PRO', '1.0.0');

class SFFormBuilder_Pro
{
    private $fsjs_data;

    public function __construct()
    {
        $this->fsjs_data = [
            'postID' => get_the_ID(),
            'ajaxurl' => admin_url('admin-ajax.php'),
            'admin_url' => admin_url(),
            'admin_email' => get_option('admin_email'),
            'blog_name' => get_bloginfo('name'),
            'from_email' => str_ireplace('www.', '', wp_parse_url(home_url(), PHP_URL_HOST)),
            'plugin_dir' => plugin_dir_url(__FILE__),
        ];
        add_action('init', [$this, 'sunformbuilder_pro_load_plugin']);
        add_action('init', [$this, 'sunformbuilder_pro_register_fontawesome_frontend'], 5);
        $upload = wp_upload_dir();
        $upload_dir = $upload['basedir'];
        $upload_dir = $upload_dir . '/sunformbuilder';

        if (!defined('SFBUILDER_CSS_DIR')) {
            define('SFBUILDER_CSS_DIR', $upload_dir . '/css');
        }
        if (!defined('SFBUILDER_CSS_URL')) {
            define('SFBUILDER_CSS_URL', $upload['baseurl'] . '/sunformbuilder/css');
        }

        add_action('init', [$this, 'sunformbuilder_pro_register_post_type']);
        add_action('init', [$this, 'sunformbuilder_pro_register_email_template_post_type'], 10);
        add_action('init', [$this, 'sunformbuilder_pro_register_form_submissions_post_type'], 10);

        add_action('admin_init', [$this, 'sunformbuilder_pro_key_settings']);
        // Priority > 100: Classic Editor forces classic via these filters at priority 100.
        add_filter('use_block_editor_for_post_type', [$this, 'sunformbuilder_pro_use_block_editor_for_post_type'], 101, 2);
        add_filter('use_block_editor_for_post', [$this, 'sunformbuilder_pro_use_block_editor_for_post'], 101, 2);
        add_filter('classic_editor_enabled_editors_for_post_type', [$this, 'sunformbuilder_pro_classic_editor_enabled_editors'], 10, 2);

        //Admin script
        add_action('admin_init', [$this, 'sunformbuilder_pro_load_admin_script']);
        add_action('admin_menu', [$this, 'sunformbuilder_pro_admin_menu'], 600);

        //Metabox Email Template
        add_action('add_meta_boxes', [$this, 'sunformbuilder_pro_email_template_metabox']);
        add_action('admin_enqueue_scripts', [$this, 'sunformbuilder_pro_codemirror_enqueue_scripts']);

        add_filter('block_categories_all', [$this, 'sunformbuilder_pro_set_block_categories'], 10, 2);

        //Register blocks js
        add_action('enqueue_block_assets', [$this, 'sunformbuilder_pro_block_script_register']);
        add_action('enqueue_block_editor_assets', [$this, 'sunformbuilder_pro_block_editor_script_register']);
        add_action('admin_init', [$this, 'sunformbuilder_pro_insert_email_template']);

        //Save post
        add_action('save_post_sun_email_templates', [$this, 'sunformbuilder_pro_save_email_template']);

        require_once(__DIR__ . '/inc/helpers/functions.php'); // Xem kế thừa và gọi tên hàm các thứ
        require_once(__DIR__ . '/inc/helpers/integrations.php');
        require_once(__DIR__ . '/inc/controls/base.php');

        //Blocks
        $blocks = glob(__DIR__ . '/inc/block/*.php');
        foreach ($blocks as $block) {
            require_once $block;
        }

        //Ajax
        $ajax = glob(__DIR__ . '/inc/ajax/*.php');
        foreach ($ajax as $file) {
            require_once $file;
        }
        
        add_action('wp_enqueue_scripts', [$this, 'sunformbuilder_pro_block_conditional_assets']);
        add_filter('manage_sun_forms_posts_columns', [$this, 'sunformbuilder_set_custom_edit_columns']);
        add_action('manage_sun_forms_posts_custom_column', [$this, 'sunformbuilder_pro_custom_column'], 10, 2);
        add_shortcode('sun_form', [$this, 'sunformbuilder_pro_shortcode']);
    }

    public static function activate()
    {
        $instance = new self();
        $instance->sunformbuilder_pro_register_post_type();
        flush_rewrite_rules();
    }

    /**
     * Force block editor for sun_forms (overrides Classic Editor replace mode).
     */
    public function sunformbuilder_pro_use_block_editor_for_post_type($use_block_editor, $post_type)
    {
        if ($post_type === 'sun_forms') {
            return true;
        }
        return $use_block_editor;
    }

    /**
     * Force block editor per post (overrides Classic Editor "allow users to switch" mode).
     */
    public function sunformbuilder_pro_use_block_editor_for_post($use_block_editor, $post)
    {
        if ($post instanceof \WP_Post && $post->post_type === 'sun_forms') {
            return true;
        }
        return $use_block_editor;
    }

    /**
     * Tell Classic Editor that sun_forms only supports the block editor.
     */
    public function sunformbuilder_pro_classic_editor_enabled_editors($editors, $post_type)
    {
        if ($post_type === 'sun_forms') {
            $editors['classic_editor'] = false;
            $editors['block_editor'] = true;
        }
        return $editors;
    }

    public function sunformbuilder_pro_shortcode($atts)
    {
        $atts = shortcode_atts([
            'id' => '',
        ], $atts, 'sun_form');

        if (empty($atts['id'])) {
            return esc_html__('Please provide a valid ID.', 'sunformbuilder-pro');
        }

        $post_id = absint($atts['id']);
        $post = get_post($post_id);
        if (!$post || $post->post_type !== 'sun_forms') {
            return esc_html__('Form not found.', 'sunformbuilder-pro');
        }

        $content = do_blocks($post->post_content);
        $content = apply_filters('sunformbuilder_pro_shortcode_content', $content, $post, $atts);

        if (file_exists(SFBUILDER_CSS_DIR . '/' . $post_id . '.css') && is_admin()) {
            $version = filemtime(SFBUILDER_CSS_DIR . '/' . $post_id . '.css');
            wp_enqueue_style(
                'formbuilder-form-style-' . $post_id,
                SFBUILDER_CSS_URL . '/' . $post_id . '.css',
                [],
                $version
            );
            if (did_action('elementor/loaded') && \Elementor\Plugin::$instance->editor->is_edit_mode()) {
                wp_print_styles('formbuilder-form-style-' . $post_id);
            }
        }

        return wp_kses($content, $this->sunformbuilder_pro_form_output_allowed_html());
    }

    /**
     * Allowed HTML for rendered form shortcode/block output.
     *
     * Extends the standard "post" KSES allow-list with form field tags and
     * data-* attributes used by validation, multi-step UI, and integrations.
     *
     * @return array<string,array<string,bool>>
     */
    private function sunformbuilder_pro_form_output_allowed_html()
    {
        $allowed = wp_kses_allowed_html('post');

        $data_attributes = [
            'data-field-label'         => true,
            'data-required-message'    => true,
            'data-msg-required'        => true,
            'data-msg-minlength'       => true,
            'data-msg-maxlength'       => true,
            'data-msg-pattern'         => true,
            'data-required'            => true,
            'data-type'                => true,
            'data-form-id'             => true,
            'data-post-form'           => true,
            'data-validate-type'       => true,
            'data-step-index'          => true,
            'data-sitekey'             => true,
            'data-callback'            => true,
            'data-stripe-options'      => true,
            'data-stripe-options-raw'  => true,
        ];

        $allowed['form'] = [
            'class'             => true,
            'action'            => true,
            'method'            => true,
            'enctype'           => true,
            'novalidate'        => true,
            'id'                => true,
            'style'             => true,
            'data-form-id'      => true,
            'data-post-form'    => true,
            'data-validate-type'=> true,
        ];

        $allowed['input'] = [
            'type'          => true,
            'name'          => true,
            'value'         => true,
            'id'            => true,
            'class'         => true,
            'placeholder'   => true,
            'required'      => true,
            'disabled'      => true,
            'checked'       => true,
            'readonly'      => true,
            'min'           => true,
            'max'           => true,
            'minlength'     => true,
            'maxlength'     => true,
            'pattern'       => true,
            'autocomplete'  => true,
            'multiple'      => true,
            'accept'        => true,
            'step'          => true,
            'size'          => true,
            'alt'           => true,
            'aria-hidden'   => true,
            'aria-current'  => true,
            'role'          => true,
        ];

        $allowed['button'] = [
            'type'        => true,
            'class'       => true,
            'id'          => true,
            'disabled'    => true,
            'name'        => true,
            'value'       => true,
            'aria-label'  => true,
        ];

        $allowed['select'] = [
            'name'      => true,
            'id'        => true,
            'class'     => true,
            'required'  => true,
            'multiple'  => true,
            'disabled'  => true,
        ];

        $allowed['option'] = [
            'value'    => true,
            'selected' => true,
            'disabled' => true,
        ];

        $allowed['textarea'] = [
            'name'        => true,
            'id'          => true,
            'class'       => true,
            'rows'        => true,
            'cols'        => true,
            'required'    => true,
            'placeholder' => true,
            'minlength'   => true,
            'maxlength'   => true,
            'readonly'    => true,
            'disabled'    => true,
        ];

        $allowed['fieldset'] = ['class' => true];
        $allowed['legend']   = ['class' => true];
        $allowed['nav']      = ['class' => true, 'role' => true, 'aria-label' => true];
        $allowed['ol']       = ['class' => true];
        $allowed['li']       = ['class' => true, 'data-step-index' => true, 'aria-current' => true];
        $allowed['i']        = ['class' => true, 'aria-hidden' => true];

        $allowed['div']  = array_merge($allowed['div'] ?? [], $data_attributes, ['hidden' => true, 'role' => true]);
        $allowed['span'] = array_merge($allowed['span'] ?? [], $data_attributes);

        return $allowed;
    }

    public function sunformbuilder_set_custom_edit_columns($columns)
    {
        $new_columns = [];

        foreach ($columns as $key => $label) {
            $new_columns[$key] = $label;

            if ($key === 'title') {
                $new_columns['wpformbuilder-form-shortcode'] = __('Shortcode', 'sunformbuilder-pro');
            }
        }

        if (!isset($new_columns['wpformbuilder-form-shortcode'])) {
            $new_columns['wpformbuilder-form-shortcode'] = __('Shortcode', 'sunformbuilder-pro');
        }

        return $new_columns;
    }

    public function sunformbuilder_pro_custom_column($column, $post_id)
    {
        switch ($column) {
            case 'wpformbuilder-form-shortcode':
                $shortcode = sprintf('[sun_form id=%d]', $post_id);
        ?>
                <span class="wpformbuilder-shortcode-wrap">
                    <input class="wpformbuilder-widget-shortcode-input" type="text" readonly
                        value="<?php echo esc_attr($shortcode); ?>" />
                    <button type="button" class="wpformbuilder-shortcode-copy button-link"
                        aria-label="<?php esc_attr_e('Copy shortcode', 'sunformbuilder-pro'); ?>" title="<?php esc_attr_e('Copy shortcode', 'sunformbuilder-pro'); ?>">
                        <span class="dashicons dashicons-admin-page" aria-hidden="true"></span>
                        <span class="wpformbuilder-shortcode-copy-tooltip" role="status">
                            <?php esc_html_e('Copied', 'sunformbuilder-pro'); ?>
                        </span>
                    </button>
                </span>
        <?php
                break;
        }
    }
    public function sunformbuilder_pro_block_editor_script_register()
    {
        wp_enqueue_script(
            'wpformbuilder-blocks-editor-js',
            plugins_url('assets/js/minify/form.min.js', __FILE__),
            ['wp-blocks', 'wp-element', 'wp-editor'],
            SFBUILDER_PRO,
            true
        );
        wp_localize_script(
            'wpformbuilder-blocks-editor-js',
            'sfbuilder_js_data',
            $this->fsjs_data
        );

        wp_enqueue_script(
            'wpformbuilder-multi-step-form-editor-js',
            plugins_url('assets/js/minify/multi-step-form.min.js', __FILE__),
            ['jquery', 'jquery-ui-sortable', 'wp-blocks', 'wp-element', 'wp-editor'],
            SFBUILDER_PRO,
            true
        );
        wp_localize_script(
            'wpformbuilder-multi-step-form-editor-js',
            'sfbuilder_js_data',
            $this->fsjs_data
        );
    }

    public function sunformbuilder_pro_block_script_register()
    {
        // enqueue_block_assets loads this inside the editor iframe and on the frontend.
        // Register-only left the canvas unstyled: style-loader CSS stays in the parent window.
        wp_enqueue_style(
            'formbuilder-form-style',
            plugins_url('assets/css/minify/form.min.css', __FILE__),
            [],
            SFBUILDER_PRO
        );
        wp_register_script(
            'wpformbuilder-date-field-js',
            plugins_url('assets/js/minify/date-field.min.js', __FILE__),
            ['jquery'],
            SFBUILDER_PRO,
            true
        );
        wp_register_script(
            'wpformbuilder-file-upload-js',
            plugins_url('assets/js/minify/file-upload.min.js', __FILE__),
            ['jquery'],
            SFBUILDER_PRO,
            true
        );
        wp_register_script(
            'wpformbuilder-image-upload-js',
            plugins_url('assets/js/minify/image-upload.min.js', __FILE__),
            ['jquery'],
            SFBUILDER_PRO,
            true
        );
        wp_localize_script(
            'wpformbuilder-file-upload-js',
            'sfbuilder_js_data',
            $this->fsjs_data
        );
    }

    /**
     * Đăng ký Font Awesome (CSS) sớm trên init để có thể enqueue trên frontend
     * trong wp_enqueue_scripts — enqueue_block_assets có thể chạy sau hook đó.
     */
    public function sunformbuilder_pro_register_fontawesome_frontend()
    {
        if (wp_style_is('formbuilder-fontawesome-icons', 'registered')) {
            return;
        }
        wp_register_style(
            'formbuilder-fontawesome-icons',
            plugins_url('assets/css/lib/all.min.css', __FILE__),
            [],
            SFBUILDER_PRO
        );
    }

    public function sunformbuilder_pro_load_plugin()
    {
        $this->fsjs_data['nonce'] = wp_create_nonce('sunformbuilder_pro_nonce');
        $this->fsjs_data['email_templates'] = $this->sunformbuilder_pro_get_email_template();
        $this->fsjs_data['email_templates_default'] = get_post_meta(254896, '_sunformbuilder_id_email_template_default', true);
        $this->fsjs_data['email2_templates_default'] = get_post_meta(254897, '_sunformbuilder_id_email2_template_default', true);
        $this->fsjs_data['api']['mailchimp'] = !empty(get_option('sunformbuilder_mailchimp_api_key')) ? true : false;
        $this->fsjs_data['api']['activecampaign'] = (!empty(get_option('sunformbuilder_activecampaign_api_url')) && !empty(get_option('sunformbuilder_activecampaign_api_key'))) ? true : false;
        $this->fsjs_data['api']['brevo'] = !empty(get_option('sunformbuilder_brevo_api_key')) ? true : false;
        $this->fsjs_data['api']['sendfox'] = !empty(get_option('sunformbuilder_sendfox_access_token')) ? true : false;
        $this->fsjs_data['api']['mailerlite'] = !empty(get_option('sunformbuilder_mailerlite_api_token')) ? true : false;
        $this->fsjs_data['api']['zohocrm'] = !empty(get_option('sunformbuilder_zoho_access_token')) ? true : false;
        $this->fsjs_data['api']['constantcontact'] = !empty(get_option('sunformbuilder_constantcontact_access_token')) ? true : false;
        $this->fsjs_data['recaptcha_v3_site_key'] = !empty(get_option('sunformbuilder_recaptcha_v3_site_key')) ? get_option('sunformbuilder_recaptcha_v3_site_key') : false;
        $this->fsjs_data['api']['google_sheets'] = !empty(get_option('sunformbuilder_google_sheets_access_token')) ? true : false;

        // Stripe (safe to expose publishable key only)
        // Support both option names (new + legacy used by admin settings UI).
        $stripe_publishable_key = (string) get_option('sunformbuilder_stripe_publishable_key', '');
        $this->fsjs_data['stripe'] = [
            'publishable_key' => sanitize_text_field($stripe_publishable_key),
        ];

        $upload = wp_upload_dir();
        $upload_dir = $upload['basedir'];
        $upload_dir = $upload_dir . '/sunformbuilder';

        global $wp_filesystem;
        if (empty($wp_filesystem)) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        if (!$wp_filesystem->is_dir($upload_dir)) {
            $wp_filesystem->mkdir($upload_dir, 0775);
        } else {
            $wp_filesystem->chmod($upload_dir, 0775);
        }
        if (!$wp_filesystem->is_dir($upload_dir . '/css')) {
            $wp_filesystem->mkdir($upload_dir . '/css', 0775);
        } else {
            $wp_filesystem->chmod($upload_dir . '/css', 0775);
        }
    }

    public function sunformbuilder_pro_get_email_template()
    {
        $args = [
            'post_type' => 'sun_email_templates',
            'post_status' => 'publish',
            'posts_per_page' => -1,
        ];
        $query = new WP_Query($args);

        $post_array = [];

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();

                $post_array[] = array(
                    'label' => get_the_title(),
                    'value' => get_the_ID(),
                );
            }
            wp_reset_postdata();
        }
        return $post_array;
    }
    public function sunformbuilder_pro_register_post_type()
    {
        register_post_type(
            'sun_forms',
            [
                'labels' => array(
                    'name' => __('All Forms', 'sunformbuilder-pro'),
                    'singular_name' => __('All Forms', 'sunformbuilder-pro'),
                    'add_new_item' => __('Add New Form', 'sunformbuilder-pro'),
                ),
                'public' => true,
                'has_archive' => true,
                'show_in_rest' => true,
                'show_in_menu' => false,
                'publicly_queryable' => true,
                'rewrite' => array('slug' => 'sunform'),
                'supports' => array(
                    'title',
                    'editor'
                ),
            ]
        );
    }

    public function sunformbuilder_pro_save_email_template($post_id)
    {
        // Autosaves & revisions fire save_post with no metabox payload; bailing
        // early prevents them from clobbering the stored template with ''.
        if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($post_id)) {
            return;
        }

        // CSRF: require the nonce printed by sunformbuilder_pro_email_template_metabox_html().
        if (
            empty($_POST['sunformbuilder_email_template_nonce'])
            || !wp_verify_nonce(
                sanitize_text_field(wp_unslash($_POST['sunformbuilder_email_template_nonce'])),
                'sunformbuilder_pro_save_email_template'
            )
        ) {
            return;
        }

        // AuthZ: current user must actually be allowed to edit this template post.
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Email templates are admin-authored HTML that Twig later renders into
        // outgoing mail. Filter through wp_kses with an email-appropriate
        // allow-list so <script>, <iframe>, event handlers, javascript: URLs,
        // etc. are stripped before the value is persisted.
        if (isset($_POST['email_template']) && is_string($_POST['email_template'])) {
            $template = wp_kses(
                wp_unslash($_POST['email_template']),
                $this->sunformbuilder_pro_email_template_allowed_html()
            );
        } else {
            $template = '';
        }

        update_post_meta($post_id, '_sunformbuilder_email_template', $template);
    }

    /**
     * Allowed HTML for stored email templates.
     *
     * Extends the standard "post" KSES allow-list with the shell tags an HTML
     * email typically needs (html/head/body/meta/link/style/title). Twig
     * placeholders such as `{{ field }}` / `{% if x %}` are plain text and
     * survive wp_kses filtering unchanged.
     *
     * @return array<string,array<string,bool>>
     */
    private function sunformbuilder_pro_email_template_allowed_html()
    {
        $allowed = wp_kses_allowed_html('post');

        $allowed['html']  = ['lang' => true, 'xmlns' => true];
        $allowed['head']  = [];
        $allowed['title'] = [];
        $allowed['body']  = [
            'bgcolor' => true,
            'style'   => true,
            'class'   => true,
        ];
        $allowed['meta']  = [
            'charset'    => true,
            'http-equiv' => true,
            'content'    => true,
            'name'       => true,
        ];
        $allowed['link']  = [
            'rel'   => true,
            'href'  => true,
            'type'  => true,
            'media' => true,
        ];
        $allowed['style'] = [
            'type'  => true,
            'media' => true,
        ];

        return $allowed;
    }

    public function sunformbuilder_pro_register_email_template_post_type()
    {
        register_post_type(
            'sun_email_templates',
            [
                'labels' => array(
                    'name' => __('Email Template', 'sunformbuilder-pro'),
                    'singular_name' => __('Email Template', 'sunformbuilder-pro'),
                    'add_new_item' => __('Add New Template', 'sunformbuilder-pro'),
                ),
                'public' => true,
                'has_archive' => true,
                'show_in_menu' => false,
                'publicly_queryable' => false,
                'supports' => array(
                    'title',
                ),
            ]
        );
    }

    public function sunformbuilder_pro_register_form_submissions_post_type()
    {
        register_post_type('sfb_submissions', [
            'labels' => [
                'name' => __('Form Submissions', 'sunformbuilder-pro'),
                'singular_name' => __('Form Submission', 'sunformbuilder-pro'),
                'add_new_item' => __('Add New Submission', 'sunformbuilder-pro'),
            ],
            'public' => false,
            'has_archive' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_admin_bar' => false,
            'publicly_queryable' => false,
            'supports' => ['title', 'editor', 'author', 'custom-fields'],
            'capabilities' => [
                'create_posts' => 'do_not_allow',
            ],
            'map_meta_cap' => true,
        ]);
    }

    public function sunformbuilder_pro_admin_menu()
    {
        add_menu_page(
            'Sun Forms',
            'Sun Forms',
            'manage_options',
            'edit.php?post_type=sun_forms',
            '',
            'dashicons-feedback'
        );
        add_submenu_page('edit.php?post_type=sun_forms', 'All Form', 'All Form', 'manage_options', 'edit.php?post_type=sun_forms');
        add_submenu_page('edit.php?post_type=sun_forms', 'Form Submissions', 'Form Submissions', 'manage_options', 'sunformbuilder_submissions', [$this, 'get_submit_page']);
        add_submenu_page('edit.php?post_type=sun_forms', 'Email Templates', 'Email Templates', 'manage_options', 'edit.php?post_type=sun_email_templates');
        add_submenu_page('edit.php?post_type=sun_forms', 'Settings', 'Settings', 'manage_options', 'sunformbuilder_settings', [$this, 'get_admin_page']);
        // Free uses this slug and does not boot while Pro is active. Keep the
        // old URL working, then drop the duplicate menu item after the access check.
        add_submenu_page('edit.php?post_type=sun_forms', 'Settings', 'Settings', 'manage_options', 'sun_settings', [$this, 'sunformbuilder_pro_legacy_settings_redirect']);
        add_action('admin_init', [$this, 'sunformbuilder_pro_hide_legacy_settings_menu']);
    }

    /**
     * Bookmarks and links still use the free settings slug.
     */
    public function sunformbuilder_pro_legacy_settings_redirect()
    {
        wp_safe_redirect(admin_url('edit.php?post_type=sun_forms&page=sunformbuilder_settings'));
        exit;
    }

    /**
     * Hide the legacy slug after WordPress has allowed the request.
     */
    public function sunformbuilder_pro_hide_legacy_settings_menu()
    {
        remove_submenu_page('edit.php?post_type=sun_forms', 'sun_settings');
    }

    public function get_submit_page()
    {
        require_once __DIR__ . '/inc/settings/submit-page.php';
    }

    public function get_admin_page()
    {
        require_once __DIR__ . '/inc/settings/admin-page.php';
    }

    public function sunformbuilder_pro_key_settings()
    {
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_debug_mode', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_mailchimp_api_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_activecampaign_api_url', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_activecampaign_api_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_brevo_api_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_sendfox_access_token', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_mailerlite_api_token', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_zoho_domain', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_zohocrm_client_id', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_zohocrm_client_secret', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_constantcontact_api_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_constantcontact_secret_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_recaptcha_v3_site_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_recaptcha_v3_secret_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_recaptcha_v2_site_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_recaptcha_v2_secret_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_google_sheets_client_id', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_google_sheets_client_secret', ['sanitize_callback' => 'sanitize_text_field']);

        // Stripe
        // Needed because admin-page.php posts to options.php (requires register_setting to persist values).
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_stripe_publishable_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('sunformbuilder_admin_settings', 'sunformbuilder_stripe_secret_key', ['sanitize_callback' => 'sanitize_text_field']);
    }

    public function sunformbuilder_pro_load_admin_script()
    {
        //die('test');
        // if ($this->is_sunformbuilder_pro_settings_page()) {
            add_action('admin_enqueue_scripts', [$this, 'sunformbuilder_admin_script']);
        // }
    }

    public function sunformbuilder_admin_script()
    {
        wp_enqueue_style('dashicons');
        wp_enqueue_style('wpformbuilder-admin-style', plugin_dir_url(__FILE__) . 'assets/css/minify/admin.min.css', [], SFBUILDER_PRO);
        wp_enqueue_script('wpformbuilder-admin', plugin_dir_url(__FILE__) . 'assets/js/minify/admin.min.js', ['jquery'], SFBUILDER_PRO, true);
        $this->fsjs_data['plugin_dir'] = plugin_dir_url(__FILE__);
        wp_localize_script('wpformbuilder-admin', 'fsjs_data', $this->fsjs_data);
    }

    public function sunformbuilder_pro_block_conditional_assets()
    {
        global $post;
        if (!is_admin() && has_block('sunformbuilder/form') || !is_admin() && has_block('sunformbuilder/multi-step-form') || (!empty($post) && has_shortcode($post->post_content, 'sun_form'))) {
            $post_content = $post->post_content;
            wp_enqueue_style('formbuilder-fontawesome-icons');
            wp_enqueue_script(
                'wpformbuilder-submit-js',
                plugins_url('assets/js/minify/submit.min.js', __FILE__),
                ['jquery'],
                SFBUILDER_PRO,
                true
            );
            wp_localize_script(
                'wpformbuilder-submit-js',
                'sfbuilder_js_data',
                $this->fsjs_data
            );
            // Stripe.js v3 (required for Stripe Card field on frontend)
            if (!wp_script_is('wpformbuilder-stripe-js', 'registered')) {
                wp_register_script(
                    'wpformbuilder-stripe-js',
                    'https://js.stripe.com/v3/',
                    [],
                    SFBUILDER_PRO,
                    true
                );
            }

            if (has_shortcode($post_content, 'sun_form')) {
                preg_match_all('/\[sun_form.*?id=["\']?(\d+)["\']?.*?\]/', $post_content, $matches);

                if (!empty($matches[1])) {
                    $shortcode_ids = $matches[1];
                    $id = $shortcode_ids[0];
                }
            }

            if (!is_admin() && has_block('sunformbuilder/form') || !is_admin() && has_block('sunformbuilder/multi-step-form')) {
                $id = $post->ID;
            }

            if (isset($id)) {
                $version = file_exists(SFBUILDER_CSS_DIR . '/' . $id . '.css') ? filemtime(SFBUILDER_CSS_DIR . '/' . $id . '.css') : time();
                wp_enqueue_style(
                    "formbuilder-form-style-$id",
                    SFBUILDER_CSS_URL . '/' . $id . '.css',
                    [],
                    $version
                );
            }
        }
    }
    public function sunformbuilder_pro_email_template_metabox()
    {
        add_meta_box('wpformbuilder-email-template', 'Template', [$this, 'sunformbuilder_pro_email_template_metabox_html'], 'sun_email_templates');
    }

    public function sunformbuilder_pro_email_template_metabox_html($post)
    {
        $template = get_post_meta($post->ID, '_sunformbuilder_email_template', true);
        wp_nonce_field('sunformbuilder_pro_save_email_template', 'sunformbuilder_email_template_nonce');
        ?>
        <textarea id="wpformbuilder-email-editor" name="email_template"
            style="display:none;"><?php echo esc_textarea($template); ?></textarea>
<?php
    }

    public function sunformbuilder_pro_codemirror_enqueue_scripts($hook)
    {
        global $post;
        if (!empty($post->post_type) && $post->post_type == 'sun_email_templates') {
            $sunformbuilder_settings['codeEditor'] = wp_enqueue_code_editor(['type' => 'htmlmixed']);
            wp_localize_script('jquery', 'sunformbuilder_settings', $sunformbuilder_settings);
            wp_enqueue_script('wp-theme-plugin-editor');
            wp_enqueue_style('wp-codemirror');
        }
    }

    public function sunformbuilder_pro_insert_email_template()
    {
        $args = [
            'post_type' => 'sun_email_templates',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ];
        global $typenow;
        $post_type = !empty($typenow) ? sanitize_key($typenow) : false;
        $query = new WP_Query($args);
        if ((int) $query->found_posts < 2 && $post_type != 'elementor_library') {
            $email_template_default = [
                'post_title' => 'Default Email Template',
                'post_status' => 'publish',
                'post_type' => 'sun_email_templates',
            ];
            $email_template_id = wp_insert_post($email_template_default);
            update_post_meta(254896, '_sunformbuilder_id_email_template_default', $email_template_id);
            update_post_meta($email_template_id, '_sunformbuilder_email_template', '<div style="margin:0!important;padding:25px 0;background-color:#f3f6f9"><center><div style="border:1px solid #ccc;width:700px;background-color:#fff;border-radius:3px"><div style="padding:20px"><h1>Your Submission{{ submit_id ? " #" ~ submit_id : ""}}</h1><table border="1" style="border-collapse:collapse;color:#000;width:100%">{% for key, item in data %}<tr><th style="padding:10px;text-align:-webkit-auto">{{ item.label }}</th><td style="padding:10px">{{ item.value }}</td></tr>{% endfor %}</table><div style="text-align:-webkit-auto;margin-top:15px">{{ meta_data|raw }}</div></div></div></center></div>');
            $email2_template_default = [
                'post_title' => 'Default Email 2 Template',
                'post_status' => 'publish',
                'post_type' => 'sun_email_templates',
            ];
            $email2_template_id = wp_insert_post($email2_template_default);
            update_post_meta(254897, '_sunformbuilder_id_email2_template_default', $email2_template_id);
            update_post_meta($email2_template_id, '_sunformbuilder_email_template', '<div style="margin:0!important;padding:25px 0;background-color:#f3f6f9"><center><div style="border:1px solid #ccc;width:700px;background-color:#fff;border-radius:3px"><div style="padding:20px"><h1>Your Submission{{ submit_id ? " #" ~ submit_id : ""}}</h1><table border="1" style="border-collapse:collapse;color:#000;width:100%">{% for key, item in data %}<tr><th style="padding:10px;text-align:-webkit-auto">{{ item.label }}</th><td style="padding:10px">{{ item.value }}</td></tr>{% endfor %}</table><div style="text-align:-webkit-auto;margin-top:15px">{{ meta_data|raw }}</div></div></div></center></div>');
        } else {
            return;
        }
    }
    public function is_sunformbuilder_pro_settings_page()
    {
        global $post, $plugin_page, $typenow;
        $post_type = isset($post) ? $post->post_type : null;
        $page = !empty($plugin_page) ? sanitize_key($plugin_page) : '';
        $allowed_pages = ['sun_form_submit', 'sunformbuilder_settings', 'sun_settings'];

        return in_array($page, $allowed_pages, true)
            || $post_type === 'sun_email_templates'
            || (!empty($typenow) && $typenow === 'sun_forms');
    }

    public function sunformbuilder_pro_set_block_categories($categories)
    {
        $my_category = [
            [
                'slug'  => 'sunformbuilder',
                'title' => __('Sun Form', 'sunformbuilder-pro'),
            ],
        ];
        return array_merge($my_category, $categories);
    }
}
register_activation_hook(__FILE__, ['SFFormBuilder_Pro', 'activate']);

if (!isset($GLOBALS['sfbuilder_pro_instance'])) {
    $GLOBALS['sfbuilder_pro_instance'] = new SFFormBuilder_Pro();
}
