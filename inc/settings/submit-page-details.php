<?php
if (! defined('ABSPATH')) exit;

class SFBuilder_Pro_Form_Submition_Details extends SFBuilder_Pro_Helper
{
    public function sun_get_column_submition($submit_id, $type, $index, $item, $repeater_key = false, $repeater_data = false)
    {
        $item = $repeater_data === false ? $item : $repeater_data;
        $label = is_array($item->label) ? $item->repeaterLabel : $item->label;
?>
        <tr data-type="<?php echo esc_attr($type); ?>" data-name="<?php echo esc_attr($index); ?>" data-object='<?php echo esc_attr(wp_json_encode($item)); ?>'
            data-repeater-key="<?php echo esc_attr((string) $repeater_key); ?>">
            <th style="padding:10px;text-align:-webkit-auto;width:200px;background-color:#f7f7f7"><?php echo esc_html($label); ?></th>
            <?php if ($item->type == 'image_upload') { ?>
                <td style="padding:10px" data-type="<?php echo esc_attr($item->type); ?>" data-field="<?php echo esc_attr($index); ?>"
                    data-post-id="<?php echo esc_attr($submit_id); ?>" colspan="2">
                    <?php $imagesName = explode(',', $item->value); ?>
                    <div class="wpformbuilder-image-upload-box">
                        <?php foreach ($item->url as $i => $src): ?>
                            <div class="wpformbuilder-image-upload-submissions-item" style="text-align: center;">
                                <div class="wpformbuilder-image-upload-submissions" style="background-image: url('<?php echo esc_url($src); ?>'); background-size: contain; background-position: center; background-repeat: no-repeat;"></div>
                                <a title="Click to dowload" class="wpformbuilder-dowload-document" href="<?php echo esc_url($src); ?>" download><?php echo esc_html($imagesName[$i]); ?></a>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </td>
            <?php } elseif ($item->type == 'checkbox') { ?>
                <td style="padding:10px" data-field="<?php echo esc_attr($index); ?>" data-type="<?php echo esc_attr($item->type); ?>"
                    data-post-id="<?php echo esc_attr($submit_id); ?>">
                    <?php foreach ($item->options as $c => $check): ?>
                        <?php
                        if (in_array($check->value, explode(',', $item->value))) {
                            echo '<label><input type="checkbox" name="lname" class="wpformbuilder-form__input chexbox" value="' . esc_attr($check->value) . '" checked disabled>' . esc_html($check->label) . '</label>';
                        } else {
                            echo '<label><input type="checkbox" name="lname" class="wpformbuilder-form__input chexbox" value="' . esc_attr($check->value) . '" disabled>' . esc_html($check->label) . '</label>';
                        }
                        ?>
                    <?php endforeach; ?>
                </td>
            <?php } elseif ($item->type == 'radio') { ?>
                <td style="padding:10px" data-type="<?php echo esc_attr($item->type); ?>" data-field="<?php echo esc_attr($index); ?>"
                    data-post-id="<?php echo esc_attr($submit_id); ?>">
                    <?php foreach ($item->options as $r => $check): ?>
                        <?php
                        if (in_array($check->value, explode(',', $item->value))) {
                            echo '<label><input type="radio" name="lname" value="' . esc_attr($check->value) . '" checked disabled>' . esc_html($check->label) . '</label>';
                        } else {
                            echo '<label><input type="radio" name="lname" value="' . esc_attr($check->value) . '" disabled>' . esc_html($check->label) . '</label>';
                        }
                        ?>
                    <?php endforeach; ?>
                </td>
            <?php } elseif ($item->type == 'file_upload') { ?>
                <td style="padding:10px" data-field="<?php echo esc_attr($index); ?>" data-type="<?php echo esc_attr($item->type); ?>"
                    data-post-id="<?php echo esc_attr($submit_id); ?>" colspan="2">
                    <div class="wpformbuilder-document-box">
                        <?php if (!empty($item->value)): ?>
                            <?php foreach ($item->url as $d): ?>
                                <div class="wpformbuilder-document-item">
                                    <a title="Click to dowload" class="wpformbuilder-dowload-document" href="<?php echo esc_url($d); ?>" download>
                                        <img class="wpformbuilder-file-upload-icon-format" width="50" height="50"
                                            src="<?php echo esc_url(plugin_dir_url(__FILE__) . '../../assets/images/' . $this->sunformbuilder_get_icon_file_upload(pathinfo($d)['extension'])); ?>">
                                    </a>
                                    <span class="wpformbuilder-document-name">
                                        <a title="Click to dowload" class="wpformbuilder-dowload-document-download" href="<?php echo esc_url($d); ?>" download>
                                            <span class="wpformbuilder-document-name__text"><?php echo esc_html(pathinfo($d)['filename']); ?>.</span>
                                            <span class="wpformbuilder-document-extension"><?php echo esc_html(pathinfo($d)['extension']); ?></span>
                                        </a>
                                    </span>
                                </div>
                        <?php endforeach;
                        endif; ?>
                    </div>
                </td>
            <?php } elseif ($item->type == 'signature') { ?>
                <td style="padding:10px" data-field="<?php echo esc_attr($index); ?>" data-type="<?php echo esc_attr($item->type); ?>"
                    data-post-id="<?php echo esc_attr($submit_id); ?>" colspan="2">
                    <div class="sun-signature-submissions">
                        <img src="<?php echo esc_url(wp_upload_dir()['baseurl'] . '/sun-addons-for-elementor/signature/' . $item->value); ?>"
                            style="border: 1px solid #ccc;">
                        <div><a title="Click to dowload" class="sun-dowload-document"
                                href="<?php echo esc_url(wp_upload_dir()['baseurl'] . '/sun-addons-for-elementor/signature/' . $item->value); ?>"
                                download><?php echo esc_html($item->value); ?></a></div>
                    </div>
                </td>
            <?php } elseif ($item->type == 'url') { ?>
                <td style="padding:10px" data-field="<?php echo esc_attr($index); ?>" data-type="<?php echo esc_attr($item->type); ?>"
                    data-post-id="<?php echo esc_attr($submit_id); ?>" colspan="2">
                    <a title="<?php echo esc_attr($item->label); ?>" class="sun-url-submissions" href="<?php echo esc_url($item->value); ?>"
                        download><?php echo esc_html($this->sfbuilder_pro_fix_submission_display_value($item->value)); ?></a>
                </td>
            <?php } else { ?>
                <?php if (is_array($item->type) && !empty($item->content)) { ?>
                    <?php
                    $repeater_type = $item->type;
                    if (in_array('checkbox', $repeater_type) || in_array('radio', $repeater_type)) {
                        $content = $this->get_content_repeater_html($repeater_data, $repeater_key);
                    } else {
                        $content = $item->content;
                    }
                    ?>
                    <td style="padding:10px" data-field="<?php echo esc_attr($index); ?>" data-type='<?php echo esc_attr(wp_json_encode($item->type)); ?>'
                        data-post-id="<?php echo esc_attr($submit_id); ?>">
                        <?php
                        echo wp_kses($content, $this->sunformbuilder_submission_details_allowed_html());
                        ?>
                    </td>
                <?php } else { ?>
                    <td style="padding:10px" data-field="<?php echo esc_attr($index); ?>" data-type="<?php echo esc_attr($item->type); ?>"
                        data-post-id="<?php echo esc_attr($submit_id); ?>"><?php echo esc_html($this->sfbuilder_pro_fix_submission_display_value($item->value)); ?></td>
                <?php } ?>
            <?php } ?>
            <?php if (!in_array($item->type, ['signature', 'file_upload', 'image_upload'])): ?>
                <td style="text-align:center;width:160px;"><a class="button button-small wpformbuilder-edit-database"
                        title="Edit">Edit</a>&emsp;<a class="button button-small wpformbuilder-cancel-database" title="Cancel">Cancel</a></td>
            <?php endif; ?>
        </tr>
    <?php
    }
    public function sunformbuilder_get_icon_file_upload($type)
    {
        switch (strtolower($type)) {
            case 'pdf':
                $icon = 'pdf.svg';
                break;
            case 'xlsx':
            case 'xls':
            case 'xlsm':
                $icon = 'excel.svg';
                break;
            case 'doc':
            case 'docx':
                $icon = 'word.svg';
                break;
            case 'psd':
                $icon = 'photoshop.svg';
                break;
            case 'ppt':
            case 'pps':
            case 'pptx':
            case 'ppsx':
                $icon = 'powerpoint.svg';
                break;
            case 'txt':
                $icon = 'txt.svg';
                break;
            case 'jpg':
            case 'png':
            case 'gif':
                $icon = 'image.svg';
                break;
            case 'csv':
                $icon = 'csv.svg';
                break;
            default:
                $icon = 'file.svg';
                break;
        }
        return $icon;
    }
    /**
     * Allowed HTML for repeater submission detail markup (inputs, labels, uploads).
     *
     * @return array<string,array<string,bool>>
     */
    private function sunformbuilder_submission_details_allowed_html()
    {
        $allowed = wp_kses_allowed_html('post');

        $allowed['input'] = [
            'type'     => true,
            'name'     => true,
            'class'    => true,
            'value'    => true,
            'id'       => true,
            'checked'  => true,
            'disabled' => true,
        ];

        return $allowed;
    }

