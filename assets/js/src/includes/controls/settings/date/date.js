const { useEffect, useRef } = wp.element;
const { __experimentalInputControl, Flex, FlexItem, ToggleControl, SelectControl } = wp.components;
import flatpickr from 'flatpickr';
import AceCode from '../../editor/ace-editor/ace-editor.js';
import 'flatpickr/dist/flatpickr.min.css';
import './date.css';

const WPformbuilderDateSettings = ({ index, attributes, item, setAttributes }) => {
    const minDateRef = useRef(null);
    const maxDateRef = useRef(null);
    const previousDateFormatRef = useRef(item?.date_format || 'Y-m-d');
    let flatpickr_custom_options = item?.flatpickr_custom_options ?? false;
    let flatpickr_options = null;
    if (flatpickr_custom_options) {
        flatpickr_options = item?.flatpickr_options ?? {};
    } else {
        flatpickr_options = {
            dateFormat: item?.date_format ?? 'Y-m-d',
            minDate: item?.min_date ?? null,
            maxDate: item?.max_date ?? null,
            locale: item?.date_language ?? 'en'
        };
    }

    const localeSelected = item?.date_language || 'en';
    if (localeSelected !== 'en') {
        require(`../../../../../lib/flatpickr/languages/${localeSelected}.js`);
    }

    const formatDateForDisplay = (dateString, format) => {
        if (!dateString) return '';
        
        // Sử dụng flatpickr.parseDate để parse đúng format
        const dateFormat = format || 'Y-m-d';
        const parsedDate = flatpickr.parseDate(dateString, dateFormat);
        
        // Nếu parse thất bại, thử parse với Date object hoặc ISO format
        if (!parsedDate || isNaN(parsedDate.getTime())) {
            const fallbackDate = new Date(dateString);
            if (isNaN(fallbackDate.getTime())) {
                return '';
            }
            return flatpickr.formatDate(fallbackDate, dateFormat);
        }
        
        return flatpickr.formatDate(parsedDate, dateFormat);
    };

    const setDateAttribute = (newValue, attrName, index) => {
        const newItems = [...attributes?.fields];
        if (newItems[index]) {
            newItems[index][attrName] = newValue;
            setAttributes({ fields: newItems });
        }
    }

    const parseFlatpickrOptions = (input) => {
        if (!input || typeof input !== 'string') return {};

        try {
            const wrapped = `{${input}}`;

            const fn = new Function(`"use strict"; return (${wrapped});`);
            const result = fn();

            if (result && typeof result === 'object' && !Array.isArray(result)) {
                return result;
            }

            return {};
        } catch (e) {
            return {};
        }
    };

    const setFlatpickrOptions = (options) => {
        setDateAttribute(options, 'flatpickr_options_raw', index);
        const parsedOptions = parseFlatpickrOptions(options);
        setDateAttribute(parsedOptions, 'flatpickr_options', index);
    }

    // Convert date values khi date_format thay đổi
    useEffect(() => {
        const currentFormat = item?.date_format || 'Y-m-d';
        const previousFormat = previousDateFormatRef.current;

        // Nếu format không thay đổi, chỉ cần cập nhật ref
        if (currentFormat === previousFormat) {
            previousDateFormatRef.current = currentFormat;
            return;
        }

        // Convert min_date
        if (item?.min_date) {
            // Parse với format cũ
            let parsedDate = flatpickr.parseDate(item.min_date, previousFormat);
            
            // Nếu parse với format cũ thất bại, thử parse với format mới hoặc ISO
            if (!parsedDate || isNaN(parsedDate.getTime())) {
                parsedDate = flatpickr.parseDate(item.min_date, currentFormat);
            }
            
            // Nếu vẫn thất bại, thử parse với Date object
            if (!parsedDate || isNaN(parsedDate.getTime())) {
                const fallbackDate = new Date(item.min_date);
                if (!isNaN(fallbackDate.getTime())) {
                    parsedDate = fallbackDate;
                }
            }

            // Format lại với format mới
            if (parsedDate && !isNaN(parsedDate.getTime())) {
                const newFormattedDate = flatpickr.formatDate(parsedDate, currentFormat);
                setDateAttribute(newFormattedDate, 'min_date', index);
            }
        }

        // Convert max_date
        if (item?.max_date) {
            // Parse với format cũ
            let parsedDate = flatpickr.parseDate(item.max_date, previousFormat);
            
            // Nếu parse với format cũ thất bại, thử parse với format mới hoặc ISO
            if (!parsedDate || isNaN(parsedDate.getTime())) {
                parsedDate = flatpickr.parseDate(item.max_date, currentFormat);
            }
            
            // Nếu vẫn thất bại, thử parse với Date object
            if (!parsedDate || isNaN(parsedDate.getTime())) {
                const fallbackDate = new Date(item.max_date);
                if (!isNaN(fallbackDate.getTime())) {
                    parsedDate = fallbackDate;
                }
            }

            // Format lại với format mới
            if (parsedDate && !isNaN(parsedDate.getTime())) {
                const newFormattedDate = flatpickr.formatDate(parsedDate, currentFormat);
                setDateAttribute(newFormattedDate, 'max_date', index);
            }
        }

        // Cập nhật ref với format mới
        previousDateFormatRef.current = currentFormat;
    }, [item?.date_format]);

    useEffect(() => {
        // Chỉ khởi tạo flatpickr khi Custom Options tắt
        if (item?.flatpickr_custom_options) {
            // Destroy instance nếu có khi bật Custom Options
            if (minDateRef.current && minDateRef.current._flatpickr) {
                minDateRef.current._flatpickr.destroy();
            }
            return;
        }

        // Đợi DOM render xong trước khi khởi tạo flatpickr
        const timer = setTimeout(() => {
            if (!minDateRef.current) return;

            // Destroy instance cũ nếu có
            if (minDateRef.current._flatpickr) {
                minDateRef.current._flatpickr.destroy();
            }

            const dateFormat = item?.date_format || 'Y-m-d';
            let defaultMinDate = null;
            
            // Parse min_date string theo đúng format
            if (item?.min_date) {
                const parsedDate = flatpickr.parseDate(item.min_date, dateFormat);
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                    defaultMinDate = parsedDate;
                }
            }

            flatpickr(minDateRef.current, {
                dateFormat: dateFormat,
                defaultDate: defaultMinDate,
                locale: localeSelected,
                onChange: ([date]) => {
                    setDateAttribute(
                        date ? flatpickr.formatDate(date, dateFormat) : '',
                        'min_date',
                        index
                    );
                },
            });
        }, 0);

        return () => {
            clearTimeout(timer);
            if (minDateRef.current && minDateRef.current._flatpickr) {
                minDateRef.current._flatpickr.destroy();
            }
        };
    }, [item?.date_format, item?.date_language, item?.min_date, item?.flatpickr_custom_options]);

    useEffect(() => {
        // Chỉ khởi tạo flatpickr khi Custom Options tắt
        if (item?.flatpickr_custom_options) {
            // Destroy instance nếu có khi bật Custom Options
            if (maxDateRef.current && maxDateRef.current._flatpickr) {
                maxDateRef.current._flatpickr.destroy();
            }
            return;
        }

        // Đợi DOM render xong trước khi khởi tạo flatpickr
        const timer = setTimeout(() => {
            if (!maxDateRef.current) return;

            // Destroy instance cũ nếu có
            if (maxDateRef.current._flatpickr) {
                maxDateRef.current._flatpickr.destroy();
            }

            const dateFormat = item?.date_format || 'Y-m-d';
            let defaultMaxDate = null;
            
            // Parse max_date string theo đúng format
            if (item?.max_date) {
                const parsedDate = flatpickr.parseDate(item.max_date, dateFormat);
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                    defaultMaxDate = parsedDate;
                }
            }

            flatpickr(maxDateRef.current, {
                dateFormat: dateFormat,
                defaultDate: defaultMaxDate,
                locale: localeSelected,
                onChange: ([date]) => {
                    setDateAttribute(
                        date ? flatpickr.formatDate(date, dateFormat) : '',
                        'max_date',
                        index
                    );
                },
            });
        }, 0);

        return () => {
            clearTimeout(timer);
            if (maxDateRef.current && maxDateRef.current._flatpickr) {
                maxDateRef.current._flatpickr.destroy();
            }
        };
    }, [item?.date_format, item?.date_language, item?.max_date, item?.flatpickr_custom_options]);

    return (
        <div className="wpformbuilder-date-settings">
            <SelectControl
                label="Date Language"
                value={item?.date_language || 'en'}
                labelPosition="edge"
                onChange={(newValue) => setDateAttribute(newValue, 'date_language', index)}
                options={[
                    { label: 'Arabic', value: 'ar' },
                    { label: 'Azerbaijani', value: 'az' },
                    { label: 'Belarusian', value: 'be' },
                    { label: 'Bengali', value: 'bn' },
                    { label: 'Bosnian', value: 'bs' },
                    { label: 'Bulgarian', value: 'bg' },
                    { label: 'Catalan', value: 'cat' },
                    { label: 'Chinese', value: 'zh' },
                    { label: 'Chinese (Traditional)', value: 'zh-tw' },
                    { label: 'Croatian', value: 'hr' },
                    { label: 'Czech', value: 'cs' },
                    { label: 'Danish', value: 'da' },
                    { label: 'Dutch', value: 'nl' },
                    { label: 'English', value: 'en' },
                    { label: 'Esperanto', value: 'eo' },
                    { label: 'Estonian', value: 'et' },
                    { label: 'Faroese', value: 'fo' },
                    { label: 'Finnish', value: 'fi' },
                    { label: 'French', value: 'fr' },
                    { label: 'Georgian', value: 'ka' },
                    { label: 'German', value: 'de' },
                    { label: 'Greek', value: 'gr' },
                    { label: 'Hebrew', value: 'he' },
                    { label: 'Hindi', value: 'hi' },
                    { label: 'Hungarian', value: 'hu' },
                    { label: 'Icelandic', value: 'is' },
                    { label: 'Indonesian', value: 'id' },
                    { label: 'Irish', value: 'ga' },
                    { label: 'Italian', value: 'it' },
                    { label: 'Japanese', value: 'ja' },
                    { label: 'Kazakh', value: 'kz' },
                    { label: 'Khmer', value: 'km' },
                    { label: 'Korean', value: 'ko' },
                    { label: 'Latvian', value: 'lv' },
                    { label: 'Lithuanian', value: 'lt' },
                    { label: 'Macedonian', value: 'mk' },
                    { label: 'Malay', value: 'ms' },
                    { label: 'Mongolian', value: 'mn' },
                    { label: 'Myanmar (Burmese)', value: 'my' },
                    { label: 'Norwegian', value: 'no' },
                    { label: 'Persian', value: 'fa' },
                    { label: 'Polish', value: 'pl' },
                    { label: 'Portuguese', value: 'pt' },
                    { label: 'Punjabi', value: 'pa' },
                    { label: 'Romanian', value: 'ro' },
                    { label: 'Russian', value: 'ru' },
                    { label: 'Serbian', value: 'sr' },
                    { label: 'Serbian (Cyrillic)', value: 'sr-cyr' },
                    { label: 'Sinhala', value: 'si' },
                    { label: 'Slovak', value: 'sk' },
                    { label: 'Slovenian', value: 'sl' },
                    { label: 'Spanish', value: 'es' },
                    { label: 'Swedish', value: 'sv' },
                    { label: 'Thai', value: 'th' },
                    { label: 'Turkish', value: 'tr' },
                    { label: 'Ukrainian', value: 'uk' },
                    { label: 'Vietnamese', value: 'vn' },
                    { label: 'Welsh', value: 'cy' },
                ]}
            />
            <Flex style={{ marginBottom: '10px' }}>
                <FlexItem>
                    <label>Custom Options</label>
                </FlexItem>
                <FlexItem className="wpformbuilder-no-margin-bootom">
                    <ToggleControl
                        __nextHasNoMarginBottom={true}
                        checked={item?.flatpickr_custom_options || false}
                        onChange={(toogle) => setDateAttribute(toogle, 'flatpickr_custom_options', index)}
                    />
                </FlexItem>
            </Flex>
            {!item?.flatpickr_custom_options && (
                <>
                    <__experimentalInputControl
                        label="Date Format"
                        labelPosition="side"
                        value={item?.date_format || 'Y-m-d'}
                        type="text"
                        onChange={(newValue) => setDateAttribute(newValue, 'date_format', index)}
                        help={
                            <p>Refer to <a class="wpformbuilder-link-help" href="https://flatpickr.js.org/formatting/" target="_blank" rel="noopener noreferrer">flatpickr</a> for date format options.</p>
                        }
                    />
                    <div className="wpformbuilder-components-base-control">
                        <div style={{ width: '30%' }}>
                            <label htmlFor="wpformbuilder-min-date" className="wpformbuilder-components-base-control__label">Min date</label>
                        </div>
                        <input
                            ref={minDateRef}
                            type="text"
                            value={formatDateForDisplay(item?.min_date, item?.date_format)}
                            onChange={(newValue) => setDateAttribute(newValue, 'min_date', index)}
                            readOnly
                            className="wpformbuilder-components-text-control__input"
                            id='wpformbuilder-min-date'
                            style={{ width: '65%', backgroundColor: 'white' }}
                        />

                    </div>
                    <div className="wpformbuilder-components-base-control">
                        <div style={{ width: '30%' }}>
                            <label htmlFor="wpformbuilder-max-date" className="wpformbuilder-components-base-control__label">Max date</label>
                        </div>
                        <input
                            ref={maxDateRef}
                            type="text"
                            value={formatDateForDisplay(item?.max_date, item?.date_format)}
                            onChange={(newValue) => setDateAttribute(newValue, 'max_date', index)}
                            readOnly
                            className="wpformbuilder-components-text-control__input"
                            id='wpformbuilder-max-date'
                            style={{ width: '65%', backgroundColor: 'white' }}
                        />
                    </div>
                    <__experimentalInputControl
                        label="Default date"
                        labelPosition="side"
                        value={item?.default_date || ''}
                        type="text"
                        onChange={(newValue) => setDateAttribute(newValue, 'default_date', index)}
                        help={
                            <p style={{ marginBottom: '5px', marginTop: '0px' }}>Enter the date in the correct format. You can use "today" to use today's date.</p>
                        }
                    />
                </>
            )}
            {item?.flatpickr_custom_options && (
                <>
                    <AceCode
                        onChange={(newValue) => setFlatpickrOptions(newValue)}
                        value={item?.flatpickr_options_raw || ''}
                        mode="javascript"
                        width='78%'
                    />
                    <p className="wpformbuilder-help-text">View <a class="wpformbuilder-link-help" href="https://flatpickr.js.org/options/" target="_blank" rel="noopener noreferrer">flatpickr options</a> for more information.</p>
                </>
            )}
        </div>
    );
};

export default WPformbuilderDateSettings;