import React, { useState, useMemo } from "react";
import chroma from "chroma-js";

const TOTAL_COLORS = 2000;

function generateColors() {
  const colors = [];
  for (let i = 0; i < TOTAL_COLORS; i++) {
    const h = (i * (360 / TOTAL_COLORS)) % 360;
    const s = 0.5 + 0.5 * ((i % 10) / 10);
    const l = 0.3 + 0.4 * (((i * 7) % 10) / 10);
    const color = chroma.hsl(h, s, l).hex();
    colors.push(color);
  }
  return colors;
}

export default function App() {
  const allColors = useMemo(() => generateColors(), []);
  const [hueRange, setHueRange] = useState([0, 360]);
  const [satRange, setSatRange] = useState([0, 1]);
  const [lightRange, setLightRange] = useState([0, 1]);
  const [selectedColor, setSelectedColor] = useState(null);

  const filteredColors = useMemo(() => {
    return allColors.filter((hex) => {
      const [h, s, l] = chroma(hex).hsl();
      const hue = isNaN(h) ? 0 : h;
      return (
        hue >= hueRange[0] &&
        hue <= hueRange[1] &&
        s >= satRange[0] &&
        s <= satRange[1] &&
        l >= lightRange[0] &&
        l <= lightRange[1]
      );
    });
  }, [allColors, hueRange, satRange, lightRange]);

  const onRangeChange = (setter, idx) => (e) => {
    const val = Number(e.target.value);
    setter((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      if (idx === 0 && val > copy[1]) copy[1] = val;
      if (idx === 1 && val < copy[0]) copy[0] = val;
      return copy;
    });
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 20 }}>
      <h1>Interactive Color Explorer</h1>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          maxWidth: 600,
          marginBottom: 20,
        }}
      >
        <FilterSlider
          label="Hue (0°–360°)"
          min={0}
          max={360}
          step={1}
          range={hueRange}
          onChange={[
            onRangeChange(setHueRange, 0),
            onRangeChange(setHueRange, 1),
          ]}
          color="linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)"
        />
        <FilterSlider
          label="Saturation (0–1)"
          min={0}
          max={1}
          step={0.01}
          range={satRange}
          onChange={[
            onRangeChange(setSatRange, 0),
            onRangeChange(setSatRange, 1),
          ]}
          color="linear-gradient(to right, gray, red)"
        />
        <FilterSlider
          label="Lightness (0–1)"
          min={0}
          max={1}
          step={0.01}
          range={lightRange}
          onChange={[
            onRangeChange(setLightRange, 0),
            onRangeChange(setLightRange, 1),
          ]}
          color="linear-gradient(to right, black, white)"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(24px,1fr))",
          gap: 1,
          maxHeight: "60vh",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
      >
        {filteredColors.map((color) => (
          <div
            key={color}
            onClick={() => setSelectedColor(color)}
            title={color}
            style={{
              backgroundColor: color,
              width: 24,
              height: 24,
              cursor: "pointer",
              border:
                selectedColor === color ? "2px solid black" : "1px solid #ddd",
            }}
          />
        ))}
      </div>

      {selectedColor && (
        <ColorDetail
          color={selectedColor}
          onClose={() => setSelectedColor(null)}
        />
      )}

      <footer style={{ marginTop: 40, fontSize: 12, color: "#555" }}>
        Showing {filteredColors.length} colors filtered from {TOTAL_COLORS} total.
      </footer>
    </div>
  );
}

function FilterSlider({ label, min, max, step, range, onChange, color }) {
  const [onChangeMin, onChangeMax] = onChange;

  return (
    <div style={{ flex: "1 1 200px" }}>
      <label>
        <div style={{ marginBottom: 4 }}>{label}</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={range[0]}
            onChange={onChangeMin}
            style={{ flex: 1, background: color }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={range[1]}
            onChange={onChangeMax}
            style={{ flex: 1, background: color }}
          />
        </div>
        <div style={{ fontSize: 12, marginTop: 4 }}>
          {label.startsWith("Hue")
            ? range[0].toFixed(0)
            : range[0].toFixed(2)}{" "}
          –{" "}
          {label.startsWith("Hue") ? range[1].toFixed(0) : range[1].toFixed(2)}
        </div>
      </label>
    </div>
  );
}

function ColorDetail({ color, onClose }) {
  const rgb = chroma(color).rgb();

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert(`Copied to clipboard: ${text}`);
      });
    } else {
      alert("Clipboard API not supported");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          width: 280,
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            backgroundColor: color,
            height: 100,
            borderRadius: 8,
            marginBottom: 20,
            border: "1px solid #ccc",
          }}
        />
        <div style={{ marginBottom: 8 }}>
          <strong>Hex:</strong> {color}{" "}
          <button onClick={() => copyToClipboard(color)}>Copy</button>
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>RGB:</strong> {rgb.join(", ")}{" "}
          <button onClick={() => copyToClipboard(rgb.join(", "))}>Copy</button>
        </div>
        <button onClick={onClose} style={{ padding: "6px 12px", marginTop: 10 }}>
          Close
        </button>
      </div>
    </div>
  );
}
