<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SFBuilder_Pro_Form_Submition extends SFBuilder_Pro_Helper
{

    public function sunformbuilder_get_submissions($orderby, $order, $paged, $post_status, $date = false, $title = false, $list_url = ''){
        $args = [
            'post_type' => 'sfb_submissions',
            'post_status' => $post_status,
            'posts_per_page' => 20,
            'orderby' => $orderby,
            'order' => $order,
            'paged' => $paged,
            'post_title__in' => $title ? [$title] : '',
        ];
        if($date){
            if($date == 'today'){
                $args['date_query'] = [
                    [
                        'year' => intval(gmdate('Y')),
                        'monthnum' => intval(gmdate('n')),
                        'day' => intval(gmdate('j'))
                    ],
                ];
            }else{
                $date ? $args['m'] = intval($date) : '';
            }
        }
        !empty($title) ? $args['title'] = $title : '';
        $query = new WP_Query($args);
        $total_pages = $query->max_num_pages;
        if ($total_pages > 1){
            $current_page = max(1, intval($paged));
            $pagination_base = $list_url
                ? add_query_arg('paged', '%#%', $list_url)
                : get_pagenum_link(1) . '%_%';
            $pagination = paginate_links(array(
                'base' => $pagination_base,
                'format' => $list_url ? '' : '&paged=%#%',
                'current' => $current_page,
                'total' => $total_pages,
                'prev_text'    => __('«', 'sunformbuilder-pro'),
                'next_text'    => __('»', 'sunformbuilder-pro'),
            ));
        }
        $pagination = !empty($pagination) ? str_replace('#038;', '&', $pagination) : '';
        $data['posts'] = $query->have_posts() ? $query->posts : '';
        $data['pagination'] = $pagination;
        return $data;
    }
    public function get_total_item_submissions(){
        $args = array(  
			'post_type' => 'sfb_submissions',
			'post_status' => 'publish',
            'posts_per_page' => -1,
		);
        $query = new WP_Query($args);
        $total = $query->have_posts() ? count($query->posts) : 0;
        return $total;
    }
    public function get_total_item_trash_submissions(){
        $args = array(  
			'post_type' => 'sfb_submissions',
			'post_status' => 'trash',
            'posts_per_page' => -1,
		);
        $query = new WP_Query($args);
        $total = $query->have_posts() ? count($query->posts) : 0;
        return $total;
    }
    public function sunformbuilder_get_email_submissions($data){
        //echo "<pre>"; var_dump($data); echo "</pre>"; die('data');
        $data = $this->sfbuilder_pro_decode_submission_json($data);
        foreach($data as $key => $val){
            if(!empty($val->type) && $val->type == 'email'){
                $email = $val->value;
                return $email;
            }
        }
        return isset($email) ? $email : '____________________';
    }
    public function sunformbuilder_get_status_read_submissions($data){
        $data = $this->sfbuilder_pro_decode_submission_json($data);
        return isset($data->read) ? $data->read : 'read';
    }
    public function sunformbuilder_remove_read_status($id){
        $post = get_post($id);
        $content = $this->sfbuilder_pro_decode_submission_json($post->post_content);
        unset($content->read);
        $post->post_content = $this->sfbuilder_pro_encode_submission_json($content);
        wp_update_post($post);
        return;
    }
    public function sunformbuilder_get_datetime_submissions($post_id){
        $data = get_post_meta($post_id, 'meta_data', true);
        $date = isset($data['_date']['value']) ? $data['_date']['value'] : '';
        $time = isset($data['_time']['value']) ? $data['_time']['value'] : '';
        return esc_html($date) . '&nbsp;' . esc_html($time);
    }
    public function sunformbuilder_get_form_id_submissions($data){
        $data = $this->sfbuilder_pro_decode_submission_json($data);
        $name = !empty($data->form_name) ? $data->form_name : '';
        return $name;
    }
    public function sunformbuilder_get_page_submissions($data){
        $page = [];
        $data = $this->sfbuilder_pro_decode_submission_json($data);
        $post_id = isset($data->post_id) ? $data->post_id : false;
        if($post_id){
            $post = get_post($post_id);
            if($post){
                $page['url'] = get_permalink($post_id);
                $page['title'] = !empty(get_the_title($post_id)) ? get_the_title($post_id) : '(no title)';
                return $page;
            }

        }
        return !empty($page) ? $page : ['url' => '#', 'title' => 'No Page'];
    }
    public function sunformbuilder_get_time_filter(){
        $date = gmdate('Y-m');
        $date_query = ['All dates' => '0', 'Today' => 'today'];
        for($i=0;$i<6;$i++){
            $new_date = strtotime ( '-'.$i.' month' , strtotime ( $date ) ) ;
            $date_value = gmdate ( 'Ym' , $new_date );
            $date_key = gmdate ( 'M Y' , $new_date );
            $date_query[$date_key] = $date_value;
        }
        return $date_query;
    }
    public function sunformbuilder_get_form_ids($post_status, $orderby, $order){
        $form_ids = ['0' => 'All Form'];
        $args = array(  
			'post_type' => 'sfb_submissions',
			'post_status' => $post_status,
            'orderby' => $orderby,
            'order' => $order,
		);
        $query = new WP_Query($args);
        $posts = $query->have_posts() ? $query->posts : '';
        if($posts){
            foreach($posts as $post){
                $content = $this->sfbuilder_pro_decode_submission_json($post->post_content);
                $id = isset($content->form_id) ? $content->form_id : false;
                $name = !empty($content->form_name) ? $content->form_name : "Form #$id";
                if(!array_key_exists($id, $form_ids) && $id){
                    $form_ids[$id] = $name;
                }
            }
        }
        return $form_ids;
    }
    public function sun_export_form_submissions($post_status){
        header('Content-Description: File Transfer');
        header('Content-Type: application/csv');
        header("Content-Disposition: attachment; filename=page-data-export.csv");
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

        if (ob_get_length()) {
            ob_clean();
        }

        $test = [
            ['red', 'green', 'yellow', 'test'],
            ['red1', 'green1', 'yellow1', 'test1']
        ];
        foreach ($test as $item) {
            $row = [];
            foreach ($item as $field) {
                $field = (string) $field;
                if (false !== strpbrk($field, ",\"\r\n")) {
                    $row[] = '"' . str_replace('"', '""', $field) . '"';
                } else {
                    $row[] = $field;
                }
            }
            // CSV cell values are escaped above; response is text/csv, not HTML.
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            echo implode(',', $row) . "\r\n";
        }
        exit;
    }
}

