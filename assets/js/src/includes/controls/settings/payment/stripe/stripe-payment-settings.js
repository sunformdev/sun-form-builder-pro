const { useMemo } = wp.element;
const { __experimentalInputControl, SelectControl, ToggleControl, Flex, FlexItem } = wp.components;

const WPformbuilderStripePaymentSettings = ({ attributes, setAttributes }) => {

    const fieldOptions = useMemo(() => {
        const fields = attributes?.fields ?? [];
        let options = [{ 'label': '-- Select Field --', value: '', disabled: true }];
        for (const field of fields) {
            // Exclude Stripe Card field from being used as "Amount" source.
            if (field?.type === 'stripe_card') continue;

            const label = (field?.label || '').trim() || field?.name;
            options.push({ label, value: field?.name });
        }
        options.push({ label: 'Custom Value', value: 'custom_value' });
        return options;
    }, [attributes?.fields]);

    return (
        <div className='wpformbuilder-stripe-payment'>
            <SelectControl
                label="Amount"
                labelPosition="edge"
                value={attributes?.action_submit_settings?.stripe_payment?.amount || ''}
                options={fieldOptions}
                onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, amount: val } } })}
            />
            {attributes?.action_submit_settings?.stripe_payment?.amount === 'custom_value' && (
                <__experimentalInputControl
                    label="Custom Amount"
                    labelPosition="edge"
                    value={attributes?.action_submit_settings?.stripe_payment?.amount_custom || ''}
                    type="number"
                    min={0}
                    step={1}
                    onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, amount_custom: val } } })}
                />
            )}
            <SelectControl
                label="Currency"
                labelPosition="edge"
                value={attributes?.action_submit_settings?.stripe_payment?.currency || 'USD'}
                options={[
                    { label: 'USD', value: 'USD' },
                    { label: 'AED', value: 'AED' },
                    { label: 'AFN', value: 'AFN' },
                    { label: 'ALL', value: 'ALL' },
                    { label: 'AMD', value: 'AMD' },
                    { label: 'ANG', value: 'ANG' },
                    { label: 'AOA', value: 'AOA' },
                    { label: 'ARS', value: 'ARS' },
                    { label: 'EUR', value: 'EUR' },
                    { label: 'GBP', value: 'GBP' },
                    { label: 'JPY', value: 'JPY' },
                    { label: 'CAD', value: 'CAD' },
                    { label: 'AUD', value: 'AUD' },
                    { label: 'AWG', value: 'AWG' },
                    { label: 'AZN', value: 'AZN' },
                    { label: 'BAM', value: 'BAM' },
                    { label: 'BBD', value: 'BBD' },
                    { label: 'BDT', value: 'BDT' },
                    { label: 'BGN', value: 'BGN' },
                    { label: 'BIF', value: 'BIF' },
                    { label: 'BMD', value: 'BMD' },
                    { label: 'BND', value: 'BND' },
                    { label: 'BOB', value: 'BOB' },
                    { label: 'BRL', value: 'BRL' },
                    { label: 'BSD', value: 'BSD' },
                    { label: 'BWP', value: 'BWP' },
                    { label: 'BZD', value: 'BZD' },
                    { label: 'CDF', value: 'CDF' },
                    { label: 'NZD', value: 'NZD' },
                    { label: 'CHF', value: 'CHF' },
                    { label: 'CNY', value: 'CNY' },
                    { label: 'CLP', value: 'CLP' },
                    { label: 'COP', value: 'COP' },
                    { label: 'CRC', value: 'CRC' },
                    { label: 'CVE', value: 'CVE' },
                    { label: 'CZK', value: 'CZK' },
                    { label: 'DJF', value: 'DJF' },
                    { label: 'DKK', value: 'DKK' },
                    { label: 'DOP', value: 'DOP' },
                    { label: 'DZD', value: 'DZD' },
                    { label: 'EGP', value: 'EGP' },
                    { label: 'ETB', value: 'ETB' },
                    { label: 'FJD', value: 'FJD' },
                    { label: 'FKP', value: 'FKP' },
                    { label: 'GEL', value: 'GEL' },
                    { label: 'GIP', value: 'GIP' },
                    { label: 'GMD', value: 'GMD' },
                    { label: 'GNF', value: 'GNF' },
                    { label: 'GTQ', value: 'GTQ' },
                    { label: 'GYD', value: 'GYD' },
                    { label: 'HKD', value: 'HKD' },
                    { label: 'HNL', value: 'HNL' },
                    { label: 'HRK', value: 'HRK' },
                    { label: 'HTG', value: 'HTG' },
                    { label: 'HUF', value: 'HUF' },
                    { label: 'IDR', value: 'IDR' },
                    { label: 'ILS', value: 'ILS' },
                    { label: 'INR', value: 'INR' },
                    { label: 'ISK', value: 'ISK' },
                    { label: 'JMD', value: 'JMD' },
                    { label: 'KES', value: 'KES' },
                    { label: 'KGS', value: 'KGS' },
                    { label: 'KHR', value: 'KHR' },
                    { label: 'KMF', value: 'KMF' },
                    { label: 'KRW', value: 'KRW' },
                    { label: 'KYD', value: 'KYD' },
                    { label: 'KZT', value: 'KZT' },
                    { label: 'LAK', value: 'LAK' },
                    { label: 'LBP', value: 'LBP' },
                    { label: 'LKR', value: 'LKR' },
                    { label: 'LRD', value: 'LRD' },
                    { label: 'LSL', value: 'LSL' },
                    { label: 'MAD', value: 'MAD' },
                    { label: 'MDL', value: 'MDL' },
                    { label: 'MGA', value: 'MGA' },
                    { label: 'MKD', value: 'MKD' },
                    { label: 'MMK', value: 'MMK' },
                    { label: 'MNT', value: 'MNT' },
                    { label: 'MOP', value: 'MOP' },
                    { label: 'MRO', value: 'MRO' },
                    { label: 'MUR', value: 'MUR' },
                    { label: 'MVR', value: 'MVR' },
                    { label: 'MWK', value: 'MWK' },
                    { label: 'MXN', value: 'MXN' },
                    { label: 'MYR', value: 'MYR' },
                    { label: 'MZN', value: 'MZN' },
                    { label: 'NAD', value: 'NAD' },
                    { label: 'NGN', value: 'NGN' },
                    { label: 'NIO', value: 'NIO' },
                    { label: 'NOK', value: 'NOK' },
                    { label: 'NPR', value: 'NPR' },
                    { label: 'PAB', value: 'PAB' },
                    { label: 'PEN', value: 'PEN' },
                    { label: 'PGK', value: 'PGK' },
                    { label: 'PHP', value: 'PHP' },
                    { label: 'PKR', value: 'PKR' },
                    { label: 'PLN', value: 'PLN' },
                    { label: 'PYG', value: 'PYG' },
                    { label: 'QAR', value: 'QAR' },
                    { label: 'RON', value: 'RON' },
                    { label: 'RSD', value: 'RSD' },
                    { label: 'RUB', value: 'RUB' },
                    { label: 'RWF', value: 'RWF' },
                    { label: 'SAR', value: 'SAR' },
                    { label: 'SBD', value: 'SBD' },
                    { label: 'SCR', value: 'SCR' },
                    { label: 'SEK', value: 'SEK' },
                    { label: 'SGD', value: 'SGD' },
                    { label: 'SHP', value: 'SHP' },
                    { label: 'SLL', value: 'SLL' },
                    { label: 'SOS', value: 'SOS' },
                    { label: 'SRD', value: 'SRD' },
                    { label: 'STD', value: 'STD' },
                    { label: 'SZL', value: 'SZL' },
                    { label: 'THB', value: 'THB' },
                    { label: 'TJS', value: 'TJS' },
                    { label: 'TOP', value: 'TOP' },
                    { label: 'TRY', value: 'TRY' },
                    { label: 'TTD', value: 'TTD' },
                    { label: 'TWD', value: 'TWD' },
                    { label: 'TZS', value: 'TZS' },
                    { label: 'UAH', value: 'UAH' },
                    { label: 'UGX', value: 'UGX' },
                    { label: 'UYU', value: 'UYU' },
                    { label: 'UZS', value: 'UZS' },
                    { label: 'VND', value: 'VND' },
                    { label: 'VUV', value: 'VUV' },
                    { label: 'WST', value: 'WST' },
                    { label: 'XAF', value: 'XAF' },
                    { label: 'XCD', value: 'XCD' },
                    { label: 'XOF', value: 'XOF' },
                    { label: 'XPF', value: 'XPF' },
                    { label: 'YER', value: 'YER' },
                    { label: 'ZAR', value: 'ZAR' },
                    { label: 'ZMW', value: 'ZMW' },
                ]}
                onChange={(newValue) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, currency: newValue } } })}
            />
            <SelectControl
                label="Description"
                labelPosition="edge"
                value={attributes?.action_submit_settings?.stripe_payment?.description || ''}
                options={fieldOptions}
                onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, description: val } } })}
            />
            {attributes?.action_submit_settings?.stripe_payment?.description === 'custom_value' && (
                <__experimentalInputControl
                    label="Custom Description"
                    labelPosition="top"
                    value={attributes?.action_submit_settings?.stripe_payment?.description_custom || ''}
                    onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, description_custom: val } } })}
                />
            )}
            <Flex style={{ marginBottom: '10px' }}>
                <FlexItem>
                    <label>Receipt Email</label>
                </FlexItem>
                <FlexItem className="wpformbuilder-no-margin-bootom">
                    <ToggleControl
                        __nextHasNoMarginBottom={true}
                        checked={attributes?.action_submit_settings?.stripe_payment?.receipt_email || false}
                        onChange={(toogle) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, receipt_email: toogle } } })}
                    />
                </FlexItem>
            </Flex>
            {attributes?.action_submit_settings?.stripe_payment?.receipt_email && (
                <>
                    <SelectControl
                        label="Send to"
                        labelPosition="edge"
                        value={attributes?.action_submit_settings?.stripe_payment?.receipt_email_to || ''}
                        options={fieldOptions}
                        onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, receipt_email_to: val } } })}
                    />
                    {attributes?.action_submit_settings?.stripe_payment?.receipt_email_to === 'custom_value' && (
                        <__experimentalInputControl
                            label="Custom Email"
                            labelPosition="edge"
                            value={attributes?.action_submit_settings?.stripe_payment?.receipt_email_to_custom || ''}
                            onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, receipt_email_to_custom: val } } })}
                        />
                    )}
                </>
            )}
            <Flex style={{ marginBottom: '10px' }}>
                <FlexItem>
                    <label>Billing Details</label>
                </FlexItem>
                <FlexItem className="wpformbuilder-no-margin-bootom">
                    <ToggleControl
                        __nextHasNoMarginBottom={true}
                        checked={attributes?.action_submit_settings?.stripe_payment?.billing_details || false}
                        onChange={(toogle) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details: toogle } } })}
                    />
                </FlexItem>
            </Flex>
            {attributes?.action_submit_settings?.stripe_payment?.billing_details && (
                <>
                    <__experimentalInputControl
                        label="Email"
                        labelPosition="edge"
                        value={attributes?.action_submit_settings?.stripe_payment?.billing_details_email || ''}
                        onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_email: val } } })}
                    />
                    <__experimentalInputControl
                        label="Name"
                        labelPosition="edge"
                        value={attributes?.action_submit_settings?.stripe_payment?.billing_details_name || ''}
                        onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_name: val } } })}
                    />
                    <__experimentalInputControl
                        label="Phone"
                        labelPosition="edge"
                        value={attributes?.action_submit_settings?.stripe_payment?.billing_details_phone || ''}
                        onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_phone: val } } })}
                    />
                    <Flex style={{ marginBottom: '10px' }}>
                        <FlexItem>
                            <label>Billing Address?</label>
                        </FlexItem>
                        <FlexItem className="wpformbuilder-no-margin-bootom">
                            <ToggleControl
                                __nextHasNoMarginBottom={true}
                                checked={attributes?.action_submit_settings?.stripe_payment?.billing_details_address || false}
                                onChange={(toogle) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_address: toogle } } })}
                            />
                        </FlexItem>
                    </Flex>
                    {attributes?.action_submit_settings?.stripe_payment?.billing_details_address && (
                        <>
                            <__experimentalInputControl
                                label="City"
                                labelPosition="edge"
                                value={attributes?.action_submit_settings?.stripe_payment?.billing_details_city || ''}
                                onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_city: val } } })}
                            />
                            <__experimentalInputControl
                                label="Country"
                                labelPosition="edge"
                                value={attributes?.action_submit_settings?.stripe_payment?.billing_details_country || ''}
                                onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_country: val } } })}
                            />
                            <__experimentalInputControl
                                label="Line 1"
                                labelPosition="edge"
                                value={attributes?.action_submit_settings?.stripe_payment?.billing_details_line1 || ''}
                                onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_line1: val } } })}
                            />
                            <__experimentalInputControl
                                label="Line 2"
                                labelPosition="edge"
                                value={attributes?.action_submit_settings?.stripe_payment?.billing_details_line2 || ''}
                                onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_line2: val } } })}
                            />
                            <__experimentalInputControl
                                label="Postal Code"
                                labelPosition="edge"
                                value={attributes?.action_submit_settings?.stripe_payment?.billing_details_postal_code || ''}
                                onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_postal_code: val } } })}
                            />
                            <__experimentalInputControl
                                label="State"
                                labelPosition="edge"
                                value={attributes?.action_submit_settings?.stripe_payment?.billing_details_state || ''}
                                onChange={(val) => setAttributes({ ...attributes, action_submit_settings: { ...attributes?.action_submit_settings, stripe_payment: { ...attributes?.action_submit_settings?.stripe_payment, billing_details_state: val } } })}
                            />
                        </>
                    )}
                </>
            )}
        </div>
            )
};
            export default WPformbuilderStripePaymentSettings;