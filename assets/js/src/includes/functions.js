import { default as minifyCssString } from 'minify-css-string'
import { attributes } from '../includes//attributes';
import { color, desktop, mobile } from '@wordpress/icons';

const { useState, useEffect, useRef } = wp.element;
const { useSelect } = wp.data;

const generateFormCSS = (attributes, multiStep = false) => {
    const devices = ['desktop', 'tablet', 'mobile'];
    let cssGapClass = `.wpformbuilder-form-${attributes?.form?.id}:not(.wp-block-wp-formbuilder-multi-step-form) .wpformbuilder-form__inner`;
    if (multiStep) {
        cssGapClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__panel .wpformbuilder-multi-step-form__panel-fields`;
    }
    const formStyle = attributes?.style ?? [];
    let cssOjb = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssGap = {
        desktop: '',
        tablet: '',
        mobile: ''
    }
    let cssString = '';
    let css_custom = '';
    for (const device of devices) {
        let cssAttributes = formStyle?.form?.[device] ?? {};
        let unit = 'px', value = '';
        Object.entries(cssAttributes).map(([key, item]) => {
            let cssName = key.replace(/_/g, "-");
            switch (key) {
                case 'column_gap':
                case 'row_gap':
                    value = item?.value ?? false;
                    cssGap[device] += value ? `${cssName}:${value};` : '';
                    break;
                case 'padding':
                case 'margin':
                    cssOjb[device] += getSpacingCSS(item, key);
                    break;
                case 'border':
                    const borderCSS = getBorderStyle(item);
                    cssOjb[device] += borderCSS?.borderCss;
                    if (borderCSS?.hoverColor && borderCSS?.hoverColor !== '') {
                        cssHover += `${buttonClass}:hover{border-color: ${borderCSS.hoverColor}}`;
                    }
                    if (borderCSS?.focusColor && borderCSS?.focusColor !== '') {
                        cssHover += `${buttonClass}:focus{border-color: ${borderCSS.focusColor}}`;
                    }
                    break;
                case 'css_custom':
                    css_custom = minifyCssString(item).replace('%root%', `.wpformbuilder-form-${attributes?.form?.id}`);
                    if (isValidCssRule(css_custom)) {
                        //console.log('item: ', item);
                    }
                    break;
                default:
                    cssOjb[device] += value ? `${key}:${item};` : '';
            }
        });
    }
    // For Column Gap and Row Gap
    if (cssGap.desktop !== '') {
        cssString += `${cssGapClass}{${cssGap.desktop}}`;
    }
    if (cssGap.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {${cssGapClass}{${cssGap.tablet}}}`;
    }
    if (cssGap.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {${cssGapClass}{${cssGap.mobile}}}`;
    }
    // For common
    if (cssOjb.desktop !== '') {
        cssString += `.wpformbuilder-form-${attributes?.form?.id}{${cssOjb.desktop}}`;
    }
    if (cssOjb.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {.wpformbuilder-form-${attributes?.form?.id}{${cssOjb.tablet}}}`;
    }
    if (cssOjb.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {.wpformbuilder-form-${attributes?.form?.id}{${cssOjb.mobile}}}`;
    }
    return minifyCssString(css_custom + cssString);
}

const generateLabelCSS = (attributes) => {
    const devices = ['desktop', 'tablet', 'mobile'];
    const labelClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-form-group label`;
    const formStyle = attributes?.style ?? [];
    let cssOjb = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssString = '';
    for (const device of devices) {
        let cssAttributes = formStyle?.label?.[device] ?? {};
        let unit = 'px', value = '';
        Object.entries(cssAttributes).map(([key, item]) => {
            if (key === 'spacing') {
                key = 'margin-bottom';
            }
            value = item ?? false;
            cssOjb[device] += value ? `${key}:${item};` : '';
        });
    }
    if (cssOjb.desktop !== '') {
        cssString += `${labelClass}{${cssOjb.desktop}}`;
    }
    if (cssOjb.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {${labelClass}{${cssOjb.tablet}}}`;
    }
    if (cssOjb.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {${labelClass}{${cssOjb.mobile}}}`;
    }
    return cssString;
}

const generateButtonCSS = (attributes, stepButton = false, multiStep = false) => {
    const devices = ['desktop', 'tablet', 'mobile'];
    let buttonBoxClass = '', buttonClass = '';
    if (stepButton) {
        buttonBoxClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-multiple-step-form-button`;
        buttonClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-multiple-step-form-button .wpformbuilder-multi-step-form__button--next, .wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-multiple-step-form-button .wpformbuilder-multi-step-form__button--previous`;
    } else {
        buttonBoxClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__button`;
        buttonClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__button .wpformbuilder-form__button--submit, .wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-multiple-step-form-button .wpformbuilder-multi-step-form__button--submit `;
    }
    const formStyle = attributes?.style ?? [];
    // console.log('formStyle: ', formStyle);
    let cssButtonBox = { desktop: '', tablet: '', mobile: '' };
    let cssHoverColor = '';
    let cssOjb = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssString = '', cssHover = '';
    for (const device of devices) {
        let cssAttributes = stepButton ? formStyle?.next_prev_button?.[device] ?? {} : formStyle?.button?.[device] ?? {};
        multiStep && delete cssAttributes?.width;
        let unit = 'px', value = '';
        Object.entries(cssAttributes).map(([key, item]) => {
            value = item ?? false;
            switch (key) {
                case 'border':
                    const borderCSS = getBorderStyle(item);
                    cssOjb[device] += borderCSS?.borderCss;
                    if (borderCSS?.hoverColor && borderCSS?.hoverColor !== '') {
                        cssHover += `${buttonClass}:hover{border-color: ${borderCSS.hoverColor}}`;
                    }
                    if (borderCSS?.focusColor && borderCSS?.focusColor !== '') {
                        cssHover += `${buttonClass}:focus{border-color: ${borderCSS.focusColor}}`;
                    }
                    break;
                case 'hoverColor':
                    cssHoverColor += value ? `color:${item};` : '';
                    break;
                case 'backgroundHoverColor':
                    cssHoverColor += value ? `background-color:${item};` : '';
                    break;
                case 'padding':
                case 'margin':
                    cssOjb[device] += getSpacingCSS(item, key);
                    break;
                case 'justify-content':
                    cssButtonBox[device] += value ? `${key}:${item};` : '';
                    break;
                default:
                    cssOjb[device] += value ? `${key}:${item};` : '';
            }
        });
    }
    if (cssHoverColor !== '') {
        cssHoverColor = `${buttonClass}:hover{${cssHoverColor}}`;
    }
    // For button
    if (cssOjb.desktop !== '' || cssButtonBox.desktop !== '') {
        cssString += cssOjb.desktop !== '' ? `${buttonClass}{${cssOjb.desktop}}` : '';
        cssString += cssButtonBox.desktop !== '' ? `${buttonBoxClass}{${cssButtonBox.desktop}}` : '';
    }
    if (cssOjb.tablet !== '' || cssButtonBox.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {`;
        cssString += cssOjb.tablet !== '' ? `${buttonClass}{${cssOjb.tablet}}` : '';
        cssString += cssButtonBox.tablet !== '' ? `${buttonBoxClass}{${cssButtonBox.tablet}}` : '';
        cssString += `}`;
    }
    if (cssOjb.mobile !== '' || cssButtonBox.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {`;
        cssString += cssOjb.mobile !== '' ? `${buttonClass}{${cssOjb.mobile}}` : '';
        cssString += cssButtonBox.mobile !== '' ? `${buttonClass}{${cssButtonBox.mobile}}` : '';
        cssString += `}`;
    }
    return minifyCssString(cssString + cssHover + cssHoverColor);
}

const generateStepCSS = (attributes) => {
    const devices = ['desktop', 'tablet', 'mobile'];
    const stepClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress-step span`;
    const parentClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress`;
    const stepPadding = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress:is(.number, .icon, .number_text, .icon_text) .wpformbuilder-multi-step-form__progress-step .wpformbuilder-multi-step-form__progress-num`;
    const stepDivider = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress:is(.number, .icon, .number_text, .icon_text) .wpformbuilder-multi-step-form__progress-connector`;
    const stepInActiveColor = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress-item:not(.is-active, .is-complete) :is(.wpformbuilder-multi-step-form__progress-num, .wpformbuilder-multi-step-form__progress-title)`;
    const stepActiveColor = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress-item.is-active :is(.wpformbuilder-multi-step-form__progress-num, .wpformbuilder-multi-step-form__progress-title)`;
    const stepCompletedColor = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress-item.is-complete :is(.wpformbuilder-multi-step-form__progress-num, .wpformbuilder-multi-step-form__progress-title)`;
    const formStyle = attributes?.style ?? [];
    let cssOjb = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssParent = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssStepPadding = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssStepDivider = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssString = '';
    for (const device of devices) {
        let cssAttributes = formStyle?.step?.[device] ?? {};
        let unit = 'px', value = '';
        Object.entries(cssAttributes).map(([key, item]) => {
            value = item ?? false;
            if (value && typeof value === 'string' || ['inactiveColor', 'activeColor', 'completedColor', 'text_position'].includes(key)) {
                switch (key) {
                    case 'spacing':
                        key = 'margin-bottom';
                        cssParent[device] += value ? `${key}:${item};` : '';
                        break;
                    case 'step_padding':
                        cssStepPadding[device] += `width: ${item};height:${item};`;
                        break;
                    case 'divider_width':
                        cssStepDivider[device] += `height: ${item};`;
                        break;
                    case 'divider_gap':
                        cssStepDivider[device] += `margin: 0 ${item};`;
                        break;
                    case 'divider_radius':
                        cssStepDivider[device] += `border-radius: ${item};`;
                        break;
                    case 'inactiveColor':
                        cssString += getDynamicColorStep(item, stepInActiveColor, device, key, attributes?.form?.id);
                        break
                    case 'activeColor':
                        cssString += getDynamicColorStep(item, stepActiveColor, device, key, attributes?.form?.id);
                        break;
                    case 'completedColor':
                        cssString += getDynamicColorStep(item, stepCompletedColor, device, key, attributes?.form?.id);
                        break;
                    case 'text_position':
                        cssString += getDynamicTextPosition(item, device, key, attributes?.form?.id);
                        break;
                    case 'width':
                        if(item !== '100%'){
                            cssOjb[device] += `${key}:${item};`;
                        }
                        break;
                    default:
                        cssOjb[device] += value ? `${key}:${item};` : '';
                        break;
                }
            }
        });
    }
    // For parent
    if (cssParent.desktop !== '') {
        cssString += `${parentClass}{${cssParent.desktop}}`;
    }
    if (cssParent.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {${parentClass}{${cssParent.tablet}}}`;
    }
    if (cssParent.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {${parentClass}{${cssParent.mobile}}}`;
    }
    // For step
    if (cssOjb.desktop !== '') {
        cssString += `${stepClass}{${cssOjb.desktop}}`;
    }
    if (cssOjb.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {${stepClass}{${cssOjb.tablet}}}`;
    }
    if (cssOjb.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {${stepClass}{${cssOjb.mobile}}}`;
    }
    // For step padding
    if (cssStepPadding.desktop !== '') {
        cssString += `${stepPadding}{${cssStepPadding.desktop}}`;
    }
    if (cssStepPadding.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {${stepPadding}{${cssStepPadding.tablet}}}`;
    }
    if (cssStepPadding.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {${stepPadding}{${cssStepPadding.mobile}}}`;
    }
    // For step divider
    if (cssStepDivider.desktop !== '') {
        cssString += `${stepDivider}{${cssStepDivider.desktop}}`;
    }
    if (cssStepDivider.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {${stepDivider}{${cssStepDivider.tablet}}}`;
    }
    if (cssStepDivider.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {${stepDivider}{${cssStepDivider.mobile}}}`;
    }
    return minifyCssString(cssString);
}

const getDynamicTextPosition = (cssAttributes, device, attr, id) => {
    const textPositionClass = `.wpformbuilder-form-${id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress-item .wpformbuilder-multi-step-form__progress-step`;
    let cssString = '';

    Object.entries(cssAttributes ?? {}).forEach(([key, item]) => {
        if (!item || typeof item !== 'object') return;

        let decl = '';
        ['top', 'right', 'bottom', 'left'].forEach((side) => {
            const sideValue = item[side];
            if (sideValue !== '' && sideValue != null) {
                decl += `${side}: ${sideValue}px;`;
            }
        });

        if (!decl) return;

        const rule = `${textPositionClass}.${key} .wpformbuilder-multi-step-form__progress-title{${decl}}`;
        if (device === 'tablet') {
            cssString += `@media screen and (max-width: 780px) {${rule}}`;
        } else if (device === 'mobile') {
            cssString += `@media screen and (max-width: 360px) {${rule}}`;
        } else {
            cssString += rule;
        }
    });
    return minifyCssString(cssString);
}

const getDynamicColorStep = (cssAttributes, cssClass, device, attr, id) => {
    let cssString = '', cssDividerColor = '';
    const dividerColorClass = `.wpformbuilder-form-${id} .wpformbuilder-form__inner .wpformbuilder-multi-step-form__progress`;
    Object.entries(cssAttributes).map(([key, item]) => {
        let value = item ?? false;
        if (value && typeof value === 'string') {
            switch (key) {
                case 'color':
                    cssString += `color: ${item};border-color: ${item};`;
                    if (attr === 'activeColor') {
                        cssString += `box-shadow: 0 0 0 3px ${hexToRgba(item)};`;
                    }
                case 'dividerColor':
                    if(attr === 'inactiveColor'){
                        cssDividerColor += `--wpfb-progress-connector-track: ${item};`;
                    }else{
                        cssDividerColor += `--wpfb-progress-connector-color: ${item};`;
                    }
                    break;
                case 'backgroundColor':
                    cssString += `background-color: ${item};`;
                    break;
            }
        }
    });
    if (cssDividerColor !== '') {
        if (device === 'desktop') {
            cssDividerColor = `${dividerColorClass}{${cssDividerColor}}`;
        } else if (device === 'tablet') {
            cssDividerColor = `@media screen and (max-width: 780px) {${dividerColorClass}{${cssDividerColor}}}`;
        } else if (device === 'mobile') {
            cssDividerColor = `@media screen and (max-width: 360px) {${dividerColorClass}{${cssDividerColor}}}`;
        }
    }
    if (cssString !== '') {
        if (device === 'desktop') {
            cssString = `${cssClass}{${cssString}}`;
        } else if (device === 'tablet') {
            cssString = `@media screen and (max-width: 780px) {${cssClass}{${cssString}}}`;
        } else if (device === 'mobile') {
            cssString = `@media screen and (max-width: 360px) {${cssClass}{${cssString}}}`;
        }
    }
    return minifyCssString(cssString + cssDividerColor);
}

const generateFieldCSS = (attributes) => {
    const devices = ['desktop', 'tablet', 'mobile'];
    const fieldClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form__inner .wpformbuilder-form-group .wpformbuilder-form-control__field`;
    const formStyle = attributes?.style ?? [];
    let cssOjb = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssString = '', cssHover = '';
    for (const device of devices) {
        let cssAttributes = formStyle?.field?.[device] ?? {};
        let unit = 'px', value = '';
        Object.entries(cssAttributes).map(([key, item]) => {
            value = item ?? false;
            switch (key) {
                case 'padding':
                case 'margin':
                    cssOjb[device] += getSpacingCSS(item, key);
                    break;
                case 'border':
                    const borderCSS = getBorderStyle(item);
                    cssOjb[device] += borderCSS?.borderCss;
                    if (borderCSS?.hoverColor && borderCSS?.hoverColor !== '') {
                        cssHover += `${fieldClass}:hover{border-color: ${borderCSS.hoverColor}}`;
                    }
                    if (borderCSS?.focusColor && borderCSS?.focusColor !== '') {
                        cssHover += `${fieldClass}:focus{border-color: ${borderCSS.focusColor}}`;
                    }
                    break;
                default:
                    cssOjb[device] += value ? `${key}:${item};` : '';
            }
        });
    }
    if (cssOjb.desktop !== '') {
        cssString += `${fieldClass}{${cssOjb.desktop}}`;
    }
    if (cssOjb.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {${fieldClass}{${cssOjb.tablet}}}`;
    }
    if (cssOjb.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {${fieldClass}{${cssOjb.mobile}}}`;
    }
    return minifyCssString(cssString + cssHover);
}

const generateColumnCSS = (attributes) => {
    let cssColumn = {
        desktop: '',
        tablet: '',
        mobile: ''
    };
    let cssString = '';
    let fields = attributes?.fields ?? [];
    for (const field of fields) {
        let columnClass = `.wpformbuilder-form-${attributes?.form?.id} .wpformbuilder-form-group.${field?.id}`;
        for (const device of ['desktop', 'tablet', 'mobile']) {
            switch (device) {
                case 'mobile':
                    cssColumn['mobile'] += `${columnClass}{width:${getColumnWidth(field, device, attributes?.style)};}`;
                    break
                case 'tablet':
                    cssColumn['tablet'] += `${columnClass}{width:${getColumnWidth(field, device, attributes?.style)};}`;
                    break;
                default:
                    cssColumn['desktop'] += `${columnClass}{width:${getColumnWidth(field, device, attributes?.style)};}`;
            }
        }
    }
    if (cssColumn?.desktop !== '') {
        cssString += cssColumn?.desktop;
    }
    if (cssColumn?.tablet !== '') {
        cssString += `@media screen and (max-width: 780px) {${cssColumn?.tablet}}`;
    }
    if (cssColumn?.mobile !== '') {
        cssString += `@media screen and (max-width: 360px) {${cssColumn?.mobile}}`;
    }
    return cssString;
}

const getColumnWidth = (attributes, device, style) => {
    let width;
    if (['default', '100%'].includes(attributes?.column_width?.[device])) {
        width = `100%`;
    } else {
        let columns_gap = style?.form?.[device]?.column_gap?.value ?? 10;
        let columns_unit = style?.form?.[device]?.column_gap?.unit ?? 'px';
        let calc = Number.parseFloat(parseFloat(columns_gap) / 2).toFixed(1);
        width = `calc(${attributes?.column_width?.[device]} - ${calc}${columns_unit})`;
    }

    return width;
};

function getBorderStyle(border) {
    let borderCss = '';

    const width = border.width;
    const widthUnit = border.width?.unit ? border?.width?.unit : 'px';

    const radius = border.radius;
    const radiusUnit = border.radius?.unit ? border?.radius?.unit : 'px';

    const style = border.type;
    const color = border.color;
    const hoverColor = border.hoverColor ?? '';
    const focusColor = border.focusColor ?? '';

    if (style && style != 'none' && typeof (style) != 'undefined') {
        if (width) {
            borderCss += `
            ${addCSSProperty('border-style', style, '')}
            ${addCSSProperty('border-color', color, '')}
            ${addCSSProperty('border-top-width', width.top, widthUnit)}
            ${addCSSProperty('border-right-width', width.right, widthUnit)}
            ${addCSSProperty('border-bottom-width', width.bottom, widthUnit)}
            ${addCSSProperty('border-left-width', width.left, widthUnit)}`;
        }
    }

    if (radius) {
        borderCss += `
        ${addCSSProperty('border-top-left-radius', radius.top, radiusUnit)}
        ${addCSSProperty('border-top-right-radius', radius.right, radiusUnit)}
        ${addCSSProperty('border-bottom-right-radius', radius.bottom, radiusUnit)}
        ${addCSSProperty('border-bottom-left-radius', radius.left, radiusUnit)}`;
    }

    return {
        borderCss: minifyCssString(borderCss),
        hoverColor: hoverColor,
        focusColor: focusColor
    };
}

const getSpacingCSS = (spacing, name) => {
    let spacingCSS = '';
    let spacingUnit = (spacing?.unit && spacing?.unit !== '') ? spacing?.unit : 'px';
    if (spacing) {
        spacingCSS += `
        ${addCSSProperty(name + '-top', spacing.top, spacingUnit)}
        ${addCSSProperty(name + '-right', spacing.right, spacingUnit)}
        ${addCSSProperty(name + '-bottom', spacing.bottom, spacingUnit)}
        ${addCSSProperty(name + '-left', spacing.left, spacingUnit)};`;
    }
    return minifyCssString(spacingCSS);
}

function addCSSProperty(property, value, unit) {
    if (value !== '' && typeof (value) != 'undefined') {
        return `${property}: ${value}${unit}; `;
    }
    return '';
}
//Save css file
wp.domReady(function () {
    let lastIsSaving = false;
    let lastIsAutosaving = false;

    wp.data.subscribe(() => {
        let css = '';

        const currentEditor = wp.data.select('core/editor');
        const currentPostId = currentEditor.getCurrentPostId();
        const isSavingPost = currentEditor.isSavingPost();
        const isAutosavingPost = currentEditor.isAutosavingPost();
        const isEditedPostDirty = currentEditor.isEditedPostDirty();
        //if (isSavingPost && !isAutosavingPost) {
        console.log('Đã vao đây');
        if (isSavingPost && !lastIsSaving && !isAutosavingPost) {
            console.log('Đã vao đây 222');
            // ajaxCalled = true;
            const blocks = currentEditor.getBlocks();
            blocks.forEach(block => {
                if (block.name.includes('sunformbuilder')) {
                    css += getCssBlock(block);
                }
            });

            if (css) {
                const data = new FormData();
                data.append('action', 'sunformbuilder_pro_save_css');
                data.append('css', css);
                data.append('nonce', sfbuilder_js_data.nonce);
                data.append('post_id', currentPostId);
                fetch(sfbuilder_js_data.ajaxurl, {
                    method: 'POST',
                    body: data,
                })
                    .then((response) => response.json().catch(() => null).then((json) => ({ response, json })))
                    .then(({ response, json }) => {
                        if (!response.ok || !json || json.success !== true) {
                            const message = json && json.data ? json.data : `HTTP ${response.status}`;
                            console.error('Failed to save form CSS:', message);
                        }
                        setTimeout(() => {
                            // ajaxCalled = false
                        }, 1000)
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        setTimeout(() => {
                            // ajaxCalled = false
                        }, 1000)
                    });
            }
        }

        lastIsSaving = isSavingPost;
        lastIsAutosaving = isAutosavingPost;
    });

    function getCssBlock(block) {
        let attributes = block?.attributes;
        let cssBlock = attributes?.css?.editor ?? '';
        if (block?.innerBlocks && block?.innerBlocks.length) {
            block?.innerBlocks.forEach(newBlock => {
                cssBlock += getCssBlock(newBlock)
            });
        }
        return minifyCssString(cssBlock);
    }
});
const createResponsiveStyle = (style) => {
    return {
        desktop: { ...style },
        tablet: { ...style },
        mobile: { ...style }
    };
}
const getUnit = (string) => {
    if (typeof string === 'undefined') {
        return '';
    }
    const match = string.match(/[a-zA-Z%]+$/);
    return match ? match[0] : 'px';
}
function isValidCssRule(rule) {
    const style = document.createElement('style');
    document.head.appendChild(style);

    const sheet = style.sheet;
    try {
        sheet.insertRule(rule, sheet.cssRules.length);
        document.head.removeChild(style);
        return true;
    } catch (e) {
        document.head.removeChild(style);
        return false;
    }
}
function getLabelByValue(array, targetValue, label = false) {
    const item = array.find(obj => obj.value === targetValue);
    return label ? label : item ? item.label : null;
}
function removeItemByValue(list, values) {
    return list.filter(item => !values.includes(item.value));
}
function hexToRgba(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const bigint = parseInt(hex, 16);

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, 0.3)`;
}
const renderIcon = (icon) => {
    if (!icon || icon?.type === 'none') {
        return null;
    }

    if (icon?.type === 'upload' && icon?.url) {
        return <img src={icon.url} alt="" />;
    }

    if (icon?.type === 'icon_lib' && icon?.name && icon?.group) {
        return <i className={`fa-${icon.group} fa-${icon.name}`} aria-hidden="true" />;
    }

    return null;
};
export { generateFormCSS, createResponsiveStyle, getColumnWidth, getUnit, generateLabelCSS, generateFieldCSS, generateButtonCSS, generateColumnCSS, getLabelByValue, removeItemByValue, renderIcon, generateStepCSS }