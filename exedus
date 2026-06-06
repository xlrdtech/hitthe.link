#!/usr/bin/env bash
# Exedus universal installer — curl -fsSL https://raw.githubusercontent.com/xlrdtech/hitthe.link/main/exedus.sh | bash
# Cross-platform: macOS (brew, current user) + Linux (apt; dedicated xen user when run as root, since bypass refuses root).
# Idempotent. Installs `exedus` + `xen` GLOBALLY into /usr/local/bin. Type `exedus` to start Xen.
set -e
echo "==> Exedus installer"

OS="$(uname -s)"
SUDO=""; [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1 && SUDO="sudo"

install_pkgs_mac() {
  if command -v brew >/dev/null 2>&1; then
    command -v tmux >/dev/null 2>&1 || brew install tmux >/dev/null 2>&1 || true
    command -v node >/dev/null 2>&1 || brew install node >/dev/null 2>&1 || true
  else
    echo "    (Homebrew not found — install from https://brew.sh for tmux/node)"
  fi
  command -v claude >/dev/null 2>&1 || npm install -g @anthropic-ai/claude-code >/dev/null 2>&1 || $SUDO npm install -g @anthropic-ai/claude-code >/dev/null 2>&1 || true
}
install_pkgs_linux() {
  export DEBIAN_FRONTEND=noninteractive
  command -v apt-get >/dev/null 2>&1 && { $SUDO apt-get update -qq; $SUDO apt-get install -y -qq tmux curl git ca-certificates >/dev/null 2>&1 || true; }
  if ! command -v node >/dev/null 2>&1; then curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash - >/dev/null 2>&1; $SUDO apt-get install -y -qq nodejs >/dev/null 2>&1; fi
  command -v claude >/dev/null 2>&1 || $SUDO npm install -g @anthropic-ai/claude-code >/dev/null 2>&1
}

# RUNUSER = account Xen runs as. Linux+root needs a non-root user (bypass refuses root). Otherwise current user.
if [ "$OS" = "Linux" ] && [ "$(id -u)" -eq 0 ]; then
  install_pkgs_linux
  id xen >/dev/null 2>&1 || useradd -m -s /bin/bash xen
  RUNUSER=xen; RUNHOME=/home/xen
elif [ "$OS" = "Darwin" ]; then
  install_pkgs_mac
  RUNUSER="$(id -un)"; RUNHOME="$HOME"
else
  install_pkgs_linux
  RUNUSER="$(id -un)"; RUNHOME="$HOME"
fi
echo "==> Xen will run as: $RUNUSER ($RUNHOME)"

mkdir -p "$RUNHOME/.xen/state" "$RUNHOME/.claude"
[ -f "$RUNHOME/.xen/state/omni-devices.json" ] || cat > "$RUNHOME/.xen/state/omni-devices.json" <<'JSON'
{ "_canon": "Exedus Omni mesh — all devices equal. Add nodes; xen-mesh fans a window into each.", "hub": "exedus", "nodes": [] }
JSON

# pre-accept claude dialogs (merge if config exists, never clobber creds)
if [ -f "$RUNHOME/.claude.json" ]; then
  python3 - "$RUNHOME/.claude.json" <<'PY' 2>/dev/null || true
import json,sys
p=sys.argv[1]; d=json.load(open(p))
d["hasTrustDialogAccepted"]=True; d["bypassPermissionsModeAccepted"]=True; d["hasAcknowledgedBypassPermissionsMode"]=True
json.dump(d,open(p,"w"),indent=2)
PY
else
  cat > "$RUNHOME/.claude.json" <<'JSON'
{ "hasTrustDialogAccepted": true, "bypassPermissionsModeAccepted": true, "hasAcknowledgedBypassPermissionsMode": true }
JSON
fi

cat > "$RUNHOME/xen-mesh.sh" <<'EOF'
#!/usr/bin/env bash
REG="$HOME/.xen/state/omni-devices.json"; SES=xen
if ! tmux has-session -t "$SES" 2>/dev/null; then
  tmux new-session -d -s "$SES" -x 220 -y 50 -n hub
  tmux send-keys -t "$SES":hub "cd ~; IS_SANDBOX=1 claude --dangerously-skip-permissions" Enter
  python3 -c "import json;d=json.load(open(\"$REG\"));[print(n['name'],n['ssh'].split()[-1],n.get('port',22)) for n in d.get('nodes',[])]" 2>/dev/null | while read name target port; do
    [ "$name" = "exedus" ] && continue
    tmux new-window -t "$SES" -n "$name" "ssh -o ConnectTimeout=8 -p $port $target; bash"
  done
  tmux select-window -t "$SES":hub
fi
exec tmux attach -t "$SES"
EOF
chmod +x "$RUNHOME/xen-mesh.sh"
[ "$RUNUSER" != "$(id -un)" ] && chown -R "$RUNUSER":"$RUNUSER" "$RUNHOME" 2>/dev/null || true

# global commands
if [ "$RUNUSER" = "$(id -un)" ]; then
  printf '#!/usr/bin/env bash\nexec "%s/xen-mesh.sh"\n' "$RUNHOME" | $SUDO tee /usr/local/bin/xen >/dev/null
else
  printf '#!/usr/bin/env bash\nexec su - %s -c "%s/xen-mesh.sh"\n' "$RUNUSER" "$RUNHOME" | $SUDO tee /usr/local/bin/xen >/dev/null
fi
$SUDO chmod +x /usr/local/bin/xen
$SUDO ln -sf /usr/local/bin/xen /usr/local/bin/exedus

# boot persistence (Linux systemd; macOS launchd skipped)
if [ "$OS" = "Linux" ] && command -v systemctl >/dev/null 2>&1; then
  $SUDO tee /etc/systemd/system/xen-omni.service >/dev/null <<EOF
[Unit]
Description=Exedus/Xen Omni mesh on boot
After=network-online.target
Wants=network-online.target
[Service]
Type=oneshot
RemainAfterExit=yes
User=$RUNUSER
ExecStart=$RUNHOME/xen-mesh.sh
ExecStop=/usr/bin/tmux kill-session -t xen
[Install]
WantedBy=multi-user.target
EOF
  $SUDO systemctl daemon-reload; $SUDO systemctl enable xen-omni.service >/dev/null 2>&1 || true
fi

echo "==> Exedus installed ($OS). Global commands: exedus (== xen)."
command -v claude >/dev/null 2>&1 || echo "    NOTE: install claude:  npm i -g @anthropic-ai/claude-code"
echo "    One-time login if needed:  claude   (then /login)"
echo "    Start anytime:  exedus"
echo "    Grow the mesh: add nodes to $RUNHOME/.xen/state/omni-devices.json"
