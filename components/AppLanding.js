"use client";

import { useEffect, useRef, useState } from "react";

const PLAY_URL = "https://play.google.com/store/apps/details?id=com.org.sogo";
// TODO: replace with the real App Store URL once the iOS app is live
// (App Store Connect → App Information → View on App Store).
const APPSTORE_URL = "https://apps.apple.com/app/sogoapp";

/**
 * Deep-link landing card. Tries to open the app via the custom scheme; if the
 * page is still visible shortly after (app not installed), reveals the store
 * buttons. Universal/App Links mean users WITH the app usually never see this
 * page at all — the OS routes the URL straight into the app.
 */
export default function AppLanding({ kicker, title, subtitle, meta, deepLink }) {
  const [showStores, setShowStores] = useState(false);
  const timerRef = useRef(null);

  const openApp = () => {
    setShowStores(false);
    const startedAt = Date.now();
    window.location.href = deepLink;
    timerRef.current = setTimeout(() => {
      // If the tab lost visibility, the app opened — don't flash store buttons.
      if (!document.hidden && Date.now() - startedAt < 3000) setShowStores(true);
    }, 1600);
  };

  useEffect(() => {
    const onVis = () => {
      if (document.hidden && timerRef.current) clearTimeout(timerRef.current);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <main className="page">
      <div className="card">
        <div className="logo-row">
          <div className="logo-mark">S</div>
          <div className="logo-name">SogoApp</div>
        </div>

        {kicker ? <div className="kicker">{kicker}</div> : null}
        <h1 className="title">{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}

        {meta && meta.length > 0 ? (
          <div className="meta">
            {meta.map((row) => (
              <div className="meta-row" key={row.k}>
                <span className="k">{row.k}</span>
                <span className="v">{row.v}</span>
              </div>
            ))}
          </div>
        ) : null}

        <button className="btn-primary" onClick={openApp}>
          Open in SogoApp
        </button>

        <div className="stores" style={{ display: showStores ? "flex" : "none" }}>
          <a className="btn-store" href={PLAY_URL}>
            ▶ Google Play
          </a>
          <a className="btn-store" href={APPSTORE_URL}>
             App Store
          </a>
        </div>

        <p className="hint">
          Don&apos;t have the app yet?{" "}
          <a href={PLAY_URL} style={{ color: "#3e72fe" }}>
            Get SogoApp
          </a>
        </p>
      </div>

      <footer className="footer">
        <a href="https://app.sogoapps.com">About</a> ·{" "}
        <a href="https://app.sogoapps.com/privacy-policy/">Privacy</a> ·{" "}
        <a href="https://app.sogoapps.com/terms-of-service/">Terms</a>
      </footer>
    </main>
  );
}
