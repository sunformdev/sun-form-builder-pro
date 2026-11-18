/**
 * WPFormBuilder File Upload Module
 * ES6 module for handling file uploads with preview and validation
 * 
 * @example
 * import wpformbuilderFileUpload from './common/file-upload';
 * 
 * // Initialize on a jQuery element
 * wpformbuilderFileUpload.init($('#file-input'), {
 *     ajaxUrl: '/wp-admin/admin-ajax.php',
 *     maxSize: 5,
 *     multiple: false
 * });
 * 
 * // Or use as jQuery plugin (backward compatibility)
 * $('#file-input').wpformbuilderFileUpload(options);
 */

class WPFormBuilderFileUpload {
    constructor() {
        this.pluginDir = typeof fsjs_data !== 'undefined' ? fsjs_data.plugin_dir : '';
    }

    /**
     * Initialize file upload on element(s)
     * @param {jQuery|HTMLElement|string} element - jQuery element, DOM element, or selector
     * @param {Object} options - Configuration options
     * @param {string} options.ajaxUrl - AJAX URL for file upload
     * @param {number} options.maxSize - Maximum file size in MB (default: 5)
     * @param {boolean} options.multiple - Allow multiple files (default: false)
     * @param {boolean} options.filesLimit - Enable min/max files validation (default: false)
     * @param {number} options.minFiles - Minimum number of files required (optional)
     * @param {number} options.maxFiles - Maximum number of files allowed (optional)
     * @param {string} options.errorMsg - Error message for invalid files
     * @param {string} options.errorType - Error message for invalid file type
     * @param {string} options.errorMaxSize - Error message for file size exceeded. Use {file_name} placeholder for file name (auto-hide after 30s)
     * @param {string} options.errorMinFiles - Error message for minimum files not met. Use {min} placeholder
     * @param {string} options.errorMaxFiles - Error message for maximum files exceeded. Use {max} placeholder
     */
    init(element, options = {}) {
        const $element = typeof element === 'string' ? jQuery(element) : jQuery(element);

        // Prevent duplicate listeners when init() is called multiple times (e.g. editor re-render)
        $element.off('change.wpformbuilderFileUpload');

        // Store initial preview HTML so we can restore it on form reset
        const $parent = jQuery($element[0]).closest('.wpformbuilder-form-group');
        const $previewElement = $parent.find('.wpformbuilder-file-upload-preview').first();
        if ($previewElement.length && typeof $previewElement.data('wpformbuilder-initial-html') === 'undefined') {
            $previewElement.data('wpformbuilder-initial-html', $previewElement.html());
        }
        // Store initial upload counter (if present)
        if (typeof $parent.data('wpformbuilder-initial-upload-stt') === 'undefined') {
            const initialSttAttr = $parent.attr('data-wpformbuilder-upload-stt');
            $parent.data('wpformbuilder-initial-upload-stt', typeof initialSttAttr !== 'undefined' ? parseInt(initialSttAttr, 10) || 0 : 0);
        }

        $element.on('change.wpformbuilderFileUpload', (e) => {
            const defaultOptions = {
                ajaxUrl: options?.fsjs_data?.ajaxurl || false,
                maxSize: options.maxSize || 5,
                multiple: options.multiple || false,
                filesLimit: options.filesLimit || false,
                minFiles: options.minFiles || null,
                maxFiles: options.maxFiles || null,
                errorMsg: options.errorMsg || 'An error occurred.',
                errorType: options.errorType || 'Invalid format.',
                errorMaxSize: options.errorMaxSize || 'File {file_name} has exceeded the maximum size limit.',
                errorMinFiles: options.errorMinFiles || 'Please upload at least {min} file(s).',
                errorMaxFiles: options.errorMaxFiles || 'You can only upload a maximum of {max} file(s).',
                previewWidth: options.previewWidth,
                previewHeight: options.previewHeight,
                fsjs_data: options.fsjs_data,
                is_editor: options.is_editor // Đang ở đây, check nếu là editor thì không chạy ajax
            };
            this.readURL(e.target, defaultOptions);
        });

        // Keep preview UI in sync when layout/preview size changes (e.g. toggled in editor settings)
        this.observePreviewAttributes($element, options);

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
        if ($form.data('wpformbuilder-file-upload-reset-bound')) return;
        $form.data('wpformbuilder-file-upload-reset-bound', true);

        $form.on('reset.wpformbuilderFileUpload', function () {
            const $currentForm = jQuery(this);

            $currentForm.find('.wpformbuilder-file-upload').each(function () {
                const $upload = jQuery(this);
                const $group = $upload.closest('.wpformbuilder-form-group');
                const $preview = $group.find('.wpformbuilder-file-upload-preview').first();

                const initialHtml = $preview.data('wpformbuilder-initial-html');
                const initialStt = $group.data('wpformbuilder-initial-upload-stt');

                // Restore preview DOM
                if (typeof initialHtml === 'string') {
                    $preview.html(initialHtml);
                } else {
                    $preview.empty();
                }

                // Clear file map + validation state
                $group.data('wpformbuilder-files-map', {});

                const $err = $group.find('.wpformbuilder-form-notification-upload');
                if ($err.hasClass('error')) {
                    $err.removeClass('error').hide();
                } else {
                    $err.hide();
                }

                // Clear hidden stored values
                $upload.find('input[type="hidden"][data-wpformbuilder-upload-name]').val('');

                // Clear file input(s)
                $upload.find('input[type="file"]').each(function () {
                    const fileInput = this;
                    jQuery(fileInput).val('');
                    try {
                        fileInput.files = new DataTransfer().files;
                    } catch (e) {
                        // ignore
                    }
                });

                // Reset upload counter
                $group.attr('data-wpformbuilder-upload-stt', parseInt(initialStt, 10) || 0);
            });
        });
    }

