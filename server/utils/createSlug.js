const createSlug = (
    name
) => {

    return name
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /(^-|-$)/g,
            ""
        );

};


export default createSlug;