    public function get_content_repeater_html($data, $index)
    {
        //echo "<pre>"; var_dump($data);
        $html = '';
        $type = $data->type;
        $value = $data->value;
        $options = $data->options;
        $label = $data->label;
        $name = $data->name;
        $url = $data->url;
        foreach ($type as $key => $tp) {
            $html .= '<div class="sun-repeater-submissions-item">';
            $reLabel = !empty($label[$key]) ? '<span style="font-weight:700;">' . esc_html($label[$key]) . ':&#160;</span>' : '';
            switch ($tp) {
                case 'checkbox':
                case 'radio':
                    $item_name = $name[$key];
                    $items = $options->$item_name;
                    $html .= $reLabel;
                    foreach ($items as $k => $option) {
                        $input_attrs = ' type="' . esc_attr($type[$key]) . '" name="' . esc_attr($name[$key] . $index) . '" class="sun-form__input chexbox" value="' . esc_attr($option) . '" id="sun-radio-1" disabled';
                        if (in_array($option, explode(',', $value[$key]), true)) {
                            $html .= '<label><input' . $input_attrs . ' checked>' . esc_html($option) . '</label>';
                        } else {
                            $html .= '<label><input' . $input_attrs . '>' . esc_html($option) . '</label>';
                        }
                    }
                    $html .= '<br>';
                    break;
                case 'image_upload':
                    $upload_value = explode(',', $value[$key]);
                    $upload_name = $name[$key];
                    $images = $url->$upload_name;
                    $html .= $reLabel . '<div class="sun-repeater-upload-item sun-repeater-image-upload">';
                    foreach ($images as $i => $img_src) {
                        $html .= '<div class="sun-image-upload-submissions"><img src="' . esc_url($img_src) . '" width="150" height="150">';
                        $html .= '<div><a title="Click to dowload" class="sun-dowload-document" href="' . esc_url($img_src) . '" download>' . esc_html($upload_value[$i] ?? '') . '</a></div></div>';
                    }
                    $html .= '</div>';
                    //Đang ở đây, sửa css
                    break;
                default:
                    $html .= $reLabel . esc_html($this->sfbuilder_pro_fix_submission_display_value($value[$key])) . '<br>';
            }
            $html .= '</div>';
        }
        return rtrim($html, '<br>');
    }
}
$sfbuilder_submition_details = new SFBuilder_Pro_Form_Submition_Details();
$sfbuilder_payment_data = false;

