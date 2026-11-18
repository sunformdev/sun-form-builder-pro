const { __ } = wp.i18n;
const { useMemo } = wp.element;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalNumberControl, __experimentalInputControl, ToggleControl, Button, Icon } = wp.components;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { handleChangeApiSettings } from '../../../../integrations.js';
import './email2.css';

const Email2Control = ({ attributes, setAttributes }) => {

    return (
        <>
            <__experimentalInputControl
                label="To"
                labelPosition="top"
                help="You can send to multiple emails, separated by commas."
                value={attributes?.action_submit_settings?.email2?.to ?? sfbuilder_js_data?.admin_email}
                type="text"
                onChange={(newValue) => handleChangeApiSettings('email2', 'to', newValue, attributes, setAttributes)}
            />
            <__experimentalInputControl
                label="Subject"
                labelPosition="top"
                value={attributes?.action_submit_settings?.email2?.subject ?? `New message from ${sfbuilder_js_data?.blog_name}`}
                type="text"
                onChange={(newValue) => handleChangeApiSettings('email2', 'subject', newValue, attributes, setAttributes)}
            />
            <SelectControl
                label="Email Template"
                value={attributes?.action_submit_settings?.email2?.template ?? sfbuilder_js_data?.email2_templates_default}
                options={sfbuilder_js_data?.email_templates}
                labelPosition="edge"
                className="wpformbuilder-heading-select"
                onChange={(newValue) => handleChangeApiSettings('email2', 'template', newValue, attributes, setAttributes)}
            />
            <__experimentalInputControl
                label="From Email"
                labelPosition="edge"
                value={attributes?.action_submit_settings?.email2?.from ?? sfbuilder_js_data?.from_email}
                type="text"
                onChange={(newValue) => handleChangeApiSettings('email2', 'from', newValue, attributes, setAttributes)}
                className='wpformbuilder-width-33'
            />
            <__experimentalInputControl
                label="From Name"
                labelPosition="edge"
                value={attributes?.action_submit_settings?.email2?.from_name ?? sfbuilder_js_data?.blog_name}
                type="text"
                onChange={(newValue) => handleChangeApiSettings('email2', 'from_name', newValue, attributes, setAttributes)}
                className='wpformbuilder-width-33'
            />
            <__experimentalInputControl
                label="Reply-To"
                labelPosition="edge"
                value={attributes?.action_submit_settings?.email2?.reply_to ?? ''}
                type="text"
                onChange={(newValue) => handleChangeApiSettings('email2', 'reply_to', newValue, attributes, setAttributes)}
                className='wpformbuilder-width-33'
            />
            <__experimentalInputControl
                label="Cc"
                labelPosition="edge"
                value={attributes?.action_submit_settings?.email2?.cc}
                type="text"
                onChange={(newValue) => handleChangeApiSettings('email2', 'cc', newValue, attributes, setAttributes)}
                className='wpformbuilder-width-33'
            />
            <__experimentalInputControl
                label="Bcc"
                labelPosition="edge"
                value={attributes?.action_submit_settings?.email2?.bcc}
                type="text"
                onChange={(newValue) => handleChangeApiSettings('email2', 'bcc', newValue, attributes, setAttributes)}
                className='wpformbuilder-width-33'
            />
            <__experimentalDivider margin="2" />
            <FormTokenField
                __experimentalAutoSelectFirstMatch
                __experimentalExpandOnFocus
                __nextHasNoMarginBottom
                label="Meta Data"
                onChange={(newValues) => handleChangeApiSettings('email2', 'meta_data', newValues, attributes, setAttributes)}
                suggestions={
                    ['Date', 'Time', 'Page URL', 'User Agent', 'Remote IP', 'Credit']
                }
                value={attributes?.action_submit_settings?.email2?.meta_data ?? []}
                __experimentalShowHowTo={false}
            />
        </>
    );
}
export default Email2Control;