const { useEffect, useRef } = wp.element;
const { __experimentalInputControl, Flex, FlexItem, ToggleControl, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, SelectControl, __experimentalToggleControl } = wp.components;
import './file-upload.css';
import { faList, faSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const WPformbuilderFileUploadNormal = ({ index, attributes, item, setAttributes }) => {
    const setFileUploadAttribute = (newValue, attrName, index) => {
        const newItems = [...attributes?.fields];
        if (newItems[index]) {
            newItems[index][attrName] = newValue;
            setAttributes({ fields: newItems });
        }
    }

    return (
        <>
            <Flex style={{ 'margin-bottom': '15px', 'margin-top': '13px' }}>
                <FlexItem>
                    <label>Multiple</label>
                </FlexItem>
                <FlexItem className="wpformbuilder-no-margin-bootom">
                    <ToggleControl
                        __nextHasNoMarginBottom={true}
                        checked={item?.multiple ? item?.multiple : false}
                        onChange={(toogle) => setFileUploadAttribute(toogle, 'multiple', index)}
                    />
                </FlexItem>
            </Flex>
            {item?.multiple && (
                <Flex style={{ 'margin-bottom': '15px', 'margin-top': '13px' }}>
                    <FlexItem>
                        <label>Files Limit?</label>
                    </FlexItem>
                    <FlexItem className="wpformbuilder-no-margin-bootom">
                        <ToggleControl
                            __nextHasNoMarginBottom={true}
                            checked={item?.files_limit ? item?.files_limit : false}
                            onChange={(toogle) => setFileUploadAttribute(toogle, 'files_limit', index)}
                        />
                    </FlexItem>
                </Flex>
            )}
            {item?.files_limit && (
                <>
                    <__experimentalInputControl
                        label="Max Files"
                        labelPosition="side"
                        value={item?.max_files ?? ''}
                        type="number"
                        onChange={(newValue) => setFileUploadAttribute(newValue, 'max_files', index)}
                        className="wpformbuilder-width-35"
                        placeholder="Max Files"
                    />
                    <__experimentalInputControl
                        label="Min Files"
                        labelPosition="side"
                        value={item?.min_files ?? ''}
                        type="number"
                        onChange={(newValue) => setFileUploadAttribute(newValue, 'min_files', index)}
                        className="wpformbuilder-width-35"
                        placeholder="Min Files"
                    />
                </>
            )}
            <__experimentalInputControl
                label="Label Button"
                labelPosition="side"
                value={item?.label_upload ?? 'Choose File'}
                type="text"
                onChange={(newValue) => setFileUploadAttribute(newValue, 'label_upload', index)}
            />
            <__experimentalInputControl
                label="Accept File Type"
                labelPosition="top"
                value={item?.file_accept ?? ''}
                type="text"
                placeholder=".pdf, .jpg, .png, .doc, .docx"
                onChange={(newValue) => setFileUploadAttribute(newValue, 'file_accept', index)}
            />
            <__experimentalInputControl
                label="Max Size (MB)"
                labelPosition="side"
                value={item?.max_size ?? '5'}
                type="number"
                onChange={(newValue) => setFileUploadAttribute(newValue, 'max_size', index)}
            />
            <Flex style={{ 'margin-bottom': '15px' }}>
                <FlexItem>
                    <label>Layout</label>
                </FlexItem>
                <FlexItem style={{ 'margin-top': '-5px' }}>
                    <__experimentalToggleGroupControl
                        __nextHasNoMarginBottom
                        isDeselectable={false}
                        onChange={(newValue) => setFileUploadAttribute(newValue, 'layout', index)}
                        className="wpformbuilder-button-layout-options"
                        value={item?.layout ?? 'icon'}
                    >
                        <__experimentalToggleGroupControlOptionIcon
                            icon={<FontAwesomeIcon icon={faSquare} width={18} />}
                            label="Icon"
                            value="icon"
                        />
                        <__experimentalToggleGroupControlOptionIcon
                            icon={<FontAwesomeIcon icon={faList} width={18} />}
                            label="List"
                            value="list"
                        />
                    </__experimentalToggleGroupControl>
                </FlexItem>
            </Flex>
            <__experimentalInputControl
                label="Preview Width"
                labelPosition="side"
                value={item?.preview_width ?? '100'}
                type="number"
                onChange={(newValue) => setFileUploadAttribute(newValue, 'preview_width', index)}
            />
            <__experimentalInputControl
                label="Preview Height"
                labelPosition="side"
                value={item?.preview_height ?? '100'}
                type="number"
                onChange={(newValue) => setFileUploadAttribute(newValue, 'preview_height', index)}
            />
            <FormTokenField
                __experimentalExpandOnFocus
                __nextHasNoMarginBottom
                label="Attachment To"
                onChange={(newValue) => setFileUploadAttribute(newValue, 'attachment_to', index)}
                suggestions={
                    [
                        'Email',
                        'Email 2'
                    ]
                }
                value={item?.attachment_to ?? ['Email']}
                __experimentalShowHowTo={false}
                className='wpformbuilder-formtokenfield-attachment-upload'
            />
        </>
    );
};
export default WPformbuilderFileUploadNormal;