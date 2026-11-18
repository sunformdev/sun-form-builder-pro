import wpformbuilderImageUpload from '../../lib/upload/image-upload-lib';

jQuery(function ($) {
    const imageUploads = $('.wpformbuilder-image-upload');
    console.log('imageUploads--->: ', imageUploads);
    imageUploads.each(function (index, item) {
        const $this = $(this);
        const input = $this.find('input[type="file"]');
        const preview = $this.find('.wpformbuilder-image-upload-preview');
        const notification = $this.find('.wpformbuilder-form-notification-upload');
        const hiddenInput = $this.find('input[type="hidden"]');
        const imageUploadOptions = $this.closest('.wpformbuilder-form-control.image-upload').data('image-upload-options');
        imageUploadOptions.fsjs_data = sfbuilder_js_data;
        console.log('imageUploadOptions--->: ', imageUploadOptions);
        $this.wpformbuilderImageUpload(imageUploadOptions);
    });
});