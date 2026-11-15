"""Checks the arithmetic of every worksheet twin (A1-A8, B1-B6) and the live exit ticket.
Run: python tools/check_twins.py   (exact fractions; pi kept as a symbol where the answer is 'in terms of pi')"""
from fractions import Fraction as F
from math import pi, sqrt, asin, degrees, isclose

def ok(name, cond, *info):
    assert cond, (name, info)
    print("ok ", name, *info)

# ---------- Section A ----------
# A1 (2026 P2 Q16): perimeter k, area 2k, r = 12 -> arc l
r = 12; l = F(24, 2)            # area = r l / 2 = 6 l = 2k -> k = 3l ; 2r + l = k -> 24 + l = 3l -> l = 12
ok("A1", 6 * l == 2 * (2 * r + l) and l < 2 * pi * r, "arc =", l)

# A2 (2016 P2 Q19): OA 12, OC 18, shaded 30pi
th = F(30 * 360, 18**2 - 12**2)
ok("A2 angle", th == 60)
ok("A2 II", F(12**2) * th / 360 == 24, "sector OAB = 24pi")
ok("A2 III", F(2 * 18) * th / 360 == 6, "arc CD = 6pi, perimeter = 36 + 6pi, so III false")

# A3 (2022 P2 Q16): diameter 26, chord 24 -> major segment
R, c = 13, 24; d = sqrt(R*R - (c/2)**2); ang = 2 * degrees(asin((c/2) / R))
minor = pi*R*R*ang/360 - 0.5*c*d; major = pi*R*R - minor
ok("A3", round(major) == 392 and round(minor) == 139 and d == 5, "angle", round(ang, 2), "major", round(major, 2), "minor", round(minor, 2),
   "major sector", round(pi*R*R*(360-ang)/360, 2))
ok("A3 options", [round(minor), round(pi*R*R*(360-ang)/360 - 60), round(pi*R*R*(360-ang)/360), round(major)] == [139, 272, 332, 392])

# A4 (2019 P2 Q15): square pyramid side 16, height 15
s, h = 16, 15; sl = sqrt(8**2 + h**2)
ok("A4", sl == 17 and s*s + 4*0.5*s*sl == 800 and s*s + 2*s*h == 736, "TSA 800; using the height gives 736")
ok("A4 options", 2 * s*s + 4*0.5*s*sl == 1056 and s*s + 4*s*sl == 1344)

# A5 (2026 P2 Q17): rectangular pyramid 18 x 12, height 15, X breadth 8
V = F(1, 3) * 18 * 12 * 15; k = F(8, 12)
ok("A5", V == 1080 and V * (1 - k**3) == 760 and V * k**3 == 320 and V * (1 - k**2) == 600 and V * (1 - k) == 360, "Y = 760")

# A6 (2020 P2 Q16): cylinder radius 3a, height 4b, volume 360 ; cone radius 4a height 3b
a2b = F(360, 36)                # pi a^2 b
cone = F(1, 3) * 16 * 3 * a2b
ok("A6", cone == 160 and 3 * cone == 480 and F(1, 3) * 9 * 4 * a2b == 120, "cone = 160")

# A7 (2021 P2 Q16): hemispheres TSA sum 135pi, radii 1:2
k2 = F(135, 3 * (1 + 4)); ok("A7 k", k2 == 9)
r1, r2 = 3, 6
diff = F(2, 3) * (r2**3 - r1**3)
ok("A7", diff == 126 and r2**3 - r1**3 == 189 and F(4, 3) * 189 == 252, "difference 126pi")
ok("A7 options", F(2, 3) * (r2**3 + r1**3) == 162)

# A8 (2018 P2 Q16): BE:EC = 3:2, area ABF = 60
BFE = F(60) * F(3, 5); DFA = F(60) * F(5, 3); ABD = 60 + DFA
ok("A8", BFE == 36 and DFA == 100 and ABD == 160 and ABD - BFE == 124, "CDFE = 124")
ok("A8 options", ABD - BFE - 60 == 64)

# ---------- Section B ----------
# B1 (2016 P1 Q11): depth 16 -> 20 after adding 732pi
Vf = F(732) / (1 - F(16, 20)**3)
ok("B1 a", Vf == 1500)
rf2 = Vf * 3 / 20; ok("B1 r", rf2 == 225)
csa = 15 * sqrt(15**2 + 20**2)
ok("B1 b", csa == 375 and 375 * pi < 1200, "CSA 375pi =", round(375 * pi, 2))

