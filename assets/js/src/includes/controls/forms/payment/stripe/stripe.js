import { loadStripe } from '@stripe/stripe-js';
import { getColumnWidth } from '../../../../functions';
const { useEffect, useRef } = wp.element;

const WPformbuilderStripeControl = ({ attributes, device, style }) => {
    const mountRef = useRef(null);
    const stripeRef = useRef(null);
    const elementsRef = useRef(null);
    const cardRef = useRef(null);

    const hide_label = attributes?.hide_label ?? false;
    const label = attributes?.label ?? '';
    const width = getColumnWidth(attributes, device, style);

    // Prefer per-field override, fallback to global localized setting.
    const publishableKey =
        (attributes?.stripe_publishable_key ?? '').trim() ||
        (typeof sfbuilder_js_data !== 'undefined' ? (sfbuilder_js_data?.stripe?.publishable_key ?? '').trim() : '');

    const parseStripeOptions = (input) => {
        if (!input || typeof input !== 'string') return {};
        try {
            // Accept "key: value, ..." input and wrap to a JS object literal.
            const wrapped = `{${input}}`;
            const fn = new Function(`"use strict"; return (${wrapped});`);
            const result = fn();
            if (result && typeof result === 'object' && !Array.isArray(result)) return result;
            return {};
        } catch (e) {
            return {};
        }
    };

    // Mount Stripe Card Element inside the editor preview.
    useEffect(() => {
        let cancelled = false;

        const cleanup = () => {
            if (cardRef.current) {
                try {
                    // Stripe Element supports unmount(); destroy() exists in newer versions.
                    cardRef.current.unmount();
                    if (typeof cardRef.current.destroy === 'function') {
                        cardRef.current.destroy();
                    }
                } catch (e) { /* noop */ }
                cardRef.current = null;
            }
            elementsRef.current = null;
            stripeRef.current = null;
        };

        const mount = async () => {
            if (!mountRef.current) return;

            // Prevent duplicate mounts (Gutenberg re-renders often).
            cleanup();

            if (!publishableKey) return;

            try {
                const stripe = await loadStripe(publishableKey);
                if (cancelled || !stripe || !mountRef.current) return;

                stripeRef.current = stripe;
                elementsRef.current = stripe.elements();

                const defaultOptions = { hidePostalCode: true };
                const customOptions = parseStripeOptions(attributes?.stripe_options_raw || '');
                const cardOptions = { ...defaultOptions, ...customOptions };

                const card = elementsRef.current.create('card', {
                    ...cardOptions,
                });

                card.mount(mountRef.current);
                cardRef.current = card;
            } catch (e) {
                // noop (keep editor stable even if Stripe is blocked)
            }
        };

        mount();

        return () => {
            cancelled = true;
            cleanup();
        };
    }, [publishableKey, attributes?.stripe_options_raw]);

    return (
        <div className="wpformbuilder-form-group" style={{ width: `${width}` }}>
            {!hide_label && (
                <label className="wpformbuilder-form-group__label">{label}</label>
            )}

            <div className="wpformbuilder-form-control stripe">
                <div ref={mountRef}></div>
            </div>

            {!publishableKey && (
                <div style={{ color: '#b32d2e', fontSize: 12, marginTop: 6 }}>
                    Stripe publishable key is missing.
                </div>
            )}
        </div>
    )
}
export default WPformbuilderStripeControl;