const { Button, SelectControl, PanelBody, Icon, __experimentalHeading, __experimentalInputControl, __experimentalText } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { plus } from '@wordpress/icons';
const { useState, useMemo, useEffect } = wp.element;
import { getLabelByValue } from '../../../../functions.js';
import './redirect.css';

const RepeaterRedirect = ({ value, onChange, attributes }) => {
    const [openPanel, setOpenPanel] = useState('');

    useEffect(() => {
        const updated = [...value];
        let hasChanged = false;
        if (hasChanged) onChange(updated);
    }, []);

    const handleChangeCustomValue = (index, newShortcode) => {
        const updated = [...value];
        updated[index].value = newShortcode;
        onChange(updated);
    };

    const handleChangeCustomKey = (index, newValue) => {
        const updated = [...value];
        updated[index].key = newValue;
        onChange(updated);
    };

    const addRepeater = () => {
        onChange([
            ...value,
            { key: '', value: '' },
        ]);
    };

    const removeRepeater = (index) => {
        const updated = [...value];
        updated.splice(index, 1);
        onChange(updated);
    };

    const fieldOptions = useMemo(() => {
        const fields = attributes?.fields ?? [];
        let options = [{ 'label': '-- Select Field --', value: '', disabled: true }];
        for (const field of fields) {
            options.push({ label: field?.label.trim() || field?.name, value: field?.name });
        }
        options.push({ label: 'Custom Value', value: 'custom_value' });
        return options;
    }, [attributes?.fields]);

    return (
        <>
            <__experimentalHeading level="4" style={{ marginBottom: '10px', 'font-size': '13px', marginTop: '10px' }}>Custom Values</__experimentalHeading>
            {value.map((item, index) => (
                <PanelBody
                    key={index}
                    title={
                        <>
                            {(getLabelByValue(attributes?.action_submit_settings?.sendfox?.fields, item?.tag_name, item?.label ?? false)
                                ? `${getLabelByValue(attributes?.action_submit_settings?.sendfox?.fields, item?.tag_name, item?.label ?? false)} -- ${item?.field_name == 'custom_value' ? item?.custom_value : item?.field_name}`
                                : `Item ${index + 1}`)}

                            {['email'].includes(item.tag_name) && index == 0 && (
                                <__experimentalText className="wpformbuilder-repeater-required-ribbon">
                                    Required
                                </__experimentalText>
                            )}
                        </>
                    }
                    className='wpformbuilder-repeater-map-field-panel'
                    icon={index ? <FontAwesomeIcon icon={faXmark} className='wpformbuilder-remove-attribute-button' onClick={() => removeRepeater(index)} /> : null}
                    opened={index === openPanel}
                    onToggle={() => setOpenPanel(index === openPanel ? null : index)}
                >
                    <__experimentalInputControl
                        label="Key"
                        labelPosition="edge"
                        value={item?.key ?? ''}
                        type="text"
                        onChange={(newValue) => handleChangeCustomKey(index, newValue)}
                        className="wpformbuilder-google-section"
                    />
                    <__experimentalInputControl
                        label="Value"
                        labelPosition="edge"
                        value={item?.value ?? ''}
                        type="text"
                        onChange={(newValue) => handleChangeCustomValue(index, newValue)}
                        className="wpformbuilder-google-section"
                    />
                </PanelBody>
            ))}

            <Button className="wpformbuilder-button-add-repeater-map-field" style={{ margin: '0 auto', display: 'flex', height: '30px', position: 'relative' }} variant="primary" onClick={addRepeater} icon={<Icon icon={plus} size={14} style={{ width: '24px' }} />}><span style={{ marginBottom: '3px' }}>Add Item</span></Button>
        </>
    );
};
export default RepeaterRedirect;