$sfbuilder_submition = new SFBuilder_Pro_Form_Submition();
$sfbuilder_date_query = $sfbuilder_submition->sunformbuilder_get_time_filter();

// Read-only listing/filter parameters (sorting, paging, filtering).
// A nonce is not required here — WP core follows the same pattern in WP_List_Table.
// Values are sanitized and validated against whitelists below.
// phpcs:disable WordPress.Security.NonceVerification.Recommended

$sfbuilder_orderby_raw = !empty($_GET['orderby']) ? sanitize_key(wp_unslash($_GET['orderby'])) : '';
$sfbuilder_orderby     = $sfbuilder_orderby_raw !== '' ? $sfbuilder_orderby_raw : 'DESC';

$sfbuilder_order_raw = !empty($_GET['order']) ? strtoupper(sanitize_key(wp_unslash($_GET['order']))) : '';
$sfbuilder_order     = in_array($sfbuilder_order_raw, ['ASC', 'DESC'], true) ? $sfbuilder_order_raw : 'ID';

$sfbuilder_paged = !empty($_GET['paged']) ? max(1, absint(wp_unslash($_GET['paged']))) : 1;

$sfbuilder_post_status_raw = !empty($_GET['post_status']) ? sanitize_key(wp_unslash($_GET['post_status'])) : '';
$sfbuilder_post_status     = in_array($sfbuilder_post_status_raw, ['publish', 'trash'], true) ? $sfbuilder_post_status_raw : 'publish';

$sfbuilder_date  = !empty($_GET['date'])    ? sanitize_text_field(wp_unslash($_GET['date']))    : false;
$sfbuilder_title = !empty($_GET['form_id']) ? sanitize_text_field(wp_unslash($_GET['form_id'])) : false;

$sfbuilder_form_ids = $sfbuilder_submition->sunformbuilder_get_form_ids($sfbuilder_post_status, $sfbuilder_order, $sfbuilder_orderby);

$sfbuilder_submit_id = !empty($_GET['id']) ? absint(wp_unslash($_GET['id'])) : '';

$sfbuilder_order_sort   = $sfbuilder_order == 'desc' ? 'asc' : 'desc';
$sfbuilder_data_action  = $sfbuilder_post_status == 'publish' ? 'trash' : 'delete';
$sfbuilder_label_action = $sfbuilder_post_status == 'publish' ? 'Trash' : 'Delete Permanently';

