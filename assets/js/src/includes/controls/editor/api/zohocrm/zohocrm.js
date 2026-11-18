const { __ } = wp.i18n;
const { useMemo, useEffect } = wp.element;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalNumberControl, __experimentalInputControl, ToggleControl, Button, Icon } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { handleChangeApiSettings, WPFormbuilderGetAPIData } from '../../../../integrations.js';
import RepeaterZohoCRM from './zohocrm-repeater.js';
import './zohocrm.css';

const ZohoCRMApiControl = ({ attributes, setAttributes }) => {

    const handleChangeModuleSettings = (newValue) => {
        const newAttributes = {
            ...attributes,
            action_submit_settings: {
                ...attributes.action_submit_settings,
                zohocrm: {
                    ...attributes.action_submit_settings?.zohocrm,
                    module_selected: newValue
                }
            }
        };
        setAttributes(newAttributes);
        WPFormbuilderGetAPIData('zohocrm', newAttributes, setAttributes);
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
            {sfbuilder_js_data?.api?.zohocrm && (
                <>
                    <SelectControl
                        label="Zoho Module"
                        value={attributes?.action_submit_settings?.zohocrm?.module_selected ?? ''}
                        options={attributes?.action_submit_settings?.zohocrm?.module}
                        labelPosition="edge"
                        className="wpformbuilder-heading-select"
                        onChange={(newValue) => handleChangeModuleSettings(newValue)}
                    />
                    {attributes?.action_submit_settings?.zohocrm?.module_selected && (
                        <>
                            <BaseControl
                                label={
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'space-between' }}>
                                        <span className='wpformbuilder-mailchimp-list-id'>Get Fields</span>
                                        <Button
                                            variant="primary"
                                            className="wpformbuilder-reload-api-data"
                                            style={{ width: '25px', height: '25px' }}
                                            title="Reload fields zohocrm"
                                            onClick={async () => await WPFormbuilderGetAPIData('zohocrm', attributes, setAttributes)}
                                            icon={<FontAwesomeIcon icon={faSync} spin={attributes?.action_submit_settings?.zohocrm?.loading} className='wpformbuilder-reset-data-mailchimp' />}
                                        >
                                        </Button>
                                    </span>
                                }
                                help={attributes?.action_submit_settings?.zohocrm?.helper_text_field || ''}
                            >
                            </BaseControl>
                            <Flex style={{ 'margin-bottom': '13px' }}>
                                <FlexItem>
                                    <label>Acceptance Field?</label>
                                </FlexItem>
                                <FlexItem className="wpformbuilder-no-margin-bootom">
                                    <ToggleControl
                                        __nextHasNoMarginBottom={true}
                                        checked={attributes?.action_submit_settings?.zohocrm?.acceptance_field ?? false}
                                        onChange={(toogle) => handleChangeApiSettings('zohocrm', 'acceptance_field', toogle, attributes, setAttributes)}
                                    />
                                </FlexItem>
                            </Flex>
                            {attributes?.action_submit_settings?.zohocrm?.acceptance_field && (
                                <SelectControl
                                    label="Apply to Field (acceptance)"
                                    value={attributes?.action_submit_settings?.zohocrm?.acceptance_value ?? fieldOptions?.[0]?.value}
                                    options={fieldOptions}
                                    onChange={(val) => handleChangeApiSettings('zohocrm', 'acceptance_value', val, attributes, setAttributes)}
                                />
                            )}
                            {attributes?.action_submit_settings?.zohocrm?.fields?.[attributes?.action_submit_settings?.zohocrm?.module_selected]?.length && (
                                <RepeaterZohoCRM
                                    value={attributes?.action_submit_settings?.zohocrm?.mappings?.[attributes?.action_submit_settings?.zohocrm?.module_selected] ?? []}
                                    onChange={(newArray) => {
                                        setAttributes({
                                            action_submit_settings: {
                                                ...attributes.action_submit_settings,
                                                zohocrm: {
                                                    ...attributes.action_submit_settings.zohocrm,
                                                    mappings: {
                                                        ...attributes.action_submit_settings.zohocrm.mappings,
                                                        [[attributes?.action_submit_settings?.zohocrm?.module_selected]]: newArray,
                                                    },
                                                },
                                            },
                                        });
                                    }}
                                    attributes={attributes}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            {!sfbuilder_js_data?.api?.zohocrm && (
                <Notice isDismissible={false} status="warning">Please get Zoho CRM token in <em>Dashboard &gt; WP Form Builder &gt; Settings &gt; Integrations &gt; Zoho CRM</em> or <a href={sfbuilder_js_data?.admin_url + 'admin.php?page=sunformbuilder_settings#zohocrm'} target="_blank">here</a>.</Notice>
            )}
        </>
    );
}
export default ZohoCRMApiControl;