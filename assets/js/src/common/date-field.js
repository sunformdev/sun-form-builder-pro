import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

jQuery(function ($) {
    const parseFlatpickrOptions = (input) => {
        if (!input || typeof input !== 'string') return {};
        // Các trường mặc định khi kéo ra chưa được kế thừa các attributes mặc định nên chuyển sang date bị lỗi
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
            console.error('Error parsing flatpickr options:', e);
            return {};
        }
    };

    const readFlatpickrOptions = ($control) => {
        const raw = ($control.attr('data-flatpickr-options-raw') || '').trim();
        if (raw !== '') {
            return parseFlatpickrOptions(raw);
        }
        const attr = $control.attr('data-flatpickr-options');
        if (attr && attr.trim() !== '') {
            try {
                const parsed = JSON.parse(attr);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                console.error('Error parsing flatpickr options JSON:', e);
            }
        }
        const fromData = $control.data('flatpickrOptions');
        if (fromData && typeof fromData === 'object' && !Array.isArray(fromData)) {
            return fromData;
        }
        return null;
    };

    const sanitizeFlatpickrOptions = (opts) => {
        const o = { ...opts };
        ['minDate', 'maxDate', 'defaultDate'].forEach((key) => {
            if (o[key] === '' || o[key] === null) {
                delete o[key];
            }
        });
        return o;
    };

    const initDateFields = ($root) => {
        const $scope = $root && $root.length ? $root : $(document);
        $scope.find('.wpformbuilder-form-control__field.date').each(function () {
            const el = this;
            if (el._flatpickr) {
                return;
            }
            const $field = $(el);
            const $parent = $field.parent();
            if (!$parent.length || !$parent.hasClass('date')) {
                return;
            }
            let flatpickrOptions = readFlatpickrOptions($parent);
            if (!flatpickrOptions || typeof flatpickrOptions !== 'object' || Array.isArray(flatpickrOptions)) {
                return;
            }
            flatpickrOptions = sanitizeFlatpickrOptions(flatpickrOptions);

            const localeSelected = (($parent.attr('data-date-language') || '').trim()) || 'en';

            if (typeof flatpickrOptions.allowInput === 'undefined') {
                flatpickrOptions.allowInput = true;
            }
            if (typeof flatpickrOptions.clickOpens === 'undefined') {
                flatpickrOptions.clickOpens = true;
            }

            if (localeSelected === 'en') {
                delete flatpickrOptions.locale;
            } else {
                flatpickrOptions.locale = localeSelected;
                try {
                    require(`../../lib/flatpickr/languages/${localeSelected}.js`);
                } catch (e) {
                    console.error('Flatpickr locale load failed:', localeSelected, e);
                }
            }

            try {
                flatpickr(el, flatpickrOptions);
            } catch (e) {
                console.error('Flatpickr init error:', e);
            }
        });
    };

    initDateFields($(document));

    // Form nhiều bước: panel ẩn (hidden) có thể khiến lần init đầu lỗi; thử lại sau khi đổi bước.
    $(document).on(
        'click',
        '.wpformbuilder-multi-step-form__button--next, .wpformbuilder-multi-step-form__button--previous',
        function () {
            window.setTimeout(function () {
                initDateFields($(document));
            }, 0);
        }
    );
});