$sfbuilder_post = get_post($sfbuilder_submit_id);
// $args = [
//     'post_type' => 'sfb_submissions',
//     'post_status' => 'publish',
//     'post__in' => [280]
// ];
// $query = new WP_Query($args);
// $posts = $query->have_posts() ? $query->posts : '';
// echo "<pre>"; var_dump($posts); echo "</pre>"; die('999');
// echo "<pre>"; var_dump($post); echo "</pre>"; die('1234');

$sfbuilder_post_content = $sfbuilder_post->post_content;
//echo "<pre>"; var_dump($sfbuilder_post_content); echo "</pre>"; die('6677');
if (!empty($sfbuilder_post_content)):
    $sfbuilder_contents = $sfbuilder_submition_details->sfbuilder_pro_decode_submission_json($sfbuilder_post_content);
    //echo "<pre>"; var_dump($sfbuilder_contents); echo "</pre>"; die('2222');
    $sfbuilder_meta_data = get_post_meta($sfbuilder_submit_id, 'meta_data', true);
    //echo "<pre>"; var_dump($sfbuilder_meta_data); echo "</pre>";
    $sfbuilder_payment_data = !empty($sfbuilder_contents->payment_data) ? $sfbuilder_contents->payment_data : false;
    //echo "<pre>"; var_dump($sfbuilder_payment_data); echo "</pre>"; die('12345');
    unset($sfbuilder_contents->form_id, $sfbuilder_contents->post_form_id, $sfbuilder_contents->form_name, $sfbuilder_contents->post_id);
    ?>
    <div class="wpformbuilder-submition-details wrap">
        <h2 class="wpformbuilder-submition-title">Submission #<?php echo esc_html($sfbuilder_submit_id); ?></h2>
        <div class="wpformbuilder-submition-details-body">
            <div class="wpformbuilder-submition-details-post">
                <table border="1"
                    style="border-collapse:collapse;color:#000;width:100%;border-color:#ccd0d4;font-size: 14px;"
                    class="wpformbuilder-table-database">
                    <tbody>
                        <?php
                        // echo "<pre>";
                        // var_dump($contents);
                        // echo "</pre>";
                        // die('12345');
                        ?>
                        <?php foreach ($sfbuilder_contents as $sfbuilder_index => $sfbuilder_item) {
                            $sfbuilder_type = !empty($sfbuilder_item->type) ? $sfbuilder_item->type : 'text';
                            if (is_array($sfbuilder_item)) {
                                //die('vào đây rồi nhé222');
                                $sfbuilder_type = is_array($sfbuilder_item[0]->type) ? 'repeater' : 'text';
                                //echo "<pre>"; var_dump($sfbuilder_item); echo "<pre>";
                                foreach ($sfbuilder_item as $sfbuilder_k => $sfbuilder_v) {
                                    $sfbuilder_repeater_data = $sfbuilder_v;
                                    //$sfbuilder_repeater_data->label = $sfbuilder_repeater_data->repeaterLabel . '&nbsp;'. ($sfbuilder_k+1);
                                    $sfbuilder_repeater_data->repeaterLabel = $sfbuilder_repeater_data->repeaterLabel . '&nbsp;' . ($sfbuilder_k + 1);
                                    // /echo "<pre>"; var_dump($sfbuilder_v); echo "<pre> 1221";
                                    //Đang lỗi ở đây, kiêm tra xem biến $sfbuilder_k có đúng ko.
                                    //var_dump($sfbuilder_k);
                                    $sfbuilder_submition_details->sun_get_column_submition($sfbuilder_submit_id, $sfbuilder_type, $sfbuilder_index, $sfbuilder_repeater_data, $sfbuilder_k, $sfbuilder_v);
                                }
                            } else {
                                //die('vào đây rồi nhé');
                                $sfbuilder_submition_details->sun_get_column_submition($sfbuilder_submit_id, $sfbuilder_type, $sfbuilder_index, $sfbuilder_item, false, false);
                            }
                        } ?>
                    </tbody>
                </table>
            </div>
            <div class="wpformbuilder-submition-details-metadata__items">
                <?php if ($sfbuilder_payment_data): ?>
                    <div class="wpformbuilder-submition-details-metadata postbox">
                        <div class="wpformbuilder-submition-details-meta-data">
                            <h2 class="hndle ui-sortable-handle wpformbuilder-submition-metadata-box"><span>Payment
                                    Information</span></h2>
                            <div class="inside">
                                <?php foreach ($sfbuilder_payment_data as $sfbuilder_key => $sfbuilder_value): ?>
                                    <?php
                                    switch ($sfbuilder_key) {
                                        case 'name':
                                            $sfbuilder_payment_label = 'Platform';
                                            break;
                                        case 'status':
                                            $sfbuilder_payment_label = 'Status';
                                            break;
                                        case 'id':
                                            $sfbuilder_payment_label = 'ID';
                                            break;
                                        case 'amount':
                                            $sfbuilder_payment_label = 'Amount';
                                            break;
                                        default:
                                            $sfbuilder_payment_label = $sfbuilder_key;
                                    }
                                    ?>
                                    <div class="sun-metadata-<?php echo esc_attr($sfbuilder_key); ?>"
                                        style="line-height:2; border-bottom: 1px solid #ccc; font-size: 14px;"><span
                                            class="sun-metadata-title"><?php echo esc_html($sfbuilder_payment_label); ?>: </span><span
                                            class="sun-metadata-content"><?php echo esc_html($sfbuilder_value); ?></span></div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
                <div class="wpformbuilder-submition-details-metadata postbox">
                    <div class="wpformbuilder-submition-details-meta-data">
                        <h2 class="hndle ui-sortable-handle wpformbuilder-submition-metadata-box"><span>Metadata</span></h2>
                        <div class="inside">
                            <?php foreach ($sfbuilder_meta_data as $sfbuilder_key => $sfbuilder_item): ?>
                                <?php if ($sfbuilder_key == '_page_url') { ?>
                                    <div class="wpformbuilder-metadata-<?php echo esc_attr($sfbuilder_key); ?>" style="line-height:1.7;font-size: 14px;"><span
                                            class="wpformbuilder-metadata-title"><?php echo esc_html($sfbuilder_item['label']); ?>: </span><a
                                            href="<?php echo esc_url($sfbuilder_item['value']); ?>" title="View Page" target="_blank"
                                            class="wpformbuilder-metadata-content"><?php echo esc_html($sfbuilder_item['value']); ?></a></div>
                                <?php } else { ?>
                                    <div class="wpformbuilder-metadata-<?php echo esc_attr($sfbuilder_key); ?>" style="line-height:1.7;font-size: 14px;"><span
                                            class="wpformbuilder-metadata-title"><?php echo esc_html($sfbuilder_item['label']); ?>: </span><span
                                            class="wpformbuilder-metadata-content"><?php echo esc_html($sfbuilder_item['value']); ?></span></div>
                            <?php }
                            endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php endif; ?>