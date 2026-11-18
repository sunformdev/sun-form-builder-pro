const { __experimentalInputControl: InputControl, Flex, FlexItem, Button, Icon } = wp.components;
const { useState, useEffect, useRef } = wp.element;
import { plus, trash } from '@wordpress/icons';
import './select-option.css';

const WPFormbuilderSelectOption = ({ setAttributes, attributes, index }) => {
    const [justAdded, setJustAdded] = useState(false);
    const lastInputRef = useRef(null);

    const options = attributes.fields[index]?.options || [];

    console.log('options type:', typeof options, options);

    const updateOptions = (newOptions) => {
        setAttributes({
            fields: attributes.fields.map((field, i) =>
                i === index ? { ...field, options: newOptions } : field
            ),
        });
    };

    const handleChangeOption = (newValue, attrName, optionIndex) => {
        const newOptions = [...options];
        newOptions[optionIndex][attrName] = newValue;
        updateOptions(newOptions);
    };

    const handleAddOption = () => {
        const newOptions = [...options, { label: 'Label', value: '' }];
        updateOptions(newOptions);
        setJustAdded(true);
    };

    const handleRemoveOption = (optionIndex) => {
        const newOptions = options.filter((_, i) => i !== optionIndex);
        updateOptions(newOptions);
    };

    useEffect(() => {
        if (justAdded && lastInputRef.current) {
            lastInputRef.current.focus();
            setJustAdded(false);
        }
    }, [options.length, justAdded]);

    return (
        <fieldset className="wpformbuilder-options-fieldset">
            <legend>Options</legend>
            {options.map((opt, i) => (
                <Flex key={i} style={{ marginBottom: '5px' }}>
                    <FlexItem>
                        <InputControl
                            labelPosition="side"
                            type="text"
                            value={opt.label}
                            onChange={(newValue) =>
                                handleChangeOption(newValue, 'label', i)
                            }
                            className="wpformbuilder-heigth-25"
                            placeholder="Label"
                            ref={i === options.length - 1 ? lastInputRef : null}
                        />
                    </FlexItem>
                    <FlexItem>
                        <Flex>
                            <FlexItem>
                                <InputControl
                                    labelPosition="side"
                                    type="text"
                                    value={opt.value}
                                    onChange={(newValue) =>
                                        handleChangeOption(newValue, 'value', i)
                                    }
                                    className="wpformbuilder-heigth-25"
                                    placeholder="Value"
                                />
                            </FlexItem>
                            <FlexItem>
                                <Button
                                    className="wpformbuilder-remove-options-button"
                                    icon={<Icon icon={trash} size={4} />}
                                    onClick={() => handleRemoveOption(i)}
                                    label="Remove option"
                                />
                            </FlexItem>
                        </Flex>
                    </FlexItem>
                </Flex>
            ))}
            <Button
                className="wpformbuilder-add-options-button"
                icon={<Icon icon={plus} size={9} />}
                onClick={handleAddOption}
            >
                <span>Add Options</span>
            </Button>
        </fieldset>
    );
};

export default WPFormbuilderSelectOption;