import { getColumnWidth } from '../../../functions';

const WPformbuilderRecaptchaV2Control = ({ attributes, device, style }) => {
    let hide_label = attributes?.hide_label ?? false;
    let input_size = attributes?.input_size ?? 'small'
    let label = attributes?.label ?? '';
    let width = getColumnWidth(attributes, device, style);
    let recaptcha_v2_attribute = {
        type: 'recaptcha_v2',
        name: attributes?.name ?? "",
        className: `wpformbuilder-form-control__field recaptcha_v2`,
        // minlength: attributes?.min_length ?? '',
        // maxlength: attributes?.max_length ?? '',
        // autocomplete: attributes?.autocomplete ?? 'off',
        // value: attributes?.default_value ?? '',
        // required: attributes?.required ? 'required' : '',
        // placeholder: attributes?.placeholder ?? ''
    }
    return (
        <>
            <div className="wpformbuilder-form-group" style={{ width: `${width}` }}>
                {!hide_label && (
                    <label className="wpformbuilder-form-group__label">{label}</label>
                )}
                <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
            </div>
        </>
    );
};
export default WPformbuilderRecaptchaV2Control;