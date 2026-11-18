import 'jquery-validation';
import 'jquery-validation/dist/additional-methods';
import './multistep.js';

// (function ($) {
jQuery(function () {
    const $ = jQuery;
    var stopSubmit = false;
    // Stripe Payment
    var stripePayment = false;
    if (typeof Stripe === 'function') {
        const stripeCard = $('.wpformbuilder-form-control.stripe-mount');
        const stripeWrapper = stripeCard.closest('.wpformbuilder-stripe-wrapper');
        var stripe = Stripe(sfbuilder_js_data?.stripe?.publishable_key);
        var stripeElements;
        if (stripeCard.length) {
            stripePayment = true;
            let stripeOptions = null;
            const stripeOptionsRaw = stripeWrapper.data('stripe-options-raw');
            if (stripeOptionsRaw) {
                stripeOptions = parseStripeOptions(stripeOptionsRaw);
            } else {
                stripeOptions = stripeWrapper.data('stripe-options');
            }
            stripeElements = stripe.elements();
            var paymentElement = stripeElements.create("card", stripeOptions);
            paymentElement.mount(".wpformbuilder-form-control.stripe-mount");
        }
    }

    const getGroupRequiredMessage = ($group) => {
        if (!$group?.length) return '';
        const msg1 = (($group.data('required-message') || '') + '').trim();
        if (msg1) return msg1;
        // fallback if message stored as jQuery Validate-style attribute on the wrapper
        const msg2 = (($group.data('msg-required') || '') + '').trim();
        return msg2;
    };

    const hydrateInputMessagesFromGroup = ($form) => {
        if (!$form?.length) return;
        $form.find('.wpformbuilder-form-group').each(function () {
            const $group = $(this);
            const $field = $group.find('input, select, textarea').first();
            if (!$field.length) return;

            const mappings = [
                ['msg-required', 'msg-required'],
                ['msg-minlength', 'msg-minlength'],
                ['msg-maxlength', 'msg-maxlength'],
                ['msg-pattern', 'msg-pattern'],
                ['msg-email', 'msg-email'],
                ['msg-url', 'msg-url'],
                ['msg-number', 'msg-number'],
            ];

            mappings.forEach(([groupKey, fieldKey]) => {
                const groupVal = (($group.data(groupKey) || '') + '').trim();
                if (!groupVal) return;
                const fieldVal = (($field.data(fieldKey) || '') + '').trim();
                if (!fieldVal) {
                    $field.attr(`data-${fieldKey}`, groupVal);
                }
            });

            // If wrapper has data-required-message but input doesn't have data-msg-required yet, hydrate it.
            const requiredMsg = getGroupRequiredMessage($group);
            const fieldRequiredMsg = (($field.data('msg-required') || '') + '').trim();
            if (requiredMsg && !fieldRequiredMsg) {
                $field.attr('data-msg-required', requiredMsg);
            }
        });
    };

    const isRequiredMissing = (el, $group) => {
        if (!el) return false;
        const type = ((el.getAttribute && el.getAttribute('type')) || el.type || '').toLowerCase();

        if (type === 'radio' || type === 'checkbox') {
            return $group?.find?.(`input[type="${type}"]:checked`).length === 0;
        }

        if (type === 'file') {
            return !(el.files && el.files.length > 0);
        }

        const val = (el.value ?? '') + '';
        return val.trim().length === 0;
    };

    const ensureRequiredEl = ($group) => {
        let $required = $group.find('.wpformbuilder-form-group__required').first();
        if (!$required.length) {
            $required = $('<div class="wpformbuilder-form-group__required" style="display:none;"></div>');
            $group.append($required);
        }
        return $required;
    };

    const getValidateType = ($form) => {
        const t = ($form.data('validate-type') || 'html5') + '';
        const type = t.toLowerCase();
        // semantic mode removed; keep backward compatibility
        return type === 'semantic' ? 'inline' : type;
    };

    // jQuery Validate i18n (basic Vietnamese messages)
    if ($.validator && $.validator.messages) {
        $.extend($.validator.messages, {
            required: 'This field is required.',
            email: 'Please enter a valid email address.',
            url: 'Please enter a valid URL.',
            number: 'Please enter a valid number.',
            pattern: 'Invalid format.',
            minlength: $.validator.format('Please enter at least {0} characters.'),
            maxlength: $.validator.format('Please enter no more than {0} characters.'),
            min: $.validator.format('Please enter a value greater than or equal to {0}.'),
            max: $.validator.format('Please enter a value less than or equal to {0}.'),
        });
    }

    const initFormValidate = ($form) => {
        if (!$.fn.validate) return;
        const initedMode = $form.data('wpfb-validate-inited');
        if (initedMode) return;
        $form.data('wpfb-validate-inited', 'inline');

        // Allow storing messages on wrapper; copy them to inputs for jQuery Validate to pick up.
        hydrateInputMessagesFromGroup($form);

        $form.validate({
            errorElement: 'span',
            errorClass: 'wpformbuilder-validate-error',
            // jQuery Validate ignores hidden fields by default; we still want to validate hidden file inputs (image/file upload)
            ignore: ':hidden:not(input[type="file"])',
            focusInvalid: false,
            // Live validate so required messages disappear as soon as the field becomes valid
            onkeyup: function (element) {
                $(element).valid();
            },
            onfocusout: function (element) {
                $(element).valid();
            },
            errorPlacement: function (error, element) {
                const $group = element.closest('.wpformbuilder-form-group');
                if (!$group.length) {
                    error.insertAfter(element);
                    return;
                }

                const $required = ensureRequiredEl($group);
                const customRequiredMsg = getGroupRequiredMessage($group);
                const message = (customRequiredMsg && isRequiredMissing(element?.get?.(0), $group))
                    ? customRequiredMsg
                    : error.text();

                $required.text(message).fadeIn('swing');
                error.remove();
            },
            success: function (_label, element) {
                const $group = $(element).closest('.wpformbuilder-form-group');
                $group.find('.wpformbuilder-form-group__required').first().fadeOut('swing');
            },
            invalidHandler: function (_event, validator) {
                if (!validator.errorList?.length) return;
                const firstEl = validator.errorList[0].element;
                const $group = $(firstEl).closest('.wpformbuilder-form-group');
                const $scrollTarget = $group.length ? $group : $(firstEl);
                const offsetTop = $scrollTarget.offset()?.top;
                if (typeof offsetTop === 'number') {
                    window.scrollTo({ top: offsetTop - 100, behavior: 'smooth' });
                }

                // Focus the first invalid field if it's focusable/visible (best effort)
                setTimeout(() => {
                    const $focusTarget = ($group.length
                        ? $group.find('input:not([type="hidden"]):not(:hidden), select:not(:hidden), textarea:not(:hidden), button:not(:hidden), [tabindex]:not([tabindex="-1"])').first()
                        : $(firstEl)
                    );

                    if ($focusTarget.length && $focusTarget.is(':visible') && typeof $focusTarget.get(0)?.focus === 'function') {
                        $focusTarget.get(0).focus({ preventScroll: true });
                    }
                }, 0);
            },
        });

        // Re-validate on user interaction so messages clear immediately
        $form.on('input.wpfbValidate change.wpfbValidate', 'input, select, textarea', function () {
            if ($.fn.validate) {
                $(this).valid();
            }
        });

        // Ensure required radio/checkbox groups (stored on wrapper via data-required="1")
        $form.find('[data-required="1"][data-type="radio"]').each(function () {
            const $first = $(this).find('input[type="radio"]').first();
            if ($first.length) $first.rules('add', { required: true });
        });
        $form.find('[data-required="1"][data-type="checkbox"]').each(function () {
            const $first = $(this).find('input[type="checkbox"]').first();
            if ($first.length) $first.rules('add', { required: true });
        });
    };
    if (sfbuilder_js_data?.recaptcha_v3_site_key && $('#wpformbuilder-recaptcha-v3-token').length) {
        grecaptcha.ready(function () {
            grecaptcha.execute(sfbuilder_js_data?.recaptcha_v3_site_key, { action: 'submit_form' }).then(function (token) {
                document.getElementById('wpformbuilder-recaptcha-v3-token').value = token;
            });
        });
    }
    // For reCAPTCHA v2
    window.recaptchaCallback = function () {
        $('.wpformbuilder-form-control.recaptcha_v2').find('.wpformbuilder-form-group__required').eq(0).fadeOut('swing');
    }

    $('form.wpformbuilder-box-form').each(function () {
        const $form = $(this);
        const validateType = getValidateType($form);
        if (validateType === 'inline') {
            initFormValidate($form);
        }
        // HTML5 mode: we handle constraint validation ourselves and show messages inline for all fields at once.
        // This avoids native browser focus issues with hidden required file inputs.
        if (validateType === 'html5') {
            $form.attr('novalidate', 'novalidate');
        }
    });

    $('form.wpformbuilder-box-form').on('submit', async function (e) {
        e.preventDefault();
        const $form = $(this);
        const validateType = getValidateType($form);

        if (validateType === 'inline') {
            initFormValidate($form);
            if ($.fn.validate && !$form.valid()) {
                return;
            }
        } else {
            // HTML5 native validation UI for normal fields + inline error ONLY for hidden required file inputs
            const fileResult = checkHiddenRequiredFileInputs($form, { scroll: false });
            const choiceResult = checkChoiceGroupRequired($form, { scroll: false });
            const dateResult = checkReadonlyRequiredDateInputs($form, { scroll: false });

            // Temporarily disable required on hidden file inputs so reportValidity won't throw "not focusable"
            const $hiddenRequiredFiles = $form.find('input[type="file"][required]:hidden');
            $hiddenRequiredFiles.each(function () {
                $(this).data('wpfb-required-disabled', true);
                this.removeAttribute('required');
            });

            const nativeValid = this.checkValidity ? this.checkValidity() : true;
            if (!nativeValid) {
                // show browser's normal HTML5 bubbles
                this.reportValidity?.();
            }

            // restore required back
            $hiddenRequiredFiles.each(function () {
                if ($(this).data('wpfb-required-disabled')) {
                    this.setAttribute('required', 'required');
                    $(this).removeData('wpfb-required-disabled');
                }
            });

            if (!nativeValid || fileResult.invalid || choiceResult.invalid || dateResult.invalid) {
                // If there is no native invalid field (so no browser focus/scroll happened),
                // scroll/focus to the first custom invalid field (radio/checkbox/file hidden/date readonly)
                if (nativeValid) {
                    const $firstCustom = pickFirstGroupByDom(
                        pickFirstGroupByDom(choiceResult.$firstGroup, fileResult.$firstGroup),
                        dateResult.$firstGroup
                    );
                    if ($firstCustom?.length) {
                        focusAndScrollGroup($firstCustom);
                    }
                }
                return;
            }
        }

        const required = await checkRequiredFields($form);
        if (required) { return; }
        const formElement = $(this) // Chú ý ở đây formElement là thằng thẻ form
        const formWrapper = $(this).closest('.wpformbuilder-form');
        const overlay = formWrapper.find('.wpformbuilder-overlay');
        overlay.prop('hidden', false);

        const parentForms = formElement.closest('.wpformbuilder-form');
        const formData = new FormData(this);
        const formID = $(this).data('form-id');
        const post_form_id = $(this).data('post-form');

        formData.append('action', 'sunformbuilder_submit_from');
        formData.append('formID', formID);
        formData.append('post_form_id', post_form_id);
        // formData.append('field_attribute', JSON.stringify(fieldAttributes));
        formData.append('nonce', sfbuilder_js_data.nonce);
        console.log('submit form ---> Da vao day 2');
        if (stripePayment) {
            formData.set('action', 'sunformbuilder_stripe_payment');
            var stripePaymentData = await $.ajax({
                url: sfbuilder_js_data.ajaxurl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false
            });

            if (stripePaymentData && isJson(stripePaymentData)) {
                stripePaymentData = JSON.parse(stripePaymentData);
                await stripe.confirmCardPayment(stripePaymentData.client_secret, {
                    payment_method: {
                        card: paymentElement,
                        billing_details: stripePaymentData.billing_details
                    },
                    setup_future_usage: 'off_session'
                }).then(function (result) {
                    if (result.error) {
                        const $stripeMsg = parentForms.find('.wpformbuilder-message__stripe');
                        $stripeMsg
                            .removeClass('success')
                            .addClass('error')
                            .stop(true, true)
                            .text(stripePaymentData.msg.falid)
                            .show()
                            .delay(5000)
                            .fadeOut(300);
                        stopSubmit = true;
                    } else {
                        const $stripeMsg = parentForms.find('.wpformbuilder-message__stripe');
                        $stripeMsg
                            .removeClass('error')
                            .addClass('success')
                            .stop(true, true)
                            .text(stripePaymentData.msg.success)
                            .show()
                            .delay(5000)
                            .fadeOut(300);
                        formData.set('action', 'sunformbuilder_submit_from');
                    }
                    paymentElement.clear();
                });
            } else {
                const $stripeMsg = parentForms.find('.wpformbuilder-message__stripe');
                $stripeMsg
                    .removeClass('success')
                    .addClass('error')
                    .stop(true, true)
                    .text(stripePaymentData.msg.falid)
                    .show()
                    .delay(5000)
                    .fadeOut(300);
                stopSubmit = true;
            }
        }
        // /console.log('stripePaymentData:-----> ', stripePaymentData);
        // return false;
        if(stopSubmit){
            overlay.prop('hidden', true);
            return false;
        }
        jQuery.ajax({
            url: sfbuilder_js_data.ajaxurl,
            type: 'POST',  // Phương thức POST
            dataType: "json",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                console.log('response ---> ', response);
                const $submitMsg = parentForms.find('.wpformbuilder-message__submit');
                $submitMsg
                    .removeClass('success')
                    .addClass(response.status)
                    .stop(true, true)
                    .text(response.msg)
                    .show()
                    .delay(5000)
                    .fadeOut(300);
                parentForms.find('form.wpformbuilder-box-form')[0].reset();
                if (response?.redirect?.enabled) {
                    if (response?.redirect?.open_in_new_tab) {
                        window.open(response?.redirect?.link, '_blank')
                    } else {
                        window.location.href = response?.redirect?.link;
                    }
                }
                overlay.prop('hidden', true);
            },
            error: function (xhr, status, error) {
                // Xử lý khi có lỗi xảy ra trong quá trình gửi dữ liệu
                console.error('Error: ' + error);  // In lỗi ra console
                overlay.prop('hidden', true);
                // Hiển thị thông báo lỗi
                //$('#responseMessage').html('<p>There was an error submitting the form.</p>');
            }
        });

        //console.log('formData.entries(): ', formData.entries());
        // for (const [name, value] of formData.entries()) {
        //     console.log(`${name}: ${value}`);
        // }
    });

    const pickFirstGroupByDom = ($a, $b) => {
        if (!$a?.length) return $b || null;
        if (!$b?.length) return $a || null;
        const a = $a.get(0);
        const b = $b.get(0);
        const pos = a.compareDocumentPosition(b);
        // If b is before a in document order, pick b
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return $b;
        return $a;
    };

    const focusAndScrollGroup = ($group) => {
        const top = $group.offset()?.top;
        if (typeof top === 'number') {
            window.scrollTo({ top: top - 100, behavior: 'smooth' });
        }

        // Try focusing something focusable inside the group (best-effort)
        const $focusable = $group.find('input:not([type="hidden"]):not(:hidden), select:not(:hidden), textarea:not(:hidden), button:not(:hidden), [tabindex]:not([tabindex="-1"])').first();
        if ($focusable.length) {
            $focusable.trigger('focus');
            return;
        }
        // For custom upload widgets, focus the visible label/button if present
        const $uploadLabel = $group.find('.wpformbuilder-image-upload-label, .wpformbuilder-file-upload-label, label[for]').first();
        if ($uploadLabel.length) {
            $uploadLabel.trigger('focus');
        }
    };

    const checkChoiceGroupRequired = (formElement, opts = { scroll: true }) => {
        const requiredFields = formElement.find('[data-required="1"]');
        const firstRequiredField = requiredFields.first();
        let isInvalid = false;
        let $firstGroup = null;
        const msgRequiredFallback = ($.validator?.messages?.required) || 'This field is required.';
        if (requiredFields.length) {
            $.each(requiredFields, function (_index, field) {
                const fieldType = $(field).data('type');
                let fieldValidate = false;
                if (fieldType === 'radio' || fieldType === 'checkbox') {
                    const isChecked = $(field).find(`input[type="${fieldType}"]:checked`).length > 0;
                    fieldValidate = $(field).find(`input[type="${fieldType}"]`);
                    if (!isChecked) {
                        isInvalid = true;
                        if (!$firstGroup) $firstGroup = $(field);
                        const $group = $(field);
                        const $required = ensureRequiredEl($group);
                        const customMsg = getGroupRequiredMessage($group);
                        $required.text(customMsg || msgRequiredFallback).fadeIn('swing');
                    }
                }
                if (fieldValidate) {
                    fieldValidate.on('change', function () {
                        $(field).find('.wpformbuilder-form-group__required').eq(0).fadeOut('swing');
                    });
                }
            });
            if (isInvalid && opts?.scroll) {
                const firstFieldOffset = firstRequiredField.offset().top - 100;
                window.scrollTo({ top: firstFieldOffset, behavior: 'smooth' });
            }
        }
        return { invalid: isInvalid, $firstGroup };
    };

    const checkHiddenRequiredFileInputs = (formElement, opts = { scroll: true }) => {
        const $requiredHiddenFiles = formElement.find('input[type="file"][required]:hidden');
        if (!$requiredHiddenFiles.length) return { invalid: false, $firstGroup: null };

        let isInvalid = false;
        let $firstGroup = null;
        const msgRequiredFallback = ($.validator?.messages?.required) || 'This field is required.';

        $requiredHiddenFiles.each(function () {
            const el = this;
            const hasFiles = !!(el.files && el.files.length > 0);
            const $group = $(el).closest('.wpformbuilder-form-group');
            if (!$group.length) return;

            const $required = ensureRequiredEl($group);
            const customMsg = getGroupRequiredMessage($group);

            if (!hasFiles) {
                isInvalid = true;
                if (!$firstGroup) $firstGroup = $group;
                $required.text(customMsg || msgRequiredFallback).fadeIn('swing');
            } else {
                $required.fadeOut('swing');
            }
        });

        if (isInvalid && $firstGroup?.length && opts?.scroll) {
            const top = $firstGroup.offset()?.top;
            if (typeof top === 'number') {
                window.scrollTo({ top: top - 100, behavior: 'smooth' });
            }
        }

        // Hide required error once user picks a file (HTML5 mode does not init jquery validate)
        formElement.off('change.wpfbHtml5FileFix').on('change.wpfbHtml5FileFix', 'input[type="file"]', function () {
            const $group = $(this).closest('.wpformbuilder-form-group');
            $group.find('.wpformbuilder-form-group__required').first().fadeOut('swing');
        });

        return { invalid: isInvalid, $firstGroup };
    };

    const checkReadonlyRequiredDateInputs = (formElement, opts = { scroll: true }) => {
        const $dateInputs = formElement.find('input.wpformbuilder-form-control__field.date[required]');
        if (!$dateInputs.length) return { invalid: false, $firstGroup: null };

        let isInvalid = false;
        let $firstGroup = null;
        const msgRequiredFallback = ($.validator?.messages?.required) || 'This field is required.';

        $dateInputs.each(function () {
            const el = this;
            const fp = el?._flatpickr;
            const allowInput = fp?.config?.allowInput;
            const isReadonlyMode = allowInput === false;
            if (!isReadonlyMode) return; // allowInput=true => let native HTML5 bubbles handle it

            const hasValue = !!(el.value && el.value.trim().length);
            const $group = $(el).closest('.wpformbuilder-form-group');
            if (!$group.length) return;

            const $required = ensureRequiredEl($group);
            const customMsg = getGroupRequiredMessage($group);

            if (!hasValue) {
                isInvalid = true;
                if (!$firstGroup) $firstGroup = $group;
                $required.text(customMsg || msgRequiredFallback).fadeIn('swing');
            } else {
                $required.fadeOut('swing');
            }
        });

        if (isInvalid && $firstGroup?.length && opts?.scroll) {
            const top = $firstGroup.offset()?.top;
            if (typeof top === 'number') {
                window.scrollTo({ top: top - 100, behavior: 'smooth' });
            }
        }

        // Hide required error once user picks a date via flatpickr
        formElement.off('change.wpfbHtml5DateFix').on('change.wpfbHtml5DateFix', 'input.wpformbuilder-form-control__field.date', function () {
            const $group = $(this).closest('.wpformbuilder-form-group');
            $group.find('.wpformbuilder-form-group__required').first().fadeOut('swing');
        });

        return { invalid: isInvalid, $firstGroup };
    };

    const checkRequiredFields = async (formElement) => {
        let isValid = false;

        //For reCAPTCHA v2
        const recaptchaV2Field = formElement.find('.g-recaptcha');
        const requiredRecaptchaV2Element = recaptchaV2Field.closest('.wpformbuilder-form-control.recaptcha_v2').find('.wpformbuilder-form-group__required');
        if (recaptchaV2Field.length) {
            const recaptchaResponse = grecaptcha.getResponse();
            if (recaptchaResponse.length === 0) {
                isValid = true;
                requiredRecaptchaV2Element.eq(0).fadeIn('swing');
            } else {
                requiredRecaptchaV2Element.eq(0).fadeOut('swing');
            }
        }
        return isValid;
    }
    function parseStripeOptions(input) {
        if (!input || typeof input !== 'string') return {};
        try {
            // Bọc chuỗi thành object hợp lệ
            const wrapped = `{${input}}`;

            // Tạo function sandbox (an toàn hơn eval)
            const fn = new Function(`"use strict"; return (${wrapped});`);
            const result = fn();

            // Chỉ cho phép object thuần
            if (result && typeof result === 'object' && !Array.isArray(result)) {
                return result;
            }

            return {};
        } catch (e) {
            console.error('Error parsing stripe options:', e);
            return {};
        }
    };
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
});
// })(jQuery);