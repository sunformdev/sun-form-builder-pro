const { __ } = wp.i18n;
const { useMemo } = wp.element;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalNumberControl, __experimentalInputControl, ToggleControl, Button, Icon } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { handleChangeApiSettings, WPFormbuilderGetAPIData } from '../../../../integrations.js';
import RepeaterMailerlite from './mailerlite-repeater.js';
import './mailerlite.css';

const MailerliteApiControl = ({ attributes, setAttributes }) => {

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
                value={attributes?.action_submit_settings?.mailerlite?.type ?? 'default'}
                options={[
                    { label: 'Default', value: 'default' },
                    { label: 'Custom', value: 'custom' }
                ]}
                labelPosition="edge"
                className="wpformbuilder-heading-select"
                onChange={(newValue) => handleChangeApiSettings('mailerlite', 'type', newValue, attributes, setAttributes)}
            />
            {attributes?.action_submit_settings?.mailerlite?.type === 'custom' && (
                <>
                    <__experimentalInputControl
                        label="Access Token"
                        labelPosition="edge"
                        value={attributes?.action_submit_settings?.mailerlite?.api_key_cusom}
                        type="text"
                        onChange={(newValue) => handleChangeApiSettings('mailerlite', 'api_key_cusom', newValue, attributes, setAttributes)}
                    />
                </>
            )}
            {(sfbuilder_js_data?.api?.mailerlite || attributes?.action_submit_settings?.mailerlite?.api_key_cusom) && (
                <>
                    <Flex style={{ 'margin-bottom': '13px' }}>
                        <FlexItem>
                            <label>Update Contacts?</label>
                        </FlexItem>
                        <FlexItem className="wpformbuilder-no-margin-bootom">
                            <ToggleControl
                                __nextHasNoMarginBottom={true}
                                checked={attributes?.action_submit_settings?.mailerlite?.update_contact ?? false}
                                onChange={(toogle) => handleChangeApiSettings('mailerlite', 'update_contact', toogle, attributes, setAttributes)}
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
                                checked={attributes?.action_submit_settings?.mailerlite?.acceptance_field ?? false}
                                onChange={(toogle) => handleChangeApiSettings('mailerlite', 'acceptance_field', toogle, attributes, setAttributes)}
                            />
                        </FlexItem>
                    </Flex>
                    {attributes?.action_submit_settings?.mailerlite?.acceptance_field && (
                        <SelectControl
                            label="Apply to Field (acceptance)"
                            value={attributes?.action_submit_settings?.mailerlite?.acceptance_value ?? fieldOptions?.[0]?.value}
                            options={fieldOptions}
                            onChange={(val) => handleChangeApiSettings('mailerlite', 'acceptance_value', val, attributes, setAttributes)}
                        />
                    )}
                    {attributes?.action_submit_settings?.mailerlite?.list_ids && (
                        <>
                            <BaseControl
                                help={attributes?.action_submit_settings?.mailerlite?.list_help_text}
                                label={
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                                        <span className='wpformbuilder-mailchimp-list-id'>Group ID</span>
                                        <Button
                                            variant="primary"
                                            className="wpformbuilder-reload-api-data"
                                            style={{ width: '25px', height: '25px' }}
                                            title="Reload data mailerlite"
                                            onClick={async () => await WPFormbuilderGetAPIData('mailerlite', attributes, setAttributes)}
                                            icon={<FontAwesomeIcon icon={faSync} spin={attributes?.action_submit_settings?.mailerlite?.loading} className='wpformbuilder-reset-data-mailchimp' />}
                                        >
                                        </Button>
                                    </span>
                                }

                            >
                                <SelectControl
                                    value={attributes?.action_submit_settings?.mailerlite?.list_id_selected ?? attributes?.action_submit_settings?.mailerlite?.list_ids?.[0]?.value}
                                    options={attributes?.action_submit_settings?.mailerlite?.list_ids ?? []}
                                    onChange={(val) => handleChangeApiSettings('mailerlite', 'list_id_selected', val, attributes, setAttributes)}
                                />
                            </BaseControl>
                            {(attributes?.action_submit_settings?.mailerlite?.list_id_selected && attributes?.action_submit_settings?.mailerlite?.fields) && (
                                <RepeaterMailerlite
                                    value={attributes?.action_submit_settings?.mailerlite?.mappings ?? []}
                                    onChange={(newVal) => handleChangeApiSettings('mailerlite', 'mappings', newVal, attributes, setAttributes)}
                                    attributes={attributes}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            {!sfbuilder_js_data?.api?.mailerlite && attributes?.action_submit_settings?.mailerlite?.type === 'default' && (
                <Notice isDismissible={false} status="warning">Set your Mailerlite API credentials in the Integrations settings. You can also set a different Mailerlite API credentials by choosing "Custom".</Notice>
            )}
        </>
    );
}
export default MailerliteApiControl;