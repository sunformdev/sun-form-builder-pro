const { __ } = wp.i18n;
const { InspectorControls, RichText, useBlockProps } = wp.blockEditor;
const { TabPanel, PanelBody, SelectControl, BaseControl, Notice, __experimentalHeading, ComboboxControl, TextControl, Flex, FlexBlock, FormTokenField, __experimentalToggleGroupControl, __experimentalNumberControl, __experimentalToggleGroupControlOptionIcon, __experimentalSpacer, DatePicker, __experimentalDivider, FlexItem, __experimentalUnitControl, __experimentalInputControl, ToggleControl, Button, Icon, TextareaControl } = wp.components;
import { desktop, plus, settings, justifyLeft, justifyRight, alignRight, alignJustify, justifySpaceBetween, justifyStretch, alignCenter, justifyCenter, alignLeft, brush, cog, arrowLeft, arrowRight } from '@wordpress/icons';
import multiStepFormIcon from '../icons/multi-step-form-icon.js';
import { attributes, default_multi_step_fields, createStepsFromFields } from '../../includes/attributes';
const { useState, useEffect, useRef } = wp.element;
const { useSelect } = wp.data;
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSync, faCog } from '@fortawesome/free-solid-svg-icons'
import { generateFormCSS, generateLabelCSS, generateFieldCSS, getUnit, generateButtonCSS, generateColumnCSS, renderIcon, generateStepCSS } from '../../includes/functions.js'
import { WPFormbuilderGetAPIData, handleChangeApiSettings } from '../../includes/integrations.js';
import WPformbuilderTextControl from '../../includes/controls/forms/text/text.js';
import WPformbuilderDateControl from '../../includes/controls/forms/date/date.js';
import ShortUniqueId from 'short-unique-id';
import WPformbuilderNumberControl from '../../includes/controls/forms/number/number';
import WPformbuilderEmailControl from '../../includes/controls/forms/email/email';
import WPformbuilderTelControl from '../../includes/controls/forms/tel/tel';
import WPformbuilderURLControl from '../../includes/controls/forms/url/url';
import WPformbuilderTextareaControl from '../../includes/controls/forms/textarea/textarea';
import WPformbuilderPasswordControl from '../../includes/controls/forms/password/password';
import WPformbuilderHiddenControl from '../../includes/controls/forms/hidden/hidden';
import WPformbuilderSelectControl from '../../includes/controls/forms/select/select';
import WPformbuilderCheckboxControl from '../../includes/controls/forms/checkbox/checkbox.js';
import WPformbuilderRadioControl from '../../includes/controls/forms/radio/radio.js';
import WPformbuilderAcceptanceControl from '../../includes/controls/forms/acceptance/acceptance.js';
import WPformbuilderFileUploadControl from '../../includes/controls/forms/file-upload/file-upload.js';
import WPformbuilderImageUploadControl from '../../includes/controls/forms/image-upload/image-upload.js';
import LabelResponsive from '../../includes/controls/editor/label-responsive/label-responsive.js';
import WPFrombuilderTypography from '../../includes/controls/editor/typography/typography.js';
import WPFrombuilderSelectOption from '../../includes/controls/editor/select-option/select-option.js';
import WPFrombuilderSelectGroup from '../../includes/controls/editor/select-group/select-group.js';
import WPFormbuilderColorPicker from '../../includes/controls/editor/color-picker/color-picker.js';
import WPFrombuilderBorder from '../../includes/controls/editor/border/border.js';
import CssCustom from '../../includes/controls/editor/css-custom/css-custom.js';
import WPFrombuilderDimensions from '../../includes/controls/editor/dimensions/dimensions.js';
import ActivecampaignApiControl from '../../includes/controls/editor/api/activecampaign/activecampaign.js';
import MailchimpApiControl from '../../includes/controls/editor/api/mailchimp/mailchimp.js';
import SendFoxApiControl from '../../includes/controls/editor/api/sendfox/sendfox.js';
import BrevoApiControl from '../../includes/controls/editor/api/brevo/brevo.js';
import MailerliteApiControl from '../../includes/controls/editor/api/mailerlite/mailerlite.js';
import ZohoCRMApiControl from '../../includes/controls/editor/api/zohocrm/zohocrm.js';
import ConstantcontactApiControl from '../../includes/controls/editor/api/constantcontact/constantcontact.js';
import RedirectControl from '../../includes/controls/editor/action-submit/redirect/redirect.js';
import WPformbuilderDateSettings from '../../includes/controls/settings/date/date.js';
import WPformbuilderFileUploadNormal from '../../includes/controls/settings/file-upload/file-upload-normal.js';
import WPformbuilderFileUploadAdvanced from '../../includes/controls/settings/file-upload/file-upload-advanced.js';
import WPformbuilderImageUploadNormal from '../../includes/controls/settings/image-upload/image-upload-normal.js';
import WPformbuilderImageUploadAdvanced from '../../includes/controls/settings/image-upload/image-upload-advanced.js';
import WPformbuilderRecaptchaV2Control from '../../includes/controls/forms/recaptcha_v2/recaptcha_v2.js';
import WPformbuilderRequiredMsg from '../../includes/controls/settings/required-msg/required-msg.js';
import WPformbuilderStripeControl from '../../includes/controls/forms/payment/stripe/stripe.js';
import WPformbuilderStripeSettings from '../../includes/controls/settings/payment/stripe/stripe-settings.js';
import WPformbuilderStripePaymentSettings from '../../includes/controls/settings/payment/stripe/stripe-payment-settings.js';
import WPformbuilderStepButtonControl from '../../includes/controls/forms/step/step.js';
import WPFrombuilderPosition from '../../includes/controls/editor/position/position.js';
import Email2Control from '../../includes/controls/editor/api/email2/email2.js';
import EmailControl from '../../includes/controls/editor/api/email/email.js';
import './multi-step-form.css';
import '../../../../../assets/css/src/form.css';
import GoogleSheetsApiControl from '../../includes/controls/editor/api/google-sheets/google-sheets.js';
import IconControl from '../../includes/controls/editor/icon/icon.js';

const groupFieldsIntoStepPanels = (fields = []) => {
    const panels = [];
    let current = [];
    fields.forEach((field) => {
        current.push(field);
        if (field?.type === 'step') {
            panels.push(current);
            current = [];
        }
    });
    if (current.length) {
        panels.push(current);
    }
    return panels;
};

