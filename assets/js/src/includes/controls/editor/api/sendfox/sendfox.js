const { __ } = wp.i18n;
const { useMemo } = wp.element;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalNumberControl, __experimentalInputControl, ToggleControl, Button, Icon } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { handleChangeApiSettings, WPFormbuilderGetAPIData } from '../../../../integrations.js';
import RepeaterSendFox from './sendfox-repeater.js';
import './sendfox.css';

const SendFoxApiControl = ({ attributes, setAttributes }) => {

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
                value={attributes?.action_submit_settings?.sendfox?.type ?? 'default'}
                options={[
                    { label: 'Default', value: 'default' },
                    { label: 'Custom', value: 'custom' }
                ]}
                labelPosition="edge"
                className="wpformbuilder-heading-select"
                onChange={(newValue) => handleChangeApiSettings('sendfox', 'type', newValue, attributes, setAttributes)}
            />
            {attributes?.action_submit_settings?.sendfox?.type === 'custom' && (
                <>
                    <__experimentalInputControl
                        label="Access Token"
                        labelPosition="edge"
                        value={attributes?.action_submit_settings?.sendfox?.api_key_cusom}
                        type="text"
                        onChange={(newValue) => handleChangeApiSettings('sendfox', 'api_key_cusom', newValue, attributes, setAttributes)}
                    />
                </>
            )}
            {(sfbuilder_js_data?.api?.sendfox || attributes?.action_submit_settings?.sendfox?.api_key_cusom) && (
                <>
                    <Flex style={{ 'margin-bottom': '13px' }}>
                        <FlexItem>
                            <label>Acceptance Field?</label>
                        </FlexItem>
                        <FlexItem className="wpformbuilder-no-margin-bootom">
                            <ToggleControl
                                __nextHasNoMarginBottom={true}
                                checked={attributes?.action_submit_settings?.sendfox?.acceptance_field ?? false}
                                onChange={(toogle) => handleChangeApiSettings('sendfox', 'acceptance_field', toogle, attributes, setAttributes)}
                            />
                        </FlexItem>
                    </Flex>
                    {attributes?.action_submit_settings?.sendfox?.acceptance_field && (
                        <SelectControl
                            label="Apply to Field (acceptance)"
                            value={attributes?.action_submit_settings?.sendfox?.acceptance_value ?? fieldOptions?.[0]?.value}
                            options={fieldOptions}
                            onChange={(val) => handleChangeApiSettings('sendfox', 'acceptance_value', val, attributes, setAttributes)}
                        />
                    )}
                    {attributes?.action_submit_settings?.sendfox?.list_ids && (
                        <>
                            <BaseControl
                            help={attributes?.action_submit_settings?.sendfox?.list_help_text}
                            label={
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                                    <span className='wpformbuilder-mailchimp-list-id'>List ID</span>
                                    <Button
                                        variant="primary"
                                        className="wpformbuilder-reload-api-data"
                                        style={{ width: '25px', height: '25px' }}
                                        title="Reload data sendfox"
                                        onClick={async () => await WPFormbuilderGetAPIData('sendfox', attributes, setAttributes)}
                                        icon={<FontAwesomeIcon icon={faSync} spin={attributes?.action_submit_settings?.sendfox?.loading} className='wpformbuilder-reset-data-mailchimp' />}
                                    >
                                    </Button>
                                </span>
                            }
                            
                            >
                                <SelectControl
                                    value={attributes?.action_submit_settings?.sendfox?.list_id_selected ?? attributes?.action_submit_settings?.sendfox?.list_ids?.[0]?.value}
                                    options={attributes?.action_submit_settings?.sendfox?.list_ids ?? []}
                                    onChange={(val) => handleChangeApiSettings('sendfox', 'list_id_selected', val, attributes, setAttributes)}
                                />
                            </BaseControl>
                            {(attributes?.action_submit_settings?.sendfox?.list_id_selected && attributes?.action_submit_settings?.sendfox?.fields) && (
                                <RepeaterSendFox
                                    value={attributes?.action_submit_settings?.sendfox?.mappings ?? []}
                                    onChange={(newVal) => handleChangeApiSettings('sendfox', 'mappings', newVal, attributes, setAttributes)}
                                    attributes={attributes}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            {!sfbuilder_js_data?.api?.sendfox && attributes?.action_submit_settings?.sendfox?.type === 'default' && (
                <Notice isDismissible={false} status="warning">Set your SendFox API credentials in the Integrations settings. You can also set a different SendFox API credentials by choosing "Custom".</Notice>
            )}
        </>
    );
}
export default SendFoxApiControl;