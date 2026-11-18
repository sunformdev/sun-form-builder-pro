const { useEffect, useRef } = wp.element;
const { Flex, FlexItem, TextareaControl } = wp.components;

const WPformbuilderRequiredMsg = ({ index, attributes, item, setAttributes }) => {
    const setRequiredMsgAttribute = (newValue, attrName, index) => {
        const newItems = [...attributes?.fields];
        if (newItems[index]) {
            newItems[index][attrName] = newValue;
            setAttributes({ fields: newItems });
        }
    }

    return (
        <>
            <TextareaControl
                label="Required Message"
                value={item?.required_message ?? 'This field is required.'}
                onChange={(newValue) => setRequiredMsgAttribute(newValue, 'required_message', index)}
                rows={2}
            />
            {['email'].includes(item?.type) && (
                <TextareaControl
                    label="Email Error Message"
                    value={item?.email_error_message ?? 'Please enter a valid email address.'}
                    onChange={(newValue) => setRequiredMsgAttribute(newValue, 'email_error_message', index)}
                    rows={2}
                />
            )}
            {['url'].includes(item?.type) && (
                <TextareaControl
                    label="URL Error Message"
                    value={item?.url_error_message ?? 'Please enter a valid URL.'}
                    onChange={(newValue) => setRequiredMsgAttribute(newValue, 'url_error_message', index)}
                    rows={2}
                />
            )}
            {['number'].includes(item?.type) && (
                <TextareaControl
                    label="Number Error Message"
                    value={item?.number_error_message ?? 'Please enter a valid number.'}
                    onChange={(newValue) => setRequiredMsgAttribute(newValue, 'number_error_message', index)}
                    rows={2}
                />
            )}
            {['text', 'password', 'email', 'search', 'tel', 'url', 'textarea'].includes(item?.type) && (
                <>
                    <TextareaControl
                        label="Min Length Error Message"
                        value={item?.min_length_error_message ?? 'Please enter at least {0} characters.'}
                        onChange={(newValue) => setRequiredMsgAttribute(newValue, 'min_length_error_message', index)}
                        rows={2}
                    />
                    <TextareaControl
                        label="Max Length Error Message"
                        value={item?.max_length_error_message ?? 'Please enter no more than {0} characters.'}
                        onChange={(newValue) => setRequiredMsgAttribute(newValue, 'max_length_error_message', index)}
                        rows={2}
                    />
                    {['text', 'password', 'email', 'search', 'tel', 'url'].includes(item?.type) && (
                        <TextareaControl
                            label="Pattern Error Message"
                            value={item?.pattern_error_message ?? 'Invalid format.'}
                            onChange={(newValue) => setRequiredMsgAttribute(newValue, 'pattern_error_message', index)}
                            rows={2}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default WPformbuilderRequiredMsg;