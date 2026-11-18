const { useEffect, useRef } = wp.element;
const { __experimentalInputControl, Flex, FlexItem, ToggleControl, SelectControl } = wp.components;
import AceCode from '../../../editor/ace-editor/ace-editor.js';

const WPformbuilderStripeSettings = ({ index, attributes, item, setAttributes }) => {

    const setStripeAttribute = (newValue, attrName, index) => {
        const newItems = [...attributes?.fields];
        if (newItems[index]) {
            newItems[index][attrName] = newValue;
            setAttributes({ fields: newItems });
        }
    }

    return (
        <div className='wpformbuilder-stripe-settings'>
            <Flex style={{ marginBottom: '10px' }}>
                <FlexItem>
                    <label>Custom Options</label>
                </FlexItem>
                <FlexItem className="wpformbuilder-no-margin-bootom">
                    <ToggleControl
                        __nextHasNoMarginBottom={true}
                        checked={item?.stripe_custom_options || false}
                        onChange={(toogle) => setStripeAttribute(toogle, 'stripe_custom_options', index)}
                    />
                </FlexItem>
            </Flex>
            {item?.stripe_custom_options && (
                <>
                <AceCode
                    onChange={(newValue) => setStripeAttribute(newValue, 'stripe_options_raw', index)}
                    value={item?.stripe_options_raw || ''}
                    mode="javascript"
                    width='78%'
                />
                <p className="wpformbuilder-help-text">View <a class="wpformbuilder-link-help" href="https://docs.stripe.com/js/appendix/style" target="_blank" rel="noopener noreferrer">stripe options</a> for more information.</p>
            </>
            )}
        </div>
    )
}

export default WPformbuilderStripeSettings;