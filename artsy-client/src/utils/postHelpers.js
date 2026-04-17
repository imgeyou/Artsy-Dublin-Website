// Shared helpers for post-related components

export function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr.replace(" ", "T"));
    return date
        .toLocaleString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        .replace(",", "");
}

export function resolveImageUrl(src) {
    return src.startsWith("uploads/") ? `/${src}` : src;
}
