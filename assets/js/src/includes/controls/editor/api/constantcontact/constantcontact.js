const { __ } = wp.i18n;
const { useMemo } = wp.element;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalNumberControl, __experimentalInputControl, ToggleControl, Button, Icon } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { handleChangeApiSettings, WPFormbuilderGetAPIData } from '../../../../integrations.js';
import RepeaterConstantcontact from './constantcontact-repeater.js';
import './constantcontact.css';
import { help } from '@wordpress/icons';

const ConstantcontactApiControl = ({ attributes, setAttributes }) => {

    const handleChangeGroupMailchimp = (labels) => {
        labels = labels ?? [];
        let groups = attributes?.action_submit_settings?.constantcontact?.groups ?? {};
        let value = [];
        for (const label of labels) {
            if (groups.hasOwnProperty(label)) {
                value.push(groups?.[label]);
            }
        }
        setAttributes({
            action_submit_settings: {
                ...attributes?.action_submit_settings,
                constantcontact: {
                    ...attributes?.action_submit_settings?.constantcontact,
                    groups_id_selected: value
                }
            }
        });
    }

    const fieldOptions = useMemo(() => {
        const fields = attributes?.fields ?? [];
        let options = [{ 'label': '-- Select Field --', value: '', disabled: true }];
        for (const field of fields) {
            options.push({ label: field?.label.trim() || field?.name, value: field?.name });
        }
        options.push({ label: 'Custom Value', value: 'custom_value' });
        return options;
    }, [attributes?.fields]);

    return (
        // Làm acceptance_field, update contact, send confirm email
        <>
            {sfbuilder_js_data?.api?.constantcontact && (
                <>
                    <Flex style={{ 'margin-bottom': '13px' }}>
                        <FlexItem>
                            <label>Update Contacts?</label>
                        </FlexItem>
                        <FlexItem className="wpformbuilder-no-margin-bootom">
                            <ToggleControl
                                __nextHasNoMarginBottom={true}
                                checked={attributes?.action_submit_settings?.constantcontact?.update_contact ?? false}
                                onChange={(toogle) => handleChangeApiSettings('constantcontact', 'update_contact', toogle, attributes, setAttributes)}
                            />
                        </FlexItem>
                    </Flex>
                    <Flex style={{ 'margin-bottom': '13px' }}>
                        <FlexItem>
                            <label>Acceptance Field?</label>
                        </FlexItem>
                        <FlexItem className="wpformbuilder-no-margin-bootom">
                            <ToggleControl
                                __nextHasNoMarginBottom={true}
                                checked={attributes?.action_submit_settings?.constantcontact?.acceptance_field ?? false}
                                onChange={(toogle) => handleChangeApiSettings('constantcontact', 'acceptance_field', toogle, attributes, setAttributes)}
                            />
                        </FlexItem>
                    </Flex>
                    {attributes?.action_submit_settings?.constantcontact?.acceptance_field && (
                        <SelectControl
                            label="Apply to Field (acceptance)"
                            value={attributes?.action_submit_settings?.constantcontact?.acceptance_value ?? fieldOptions?.[0]?.value}
                            options={fieldOptions}
                            onChange={(val) => handleChangeApiSettings('constantcontact', 'acceptance_value', val, attributes, setAttributes)}
                        />
                    )}
                    {attributes?.action_submit_settings?.constantcontact?.list_ids && (
                        <>
                            <BaseControl
                                help={attributes?.action_submit_settings?.constantcontact?.list_help_text}
                                label={
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                                        <span className='wpformbuilder-mailchimp-list-id'>List ID</span>
                                        <Button
                                            variant="primary"
                                            className="wpformbuilder-reload-api-data"
                                            style={{ width: '25px', height: '25px' }}
                                            title="Reload data constantcontact"
                                            onClick={async () => await WPFormbuilderGetAPIData('constantcontact', attributes, setAttributes)}
                                            icon={<FontAwesomeIcon icon={faSync} spin={attributes?.action_submit_settings?.constantcontact?.loading} className='wpformbuilder-reset-data-mailchimp' />}
                                        >
                                        </Button>

                                    </span>
                                }>
                                <SelectControl
                                    value={attributes?.action_submit_settings?.constantcontact?.list_id_selected ?? attributes?.action_submit_settings?.constantcontact?.list_ids?.[0]?.value}
                                    options={attributes?.action_submit_settings?.constantcontact?.list_ids ?? []}
                                    onChange={(val) => handleChangeApiSettings('constantcontact', 'list_id_selected', val, attributes, setAttributes)}
                                />
                            </BaseControl>
                            {(attributes?.action_submit_settings?.constantcontact?.list_id_selected && attributes?.action_submit_settings?.constantcontact?.fields) && (
                                <RepeaterConstantcontact
                                    value={attributes?.action_submit_settings?.constantcontact?.mappings ?? []}
                                    onChange={(newVal) => handleChangeApiSettings('constantcontact', 'mappings', newVal, attributes, setAttributes)}
                                    attributes={attributes}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            {!sfbuilder_js_data?.api?.constantcontact && (
                <Notice isDismissible={false} status="warning">Please get Constantcontact token in <em>Dashboard &gt; WP Form Builder &gt; Settings &gt; Integrations &gt; Constantcontact</em> or <a href={sfbuilder_js_data?.admin_url + 'admin.php?page=sunformbuilder_settings#constant-contact'} target="_blank">here</a>.</Notice>
            )}
        </>
    );
}
export default ConstantcontactApiControl;