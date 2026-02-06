"""
Demo: how a complex function transforms coordinate axes.

Default: w = (a + i b) z (rotation + scaling).
Option:  w = z**2 (nonlinear example).

Usage:
  python complex_axis_transform_demo.py
  python complex_axis_transform_demo.py --mode square
  python complex_axis_transform_demo.py --a 1 --b 2 --out demo.png
"""

import argparse
import numpy as np

try:
    import matplotlib.pyplot as plt
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        "matplotlib is required. Install it and re-run. Error: " + str(exc)
    )


def grid_lines(extent, step, n=400):
    t = np.linspace(-extent, extent, n)
    vals = np.arange(-extent, extent + 1e-9, step)
    lines = []
    for x in vals:
        lines.append(x + 1j * t)
    for y in vals:
        lines.append(t + 1j * y)
    return lines, vals


def plot_lines(ax, lines, color="#999999", lw=1.0):
    for z in lines:
        ax.plot(z.real, z.imag, color=color, lw=lw)


def bounds(lines):
    xs = np.concatenate([z.real for z in lines])
    ys = np.concatenate([z.imag for z in lines])
    return xs.min(), xs.max(), ys.min(), ys.max()


def apply_function(lines, f):
    return [f(z) for z in lines]


def main():
    parser = argparse.ArgumentParser(description="Complex-axis transform demo")
    parser.add_argument("--mode", choices=["linear", "square"], default="linear")
    parser.add_argument("--a", type=float, default=1.0, help="real part for linear mode")
    parser.add_argument("--b", type=float, default=1.0, help="imag part for linear mode")
    parser.add_argument("--extent", type=float, default=2.0)
    parser.add_argument("--grid-step", type=float, default=1.0)
    parser.add_argument("--out", type=str, default="axis_transform_demo.png")
    args = parser.parse_args()

    if args.mode == "linear":
        c = args.a + 1j * args.b

        def f(z):
            return c * z

        title = f"w = ({args.a}+i{args.b}) z"
    else:

        def f(z):
            return z ** 2

        title = "w = z^2"

    lines, vals = grid_lines(args.extent, args.grid_step)

    fig, (ax0, ax1) = plt.subplots(1, 2, figsize=(10, 5), constrained_layout=True)

    # Original grid
    plot_lines(ax0, lines)
    ax0.plot([ -args.extent, args.extent ], [0, 0], color="#000000", lw=1.5)
    ax0.plot([0, 0], [ -args.extent, args.extent ], color="#000000", lw=1.5)
    ax0.set_title("z-plane")
    ax0.set_aspect("equal", "box")
    ax0.set_xlim(-args.extent, args.extent)
    ax0.set_ylim(-args.extent, args.extent)

    # Transformed grid
    lines_w = apply_function(lines, f)
    plot_lines(ax1, lines_w)
    ax1.set_title(title)
    ax1.set_aspect("equal", "box")

    xmin, xmax, ymin, ymax = bounds(lines_w)
    dx = (xmax - xmin) * 0.1
    dy = (ymax - ymin) * 0.1
    ax1.set_xlim(xmin - dx, xmax + dx)
    ax1.set_ylim(ymin - dy, ymax + dy)

    fig.suptitle("Complex Function as Coordinate Transform", fontsize=12)
    fig.savefig(args.out, dpi=160)
    print("saved:", args.out)


if __name__ == "__main__":
    main()
