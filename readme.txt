=== Sun Form Builder Pro ===
Contributors: sunformbuilderteam
Tags: form builder, gutenberg, multi-step form, stripe, email marketing
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 8.1
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress Gutenberg form builder with multi-step forms, Stripe, reCAPTCHA, Twig emails and 10+ marketing/CRM integrations.

== Description ==

**Sun Form Builder Pro** is a modern, fully visual form builder for WordPress that lives natively inside the Gutenberg block editor. Drop the **Sun Form** or **Multi-Step Form** block into any post, page or template and build the form visually using a rich set of field controls — no coding required.

Every form is stored as its own post (`sun_forms`), so you can manage all of your forms from a single dashboard, embed them anywhere with a shortcode, and customize per-form styles that are automatically compiled into a dedicated CSS file. Submissions are captured to a dedicated post type (`sfb_submissions`) for easy management, and notification emails are rendered through reusable, Twig-powered templates.

= Highlights =

* Build forms visually inside the **Gutenberg block editor** with two dedicated blocks: `sunformbuilder/form` and `sunformbuilder/multi-step-form`.
* **Multi-step forms** with step-by-step navigation, per-step validation and a dedicated Step control.
* **17+ field controls**: text, textarea, email, url, tel, number, password, hidden, select, radio, checkbox, acceptance, date, file upload, image upload, Stripe card, reCAPTCHA v2 and step.
* **Reusable email templates** rendered by the [Twig](https://twig.symfony.com/) engine and edited with the built-in WordPress CodeMirror editor.
* **Stripe payments** — accept payments directly from your form using the Stripe Card control (Stripe.js v3 loaded on demand).
* **Google reCAPTCHA v2 & v3** to protect your forms from spam.
* Shortcode embedding from any editor: `[wpformbuilder id="123"]`.
* Dedicated **Sun Forms** admin menu: All Forms, Form Submissions, Email Templates and Settings.
* Per-form generated CSS stored under `wp-content/uploads/sunformbuilder/css/{form_id}.css` for fast frontend rendering.
* **Conditional asset loading** — submit script, Stripe.js and per-form styles are only enqueued on pages that actually use a form.
* Full **submission management** via the `sfb_submissions` custom post type.
* Developer friendly: clean hooks, custom post types, REST endpoint (`/wp-json/sunform/v1/integrations`), filters and structured field controls under `inc/controls/`.

= Included Integrations =

Sun Form Builder Pro ships with a growing library of first-party integrations, all configurable under **Sun Forms → Settings**:

* **Email marketing / CRM**
    * Mailchimp
    * ActiveCampaign
    * Brevo (formerly Sendinblue)
    * SendFox
    * MailerLite
    * Constant Contact
    * Zoho CRM
* **Data collection**
    * Google Sheets
* **Payments**
    * Stripe
* **Spam protection**
    * Google reCAPTCHA v2
    * Google reCAPTCHA v3

= Field & Form Features =

* Multi-step forms with a dedicated Step control and per-step navigation.
* Configurable labels, placeholders, help text, default value, validation rules and required state per field.
* File and image uploads with allowed mime type / size configuration.
* Stripe Card field renders securely via Stripe Elements — only the publishable key is exposed to the browser.
* Email notifications rendered through a Twig-based template with dynamic loops such as `{% for key, item in data %} ... {% endfor %}`.
* Two default email templates auto-created on first run so the plugin works immediately after activation.
* Admin column showing the shortcode for every form for quick copy & paste.

== Installation ==

1. Upload the `sun-form-builder-pro` folder to `/wp-content/plugins/`, or install the plugin through the WordPress **Plugins** screen.
2. Activate the plugin through the **Plugins** menu in WordPress. On activation the plugin will:
    * Register the `sun_forms`, `sun_email_templates` and `sfb_submissions` custom post types.
    * Create the `wp-content/uploads/sunformbuilder/css/` directory used for per-form styles.
    * Seed two default email templates so notifications work immediately.
3. Go to **Sun Forms → All Forms → Add New** in the admin sidebar to create your first form.
4. (Optional) Open **Sun Forms → Settings** to connect the integrations you need (Mailchimp, Stripe, reCAPTCHA, etc.).
5. Embed a form in any post or page using either:
    * The **Sun Form** or **Multi-Step Form** Gutenberg block, or
    * The shortcode `[wpformbuilder id="FORM_ID"]` (the form ID is shown in the Shortcode column of the forms list).

== Frequently Asked Questions ==

= Do I need the Gutenberg editor to use this plugin? =
The form builder UI is built as a Gutenberg block, so you'll use Gutenberg to design forms. Once a form is created, you can embed it anywhere using the `[wpformbuilder id="..."]` shortcode, including the classic editor and most page builders.

= How do I embed a form in a post or page? =
Either insert the **Sun Form** or **Multi-Step Form** block from the *WP Form Builder* category, or paste the shortcode `[wpformbuilder id="123"]` (replace `123` with the ID shown in the Shortcode column of *Sun Forms → All Forms*).

= How do I build a multi-step form? =
Insert the **Multi-Step Form** block (`sunformbuilder/multi-step-form`) and use the **Step** control to split the form into as many steps as you need. You can validate fields per step before advancing to the next one.

= How do I customize the notification email? =
Go to **Sun Forms → Email Templates**, open a template and edit the HTML in the CodeMirror editor. Templates use Twig syntax, so you can loop through submitted fields with `{% for key, item in data %} ... {% endfor %}` and output values like `{{ item.label }}` and `{{ item.value }}`. Raw HTML placeholders such as `{{ meta_data|raw }}` are also supported.

= Where are the per-form styles stored? =
Each form's compiled CSS is written to `wp-content/uploads/sunformbuilder/css/{form_id}.css` and is only enqueued on pages that actually contain the form (via block or shortcode). Style files are versioned by file modification time to bypass browser cache after edits.

= Where can I see form submissions? =
All submissions are stored as `sfb_submissions` posts. Go to **Sun Forms → Form Submissions** in the admin to browse, inspect and manage submitted entries.

= How do I accept payments with Stripe? =
Under **Sun Forms → Settings**, add your Stripe publishable and secret keys. Then insert a **Stripe Card** control into any form. The frontend loads Stripe.js v3 on demand and creates a payment intent on the server; only the publishable key is ever sent to the browser.

= How do I protect my forms from spam? =
Under **Sun Forms → Settings**, add your Google reCAPTCHA v2 site/secret keys and/or v3 site/secret keys. Then add the **reCAPTCHA v2** control to the form (v3 is applied automatically when a site key is configured).

= Does this plugin support file or SVG uploads? =
Yes. The **File Upload** and **Image Upload** controls handle file submissions, with configurable allowed mime types and size limits.

= Can I extend the plugin with custom field controls? =
Yes. Field controls live under `inc/controls/` and extend the `SFBuilder_Pro_Control_Base` class, so you can register additional controls following the same pattern.

== Screenshots ==

1. Build forms visually with the **Sun Form** and **Multi-Step Form** Gutenberg blocks.
2. Manage all forms from the **Sun Forms** admin screen, including a ready-to-copy shortcode for each form.
3. Configure step-based navigation and per-step validation using the multi-step form builder.
4. Edit reusable email templates with the built-in CodeMirror editor and Twig syntax.
5. Review submissions in the dedicated **Form Submissions** dashboard.
6. Configure integrations (Mailchimp, Stripe, reCAPTCHA and more) from the **Settings** page.

== External services ==

This plugin can connect to the following third-party services. Each service is **opt-in** — no data is sent to any external service unless a site administrator has explicitly configured the corresponding integration and enabled it on a form.

= Mailchimp =
Used to add form subscribers to a Mailchimp audience. Requests are sent to `https://<dc>.api.mailchimp.com/3.0/` (where `<dc>` is derived from your API key, e.g. `us1`, `us21`).

* **When:** on saving the API key, when the admin loads audiences/merge fields in the editor, and when a visitor submits a form with the Mailchimp integration enabled.
* **What:** API key (HTTP Basic auth), audience/list ID, interest group IDs, the visitor's email address and any additional merge fields the administrator has mapped.
* **Legal:** [Terms of Use](https://mailchimp.com/legal/terms/) · [Privacy Policy](https://mailchimp.com/legal/privacy/)

= ActiveCampaign =
Used to add contacts to an ActiveCampaign account. Requests are sent to the API URL you configure (e.g. `https://<account>.api-us1.com/api/3/`).

* **When:** when the admin loads lists/fields in the editor, and when a visitor submits a form with the ActiveCampaign integration enabled.
* **What:** API URL and API key, list ID, contact email and mapped field values.
* **Legal:** [Terms of Service](https://www.activecampaign.com/legal/terms-of-service) · [Privacy Policy](https://www.activecampaign.com/legal/privacy-policy)

= Brevo (Sendinblue) =
Requests are sent to `https://api.brevo.com/v3/`.

* **When:** when the admin loads lists/attributes in the editor, and when a visitor submits a form with the Brevo integration enabled.
* **What:** API key, list ID, contact email and mapped contact attributes.
* **Legal:** [Terms of Service](https://www.brevo.com/legal/termsofuse/) · [Privacy Policy](https://www.brevo.com/legal/privacypolicy/)

= SendFox =
Requests are sent to `https://api.sendfox.com/`.

* **When:** when the admin loads lists in the editor, and when a visitor submits a form with the SendFox integration enabled.
* **What:** Access token, list ID and contact fields (email, first name, last name, IP address).
* **Legal:** [Terms of Service](https://sendfox.com/tos) · [Privacy Policy](https://sendfox.com/privacy)

= MailerLite =
Requests are sent to `https://api.mailerlite.com/api/v2/`.

* **When:** when the admin loads groups/fields in the editor, and when a visitor submits a form with the MailerLite integration enabled.
* **What:** API token, group ID, contact email and mapped custom field values.
* **Legal:** [Terms of Service](https://www.mailerlite.com/legal/terms-of-service) · [Privacy Policy](https://www.mailerlite.com/legal/privacy-policy)

= Constant Contact =
Requests are sent to `https://api.cc.email/v3/`. Uses OAuth 2.0 with automatic token refresh.

* **When:** OAuth authorization/refresh, when the admin loads contact lists/custom fields in the editor, and when a visitor submits a form with the Constant Contact integration enabled.
* **What:** Client ID/secret, access & refresh tokens, contact list ID, contact email and mapped fields (first/last name, phone, address, etc.).
* **Legal:** [Terms of Service](https://www.constantcontact.com/legal/service-provider) · [Privacy Policy](https://www.constantcontact.com/legal/customer-contact-data-notice)

= Zoho CRM =
Requests are sent to the Zoho API domain associated with your account (for example `https://www.zohoapis.com/crm/v2/`). Uses OAuth 2.0 with automatic token refresh.

* **When:** OAuth authorization/refresh, when the admin loads modules/fields in the editor, and when a visitor submits a form with the Zoho CRM integration enabled.
* **What:** Client ID/secret, access & refresh tokens, module name (Leads, Contacts, etc.) and mapped field values.
* **Legal:** [Terms of Service](https://www.zoho.com/terms.html) · [Privacy Policy](https://www.zoho.com/privacy.html)

= Google Sheets =
Requests are sent to `https://sheets.googleapis.com/v4/`. Uses OAuth 2.0.

* **When:** OAuth authorization/refresh, when the admin loads spreadsheets/worksheets in the editor, and when a visitor submits a form with the Google Sheets integration enabled.
* **What:** Client ID/secret, access & refresh tokens, spreadsheet ID, worksheet name and the row data mapped from form fields.
* **Legal:** [Google Terms of Service](https://policies.google.com/terms) · [Google Privacy Policy](https://policies.google.com/privacy)

= Stripe =
Requests are sent to `https://api.stripe.com/v1/` (server-side) and `https://js.stripe.com/v3/` (client-side).

* **When:** Stripe.js v3 is loaded on any page that contains a form using the Stripe Card control, and a Payment Intent is created on the server when a visitor submits a paying form.
* **What:** Publishable key (browser only), secret key (server only), payment intent metadata (amount, currency, form ID) and the card token generated by Stripe Elements. Full card numbers never touch the WordPress server.
* **Legal:** [Terms of Service](https://stripe.com/legal/ssa) · [Privacy Policy](https://stripe.com/privacy)

= Google reCAPTCHA (v2 and v3) =
Client scripts are loaded from `https://www.google.com/recaptcha/api.js`; verification requests are sent server-side to `https://www.google.com/recaptcha/api/siteverify`.

* **When:** on any page that contains a form with reCAPTCHA enabled (script load) and when a visitor submits such a form (token verification).
* **What:** reCAPTCHA site key (browser), secret key (server), the reCAPTCHA token and the visitor's IP address (as sent by reCAPTCHA).
* **Legal:** [Google Terms of Service](https://policies.google.com/terms) · [Google Privacy Policy](https://policies.google.com/privacy)

By enabling any of the integrations above in this plugin, you acknowledge that the data described will be transmitted to and processed by the corresponding third-party service in accordance with their Terms of Service and Privacy Policy.

== Changelog ==

= 1.0.0 =
* Initial release of Sun Form Builder Pro.
* Gutenberg blocks: `sunformbuilder/form` and `sunformbuilder/multi-step-form`.
* Custom post types: `sun_forms`, `sun_email_templates`, `sfb_submissions`.
* Shortcode embedding: `[wpformbuilder id="..."]`.
* 17+ field controls including Stripe Card and reCAPTCHA v2.
* Per-form CSS generation and conditional asset loading on the frontend.
* Twig-based email templates with two default templates seeded on activation.
* Stripe payments with server-side Payment Intents.
* Google reCAPTCHA v2 & v3 spam protection.
* Integrations: Mailchimp, ActiveCampaign, Brevo, SendFox, MailerLite, Constant Contact, Zoho CRM, Google Sheets. GetResponse is provided by Sun Form Builder.
* REST endpoint `POST /wp-json/sunform/v1/integrations` for dynamic integration data.
* Full submissions dashboard.

== Upgrade Notice ==

= 1.0.0 =
First public release of Sun Form Builder Pro.

== Credits ==

Built on top of the WordPress block editor. Email templates are powered by [Twig](https://twig.symfony.com/). Payments are powered by [Stripe](https://stripe.com/). Spam protection uses [Google reCAPTCHA](https://www.google.com/recaptcha/).