# B2 (2026 P1 Q13): sphere r 9 into three similar cylinders 1:2:3 ; height of Y 24
Vs = F(4, 3) * 9**3; VY = Vs * F(8, 1 + 8 + 27)
ok("B2 a", Vs == 972 and VY == 216)
ok("B2 r2", VY / 24 == 9)
TY = 2 * 9 + 2 * 3 * 24; TZ = F(TY) * F(3, 2)**2; Ss = 4 * 81
ok("B2 b", TY == 162 and TZ == F(729, 2) and TZ > Ss, "TSA Z", TZ, "sphere", Ss)

# B3 (2023 P1 Q14): cone radius 7, CSA 175pi ; CSA Y = 3 CSA X ; Y into 6 spheres
ls = F(175, 7); ok("B3 a", ls == 25 and sqrt(25**2 - 7**2) == 24)
V = F(1, 3) * 49 * 24; VY = V * (1 - F(1, 2)**3)
ok("B3 b", V == 392 and VY == 343)
rr3 = VY / 6 * F(3, 4); ok("B3 c", rr3 == F(7, 2)**3, "diameter 7")

# B4 (2024 P1 Q13): square pyramid side 30, height 20, Y height 12 ; Z height 4, TSA 600
k = F(12, 20); VX = F(1, 3) * 900 * 20 * (1 - k**3)
ok("B4 a", VX == 4704)
slant = sqrt(15**2 + 20**2) * (1 - k); top = 30 * k
face = 0.5 * (30 + top) * slant; TX = 4 * face + 30**2 + top**2
ok("B4 b", slant == 10 and top == 18 and face == 240 and TX == 2184 and TX / 600 != (8 / 4)**2, "TSA X", TX, "ratio", TX / 600)

# B5 (2018 P1 Q14): cylinder r 9, h 48 into inverted cone r 21, h 42 ; sphere r 12
W = 81 * 48; d3 = W * 3 * 4         # radius = depth/2 -> (1/3) pi d^3/4 = W pi
ok("B5 a,b", W == 3888 and d3 == 36**3, "depth 36")
empty = F(1, 3) * 21**2 * 42 - W; sph = F(4, 3) * 12**3
ok("B5 c", empty == 2286 and sph == 2304 and sph > empty, "overflows")
from math import atan
sina = 21 / sqrt(21**2 + 42**2)
ok("B5 fits", 12 / sina + 12 < 42, "sphere top at", round(12 / sina + 12, 2))

# B6 (2025 P1 Q14): cone h 36, r 15, frustum height 24
ok("B6 slant", sqrt(15**2 + 36**2) == 39 and sqrt(5**2 + 12**2) == 13)
VX = F(1, 3) * (225 * 36 - 25 * 12)
TX = (15 * 39 - 5 * 13) + 225 + 25
cube = 6 * (VX * pi) ** (2 / 3)
ok("B6", VX == 2600 and TX == 770 and cube > TX * pi, "TSA X", round(TX * pi, 2), "cube", round(cube, 2), "side", round((VX * pi) ** (1 / 3), 3))

# ---------- Exit ticket (live): similar cones, CSA 9:16, smaller volume 54pi ----------
ok("Exit", F(54) * F(4, 3)**3 == 128 and F(54) * F(16, 9) == 96 and F(54) * F(4, 3) == 72, "larger 128pi")

# ---------- Real-question answers quoted in the notes and the live page ----------
ok("2026 P2 Q16", F(28) / (F(7, 3) - 1) == 21)
ok("2024 P2 Q15", 2 * 80 / 8 == 20 and F(8, 40) * 360 == 72)
ok("2017 P1 Q12", F(1680) / (1 + F(8, 27)) == 1296)
ok("2023 P1 Q14", F(1, 3) * 196 * 48 * (1 - F(1, 64)) == 3087)
ok("2020 P1 Q12", F(1, 3) * 225 * 36 * F(7, 27) == 700 and 15 * 39 * F(3, 9) == 195)
ok("2024 P1 Q13", F(1, 3) * 64**2 * 24 * (1 - F(27, 64)) == 18944 and 4 * 560 + 64**2 + 48**2 == 8640)
ok("2018 P1 Q14", F(1, 3) * 400 * 60 - 4096 == 3904 and F(4, 3) * 14**3 < 3904)
ok("2026 P1 Q13", F(4000, 3) * F(27, 160) == 225 and 140 * F(25, 9) < 400)
ok("2014 P1 Q14", 72 * 120 * F(64**2 - 36**2, 96**2) == 2625)
print("\nAll twins check out.")
