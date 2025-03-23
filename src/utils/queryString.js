export const objectToQueryString = (filters) => {
    return Object.keys(filters)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
        .join("&");
};