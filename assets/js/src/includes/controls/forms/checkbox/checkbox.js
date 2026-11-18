import { getColumnWidth } from '../../../functions';
import './checkbox.css';

const WPformbuilderCheckboxControl = ({ attributes, device, style }) => {
    const hide_label = attributes?.hide_label ?? false;
    const label = attributes?.label ?? '';
    const input_size = attributes?.input_size ?? 'small';
    const width = getColumnWidth(attributes, device, style);
    const checkboxes = attributes?.options ?? [];
    const ParentTag = attributes?.use_fieldset ? 'fieldset' : 'div';
    const LabelTag = attributes?.use_fieldset ? 'legend' : 'label';

    const baseAttr = {
        type: 'checkbox',
        name: attributes?.name ?? "", 
        className: `wpformbuilder-form-control__field ${input_size}`,
    };

    return (
        <ParentTag className="wpformbuilder-form-group" style={{ width: `${width}` }}>
            {!hide_label && (
                <LabelTag className="wpformbuilder-form-group__label">{label}</LabelTag>
            )}
            <div className="wpformbuilder-form-control checkbox">
                {checkboxes.map((opt, i) => {
                    const checkboxItemAttr = { 
                        ...baseAttr, 
                        value: opt.value, 
                        id: `${attributes?.id || 'checkbox'}-${i}` 
                    };
                    return (
                        <div key={i} className='wpformbuilder-checkbox-item'>
                            <div className='wpformbuilder-checkbox-item__input'>
                                <input {...checkboxItemAttr} />
                            </div>
                            <label htmlFor={checkboxItemAttr.id}>{opt.label}</label>
                        </div>
                    );
                })}
            </div>
        </ParentTag >
    );
};

export default WPformbuilderCheckboxControl;
