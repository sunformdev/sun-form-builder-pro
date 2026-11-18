import { getColumnWidth, renderIcon } from '../../../functions';
import './step.css';

const WPformbuilderStepButtonControl = ({ attributes, settings, device, style, indexStep, steps }) => {
    const nextLabel = attributes?.next_label ?? 'Next';
    const previousLabel = attributes?.button?.previous?.label ?? 'Previous';
    const previousIcon = attributes?.button?.previous?.icon;

    return (
        <>
            <div className={`wpformbuilder-multiple-step-form-button ${indexStep === 0 ? 'flex-one' : ''}`} style={{ width: '100%' }}>
                {steps.length === 1 && (
                    <button className={`wpformbuilder-multi-step-form__button--submit`}>
                        <span className='wpformbuilder-form__button--submit__content'>
                            {settings?.button?.icon?.type !== 'none' && settings?.button?.icon?.position === 'left' && (
                                <>
                                    {settings?.button?.icon?.type === 'icon_lib' && (
                                        <span className='wpformbuilder-submit-button-icon' style={{ marginRight: `${settings?.button?.icon?.spacing ?? '10px'}` }}><i className={`fa-${settings?.button?.icon.group} fa-${settings?.button?.icon.name}`} /></span>
                                    )}
                                    {settings?.button?.icon?.type === 'upload' && (
                                        <span className='wpformbuilder-submit-button-icon' style={{ marginRight: `${settings?.button?.icon?.spacing ?? '10px'}` }}><img src={settings?.button?.icon.url} /></span>
                                    )}
                                </>
                            )}
                            <span className='wpformbuilder-submit-button-text'>{settings?.button?.name || 'Submit'}</span>
                            {settings?.button?.icon?.type !== 'none' && settings?.button?.icon?.position !== 'left' && (
                                <>
                                    {settings?.button?.icon?.type === 'icon_lib' && (
                                        <span className='wpformbuilder-submit-button-icon' style={{ marginLeft: `${settings?.button?.icon?.spacing ?? '10px'}` }}><i className={`fa-${settings?.button?.icon.group} fa-${settings?.button?.icon.name}`} /></span>
                                    )}
                                    {settings?.button?.icon?.type === 'upload' && (
                                        <span className='wpformbuilder-submit-button-icon' style={{ marginLeft: `${settings?.button?.icon?.spacing ?? '10px'}` }}><img src={settings?.button?.icon.url} /></span>
                                    )}
                                </>
                            )}
                        </span>
                    </button>
                )}

                {steps.length > 1 && (

                    <>
                        {indexStep === 0 && (
                            <button type='button' class='wpformbuilder-multi-step-form__button--next'>{nextLabel} <span>{renderIcon(attributes?.next_icon)}</span></button>
                        )}
                        {indexStep !== 0 && indexStep !== steps.length - 1 && (
                            <>
                                <button type='button' class='wpformbuilder-multi-step-form__button--previous'><span>{renderIcon(attributes?.previous_icon)}</span> {previousLabel}</button>
                                <button type='button' class='wpformbuilder-multi-step-form__button--next'>{nextLabel} <span>{renderIcon(attributes?.next_icon)}</span></button>
                            </>
                        )}
                        {indexStep === steps.length - 1 && (
                            <>
                                <button type='button' class='wpformbuilder-multi-step-form__button--previous'><span>{renderIcon(attributes?.previous_icon)}</span> {previousLabel}</button>
                                <button className={`wpformbuilder-multi-step-form__button--submit`}>
                                    <span className='wpformbuilder-form__button--submit__content'>
                                        {settings?.button?.icon?.type !== 'none' && settings?.button?.icon?.position === 'left' && (
                                            <>
                                                {settings?.button?.icon?.type === 'icon_lib' && (
                                                    <span className='wpformbuilder-submit-button-icon' style={{ marginRight: `${settings?.button?.icon?.spacing ?? '10px'}` }}><i className={`fa-${settings?.button?.icon.group} fa-${settings?.button?.icon.name}`} /></span>
                                                )}
                                                {settings?.button?.icon?.type === 'upload' && (
                                                    <span className='wpformbuilder-submit-button-icon' style={{ marginRight: `${settings?.button?.icon?.spacing ?? '10px'}` }}><img src={settings?.button?.icon.url} /></span>
                                                )}
                                            </>
                                        )}
                                        <span className='wpformbuilder-submit-button-text'>{settings?.button?.name || 'Submit'}</span>
                                        {settings?.button?.icon?.type !== 'none' && settings?.button?.icon?.position !== 'left' && (
                                            <>
                                                {settings?.button?.icon?.type === 'icon_lib' && (
                                                    <span className='wpformbuilder-submit-button-icon' style={{ marginLeft: `${settings?.button?.icon?.spacing ?? '10px'}` }}><i className={`fa-${settings?.button?.icon.group} fa-${settings?.button?.icon.name}`} /></span>
                                                )}
                                                {settings?.button?.icon?.type === 'upload' && (
                                                    <span className='wpformbuilder-submit-button-icon' style={{ marginLeft: `${settings?.button?.icon?.spacing ?? '10px'}` }}><img src={settings?.button?.icon.url} /></span>
                                                )}
                                            </>
                                        )}
                                    </span>
                                </button>
                            </>
                        )}
                        {/* <button type='button' class='wpformbuilder-multi-step-form__button--previous'><span>{renderIcon(attributes?.previous_icon)}</span> {previousLabel}</button> */}
                        {/* <button type='button' class='wpformbuilder-multi-step-form__button--next'>{nextLabel} <span>{renderIcon(attributes?.next_icon)}</span></button> */}
                    </>
                )}


                {/* {indexStep === 0 && (
                    <button type='button' class='wpformbuilder-multi-step-form__button--next'>{nextLabel} <span>{renderIcon(attributes?.next_icon)}</span></button>
                )}
                {indexStep !== 0 && (
                    <>
                        <button type='button' class='wpformbuilder-multi-step-form__button--previous'><span>{renderIcon(attributes?.previous_icon)}</span> {previousLabel}</button>
                        <button type='button' class='wpformbuilder-multi-step-form__button--next'>{nextLabel} <span>{renderIcon(attributes?.next_icon)}</span></button>
                    </>
                )} */}
            </div>
        </>
    );
};
export default WPformbuilderStepButtonControl;