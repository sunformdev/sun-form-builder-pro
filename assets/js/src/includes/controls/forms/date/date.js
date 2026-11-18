import { getColumnWidth } from '../../../functions';
const { useEffect, useRef } = wp.element;
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const WPformbuilderDateControl = ({ attributes, device, style }) => {
    const inputRef = useRef(null);
    const fpRef = useRef(null);

    let hide_label = attributes?.hide_label ?? false;
    let input_size = attributes?.input_size ?? 'small';
    let label = attributes?.label ?? '';
    let width = getColumnWidth(attributes, device, style);

    let date_attribute = {
        type: 'text',
        name: attributes?.name ?? "",
        className: `wpformbuilder-form-control__field ${input_size}`,
        required: attributes?.required ? 'required' : '',
        placeholder: attributes?.placeholder ?? '',
    };

    useEffect(() => {
        if (!inputRef.current) return;

        if (fpRef.current) {
            fpRef.current.destroy();
            fpRef.current = null;
        }

        // Parse dates mỗi lần useEffect chạy để đảm bảo có giá trị mới nhất
        const parseDateString = (dateString, dateFormat) => {
            if (!dateString) return null;
            if (dateString instanceof Date) {
                return dateString;
            }
            if (typeof dateString === 'string') {
                // Sử dụng flatpickr.parseDate để parse đúng format
                const parsedDate = flatpickr.parseDate(dateString, dateFormat);
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                    return parsedDate;
                }
                // Fallback: thử parse với Date object hoặc ISO format
                const fallbackDate = new Date(dateString);
                if (!isNaN(fallbackDate.getTime())) {
                    return fallbackDate;
                }
            }
            return null;
        };

        const flatpickr_custom_options = attributes?.flatpickr_custom_options ?? false;
        let options = null;
        if (flatpickr_custom_options) {
            options = attributes?.flatpickr_options ?? {};
        } else {
            const dateFormat = attributes?.date_format ?? 'Y-m-d';
            options = {
                dateFormat: dateFormat,
                minDate: parseDateString(attributes?.min_date, dateFormat),
                maxDate: parseDateString(attributes?.max_date, dateFormat),
                locale: attributes?.date_language ?? 'en',
                defaultDate: parseDateString(attributes?.default_date, dateFormat),
                allowInput: true
            };
        }
        if (attributes?.date_language && attributes?.date_language !== 'en') {
            require(`../../../../../lib/flatpickr/languages/${attributes?.date_language || 'en'}.js`);
        }
        fpRef.current = flatpickr(
            inputRef.current,
            options
        );

        return () => {
            if (fpRef.current) {
                fpRef.current.destroy();
                fpRef.current = null;
            }
        };
    }, [
        attributes?.date_format,
        attributes?.min_date,
        attributes?.max_date,
        attributes?.date_language,
        attributes?.flatpickr_custom_options,
        attributes?.flatpickr_options,
        attributes?.default_date
    ]);

    return (
        <div className="wpformbuilder-form-group" style={{ width }}>
            {!hide_label && (
                <label className="wpformbuilder-form-group__label">{label}</label>
            )}

            <div className="wpformbuilder-form-control date">
                <input ref={inputRef} {...date_attribute} />
            </div>
        </div>
    );
};

export default WPformbuilderDateControl;
