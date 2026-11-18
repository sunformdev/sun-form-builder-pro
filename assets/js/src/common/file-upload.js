import wpformbuilderFileUpload from '../../lib/upload/file-upload-lib';

jQuery(function ($) {
    const fileUploads = $('.wpformbuilder-file-upload');
    fileUploads.each(function (index, item) {
        const $this = $(this);
        const input = $this.find('input[type="file"]');
        const label = $this.find('label.wpformbuilder-button-file-upload');
        const preview = $this.find('.wpformbuilder-file-upload-preview');
        const notification = $this.find('.wpformbuilder-form-notification-upload');
        const hiddenInput = $this.find('input[type="hidden"]');
        const fileUploadOptions = $this.closest('.wpformbuilder-form-control.file-upload').data('file-upload-options');
        fileUploadOptions.fsjs_data = sfbuilder_js_data;
        //console.log('fileUploadOptions--->: ', fileUploadOptions);

        $this.wpformbuilderFileUpload(fileUploadOptions);
    });
});