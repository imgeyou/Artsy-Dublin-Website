// Shared helpers for post-related components

//check if the visiblle events are saved: showing saved status
export async function checkSaves(eventIds) {
    if (!eventIds.length) return [];
    try {
        const res = await fetch(`/ad-posts/saves/check?eventIds=${eventIds.join(",")}`, {
            credentials: "include",
        });
        if (!res.ok) return [];
        return await res.json(); // array of saved eventIds
    } catch {
        return [];
    }
}

//check if the visiblle posts are liked: showing liked status
export async function checkLikes(postIds) {
    if (!postIds.length) return [];
    try {
        const res = await fetch(`/ad-posts/likes/check?postIds=${postIds.join(",")}`, {
            credentials: "include",
        });
        if (!res.ok) return [];
        return await res.json(); // array of liked postIds
    } catch {
        return [];
    }
}

//format date to readable format
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

function fullImageUrl(relativePath) {
    return relativePath ? `${import.meta.env.VITE_API_URL}/${relativePath}` : null;
}

//translate imageUrls from backend to presentable frontend Urls
export function resolveImageUrl(src) {
    return src.startsWith("uploads/") ? fullImageUrl(src) : src;
}

// collect postIds from a post and all its nested comments/replies
export function collectAllIds(post, comments) {
    const ids = [post.postId];
    function collect(list) {
        for (const c of list) {
            ids.push(c.postId);
            if (c.replies?.length) collect(c.replies);
        }
    }
    collect(comments);
    return ids;
}

// apply liked status recursively to comments and replies
export function applyLikedRecursive(comments, likedArr) {
    return comments.map((c) => ({
        ...c,
        liked: likedArr.includes(c.postId),
        replies: c.replies?.length ? applyLikedRecursive(c.replies, likedArr) : c.replies,
    }));
}

// update content of a comment or reply by postId
export function updateCommentContent(comments, postId, content) {
    return comments.map((c) => {
        if (c.postId === postId) return { ...c, content };
        if (c.replies?.length) return { ...c, replies: updateCommentContent(c.replies, postId, content) };
        return c;
    });
}

// remove a comment or reply by postId
export function removeComment(comments, postId) {
    return comments
        .filter((c) => c.postId !== postId)
        .map((c) => c.replies?.length ? { ...c, replies: removeComment(c.replies, postId) } : c);
}
