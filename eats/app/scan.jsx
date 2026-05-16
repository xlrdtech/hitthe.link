// scan.jsx — full-height scan sheet (the primary action)

function ScanSheet({ open, onClose, onSave }) {
  const [name, setName] = React.useState("");
  const [text, setText] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [mode, setMode] = React.useState("paste"); // paste | camera
  const [analyzing, setAnalyzing] = React.useState(false);

  // Reset when opening
  React.useEffect(() => {
    if (open) {
      setName(""); setText(""); setResult(null); setMode("paste");
    }
  }, [open]);

  const onAnalyze = () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeIngredients(text));
      setAnalyzing(false);
    }, 650);
  };

  const useSample = () => {
    setName("Cheez-It Original");
    setText(SAMPLE_LABEL);
    setResult(null);
  };

  const save = () => {
    if (!result) return;
    onSave({ name: name || "Scanned product", brand: "", score: result.score });
    onClose();
  };

  if (!open) return null;

  return (
    <div className={"ee-sheet-wrap" + (open ? " is-open" : "")} onClick={onClose}>
      <div className="ee-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ee-sheet-grab" />
        {/* Header */}
        <div className="ee-sheet-hd">
          <div>
            <Kicker>Decode label</Kicker>
            <h2 className="ee-h2" style={{ marginTop: 4 }}>What's in this?</h2>
          </div>
          <button className="ee-icon-btn" onClick={onClose} aria-label="Close">
            <Icon.close size={14} />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="ee-seg" role="tablist">
          <button className={"ee-seg-btn " + (mode === "camera" ? "is-active" : "")} onClick={() => setMode("camera")}>
            <Icon.scan size={14} /> Camera
          </button>
          <button className={"ee-seg-btn " + (mode === "paste" ? "is-active" : "")} onClick={() => setMode("paste")}>
            Paste text
          </button>
        </div>

        {/* Camera placeholder */}
        {mode === "camera" && (
          <div className="ee-cam">
            <div className="ee-cam-frame">
              <span className="ee-cam-corner tl" />
              <span className="ee-cam-corner tr" />
              <span className="ee-cam-corner bl" />
              <span className="ee-cam-corner br" />
              <div className="ee-cam-scanline" />
              <div className="ee-cam-hint">Align the ingredient panel</div>
            </div>
            <button className="ee-btn ee-btn-primary" style={{ marginTop: 16 }} onClick={() => { setMode("paste"); useSample(); }}>
              <Icon.bolt size={14} /> Demo scan a label
            </button>
            <button className="ee-link" style={{ marginTop: 10 }} onClick={() => setMode("paste")}>
              or paste text instead
            </button>
          </div>
        )}

        {/* Paste mode */}
        {mode === "paste" && !result && (
          <div className="ee-form">
            <div className="ee-field">
              <label>Product name <span className="ee-opt">optional</span></label>
              <input
                type="text"
                placeholder="e.g. Cheez-It Original"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="ee-field">
              <div className="ee-field-h">
                <label>Ingredients</label>
                <button className="ee-link" onClick={useSample}>Use sample</button>
              </div>
              <textarea
                rows={6}
                placeholder="Paste the ingredient list from the back of the package…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <button
              className="ee-btn ee-btn-primary ee-btn-block"
              onClick={onAnalyze}
              disabled={!text.trim() || analyzing}
            >
              {analyzing ? <><span className="ee-spinner" /> Decoding…</> : <><Icon.bolt size={14} /> Analyze ingredients</>}
            </button>
          </div>
        )}

        {/* Result */}
        {mode === "paste" && result && (
          <ScanResult result={result} name={name} onSave={save} onRescan={() => { setResult(null); setText(""); setName(""); }} />
        )}
      </div>
    </div>
  );
}

function ScanResult({ result, name, onSave, onRescan }) {
  const tone = result.score >= 70 ? "green" : result.score >= 50 ? "yellow" : "red";
  const verdict =
    tone === "green" ? "Clean enough." :
    tone === "yellow" ? "Mixed bag." : "Skip if you can.";
  return (
    <div className="ee-result">
      <div className="ee-result-hero">
        <div className="ee-result-meta">
          <Kicker>Clean score</Kicker>
          <div className="ee-result-name">{name || "Scanned product"}</div>
        </div>
        <ScoreRing score={result.score} size={108} stroke={7} />
      </div>
      <div className="ee-result-num">
        <ScoreBadge score={result.score} size="xl" />
      </div>
      <div className="ee-verdict">{verdict}</div>

      <div className="ee-result-bar">
        <span className="seg" style={{ flex: result.red, background: "var(--flag-red)" }} title="Red flags" />
        <span className="seg" style={{ flex: result.yellow, background: "var(--flag-yellow)" }} title="Yellow flags" />
        <span className="seg" style={{ flex: result.green || 0.4, background: "var(--flag-green)" }} title="Green ingredients" />
      </div>
      <div className="ee-result-counts">
        <span><FlagDot flag="red" /> {result.red} red</span>
        <span><FlagDot flag="yellow" /> {result.yellow} watch</span>
        <span><FlagDot flag="green" /> {result.green} clean</span>
      </div>

      {result.allergens.length > 0 && (
        <div className="ee-allergens">
          <Icon.alert size={13} />
          <span>Allergens:</span>
          <em>{result.allergens.join(" · ")}</em>
        </div>
      )}

      <div className="ee-result-list">
        <Kicker>Ingredient breakdown</Kicker>
        <ul>
          {result.flags.map((f) => (
            <li key={f.key}>
              <FlagDot flag={f.ingredient.flag} />
              <div className="ee-il-body">
                <div className="ee-il-name">{f.ingredient.name}</div>
                <div className="ee-il-reason">{f.ingredient.reason}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="ee-result-actions">
        <button className="ee-btn ee-btn-primary ee-btn-block" onClick={onSave}>
          <Icon.check size={14} /> Save & see swaps
        </button>
        <button className="ee-btn ee-btn-ghost ee-btn-block" onClick={onRescan}>
          Decode another
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ScanSheet });
