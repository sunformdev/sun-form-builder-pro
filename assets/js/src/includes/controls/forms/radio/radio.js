import { getColumnWidth } from '../../../functions';
import './radio.css';

const WPformbuilderRadioControl = ({ attributes, device, style }) => {
    const hide_label = attributes?.hide_label ?? false;
    const label = attributes?.label ?? '';
    const input_size = attributes?.input_size ?? 'small';
    const width = getColumnWidth(attributes, device, style);
    const radios = attributes?.options ?? [];
    const ParentTag = attributes?.use_fieldset ? 'fieldset' : 'div';
    const LabelTag = attributes?.use_fieldset ? 'legend' : 'label';

    const baseAttr = {
        type: 'radio',
        name: attributes?.name ?? "",
        className: `wpformbuilder-form-control__field ${input_size}`,
    };

    return (
        <ParentTag className="wpformbuilder-form-group" style={{ width: `${width}` }}>
            {!hide_label && (
                <LabelTag className="wpformbuilder-form-group__label">{label}</LabelTag>
            )}
            <div className="wpformbuilder-form-control radio">
                {radios.map((opt, i) => {
                    const radioItemAttr = {
                        ...baseAttr,
                        value: opt.value,
                        id: `${attributes?.id || 'radio'}-${i}`
                    };
                    return (
                        <div className="wpformbuilder-radio-item" key={i}>
                            <div className="wpformbuilder-radio-item__input">
                                <input {...radioItemAttr} />
                            </div>
                            <label htmlFor={radioItemAttr.id}>{opt.label}</label>
                        </div>
                    );
                })}
            </div>
        </ParentTag>
    );
};

export default WPformbuilderRadioControl;