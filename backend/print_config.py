"""Central, tunable configuration for LargePrint AI print-resolution logic.

All recommended PPI values are DEMO DEFAULTS and are intentionally kept here
(not buried inside components) so they can be adjusted later without touching
application code. These are recommended targets, not absolute printing rules.
"""

# Unit -> inches conversion factors
UNIT_TO_INCHES = {
    "in": 1.0,
    "ft": 12.0,
    "cm": 0.393701,
    "m": 39.3701,
}

UNITS = [
    {"value": "in", "label": "Inches"},
    {"value": "ft", "label": "Feet"},
    {"value": "cm", "label": "Centimeters"},
    {"value": "m", "label": "Meters"},
]

# Recommended target PPI per viewing distance (demo defaults, tunable)
VIEWING_DISTANCE_PPI = {
    "close": 150,   # viewed within ~3 ft
    "medium": 100,  # viewed ~3-10 ft
    "far": 50,      # viewed >10 ft (billboards etc.)
}

VIEWING_DISTANCES = [
    {"value": "auto", "label": "Auto Recommended"},
    {"value": "close", "label": "Close", "hint": "Viewed within ~3 ft"},
    {"value": "medium", "label": "Medium", "hint": "Viewed ~3-10 ft"},
    {"value": "far", "label": "Far", "hint": "Viewed from >10 ft"},
]

# When "Auto Recommended" is chosen, pick a distance profile based on print type
PRINT_TYPE_DEFAULT_DISTANCE = {
    "billboard": "far",
    "banner": "medium",
    "poster": "close",
    "sign": "medium",
    "trade_show": "medium",
    "custom": "medium",
}

PRINT_TYPES = [
    {"value": "billboard", "label": "Billboard", "desc": "Roadside & highway advertising"},
    {"value": "banner", "label": "Banner", "desc": "Vinyl banners & hanging displays"},
    {"value": "poster", "label": "Poster", "desc": "Indoor & retail posters"},
    {"value": "sign", "label": "Sign", "desc": "Storefront & wayfinding signage"},
    {"value": "trade_show", "label": "Trade Show Display", "desc": "Booths & backdrops"},
    {"value": "custom", "label": "Custom", "desc": "Any other large-format print"},
]

# Enhancement modes
ENHANCEMENT_MODES = [
    {
        "value": "print_accurate",
        "label": "Print Accurate",
        "desc": "Enhance resolution while preserving the original composition, colors, edges, and visual appearance.",
    },
    {
        "value": "ai_artwork",
        "label": "AI Artwork",
        "desc": "Enhanced processing for AI-generated artwork and digital illustrations, with greater emphasis on textures, edges, and fine details.",
    },
]

# Upload constraints (demo, configurable)
MAX_FILE_SIZE_MB = 25
SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "webp"]


def resolve_target_ppi(print_type: str, viewing_distance: str) -> int:
    """Resolve the recommended target PPI for a print type + viewing distance."""
    if viewing_distance == "auto":
        distance = PRINT_TYPE_DEFAULT_DISTANCE.get(print_type, "medium")
    else:
        distance = viewing_distance
    return VIEWING_DISTANCE_PPI.get(distance, VIEWING_DISTANCE_PPI["medium"])


def source_quality_status(required_enlargement: float) -> str:
    """Map required enlargement factor to a source-quality status label.

    Statuses are driven primarily by how much the source must be scaled up.
    """
    e = required_enlargement
    if e <= 1.0:
        return "excellent"
    if e <= 2.0:
        return "good"
    if e <= 4.0:
        return "needs_enhancement"
    if e <= 8.0:
        return "low_resolution"
    return "source_too_small"


def compute_analysis(
    image_width: int,
    image_height: int,
    print_width: float,
    print_height: float,
    print_unit: str,
    print_type: str,
    viewing_distance: str,
) -> dict:
    """Modular print-requirement calculation. Returns all derived metrics."""
    factor = UNIT_TO_INCHES.get(print_unit, 1.0)
    print_w_in = print_width * factor
    print_h_in = print_height * factor

    target_ppi = resolve_target_ppi(print_type, viewing_distance)

    required_px_w = round(print_w_in * target_ppi)
    required_px_h = round(print_h_in * target_ppi)

    eff_ppi_w = image_width / print_w_in if print_w_in > 0 else 0
    eff_ppi_h = image_height / print_h_in if print_h_in > 0 else 0
    effective_ppi = min(eff_ppi_w, eff_ppi_h)

    width_scale = required_px_w / image_width if image_width > 0 else 0
    height_scale = required_px_h / image_height if image_height > 0 else 0
    required_enlargement = max(width_scale, height_scale)

    return {
        "printWidthInches": round(print_w_in, 2),
        "printHeightInches": round(print_h_in, 2),
        "targetPPI": target_ppi,
        "effectivePPI": round(effective_ppi, 1),
        "requiredPixelWidth": required_px_w,
        "requiredPixelHeight": required_px_h,
        "requiredEnlargement": round(required_enlargement, 2),
        "sourceQuality": source_quality_status(required_enlargement),
    }