    /**
     * Observe preview element changes (data-layout / preview sizes) and re-render existing preview items.
     * This avoids jQuery .data() caching issues and makes layout updates immediate.
     * @private
     */
    observePreviewAttributes($input, options) {
        if (typeof MutationObserver === 'undefined') return;
        if (!$input || !$input.length || !$input[0]) return;

        const $parent = jQuery($input[0]).closest('.wpformbuilder-form-group');
        const $previewElement = $parent.find('.wpformbuilder-file-upload-preview').first();
        if (!$previewElement.length) return;

        // Only attach one observer per preview element
        const existingObserver = $previewElement.data('wpformbuilder-layout-observer');
        if (existingObserver) return;

        const observer = new MutationObserver((mutations) => {
            const relevant = mutations.some(m => m.type === 'attributes');
            if (!relevant) return;
            this.syncPreviewFromFilesMap($parent, options);
        });

        observer.observe($previewElement[0], {
            attributes: true,
            attributeFilter: ['data-layout', 'data-preview-width', 'data-preview-height', 'class']
        });

        $previewElement.data('wpformbuilder-layout-observer', observer);
    }

    /**
     * Re-render preview items from filesMap using current layout & preview sizes.
     * @private
     */
    syncPreviewFromFilesMap($parent, options = {}) {
        const $previewElement = $parent.find('.wpformbuilder-file-upload-preview').first();
        if (!$previewElement.length) return;

        const filesMap = $parent.data('wpformbuilder-files-map') || {};
        const keys = Object.keys(filesMap);
        if (!keys.length) return;

        const layoutAttr = $previewElement.attr('data-layout');
        const layout = layoutAttr ? layoutAttr : 'icon';

        const previewWidthAttr = $previewElement.attr('data-preview-width');
        const previewHeightAttr = $previewElement.attr('data-preview-height');
        const previewWidth = previewWidthAttr || options.previewWidth || 100;
        const previewHeight = previewHeightAttr || options.previewHeight || 100;

        const wpformbuilderPluginDir = options?.fsjs_data?.plugin_dir
            || (typeof fsjs_data !== 'undefined' ? fsjs_data.plugin_dir : '')
            || '';

        // Match the existing behavior: newest file is shown first (prepend in multiple mode)
        const ids = keys
            .map(k => parseInt(k, 10))
            .filter(n => !Number.isNaN(n))
            .sort((a, b) => b - a);

        let html = '';
        ids.forEach((uploadID) => {
            const file = filesMap[uploadID];
            if (!file) return;

            const fileName = this.createFileNameScreen(file.name);
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileIcon = this.getFileIcon(file.name);

            if (layout === 'icon') {
                html += `<label class="wpformbuilder-file-upload-item" data-wpformbuilder-file-upload-item-id="${uploadID}">
                    <span class="wpformbuilder-name-file-upload">
                        <span class="wpformbuilder-file-upload-icon-image-wrapper">
                            <img class="wpformbuilder-file-upload-icon-format" width="${previewWidth}" height="${previewHeight}" src="${wpformbuilderPluginDir}assets/images/${fileIcon}">
                                <span class="wpformbuilder-file-upload-item-remove" data-wpformbuilder-remove-file-id="${uploadID}">
                                    <i class="fa fa-times" aria-hidden="true"></i>
                                </span>
                            </span>
                        </span>
                    <span class="wpformbuilder-file-upload-name">
                        <span class="wpformbuilder-file-upload-name-text">${fileName}</span>
                       
                    </span>
                </label>`;
            } else {
                html += `<label class="wpformbuilder-file-upload-item" data-wpformbuilder-file-upload-item-id="${uploadID}">
                    <span class="wpformbuilder-name-file-upload">
                        <img class="wpformbuilder-file-upload-icon-format" width="${previewWidth}" height="${previewHeight}" src="${wpformbuilderPluginDir}assets/images/${fileIcon}">
                        <span class="wpformbuilder-file-upload-name">${fileName}</span>
                        <span class="wpformbuilder-file-upload-size">${file.size}Kb</span>
                    </span>
                    <span class="wpformbuilder-file-upload-item-remove" data-wpformbuilder-remove-file-id="${uploadID}">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </span>
                </label>`;
            }
        });

        $previewElement[0].innerHTML = html;
    }

