const { __ } = wp.i18n;
const { useMemo } = wp.element;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalNumberControl, __experimentalInputControl, ToggleControl, Button, Icon } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { handleChangeApiSettings, WPFormbuilderGetAPIData } from '../../../../integrations.js';
import RepeaterGoogleSheets from './google-sheets-repeater.js';
import './google-sheets.css';

const GoogleSheetsApiControl = ({ attributes, setAttributes }) => {

    // const fieldOptions = useMemo(() => {
    //     const fields = attributes?.fields ?? [];
    //     let options = [{ 'label': '-- Select Field --', value: '', disabled: true }];
    //     for (const field of fields) {
    //         console.log('field?.label: ', field?.label);
    //         options.push({ label: field?.label.trim() || field?.name, value: field?.name });
    //     }
    //     options.push({ label: 'Custom Value', value: 'custom_value' });
    //     return options;
    // }, [attributes?.fields]);
    console.log('sfbuilder_js_data: ', sfbuilder_js_data);

    return (
        <>
            {sfbuilder_js_data?.api?.google_sheets && (
                <>
                    <__experimentalInputControl
                        label="Sheet ID"
                        labelPosition="edge"
                        value={attributes?.action_submit_settings?.google_sheets?.id}
                        type="text"
                        onChange={(newValue) => handleChangeApiSettings('google_sheets', 'id', newValue, attributes, setAttributes)}
                        className="wpformbuilder-google-section"
                    />
                    <__experimentalInputControl
                        label="Tab Name"
                        labelPosition="edge"
                        value={attributes?.action_submit_settings?.google_sheets?.tab_name}
                        type="text"
                        onChange={(newValue) => handleChangeApiSettings('google_sheets', 'tab_name', newValue, attributes, setAttributes)}
                        className="wpformbuilder-google-section"
                    />
                    <RepeaterGoogleSheets
                        value={attributes?.action_submit_settings?.google_sheets?.mappings ?? []}
                        onChange={(newVal) => handleChangeApiSettings('google_sheets', 'mappings', newVal, attributes, setAttributes)}
                        attributes={attributes}
                    />
                </>
            )}

            {!sfbuilder_js_data?.api?.google_sheets && (
                <Notice isDismissible={false} status="warning">Please get Google Sheets token in <em>Dashboard &gt; WP Form Builder &gt; Settings &gt; Integrations &gt; Google Sheets</em> or <a href={sfbuilder_js_data?.admin_url + 'admin.php?page=sunformbuilder_settings#google-sheets'} target="_blank">here</a>.</Notice>
            )}
        </>
    );
}
export default GoogleSheetsApiControl;