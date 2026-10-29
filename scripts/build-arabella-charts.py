"""
Charts for the Arabella findings and recommendations report.

    python3 scripts/build-arabella-charts.py   (needs matplotlib, e.g. in a venv)

Every figure is copied from the published client dashboard
(EngagementDashboard cmv0s7vb40001dbkbstpfseou) or from the audit notes, so the
report and the portal show the same numbers. Writes PNGs to docs/arabella/charts/.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / "docs" / "arabella" / "charts"
NAVY = "#0F2744"
GOLD = "#D4AF37"
GREY = "#9AA5B1"
INK = "#1F2933"

plt.rcParams.update({
    "font.family": ["Helvetica", "Arial", "DejaVu Sans"],
    "font.size": 10,
    "axes.edgecolor": "#CBD2D9",
    "axes.labelcolor": INK,
    "xtick.color": INK,
    "ytick.color": INK,
    "axes.spines.top": False,
    "axes.spines.right": False,
})


def naira_m(v: float) -> str:
    return f"N{v / 1e6:.1f}m"


def save(fig, name: str):
    OUT.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(OUT / name, dpi=200)
    plt.close(fig)


def revenue_by_month():
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
    vals = [4294750, 6073000, 11599450, 3914750, 3075000, 6198600, 2290900, 1767600, 9475100]
    avg = 5409905.555555556
    fig, ax = plt.subplots(figsize=(7.5, 3.2))
    bars = ax.bar(months, vals, color=NAVY, width=0.62)
    for b, v in zip(bars, vals):
        ax.text(b.get_x() + b.get_width() / 2, v + 150000, naira_m(v), ha="center", fontsize=8.5, color=INK)
    ax.axhline(avg, color=GOLD, lw=1.6, ls="--")
    ax.text(8.45, avg + 250000, f"Average {naira_m(avg)}", color="#8A6D12", fontsize=8.5, ha="right")
    ax.set_ylim(0, 13e6)
    ax.set_yticks([0, 4e6, 8e6, 12e6])
    ax.set_yticklabels(["0", "N4m", "N8m", "N12m"])
    ax.set_title("Money taken by month, 2026", loc="left", fontsize=11, color=NAVY, fontweight="bold")
    save(fig, "revenue-by-month.png")


def revenue_by_line():
    items = [
        ("Laboratory", 14555150), ("O&G consultations", 8828000), ("Fertility (referred)", 6000000),
        ("Pharmacy", 4214300), ("Procedures", 3985000), ("Maternity packages", 3011500),
        ("GP consultations", 1722000), ("Wellness", 1530000), ("Admissions", 1480650),
        ("Imaging", 905000), ("Registration fees", 830000), ("HMO payments", 800300),
        ("Visiting consultants", 415000), ("Other", 378250),
    ]
    total = sum(v for _, v in items)
    labels = [l for l, _ in items][::-1]
    vals = [v for _, v in items][::-1]
    colors = [GOLD if l in ("Maternity packages", "Fertility (referred)") else NAVY for l in labels]
    fig, ax = plt.subplots(figsize=(7.5, 4.4))
    bars = ax.barh(labels, vals, color=colors, height=0.66)
    for b, v in zip(bars, vals):
        ax.text(v + 150000, b.get_y() + b.get_height() / 2, f"{naira_m(v)}  ({v / total:.0%})", va="center", fontsize=8.5)
    ax.set_xlim(0, 18e6)
    ax.set_xticks([])
    ax.spines["bottom"].set_visible(False)
    ax.set_title("Where the money came from, January to September 2026", loc="left", fontsize=11, color=NAVY, fontweight="bold")
    save(fig, "revenue-by-line.png")


def patients_by_visits():
    labels = ["Paid once", "Paid twice", "Three times or more"]
    vals = [141, 196 - 141 - 16, 16]
    fig, ax = plt.subplots(figsize=(7.5, 2.4))
    bars = ax.barh(labels[::-1], vals[::-1], color=[NAVY, NAVY, GOLD], height=0.6)
    for b, v in zip(bars, vals[::-1]):
        ax.text(v + 2, b.get_y() + b.get_height() / 2, f"{v}  ({v / 196:.0%})", va="center", fontsize=9.5)
    ax.set_xlim(0, 175)
    ax.set_xticks([])
    ax.spines["bottom"].set_visible(False)
    ax.set_title("196 paying patients, January to September 2026, by number of payments", loc="left", fontsize=11, color=NAVY, fontweight="bold")
    save(fig, "patients-by-visits.png")


def maternity_outcomes():
    labels = ["Delivered at Arabella", "Delivered elsewhere", "Still in antenatal care"]
    vals = [1, 7, 3]
    fig, ax = plt.subplots(figsize=(7.5, 2.4))
    bars = ax.barh(labels[::-1], vals[::-1], color=[GREY, GOLD, NAVY], height=0.6)
    for b, v in zip(bars, vals[::-1]):
        ax.text(v + 0.12, b.get_y() + b.get_height() / 2, str(v), va="center", fontsize=10, fontweight="bold")
    ax.set_xlim(0, 8.5)
    ax.set_xticks([])
    ax.spines["bottom"].set_visible(False)
    ax.set_title("The year's 11 maternity bookings, by outcome", loc="left", fontsize=11, color=NAVY, fontweight="bold")
    save(fig, "maternity-outcomes.png")


def registrations_by_year():
    years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]
    vals = [2405, 441, 309, 287, 278, 202, 146, 166, 145]
    fig, ax = plt.subplots(figsize=(7.5, 3.0))
    bars = ax.bar(years, vals, color=[GREY] + [NAVY] * 8, width=0.62)
    for b, v in zip(bars, vals):
        ax.text(b.get_x() + b.get_width() / 2, v + 40, f"{v:,}", ha="center", fontsize=8.5)
    ax.text(0.45, 1500, "1,814 entered on one day\nwhen the list moved system", fontsize=8, color=INK)
    ax.set_ylim(0, 2700)
    ax.set_yticks([])
    ax.spines["left"].set_visible(False)
    ax.set_title("New patient registrations by year (2026 to date)", loc="left", fontsize=11, color=NAVY, fontweight="bold")
    save(fig, "registrations-by-year.png")


def payments_by_weekday():
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    vals = [31, 33, 20, 27, 13, 9, 4]
    fig, ax = plt.subplots(figsize=(7.5, 2.6))
    bars = ax.bar(days, vals, color=[NAVY] * 4 + [GOLD] * 3, width=0.6)
    for b, v in zip(bars, vals):
        ax.text(b.get_x() + b.get_width() / 2, v + 0.6, str(v), ha="center", fontsize=9)
    ax.set_ylim(0, 38)
    ax.set_yticks([])
    ax.spines["left"].set_visible(False)
    ax.set_title("Payments by day of the week (137 with a readable date)", loc="left", fontsize=11, color=NAVY, fontweight="bold")
    save(fig, "payments-by-weekday.png")


def staff_survey():
    rows = [
        ("Instrument sets are properly sterile", 5.0, "strong"),
        ("Sterilisation records completed for every load", 5.0, "strong"),
        ("Fertility patients given a realistic picture", 4.8, "strong"),
        ("Patients are treated with kindness", 4.8, "strong"),
        ("Medicines in date and stored correctly", 4.7, "strong"),
        ("Delivery room: everyone knows what to do in an emergency", 3.3, "weak"),
        ("I can question a senior decision safely", 3.1, "weak"),
        ("Theatre list starts on time", 3.0, "weak"),
    ]
    labels = [r[0] for r in rows][::-1]
    vals = [r[1] for r in rows][::-1]
    colors = [NAVY if r[2] == "strong" else GOLD for r in rows][::-1]
    fig, ax = plt.subplots(figsize=(7.5, 3.6))
    bars = ax.barh(labels, vals, color=colors, height=0.62)
    for b, v in zip(bars, vals):
        ax.text(v + 0.05, b.get_y() + b.get_height() / 2, f"{v:.1f}", va="center", fontsize=8.5)
    ax.set_xlim(1, 5.4)
    ax.set_xticks([1, 2, 3, 4, 5])
    ax.set_title("Staff survey: strongest and weakest statements, average 1 to 5", loc="left", fontsize=11, color=NAVY, fontweight="bold")
    save(fig, "staff-survey.png")


if __name__ == "__main__":
    revenue_by_month()
    revenue_by_line()
    patients_by_visits()
    maternity_outcomes()
    registrations_by_year()
    payments_by_weekday()
    staff_survey()
    print(f"wrote {len(list(OUT.glob('*.png')))} charts to {OUT}")
