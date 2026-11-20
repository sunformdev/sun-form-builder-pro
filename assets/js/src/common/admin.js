import { html as beautifyHtml } from 'js-beautify';
import '../../lib/table-edit/table-edits.min.js';

jQuery(function ($) {
    // Settings Page
    var page = getUrlParameter('page');
    if (page === 'sunformbuilder_settings') {
        let defaultTab = 'api-setting';
        let tab_setting_active = localStorage.getItem("sunformbuilder_setting_tab_active") || defaultTab;
        let activeTabTrigger = $('[data-tab="' + tab_setting_active + '"]').eq(0);

        if (!activeTabTrigger.length) {
            tab_setting_active = defaultTab;
            activeTabTrigger = $('[data-tab="' + tab_setting_active + '"]').eq(0);
        }

        $('.wpformbuilder-admin-tab-heading li').removeClass('active');
        $('[data-tab-item]').removeClass('active');
        activeTabTrigger.closest('li').addClass('active');
        $('[data-tab-item="' + tab_setting_active + '"]').eq(0).addClass('active');
        localStorage.setItem("sunformbuilder_setting_tab_active", tab_setting_active);
        
        $(document).on('click', '.wpformbuilder-admin-tab-heading li', function () {
            let $el = $(this).closest('.wpformbuilder-admin-tab-container');
            $el.find('ul li').removeClass('active');
            var tab_name = $(this).find('a').eq(0).attr('data-tab');
            $(this).addClass('active');
            $el.find('[data-tab-item]').removeClass('active');
            $el.find('[data-tab-item="' + tab_name + '"]').eq(0).addClass('active');
            localStorage.setItem("sunformbuilder_setting_tab_active", tab_name);
        });
    } else {
        localStorage.removeItem("sunformbuilder_setting_tab_active");
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
    // Save options
    $('.wpformbuilder-api-save').on('click', async function () { // Xem ở đây cho hiển thị button auth khi đầy đủ thông tin
        let data_options = [];
        let parent = $(this.closest('table.form-table'));
        let buttonAuth = parent.find('#wpformbuilder-authenticate-zoho-crm');
        let hasPreview = $(this).hasClass('has-preview');
        $(this).find('img').addClass('loading');
        let tdElement = $(this).closest('td');
        let name = $(this).data('name');
        let value = tdElement.find('[name="' + name + '"]').val();
        data_options.push({ name: name, value: value });
        if (['sunformbuilder_zohocrm_client_secret', 'sunformbuilder_zohocrm_client_id'].includes(name)) {
            let parent = $(this).closest('table.form-table');
            let domainValue = parent.find('[name="sunformbuilder_zoho_domain"]').val();
            data_options.push({ name: 'sunformbuilder_zoho_domain', value: domainValue });
        }
        let option_response = await ajaxSaveOptions(data_options, $(this), tdElement, hasPreview);
        if (option_response?.url) {
            console.log('vào đây 1');
            buttonAuth.attr('href', option_response?.url ?? '#');
            buttonAuth.removeClass('wpformbuilder-hidden');
            buttonAuth.removeClass('wpformbuilder-disabled');
        }else{
            console.log('vào đây 3');
            buttonAuth.addClass('wpformbuilder-hidden');
        }
    });

    //For Zoho CRM Change
    $('[name="sunformbuilder_zoho_domain"]').on('change', async function () {
        let parent = $(this).closest('table.form-table');
        let buttonAuth = parent.find('#wpformbuilder-authenticate-zoho-crm');
        let domain = $(this).val();
        let apiData = [
            { name: 'sunformbuilder_zoho_domain', value: domain }
        ]
        buttonAuth.addClass('wpformbuilder-disabled');
        let response = await ajaxSaveOptions(apiData, false);
        buttonAuth.attr('href', response?.url ?? '#');
        buttonAuth.removeClass('wpformbuilder-disabled');
    });

    async function ajaxSaveOptions(data_options, that, tdElement, hasPreview) {
        let apiData = {
            action: 'sunformbuilder_plugin_save_options',
            nonce: fsjs_data.nonce,
            data: data_options
        }
        return new Promise((resolve, reject) => {
            $.post(fsjs_data.ajaxurl, apiData, function (response) {
                if (that) {
                    that.find('img').removeClass('loading');
                    if (hasPreview) {
                        that.hide();
                        tdElement.find('.wpformbuilder-api-change').show();
                        tdElement.find('.wpformbuilder-api-cancel').hide();
                    }
                    tdElement.find('.wpformbuilder-notification-save-settings').css('display', 'inline');
                    setTimeout(() => {
                        tdElement.find('.wpformbuilder-notification-save-settings').fadeOut()
                    }, 6000);
                }
                resolve(response?.data);
            }).fail((err) => {
                reject(err);
            });
        });

    }

    $(document).on('click', '.wpformbuilder-api-change', function () {
        $(this).hide();
        let parent = $(this.closest('table.form-table'));
        parent.find('#wpformbuilder-authenticate-zoho-crm').addClass('wpformbuilder-disabled');
        let tabTD = $(this).closest('td');
        tabTD.find('.wpformbuilder-api-save').show();
        let apiName = $(this).data('name');
        tabTD.find('.wpformbuilder-preview-key').hide();
        tabTD.find('input.wpformbuilder-hidden-key')[0].setAttribute('type', 'text');
        tabTD.find('.wpformbuilder-api-cancel').show();
    });

    $(document).on('click', '.wpformbuilder-api-cancel', function () {
        $(this).hide();
        let parent = $(this.closest('table.form-table'));
        parent.find('#wpformbuilder-authenticate-zoho-crm').removeClass('wpformbuilder-disabled');
        let tabTD = $(this).closest('td');
        tabTD.find('.wpformbuilder-preview-key').show();
        tabTD.find('.wpformbuilder-api-save').hide();
        tabTD.find('.wpformbuilder-api-change').show();
        let oldValue = tabTD.find('.wpformbuilder-preview-key').data('value');
        tabTD.find('input.wpformbuilder-hidden-key')[0].setAttribute('type', 'hidden');
    });
    //API Status show/hidden
    $.each(['api', 'payment'], (index, name) => {
        let parent = $('[data-tab-item="' + name + '-setting"]');
        let apiListElements = parent.find('[data-api-name]');
        let apiStatus = localStorage.getItem('sunformbuilder_plugin_' + name + '_status');
        if (apiStatus !== null) {
            apiStatus = JSON.parse(apiStatus);
            $.each(apiStatus, function (key, val) {
                if (val) {
                    $('input#' + key).prop('checked', true);
                    $('[data-api-name="' + key + '"]').show();
                } else {
                    $('[data-api-name="' + key + '"]').hide();
                    $('input#' + key).prop('checked', false);
                }
            });
        } else {
            let newApiStatus = {}
            $.each(apiListElements, (index, item) => {
                let name = $(item).data('api-name');
                newApiStatus[name] = true;
            });
            localStorage.setItem('sunformbuilder_plugin_' + name + '_status', JSON.stringify(newApiStatus));
            $('input[name="api_name"]').prop('checked', true);
        }
    });
    //Item input settings click
    $('.wpformbuilder-admin-api-input-item').on('click', function () {
        let tab = $(this).closest('[data-tab-item]').data('tab-item');
        let tabName = tab.split('-')[0];
        let apiName = $(this).val();
        let apiElement = $('[data-api-name="' + apiName + '"]');
        let api_stauts = localStorage.getItem('sunformbuilder_plugin_' + tabName + '_status');
        let checked = true, newStatus = {};
        api_stauts = api_stauts !== null ? JSON.parse(api_stauts) : {}
        if ($(this).is(":checked")) {
            apiElement.fadeIn();
            api_stauts[apiName] = true;
        } else {
            apiElement.fadeOut();
            checked = false;
            api_stauts[apiName] = false;
        }
        localStorage.setItem('sunformbuilder_plugin_' + tabName + '_status', JSON.stringify(api_stauts));
    });
    //Check all and uncheck all api
    $('.wpformbuilder-admin-control-api__button').on('click', function () {
        let parent = $(this).closest('[data-tab-item]');
        let tab = parent.data('tab-item');
        console.log('tab: ', tab);
        let tabName = tab.split('-')[0];
        let is_checked = $(this).hasClass('check') ? true : false;
        if (is_checked) {
            parent.find('input.wpformbuilder-admin-api-input-item').not(':disabled').prop('checked', true);
            s_set_api_status(true, tabName, parent)
        } else {
            parent.find('input.wpformbuilder-admin-api-input-item').not(':disabled').prop('checked', false);
            s_set_api_status(false, tabName, parent)
        }
    });
    function s_set_api_status(status, tabName, parent) {
        let apiSatus = localStorage.getItem('sunformbuilder_plugin_' + tabName + '_status');
        if (apiSatus !== null) {
            let newStatus = JSON.parse(apiSatus)
            $.each(newStatus, function (key, value) {
                newStatus[key] = status;
                console.log(parent.find('[data-api-name="' + key + '"]'));
                if (status) {

                    parent.find('[data-api-name="' + key + '"]').fadeIn();
                } else {
                    parent.find('[data-api-name="' + key + '"]').fadeOut();
                }
            });
            localStorage.setItem('sunformbuilder_plugin_' + tabName + '_status', JSON.stringify(newStatus));
        }
    }

    // Email Teamplate codeEditor
    let emailMetabox = document.querySelector('#wpformbuilder-email-editor');

    if (emailMetabox) {
        let editor = wp.codeEditor.initialize(emailMetabox, {
            mode: 'htmlmixed',
            indentUnit: 4,
            tabSize: 4,
            lineNumbers: true,
            autoCloseTags: true,
            matchBrackets: true,
            styleActiveLine: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-Shift-F": function (cm) { formatHTML(editor.codemirror); }
            }
        });
        editor.codemirror.setSize("100%", "400px");
        setTimeout(() => {
            formatHTML(editor.codemirror);
        }, 500);
    }

    function formatHTML(cm) {
        if (!cm) {
            console.error("Editor chưa được khởi tạo!");
            return;
        }

        let rawHTML = cm.getValue();

        // 🔹 Tạm thay thế các thẻ Twig để tránh bị phá format
        let twigMarkers = [];
        let htmlWithPlaceholders = rawHTML.replace(/\{\{.*?\}\}|\{%.*?%\}/g, (match) => {
            let placeholder = `TWIG_PLACEHOLDER_${twigMarkers.length}`;
            twigMarkers.push(match);
            return placeholder;
        });

        // 🔹 Format HTML bình thường
        let formattedHTML = beautifyHtml(htmlWithPlaceholders, {
            indent_size: 4,
            indent_char: " ",
            preserve_newlines: true
        });

        // 🔹 Khôi phục lại các thẻ Twig ban đầu
        twigMarkers.forEach((originalTwig, index) => {
            formattedHTML = formattedHTML.replace(`TWIG_PLACEHOLDER_${index}`, originalTwig);
        });

        // 🔹 Thêm xử lý định dạng cho Twig tags
        formattedHTML = formatHtmlWithTwigBlocksOnly(formattedHTML);

        cm.setValue(formattedHTML);
    }

    function formatHtmlWithTwigBlocksOnly(rawHTML) {
        const indentChar = '    ';
        let indentLevel = 0;

        const openingTwigTags = ['if', 'for', 'block', 'macro', 'embed', 'filter', 'spaceless', 'verbatim', 'raw'];
        const closingTwigTags = ['endif', 'endfor', 'endblock', 'endmacro', 'endembed', 'endfilter', 'endspaceless', 'endverbatim', 'endraw'];
        const middleTwigTags = ['else', 'elseif', 'empty'];

        function isOpeningHtmlTag(line) {
            return /^<([a-zA-Z0-9\-]+)(\s[^>]*)?>$/.test(line.trim());
        }

        function isClosingHtmlTag(line) {
            return /^<\/([a-zA-Z0-9\-]+)>$/.test(line.trim());
        }

        function isSelfClosingHtmlTag(line) {
            return /\/>$/.test(line.trim());
        }

        function isOpeningTwigTag(line) {
            return openingTwigTags.some(tag => line.trim().startsWith(`{% ${tag}`));
        }

        function isClosingTwigTag(line) {
            return closingTwigTags.some(tag => line.trim().startsWith(`{% ${tag}`));
        }

        function isMiddleTwigTag(line) {
            return middleTwigTags.some(tag => line.trim().startsWith(`{% ${tag}`));
        }

        function splitByTwigBlocks(str) {
            // Chỉ tách các {% ... %}, giữ nguyên {{ ... }} hay {{{ ... }}}
            return str
                .replace(/(\{%.*?%\})/g, '\n$1\n') // Tách {% ... %}
                .replace(/>\s*</g, '>\n<')         // Tách thẻ HTML liền nhau
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        }

        const lines = splitByTwigBlocks(rawHTML);

        return lines.map(line => {
            // Twig đóng hoặc thẻ đóng HTML
            if (isClosingHtmlTag(line) || isClosingTwigTag(line) || isMiddleTwigTag(line)) {
                indentLevel = Math.max(indentLevel - 1, 0);
            }

            const indentedLine = indentChar.repeat(indentLevel) + line;

            // Twig mở hoặc thẻ HTML mở (không tự đóng)
            if ((isOpeningHtmlTag(line) && !isSelfClosingHtmlTag(line)) || isOpeningTwigTag(line) || isMiddleTwigTag(line)) {
                indentLevel++;
            }

            return indentedLine;
        }).join('\n');
    }
    // Edittable Database
    let tableEdit = $('table.wpformbuilder-table-database tr');
    let pluginUrl = fsjs_data.plugin_dir;
    console.log('pluginUrl: ', pluginUrl, fsjs_data);
    var data, dropdowns = {}, images = {}, checkboxs = {}, radios = {}, repeater = {};
    $.each(tableEdit, function () {
        let type = $(this).data('type');
        let name = $(this).data('name');
        data = $(this).data('object');
        switch (type) {
            case 'select':
            case 'image-select':
                dropdowns[name] = data.options
                break;
            case 'image_upload':
                images[name] = data.value
                break;
            case 'checkbox':
                checkboxs[name] = data
                break;
            case 'radio':
                radios[name] = data
                break;
            case 'repeater':
                repeater[name] = data
                break;
        }
    });
    //console.log('checkboxs: ', checkboxs);
    $('table.wpformbuilder-table-database tr').editable({
        keyboard: true,
        dblclick: false,
        button: true,
        buttonSelector: ".wpformbuilder-edit-database",
        buttonCancel: '.wpformbuilder-cancel-database',
        dropdowns: dropdowns,
        images: images,
        checkboxs: checkboxs,
        radios: radios,
        repeater: repeater,
        maintainWidth: true,
        edit: function (values) {
            $('.wpformbuilder-edit-database', this).html('Save').attr('title', 'Save');
            $('.wpformbuilder-cancel-database', this).addClass('wpformbuilder-visible');
        },
        save: function (values, element, repeater) {
            console.log('Save: da vao save');
            let that = this
            $('.wpformbuilder-edit-database', this).html('<img src="' + pluginUrl + '/assets/images/loading.svg" width="12" height="12">&nbsp;Save').attr('title', 'Save');
            $('.wpformbuilder-cancel-database', this).removeClass('wpformbuilder-visible');
            let dataUpdate = {
                action: 'sunformbuilder_update_database',
                nonce: fsjs_data.nonce,
                data: values
            }
            $.post(fsjs_data.ajaxurl, dataUpdate, function (response) {
                if (response) {
                    if (repeater) {
                        $(element).closest('tr').attr('data-object', response);
                    }
                }
                $('.wpformbuilder-edit-database', that).html('Edit').attr('title', 'Edit');
            });
        },
        cancel: function (values) {
            $('.wpformbuilder-cancel-database', this).removeClass('wpformbuilder-visible');
            $('.wpformbuilder-edit-database', this).html('Edit').attr('title', 'Edit');
        }

    });
    // Action in Form Database
    $('.wpformbuilder-submittion-action').on('click', function () {
        let submitID = $(this).data('id');
        let action = $(this).data('action');
        const currentUrl = new URL(window.location.href);
        let ajaxData = {
            action: 'sunformbuilder_action_form_submissions',
            nonce: fsjs_data.nonce,
            data: {
                action: action,
                page_url: window.location.href,
                post_status: currentUrl.searchParams.get('post_status') || 'publish',
                submissions: 1,
                post: submitID
            }
        }
        $.post(fsjs_data.ajaxurl, ajaxData, function (response) {
            if (response?.success && response.data?.url) {
                window.location.href = response.data.url;
            }
        });
    });
    //Filter Database chưa xong
    $('#post-submissions-filter').on('click', function () {
        let parent = $(this).closest('#sun-filter-submissions');
        let filterDate = parent.find('#filter-by-date').val();
        let filterFormId = parent.find('#filter-by-form-id').val();
        let post_status = $(this).data('post-status');
        let currentUrl = window.location.href;
        let urlRedirect;
        currentUrl = new URL(currentUrl);
        console.log('param: ', filterDate, filterFormId, currentUrl, post_status, urlRedirect);
        //return false;
        if (filterDate == '0') {
            currentUrl.searchParams.delete('date');
        } else {
            currentUrl.searchParams.set('post_status', post_status);
            currentUrl.searchParams.set('date', filterDate);
        }
        if (filterFormId == '0') {
            currentUrl.searchParams.delete('form_id');
        } else {
            currentUrl.searchParams.set('form_id', filterFormId);
        }
        urlRedirect = currentUrl.toString();
        window.location.href = urlRedirect;

    });

    $(document).on('click', '.wpformbuilder-shortcode-copy', function (event) {
        event.preventDefault();

        const $button = $(this);
        const $input = $button.siblings('.wpformbuilder-widget-shortcode-input');
        const shortcode = $input.val();

        const showCopiedState = function () {
            $button.addClass('is-copied');
            window.clearTimeout($button.data('copyTimeout'));
            $button.data('copyTimeout', window.setTimeout(function () {
                $button.removeClass('is-copied');
            }, 1500));
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(shortcode).then(showCopiedState).catch(function () {
                $input.trigger('focus').trigger('select');
                document.execCommand('copy');
                showCopiedState();
            });
            return;
        }

        $input.trigger('focus').trigger('select');
        document.execCommand('copy');
        showCopiedState();
    });

    $(document).on('click', '.license-disable-ssl', function(){
        let ssl = $(this).is(":checked") ? true : false;
        $.post(fsjs_data.ajaxurl, {'action': 'sunformbuilder_pro_control_ssl', ssl: ssl, nonce: fsjs_data.nonce});
    });

    function readLicenseResponse(response) {
        if (typeof response !== 'string') {
            return response;
        }
        try {
            return JSON.parse(response);
        } catch (error) {
            return { status: 'error', msg_err: response };
        }
    }

    $(document).on('submit', '#sun-action-activate', function (event) {
        event.preventDefault();
        if (typeof fsjs_data === 'undefined') {
            return;
        }

        let $form = $(this);
        let $button = $form.find('.button-license-activate');
        let $message = $form.find('.sun-license-eror-msg');
        let licenseKey = $.trim($form.find('#license_key').val());

        $message.removeClass('is-success').text('');
        if (!licenseKey) {
            $message.text('Enter a license key.');
            return;
        }

        $button.prop('disabled', true);
        $.post(fsjs_data.ajaxurl, {
            action: 'sunformbuilder_pro_plugin_config',
            nonce: fsjs_data.nonce,
            s: 'activate',
            license_key: licenseKey
        }).done(function (response) {
            let data = readLicenseResponse(response);
            if (data && data.status === 'success') {
                let sites = data.sites_label ? ' Site activations: ' + data.sites_label + '.' : '';
                $message.addClass('is-success').text('License activated.' + sites);
                window.setTimeout(function () {
                    window.location.reload();
                }, 600);
                return;
            }
            $message.text((data && (data.msg_err || data.message)) || 'Activation failed.');
            $button.prop('disabled', false);
        }).fail(function () {
            $message.text("Can't connect to server.");
            $button.prop('disabled', false);
        });
    });

    $(document).on('submit', '#sun-action-deactivate', function (event) {
        event.preventDefault();
        if (typeof fsjs_data === 'undefined') {
            return;
        }

        let $form = $(this);
        let $button = $form.find('.button-license-deactivate');
        let $message = $form.find('.sun-license-eror-msg');

        $message.removeClass('is-success').text('');
        $button.prop('disabled', true);
        $.post(fsjs_data.ajaxurl, {
            action: 'sunformbuilder_pro_plugin_config',
            nonce: fsjs_data.nonce,
            s: 'deactivate'
        }).done(function (response) {
            let data = readLicenseResponse(response);
            if (data && data.status === 'success') {
                $message.addClass('is-success').text('License deactivated.');
                window.setTimeout(function () {
                    window.location.reload();
                }, 600);
                return;
            }
            $message.text((data && (data.msg_err || data.message)) || 'Deactivation failed.');
            $button.prop('disabled', false);
        }).fail(function () {
            $message.text("Can't connect to server.");
            $button.prop('disabled', false);
        });
    });
});
