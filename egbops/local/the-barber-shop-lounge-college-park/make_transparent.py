"""Border-flood transparency pass for the grok-generated logo emblem.
Floods inward from all four borders, knocking out the uniform dark background
(within a tolerance) to true alpha-0. Guarantees the four corners are fully
transparent. Writes assets/logo.png (RGBA)."""
import sys
from collections import deque
from PIL import Image

SRC = r"E:\hitthe.link\egbops\local\the-barber-shop-lounge-college-park\assets\logo_raw.png"
OUT = r"E:\hitthe.link\egbops\local\the-barber-shop-lounge-college-park\assets\logo.png"
TOL = 60          # color distance tolerance from the sampled background
FEATHER_TOL = 95  # softer band for partial alpha (anti-alias edge)

img = Image.open(SRC).convert("RGBA")
w, h = img.size
px = img.load()

# Sample background color = average of the four corners
corners = [px[0, 0], px[w-1, 0], px[0, h-1], px[w-1, h-1]]
bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

def dist(c):
    return ((c[0]-bg[0])**2 + (c[1]-bg[1])**2 + (c[2]-bg[2])**2) ** 0.5

# Flood fill from every border pixel; clear background-colored regions.
visited = bytearray(w * h)
q = deque()
for x in range(w):
    q.append((x, 0)); q.append((x, h-1))
for y in range(h):
    q.append((0, y)); q.append((w-1, y))

while q:
    x, y = q.popleft()
    if x < 0 or y < 0 or x >= w or y >= h:
        continue
    idx = y * w + x
    if visited[idx]:
        continue
    visited[idx] = 1
    r, g, b, a = px[x, y]
    d = dist((r, g, b))
    if d <= TOL:
        px[x, y] = (r, g, b, 0)
    elif d <= FEATHER_TOL:
        # feather edge: partial transparency proportional to distance
        frac = (d - TOL) / (FEATHER_TOL - TOL)
        px[x, y] = (r, g, b, int(255 * frac))
        continue  # stop flood at the feather boundary
    else:
        continue  # hit the emblem; stop spreading here
    q.append((x+1, y)); q.append((x-1, y))
    q.append((x, y+1)); q.append((x, y-1))

# Hard guarantee: corners are alpha 0
for cx, cy in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]:
    r, g, b, _ = px[cx, cy]
    px[cx, cy] = (r, g, b, 0)

img.save(OUT)
print(f"bg={bg} size={w}x{h} -> {OUT}")
print("corner_alphas=", [px[cx, cy][3] for cx, cy in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]])
