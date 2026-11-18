const { __ } = wp.i18n;
const { useBlockProps, InspectorControls } = wp.blockEditor;
const { PanelBody, __experimentalDivider, __experimentalSpacer, Flex, FlexItem, __experimentalToggleGroupControl, __experimentalToggleGroupControlOption, SelectControl, __experimentalNumberControl, Button, Icon } = wp.components;
const { useState } = wp.element;
import { border, desktop, link, linkOff } from '@wordpress/icons';
const { useSelect } = wp.data;
import './position.css';

const WPFrombuilderPosition = ({ label, onChange, value }) => {
    const [position, setposition] = useState(value ?? { top: '', right: '', bottom: '', left: '' });

    const handleDimensionChange = (side, value) => {
        const newposition = { ...position, [side]: value };
        setposition(newposition);
        onChange?.(newposition);
    }
    return (
        <>
            <label>{label}</label>
            <div className='wpformbuilder-position-control' style={{ marginTop: '8px' }}>
                <div className='wpformbuilder-position-control__item'>
                    <__experimentalNumberControl
                        value={value?.top ?? ''}
                        onChange={(value) => handleDimensionChange('top', value)}
                        min={-200}
                    />
                    <div style={{ 'textAlign': 'center', fontSize: '10px' }}>Top</div>
                </div>
                <div className='wpformbuilder-position-control__item right'>
                    <__experimentalNumberControl
                        value={value?.right ?? ''}
                        onChange={(value) => handleDimensionChange('right', value)}
                        min={-200}
                    />
                    <div style={{ 'textAlign': 'center', fontSize: '10px' }}>Right</div>
                </div>
                <div className='wpformbuilder-position-control__item'>
                    <__experimentalNumberControl
                        value={value?.bottom ?? ''}
                        onChange={(value) => handleDimensionChange('bottom', value)}
                        min={-200}
                    />
                    <div style={{ 'textAlign': 'center', fontSize: '10px' }}>Bottom</div>
                </div>
                <div className='wpformbuilder-position-control__item left'>
                    <__experimentalNumberControl
                        value={value?.left ?? ''}
                        onChange={(value) => handleDimensionChange('left', value)}
                        min={-200}
                    />
                    <div style={{ 'textAlign': 'center', fontSize: '10px' }}>Left</div>
                </div>
            </div>
        </>
    );
}

export default WPFrombuilderPosition;