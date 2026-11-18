/**
 * WPFormBuilder Image Upload Module
 * ES6 module for handling image uploads with preview and validation
 * 
 * @example
 * import wpformbuilderImageUpload from './lib/upload/image-upload-lib';
 * 
 * // Initialize on a jQuery element
 * wpformbuilderImageUpload.init($('#image-input'), {
 *     ajaxUrl: '/wp-admin/admin-ajax.php',
 *     maxSize: 5,
 *     multiple: false,
 *     previewWidth: 200,
 *     previewHeight: 200
 * });
 * 
 * // Or use as jQuery plugin (backward compatibility)
 * $('#image-input').wpformbuilderImageUpload(options);
 */

class WPFormBuilderImageUpload {
    constructor() {
        this.pluginDir = typeof fsjs_data !== 'undefined' ? fsjs_data.plugin_dir : '';
        // Track files per INPUT ELEMENT (avoid collisions when multiple fields/forms share same name)
        this.fileTracking = new Map();
    }

    /**
     * Initialize image upload on element(s)
     * @param {jQuery|HTMLElement|string} element - jQuery element, DOM element, or selector
     * @param {Object} options - Configuration options
     * @param {string} options.ajaxUrl - AJAX URL for image upload
     * @param {number} options.maxSize - Maximum file size in MB (default: 5)
     * @param {boolean} options.multiple - Allow multiple images (default: false)
     * @param {number} options.previewWidth - Preview width in pixels (default: 200)
     * @param {number} options.previewHeight - Preview height in pixels (default: 200)
     * @param {string} options.fieldName - Field name for upload
     * @param {string} options.errorMaxSize - Error message for file size exceeded
     * @param {string} options.errorType - Error message for invalid file type
     * @param {string} options.errorMsg - General error message
     */
    init(element, options = {}) {
        const $element = typeof element === 'string' ? jQuery(element) : jQuery(element);

        // Prevent duplicate listeners when init() is called multiple times
        $element.off('change.wpformbuilderImageUpload');

        const parent = $element.closest('.wpformbuilder-image-upload');
        const htmlUpload = parent.find('.wpformbuilder-image-upload-preview').html();

        // Store initial preview HTML so we can restore it on form reset
        if (typeof parent.data('wpformbuilder-initial-preview-html') === 'undefined') {
            parent.data('wpformbuilder-initial-preview-html', htmlUpload);
        }
        // Store initial upload counter (if present)
        if (typeof parent.data('wpformbuilder-initial-upload-stt') === 'undefined') {
            const initialSttAttr = parent.attr('data-wpformbuilder-upload-stt');
            parent.data('wpformbuilder-initial-upload-stt', typeof initialSttAttr !== 'undefined' ? parseInt(initialSttAttr, 10) || 0 : 0);
        }

        $element.on('change.wpformbuilderImageUpload', (e) => {
            const defaultOptions = {
                previewWidth: options.previewWidth || 200,
                previewHeight: options.previewHeight || 200,
                ajaxUrl: options.ajaxUrl || false,
                maxSize: options.maxSize || 5,
                multiple: options.multiple || false,
                errorMaxSize: options.errorMaxSize || 'File {file_name} has exceeded the maximum size limit.',
                errorType: options.errorType || 'File {file_name} has invalid image format.',
                errorMsg: options.errorMsg || 'An error occurred.',
                maxFiles: options.maxFiles || 10,
                minFiles: options.minFiles || 1,
                errorMaxFiles: options.errorMaxFiles || 'You can only upload a maximum of {max} files.',
                errorMinFiles: options.errorMinFiles || 'Please upload at least {min} files.',
                filesLimit: options.filesLimit || false,
                fsjs_data: options.fsjs_data,
                is_editor: options.is_editor || false,
            };
            console.log('defaultOptions--->: ', defaultOptions);
            this.readURL(e.target, defaultOptions, htmlUpload);
        });

        // Check initial state and toggle upload label visibility
        const initialOptions = {
            multiple: options.multiple || false,
            maxFiles: options.maxFiles || 10,
        };
        this.checkInitialUploadState(parent, initialOptions);

        // Ensure previews return to initial state on <form>.reset()
        this.bindFormReset($element);
    }

