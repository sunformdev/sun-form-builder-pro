const { __ } = wp.i18n;
const { useMemo } = wp.element;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalNumberControl, __experimentalInputControl, ToggleControl, Button, Icon } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { handleChangeApiSettings, WPFormbuilderGetAPIData } from '../../../../integrations.js';
import RepeaterMailchimp from './mailchimp-repeater.js';
import './mailchimp.css';
import { help } from '@wordpress/icons';

const MailchimpApiControl = ({ attributes, setAttributes }) => {

    const getGroupsMailchimpValue = (group_seclect) => {
        if (group_seclect.length) {
            let groups = attributes?.action_submit_settings?.mailchimp?.groups ?? []
            let groupsLabel = [];
            for (const group in groups) {
                if (group_seclect.includes(groups?.[group])) {
                    groupsLabel.push(group);
                }
            }
            return groupsLabel;
        }
    }

    const handleChangeGroupMailchimp = (labels) => {
        labels = labels ?? [];
        let groups = attributes?.action_submit_settings?.mailchimp?.groups ?? {};
        let value = [];
        for (const label of labels) {
            if (groups.hasOwnProperty(label)) {
                value.push(groups?.[label]);
            }
        }
        setAttributes({
            action_submit_settings: {
                ...attributes?.action_submit_settings,
                mailchimp: {
                    ...attributes?.action_submit_settings?.mailchimp,
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
        <>
            <SelectControl
                label="API Type"
                value={attributes?.action_submit_settings?.mailchimp?.type ?? 'default'}
                options={[
                    { label: 'Default', value: 'default' },
                    { label: 'Custom', value: 'custom' }
                ]}
                labelPosition="edge"
                className="wpformbuilder-heading-select"
                onChange={(newValue) => handleChangeApiSettings('mailchimp', 'type', newValue, attributes, setAttributes)}
            />
            {attributes?.action_submit_settings?.mailchimp?.type === 'custom' && (
                <__experimentalInputControl
                    label="Api Key"
                    labelPosition="edge"
                    value={attributes?.action_submit_settings?.mailchimp?.api_key_cusom}
                    type="text"
                    onChange={(newValue) => handleChangeApiSettings('mailchimp', 'api_key_cusom', newValue, attributes, setAttributes)}
                />
            )}
            {(sfbuilder_js_data?.api?.mailchimp || attributes?.action_submit_settings?.mailchimp?.api_key_cusom) && (
                <>
                    <Flex style={{ 'margin-bottom': '13px' }}>
                        <FlexItem>
                            <label>Send Confirm Email?</label>
                        </FlexItem>
                        <FlexItem className="wpformbuilder-no-margin-bootom">
                            <ToggleControl
                                __nextHasNoMarginBottom={true}
                                checked={attributes?.action_submit_settings?.mailchimp?.send_confirm_email ?? false}
                                onChange={(newValue) => handleChangeApiSettings('mailchimp', 'send_confirm_email', newValue, attributes, setAttributes)}
                            />
                        </FlexItem>
                    </Flex>
                    <Flex style={{ 'margin-bottom': '13px' }}>
                        <FlexItem>
                            <label>Update Contacts?</label>
                        </FlexItem>
                        <FlexItem className="wpformbuilder-no-margin-bootom">
                            <ToggleControl
                                __nextHasNoMarginBottom={true}
                                checked={attributes?.action_submit_settings?.mailchimp?.update_contact ?? false}
                                onChange={(toogle) => handleChangeApiSettings('mailchimp', 'update_contact', toogle, attributes, setAttributes)}
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
                                checked={attributes?.action_submit_settings?.mailchimp?.acceptance_field ?? false}
                                onChange={(toogle) => handleChangeApiSettings('mailchimp', 'acceptance_field', toogle, attributes, setAttributes)}
                            />
                        </FlexItem>
                    </Flex>
                    {attributes?.action_submit_settings?.mailchimp?.acceptance_field && (
                        <SelectControl
                            label="Apply to Field (acceptance)"
                            value={attributes?.action_submit_settings?.mailchimp?.acceptance_value ?? fieldOptions?.[0]?.value}
                            options={fieldOptions}
                            onChange={(val) => handleChangeApiSettings('mailchimp', 'acceptance_value', val, attributes, setAttributes)}
                        />
                    )}
                    {attributes?.action_submit_settings?.mailchimp?.list_ids && (
                        <>
                            <BaseControl
                                help={attributes?.action_submit_settings?.mailchimp?.list_help_text}
                                label={
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                                        <span className='wpformbuilder-mailchimp-list-id'>List ID</span>
                                        <Button
                                            variant="primary"
                                            className="wpformbuilder-reload-api-data"
                                            style={{ width: '25px', height: '25px' }}
                                            title="Reload data mailchimp"
                                            onClick={async () => await WPFormbuilderGetAPIData('mailchimp', attributes, setAttributes)}
                                            icon={<FontAwesomeIcon icon={faSync} spin={attributes?.action_submit_settings?.mailchimp?.loading} className='wpformbuilder-reset-data-mailchimp' />}
                                        >
                                        </Button>

                                    </span>
                                }>
                                <SelectControl
                                    value={attributes?.action_submit_settings?.mailchimp?.list_id_selected ?? attributes?.action_submit_settings?.mailchimp?.list_ids?.[0]?.value}
                                    options={attributes?.action_submit_settings?.mailchimp?.list_ids ?? []}
                                    onChange={(val) => handleChangeApiSettings('mailchimp', 'list_id_selected', val, attributes, setAttributes, true)}
                                />
                            </BaseControl>
                            {attributes?.action_submit_settings?.mailchimp?.groups &&
                                Object.keys(attributes.action_submit_settings.mailchimp.groups).length > 0 && (
                                    <FormTokenField
                                        className={'wpformbuilder-group-mailchimp'}
                                        __experimentalExpandOnFocus
                                        __next40pxDefaultSize
                                        label="Groups"
                                        onChange={(labels) => handleChangeGroupMailchimp(labels)}
                                        suggestions={attributes?.action_submit_settings?.mailchimp?.groups ? Object.keys(attributes?.action_submit_settings?.mailchimp?.groups) : []}
                                        value={getGroupsMailchimpValue(attributes?.action_submit_settings?.mailchimp?.groups_id_selected ?? false)}
                                        __experimentalShowHowTo={false}
                                    />
                                )}
                            {(attributes?.action_submit_settings?.mailchimp?.list_id_selected && attributes?.action_submit_settings?.mailchimp?.fields) && (
                                <RepeaterMailchimp
                                    value={attributes?.action_submit_settings?.mailchimp?.mappings ?? []}
                                    onChange={(newVal) => handleChangeApiSettings('mailchimp', 'mappings', newVal, attributes, setAttributes)}
                                    attributes={attributes}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            {!sfbuilder_js_data?.api?.mailchimp && attributes?.action_submit_settings?.mailchimp?.type === 'default' && (
                <Notice isDismissible={false} status="warning">Set your Mailchimp API credentials in the Integrations settings. You can also set a different Mailchimp API credentials by choosing "Custom".</Notice>
            )}
        </>
    );
}
export default MailchimpApiControl;