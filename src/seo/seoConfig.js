const BASE_URL = "https://YOUR_DOMAIN";

export const seoConfig = {
    "/": {
        title: "National Data Repository (NDR) India | DGH, Government of India",
        description:
            "Official National Data Repository (NDR) of Government of India providing exploration and production (E&P) data for Indian sedimentary basins.",
        keywords:
            "National Data Repository, NDR India, DGH, E&P data India, Government of India",
        canonical: `${BASE_URL}/`,
    },

    "/about": {
        title: "About National Data Repository | NDR India",
        description:
            "Learn about the National Data Repository (NDR), its mandate and role in managing exploration and production data in India.",
        keywords: "About NDR, National Data Repository India",
        canonical: `${BASE_URL}/about`
    },


    "/objective": {
        title: "Objectives of National Data Repository | NDR India",
        description:
            "Understand the objectives of the National Data Repository in supporting exploration, research and investment in India’s hydrocarbon sector.",
        keywords: "NDR objectives, hydrocarbon data India",
        canonical: `${BASE_URL}/objective`,
    },

    "/operationalModel": {
        title: "Operational Model of NDR | Data Management Framework",
        description:
            "Overview of the operational model of National Data Repository including data ingestion, storage, security and dissemination.",
        keywords: "NDR operational model, E&P data management",
        canonical: `${BASE_URL}/operationalModel`,
    },

    "/sedimentaryBasins": {
        title: "Indian Sedimentary Basins Data | National Data Repository",
        description:
            "Access geological and geophysical data of Indian sedimentary basins hosted by the National Data Repository.",
        keywords: "Indian sedimentary basins, hydrocarbon basin data",
        canonical: `${BASE_URL}/sedimentaryBasins`,
    },

    "/policies": {
        title: "NDR Policies & Guidelines | Government of India",
        description:
            "Official policies related to data submission, access, dissemination and governance under the National Data Repository.",
        keywords: "NDR policies, E&P data policy India",
        canonical: `${BASE_URL}/policies`,
    },
};
