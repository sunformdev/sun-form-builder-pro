/**
 * Multi-step form: chỉ hiển thị một panel tại một thời điểm; Next / Previous đổi bước.
 * Markup: .wpformbuilder-multi-step-form__panel[data-step-index], nút .wpformbuilder-multi-step-form__button--next | --previous
 */
import jQuery from 'jquery';

jQuery(function ($) {
    const getGroupRequiredMessage = ($group) => {
        const msg1 = (($group.data('required-message') || '') + '').trim();
        if (msg1) return msg1;
        return (($group.data('msg-required') || '') + '').trim();
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
        return type === 'semantic' ? 'inline' : type;
    };

    /** Checkbox/radio bắt buộc theo nhóm (data-required trên wrapper) — giống submit.js checkChoiceGroupRequired */
    const validateRequiredChoiceGroups = ($panel) => {
        const msgRequiredFallback = ($.validator?.messages?.required) || 'This field is required.';
        let $firstInvalid = null;
        $panel.find('[data-required="1"]').each(function () {
            const $g = $(this);
            const fieldType = $g.data('type');
            if (fieldType !== 'radio' && fieldType !== 'checkbox') {
                return;
            }
            const isChecked = $g.find(`input[type="${fieldType}"]:checked`).length > 0;
            if (!isChecked) {
                if (!$firstInvalid) {
                    $firstInvalid = $g;
                }
                const $required = ensureRequiredEl($g);
                const customMsg = getGroupRequiredMessage($g);
                $required.text(customMsg || msgRequiredFallback).fadeIn('swing');
            }
        });
        if ($firstInvalid?.length) {
            const top = $firstInvalid.offset()?.top;
            if (typeof top === 'number') {
                window.scrollTo({ top: top - 100, behavior: 'smooth' });
            }
            return false;
        }
        return true;
    };

    /** File/image upload: input type=file bị ẩn (display:none) — giống submit.js checkHiddenRequiredFileInputs */
    const validateHiddenRequiredFileInputsInPanel = ($panel) => {
        const msgRequiredFallback = ($.validator?.messages?.required) || 'This field is required.';
        let $firstInvalid = null;
        $panel.find('input[type="file"][required]:hidden').each(function () {
            const el = this;
            const hasFiles = !!(el.files && el.files.length > 0);
            const $group = $(el).closest('.wpformbuilder-form-group');
            if (!$group.length) {
                return;
            }
            const $required = ensureRequiredEl($group);
            const customMsg = getGroupRequiredMessage($group);
            if (!hasFiles) {
                if (!$firstInvalid) {
                    $firstInvalid = $group;
                }
                $required.text(customMsg || msgRequiredFallback).fadeIn('swing');
            } else {
                $required.fadeOut('swing');
            }
        });
        if ($firstInvalid?.length) {
            const top = $firstInvalid.offset()?.top;
            if (typeof top === 'number') {
                window.scrollTo({ top: top - 100, behavior: 'smooth' });
            }
            return false;
        }
        return true;
    };

    const validateCurrentPanel = ($form, $panel) => {
        const validateType = getValidateType($form);

        if (validateType === 'inline' && $.fn.validate) {
            const validator = $form.data('validator');
            if (!validator) {
                return true;
            }
            let ok = true;
            const seenChoiceGroups = new WeakSet();

            $panel.find('input, select, textarea').each(function () {
                const el = this;
                const $el = $(el);
                const t = (el.type || '').toLowerCase();
                if (t === 'button' || t === 'submit' || t === 'hidden') {
                    return;
                }
                // Khớp submit.js initFormValidate ignore: ':hidden:not(input[type="file"])' — vẫn validate file required dù ẩn
                if (!$el.is(':visible') && !(t === 'file' && el.required)) {
                    return;
                }

                if (t === 'checkbox' || t === 'radio') {
                    const $grp = el.closest(
                        '[data-required="1"][data-type="checkbox"], [data-required="1"][data-type="radio"]'
                    );
                    if ($grp) {
                        if (seenChoiceGroups.has($grp)) {
                            return;
                        }
                        seenChoiceGroups.add($grp);
                        const dtype = $($grp).data('type') || t;
                        const $first = $($grp).find(`input[type="${dtype}"]`).first();
                        if ($first.length && !validator.element($first[0])) {
                            ok = false;
                        }
                        return;
                    }
                }

                if (!validator.element(el)) {
                    ok = false;
                }
            });
            return ok;
        }

        if (!validateRequiredChoiceGroups($panel)) {
            return false;
        }

        if (!validateHiddenRequiredFileInputsInPanel($panel)) {
            return false;
        }

        const els = $panel.find('input, select, textarea').filter(':visible').get();
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            const t = (el.type || '').toLowerCase();
            if (t === 'hidden' || t === 'button' || t === 'submit') {
                continue;
            }
            if (t === 'radio' || t === 'checkbox') {
                const grp = el.closest(
                    '[data-required="1"][data-type="checkbox"], [data-required="1"][data-type="radio"]'
                );
                if (grp) {
                    continue;
                }
            }
            if (typeof el.checkValidity === 'function' && !el.checkValidity()) {
                el.reportValidity?.();
                return false;
            }
        }
        return true;
    };

    $('form.wpformbuilder-box-form').each(function () {
        const $form = $(this);
        const $panels = $form.find('.wpformbuilder-multi-step-form__panel');
        if ($panels.length <= 1) {
            return;
        }

        const sorted = $panels
            .toArray()
            .sort(
                (a, b) =>
                    Number(a.getAttribute('data-step-index') || 0) -
                    Number(b.getAttribute('data-step-index') || 0)
            );

        let activeIndex = 0;

        const $progress = $form.find('.wpformbuilder-multi-step-form__progress');

        const progressConnectorAnimEnd =
            'animationend.wpfbProgressConnector webkitAnimationEnd.wpfbProgressConnector';

        const applyProgressItems = (stepIndex) => {
            $progress
                .find('.wpformbuilder-multi-step-form__progress-item')
                .removeClass(
                    'wpformbuilder-progress-connector--animate-in wpformbuilder-progress-connector--animate-out'
                )
                .each(function (i) {
                    const $item = $(this);
                    $item.toggleClass('is-active', i === stepIndex);
                    $item.toggleClass('is-complete', i < stepIndex);
                    if (i === stepIndex) {
                        $item.attr('aria-current', 'step');
                    } else {
                        $item.removeAttr('aria-current');
                    }
                });
        };

        const showStep = (idx) => {
            const prevIndex = activeIndex;
            activeIndex = Math.max(0, Math.min(idx, sorted.length - 1));
            sorted.forEach((el, i) => {
                const hide = i !== activeIndex;
                el.hidden = hide;
                el.setAttribute('aria-hidden', hide ? 'true' : 'false');
            });
            $form.data('wpformbuilder-active-step', activeIndex);

            if (!$progress.length) {
                return;
            }

            const $items = $progress.find('.wpformbuilder-multi-step-form__progress-item');
            const goingForward = activeIndex > prevIndex;
            const goingBack = activeIndex < prevIndex;

            if (goingBack && prevIndex > 0) {
                const outIndex = prevIndex - 1;
                const $out = $items.eq(outIndex);
                applyProgressItems(activeIndex);
                $out.addClass('wpformbuilder-progress-connector--animate-out');
                $out.one(progressConnectorAnimEnd, function () {
                    $out.removeClass('wpformbuilder-progress-connector--animate-out');
                });
                return;
            }

            applyProgressItems(activeIndex);

            if (goingForward && prevIndex < sorted.length - 1) {
                const $in = $items.eq(prevIndex);
                $in.addClass('wpformbuilder-progress-connector--animate-in');
                $in.one(progressConnectorAnimEnd, function () {
                    $in.removeClass('wpformbuilder-progress-connector--animate-in');
                });
            }
        };

        showStep(0);

        $form.on('change.wpfbMultistepFileClear', 'input[type="file"]', function () {
            $(this).closest('.wpformbuilder-form-group').find('.wpformbuilder-form-group__required').first().fadeOut('swing');
        });

        $form.on('click', '.wpformbuilder-multi-step-form__button--next', function (e) {
            e.preventDefault();
            const $panel = $(sorted[activeIndex]);
            if (!validateCurrentPanel($form, $panel)) {
                return;
            }
            if (activeIndex < sorted.length - 1) {
                showStep(activeIndex + 1);
            }
        });

        $form.on('click', '.wpformbuilder-multi-step-form__button--previous', function (e) {
            e.preventDefault();
            if (activeIndex > 0) {
                showStep(activeIndex - 1);
            }
        });
    });
});
