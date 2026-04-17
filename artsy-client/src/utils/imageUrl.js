//this is helper function for imageUrls

function fullImageUrl(relativePath){
    return relativePath?`${import.meta.env.VITE_API_URL}/${relativePath}` : null;
}

export{
    fullImageUrl,
}