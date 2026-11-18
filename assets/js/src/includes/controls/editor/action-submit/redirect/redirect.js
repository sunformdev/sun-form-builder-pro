const { __ } = wp.i18n;
const { useMemo } = wp.element;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalNumberControl, __experimentalInputControl, ToggleControl, Button, Icon } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { handleChangeApiSettings, WPFormbuilderGetAPIData } from '../../../../integrations.js';
import RepeaterRedirect from './redirect-repeater.js';
import WPFrombuilderSelect2 from '../../select2/select2.js';
import './redirect.css';

const RedirectControl = ({ attributes, setAttributes }) => {

    const fieldOptions = useMemo(() => {
        const fields = attributes?.fields ?? [];
        let options = [];
        for (const field of fields) {
            options.push({ label: field?.label.trim() || field?.name, value: field?.name });
        }
        options.push({ label: 'Custom Value', value: 'custom_value' });
        return options;
    }, [attributes?.fields]);
    console.log('fieldOptions: ', fieldOptions);

    const getLabelsFromValues = (values = [], options = []) => {
        return values
            .map(value => options.find(o => o.value === value)?.label)
            .filter(Boolean);
    };

    const updateRedirectSettings = (patch) => {
        setAttributes((prev) => {
            const prevRedirect =
                prev?.action_submit_settings?.redirect ?? {};

            return {
                ...prev,
                action_submit_settings: {
                    ...prev.action_submit_settings,
                    redirect: {
                        ...prevRedirect,
                        ...patch,
                    },
                },
            };
        });
    };

    return (
        <>
            <__experimentalInputControl
                label="Redirect To"
                labelPosition="top"
                placeholder="https://your-link.com"
                value={attributes?.action_submit_settings?.redirect?.link_to || ''}
                onChange={(val) => handleChangeApiSettings('redirect', 'link_to', val, attributes, setAttributes)}
            />
            <Flex style={{ 'margin-bottom': '13px' }}>
                <FlexItem>
                    <label>Open In New Tab</label>
                </FlexItem>
                <FlexItem className="wpformbuilder-no-margin-bootom">
                    <ToggleControl
                        __nextHasNoMarginBottom={true}
                        checked={attributes?.action_submit_settings?.redirect?.open_in_new_tab ?? true}
                        onChange={(toogle) => handleChangeApiSettings('redirect', 'open_in_new_tab', toogle, attributes, setAttributes)}
                    />
                </FlexItem>
            </Flex>
            <Flex style={{ 'margin-bottom': '13px' }}>
                <FlexItem>
                    <label>URL Parameter</label>
                </FlexItem>
                <FlexItem className="wpformbuilder-no-margin-bootom">
                    <ToggleControl
                        __nextHasNoMarginBottom={true}
                        checked={attributes?.action_submit_settings?.redirect?.url_parameter ?? true}
                        onChange={(toogle) => handleChangeApiSettings('redirect', 'url_parameter', toogle, attributes, setAttributes)}
                    />
                </FlexItem>
            </Flex>
            {attributes?.action_submit_settings?.redirect?.url_parameter && (
                <>
                    <WPFrombuilderSelect2
                        label={'Parameter'}
                        value={attributes?.action_submit_settings?.redirect?.parameter ?? []}
                        options={fieldOptions}
                        onChange={(newVal) => updateRedirectSettings({ parameter: newVal })}
                        multiple={true}
                    />
                    {(attributes?.action_submit_settings?.redirect?.parameter).includes('custom_value') && (
                        <RepeaterRedirect
                            value={attributes?.action_submit_settings?.redirect?.custom_parameter ?? []}
                            onChange={(newVal) => updateRedirectSettings({ custom_parameter: newVal })}
                            attributes={attributes}
                        />
                    )}
                </>

            )}


        </>
    );
}
export default RedirectControl;