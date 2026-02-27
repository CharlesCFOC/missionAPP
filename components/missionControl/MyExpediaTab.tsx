"use client";

import { useEffect, useRef } from "react";

const EXPEDIA_BANNER_SCRIPT_SRC =
  "https://creator.expediagroup.com/products/banners/assets/eg-affiliate-banners.js";
const EXPEDIA_WIDGET_SCRIPT_SRC =
  "https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js";
const EXPEDIA_BG_URL =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80";

export default function MyExpediaTab() {
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const triggerLoad = () => {
      window.dispatchEvent(new Event("DOMContentLoaded"));
    };

    const bannerScript = document.querySelector<HTMLScriptElement>(
      "script.eg-affiliate-banners-script"
    );
    if (!bannerScript) {
      const script = document.createElement("script");
      script.src = EXPEDIA_BANNER_SCRIPT_SRC;
      script.async = true;
      script.className = "eg-affiliate-banners-script";
      script.onload = triggerLoad;
      document.body.appendChild(script);
    } else {
      triggerLoad();
    }

    const widgetScript = document.querySelector<HTMLScriptElement>(
      "script.eg-widgets-script"
    );
    if (!widgetScript) {
      const script = document.createElement("script");
      script.src = EXPEDIA_WIDGET_SCRIPT_SRC;
      script.async = true;
      script.className = "eg-widgets-script";
      script.onload = triggerLoad;
      document.body.appendChild(script);
    } else {
      triggerLoad();
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(8, 3, 19, 0.55), rgba(38, 13, 92, 0.45)), url(${EXPEDIA_BG_URL})`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full h-full flex flex-col items-stretch">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-1xl px-6 mx-auto flex flex-col items-center gap-10">
            <h2 className="text-2xl md:text-4xl font-semibold text-white text-center">
              Go All Around The World And Make Disciples!
            </h2>
            <div
              className="eg-widget w-full max-w-4xl"
              data-widget="search"
              data-program="ca-expedia"
              data-lobs="stays,flights"
              data-network="pz"
              data-camref="1110lvFes"
              data-pubref=""
            />
          </div>
        </div>
        <div className="expedia-banner w-full mt-auto mb-6">
          <div
            className="eg-affiliate-banners w-full"
            data-program="ca-expedia"
            data-network="pz"
            data-layout="leaderboard"
            data-image="sunset"
            data-message="bye-bye-bucket-list-hello-adventure"
            data-camref="1110lvFes"
            data-pubref=""
            data-link="home"
          />
        </div>
      </div>
    </div>
  );
}
