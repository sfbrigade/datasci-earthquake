type MapPlaceholderLiteProps = {
  height?: string;
  label?: string;
};

const MapPlaceholderLite = ({
  height = "100%",
  label = "San Francisco map preview placeholder",
}: MapPlaceholderLiteProps) => {
  return (
    <div
      aria-label={label}
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #edf2f7 0%, #e2e8f0 45%, #cbd5e0 100%)",
      }}
    >
      <svg
        viewBox="0 0 1200 900"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <defs>
          <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d6ebff" />
            <stop offset="100%" stopColor="#c3def7" />
          </linearGradient>
          <pattern id="street-grid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 0 60 H 120 M 60 0 V 120" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="10" />
            <path d="M 0 20 H 120 M 0 100 H 120 M 20 0 V 120 M 100 0 V 120" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="4" />
          </pattern>
        </defs>

        <rect width="1200" height="900" fill="url(#water)" />
        <path
          d="M 160 60 C 430 110, 620 130, 760 260 C 905 395, 1020 485, 1120 900 L 0 900 L 0 150 C 70 110, 110 80, 160 60 Z"
          fill="#e8dcc4"
        />
        <path
          d="M 170 130 C 430 165, 610 190, 740 300 C 860 402, 930 500, 1015 900"
          fill="none"
          stroke="#d0c1a3"
          strokeWidth="24"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
        <path
          d="M 120 220 C 260 255, 405 295, 515 380 C 670 505, 760 625, 825 900"
          fill="none"
          stroke="#dbc9a9"
          strokeWidth="16"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <rect width="1200" height="900" fill="url(#street-grid)" opacity="0.7" />
        <path
          d="M 220 240 C 320 210, 405 240, 470 320 C 535 400, 585 480, 660 600"
          fill="none"
          stroke="#8da2b7"
          strokeWidth="18"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        <path
          d="M 320 160 C 460 185, 565 245, 645 360"
          fill="none"
          stroke="#718096"
          strokeWidth="10"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      </svg>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 36% 38%, rgba(255,255,255,0.4) 0, rgba(255,255,255,0) 18%), linear-gradient(110deg, rgba(255,255,255,0.02) 8%, rgba(255,255,255,0.18) 18%, rgba(255,255,255,0.02) 33%)",
          backgroundSize: "auto, 200% 100%",
          animation: "safehome-lite-map-shimmer 2.4s linear infinite",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "36%",
          top: "38%",
          width: 22,
          height: 22,
          borderRadius: "9999px",
          background: "#c05621",
          border: "3px solid rgba(255,255,255,0.95)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          transform: "translate(-50%, -50%)",
        }}
      />

      <style>{`@keyframes safehome-lite-map-shimmer { 0% { background-position: 0 0, 200% 0; } 100% { background-position: 0 0, -200% 0; } }`}</style>
    </div>
  );
};

export default MapPlaceholderLite;