    /**
     * Restore upload UI to initial state when parent form is reset.
     * @private
     */
    bindFormReset($input) {
        const $form = $input.closest('form.wpformbuilder-box-form');
        if (!$form.length) return;

        // Bind once per form
        if ($form.data('wpformbuilder-image-upload-reset-bound')) return;
        $form.data('wpformbuilder-image-upload-reset-bound', true);

        const self = this;
        $form.on('reset.wpformbuilderImageUpload', function () {
            const $currentForm = jQuery(this);

            $currentForm.find('.wpformbuilder-image-upload').each(function () {
                const $upload = jQuery(this);
                const initialHtml = $upload.data('wpformbuilder-initial-preview-html');
                const initialStt = $upload.data('wpformbuilder-initial-upload-stt');

                // Restore preview DOM
                const $previewContainer = $upload.find('.wpformbuilder-image-upload-preview').first();
                if (typeof initialHtml === 'string') {
                    $previewContainer.html(initialHtml);
                } else {
                    // Best-effort fallback
                    $upload.find('.wpformbuilder-image-upload-item').remove();
                }

                // Clear hidden stored values
                $upload.find('input[type="hidden"][data-wpformbuilder-upload-name]').val('');

                // Clear file input(s) and tracking
                $upload.find('input[type="file"]').each(function () {
                    const fileInput = this;
                    const $fileInput = jQuery(fileInput);

                    // Clear tracked files for this specific input element
                    if (self.fileTracking.has(fileInput)) {
                        self.fileTracking.get(fileInput).clear();
                    }

                    $fileInput.val('');
                    try {
                        fileInput.files = new DataTransfer().files;
                    } catch (e) {
                        // ignore
                    }

                    // Reset pointer-events changes from maxFiles behavior
                    $fileInput
                        .prop('disabled', false)
                        .css('pointer-events', '')
                        .removeAttr('tabindex');
                });

                // Reset upload counter
                $upload.attr('data-wpformbuilder-upload-stt', parseInt(initialStt, 10) || 0);

                // Hide error state if any
                const $err = $upload.find('.wpformbuilder-form-notification-upload');
                if ($err.hasClass('error')) {
                    $err.removeClass('error').hide();
                } else {
                    $err.hide();
                }

                // Ensure label is visible again
                $upload.find('.wpformbuilder-image-upload-label').show();
            });
        });
    }

    /**
     * Check initial upload state and toggle label visibility
     * @private
     */
    checkInitialUploadState($parent, options) {
        if (!options.multiple) {
            return; // Don't apply for single file upload
        }

        // Count existing upload items in DOM
        const existingItems = $parent.find('.wpformbuilder-image-upload-item').length;
        const $uploadLabel = $parent.find('.wpformbuilder-image-upload-label');
        const maxFiles = options.maxFiles || 10;

        // Toggle label visibility based on existing items
        this.toggleUploadLabel($uploadLabel, existingItems, maxFiles, options.multiple);
    }

    /**
     * Read and process selected images
     * @private
     */
    readURL(input, options, htmlUpload) {
        if (!window.File || !window.FileList || !window.FileReader) {
            console.warn('File API not supported');
            return;
        }

        const width = options.previewWidth;
        const height = options.previewHeight;
        const ajaxUrl = options.ajaxUrl;
        const maxSize = options.maxSize * 1024 * 1024;
        const multiple = options.multiple;
        const files = input.files;
        
        console.log('=== readURL called ===');
        console.log('options.multiple:', options.multiple);
        console.log('multiple variable:', multiple);
        console.log('files.length:', files.length);
        const $parent = jQuery(input).closest('.wpformbuilder-image-upload');
        const $previewElement = $parent.find('.wpformbuilder-image-upload-label');
        const $elementError = $parent.find('.wpformbuilder-form-notification-upload');
        let uploadID = $parent.attr('data-wpformbuilder-upload-stt');
        const elementName = jQuery(input).attr('data-upload-for');
        // Normalize accept rules from the input attribute.
        // - If `accept` is missing/empty -> [] (means "allow any type", only block dangerous extensions).
        // - Supports extensions (".jpg,.png"), mime types ("image/jpeg") and wildcards ("image/*").
        let acceptFile = jQuery(input).attr('accept');
        if (typeof acceptFile === 'string') {
            acceptFile = acceptFile
                .split(',')
                .map(item => item.trim())
                .filter(Boolean)
                .map(item => item.startsWith('.') ? item.slice(1) : item)
                .map(item => item.toLowerCase());
        } else {
            acceptFile = [];
        }

        if (typeof uploadID !== 'undefined' && uploadID !== false) {
            uploadID = parseInt(uploadID);
        } else {
            uploadID = 0;
        }

        // Initialize file tracking for this specific input element (DOM node) if not exists
        const trackingKey = input;
        if (!this.fileTracking.has(trackingKey)) {
            this.fileTracking.set(trackingKey, new Map());
        }
        const fileMap = this.fileTracking.get(trackingKey);

        // Check maxFiles limit before processing
        const maxFiles = options.maxFiles || 10;
        // Count existing items in DOM (includes both new uploads and pre-loaded items)
        const existingItemsCount = $parent.find('.wpformbuilder-image-upload-item').length;
        const currentFileCount = existingItemsCount;
        const newFilesCount = files.length;
        const totalFilesAfterUpload = currentFileCount + newFilesCount;

        // If already at max files, show error and hide label
        if (multiple && currentFileCount >= maxFiles) {
            const errorMsg = options.errorMaxFiles.replace('{max}', maxFiles);
            $elementError[0].innerHTML = errorMsg;
            $elementError.addClass('error').fadeIn('swing');
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                $elementError.fadeOut('swing');
            }, 5000);
            
