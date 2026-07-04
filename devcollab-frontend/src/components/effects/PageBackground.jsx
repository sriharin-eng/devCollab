import DarkVeil from "./DarkVeil";

/**
 * Fixed, full-viewport animated backdrop for public-facing pages
 * (landing / login / register). Sits behind all content at z-0 — wrap
 * page content in a `relative z-10` container so it's never obscured.
 *
 * Tuned intentionally subtle: slow drift, light grain, no scanlines,
 * dimmed and faded toward the page's base color so text stays crisp
 * and it reads as "premium ambience" rather than a distracting effect.
 */
function PageBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#080b14]">
      <div className="absolute inset-0 opacity-[0.55]">
        <DarkVeil
          hueShift={235}
          noiseIntensity={0.025}
          scanlineIntensity={0}
          speed={0.3}
          warpAmount={0.12}
          resolutionScale={0.75}
        />
      </div>
      {/* Fade toward the base background so content stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080b14]/10 via-[#080b14]/60 to-[#080b14]" />
      <div className="absolute inset-0 bg-[#080b14]/35" />
    </div>
  );
}

export default PageBackground;
