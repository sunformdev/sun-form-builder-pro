const { Button, SelectControl, PanelBody, Icon, __experimentalHeading, __experimentalInputControl, __experimentalText } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { plus } from '@wordpress/icons';
const { useState, useMemo, useEffect } = wp.element;
import { getLabelByValue, removeItemByValue } from '../../../../functions.js';
import './zohocrm.css';

const RepeaterZohoCRM = ({ value, onChange, attributes }) => {
    const [openPanel, setOpenPanel] = useState('');
    const module = attributes?.action_submit_settings?.zohocrm?.module_selected;
    value = !value.length ? attributes?.action_submit_settings?.zohocrm?.mappings_default?.[module] : value;
    const fieldReqiured = value.length ? attributes?.action_submit_settings?.zohocrm?.fields_required?.[module] : [];

    const handleChangeTag = (index, newTag) => {
        const updated = [...value];
        updated[index].tag_name = newTag;
        onChange(updated);
    };

    useEffect(() => {
        const updated = [...value];
        let hasChanged = false;

        const setIfMatch = (tag, newValue) => {
            const i = updated.findIndex((item, idx) => idx < 2 && item.tag_name === tag && !item.field_name);
            if (i !== -1) {
                updated[i].field_name = newValue;
                hasChanged = true;
            }
        };

        setIfMatch('email', fieldOptions?.[0]?.value ?? '');
        if (hasChanged) onChange(updated);
    }, []);

    const handleChangeShortcode = (index, newShortcode) => {
        const updated = [...value];
        updated[index].field_name = newShortcode;
        onChange(updated);
    };

    const handleChangeCustomField = (index, newValue) => {
        const updated = [...value];
        updated[index].custom_value = newValue;
        onChange(updated);
    };

    const addRepeater = () => {
        const updated = [...value, { tag_name: "", field_name: "", custom_value: "" }];
        onChange(updated);
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
            <__experimentalHeading level="4" style={{ marginBottom: '10px', 'font-size': '13px' }}>Mapping Fields</__experimentalHeading>
            {value.map((item, index) => (
                <PanelBody
                    key={index}
                    title={
                        <>
                            {(getLabelByValue(attributes?.action_submit_settings?.zohocrm?.fields?.[module], item?.tag_name, item?.label ?? false)
                                ? `${getLabelByValue(attributes?.action_submit_settings?.zohocrm?.fields?.[module], item?.tag_name, item?.label ?? false)} -- ${item?.field_name == 'custom_value' ? item?.custom_value : item?.field_name}`
                                : `Item ${index + 1}`)}

                            {fieldReqiured.includes(item.tag_name) && index == 0 && (
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
                    {fieldReqiured.includes(item.tag_name) && (
                        <SelectControl
                            label="Tag Name"
                            value={item.tag_name || ''}
                            options={attributes?.action_submit_settings?.zohocrm?.fields?.[module] || []}
                            onChange={(val) => handleChangeTag(index, val)}
                            disabled={true}
                        />
                    )}
                    {!fieldReqiured.includes(item.tag_name) && (
                        <SelectControl
                            label="Tag Name"
                            value={item.tag_name || ''}
                            options={removeItemByValue(attributes?.action_submit_settings?.zohocrm?.fields?.[module], fieldReqiured) || []}
                            onChange={(val) => handleChangeTag(index, val)}
                        />
                    )}
                    <SelectControl
                        label="Field"
                        value={item?.field_name ?? fieldOptions?.[0]?.value}
                        options={fieldOptions}
                        onChange={(val) => handleChangeShortcode(index, val)}
                    />
                    {item?.field_name === 'custom_value' && (
                        <__experimentalInputControl
                            label="Custom Value"
                            labelPosition="top"
                            value={item?.custom_value || ''}
                            onChange={(val) => handleChangeCustomField(index, val)}
                        />
                    )}
                </PanelBody>
            ))}

            <Button className="wpformbuilder-button-add-repeater-map-field" style={{ margin: '0 auto', display: 'flex', height: '30px', position: 'relative' }} variant="primary" onClick={addRepeater} icon={<Icon icon={plus} size={14} style={{ width: '24px' }} />}><span style={{ marginBottom: '3px' }}>Add Item</span></Button>
        </>
    );
};
export default RepeaterZohoCRM;