    /**
     * Read and process selected files
     * @private
     */
    readURL(input, options) {
        const wpformbuilderPluginDir = options.fsjs_data.plugin_dir;
        //console.log('wpformbuilderPluginDir--->: ', options);
        if (!window.File || !window.FileList || !window.FileReader) {
            console.warn('File API not supported');
            return;
        }

        const is_editor = options.is_editor;
        const ajaxUrl = options.fsjs_data.ajaxurl;
        const maxSize = options.maxSize * 1024 * 1024;
        const multiple = options.multiple;
        const files = input.files;
        const $parent = jQuery(input).closest('.wpformbuilder-form-group');
        const $elementError = $parent.find('.wpformbuilder-form-notification-upload');
        let acceptFile = jQuery(input).attr('accept');

        // Lưu options validation vào parent để dùng khi remove file
        $parent.data('wpformbuilder-validation-options', {
            filesLimit: options.filesLimit,
            minFiles: options.minFiles,
            maxFiles: options.maxFiles,
            errorMinFiles: options.errorMinFiles,
            errorMaxFiles: options.errorMaxFiles,
            multiple: multiple
        });

        if (acceptFile) {
            acceptFile = acceptFile.split(',');
            acceptFile = acceptFile.map(item => item.trim().replace('.', ''));
        }

        let uploadID = $parent.attr('data-wpformbuilder-upload-stt');
        const $previewElement = $parent.find('.wpformbuilder-file-upload-preview');
        // IMPORTANT: don't use jQuery .data() here because it caches old values.
        // We need layout/preview sizes to update immediately when attributes change in editor.
        const layout = $previewElement.attr('data-layout') || 'icon';
        const previewWidth = $previewElement.attr('data-preview-width') || options.previewWidth || 100;
        const previewHeight = $previewElement.attr('data-preview-height') || options.previewHeight || 100;
        const elementName = jQuery(input).attr('data-upload-for');

        if (typeof uploadID !== 'undefined' && uploadID !== false) {
            uploadID = parseInt(uploadID);
        } else {
            uploadID = 0;
        }

        // Lấy hoặc khởi tạo array lưu File objects map với uploadID
        let filesMap = $parent.data('wpformbuilder-files-map');
        if (!filesMap) {
            filesMap = {};
        }

        // Nếu không phải multiple, clear map để thay thế hoàn toàn
        if (!multiple) {
            filesMap = {};
            $parent.data('wpformbuilder-files-map', filesMap);
        }

        // Kiểm tra số lượng file với maxFiles (chỉ khi filesLimit = true)
        if (options.filesLimit && multiple && options.maxFiles) {
            const currentFilesCount = Object.keys(filesMap).length;
            const newFilesCount = files.length;
            const totalFilesCount = currentFilesCount + newFilesCount;

            if (totalFilesCount > options.maxFiles) {
                const errorMsg = options.errorMaxFiles.replace('{max}', options.maxFiles);
                $elementError[0].innerHTML = errorMsg;
                $elementError.addClass('error').fadeIn('swing');
                // Clear input để không giữ files vừa chọn
                jQuery(input).val('');
                return;
            }
        }

        // Counter để theo dõi số file đã load xong
        let filesLoaded = 0;
        const totalFilesToLoad = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let html = '';
            const fileName = this.createFileNameScreen(file.name);
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileIcon = this.getFileIcon(file.name);

            if (this.checkFile(file, options, maxSize, acceptFile, $elementError)) {
                return;
            } else {
                if ($elementError.hasClass('error')) {
                    $elementError.fadeOut('swing');
                }

                const picReader = new FileReader();
                picReader.addEventListener('load', () => {

                    const sizeMarkup = layout === 'icon' ? '' : ``;
                    if (layout === 'icon') {
                        html += `<label class="wpformbuilder-file-upload-item" data-wpformbuilder-file-upload-item-id="${uploadID}">
                            <span class="wpformbuilder-name-file-upload">
                                <span class="wpformbuilder-file-upload-icon-image-wrapper">
                                    <img class="wpformbuilder-file-upload-icon-format" width="${previewWidth}" height="${previewHeight}" src="${wpformbuilderPluginDir}assets/images/${fileIcon}">
                                        <span class="wpformbuilder-file-upload-item-remove" data-wpformbuilder-remove-file-id="${uploadID}">
                                            <i class="fa fa-times" aria-hidden="true"></i>
                                        </span>
                                    </span>
                                </span>
                            <span class="wpformbuilder-file-upload-name">
                                <span class="wpformbuilder-file-upload-name-text">${fileName}</span>
                                <span class="wpformbuilder-file-upload-extension">.${fileExtension}</span>
                            </span>
                        </label>`;
                    } else {
                        html += `<label class="wpformbuilder-file-upload-item" data-wpformbuilder-file-upload-item-id="${uploadID}">
                            <span class="wpformbuilder-name-file-upload">
                                <img class="wpformbuilder-file-upload-icon-format" width="${previewWidth}" height="${previewHeight}" src="${wpformbuilderPluginDir}assets/images/${fileIcon}">
                                <span class="wpformbuilder-file-upload-name">
                                <span class="wpformbuilder-file-upload-name-text">${fileName}</span>
                                <span class="wpformbuilder-file-upload-extension">.${fileExtension}</span>
                                </span>
                                <span class="wpformbuilder-file-upload-size">${file.size}Kb</span>
                            </span>
                            <span class="wpformbuilder-file-upload-item-remove" data-wpformbuilder-remove-file-id="${uploadID}">
                                    <i class="fa fa-times" aria-hidden="true"></i>
                                </span>
                        </label>`;
                    }

                    if (multiple) {
                        $previewElement.prepend(html);
                    } else {
                        $previewElement[0].innerHTML = html;
                    }

                    // Lưu File object vào map với uploadID
                    filesMap[uploadID] = file;
                    $parent.data('wpformbuilder-files-map', filesMap);

                    if (!is_editor) {
                        //this.saveFile(files[i], uploadID, ajaxUrl, $parent, elementName);
                    }

                    //
                    this.removeFile(input, options.ajaxUrl, uploadID, input);
                    uploadID++;
                    $parent.attr('data-wpformbuilder-upload-stt', uploadID);

                    // Cập nhật input.files với tất cả files trong map bằng DataTransfer
                    // Điều này đảm bảo input.files luôn đồng bộ với filesMap
                    if (input && input.files) {
                        const dataTransfer = new DataTransfer();
                        Object.values(filesMap).forEach(fileObj => {
                            dataTransfer.items.add(fileObj);
                        });
                        input.files = dataTransfer.files;
                    }

                    // Tăng counter files đã load
                    filesLoaded++;

                    // Kiểm tra minFiles sau khi TẤT CẢ files đã upload xong (chỉ khi filesLimit = true)
                    if (filesLoaded === totalFilesToLoad && options.filesLimit && multiple && options.minFiles) {
                        // showError = true để hiển thị thông báo nếu chưa đủ file
                        this.validateMinFiles($parent, options.minFiles, $elementError, options.errorMinFiles, true);
                    }
                });
                picReader.readAsDataURL(file);
            }
        }
    }

    /**
     * Save file via AJAX
     * @private
     */
    // saveFile(file, uploadID, ajaxUrl, $parent, name) {
    //     const fileData = new FormData();
    //     fileData.append('file', file);
    //     fileData.append('action', 'sunformbuilder_file_upload');
    //     fileData.append('type', 'upload');

    //     jQuery.ajax({
    //         url: ajaxUrl,
    //         dataType: 'text',
    //         cache: false,
    //         processData: false,
    //         contentType: false,
    //         data: fileData,
    //         type: 'post',
    //         success: (res) => {
    //             const $uploadElement = $parent.find(`[data-wpformbuilder-upload-name="${name}"]`);
    //             $parent.find('.wpformbuilder-file-upload-preview')
    //                 .find(`[data-wpformbuilder-loading-id="${uploadID}"]`)
    //                 .addClass('wpformbuilder-hidden');

    //             const uploadValue = $uploadElement.val();
    //             let uploadData = {};

    //             if (uploadValue) {
    //                 uploadData = JSON.parse(uploadValue);
    //                 uploadData[uploadID] = res;
    //             } else {
    //                 uploadData[uploadID] = res;
    //             }

    //             $uploadElement.val(JSON.stringify(uploadData));
    //             $uploadElement.change();
    //         }
    //     });
    // }

    /**
     * Remove file handler
     * @private
     */
    removeFile(element, ajaxUrl, uploadID, uploadElement) {
        jQuery(document).on('click', `[data-wpformbuilder-remove-file-id="${uploadID}"]`, function () {
            const imgID = jQuery(this).attr('data-wpformbuilder-remove-file-id');
            const $elementItem = jQuery(this).closest(`[data-wpformbuilder-file-upload-item-id="${imgID}"]`);
            const $parent = $elementItem.closest('.wpformbuilder-form-group');
            const elementName = jQuery(element).attr('data-upload-for');
            const $fileUploadContainer = jQuery(this).closest('.wpformbuilder-file-upload');
            const $elementSetValue = $fileUploadContainer.find(`[data-wpformbuilder-upload-name="${elementName}"]`);
            const $fileInput = jQuery(element).is('input[type="file"]') ? jQuery(element) : $fileUploadContainer.find('input[type="file"][data-upload-for="' + elementName + '"]');

            // Lấy files map từ parent
            let filesMap = $parent.data('wpformbuilder-files-map') || {};

            // Xóa file khỏi map
            delete filesMap[imgID];
            $parent.data('wpformbuilder-files-map', filesMap);

            // Tạo FileList mới từ các files còn lại bằng DataTransfer
            if ($fileInput.length && $fileInput[0]) {
                const dataTransfer = new DataTransfer();
                Object.values(filesMap).forEach(file => {
                    dataTransfer.items.add(file);
                });
                $fileInput[0].files = dataTransfer.files;
            }

            // Cập nhật hidden input value
            let value = $elementSetValue.val() ? JSON.parse($elementSetValue.val()) : {};
            const fileData = new FormData();
            fileData.append('type', 'delete');
            fileData.append('action', 'sunformbuilder_file_upload');
            if (value[imgID]) {
                fileData.append('url', value[imgID]);
            }

            delete value[imgID];

            if (jQuery.isEmptyObject(value)) {
                $elementSetValue.val('');
            } else {
                $elementSetValue.val(JSON.stringify(value));
            }

            $elementItem.delay(150).fadeOut(150, 'swing', function () {
                $elementItem.remove();

                // Kiểm tra minFiles sau khi xóa (nếu có cấu hình và filesLimit = true)
                // showError = true vì khi xóa file, cần cảnh báo ngay nếu không đủ
                const validationOptions = $parent.data('wpformbuilder-validation-options');
                if (validationOptions && validationOptions.filesLimit && validationOptions.multiple && validationOptions.minFiles) {
                    const $errorElement = $parent.find('.wpformbuilder-form-notification-upload');
                    wpformbuilderFileUpload.validateMinFiles(
                        $parent, 
                        validationOptions.minFiles, 
                        $errorElement, 
                        validationOptions.errorMinFiles,
                        true
                    );
                }
            });
        });
    }

    /**
     * Validate minimum number of files
     * @param {jQuery} $parent - Parent element containing the file upload
     * @param {number} minFiles - Minimum number of files required
     * @param {jQuery} $errorElement - Error element to display message
     * @param {string} errorMsg - Error message to display
     * @param {boolean} showError - Whether to show error message if validation fails (default: true)
     * @returns {boolean} - True if validation passes, false otherwise
     */
    validateMinFiles($parent, minFiles, $errorElement, errorMsg, showError = true) {
        if (!minFiles || minFiles <= 0) {
            return true;
        }

        const filesMap = $parent.data('wpformbuilder-files-map') || {};
        const currentFilesCount = Object.keys(filesMap).length;

        // Nếu không có file nào (về 0), ẩn error (reset về trạng thái ban đầu)
        if (currentFilesCount === 0) {
            if ($errorElement.hasClass('error')) {
                $errorElement.fadeOut('swing');
            }
            return true; // Không coi là lỗi vì chưa bắt đầu upload
        }

        if (currentFilesCount < minFiles) {
            // Chỉ hiển thị error nếu showError = true (khi xóa file hoặc submit form)
            if (showError) {
                const message = errorMsg.replace('{min}', minFiles);
                $errorElement[0].innerHTML = message;
                $errorElement.addClass('error').fadeIn('swing');
            }
            return false;
        }

        // Clear error nếu đã đủ file
        if ($errorElement.hasClass('error')) {
            $errorElement.fadeOut('swing');
        }
        return true;
    }

    /**
     * Validate file
     * @private
     */
    checkFile(file, options, maxSize, acceptFile, $errorElement) {
        let result = true;
        const fileType = file.name.split('.').pop();
        let errorMsg;
        const extensionBlock = ['php', 'php3', 'php4', 'php8', 'phpt', 'php5', 'php7', 'exe', 'phtml', 'phar'];
        let autoHide = false;

        if (file.size > maxSize) {
            // Thêm tên file vào thông báo lỗi với format: "File {file_name} has exceeded the maximum size limit."
            // Thay thế placeholder {file_name} bằng tên file thực tế
            errorMsg = options.errorMaxSize.replace('{file_name}', `<strong>${file.name}</strong>`);
            autoHide = true;
        } else if (acceptFile && acceptFile.length > 0 && !acceptFile.includes(fileType)) {
            errorMsg = options.errorType;
        } else if (extensionBlock.includes(fileType)) {
            errorMsg = options.errorMsg;
        } else {
            result = false;
        }

        if (result) {
            $errorElement[0].innerHTML = errorMsg;
            $errorElement.addClass('error').fadeIn('swing');

            // Tự động ẩn thông báo sau 30 giây nếu là lỗi kích thước file
            if (autoHide) {
                setTimeout(() => {
                    if ($errorElement.hasClass('error')) {
                        $errorElement.fadeOut('swing');
                    }
                }, 5000);
            }
        }

        return result;
    }

    /**
     * Get file icon based on file extension
     * @private
     */
    getFileIcon(fileName) {
        const fileType = fileName.split('.').pop().toLowerCase();

        switch (fileType) {
            case 'pdf':
                return 'pdf.svg';
            case 'xlsx':
            case 'xls':
            case 'xlsm':
                return 'excel.svg';
            case 'doc':
            case 'docx':
                return 'word.svg';
            case 'psd':
                return 'photoshop.svg';
            case 'ppt':
            case 'pps':
            case 'pptx':
            case 'ppsx':
                return 'powerpoint.svg';
            case 'txt':
                return 'txt.svg';
            case 'jpg':
            case 'png':
            case 'gif':
                return 'image.svg';
            case 'csv':
                return 'csv.svg';
            default:
                return 'file.svg';
        }
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
const wpformbuilderFileUpload = new WPFormBuilderFileUpload();

// Register as jQuery plugin for backward compatibility
if (typeof jQuery !== 'undefined') {
    jQuery.fn.wpformbuilderFileUpload = function (options) {
        return this.each(function () {
            wpformbuilderFileUpload.init(this, options);
        });
    };
}

// Export as ES6 module
export default wpformbuilderFileUpload;

// Also export class for advanced usage
export { WPFormBuilderFileUpload };