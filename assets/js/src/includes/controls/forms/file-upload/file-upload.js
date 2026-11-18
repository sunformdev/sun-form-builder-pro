import { getColumnWidth } from '../../../functions';
import wpformbuilderFileUpload from '../../../../../lib/upload/file-upload-lib.js';
const { useEffect, useRef } = wp.element;
import './file-upload.css';

const WPformbuilderFileUploadControl = ({ attributes, device, style }) => {
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    let hide_label = attributes?.hide_label ?? false;
    let input_size = attributes?.input_size ?? 'small'
    let label = attributes?.label ?? '';
    let width = getColumnWidth(attributes, device, style);
    
    // Get ajaxUrl from global sfbuilder_js_data or fallback
    const ajaxUrl = typeof sfbuilder_js_data !== 'undefined' 
        ? sfbuilder_js_data?.ajaxurl 
        : (typeof fsjs_data !== 'undefined' ? fsjs_data?.ajaxurl : '/wp-admin/admin-ajax.php');
 
    let file_upload_attribute = {
        ref: inputRef,
        id: attributes?.id ?? '',
        type: 'file',
        name: attributes?.name ?? "",
        className: `wpformbuilder-form-control__field`,
        style: { display: 'none' },
        accept: attributes?.file_accept ?? '',
        multiple: attributes?.multiple ?? false,
        'data-upload-for': attributes?.name ?? '',
        //required: attributes?.required ? 'required' : '',
    }

    // Initialize file upload when component mounts or attributes change
    useEffect(() => {
        if (!inputRef.current || !wrapperRef.current) return;

        // Ensure wrapper has the required class
        const $wrapper = jQuery(wrapperRef.current);
        if (!$wrapper.hasClass('wpformbuilder-file-upload')) {
            $wrapper.addClass('wpformbuilder-file-upload');
        }

        // Initialize file upload with options
        const options = {
            fsjs_data: sfbuilder_js_data,
            maxSize: attributes?.max_size ?? 5,
            multiple: attributes?.multiple ?? false,
            errorMsg: attributes?.error_msg ?? 'An error occurred.',
            errorType: attributes?.error_type ?? 'Invalid format.',
            errorMaxSize: attributes?.error_max_size ?? 'File size exceeds maximum limit.',
            previewWidth: attributes?.preview_width ?? 100,
            previewHeight: attributes?.preview_height ?? 100,
            is_editor: true
        };

        wpformbuilderFileUpload.init(inputRef.current, options);

        // Cleanup: remove event listeners if needed
        return () => {
            // jQuery will handle cleanup automatically when element is removed
        };
    }, [
        attributes?.max_size,
        attributes?.multiple,
        attributes?.file_accept,
        attributes?.error_msg,
        attributes?.error_type,
        attributes?.error_max_size,
        attributes?.preview_width,
        attributes?.preview_height,
        attributes?.name,
        attributes?.layout
    ]);
    
    return (
        <>
            <div className="wpformbuilder-form-group" style={{ width: `${width}` }}>
                {!hide_label && (
                    <label className="wpformbuilder-form-group__label">{label}</label>
                )}
                <div 
                    ref={wrapperRef}
                    className="wpformbuilder-form-control file-upload wpformbuilder-file-upload"
                    data-wpformbuilder-upload-stt="0"
                >
                    <input {...file_upload_attribute} />
                    <label className="wpformbuilder-button-file-upload" htmlFor={attributes?.id}>
                        {attributes?.label_upload ?? 'Choose File'}
                    </label>
                    <div className={`wpformbuilder-file-upload-preview ${attributes?.layout ?? 'icon'}`} data-layout={attributes?.layout ?? 'icon'} data-preview-width={attributes?.preview_width ?? '100'} data-preview-height={attributes?.preview_height ?? '100'}></div>
                    <div className="wpformbuilder-form-notification-upload"></div>
                </div>
            </div>
        </>
    );
};
export default WPformbuilderFileUploadControl;