export const removeUndefinedFields = (obj) => {
    const newObj = {};
    for (const key in obj) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};
