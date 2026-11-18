const WPFormbuilderGetAPIData = async (service, attributes, setAttributes) => {
    handleChangeLoadingIconStatus(attributes, setAttributes, service, true);
    const response = await wp.apiFetch({
        path: 'sunform/v1/integrations',
        method: 'POST',
        data: {
            service,
            settings: attributes?.action_submit_settings ?? {}
        }
    });

    if (response?.data) {
        setAttributes({
            action_submit_settings: {
                ...attributes?.action_submit_settings,
                [service]: {
                    ...attributes?.action_submit_settings?.[service],
                    ...response.data
                }
            }
        });
    }
};


const handleChangeApiSettings = async (apiName, property, value, attributes, setAttributes, reload = false) => {
    const updatedApiSettings = {
        ...attributes?.action_submit_settings?.[apiName],
        [property]: value,
    };
    if (property === 'type' && value === 'default') {
        updatedApiSettings.api_key_cusom = null;
    }

    const updatedAttributes = {
        ...attributes,
        action_submit_settings: {
            ...attributes?.action_submit_settings,
            [apiName]: updatedApiSettings
        }
    };

    setAttributes(updatedAttributes);
    if (['mailchimp'].includes(apiName)) {
        await WPFormbuilderGetAPIData('mailchimp', updatedAttributes, setAttributes)
    }
}

const handleChangeLoadingIconStatus = (attributes, setAttributes, apiName, status) => {
    setAttributes({
        action_submit_settings: {
            ...attributes?.action_submit_settings,
            [apiName]: {
                ...attributes?.action_submit_settings?.[apiName],
                loading: status
            }
        }
    });
}
export { WPFormbuilderGetAPIData, handleChangeApiSettings }