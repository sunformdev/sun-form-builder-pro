const { useEffect, useRef } = wp.element;
const { __experimentalInputControl, Flex, FlexItem, ToggleControl, TextareaControl, Notice, BaseControl, SelectControl, __experimentalToggleControl } = wp.components;
import './image-upload.css';
import { faList, faSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const WPformbuilderImageUploadAdvanced = ({ index, attributes, item, setAttributes }) => {
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
                    <label>Change Upload Directory?</label>
                </FlexItem>
                <FlexItem className="wpformbuilder-no-margin-bootom">
                    <ToggleControl
                        __nextHasNoMarginBottom={true}
                        checked={item?.change_upload_directory ? item?.change_upload_directory : false}
                        onChange={(toogle) => setFileUploadAttribute(toogle, 'change_upload_directory', index)}
                    />
                </FlexItem>
            </Flex>
            {!item?.change_upload_directory && (
                <BaseControl help="By default, uploaded files will be saved to the media library." />
            )}
            {item?.change_upload_directory && (
                <__experimentalInputControl
                    label="Upload Directory"
                    labelPosition="top"
                    value={item?.upload_directory ?? 'sunformbuilder'}
                    type="text"
                    onChange={(newValue) => setFileUploadAttribute(newValue, 'upload_directory', index)}
                    description="The directory where the files will be uploaded. Default is 'sunformbuilder'."
                />
            )}
            <TextareaControl
                label="Error Message"
                value={item?.error_msg ?? 'An error occurred.'}
                onChange={(newValue) => setFileUploadAttribute(newValue, 'error_msg', index)}
                rows={2}
            />
            <TextareaControl
                label="Error Type"
                value={item?.error_type ?? 'Invalid format.'}
                onChange={(newValue) => setFileUploadAttribute(newValue, 'error_type', index)}
                rows={2}
            />
            <TextareaControl
                label="Error Max Size"
                value={item?.error_max_size ?? 'File size exceeds maximum limit.'}
                onChange={(newValue) => setFileUploadAttribute(newValue, 'error_max_size', index)}
                rows={2}
            />
            <TextareaControl
                label="Error Min Files"
                value={item?.error_min_files ?? 'Please upload at least {min} files.'}
                onChange={(newValue) => setFileUploadAttribute(newValue, 'error_min_files', index)}
                rows={2}
            />
            <TextareaControl
                label="Error Max Files"
                value={item?.error_max_files ?? 'You can only upload a maximum of {max} files.'}
                onChange={(newValue) => setFileUploadAttribute(newValue, 'error_max_files', index)}
                rows={2}
            />
        </>
    );
};
export default WPformbuilderImageUploadAdvanced;