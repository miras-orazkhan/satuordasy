'use client';

import { useEffect, useRef } from 'react';

type BitrixFormWidgetProps = {
  portalId: string;
  formId: string;
  embedCode?: string | null;
};

/**
 * Bitrix24 CRM form widget embed.
 *
 * Generates the standard Bitrix24 inline form loader:
 *   <script data-b24-form="inline/{formId}/{hash}" data-skip-moving="true">
 *     (function(w,d,u){...})('https://cdn-ru.bitrix24.kz/{portalId}/crm/form/loader_{formId}.js');
 *   </script>
 *
 * Two modes:
 *   - If embedCode is provided → render it verbatim (admin pasted full code from Bitrix24 UI)
 *   - Else → construct from portalId + formId (simpler config)
 *
 * IMPORTANT: Bitrix24's loader expects the <script> tag to be parsed during page load.
 * When loaded via React client-side navigation, we need to manually inject the script
 * into the DOM and let Bitrix24's loader re-scan via window.b24form.activate().
 */
export function BitrixFormWidget({ portalId, formId, embedCode }: BitrixFormWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Clear any previously injected content (in case of React re-render)
    container.innerHTML = '';

    if (embedCode && embedCode.includes('<script')) {
      // Mode A: admin pasted full embed code from Bitrix24 UI.
      // Parse the HTML, extract script tags, and inject them properly
      // (innerHTML won't execute <script> tags, so we do it manually).
      const wrapper = document.createElement('div');
      wrapper.innerHTML = embedCode;

      // Move non-script children (rare, but possible) into container
      Array.from(wrapper.childNodes).forEach((node) => {
        if (node.nodeName.toLowerCase() !== 'script') {
          container.appendChild(node.cloneNode(true));
        }
      });

      // Re-create each script element explicitly (this makes the browser execute it)
      wrapper.querySelectorAll('script').forEach((oldScript) => {
        const newScript = document.createElement('script');
        // Copy attributes (data-b24-form, data-skip-moving, async, src, etc.)
        for (let i = 0; i < oldScript.attributes.length; i++) {
          const attr = oldScript.attributes[i];
          newScript.setAttribute(attr.name, attr.value);
        }
        // If there's inline code, copy that too
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        container.appendChild(newScript);
      });
    } else if (portalId && formId) {
      // Mode B: construct loader from portalId + formId
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-b24-form', `inline/${formId}/${portalId}`);
      script.setAttribute('data-skip-moving', 'true');
      script.textContent = `(function(w,d,u){
var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/180000|0);
var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);
})(window,document,'https://cdn-ru.bitrix24.kz/${portalId}/crm/form/loader_${formId}.js');`;
      container.appendChild(script);
    }

    // Tell Bitrix24 loader to re-scan the DOM for new forms
    // (this is the official API per Bitrix24 docs for SPA-style navigation)
    setTimeout(() => {
      // @ts-expect-error — b24form is injected by Bitrix24 loader
      if (window.b24form && typeof window.b24form.activate === 'function') {
        // @ts-expect-error
        window.b24form.activate();
      }
    }, 200);
  }, [portalId, formId, embedCode]);

  return <div ref={containerRef} className="bitrix-form-container" />;
}
