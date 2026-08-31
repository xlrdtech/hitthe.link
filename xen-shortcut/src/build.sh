#!/bin/bash
# Build + sign "Send to Xen 3" from source and stage it into the deploy dir.
#
# WHY THIS FILE EXISTS: the 2026-08-31 18:47 build was ad-hoc shell in a /private/tmp
# scratchpad and the source plist existed ONLY there - one reboot from gone. Source now
# lives beside this script in the canonical tree.
#
#   ./build.sh            # apply classes.txt, sign, stage to deploy dir
#   ./build.sh --verify   # additionally extract the signed output and print what iOS will see
#
# Verify recipe (no private key needed): the .shortcut is AEA1 profile 0 =
# hkdf_sha256_hmac__none__ecdsa_p256 = SIGNED BUT NOT ENCRYPTED, so it opens with the
# public key embedded in its own cert chain. See verify() below.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DEPLOY="$(cd "$HERE/.." && pwd)"
SRC="$HERE/SendToXen3.plist"
CLASSES="$HERE/classes.txt"
BUILD="$HERE/build"
mkdir -p "$BUILD"

# 1. apply classes.txt + input-variable flag onto the source plist
python3 - "$SRC" "$CLASSES" "$BUILD/SendToXen3.plist" <<'PY'
import sys, plistlib
src, classes, out = sys.argv[1:4]
p = plistlib.load(open(src, 'rb'))
want = [l.strip() for l in open(classes)
        if l.strip() and not l.strip().startswith('#')]
seen, ordered = set(), []
for c in want:
    if c not in seen:
        seen.add(c); ordered.append(c)
before = list(p['WFWorkflowInputContentItemClasses'])
dropped = [c for c in before if c not in seen]
if dropped:
    raise SystemExit("REFUSING TO NARROW: classes.txt drops %s" % dropped)
p['WFWorkflowInputContentItemClasses'] = ordered
# share-sheet input must be bound as a variable or the extension input is not offered
p['WFWorkflowHasShortcutInputVariables'] = True
plistlib.dump(p, open(out, 'wb'))
print("classes: %d (was %d, added %d)" % (len(ordered), len(before), len(ordered) - len(before)))
print("wrote", out)
PY

# 2. sign.
# TWO MEASURED TRAPS, both silent-ish:
#  (a) `shortcuts sign` sniffs the INPUT BY EXTENSION. Handing it a .plist fails with
#      "The file couldn't be opened because it isn't in the correct format" even though
#      the bytes are a perfectly valid XML plist. The input must be named *.shortcut.
#  (b) It CANNOT WRITE ITS OUTPUT ONTO /Volumes/M4 - fails with "couldn't be saved in
#      the folder". Sign into a local tmp dir, then copy the result back.
# The "Unrecognized attribute string flag '?'" ERROR lines on stderr are harmless
# framework chatter and appear even on a fully successful sign. Judge by exit code
# and by the output file existing, never by stderr being clean.
TMP="$(mktemp -d /tmp/xen-shortcut-sign.XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
cp "$BUILD/SendToXen3.plist" "$TMP/SendToXen3.shortcut"
shortcuts sign --mode anyone \
  --input "$TMP/SendToXen3.shortcut" \
  --output "$TMP/SendToXen3-signed.shortcut"
[ -s "$TMP/SendToXen3-signed.shortcut" ] || { echo "SIGN PRODUCED NO OUTPUT" >&2; exit 1; }
cp "$TMP/SendToXen3-signed.shortcut" "$BUILD/SendToXen3.shortcut"
chmod 644 "$BUILD/SendToXen3.shortcut"
echo "signed: $(md5 -q "$BUILD/SendToXen3.shortcut")  $(stat -f%z "$BUILD/SendToXen3.shortcut") bytes"

# 3. stage into the deploy dir (timestamped backup of whatever is there)
if [ -f "$DEPLOY/SendToXen3.shortcut" ]; then
  cp -p "$DEPLOY/SendToXen3.shortcut" "$DEPLOY/SendToXen3.shortcut.bak-$(date +%Y%m%d-%H%M%S)"
fi
cp "$BUILD/SendToXen3.shortcut" "$DEPLOY/SendToXen3.shortcut"
echo "staged -> $DEPLOY/SendToXen3.shortcut"

[ "${1:-}" = "--verify" ] || exit 0

# 4. verify: read back what iOS will actually see
W="$BUILD/verify"; rm -rf "$W"; mkdir -p "$W"
python3 - "$DEPLOY/SendToXen3.shortcut" "$W" <<'PY'
import sys, struct, plistlib, os
d = open(sys.argv[1], 'rb').read()
assert d[:4] == b'AEA1', d[:4]
n = struct.unpack('<I', d[8:12])[0]
chain = plistlib.loads(d[12:12+n])['SigningCertificateChain']
open(os.path.join(sys.argv[2], 'cert0.der'), 'wb').write(chain[0])
PY
openssl x509 -inform DER -in "$W/cert0.der" -noout -pubkey > "$W/pub.pem"
openssl ec -pubin -in "$W/pub.pem" -outform DER -out "$W/pub.der" 2>/dev/null
tail -c 65 "$W/pub.der" > "$W/pub.x963"
# NOTE: -sign-pub wants a FILE containing the literal ASCII "base64:<key>".
# Raw hex, bare base64, and a raw 65-byte binary file all fail to parse.
printf 'base64:%s' "$(base64 -i "$W/pub.x963")" > "$W/pub.b64file"
aea decrypt -i "$DEPLOY/SendToXen3.shortcut" -o "$W/inner.aa" -sign-pub "$W/pub.b64file"
aa extract -i "$W/inner.aa" -d "$W/out"   # inner blob is an Apple Archive, not a plist
python3 - "$W/out/Shortcut.wflow" <<'PY'
import sys, plistlib
p = plistlib.load(open(sys.argv[1], 'rb'))
cls = p['WFWorkflowInputContentItemClasses']
print("VERIFIED accepted classes:", len(cls))
for c in cls: print("  ", c)
print("WFWorkflowHasShortcutInputVariables =", p.get('WFWorkflowHasShortcutInputVariables'))
print("WFWorkflowTypes =", p.get('WFWorkflowTypes'))
print("actions =", [a['WFWorkflowActionIdentifier'] for a in p['WFWorkflowActions']])
PY
