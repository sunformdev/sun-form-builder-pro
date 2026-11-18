const { useEffect, useRef } = wp.element;
import $ from 'jquery';
import 'select2';
import 'select2/dist/css/select2.min.css';

const WPFrombuilderSelect2 = ({ value = [], onChange, options = [], multiple = false, label = '', sortOptions = false }) => {
    const selectRef = useRef(null);
    const isSyncing = useRef(false);

    useEffect(() => {
        const $select = $(selectRef.current);

        $select.select2({
            width: '100%',
            multiple,
        });

        // Handle select / unselect
        $select.on('select2:select select2:unselect', (e) => {
            if (isSyncing.current) return;

            // ⭐ Sort theo thứ tự click
            if (sortOptions && multiple && e.type === 'select2:select') {
                const option = e.params.data.element;
                $(option).detach();
                $select.append(option);
            }

            const val = $select.val();
            onChange(multiple ? val || [] : val);
        });

        return () => {
            $select.off('select2:select select2:unselect');
            $select.select2('destroy');
        };
    }, [multiple, sortBySelectionOrder]);

    // Sync từ React → Select2
    useEffect(() => {
        isSyncing.current = true;
        $(selectRef.current).val(value).trigger('change.select2');
        isSyncing.current = false;
    }, [value]);

    return (
        <>
            {label && (
                <span style={{ display: 'block', marginBottom: 10 }}>
                    {label}
                </span>
            )}

            <select ref={selectRef} multiple={multiple}>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </>
    );
};

export default WPFrombuilderSelect2;