            // Hide upload label
            this.toggleUploadLabel($previewElement, currentFileCount, maxFiles, multiple);
            
            // Clear input value
            jQuery(input).val('');
            return; // Already at max, don't process any files
        }

        // If trying to upload more than allowed
        let showingMaxFilesError = false;
        if (multiple && totalFilesAfterUpload > maxFiles) {
            const errorMsg = options.errorMaxFiles.replace('{max}', maxFiles);
            $elementError[0].innerHTML = errorMsg;
            $elementError.addClass('error').fadeIn('swing');
            showingMaxFilesError = true;
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                $elementError.fadeOut('swing');
            }, 5000);
            
            // Process only allowed files (up to the limit)
        }

        let processedFilesCount = 0; // Track files processed in this upload session
        const fileReadPromises = []; // Track FileReader promises
        
        console.log('=== Starting file loop ===');
        console.log('existingItemsCount:', existingItemsCount);
        console.log('maxFiles:', maxFiles);
        console.log('files.length:', files.length);
        
        for (let i = 0; i < files.length; i++) {
            // Check if we've reached the max files limit
            const currentTotalItems = existingItemsCount + processedFilesCount;
            console.log(`File ${i + 1}: currentTotalItems=${currentTotalItems}, maxFiles=${maxFiles}`);
            
            if (multiple && currentTotalItems >= maxFiles) {
                console.log(`⚠️ Breaking loop at file ${i + 1} - reached max files`);
                break; // Stop processing more files
            }
            const file = files[i];
            let html = '';
            const fileName = this.createFileNameScreen(file.name);
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileSize = file.size;

            // Check if file is valid, skip to next file if not
            if (this.checkFile(file, options, maxSize, acceptFile, $elementError)) {
                continue; // Skip invalid file and process next one
            }

            // Clear any previous error messages (except maxFiles error)
            if ($elementError.hasClass('error') && !showingMaxFilesError) {
                $elementError.removeClass('error').fadeOut('swing');
            }

            const currentUploadID = uploadID;
            
            // Store file with uploadID for tracking BEFORE reading
            fileMap.set(currentUploadID, file);
            console.log(`Added file ${i + 1} to fileMap. Current fileMap size:`, fileMap.size);
            
            // Create promise for this file read operation
            const fileReadPromise = new Promise((resolve) => {
                const picReader = new FileReader();
                picReader.addEventListener('load', (even) => {
                    const picFile = even.target;
                    html += `<label class="wpformbuilder-image-upload-item" data-wpformbuilder-image-upload-item-id="${currentUploadID}">
                        <span class="wpformbuilder-image-upload-item-content" style="width: ${width}px;height: ${height}px; background-image: url(${picFile.result}); background-size: cover; background-position: center; background-repeat: no-repeat;">
                            <span class="wpformbuilder-image-upload-item-remove" data-wpformbuilder-remove-image-id="${currentUploadID}">
                                <i class="fa fa-times" aria-hidden="true"></i>
                            </span>
                        </span>
                        <span class="wpformbuilder-upload-image-name">
                            <span class="wpformbuilder-upload-image-name-text">${fileName}</span>
                            <span class="wpformbuilder-upload-image-extension">.${fileExtension}</span>
                        </span>
                    </label>`;

                    if (multiple) {
                        jQuery(html).insertBefore($previewElement);
                    } else {
                        $previewElement[0].outerHTML = html;
                    }

                    // Toggle upload label visibility after inserting the item
                    const currentItemCount = $parent.find('.wpformbuilder-image-upload-item').length;
                    const $uploadLabel = $parent.find('.wpformbuilder-image-upload-label');
                    this.toggleUploadLabel($uploadLabel, currentItemCount, options.maxFiles || 10, multiple);

                    //this.saveFile(files[i], currentUploadID, ajaxUrl, $parent, elementName, input);
                    this.removeImage(input, htmlUpload, options, currentUploadID, elementName);
                    
                    resolve(); // Resolve promise when FileReader completes
                });

                picReader.readAsDataURL(file);
            });
            
            fileReadPromises.push(fileReadPromise);
            uploadID++;
            processedFilesCount++; // Increment processed files counter
        }

        // Update upload ID after processing
        $parent.attr('data-wpformbuilder-upload-stt', uploadID);
        
        console.log('=== After file loop ===');
        console.log('Multiple:', multiple, 'Type:', typeof multiple);
        console.log('FileMap size:', fileMap.size);
        console.log('Processed files count:', processedFilesCount);
        console.log('Max files:', maxFiles);
        console.log('Condition check: multiple && fileMap.size > 0 =', (multiple && fileMap.size > 0));
        
        // Wait for all FileReader operations to complete, then update input.files ONCE
        Promise.all(fileReadPromises).then(() => {
            console.log('=== All FileReader operations completed ===');
            // Update input.files after all files are processed
            // This ensures files are available for form submission
            if (multiple && fileMap.size > 0) {
                console.log('✅ Calling updateFileInput after all files processed');
                this.updateFileInput(input, fileMap, multiple);
                console.log('Input files after update:', input.files.length);
            } else if (!multiple && fileMap.size > 0) {
                // For single file mode, also update to ensure file is set
                console.log('✅ Calling updateFileInput for single file mode');
                this.updateFileInput(input, fileMap, multiple);
            } else {
                console.log('⚠️ NOT updating input - multiple:', multiple, 'fileMap.size:', fileMap.size);
                console.log('Reason: multiple is', multiple, 'or fileMap.size is', fileMap.size);
            }
        });
    }

    /**
     * Remove image handler
     * @private
     */
    removeImage(element, html, options, uploadID, inputName) {
        const multiple = options.multiple;
        const self = this;

        jQuery(document).on('click', `[data-wpformbuilder-remove-image-id="${uploadID}"]`, function (e) {
            const imgID = jQuery(this).attr('data-wpformbuilder-remove-image-id');
            const $elementItem = jQuery(this).closest(`[data-wpformbuilder-image-upload-item-id="${imgID}"]`);
            const elementName = jQuery(element).attr('data-upload-for');
            const $elementSetValue = jQuery(this).closest('.wpformbuilder-image-upload').find(`[data-wpformbuilder-upload-name="${elementName}"]`);
            let value = $elementSetValue.val() ? JSON.parse($elementSetValue.val()) : {};
            const imageData = new FormData();

            imageData.append('type', 'delete');
            imageData.append('action', 'sunformbuilder_image_upload');
            imageData.append('url', value[imgID]);
            delete value[imgID];

            if (jQuery.isEmptyObject(value)) {
                $elementSetValue.val('');
            } else {
                $elementSetValue.val(JSON.stringify(value));
            }

            if (!multiple) {
                const $parent = jQuery(element).closest('.wpformbuilder-image-upload');
                const elementPreview = $parent.find('.wpformbuilder-image-upload-preview')[0];
                elementPreview.innerHTML = html;
            }

            // Remove file from tracking (keyed by the actual input element) and update input file
            if (self.fileTracking.has(element)) {
                const fileMap = self.fileTracking.get(element);
                fileMap.delete(parseInt(imgID));

                // Update the file input with remaining files
                self.updateFileInput(element, fileMap, multiple);
            }

            $elementItem.delay(150).fadeOut(150, 'swing', function () {
                $elementItem.remove();
                
                // Toggle upload label visibility after removal (count items from DOM after element is removed)
                const $parent = jQuery(element).closest('.wpformbuilder-image-upload');
                const $previewLabel = $parent.find('.wpformbuilder-image-upload-label');
                const remainingItemsCount = $parent.find('.wpformbuilder-image-upload-item').length;
                self.toggleUploadLabel($previewLabel, remainingItemsCount, options.maxFiles, multiple);
            });

            // if (e.isTrigger == undefined) {
            //     jQuery.ajax({
            //         url: options.ajaxUrl,
            //         dataType: 'text',
            //         cache: false,
            //         processData: false,
            //         contentType: false,
            //         data: imageData,
            //         type: 'post',
            //         success: function (res) {
            //             console.log(res);
            //         }
            //     });
            // }
        });
    }

    /**
     * Update file input with remaining files
     * @private
     */
    updateFileInput(element, fileMap, multiple) {
        console.log('=== updateFileInput called ===');
        console.log('element:', element);
        console.log('fileMap.size:', fileMap.size);
        console.log('multiple:', multiple);
        
        // If no files in map, clear the input
        if (fileMap.size === 0) {
            console.log('⚠️ No files in fileMap - clearing input');
            jQuery(element).val('');
            return;
        }

        // Rebuild FileList from remaining files using DataTransfer
        try {
            console.log('Creating DataTransfer...');
            const dataTransfer = new DataTransfer();
            
            console.log('Adding files to DataTransfer...');
            fileMap.forEach((file, id) => {
                console.log(`Adding file ${id}:`, file.name);
                dataTransfer.items.add(file);
            });
            
            console.log('DataTransfer files count:', dataTransfer.files.length);
            console.log('Setting element.files...');
            element.files = dataTransfer.files;
            
            console.log('=== Update File Input SUCCESS ===');
            console.log('Files in fileMap:', fileMap.size);
            console.log('Files in input after update:', element.files.length);
            console.log('Input files:', Array.from(element.files).map(f => f.name));
            
            // Verify the files are actually there
            if (element.files.length === 0) {
                console.error('❌ ERROR: element.files is empty after setting!');
            } else if (element.files.length !== fileMap.size) {
                console.warn('⚠️ WARNING: element.files.length !== fileMap.size');
            }
        } catch (error) {
            // Fallback for browsers that don't support DataTransfer
            console.error('❌ DataTransfer error:', error);
            console.warn('DataTransfer not supported, cannot update file input');
        }
    }

    /**
     * Toggle upload label visibility based on file count
     * @private
     */
    toggleUploadLabel($labelElement, currentFileCount, maxFiles, multiple) {
        if (!multiple) {
            return; // Don't apply for single file upload
        }

        const maxFileLimit = maxFiles || 10;
        const $parent = $labelElement.closest('.wpformbuilder-image-upload');
        const $fileInput = $parent.find('input[type="file"]');
        
        console.log('=== Toggle Upload Label ===');
        console.log('Current file count:', currentFileCount);
        console.log('Max files limit:', maxFileLimit);
        console.log('Label element found:', $labelElement.length);
        
        if (currentFileCount >= parseInt(maxFileLimit)) {
            // Hide the upload label when max files reached
            console.log('→ HIDING label (reached max files)');
            $labelElement.hide();
            /**
             * IMPORTANT:
             * Do NOT disable the <input type="file"> when reaching maxFiles.
             * A disabled input will not be submitted by the browser -> $_FILES becomes empty.
             *
             * We only prevent further interactions while keeping the input enabled so it can submit.
             */
            $fileInput
                .prop('disabled', false)
                .css('pointer-events', 'none')
                .attr('tabindex', '-1');
        } else {
            // Show the upload label when below max files
            console.log('→ SHOWING label (below max files)');
            $labelElement.show();
            // Re-enable interactions
            $fileInput
                .prop('disabled', false)
                .css('pointer-events', '')
                .removeAttr('tabindex');
        }
    }

    /**
     * Save image via AJAX
     * @private
     */
    // saveFile(file, uploadID, ajaxUrl, $parent, name, input) {
    //     const imageData = new FormData();
    //     imageData.append('file', file);
    //     imageData.append('action', 'sunformbuilder_image_upload');
    //     imageData.append('type', 'upload');

    //     jQuery.ajax({
    //         url: ajaxUrl,
    //         dataType: 'text',
    //         cache: false,
    //         processData: false,
    //         contentType: false,
    //         data: imageData,
    //         type: 'post',
    //         success: (res) => {
    //             const $uploadElement = $parent.find(`[data-wpformbuilder-upload-name="${name}"]`);
    //             const uploadValue = $uploadElement.val();
    //             let uplodaData = {};

    //             if (uploadValue) {
    //                 uplodaData = JSON.parse(uploadValue);
    //                 uplodaData[uploadID] = res;
    //             } else {
    //                 uplodaData[uploadID] = res;
    //             }

    //             $uploadElement.val(JSON.stringify(uplodaData));
    //             $uploadElement.change();
    //             $parent.find(`[data-imge-loading-id="${uploadID}"]`).removeClass('loading');
    //             jQuery(input).val('');
    //         }
    //     });
    // }

    /**
     * Validate image file
     * @private
     */
    checkFile(file, options, maxSize, acceptFile, $errorElement) {
        let result = false;
        const fileType = file.name.split('.').pop().toLowerCase();
        let errorMsg;
        const extensionBlock = ['php', 'phpt', 'php5', 'php7', 'exe'];
        const fileName = file.name;

        const isSizeTooBig = file.size > maxSize;
        const isBlockedExt = extensionBlock.includes(fileType);

        // Only enforce accept rules if configured; otherwise allow any file type (except blocked extensions).
        const acceptList = Array.isArray(acceptFile) ? acceptFile : [];
        const mimeType = String(file.type || '').toLowerCase();
        const isTypeNotAllowed = acceptList.length > 0
            ? !acceptList.some((rule) => {
                const r = String(rule || '').trim().toLowerCase();
                if (!r) return false;
                if (r === '*' || r === '*/*') return true;
                if (r.endsWith('/*')) {
                    // e.g. image/* matches image/jpeg
                    return mimeType.startsWith(r.slice(0, -1));
                }
                if (r.includes('/')) {
                    // Exact mime type, e.g. image/png
                    return mimeType === r;
                }
                // Extension, e.g. jpg, png
                return fileType === r.replace('.', '');
            })
            : false;

        if (isSizeTooBig || isTypeNotAllowed || isBlockedExt) {
            // Determine which error message to use
            if (isSizeTooBig) {
                errorMsg = options.errorMaxSize.replace('{file_name}', fileName);
            } else if (isTypeNotAllowed || isBlockedExt) {
                errorMsg = options.errorType.replace('{file_name}', fileName);
            }
            
            // Display error message
            $errorElement[0].innerHTML = errorMsg;
            $errorElement.addClass('error').fadeIn('swing');
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                $errorElement.fadeOut('swing');
            }, 5000);
            
            result = true;
        }

        return result;
    }

    /**
     * Create shortened file name for display
     * @private
     */
    createFileNameScreen(name) {
        // Return file name WITHOUT extension (extension should be handled separately by caller).
        // Supports names with multiple dots, e.g. "my.photo.2026.jpg" -> "my.photo.2026"
        const parts = String(name || '').split('.');
        const baseName = parts.length > 1 ? parts.slice(0, -1).join('.') : String(name || '');
        const screenWidth = jQuery(window).width();
        let displayName = baseName;

        if (screenWidth <= 375) {
            if (baseName.length > 12) {
                displayName = baseName.slice(0, 5) + '***';
            }
        } else if (375 < screenWidth && screenWidth <= 425) {
            if (baseName.length > 14) {
                displayName = baseName.slice(0, 7) + '***';
            }
        } else if (425 < screenWidth && screenWidth < 768) {
            if (baseName.length > 29) {
                displayName = baseName.slice(0, 22) + '***';
            }
        } else {
            if (baseName.length > 47) {
                displayName = baseName.slice(0, 39) + '***';
            }
        }

        return displayName;
    }
}

// Create singleton instance
const wpformbuilderImageUpload = new WPFormBuilderImageUpload();

// Register as jQuery plugin for backward compatibility
if (typeof jQuery !== 'undefined') {
    jQuery.fn.wpformbuilderImageUpload = function (options) {
        return this.each(function () {
            wpformbuilderImageUpload.init(this, options);
        });
    };
}

// Export as ES6 module
export default wpformbuilderImageUpload;

// Also export class for advanced usage
export { WPFormBuilderImageUpload };