#!/usr/bin/env bash
# Exedus universal installer — curl -fsSL hitthe.link/exedus.sh | bash
# Turns any fresh Linux box into an Exedus/Xen node. Idempotent. Run as root (or sudo).
set -e
echo "==> Exedus installer"

SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"

# 1. base packages
if command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq tmux curl git ca-certificates >/dev/null 2>&1 || true
fi

# 2. node 20 + claude code
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash - >/dev/null 2>&1
  $SUDO apt-get install -y -qq nodejs >/dev/null 2>&1
fi
command -v claude >/dev/null 2>&1 || $SUDO npm install -g @anthropic-ai/claude-code >/dev/null 2>&1

# 3. xen user (claude bypass mode refuses to run as root)
id xen >/dev/null 2>&1 || $SUDO useradd -m -s /bin/bash xen
$SUDO mkdir -p /home/xen/.xen/state /home/xen/.claude

# 4. device registry (edit to add nodes; this node auto-joins the mesh)
$SUDO tee /home/xen/.xen/state/omni-devices.json >/dev/null <<'JSON'
{
  "_canon": "Exedus Omni mesh — all devices equal. Add nodes here; xen-mesh fans a window into each.",
  "hub": "exedus",
  "nodes": []
}
JSON

# 5. pre-accept claude first-run dialogs (no taps, ever)
$SUDO tee /home/xen/.claude.json >/dev/null <<'JSON'
{ "hasTrustDialogAccepted": true, "bypassPermissionsModeAccepted": true, "hasAcknowledgedBypassPermissionsMode": true,
  "projects": { "/home/xen": { "hasTrustDialogAccepted": true, "hasCompletedProjectOnboarding": true } } }
JSON

# 6. the mesh launcher (runs as xen): hub=Xen in bypass, + one window per registry node
$SUDO tee /home/xen/xen-mesh.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
REG=$HOME/.xen/state/omni-devices.json
SES=xen
if ! tmux has-session -t "$SES" 2>/dev/null; then
  tmux new-session -d -s "$SES" -x 220 -y 50 -n hub
  tmux send-keys -t "$SES":hub "cd ~; claude --dangerously-skip-permissions" Enter
  python3 -c "import json;d=json.load(open(\"$REG\"));[print(n['name'],n['ssh'].split()[-1],n.get('port',22)) for n in d.get('nodes',[])]" 2>/dev/null | while read name target port; do
    [ "$name" = "exedus" ] && continue
    tmux new-window -t "$SES" -n "$name" "ssh -o ConnectTimeout=8 -p $port $target; bash"
  done
  tmux select-window -t "$SES":hub
fi
exec tmux attach -t "$SES"
EOF
$SUDO chmod +x /home/xen/xen-mesh.sh
$SUDO chown -R xen:xen /home/xen

# 7. exedus + xen commands (both start Xen)
$SUDO tee /usr/local/bin/xen >/dev/null <<'EOF'
#!/usr/bin/env bash
exec su - xen -c /home/xen/xen-mesh.sh
EOF
$SUDO chmod +x /usr/local/bin/xen
$SUDO ln -sf /usr/local/bin/xen /usr/local/bin/exedus

# 8. boot-persistence
if command -v systemctl >/dev/null 2>&1; then
  $SUDO tee /etc/systemd/system/xen-omni.service >/dev/null <<'EOF'
[Unit]
Description=Exedus/Xen Omni mesh on boot
After=network-online.target
Wants=network-online.target
[Service]
Type=oneshot
RemainAfterExit=yes
User=xen
ExecStart=/home/xen/xen-mesh.sh
ExecStop=/usr/bin/tmux kill-session -t xen
[Install]
WantedBy=multi-user.target
EOF
  $SUDO systemctl daemon-reload
  $SUDO systemctl enable xen-omni.service >/dev/null 2>&1 || true
fi

echo "==> Exedus installed."
echo "    1) One-time login:  su - xen -c claude   (then /login, paste the code)"
echo "    2) Start anytime:   exedus    (or: xen)"
echo "    Add nodes to /home/xen/.xen/state/omni-devices.json and they auto-join the mesh."