wp.blocks.registerBlockType('sunformbuilder/multi-step-form', {
    apiVersion: 2,
    title: __('Multi Step Form'),
    icon: multiStepFormIcon,
    category: 'sunformbuilder',
    attributes: attributes,
    edit: (props) => {
        const { attributes, setAttributes } = props;
        const generateID = new ShortUniqueId({ length: 5, dictionary: 'alphanum_lower' });
        const [css, setCSS] = useState('');
        const attributeField = {
            className: 'wpformbuilder-form-field'
        }

        const currentDevice = useSelect((select) => {
            return select('core/edit-post').__experimentalGetPreviewDeviceType();
        }, []);
        const device = currentDevice.toLowerCase();
        const [openIndex, setOpenIndex] = useState(null);
        const [previewStepIndex, setPreviewStepIndex] = useState(0);
        const [progressConnectorAnim, setProgressConnectorAnim] = useState(null);
        const sortableFieldsRef = useRef(null);
        const formPreviewInteractionRef = useRef(null);
        const previewStepPrevRef = useRef(0);

        const getFieldSortableId = (field, index) => field?.id ? `${field.id}` : `field-index-${index}`;
        const getSyncedSteps = (fields = []) => createStepsFromFields(fields);
        const createStepField = () => ({
            ...attributes.render_attributes,
            id: 'wp' + generateID.rnd(),
            name: 'field_' + generateID.rnd(),
            type: 'step',
            label: 'Step End'
        });
        const normalizeMultiStepFields = (fields = []) => {
            const normalizedFields = [...fields];

            if (!normalizedFields.length) {
                return [createStepField()];
            }

            if (normalizedFields[normalizedFields.length - 1]?.type === 'step') {
                return normalizedFields;
            }

            const lastStepIndex = normalizedFields.map((field) => field?.type).lastIndexOf('step');

            if (lastStepIndex !== -1) {
                const [lastStepField] = normalizedFields.splice(lastStepIndex, 1);
                normalizedFields.push(lastStepField);
                return normalizedFields;
            }

            normalizedFields.push(createStepField());
            return normalizedFields;
        };
        const updateFieldsAndSteps = (fields = [], extraAttributes = {}) => {
            const normalizedFields = normalizeMultiStepFields(fields);
            setAttributes({
                fields: normalizedFields,
                steps: getSyncedSteps(normalizedFields),
                ...extraAttributes
            });
            return normalizedFields;
        };

        useEffect(() => {
            if (!attributes?.form?.id) {
                setAttributes({ form: { ...attributes?.form, id: generateID.rnd() } });
                setAttributes({ additional_options: { ...attributes?.additional_options } });
            }
            if (!attributes?.form?.post_form) {
                setAttributes({ form: { ...attributes?.form, post_form: wp.data.select('core/editor').getCurrentPostId() } });
            }
            if (!attributes?.fields.length) {
                const normalizedDefaultFields = normalizeMultiStepFields(default_multi_step_fields);
                setAttributes({
                    fields: normalizedDefaultFields,
                    steps: getSyncedSteps(normalizedDefaultFields)
                });
            }

            const cssForm = generateFormCSS(attributes, true);
            const cssLabel = generateLabelCSS(attributes);
            const cssField = generateFieldCSS(attributes);
            const cssButton = generateButtonCSS(attributes, false, true);
            const cssColumn = generateColumnCSS(attributes);
            const cssNextButton = generateButtonCSS(attributes, true);
            const cssStep = generateStepCSS(attributes);
            console.log('cssForm--->', cssForm);

            const finalCss = cssForm + cssLabel + cssField + cssButton + cssNextButton + cssStep;
            setCSS(finalCss);
            if (attributes?.css?.editor !== (finalCss + cssColumn)) {
                setAttributes({ css: { ...attributes?.css, editor: finalCss + cssColumn } });
            }
            console.log('attr--->', attributes);
        }, [attributes]);

        useEffect(() => {
            const rawFields = attributes?.fields || [];
            // Tránh normalize([]) → [một field step] ghi đè default_multi_step_fields từ effect khởi tạo phía trên.
            if (!rawFields.length) {
                return;
            }
            const normalizedFields = normalizeMultiStepFields(rawFields);
            const syncedSteps = getSyncedSteps(normalizedFields);

            if (
                JSON.stringify(rawFields) !== JSON.stringify(normalizedFields) ||
                JSON.stringify(attributes?.steps || []) !== JSON.stringify(syncedSteps)
            ) {
                setAttributes({
                    fields: normalizedFields,
                    steps: syncedSteps
                });
            }
        }, [attributes?.fields, attributes?.steps]);

        useEffect(() => {
            setOpenIndex(attributes?.state?.repeater);
        }, device);

        useEffect(() => {
            const sortableNode = sortableFieldsRef.current;

            if (!sortableNode || !$.fn?.sortable) {
                return undefined;
            }

            const $sortableNode = $(sortableNode);

            if ($sortableNode.data('ui-sortable')) {
                $sortableNode.sortable('destroy');
            }

            if ((attributes?.fields?.length || 0) < 2) {
                return undefined;
            }

            $sortableNode.sortable({
                axis: 'y',
                handle: '.components-panel__body-toggle',
                items: '> .wpformbuilder-sortable-item',
                tolerance: 'pointer',
                distance: 5,
                placeholder: 'wpformbuilder-sortable-placeholder',
                cancel: 'input, textarea, select, option, button:not(.components-panel__body-toggle), .wpformbuilder-remove-attribute-button, .components-base-control',
                update: () => {
                    const currentFields = attributes?.fields || [];
                    const orderedFieldIds = $sortableNode.sortable('toArray', { attribute: 'data-field-id' });
                    const fieldsBySortableId = new Map(
                        currentFields.map((field, index) => [getFieldSortableId(field, index), field])
                    );
                    const orderedFields = orderedFieldIds
                        .map((fieldId) => fieldsBySortableId.get(fieldId))
                        .filter(Boolean);

                    if (orderedFields.length !== currentFields.length) {
                        return;
                    }

                    const openedField = openIndex !== null ? currentFields[openIndex] : null;
                    const nextOpenIndex = openedField ? orderedFields.findIndex((field) => field === openedField) : null;

                    setOpenIndex(nextOpenIndex === -1 ? null : nextOpenIndex);
                    updateFieldsAndSteps(orderedFields, {
                        state: {
                            ...attributes?.state,
                            repeater: nextOpenIndex === -1 ? null : nextOpenIndex
                        }
                    });
                }
            });

            return () => {
                if ($sortableNode.data('ui-sortable')) {
                    $sortableNode.sortable('destroy');
                }
            };
        }, [attributes?.fields, attributes?.state, openIndex]);

        const attributeForm = useBlockProps({
            className: `wpformbuilder-form wpformbuilder-form-${attributes?.form?.id}`,
        })

        const stepPanels = groupFieldsIntoStepPanels(attributes?.fields || []);
        const isPreviewMultistep = !!(attributes?.form?.preview && stepPanels.length > 1);

        const normalizeStepTextPositionById = (currentTextPosition, stepIds = []) => {
            if (!currentTextPosition || !stepIds?.length) {
                return null;
            }

            // Always end up with: { [stepId]: value }
            const next = {};

            // Case 1: old data as array -> index aligned with steps[]
            if (Array.isArray(currentTextPosition)) {
                currentTextPosition.forEach((val, idx) => {
                    const stepId = stepIds[idx];
                    if (stepId) {
                        next[stepId] = val;
                    }
                });
            } else if (typeof currentTextPosition === 'object') {
                const curr = currentTextPosition || {};

                // Keep already-correct keys by id
                stepIds.forEach((stepId) => {
                    if (Object.prototype.hasOwnProperty.call(curr, stepId)) {
                        next[stepId] = curr[stepId];
                    }
                });

                // Migrate numeric keys (old stepIndex) -> stepId
                Object.keys(curr).forEach((k) => {
                    if (!/^\d+$/.test(k)) return;
                    const idx = Number(k);
                    const stepId = stepIds[idx];
                    if (!stepId) return;
                    if (!Object.prototype.hasOwnProperty.call(next, stepId)) {
                        next[stepId] = curr[k];
                    }
                });
            } else {
                return null;
            }

            // Prune removed steps implicitly by only writing known stepIds above.
            const nextStr = JSON.stringify(next);
            const currStr = JSON.stringify(currentTextPosition);
            if (nextStr === currStr) {
                return null;
            }
            return next;
        };

        useEffect(() => {
            const stepIds = attributes?.steps || [];
            const current = attributes?.style?.step?.desktop?.text_position;
            const next = normalizeStepTextPositionById(current, stepIds);
            if (!next) {
                return;
            }
            setAttributes({
                style: {
                    ...attributes?.style,
                    step: {
                        ...attributes?.style?.step,
                        desktop: {
                            ...attributes?.style?.step?.desktop,
                            text_position: next
                        }
                    }
                }
            });
        }, [attributes?.steps]);

        useEffect(() => {
            if (!attributes?.form?.preview) {
                setPreviewStepIndex(0);
                return;
            }
            setPreviewStepIndex((i) =>
                Math.min(i, Math.max(0, stepPanels.length - 1))
            );
        }, [attributes?.form?.preview, stepPanels.length]);

        useEffect(() => {
            if (!isPreviewMultistep) {
                setProgressConnectorAnim(null);
                previewStepPrevRef.current = 0;
                return;
            }
            const prev = previewStepPrevRef.current;
            const active = previewStepIndex;
            const len = stepPanels.length;
            const goingForward = active > prev;
            const goingBack = active < prev;

            let nextAnim = null;
            if (goingBack && prev > 0) {
                nextAnim = { mode: 'out', index: prev - 1 };
            } else if (goingForward && prev < len - 1) {
                nextAnim = { mode: 'in', index: prev };
            }
            setProgressConnectorAnim(nextAnim);
            previewStepPrevRef.current = active;
        }, [isPreviewMultistep, previewStepIndex, stepPanels.length]);

        useEffect(() => {
            if (!isPreviewMultistep) {
                return undefined;
            }
            const root = formPreviewInteractionRef.current;
            if (!root) {
                return undefined;
            }
            const maxIdx = stepPanels.length - 1;
            const onClick = (e) => {
                if (e.target.closest('.wpformbuilder-multi-step-form__button--next')) {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewStepIndex((i) => Math.min(i + 1, maxIdx));
                    return;
                }
                if (e.target.closest('.wpformbuilder-multi-step-form__button--previous')) {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewStepIndex((i) => Math.max(i - 1, 0));
                    return;
                }
                if (e.target.closest('.wpformbuilder-multi-step-form__button--submit')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            };
            root.addEventListener('click', onClick, true);
            return () => root.removeEventListener('click', onClick, true);
        }, [isPreviewMultistep, stepPanels.length]);

        const renderFormField = (rawItem, fieldKey) => {
            const item = { ...attributes?.form, ...rawItem };
            switch (item.type) {
                case 'text':
                    return <WPformbuilderTextControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />
                case 'number':
                    return <WPformbuilderNumberControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'email':
                    return <WPformbuilderEmailControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'tel':
                    return <WPformbuilderTelControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'url':
                    return <WPformbuilderURLControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'textarea':
                    return <WPformbuilderTextareaControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'password':
                    return <WPformbuilderPasswordControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'hidden':
                    return <WPformbuilderHiddenControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'select':
                    return <WPformbuilderSelectControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'checkbox':
                    return <WPformbuilderCheckboxControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'radio':
                    return <WPformbuilderRadioControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />;
                case 'acceptance':
                    return <WPformbuilderAcceptanceControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />
                case 'recaptcha_v2':
                    return <WPformbuilderRecaptchaV2Control attributes={item} key={fieldKey} device={device} style={attributes?.style} />
                case 'date':
                    return <WPformbuilderDateControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />
                case 'file_upload':
                    return <WPformbuilderFileUploadControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />
                case 'image_upload':
                    return <WPformbuilderImageUploadControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />
                case 'stripe_card':
                    return <WPformbuilderStripeControl attributes={item} key={fieldKey} device={device} style={attributes?.style} />
                case 'step':
                    return <WPformbuilderStepButtonControl attributes={item} settings={attributes} button={attributes?.button} key={fieldKey} device={device} style={attributes?.style} indexStep={attributes?.steps.indexOf(item?.id)} steps={attributes?.steps} />
            }
        };

        const addItem = () => {
            const newField = {
                ...attributes.render_attributes,
                id: 'wp' + generateID.rnd(),
                name: 'field_' + generateID.rnd()
            };

            const normalizedItems = updateFieldsAndSteps([...attributes?.fields, newField], {
                state: {
                    ...attributes?.state,
                    repeater: null
                }
            });
            const newFieldIndex = normalizedItems.findIndex((field) => field?.id === newField.id);
            setOpenIndex(newFieldIndex);
            setAttributes({
                state: {
                    ...attributes?.state,
                    repeater: newFieldIndex
                }
            });
        };

        const setFormAttribute = (newValue, attrName, index) => {
            const newItems = [...attributes?.fields];
            if (newItems[index]) {
                newItems[index][attrName] = newValue;
                updateFieldsAndSteps(newItems);
            }
        }

        const setFormStyle = (newValue, styleName, type) => {
            const updatedStyle = {
                ...attributes.style,
                form: {
                    ...attributes?.style?.form,
                    [device]: {
                        ...attributes.style?.form?.[device],
                        [styleName]: {
                            ...attributes.style?.form?.[device][styleName],
                            [type]: newValue
                        }
                    }
                }

            };
            setAttributes({ ...attributes, style: updatedStyle });
        }

        const removeItem = (index) => {
            const newItems = attributes?.fields.filter((_, i) => i !== index);
            updateFieldsAndSteps(newItems);
            if (index === openIndex) {
                setOpenIndex(null);
            }
        };

        const handleSetColumnWidth = (width, index) => {
            const newItems = [...attributes?.fields];
            newItems[index]['column_width'][device] = width;
            setAttributes({ ...attributes?.fields, fields: newItems });
        }

        const handleChangeFormTypography = (newValue, attrName, type) => {
            const updatedStyle = {
                ...attributes.style,
                [type]: {
                    ...attributes?.style?.[type],
                    [device]: {
                        ...attributes.style?.[type]?.[device],
                        [attrName]: newValue
                    }
                }

            };
            setAttributes({ ...attributes, style: updatedStyle });
        }

        const handleSetOpenRepeater = (index) => {
            setOpenIndex(openIndex === index ? null : index);
            setAttributes({ state: { ...attributes?.state, repeater: openIndex === index ? null : index } });
        }

        const handleSetOpenSection = async (name, toggle = false) => {
            setAttributes({ state: { ...(attributes?.state || {}), section: attributes?.state?.section === name ? '' : name } });
            if (['mailchimp', 'activecampaign', 'brevo', 'mailerlite', 'sendfox', 'constantcontact'].includes(name) && toggle && sfbuilder_js_data?.api?.[name] && !attributes?.action_submit_settings?.[name]?.loaded) {
                console.log('load api--->');
                await WPFormbuilderGetAPIData(name, attributes, setAttributes);
            }
        }

        const handleChangeBorderRadius = (newRadius, attrName) => {
            setAttributes({
                style: {
                    ...attributes?.style,
                    [attrName]: {
                        ...attributes?.style?.[attrName],
                        desktop: {
                            ...attributes?.style?.[attrName]?.desktop,
                            border: {
                                ...attributes?.style?.[attrName]?.desktop?.border,
                                radius: {
                                    top: newRadius?.top,
                                    right: newRadius?.right,
                                    bottom: newRadius?.bottom,
                                    left: newRadius?.left,
                                    unit: newRadius?.unit,
                                    link: newRadius?.link
                                }
                            }
                        }
                    }
                }
            });
        }
        const handleChangeTextPosition = (newTextPosition, attrName, stepId) => {
            setAttributes({
                style: {
                    ...attributes?.style,
                    [attrName]: {
                        ...attributes?.style?.[attrName],
                        desktop: {
                            ...attributes?.style?.[attrName]?.desktop,
                            text_position: {
                                ...attributes?.style?.[attrName]?.desktop?.text_position,
                                [stepId]: newTextPosition
                            }
                        }
                    }
                }
            });
        }

        const handleSpacing = (newSpacing, attrName, chilName) => {
            setAttributes({
                style: {
                    ...attributes?.style,
                    [attrName]: {
                        ...attributes?.style?.[attrName],
                        [device]: {
                            ...attributes?.style?.[attrName]?.[device],
                            [chilName]: {
                                top: newSpacing?.top,
                                right: newSpacing?.right,
                                bottom: newSpacing?.bottom,
                                left: newSpacing?.left,
                                unit: newSpacing?.unit,
                                link: newSpacing?.link
                            }
                        }
                    }
                }
            });
        }

        const handleChangeAdditionalOptions = (optionName, property, value) => {
            setAttributes({
                additional_options: {
                    ...attributes?.additional_options,
                    [optionName]: {
                        ...attributes?.additional_options?.[optionName],
                        [property]: value
                    }
                }
            });
        }

        const renderConfiguredIcon = (icon, marginProperty = 'marginLeft') => {
            if (!icon || icon?.type === 'none') {
                return null;
            }

            if (icon?.type === 'icon_lib' && icon?.group && icon?.name) {
                return (
                    <span className='wpformbuilder-submit-button-icon' style={{ [marginProperty]: `${icon?.spacing ?? '10px'}` }}>
                        <i className={`fa-${icon.group} fa-${icon.name}`} />
                    </span>
                );
            }

            if (icon?.type === 'upload' && icon?.url) {
                return (
                    <span className='wpformbuilder-submit-button-icon' style={{ [marginProperty]: `${icon?.spacing ?? '10px'}` }}>
                        <img src={icon.url} />
                    </span>
                );
            }

            return null;
        }

        return (
            <>
                <InspectorControls>
                    <TabPanel
                        className="wpformbuilder-tab-panel"
                        activeClass="active-tab"
                        onSelect={(tabName) => setAttributes({ state: { ...attributes?.state, openTab: tabName } })} // Open section nữa
                        initialTabName={attributes.state.openTab}
                        tabs={[
                            {
                                name: 'setting',
                                title: (
                                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Icon icon={cog} size={20} />
                                        <span style={{ fontSize: '12px' }}>Settings</span>
                                    </span>
                                ),
                                className: 'wpformbuilder-tab-setting',
                            },
                            {
                                name: 'style',
                                title: (
                                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Icon icon={brush} size={20} />
                                        <span style={{ fontSize: '12px' }}>Style</span>
                                    </span>
                                ),
                                className: 'wpformbuilder-tab-style',
                            },
                        ]}
                    >
                        {(tab) => <div>
                            {attributes.state.openTab === 'setting' && (
                                <>
                                    <PanelBody title={__('Form Fields')} opened={attributes?.state?.section === 'form-field'} onToggle={() => handleSetOpenSection('form-field')} className="wpformbuilder-panel-toggle">
                                        <div className="wpformbuilder-custom-attribute-control">
                                            <__experimentalInputControl
                                                label="Form Name"
                                                labelPosition="side"
                                                className="wpformbuilder-form-name"
                                                value={attributes?.form?.name ?? ""}
                                                style={{ 'margin-top': '10px' }}
                                                onChange={(newValue) => setAttributes({ form: { ...attributes?.form, name: newValue } })}
                                            />
                                            <div ref={sortableFieldsRef} className="wpformbuilder-sortable-fields">
                                                {attributes?.fields.map((item, index) => (
                                                    <div
                                                        key={item?.id ?? index}
                                                        className="wpformbuilder-sortable-item"
                                                        data-field-id={getFieldSortableId(item, index)}
                                                    >
                                                        <PanelBody
                                                            title={__(item?.type === 'recaptcha_v2' ? 'reCaptcha v2' : (item?.label ? item?.label : `Item #${index + 1}`))}
                                                            className={`wpformbuilder-custom-attribute-panel${item?.type === 'step' ? ' step' : ''}`}
                                                            icon={
                                                                item?.type !== 'step' ||
                                                                index !== (attributes?.fields?.length ?? 0) - 1 ? (
                                                                    <span className="wpformbuilder-sortable-icon-group">
                                                                        <FontAwesomeIcon
                                                                            icon={faXmark}
                                                                            className='wpformbuilder-remove-attribute-button'
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                removeItem(index);
                                                                            }}
                                                                        />
                                                                    </span>
                                                                ) : undefined
                                                            }
                                                            opened={index === openIndex}
                                                            onToggle={() => handleSetOpenRepeater(index)}
                                                        >
                                                            <div className="wpformbuilder-custom-attribute-control__item">
                                                                <TabPanel
                                                                    className="wpformbuilder-tab-repeater"
                                                                    activeClass="active-tab"
                                                                    onSelect={(tabName) => setAttributes({ state: { ...attributes?.state, inRepeater: tabName } })}
                                                                    initialTabName={attributes?.state?.inRepeater}
                                                                    tabs={[
                                                                        {
                                                                            name: 'normal',
                                                                            title: 'Normal',
                                                                            className: 'wpformbuilder-tab-normal',
                                                                        },
                                                                        {
                                                                            name: 'advanced',
                                                                            title: 'Advanced',
                                                                            className: 'wpformbuilder-tab-advanced',
                                                                        },
                                                                    ]}
                                                                >
                                                                    {(tabs) => <div>
                                                                        {attributes?.state?.inRepeater == 'normal' && (
                                                                            <>
                                                                                <SelectControl
                                                                                    label="Type"
                                                                                    value={item?.type ? item?.type : 'text'}
                                                                                    options={[
                                                                                        { label: 'Text', value: 'text' },
                                                                                        { label: 'Nunber', value: 'number' },
                                                                                        { label: 'Email', value: 'email' },
                                                                                        { label: 'Tel', value: 'tel' },
                                                                                        { label: 'URL', value: 'url' },
                                                                                        { label: 'Date', value: 'date' },
                                                                                        { label: 'Textarea', value: 'textarea' },
                                                                                        { label: 'Select', value: 'select' },
                                                                                        { label: 'Checkbox', value: 'checkbox' },
                                                                                        { label: 'Radio', value: 'radio' },
                                                                                        { label: 'Acceptance', value: 'acceptance' },
                                                                                        { label: 'Hidden', value: 'hidden' },
                                                                                        { label: 'Password', value: 'password' },
                                                                                        { label: 'Image Upload', value: 'image_upload' },
                                                                                        { label: 'File Upload', value: 'file_upload' },
                                                                                        { label: 'reCaptcha v2', value: 'recaptcha_v2' },
                                                                                        { label: 'Stripe Card', value: 'stripe_card' },
                                                                                        { label: 'Step', value: 'step' },
                                                                                    ]}
                                                                                    labelPosition="edge"
                                                                                    className="wpformbuilder-heading-select"
                                                                                    onChange={(newValue) => setFormAttribute(newValue, 'type', index)}
                                                                                />
                                                                                <__experimentalInputControl
                                                                                    label="Label"
                                                                                    labelPosition="side"
                                                                                    value={item?.label ? item?.label : ''}
                                                                                    onChange={(newValue) => setFormAttribute(newValue, 'label', index)}
                                                                                />
                                                                                {['recaptcha_v2'].includes(item.type) && (
                                                                                    <>
                                                                                        <TextareaControl
                                                                                            label="Required Message"
                                                                                            value={item?.recaptcha_v2_required_message ?? 'Please verify that you are not a robot.'}
                                                                                            onChange={(newValue) => setFormAttribute(newValue, 'recaptcha_v2_required_message', index)}
                                                                                            rows={2}
                                                                                        />
                                                                                        <TextareaControl
                                                                                            label="Error Message"
                                                                                            value={item?.recaptcha_v2_error_message ?? 'Error verifying reCAPTCHA. Please try again.'}
                                                                                            onChange={(newValue) => setFormAttribute(newValue, 'recaptcha_v2_error_message', index)}
                                                                                            rows={2}
                                                                                        />
                                                                                    </>
                                                                                )}
                                                                                {!['recaptcha_v2'].includes(item.type) && (
                                                                                    <>
                                                                                        {['acceptance'].includes(item.type) && (
                                                                                            <TextareaControl
                                                                                                label="Acceptance Text"
                                                                                                value={item.acceptance_text ?? ''}
                                                                                                onChange={(newValue) => setFormAttribute(newValue, 'acceptance_text', index)}
                                                                                            />
                                                                                        )}
                                                                                        {!['step'].includes(item?.type) && (
                                                                                            <__experimentalInputControl
                                                                                                label="ID (name)"
                                                                                                labelPosition="side"
                                                                                                value={item?.name ? item?.name : ''}
                                                                                                title={'Use meaningful names written in lowercase, without spaces or special characters (except _ or -). Eg: email_address'}
                                                                                                onChange={(newValue) => setFormAttribute(newValue, 'name', index)}
                                                                                                className='wpformbuilder-width-35'
                                                                                            />
                                                                                        )}
                                                                                        {['text', 'password', 'email', 'tel', 'number', 'textarea', 'hidden', 'date'].includes(item?.type) && (
                                                                                            <__experimentalInputControl
                                                                                                label="Placeholder"
                                                                                                labelPosition="side"
                                                                                                value={item?.placeholder ? item?.placeholder : ''}
                                                                                                onChange={(newValue) => setFormAttribute(newValue, 'placeholder', index)}
                                                                                            />
                                                                                        )}
                                                                                        {['text', 'search', 'url', 'tel', 'email', 'password'].includes(item?.type) && (
                                                                                            <__experimentalInputControl
                                                                                                label="Pattern"
                                                                                                labelPosition="side"
                                                                                                value={item?.pattern ? item?.pattern : ''}
                                                                                                onChange={(newValue) => setFormAttribute(newValue, 'pattern', index)}
                                                                                            />
                                                                                        )}
                                                                                        {['select'].includes(item?.type) && (
                                                                                            <>
                                                                                                <Flex style={{ 'margin-bottom': '13px' }}>
                                                                                                    <FlexItem>
                                                                                                        <label>Use selection groups</label>
                                                                                                    </FlexItem>
                                                                                                    <FlexItem className="wpformbuilder-no-margin-bootom">
                                                                                                        <ToggleControl
                                                                                                            __nextHasNoMarginBottom={true}
                                                                                                            checked={item?.options_width_group ? item?.options_width_group : false}
                                                                                                            onChange={(toogle) => setFormAttribute(toogle, 'options_width_group', index)}
                                                                                                        />
                                                                                                    </FlexItem>
                                                                                                </Flex>
                                                                                                {!item?.options_width_group && (
                                                                                                    <WPFrombuilderSelectOption attributes={attributes} setAttributes={setAttributes} index={index} />
                                                                                                )}
                                                                                                {item?.options_width_group && (
                                                                                                    <WPFrombuilderSelectGroup attributes={attributes} setAttributes={setAttributes} index={index} />
                                                                                                )}
                                                                                                <Flex style={{ 'margin-bottom': '15px', 'margin-top': '13px' }}>
                                                                                                    <FlexItem>
                                                                                                        <label>Multiple</label>
                                                                                                    </FlexItem>
                                                                                                    <FlexItem className="wpformbuilder-no-margin-bootom">
                                                                                                        <ToggleControl
                                                                                                            __nextHasNoMarginBottom={true}
                                                                                                            checked={item?.multiple ? item?.multiple : false}
                                                                                                            onChange={(toogle) => setFormAttribute(toogle, 'multiple', index)}
                                                                                                        />
                                                                                                    </FlexItem>
                                                                                                </Flex>
                                                                                            </>
                                                                                        )}

                                                                                        {['checkbox', 'radio'].includes(item?.type) && (
                                                                                            <>
                                                                                                <Flex style={{ 'margin-bottom': '15px', 'margin-top': '13px' }}>
                                                                                                    <FlexItem>
                                                                                                        <label className='not-capitalize'>Use the fieldset tag</label>
                                                                                                    </FlexItem>
                                                                                                    <FlexItem className="wpformbuilder-no-margin-bootom">
                                                                                                        <ToggleControl
                                                                                                            __nextHasNoMarginBottom={true}
                                                                                                            checked={item?.use_fieldset ? item?.use_fieldset : false}
                                                                                                            onChange={(toogle) => setFormAttribute(toogle, 'use_fieldset', index)}
                                                                                                        />
                                                                                                    </FlexItem>
                                                                                                </Flex>
                                                                                                <WPFrombuilderSelectOption attributes={attributes} setAttributes={setAttributes} index={index} />
                                                                                            </>
                                                                                        )}
                                                                                        {!['step'].includes(item?.type) && (
                                                                                            <Flex style={{ 'margin-bottom': '15px', 'margin-top': '13px' }}>
                                                                                                <FlexItem>
                                                                                                    <label>Required</label>
                                                                                                </FlexItem>
                                                                                                <FlexItem className="wpformbuilder-no-margin-bootom">
                                                                                                    <ToggleControl
                                                                                                        __nextHasNoMarginBottom={true}
                                                                                                        checked={item?.required ? item?.required : false}
                                                                                                        onChange={(toogle) => setFormAttribute(toogle, 'required', index)}
                                                                                                    />
                                                                                                </FlexItem>
                                                                                            </Flex>
                                                                                        )}

                                                                                        {['stripe_card'].includes(item?.type) && (
                                                                                            <WPformbuilderStripeSettings index={index} attributes={attributes} item={item} setAttributes={setAttributes} />
                                                                                        )}
                                                                                        {['file_upload'].includes(item?.type) && (
                                                                                            <WPformbuilderFileUploadNormal index={index} attributes={attributes} item={item} setAttributes={setAttributes} />
                                                                                        )}
                                                                                        {['image_upload'].includes(item?.type) && (
                                                                                            <WPformbuilderImageUploadNormal index={index} attributes={attributes} item={item} setAttributes={setAttributes} />
                                                                                        )}
                                                                                        {['date'].includes(item?.type) && (
                                                                                            <>
                                                                                                <WPformbuilderDateSettings index={index} attributes={attributes} item={item} setAttributes={setAttributes} />
                                                                                            </>
                                                                                        )}
                                                                                        {['number'].includes(item?.type) && (
                                                                                            <>
                                                                                                <__experimentalInputControl
                                                                                                    label="Min"
                                                                                                    labelPosition="side"
                                                                                                    type="number"
                                                                                                    value={item?.min ? item?.min : ''}
                                                                                                    onChange={(newValue) => setFormAttribute(newValue, 'min', index)}
                                                                                                    className="wpformbuilder-width-35"
                                                                                                />
                                                                                                <__experimentalInputControl
                                                                                                    label="Max"
                                                                                                    labelPosition="side"
                                                                                                    value={item?.max ? item?.max : ''}
                                                                                                    type="number"
                                                                                                    onChange={(newValue) => setFormAttribute(newValue, 'max', index)}
                                                                                                    className="wpformbuilder-width-35"
                                                                                                />
                                                                                                <__experimentalInputControl
                                                                                                    label="Step"
                                                                                                    labelPosition="side"
                                                                                                    value={item?.step ? item?.step : ''}
                                                                                                    type="number"
                                                                                                    onChange={(newValue) => setFormAttribute(newValue, 'step', index)}
                                                                                                />
                                                                                            </>
                                                                                        )}
                                                                                        {!['checkbox', 'step', 'radio', 'range', 'acceptance', 'date', 'file_upload', 'image_upload', 'stripe_card'].includes(item.type) && (
                                                                                            <__experimentalInputControl
                                                                                                label="Autocomplete"
                                                                                                labelPosition="side"
                                                                                                value={item?.autocomplete ? item?.autocomplete : 'on'}
                                                                                                type="text"
                                                                                                onChange={(newValue) => setFormAttribute(newValue, 'autocomplete', index)}
                                                                                                isPressEnterToChange={true}
                                                                                            />
                                                                                        )}
                                                                                        {['step'].includes(item?.type) && (
                                                                                            <>
                                                                                                {attributes?.steps.indexOf(item?.id) !== 0 && (
                                                                                                    <>
                                                                                                        <__experimentalInputControl
                                                                                                            label="Previous Button"
                                                                                                            labelPosition="side"
                                                                                                            value={item?.previous_label ? item?.previous_label : 'Previous'}
                                                                                                            onChange={(newValue) => setFormAttribute(newValue, 'previous_label', index)}
                                                                                                        />
                                                                                                        <IconControl
                                                                                                            label="Previous Icon"
                                                                                                            attributes={attributes}
                                                                                                            setAttributes={setAttributes}
                                                                                                            value={item?.previous_icon}
                                                                                                            onChange={(newValue) => setFormAttribute(newValue, 'previous_icon', index)}
                                                                                                        />
                                                                                                        <__experimentalDivider margin="1" />
                                                                                                    </>
                                                                                                )}
                                                                                                {attributes?.steps.indexOf(item?.id) !== attributes?.steps.length - 1 && (
                                                                                                    <>
                                                                                                        <__experimentalInputControl
                                                                                                            label="Next Button"
                                                                                                            labelPosition="side"
                                                                                                            value={item?.next_label ? item?.next_label : 'Next'}
                                                                                                            onChange={(newValue) => setFormAttribute(newValue, 'next_label', index)}
                                                                                                            style={{ marginTop: '15px' }}
                                                                                                        />
                                                                                                        <IconControl
                                                                                                            label="Next Icon"
                                                                                                            attributes={attributes}
                                                                                                            setAttributes={setAttributes}
                                                                                                            value={item?.next_icon}
                                                                                                            onChange={(newValue) => setFormAttribute(newValue, 'next_icon', index)}
                                                                                                        />
                                                                                                        <__experimentalSpacer margin="1" />
                                                                                                    </>
                                                                                                )}
                                                                                                <IconControl
                                                                                                    label="Step Icon"
                                                                                                    attributes={attributes}
                                                                                                    setAttributes={setAttributes}
                                                                                                    value={item?.step_icon}
                                                                                                    onChange={(newValue) => setFormAttribute(newValue, 'step_icon', index)}
                                                                                                />
                                                                                            </>
                                                                                        )}
                                                                                        {!['acceptance', 'step', 'date', 'file_upload', 'image_upload', 'stripe_card'].includes(item.type) && (
                                                                                            <__experimentalInputControl
                                                                                                label="Default value"
                                                                                                labelPosition="side"
                                                                                                value={item?.default_value ? item?.default_value : ''}
                                                                                                type={item?.type === 'number' ? 'number' : 'text'}
                                                                                                onChange={(newValue) => setFormAttribute(newValue, 'default_value', index)}
                                                                                            />
                                                                                        )}
                                                                                        {['acceptance'].includes(item.type) && (
                                                                                            <__experimentalInputControl
                                                                                                label="Value"
                                                                                                labelPosition="side"
                                                                                                value={item?.acceptance_value ? item?.acceptance_value : 'On'}
                                                                                                type={item?.type === 'number' ? 'number' : 'text'}
                                                                                                onChange={(newValue) => setFormAttribute(newValue, 'acceptance_value', index)}
                                                                                            />
                                                                                        )}
                                                                                        {['textarea'].includes(item?.type) && (
                                                                                            <__experimentalInputControl
                                                                                                label="Rows"
                                                                                                labelPosition="side"
                                                                                                value={item?.rows ? item?.rows : '4'}
                                                                                                type="number"
                                                                                                onChange={(newValue) => setFormAttribute(newValue, 'rows', index)}
                                                                                                className="wpformbuilder-width-35"
                                                                                            />
                                                                                        )}

                                                                                        {!['step'].includes(item?.type) && (
                                                                                            <Flex>
                                                                                                <FlexItem>
                                                                                                    <LabelResponsive
                                                                                                        label="Width"
                                                                                                        attributes={attributes}
                                                                                                        setAttributes={setAttributes}
                                                                                                    />
                                                                                                </FlexItem>
                                                                                                <FlexItem className="wpformbuilder-flex-block-no-margin">
                                                                                                    <SelectControl
                                                                                                        value={item?.column_width?.[device] ?? '100%'}
                                                                                                        options={[
                                                                                                            { label: '20%', value: '20%' },
                                                                                                            { label: '25%', value: '25%' },
                                                                                                            { label: '30%', value: '30%' },
                                                                                                            { label: '33%', value: '33%' },
                                                                                                            { label: '40%', value: '40%' },
                                                                                                            { label: '50%', value: '50%' },
                                                                                                            { label: '60%', value: '60%' },
                                                                                                            { label: '66%', value: '66%' },
                                                                                                            { label: '70%', value: '70%' },
                                                                                                            { label: '75%', value: '75%' },
                                                                                                            { label: '80%', value: '80%' },
                                                                                                            { label: '100%', value: '100%' },
                                                                                                            { label: 'Default', value: 'default' },
                                                                                                        ]}
                                                                                                        labelPosition="edge"
                                                                                                        onChange={(newValue) => handleSetColumnWidth(newValue, index)}
                                                                                                    />
                                                                                                </FlexItem>
                                                                                            </Flex>
                                                                                        )}
                                                                                    </>
                                                                                )}

                                                                            </>
                                                                        )}
                                                                        {attributes?.state?.inRepeater == 'advanced' && (
                                                                            <>
                                                                                {['text', 'password', 'email', 'tel', 'textarea '].includes(item?.type) && (
                                                                                    <>
                                                                                        <__experimentalInputControl
                                                                                            label="Min Length"
                                                                                            labelPosition="side"
                                                                                            type="number"
                                                                                            value={item?.min_length ? item?.min_length : ''}
                                                                                            onChange={(newValue) => setFormAttribute(newValue, 'min_length', index)}
                                                                                        />
                                                                                        <__experimentalInputControl
                                                                                            label="Max Length"
                                                                                            labelPosition="side"
                                                                                            value={item?.max_length ? item?.max_length : ''}
                                                                                            type="number"
                                                                                            onChange={(newValue) => setFormAttribute(newValue, 'max_length', index)}
                                                                                        />
                                                                                    </>
                                                                                )}
                                                                                {['file_upload'].includes(item?.type) && (
                                                                                    <WPformbuilderFileUploadAdvanced index={index} attributes={attributes} item={item} setAttributes={setAttributes} />
                                                                                )}
                                                                                {['image_upload'].includes(item?.type) && (
                                                                                    <WPformbuilderImageUploadAdvanced index={index} attributes={attributes} item={item} setAttributes={setAttributes} />
                                                                                )}
                                                                                {['inline'].includes(attributes?.form?.validate_type) && (
                                                                                    <WPformbuilderRequiredMsg index={index} attributes={attributes} item={item} setAttributes={setAttributes} />
                                                                                )}
                                                                                {['checkbox', 'radio'].includes(item?.type) && (
                                                                                    <TextareaControl
                                                                                        label="Required Message"
                                                                                        value={item?.required_message ?? 'This field is required.'}
                                                                                        onChange={(newValue) => setFormAttribute(newValue, 'required_message', index)}
                                                                                        rows={2}
                                                                                    />
                                                                                )}
                                                                                {['step'].includes(item?.type) && (
                                                                                    <>
                                                                                        {['number_text', 'icon_text'].includes(attributes?.step_settings?.type) && (() => {
                                                                                            return (
                                                                                                <WPFrombuilderPosition
                                                                                                    label='Label Position (px)'
                                                                                                    value={attributes?.style?.step?.desktop?.text_position?.[item?.id]}
                                                                                                    onChange={(newValue) => handleChangeTextPosition(newValue, 'step', item?.id)}
                                                                                                />
                                                                                            );
                                                                                        })()}
                                                                                    </>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>}
                                                                </TabPanel>
                                                            </div>
                                                        </PanelBody>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className='wpformbuilder-add-button-box' style={{ textAlign: 'center' }}>
                                                <Button className='wpformbuilder-add-attribute-button' icon={<Icon icon={plus} size={14} />} onClick={addItem}>
                                                    <span>Add Item</span>
                                                </Button>
                                            </div>
                                            <__experimentalDivider margin="1" />
                                            <SelectControl
                                                label="Input size"
                                                value={attributes?.form?.input_size}
                                                options={[
                                                    { label: 'Extra Small', value: 'extra-small' },
                                                    { label: 'Small', value: 'small' },
                                                    { label: 'Medium', value: 'medium' },
                                                    { label: 'Large', value: 'large' },
                                                ]}
                                                labelPosition="edge"
                                                className="wpformbuilder-input-size-select"
                                                onChange={(newValue) => setAttributes({ form: { ...attributes?.form, input_size: newValue } })}
                                            />
                                            <SelectControl
                                                label="Validate type"
                                                value={attributes?.form?.validate_type}
                                                options={[
                                                    { label: 'HTML 5', value: 'html5' },
                                                    { label: 'Inline', value: 'inline' },
                                                ]}
                                                labelPosition="edge"
                                                className="wpformbuilder-input-size-select"
                                                onChange={(newValue) => setAttributes({ form: { ...attributes?.form, validate_type: newValue } })}
                                            />
                                            <__experimentalDivider margin="1" />
                                            <Flex>
                                                <FlexItem>
                                                    <label>Hide Label</label>
                                                </FlexItem>
                                                <FlexItem className="wpformbuilder-no-margin-bootom">
                                                    <ToggleControl
                                                        __nextHasNoMarginBottom={true}
                                                        checked={attributes?.form?.hide_label}
                                                        onChange={(toogle) => setAttributes({ form: { ...attributes?.form, hide_label: toogle } })} // Đang ở đây, làm hide label
                                                    />
                                                </FlexItem>
                                            </Flex>
                                            <Flex style={{ marginTop: '10px' }}>
                                                <FlexItem>
                                                    <label>Preview</label>
                                                </FlexItem>
                                                <FlexItem className="wpformbuilder-no-margin-bootom">
                                                    <ToggleControl
                                                        __nextHasNoMarginBottom={true}
                                                        checked={attributes?.form?.preview ?? false}
                                                        onChange={(toggle) => setAttributes({ form: { ...attributes?.form, preview: toggle } })}
                                                    />
                                                </FlexItem>
                                            </Flex>
                                        </div>
                                    </PanelBody>
                                    <PanelBody title={__('Buttons')} opened={attributes?.state?.section === 'buttons'} onToggle={() => handleSetOpenSection('buttons')} className="wpformbuilder-panel-toggle">
                                        <div className='wpformbuilder-buttons-settings'>
                                            <__experimentalInputControl
                                                label="Submit"
                                                labelPosition="edge"
                                                value={attributes?.button?.name}
                                                type="text"
                                                onChange={(newValue) => setAttributes({ button: { ...attributes?.button, name: newValue } })}
                                                className='wpformbuilder-width-33 wpformbuilder-text-capitalize'
                                            />
                                            <SelectControl
                                                label="Size"
                                                value={attributes?.button?.size ?? 'sm'}
                                                options={[
                                                    { label: 'Extra Small', value: 'xs' },
                                                    { label: 'Small', value: 'sm' },
                                                    { label: 'Medium', value: 'md' },
                                                    { label: 'Large', value: 'lg' },
                                                    { label: 'Extra Large', value: 'xl' }
                                                ]}
                                                labelPosition="edge"
                                                className="wpformbuilder-buttons-select"
                                                onChange={(newValue) => setAttributes({ button: { ...attributes?.button, size: newValue } })}
                                            />
                                            <Flex style={{ marginBottom: '10px' }}>
                                                <FlexItem>
                                                    <LabelResponsive
                                                        label="Width"
                                                        attributes={attributes}
                                                        setAttributes={setAttributes}
                                                    />
                                                </FlexItem>
                                                <FlexItem className="wpformbuilder-flex-block-no-margin">
                                                    <SelectControl
                                                        value={attributes?.style?.button?.[device]?.['width']}
                                                        options={[
                                                            { label: '20%', value: '20%' },
                                                            { label: '25%', value: '25%' },
                                                            { label: '30%', value: '30%' },
                                                            { label: '33%', value: '33%' },
                                                            { label: '40%', value: '40%' },
                                                            { label: '50%', value: '50%' },
                                                            { label: '60%', value: '60%' },
                                                            { label: '66%', value: '66%' },
                                                            { label: '70%', value: '70%' },
                                                            { label: '75%', value: '75%' },
                                                            { label: '80%', value: '80%' },
                                                            { label: '100%', value: '100%' },
                                                            { label: 'Default', value: '' },
                                                        ]}
                                                        labelPosition="edge"
                                                        onChange={(newValue) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, [device]: { ...attributes?.style?.button?.[device], 'width': newValue } } } })}
                                                    />
                                                </FlexItem>
                                            </Flex>
                                            <IconControl label="Icon" attributes={attributes} setAttributes={setAttributes} />
                                            {(attributes?.button?.icon?.type !== 'none' && (attributes?.button?.icon?.name || attributes?.button?.icon?.url)) && (
                                                <>
                                                    <Flex style={{ 'margin-top': '10px' }}>
                                                        <FlexItem>
                                                            <label>Icon Position</label>
                                                        </FlexItem>
                                                        <FlexItem style={{ 'margin-top': '-5px', marginBottom: '10px' }}>
                                                            <__experimentalToggleGroupControl
                                                                __nextHasNoMarginBottom
                                                                isBlock
                                                                onChange={(newValue) => setAttributes({ button: { ...attributes?.button, icon: { ...attributes?.button?.icon, position: newValue ?? 'right' } } })}
                                                                className="wpformbuilder-button-options"
                                                                value={attributes?.style?.button?.icon?.position ?? 'right'}
                                                            >
                                                                <__experimentalToggleGroupControlOptionIcon
                                                                    icon={<Icon icon={arrowLeft} width={18} />}
                                                                    label="Left"
                                                                    value="left"
                                                                    className={`wpformbuilder-button-toggle-icon-position`}
                                                                    style={{ borderRight: '1px solid #8f8f8f' }}
                                                                />
                                                                <__experimentalToggleGroupControlOptionIcon
                                                                    icon={<Icon icon={arrowRight} width={18} />}
                                                                    label="Right"
                                                                    value="right"
                                                                    className={`wpformbuilder-button-toggle-icon-position`}
                                                                />
                                                            </__experimentalToggleGroupControl>
                                                        </FlexItem>
                                                    </Flex>
                                                    <__experimentalUnitControl
                                                        label="Icon Spacing"
                                                        className='wpformbuilder-width-70 wpformbuilder-text-capitalize'
                                                        labelPosition="edge"
                                                        onChange={(newValue) =>
                                                            setAttributes({
                                                                button: {
                                                                    ...attributes.button,
                                                                    icon: {
                                                                        ...attributes.button.icon,
                                                                        spacing: newValue
                                                                    }
                                                                }
                                                            })
                                                        }
                                                        value={attributes?.button?.icon?.spacing ?? "10px"}
                                                        unit={getUnit(attributes?.button?.icon?.spacing)}
                                                        min={0}
                                                        max={9999}
                                                        step={1}
                                                    />
                                                    <__experimentalDivider margin="1" />
                                                    <__experimentalInputControl
                                                        label="Previous Button"
                                                        labelPosition="side"
                                                        value={attributes?.button?.previous?.label ?? 'Previous'}
                                                        onChange={(newValue) =>
                                                            setAttributes({
                                                                button: {
                                                                    ...attributes?.button,
                                                                    previous: {
                                                                        ...attributes?.button?.previous,
                                                                        label: newValue
                                                                    }
                                                                }
                                                            })
                                                        }
                                                        className='wpformbuilder-text-capitalize'
                                                    />
                                                    <IconControl
                                                        label="Previous Icon"
                                                        attributes={attributes}
                                                        setAttributes={setAttributes}
                                                        value={attributes?.button?.previous?.icon}
                                                        onChange={(newValue) =>
                                                            setAttributes({
                                                                button: {
                                                                    ...attributes?.button,
                                                                    previous: {
                                                                        ...attributes?.button?.previous,
                                                                        icon: newValue
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </PanelBody>
                                    <PanelBody title={__('Actions After Submit')} opened={attributes?.state?.section === 'action-submit'} onToggle={() => handleSetOpenSection('action-submit')} className="wpformbuilder-panel-toggle">
                                        <div className='wpformbuilder-action-submit'>
                                            <FormTokenField
                                                __experimentalExpandOnFocus
                                                __nextHasNoMarginBottom
                                                label="Add Action"
                                                onChange={(newValue) => setAttributes({ action_submit: newValue })}
                                                suggestions={
                                                    [
                                                        'Email',
                                                        'Email 2',
                                                        'Mailchimp',
                                                        'Active Campaign',
                                                        'Brevo',
                                                        'SendFox',
                                                        'Mailerlite',
                                                        'Zoho CRM',
                                                        'Constantcontact',
                                                        'Google Sheets',
                                                        'Redirect',
                                                        'Stripe Payment',
                                                    ]
                                                }
                                                value={attributes?.action_submit ?? 'Email 2'}
                                                __experimentalShowHowTo={false}
                                            />
                                            <__experimentalDivider margin="1" />
                                            <Flex>
                                                <FlexItem>
                                                    <label>Save To Database</label>
                                                </FlexItem>
                                                <FlexItem className="wpformbuilder-no-margin-bootom">
                                                    <ToggleControl
                                                        __nextHasNoMarginBottom={true}
                                                        checked={attributes?.form?.save_to_database}
                                                        onChange={(toogle) => setAttributes({ form: { ...attributes?.form, save_to_database: toogle } })} // Đang ở đây, làm hide label
                                                    />
                                                </FlexItem>
                                            </Flex>
                                        </div>
                                    </PanelBody>
                                    {attributes?.action_submit.includes('Email') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Email')} opened={attributes?.state?.section === 'email'} onToggle={() => handleSetOpenSection('email')}>
                                            <EmailControl attributes={attributes} setAttributes={setAttributes} />
                                        </PanelBody>
                                    )}
                                    {attributes?.action_submit.includes('Email 2') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Email 2')} opened={attributes?.state?.section === 'email2'} onToggle={(toggle) => handleSetOpenSection('email2', toggle)}>
                                            <Email2Control attributes={attributes} setAttributes={setAttributes} />
                                        </PanelBody>
                                    )}

                                    {attributes?.action_submit.includes('Mailchimp') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Mailchimp')} opened={attributes?.state?.section === 'mailchimp'} onToggle={(toggle) => handleSetOpenSection('mailchimp', toggle)}>
                                            <MailchimpApiControl attributes={attributes} setAttributes={setAttributes} />
                                        </PanelBody>
                                    )}
                                    {attributes?.action_submit.includes('Active Campaign') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Active Campaign')} opened={attributes?.state?.section === 'activecampaign'} onToggle={(toggle) => handleSetOpenSection('activecampaign', toggle)}>
                                            <ActivecampaignApiControl attributes={attributes} setAttributes={setAttributes} />
                                        </PanelBody>
                                    )}

                                    {attributes?.action_submit.includes('Brevo') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Brevo')} opened={attributes?.state?.section === 'brevo'} onToggle={(toggle) => handleSetOpenSection('brevo', toggle)}>
                                            <BrevoApiControl
                                                attributes={attributes}
                                                setAttributes={setAttributes}
                                            />
                                        </PanelBody>
                                    )}
                                    {attributes?.action_submit.includes('SendFox') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('SendFox')} opened={attributes?.state?.section === 'sendfox'} onToggle={(toggle) => handleSetOpenSection('sendfox', toggle)}>
                                            <SendFoxApiControl
                                                attributes={attributes}
                                                setAttributes={setAttributes}
                                            />
                                        </PanelBody>
                                    )}
                                    {attributes?.action_submit.includes('Mailerlite') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Mailerlite')} opened={attributes?.state?.section === 'mailerlite'} onToggle={(toggle) => handleSetOpenSection('mailerlite', toggle)}>
                                            <MailerliteApiControl
                                                attributes={attributes}
                                                setAttributes={setAttributes}
                                            />
                                        </PanelBody>
                                    )}

                                    {attributes?.action_submit.includes('Zoho CRM') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Zoho CRM')} opened={attributes?.state?.section === 'zohocrm'} onToggle={(toggle) => handleSetOpenSection('zohocrm', toggle)}>
                                            <ZohoCRMApiControl
                                                attributes={attributes}
                                                setAttributes={setAttributes}
                                            />
                                        </PanelBody>
                                    )}
                                    {attributes?.action_submit.includes('Constantcontact') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Constant Contact')} opened={attributes?.state?.section === 'constantcontact'} onToggle={(toggle) => handleSetOpenSection('constantcontact', toggle)}>
                                            <ConstantcontactApiControl
                                                attributes={attributes}
                                                setAttributes={setAttributes}
                                            />
                                        </PanelBody>
                                    )}
                                    {attributes?.action_submit.includes('Redirect') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Redirect')} opened={attributes?.state?.section === 'redirect'} onToggle={(toggle) => handleSetOpenSection('redirect', toggle)}>
                                            <RedirectControl attributes={attributes} setAttributes={setAttributes} />
                                        </PanelBody>
                                    )}
                                    <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Google reCAPTCHA V3')} opened={attributes?.state?.section === 'recaptcha-v3'} onToggle={(toggle) => handleSetOpenSection('recaptcha-v3', toggle)}>
                                        <Flex>
                                            <FlexItem>
                                                <label>Enable</label>
                                            </FlexItem>
                                            <FlexItem className="wpformbuilder-no-margin-bootom">
                                                <ToggleControl
                                                    __nextHasNoMarginBottom={true}
                                                    checked={attributes?.action_submit_settings?.recaptcha_v3?.enabled ?? false}
                                                    onChange={(newValue) => handleChangeApiSettings('recaptcha_v3', 'enabled', newValue, attributes, setAttributes)}
                                                />
                                            </FlexItem>
                                        </Flex>
                                        {attributes?.action_submit_settings?.recaptcha_v3?.enabled && (
                                            <>
                                                <Flex style={{ 'margin-bottom': '15px', 'margin-top': '15px' }}>
                                                    <FlexItem>
                                                        <label>Set reCaptcha score?</label>
                                                    </FlexItem>
                                                    <FlexItem className="wpformbuilder-no-margin-bootom">
                                                        <ToggleControl
                                                            __nextHasNoMarginBottom={true}
                                                            checked={attributes?.action_submit_settings?.recaptcha_v3?.score_enabled ?? false}
                                                            onChange={(newValue) => handleChangeApiSettings('recaptcha_v3', 'score_enabled', newValue, attributes, setAttributes)}
                                                        />
                                                    </FlexItem>
                                                </Flex>
                                                {attributes?.action_submit_settings?.recaptcha_v3?.score_enabled && (
                                                    <__experimentalNumberControl
                                                        label="Score"
                                                        labelPosition="edge"
                                                        onChange={(newValue) => handleChangeApiSettings('recaptcha_v3', 'score', newValue, attributes, setAttributes)}
                                                        value={attributes?.action_submit_settings?.recaptcha_v3?.score ?? '0.5'}
                                                        className="wpformbuilder-recaptcha-v3-score"
                                                        help="Set the minimum score required to pass the reCAPTCHA check (0.0 - 1.0). Default is 0.5."
                                                        step={0.1}
                                                        min={0.0}
                                                        max={1.0}
                                                    />
                                                )}
                                                <Flex style={{ 'margin-bottom': '15px', 'margin-top': '15px' }}>
                                                    <FlexItem>
                                                        <label>Hide reCaptcha badge?</label>
                                                    </FlexItem>
                                                    <FlexItem className="wpformbuilder-no-margin-bootom">
                                                        <ToggleControl
                                                            __nextHasNoMarginBottom={true}
                                                            checked={attributes?.action_submit_settings?.recaptcha_v3?.hide_badge ?? false}
                                                            onChange={(newValue) => handleChangeApiSettings('recaptcha_v3', 'hide_badge', newValue, attributes, setAttributes)}
                                                        />
                                                    </FlexItem>
                                                </Flex>
                                                <__experimentalInputControl
                                                    label="Error verifying message"
                                                    labelPosition="top"
                                                    value={attributes?.action_submit_settings?.recaptcha_v3?.error_message ?? `Error verifying reCAPTCHA. Please try again.`}
                                                    type="text"
                                                    onChange={(newValue) => handleChangeAdditionalOptions('messages', 'success', newValue)}
                                                />
                                            </>
                                        )}
                                    </PanelBody>
                                    <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Google Sheets')} opened={attributes?.state?.section === 'google-sheets'} onToggle={(toggle) => handleSetOpenSection('google-sheets', toggle)}>
                                        <GoogleSheetsApiControl attributes={attributes} setAttributes={setAttributes} />
                                    </PanelBody>
                                    {attributes?.action_submit.includes('Stripe Payment') && (
                                        <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Stripe Payment')} opened={attributes?.state?.section === 'stripe-payment'} onToggle={(toggle) => handleSetOpenSection('stripe-payment', toggle)}>
                                            <WPformbuilderStripePaymentSettings attributes={attributes} setAttributes={setAttributes} />
                                        </PanelBody>
                                    )}
                                    <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Steps Settings')} opened={attributes?.state?.section === 'step-settings'} onToggle={() => handleSetOpenSection('step-settings')}>
                                        <SelectControl
                                            label="Type"
                                            value={attributes?.step_settings?.type ? attributes?.step_settings?.type : 'number'}
                                            options={[
                                                { label: 'Number', value: 'number' },
                                                { label: 'Text', value: 'text' },
                                                { label: 'Nunber & Text', value: 'number_text' },
                                                { label: 'Icon', value: 'icon' },
                                                { label: 'Icon & Text', value: 'icon_text' },
                                                { label: 'None', value: 'none' },
                                            ]}
                                            labelPosition="edge"
                                            className="wpformbuilder-buttons-select"
                                            onChange={(newValue) => setAttributes({ ...attributes, step_settings: { ...attributes?.step_settings, type: newValue } })}
                                        />
                                        {['number_text', 'number', 'icon_text', 'icon'].includes(attributes?.step_settings?.type) && (
                                            <SelectControl
                                                label="Shape"
                                                value={attributes?.step_settings?.shape ? attributes?.step_settings?.shape : 'circle'}
                                                options={[
                                                    { label: 'Circle', value: 'circle' },
                                                    { label: 'Square', value: 'square' },
                                                ]}
                                                labelPosition="edge"
                                                className="wpformbuilder-buttons-select"
                                                onChange={(newValue) => setAttributes({ ...attributes, step_settings: { ...attributes?.step_settings, shape: newValue } })}
                                            />
                                        )}
                                    </PanelBody>
                                    <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Additional Options')} opened={attributes?.state?.section === 'additional-options'} onToggle={(toggle) => handleSetOpenSection('additional-options', toggle)}>
                                        <__experimentalInputControl
                                            label="Success Message"
                                            labelPosition="top"
                                            value={attributes?.additional_options?.messages?.success ?? `Your submission was successful.`}
                                            type="text"
                                            onChange={(newValue) => handleChangeAdditionalOptions('messages', 'success', newValue)}
                                        />
                                        <__experimentalInputControl
                                            label="Form Error"
                                            labelPosition="top"
                                            value={attributes?.additional_options?.messages?.eror ?? `Your submission failed because of an error.`}
                                            type="text"
                                            onChange={(newValue) => handleChangeAdditionalOptions('messages', 'error', newValue)}
                                        />
                                        <__experimentalInputControl
                                            label="Member Exists"
                                            labelPosition="top"
                                            value={attributes?.additional_options?.messages?.member_exists ?? `Your submission failed because of an error.`}
                                            type="text"
                                            help="For API (mailchimp, activecampaign...)"
                                            onChange={(newValue) => handleChangeAdditionalOptions('messages', 'member_exists', newValue)}
                                        />
                                        <__experimentalDivider margin="2" />
                                        <__experimentalHeading level={3}
                                            style={{ 'text-transform': 'capitalize', fontSize: '13px' }}
                                        >
                                            Payment Messages
                                        </__experimentalHeading>
                                        <__experimentalInputControl
                                            label="Payment Success"
                                            labelPosition="top"
                                            value={attributes?.additional_options?.messages?.payment_success ?? `Payment Success.`}
                                            type="text"
                                            onChange={(newValue) => handleChangeAdditionalOptions('messages', 'payment_success', newValue)}
                                        />
                                        <__experimentalInputControl
                                            label="Payment Faild"
                                            labelPosition="top"
                                            value={attributes?.additional_options?.messages?.payment_faild ?? `Payment Faild.`}
                                            type="text"
                                            onChange={(newValue) => handleChangeAdditionalOptions('messages', 'payment_faild', newValue)}
                                        />
                                        <__experimentalInputControl
                                            label="Payment Pending"
                                            labelPosition="top"
                                            value={attributes?.additional_options?.messages?.payment_pending ?? `Payment Pending.`}
                                            type="text"
                                            onChange={(newValue) => handleChangeAdditionalOptions('messages', 'payment_pending', newValue)}
                                        />
                                    </PanelBody>
                                </>
                            )}
                            {attributes.state.openTab === 'style' && (
                                <>
                                    <PanelBody title={__('Form')} opened={attributes?.state?.section === 'form-style'} onToggle={() => handleSetOpenSection('form-style')} className="wpformbuilder-panel-toggle">
                                        <Flex>
                                            <FlexItem>
                                                <LabelResponsive
                                                    label="Columns Gap"
                                                    attributes={attributes} // Xem có cần bỏ không, ko có tác dụng gì
                                                    setAttributes={setAttributes}
                                                />
                                            </FlexItem>
                                            <FlexItem>
                                                <__experimentalUnitControl
                                                    onChange={(newValue) => setFormStyle(newValue, 'column_gap', 'value')}
                                                    onUnitChange={(newValue) => setFormStyle(newValue, 'column_gap', 'unit')}
                                                    value={attributes?.style?.form?.[device]?.column_gap?.value}
                                                    unit={attributes?.style?.form?.[device]?.column_gap?.unit ?? 'px'}
                                                    min={0}
                                                    max={9999}
                                                    step={1}
                                                />
                                            </FlexItem>
                                        </Flex>
                                        <Flex>
                                            <FlexItem>
                                                <LabelResponsive
                                                    label="Rows Gap"
                                                    attributes={attributes}
                                                    setAttributes={setAttributes}
                                                />
                                            </FlexItem>
                                            <FlexItem>
                                                <__experimentalUnitControl
                                                    onChange={(newValue) => setFormStyle(newValue, 'row_gap', 'value')}
                                                    onUnitChange={(newValue) => setFormStyle(newValue, 'row_gap', 'unit')}
                                                    value={attributes?.style?.form?.[device]?.row_gap?.value}
                                                    unit={attributes?.style?.form?.[device]?.row_gap?.unit}
                                                    min={0}
                                                    max={9999}
                                                    step={1}
                                                />
                                            </FlexItem>
                                        </Flex>
                                        <__experimentalDivider margin="2" />
                                        <WPFormbuilderColorPicker
                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, form: { ...attributes?.style?.form, desktop: { ...attributes?.style?.form?.desktop, 'background-color': newColor } } } })}
                                            value={attributes?.style?.form?.desktop?.['background-color']}
                                            onReset={() => setAttributes({ style: { ...attributes?.style, form: { ...attributes?.style?.form, desktop: { ...attributes?.style?.form?.desktop, 'background-color': '' } } } })}
                                            label='Background Color'
                                        />
                                        <__experimentalDivider margin="2" />
                                        <WPFrombuilderBorder attributes={attributes} setAttributes={setAttributes} property='form' />
                                        <__experimentalDivider margin="2" />
                                        <WPFrombuilderDimensions label='Radius' value={attributes?.style?.form?.desktop?.border?.radius} onChange={(newValue) => handleChangeBorderRadius(newValue, 'form')} />
                                        <__experimentalDivider margin="1" />
                                        <WPFrombuilderDimensions label='Padding' value={attributes?.style?.form?.desktop?.padding} onChange={(newValue) => handleSpacing(newValue, 'form', 'padding')} />
                                        <WPFrombuilderDimensions label='Margin' value={attributes?.style?.form?.desktop?.margin} onChange={(newValue) => handleSpacing(newValue, 'form', 'margin')} />
                                    </PanelBody>
                                    <PanelBody title={__('Label')} opened={attributes?.state?.section === 'label-style'} onToggle={() => handleSetOpenSection('label-style')} className="wpformbuilder-panel-toggle">
                                        <WPFormbuilderColorPicker
                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, label: { ...attributes?.style?.label, desktop: { ...attributes?.style?.label?.desktop, color: newColor } } } })} // Đang ở đây, làm onchange
                                            value={attributes?.style?.label?.desktop?.color}
                                            onReset={() => setAttributes({ style: { ...attributes?.style, label: { ...attributes?.style?.label, desktop: { ...attributes?.style?.label?.desktop, color: '' } } } })}
                                        />
                                        <__experimentalUnitControl
                                            label="Spacing"
                                            className="wpformbuilder-form-label-settings"
                                            style={{ 'margin-top': '10px' }}
                                            onChange={(newValue) =>
                                                setAttributes({
                                                    ...attributes,
                                                    style: {
                                                        ...attributes.style,
                                                        label: {
                                                            ...attributes.style.label,
                                                            desktop: {
                                                                ...attributes.style.label.desktop,
                                                                spacing: newValue
                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                            value={attributes?.style?.label?.desktop?.spacing ?? ""}
                                            unit={getUnit(attributes?.style?.label?.desktop?.spacing)}
                                            min={0}
                                            max={9999}
                                            step={1}
                                        />

                                        <WPFrombuilderTypography attributes={attributes} setAttributes={setAttributes} onChange={(newValue, attrName) => handleChangeFormTypography(newValue, attrName, 'label')} device={device} property='label' />
                                    </PanelBody>
                                    <PanelBody title={__('Field')} opened={attributes?.state?.section === 'field-style'} onToggle={() => handleSetOpenSection('field-style')} className="wpformbuilder-panel-toggle">
                                        <WPFormbuilderColorPicker
                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, field: { ...attributes?.style?.field, desktop: { ...attributes?.style?.field?.desktop, color: newColor } } } })}
                                            value={attributes?.style?.field?.desktop?.color}
                                            onReset={() => setAttributes({ style: { ...attributes?.style, field: { ...attributes?.style?.field, desktop: { ...attributes?.style?.field?.desktop, color: '' } } } })}
                                        />
                                        <__experimentalSpacer marginTop='3'>
                                            <WPFrombuilderTypography attributes={attributes} setAttributes={setAttributes} onChange={(newValue, attrName) => handleChangeFormTypography(newValue, attrName, 'field')} device={device} property='field' />
                                        </__experimentalSpacer>
                                        <__experimentalDivider margin="2" />
                                        <WPFormbuilderColorPicker
                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, field: { ...attributes?.style?.field, desktop: { ...attributes?.style?.field?.desktop, 'background-color': newColor } } } })}
                                            value={attributes?.style?.field?.desktop?.['background-color']}
                                            onReset={() => setAttributes({ style: { ...attributes?.style, field: { ...attributes?.style?.field, desktop: { ...attributes?.style?.field?.desktop, 'background-color': '' } } } })}
                                            label='Background Color'
                                        />
                                        <__experimentalDivider margin="2" />
                                        <WPFrombuilderBorder attributes={attributes} setAttributes={setAttributes} property='field' />
                                        <__experimentalDivider margin="2" />
                                        <WPFrombuilderDimensions label='Radius' value={attributes?.style?.field?.desktop?.border?.radius} onChange={(newValue) => handleChangeBorderRadius(newValue, 'field')} />
                                        <__experimentalDivider margin="1" />
                                        <WPFrombuilderDimensions label='Padding' value={attributes?.style?.field?.desktop?.padding} onChange={(newValue) => handleSpacing(newValue, 'field', 'padding')} />
                                        <WPFrombuilderDimensions label='Margin' value={attributes?.style?.field?.desktop?.margin} onChange={(newValue) => handleSpacing(newValue, 'field', 'margin')} />
                                    </PanelBody>
                                    <PanelBody title={__('Button Submit')} opened={attributes?.state?.section === 'button-submit'} onToggle={() => handleSetOpenSection('button-submit')} className="wpformbuilder-panel-toggle">
                                        <Flex style={{ 'margin-bottom': '15px' }}>
                                            <FlexItem>
                                                <label>Text Align</label>
                                            </FlexItem>
                                            <FlexItem style={{ 'margin-top': '-5px' }}>
                                                <__experimentalToggleGroupControl
                                                    __nextHasNoMarginBottom
                                                    isBlock
                                                    isDeselectable={true}
                                                    onChange={(newValue) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, 'text-align': newValue ?? '' } } } })}
                                                    className="wpformbuilder-button-options"
                                                    value={attributes?.style?.button?.desktop?.['text-align']}
                                                >
                                                    <__experimentalToggleGroupControlOptionIcon
                                                        icon={<Icon icon={alignLeft} width={18} />}
                                                        label="Left"
                                                        value="left"
                                                        className={`wpformbuilder-button-toggle-position-option`}
                                                    />
                                                    <__experimentalToggleGroupControlOptionIcon
                                                        icon={<Icon icon={alignCenter} width={18} />}
                                                        label="Center"
                                                        value="center"
                                                        className={`wpformbuilder-button-toggle-position-option`}
                                                    />
                                                    <__experimentalToggleGroupControlOptionIcon
                                                        icon={<Icon icon={alignRight} width={18} />}
                                                        label="Right"
                                                        value="right"
                                                        className={`wpformbuilder-button-toggle-position-option`}
                                                    />
                                                    <__experimentalToggleGroupControlOptionIcon
                                                        icon={<Icon icon={alignJustify} width={18} />}
                                                        label="Justify"
                                                        value="justify"
                                                        className={`wpformbuilder-button-toggle-position-option no-border-right`}
                                                    />
                                                </__experimentalToggleGroupControl>
                                            </FlexItem>
                                        </Flex>
                                        <WPFrombuilderTypography attributes={attributes} setAttributes={setAttributes} onChange={(newValue, attrName) => handleChangeFormTypography(newValue, attrName, 'button')} device={device} property='button' />
                                        <WPFrombuilderBorder attributes={attributes} setAttributes={setAttributes} property='button' focusColor={false} style={{ 'margin-top': '15px' }} />
                                        <WPFrombuilderDimensions label='Radius' value={attributes?.style?.button?.desktop?.border?.radius} onChange={(newValue) => handleChangeBorderRadius(newValue, 'button')} />
                                        <__experimentalDivider margin="1" />
                                        <WPFrombuilderDimensions label='Padding' value={attributes?.style?.button?.desktop?.padding} onChange={(newValue) => handleSpacing(newValue, 'button', 'padding')} />
                                        <WPFrombuilderDimensions label='Margin' value={attributes?.style?.button?.desktop?.margin} onChange={(newValue) => handleSpacing(newValue, 'button', 'margin')} />
                                        <__experimentalDivider margin="1" />
                                        <TabPanel
                                            className="wpformbuilder-tab-panel-button-style"
                                            activeClass="active-tab"
                                            onSelect={(tabName) => setAttributes({ state: { ...attributes?.state, inRepeater: tabName } })}
                                            initialTabName={attributes?.state?.inRepeater}
                                            tabs={[
                                                {
                                                    name: 'normal',
                                                    title: 'Normal',
                                                    className: 'wpformbuilder-tab-button-normal',
                                                },
                                                {
                                                    name: 'hover',
                                                    title: 'Hover',
                                                    className: 'wpformbuilder-tab-button-hover',
                                                },
                                            ]}
                                        >
                                            {(tabs) => <div>
                                                {attributes?.state?.inRepeater == 'normal' && ( // Đang ở đây làm thuộc tính hover và normal color và bg color
                                                    <>
                                                        <WPFormbuilderColorPicker
                                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, color: newColor } } } })}
                                                            value={attributes?.style?.button?.desktop?.color}
                                                            onReset={() => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, color: '' } } } })}
                                                            label='Color'
                                                        />
                                                        <WPFormbuilderColorPicker
                                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, 'background-color': newColor } } } })}
                                                            value={attributes?.style?.button?.desktop?.['background-color']}
                                                            onReset={() => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, 'background-color': '' } } } })}
                                                            label='Background Color'
                                                        />
                                                    </>
                                                )}
                                                {attributes?.state?.inRepeater == 'hover' && (
                                                    <>
                                                        <WPFormbuilderColorPicker
                                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, hoverColor: newColor } } } })}
                                                            value={attributes?.style?.button?.desktop?.hoverColor}
                                                            onReset={() => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, hoverColor: '' } } } })}
                                                            label='Color'
                                                        />
                                                        <WPFormbuilderColorPicker
                                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, backgroundHoverColor: newColor } } } })}
                                                            value={attributes?.style?.button?.desktop?.backgroundHoverColor}
                                                            onReset={() => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, backgroundHoverColor: '' } } } })}
                                                            label='Background Color'
                                                        />
                                                    </>
                                                )}
                                            </div>}
                                        </TabPanel>
                                    </PanelBody>
                                    <PanelBody title={__('Next/Previous Button')} opened={attributes?.state?.section === 'next-pre-button'} onToggle={() => handleSetOpenSection('next-pre-button')} className="wpformbuilder-panel-toggle">
                                        <WPFrombuilderTypography attributes={attributes} setAttributes={setAttributes} onChange={(newValue, attrName) => handleChangeFormTypography(newValue, attrName, 'next_prev_button')} device={device} property='next_button' />
                                        <WPFrombuilderBorder attributes={attributes} setAttributes={setAttributes} property='next_prev_button' focusColor={false} style={{ 'margin-top': '15px' }} />

                                        <WPFrombuilderDimensions label='Radius' value={attributes?.style?.next_prev_button?.desktop?.border?.radius} onChange={(newValue) => handleChangeBorderRadius(newValue, 'next_prev_button')} />
                                        <__experimentalDivider margin="1" />
                                        <WPFrombuilderDimensions label='Padding' value={attributes?.style?.next_prev_button?.desktop?.padding} onChange={(newValue) => handleSpacing(newValue, 'next_prev_button', 'padding')} />
                                        <WPFrombuilderDimensions label='Margin' value={attributes?.style?.next_prev_button?.desktop?.margin} onChange={(newValue) => handleSpacing(newValue, 'next_prev_button', 'margin')} />
                                        <__experimentalDivider margin="1" />
                                        <TabPanel
                                            className="wpformbuilder-tab-panel-button-style"
                                            activeClass="active-tab"
                                            onSelect={(tabName) => setAttributes({ state: { ...attributes?.state, inRepeater: tabName } })}
                                            initialTabName={attributes?.state?.inRepeater}
                                            tabs={[
                                                {
                                                    name: 'normal',
                                                    title: 'Normal',
                                                    className: 'wpformbuilder-tab-button-normal',
                                                },
                                                {
                                                    name: 'hover',
                                                    title: 'Hover',
                                                    className: 'wpformbuilder-tab-button-hover',
                                                },
                                            ]}
                                        >
                                            {(tabs) => <div>
                                                {attributes?.state?.inRepeater == 'normal' && ( // Đang ở đây làm thuộc tính hover và normal color và bg color
                                                    <>
                                                        <WPFormbuilderColorPicker
                                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, color: newColor } } } })}
                                                            value={attributes?.style?.button?.desktop?.color}
                                                            onReset={() => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, color: '' } } } })}
                                                            label='Color'
                                                        />
                                                        <WPFormbuilderColorPicker
                                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, 'background-color': newColor } } } })}
                                                            value={attributes?.style?.button?.desktop?.['background-color']}
                                                            onReset={() => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, 'background-color': '' } } } })}
                                                            label='Background Color'
                                                        />
                                                    </>
                                                )}
                                                {attributes?.state?.inRepeater == 'hover' && (
                                                    <>
                                                        <WPFormbuilderColorPicker
                                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, hoverColor: newColor } } } })}
                                                            value={attributes?.style?.button?.desktop?.hoverColor}
                                                            onReset={() => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, hoverColor: '' } } } })}
                                                            label='Color'
                                                        />
                                                        <WPFormbuilderColorPicker
                                                            onChange={(newColor) => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, backgroundHoverColor: newColor } } } })}
                                                            value={attributes?.style?.button?.desktop?.backgroundHoverColor}
                                                            onReset={() => setAttributes({ style: { ...attributes?.style, button: { ...attributes?.style?.button, desktop: { ...attributes?.style?.button?.desktop, backgroundHoverColor: '' } } } })}
                                                            label='Background Color'
                                                        />
                                                    </>
                                                )}
                                            </div>}
                                        </TabPanel>
                                    </PanelBody>
                                    <PanelBody className="wpformbuilder-action-section wpformbuilder-panel-toggle" title={__('Steps')} opened={attributes?.state?.section === 'step-css'} onToggle={() => handleSetOpenSection('step-css')}>
                                        <WPFrombuilderTypography attributes={attributes} setAttributes={setAttributes} onChange={(newValue, attrName) => handleChangeFormTypography(newValue, attrName, 'step')} device={device} property='step' />
                                        <__experimentalUnitControl
                                            label="Spacing"
                                            className="wpformbuilder-form-label-settings"
                                            style={{ 'margin-top': '10px' }}
                                            onChange={(newValue) =>
                                                setAttributes({
                                                    ...attributes,
                                                    style: {
                                                        ...attributes.style,
                                                        step: {
                                                            ...attributes.style.step,
                                                            desktop: {
                                                                ...attributes.style.step?.desktop,
                                                                spacing: newValue
                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                            value={attributes?.style?.step?.desktop?.spacing ?? ""}
                                            unit={getUnit(attributes?.style?.step?.desktop?.spacing)}
                                            min={0}
                                            max={999}
                                            step={1}
                                        />
                                        {['number', 'icon', 'number_text'].includes(attributes?.step_settings?.type) && (
                                            <__experimentalUnitControl
                                                label="Padding"
                                                className="wpformbuilder-form-label-settings"
                                                style={{ 'margin-top': '10px' }}
                                                onChange={(newValue) =>
                                                    setAttributes({
                                                        ...attributes,
                                                        style: {
                                                            ...attributes.style,
                                                            step: {
                                                                ...attributes.style.step,
                                                                desktop: {
                                                                    ...attributes.style.step?.desktop,
                                                                    step_padding: newValue
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                                value={attributes?.style?.step?.desktop?.step_padding ?? ""}
                                                unit={'px'}
                                                min={0}
                                                max={999}
                                                step={1}
                                            />
                                        )}
                                        {attributes?.step_settings?.type !== 'none' && (
                                            <>
                                                <__experimentalUnitControl
                                                    label="Divider Width"
                                                    className="wpformbuilder-form-label-settings"
                                                    style={{ 'margin-top': '10px' }}
                                                    onChange={(newValue) =>
                                                        setAttributes({
                                                            ...attributes,
                                                            style: {
                                                                ...attributes.style,
                                                                step: {
                                                                    ...attributes.style.step,
                                                                    desktop: {
                                                                        ...attributes.style.step?.desktop,
                                                                        divider_width: newValue
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    }
                                                    value={attributes?.style?.step?.desktop?.divider_width ?? ""}
                                                    unit={'px'}
                                                    min={0}
                                                    max={200}
                                                    step={1}
                                                />
                                                <__experimentalUnitControl
                                                    label="Divider Gap"
                                                    className="wpformbuilder-form-label-settings"
                                                    style={{ 'margin-top': '10px' }}
                                                    onChange={(newValue) =>
                                                        setAttributes({
                                                            ...attributes,
                                                            style: {
                                                                ...attributes.style,
                                                                step: {
                                                                    ...attributes.style.step,
                                                                    desktop: {
                                                                        ...attributes.style.step?.desktop,
                                                                        divider_gap: newValue
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    }
                                                    value={attributes?.style?.step?.desktop?.divider_gap ?? ""}
                                                    unit={'px'}
                                                    min={0}
                                                    max={200}
                                                    step={1}
                                                />
                                                <__experimentalUnitControl
                                                    label="Divider Radius"
                                                    className="wpformbuilder-form-label-settings"
                                                    style={{ 'margin-top': '10px' }}
                                                    onChange={(newValue) =>
                                                        setAttributes({
                                                            ...attributes,
                                                            style: {
                                                                ...attributes.style,
                                                                step: {
                                                                    ...attributes.style.step,
                                                                    desktop: {
                                                                        ...attributes.style.step?.desktop,
                                                                        divider_radius: newValue
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    }
                                                    value={attributes?.style?.step?.desktop?.divider_radius ?? ""}
                                                    unit={'px'}
                                                    min={0}
                                                    max={200}
                                                    step={1}
                                                />
                                                <TabPanel
                                                    className="wpformbuilder-tab-panel-button-style"
                                                    activeClass="active-tab"
                                                    onSelect={(tabName) => setAttributes({ state: { ...attributes?.state, step: tabName } })}
                                                    initialTabName={attributes?.state?.step ?? 'inactive'}
                                                    tabs={[
                                                        {
                                                            name: 'inactive',
                                                            title: 'Inactive',
                                                            className: 'wpformbuilder-tab-button-normal wpformbuilder-tab-step',
                                                        },
                                                        {
                                                            name: 'active',
                                                            title: 'Active',
                                                            className: 'wpformbuilder-tab-button-hover wpformbuilder-tab-step active',
                                                        },
                                                        {
                                                            name: 'completed',
                                                            title: 'Completed',
                                                            className: 'wpformbuilder-tab-button-hover wpformbuilder-tab-step',
                                                        },
                                                    ]}
                                                >
                                                    {(tabs) => <div>
                                                        {attributes?.state?.step == 'inactive' && (
                                                            <>
                                                                <WPFormbuilderColorPicker
                                                                    onChange={(newColor) => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, inactiveColor: { ...attributes?.style?.step?.desktop?.inactiveColor, color: newColor } } } } })}
                                                                    value={attributes?.style?.step?.desktop?.inactiveColor?.color}
                                                                    onReset={() => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, inactiveColor: { ...attributes?.style?.step?.desktop?.inactiveColor, color: '' } } } } })}
                                                                    label='Text & Border Color'
                                                                />
                                                                <WPFormbuilderColorPicker
                                                                    onChange={(newColor) => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, inactiveColor: { ...attributes?.style?.step?.desktop?.inactiveColor, backgroundColor: newColor } } } } })}
                                                                    value={attributes?.style?.step?.desktop?.inactiveColor?.backgroundColor}
                                                                    onReset={() => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, inactiveColor: { ...attributes?.style?.step?.desktop?.inactiveColor, backgroundColor: '' } } } } })}
                                                                    label='Background Color'
                                                                />
                                                                <WPFormbuilderColorPicker
                                                                    onChange={(newColor) => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, inactiveColor: { ...attributes?.style?.step?.desktop?.inactiveColor, dividerColor: newColor } } } } })}
                                                                    value={attributes?.style?.step?.desktop?.inactiveColor?.dividerColor}
                                                                    onReset={() => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, inactiveColor: { ...attributes?.style?.step?.desktop?.inactiveColor, dividerColor: '' } } } } })}
                                                                    label='Divider Color'
                                                                />
                                                            </>
                                                        )}
                                                        {attributes?.state?.step == 'active' && (
                                                            <>
                                                                <WPFormbuilderColorPicker
                                                                    onChange={(newColor) => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, activeColor: { ...attributes?.style?.step?.desktop?.activeColor, color: newColor } } } } })}
                                                                    value={attributes?.style?.step?.desktop?.activeColor?.color}
                                                                    onReset={() => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, activeColor: { ...attributes?.style?.step?.desktop?.activeColor, color: '' } } } } })}
                                                                    label='Text & Border Color'
                                                                />
                                                                <WPFormbuilderColorPicker
                                                                    onChange={(newColor) => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, activeColor: { ...attributes?.style?.step?.desktop?.activeColor, backgroundColor: newColor } } } } })}
                                                                    value={attributes?.style?.step?.desktop?.activeColor?.backgroundColor}
                                                                    onReset={() => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, activeColor: { ...attributes?.style?.step?.desktop?.activeColor, backgroundColor: '' } } } } })}
                                                                    label='Background Color'
                                                                />
                                                                <WPFormbuilderColorPicker
                                                                    onChange={(newColor) => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, activeColor: { ...attributes?.style?.step?.desktop?.activeColor, dividerColor: newColor } } } } })}
                                                                    value={attributes?.style?.step?.desktop?.activeColor?.dividerColor}
                                                                    onReset={() => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, activeColor: { ...attributes?.style?.step?.desktop?.activeColor, dividerColor: '' } } } } })}
                                                                    label='Divider Color'
                                                                />
                                                            </>
                                                        )}
                                                        {attributes?.state?.step == 'completed' && (
                                                            <>
                                                                <WPFormbuilderColorPicker
                                                                    onChange={(newColor) => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, completedColor: { ...attributes?.style?.step?.desktop?.completedColor, color: newColor } } } } })}
                                                                    value={attributes?.style?.step?.desktop?.completedColor?.color}
                                                                    onReset={() => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, completedColor: { ...attributes?.style?.step?.desktop?.completedColor, color: '' } } } } })}
                                                                    label='Text & Border Color'
                                                                />
                                                                <WPFormbuilderColorPicker
                                                                    onChange={(newColor) => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, completedColor: { ...attributes?.style?.step?.desktop?.completedColor, backgroundColor: newColor } } } } })}
                                                                    value={attributes?.style?.step?.desktop?.completedColor?.backgroundColor}
                                                                    onReset={() => setAttributes({ style: { ...attributes?.style, step: { ...attributes?.style?.step, desktop: { ...attributes?.style?.step?.desktop, completedColor: { ...attributes?.style?.step?.desktop?.completedColor, backgroundColor: '' } } } } })}
                                                                    label='Background Color'
                                                                />
                                                            </>
                                                        )}
                                                    </div>}
                                                </TabPanel>
                                            </>
                                        )}
                                    </PanelBody>
                                    <PanelBody title={__('Custom CSS')} opened={attributes?.state?.section === 'custom-css'} onToggle={() => handleSetOpenSection('custom-css')} className="wpformbuilder-panel-toggle">
                                        <CssCustom
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                        />
                                    </PanelBody>
                                </>
                            )}
                        </div>
                        }
                    </TabPanel>
                </InspectorControls >
                <div {...attributeForm}>
                    <div className='wpformbuilder-form__inner' ref={formPreviewInteractionRef}>
                        {attributes?.step_settings?.type !== 'none' && (
                            <>
                                {stepPanels.length > 1 && (
                                    <nav className={`wpformbuilder-multi-step-form__progress ${attributes?.step_settings?.type}`} aria-label={__('Form steps', 'sunformbuilder-pro')}>
                                        <ol className="wpformbuilder-multi-step-form__progress-list">
                                            {stepPanels.map((panel, index) => {
                                                console.log('panel 2161------->: ', panel);
                                                const stepField = panel[panel.length - 1];
                                                const stepTitle = stepField?.type === 'step' ? (stepField.label || '').trim() : '';
                                                const stepNum = index + 1;
                                                /* Icon từng bước: lưu trên field type "step" (Step Icon), không phải trên mảng panel */
                                                const stepIconEl = renderIcon(stepField?.step_icon);
                                                const progressType = attributes?.step_settings?.type;
                                                const numClassName = `wpformbuilder-multi-step-form__progress-num ${attributes?.step_settings?.shape === 'square' ? 'square' : 'circle'}`;
                                                const progressActive = isPreviewMultistep
                                                    ? index === previewStepIndex
                                                    : index === 0;
                                                const progressComplete = isPreviewMultistep && index < previewStepIndex;
                                                const animIn =
                                                    progressConnectorAnim?.mode === 'in' &&
                                                    progressConnectorAnim.index === index;
                                                const animOut =
                                                    progressConnectorAnim?.mode === 'out' &&
                                                    progressConnectorAnim.index === index;
                                                return (
                                                    <li
                                                        key={`wpformbuilder-progress-${index}`}
                                                        className={`wpformbuilder-multi-step-form__progress-item${progressActive ? ' is-active' : ''}${progressComplete ? ' is-complete' : ''}${animIn ? ' wpformbuilder-progress-connector--animate-in' : ''}${animOut ? ' wpformbuilder-progress-connector--animate-out' : ''}`}
                                                        data-step-index={index}
                                                        {...(progressActive ? { 'aria-current': 'step' } : {})}
                                                        onAnimationEnd={(e) => {
                                                            if (
                                                                !e.target?.classList?.contains(
                                                                    'wpformbuilder-multi-step-form__progress-connector'
                                                                )
                                                            ) {
                                                                return;
                                                            }
                                                            setProgressConnectorAnim((current) =>
                                                                current?.index === index ? null : current
                                                            );
                                                        }}
                                                    >
                                                        <div className={`wpformbuilder-multi-step-form__progress-step ${stepField.id}`}>

                                                            {progressType === 'number_text' && (
                                                                <>
                                                                    <span className={numClassName}>{stepNum}</span>
                                                                    <span className="wpformbuilder-multi-step-form__progress-title">{stepTitle}</span>
                                                                </>
                                                            )}
                                                            {progressType === 'text' && (
                                                                <>
                                                                    <span className="wpformbuilder-multi-step-form__progress-title">{stepTitle}</span>
                                                                </>
                                                            )}
                                                            {progressType === 'icon_text' && (
                                                                <>
                                                                    <span className={numClassName}>{stepIconEl}</span>
                                                                    <span className="wpformbuilder-multi-step-form__progress-title">{stepTitle}</span>
                                                                </>
                                                            )}
                                                            {progressType === 'number' && (
                                                                <span className={numClassName}>{stepNum}</span>
                                                            )}
                                                            {progressType === 'icon' && (
                                                                <span className={numClassName}>{stepIconEl}</span>
                                                            )}
                                                        </div>
                                                        {index < stepPanels.length - 1 && (
                                                            <span className="wpformbuilder-multi-step-form__progress-connector" aria-hidden="true" />
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    </nav>
                                )}
                            </>
                        )}

                        {stepPanels.map((panel, panelIndex) => {
                            const panelHidden = isPreviewMultistep && panelIndex !== previewStepIndex;
                            return (
                                <div
                                    key={`wpformbuilder-step-panel-${panelIndex}`}
                                    className="wpformbuilder-multi-step-form__panel"
                                    data-step-index={panelIndex}
                                    style={{ width: '100%' }}
                                    hidden={panelHidden}
                                    aria-hidden={panelHidden ? 'true' : 'false'}
                                >
                                    <div className='wpformbuilder-multi-step-form__panel-inner' style={{ width: '100%' }}>
                                        {(() => {
                                            const stepIdx = panel.map((f) => f?.type).lastIndexOf('step');
                                            const hasStep = stepIdx !== -1;
                                            const fieldPanel = hasStep ? panel.slice(0, stepIdx) : panel;
                                            const stepItems = hasStep ? panel.slice(stepIdx) : [];
                                            return (
                                                <>
                                                    {fieldPanel.length > 0 && (
                                                        <div className="wpformbuilder-multi-step-form__panel-fields">
                                                            {fieldPanel.map((rawItem, index) =>
                                                                renderFormField(rawItem, rawItem?.id ?? `step-${panelIndex}-field-${index}`)
                                                            )}
                                                        </div>
                                                    )}
                                                    {stepItems.map((rawItem, index) =>
                                                        renderFormField(rawItem, rawItem?.id ?? `step-${panelIndex}-step-${index}`)
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* <div className='wpformbuilder-multiple-step-form-button'> */}
                    {/* <button type='button' class='wpformbuilder-multi-step-form__button--previous'>
                            {attributes?.button?.previous?.icon?.position === 'left' && renderConfiguredIcon(attributes?.button?.previous?.icon, 'marginRight')}
                            <span>{attributes?.button?.previous?.label ?? 'Previous'}</span>
                            {attributes?.button?.previous?.icon?.position !== 'left' && renderConfiguredIcon(attributes?.button?.previous?.icon, 'marginLeft')}
                        </button> */}

                    {/* </div> */}
                </div>
                {
                    css && (
                        <style type="text/css">{css}</style>
                    )
                }
            </>
        )
    },
});