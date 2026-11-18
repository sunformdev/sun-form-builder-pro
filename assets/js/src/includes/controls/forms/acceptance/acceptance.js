import { getColumnWidth } from '../../../functions';
import './acceptance.css';

const WPformbuilderAcceptanceControl = ({ attributes, device, style }) => {
    const hide_label = attributes?.hide_label ?? false;
    const label = attributes?.label ?? '';
    const label_text = attributes?.acceptance_text ?? '';
    const input_size = attributes?.input_size ?? 'small';
    const width = getColumnWidth(attributes, device, style);

    const acceptanceItemAttr = {
        id: attributes?.id,
        type: 'checkbox',
        name: attributes?.name ?? "",
        className: `wpformbuilder-form-control__field ${input_size}`,
        value: attributes?.acceptance_value ?? 'On',
        required: attributes?.required ? 'required' : ''
    };

    return (
        <div className="wpformbuilder-form-group" style={{ width: `${width}` }}>
            {!hide_label && (
                <label className="wpformbuilder-form-group__label">{label}</label>
            )}
            <div className="wpformbuilder-form-control acceptance">
                <div className="wpformbuilder-acceptance-field">
                    <div className='wpformbuilder-checkbox-item__input'>
                        <input {...acceptanceItemAttr} />
                    </div>
                    <label htmlFor={acceptanceItemAttr.id} dangerouslySetInnerHTML={{ __html: label_text }}></label>
                </div>
            </div>
        </div>
    );
};

export default WPformbuilderAcceptanceControl;