$sfbuilder_export = !empty($_GET['action']);
$sfbuilder_export === true ? $sfbuilder_submition->sun_export_form_submissions($sfbuilder_post_status) : '';

$sfbuilder_date_selected = !empty($_GET['date'])    ? sanitize_text_field(wp_unslash($_GET['date']))    : '0';
$sfbuilder_form_selected = !empty($_GET['form_id']) ? sanitize_text_field(wp_unslash($_GET['form_id'])) : '0';

$sfbuilder_submissions_base_url = admin_url('edit.php?post_type=sun_forms&page=sunformbuilder_submissions');
$sfbuilder_submissions_list_url = add_query_arg(
    array_filter([
        'post_status' => $sfbuilder_post_status,
        'date'        => $sfbuilder_date ?: null,
        'form_id'     => $sfbuilder_title ?: null,
    ]),
    $sfbuilder_submissions_base_url
);

$sfbuilder_form_data = $sfbuilder_submition->sunformbuilder_get_submissions(
    $sfbuilder_orderby,
    $sfbuilder_order,
    $sfbuilder_paged,
    $sfbuilder_post_status,
    $sfbuilder_date,
    $sfbuilder_title,
    $sfbuilder_submissions_list_url
);

// phpcs:enable WordPress.Security.NonceVerification.Recommended
?>
<?php //die('1221'); ?>
<?php if(empty($sfbuilder_submit_id)){ ?>
<div class="wpformbuilder-form-submit-data wrap">
<h1 class="wp-heading-inline">Form Submissions</h1>
<a href="<?php echo esc_url(add_query_arg(['action' => 'export_form_submissions', 'post_status' => $sfbuilder_post_status], $sfbuilder_submissions_base_url)); ?>" id="sun-export-from-submissions" data-post-status="<?php echo esc_attr($sfbuilder_post_status); ?>" class="page-title-action">Export</a>
    <div class="wpformbuilder-form-submit-data-body">
        <form id="posts-submissions">
        <ul class="subsubsub">
            <li class="all"><a href="<?php echo esc_url(add_query_arg('post_status', 'publish', $sfbuilder_submissions_base_url)); ?>" class="<?php echo esc_attr($sfbuilder_post_status == 'publish' ? 'current' : 'no-current'); ?>">All <span class="count">(<?php echo esc_html($sfbuilder_submition->get_total_item_submissions()); ?>)</span></a> |</li>
            <li class="trash"><a href="<?php echo esc_url(add_query_arg('post_status', 'trash', $sfbuilder_submissions_base_url)); ?>" class="<?php echo esc_attr($sfbuilder_post_status != 'publish' ? 'current' : 'no-current'); ?>">Trash <span class="count">(<?php echo esc_html($sfbuilder_submition->get_total_item_trash_submissions()); ?>)</span></a></li>
        </ul>
            <div class="tablenav top">
                <div class="alignleft actions bulkactions">
                    <label for="bulk-action-selector-top" class="screen-reader-text">Select bulk action</label>
                    <select name="action" id="bulk-action-selector-top">
                        <?php if($sfbuilder_post_status == 'publish'){ ?>
                            <option value="-1">Bulk Actions</option>
                            <option value="trash">Move to Trash</option>
                        <?php }else{ ?>
                            <option value="-1">Bulk Actions</option>
                            <option value="restore">Restore</option>
                            <option value="delete">Delete Permanently</option>
                        <?php } ?>

                    </select>
                    <input type="submit" id="doaction" class="button action" value="Apply">
                </div>
                <div class="alignleft actions" id="sun-filter-submissions">
                    <select name="form_id" id="filter-by-form-id">
                        <?php foreach($sfbuilder_form_ids as $sfbuilder_key => $sfbuilder_val):
                            if($sfbuilder_key == $sfbuilder_form_selected){
                                echo '<option selected="selected" value="' . esc_attr($sfbuilder_key) . '">' . esc_html($sfbuilder_val) . '</option>';
                            }else{
                                echo '<option value="' . esc_attr($sfbuilder_key) . '">' . esc_html($sfbuilder_val) . '</option>';
                            }
                        ?>
                        <?php endforeach; ?>
                    </select>
                    <label for="filter-by-date" class="screen-reader-text">Filter by date</label>
                    <select name="m" id="filter-by-date">
                        <?php foreach($sfbuilder_date_query as $sfbuilder_key => $sfbuilder_val):
                            if($sfbuilder_val == $sfbuilder_date_selected){
                                echo '<option selected="selected" value="' . esc_attr($sfbuilder_val) . '">' . esc_html($sfbuilder_key) . '</option>';
                            }else{
                                echo '<option value="' . esc_attr($sfbuilder_val) . '">' . esc_html($sfbuilder_key) . '</option>';
                            }
                        ?>
                        <?php endforeach; ?>
                    </select>
                    <input type="button" name="filter_action" data-post-status="<?php echo esc_attr($sfbuilder_post_status); ?>" id="post-submissions-filter" class="button" value="Filter">
                </div>
                <div class="tablenav-pages one-page"><span class="displaying-num"><?php echo esc_html($sfbuilder_submition->get_total_item_submissions()); ?> items</span>
                    <span class="pagination-links"><span class="tablenav-pages-navspan button disabled" aria-hidden="true">«</span>
                    <span class="tablenav-pages-navspan button disabled" aria-hidden="true">‹</span>
                    <span class="paging-input"><label for="current-page-selector" class="screen-reader-text">Current Page</label><input class="current-page" id="current-page-selector" type="text" name="paged" value="1" size="1" aria-describedby="table-paging"><span class="tablenav-paging-text"> of <span class="total-pages">1</span></span></span>
                    <span class="tablenav-pages-navspan button disabled" aria-hidden="true">›</span>
                    <span class="tablenav-pages-navspan button disabled" aria-hidden="true">»</span></span>
                </div>
                <br class="clear">
            </div>
            <table class="wp-list-table widefat fixed striped table-view-list posts">
                <thead>
                    <tr>
                        <td id="cb" class="manage-column column-cb check-column"><label class="screen-reader-text" for="cb-select-all-1">Select All</label><input id="cb-select-all-1" type="checkbox"></td>
                        <th scope="col" id="title" class="manage-column column-title column-primary sortable desc"><a href="<?php echo esc_url(add_query_arg(['orderby' => 'id', 'order' => strtolower($sfbuilder_order_sort), 'post_status' => $sfbuilder_post_status], $sfbuilder_submissions_base_url)); ?>"><span>ID</span><span class="sorting-indicator"></span></a></th>
                        <th scope="col" id="form_type" class="manage-column column-form_type">Email</th>
                        <th scope="col" id="date" class="manage-column sortable asc"><a href="<?php echo esc_url(add_query_arg(['orderby' => 'date', 'order' => strtolower($sfbuilder_order_sort), 'post_status' => $sfbuilder_post_status], $sfbuilder_submissions_base_url)); ?>"><span>Date</span><span class="sorting-indicator"></span></a></th>
                        <th scope="col" id="form_id" class="manage-column column-form_id">Form ID</th>
                        <th scope="col" id="status" class="manage-column column-status">Page</th>
                    </tr>
                </thead>
                <tbody id="the-list">
                    <?php if(!empty($sfbuilder_form_data['posts'])):  ?>
                    <?php foreach($sfbuilder_form_data['posts'] as $sfbuilder_key => $sfbuilder_value): ?>
                    <tr id="post-<?php echo esc_attr($sfbuilder_value->ID); ?>" class="iedit author-self level-0 post-<?php echo esc_attr($sfbuilder_value->ID); ?> status-publish hentry ast-col-sm-12 ast-article-post wpformbuilder-<?php echo esc_attr($sfbuilder_submition->sunformbuilder_get_status_read_submissions($sfbuilder_value->post_content)); ?>">
                        <th scope="row" class="check-column">
                            <input id="cb-select-<?php echo esc_attr($sfbuilder_value->ID); ?>" type="checkbox" name="post" value="<?php echo esc_attr($sfbuilder_value->ID); ?>">
                        </th>
                        <td class="title column-title has-row-actions column-primary page-title" data-colname="Title">
                            <a class="submissions-id" href="<?php echo esc_url(add_query_arg(['id' => $sfbuilder_value->ID, 'post_status' => $sfbuilder_post_status], $sfbuilder_submissions_base_url)); ?>" aria-label="“#<?php echo esc_attr($sfbuilder_value->ID); ?> (Edit)"><?php echo esc_html($sfbuilder_value->ID); ?></a>
                            <div class="row-actions submitbox">
                                <?php if($sfbuilder_post_status == 'trash'): ?>
                                    <span class="restore"><a href="javascript://" class="wpformbuilder-submittion-action" data-id="<?php echo esc_attr($sfbuilder_value->ID); ?>" data-action="restore">Restore</a> | </span>
                                <?php endif; ?>
                                <?php if($sfbuilder_post_status == 'publish'): ?>
                                    <span class="view"><a href="<?php echo esc_url(add_query_arg(['id' => $sfbuilder_value->ID, 'post_status' => $sfbuilder_post_status], $sfbuilder_submissions_base_url)); ?>" aria-label="View “#<?php echo esc_attr($sfbuilder_value->ID); ?>">View</a> | </span>
                                <?php endif; ?>
                                    <span class="trash"><a href="javascript://" class="wpformbuilder-submittion-action submitdelete" data-id="<?php echo esc_attr($sfbuilder_value->ID); ?>" data-action="<?php echo esc_attr($sfbuilder_data_action); ?>"><?php echo esc_html($sfbuilder_label_action); ?></a></span>
                            </div>
                        </td>
                        <td class="form_type column-form_type" data-colname="Email"><a href="<?php echo esc_url(add_query_arg(['id' => $sfbuilder_value->ID, 'post_status' => $sfbuilder_post_status], $sfbuilder_submissions_base_url)); ?>"><?php echo esc_html($sfbuilder_submition->sunformbuilder_get_email_submissions($sfbuilder_value->post_content)); ?></a></td>
                        <td class="date column-date" data-colname="Date"><?php
                            // Getter escapes date/time internally and joins them with a literal &nbsp; entity.
                            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                            echo $sfbuilder_submition->sunformbuilder_get_datetime_submissions($sfbuilder_value->ID);
                        ?></td>
                        <td class="form_id column-form_id" data-colname="Form ID"><?php echo esc_html($sfbuilder_submition->sunformbuilder_get_form_id_submissions($sfbuilder_value->post_content)); ?></td>
                        <?php $sfbuilder_page_info = $sfbuilder_submition->sunformbuilder_get_page_submissions($sfbuilder_value->post_content); ?>
                        <td class="status column-status" data-colname="Status"><a title="<?php echo esc_attr($sfbuilder_page_info['title'] === 'No Page' ? 'No Page' : 'View Page'); ?>" href="<?php echo esc_url($sfbuilder_page_info['url']); ?>" target="_blank"><?php echo esc_html($sfbuilder_page_info['title']); ?></a></td>
                    </tr>
                    <?php endforeach; endif ?>
                </tbody>
                <tfoot>
                    <tr>
                        <td class="manage-column column-cb check-column"><label class="screen-reader-text" for="cb-select-all-2">Select All</label><input id="cb-select-all-2" type="checkbox"></td>
                        <th scope="col" id="title" class="manage-column column-title column-primary sortable desc"><a href="<?php echo esc_url(add_query_arg(['orderby' => 'id', 'order' => strtolower($sfbuilder_order_sort), 'post_status' => $sfbuilder_post_status], $sfbuilder_submissions_base_url)); ?>"><span>ID</span><span class="sorting-indicator"></span></a></th>
                        <th scope="col" id="form_type" class="manage-column column-form_type">Email</th>
                        <th scope="col" id="date" class="manage-column sortable asc"><a href="<?php echo esc_url(add_query_arg(['orderby' => 'date', 'order' => strtolower($sfbuilder_order_sort), 'post_status' => $sfbuilder_post_status], $sfbuilder_submissions_base_url)); ?>"><span>Date</span><span class="sorting-indicator"></span></a></th>
                        <th scope="col" class="manage-column column-form-id">Form ID</th>
                        <th scope="col" class="manage-column column-status">Page</th>
                    </tr>
                </tfoot>
            </table>
            <div class="tablenav bottom">
                <div class="tablenav-pages sun-pagination-submissions">
                    <span class="displaying-num"><?php echo esc_html($sfbuilder_submition->get_total_item_submissions()); ?> items</span>
                    <?php
                    // $sfbuilder_form_data['pagination'] is HTML generated by WP core paginate_links();
                    // filter through wp_kses_post to allow anchors/spans while stripping anything unexpected.
                    echo wp_kses_post($sfbuilder_form_data['pagination']);
                    ?>
                </div>
                <br class="clear">
            </div>
        </form>
    </div>
</div>
<?php }else{
    $sfbuilder_submition->sunformbuilder_remove_read_status($sfbuilder_submit_id);
    // echo "Đã vào submit details"; die('1221');
    require_once 'submit-page-details.php';
}