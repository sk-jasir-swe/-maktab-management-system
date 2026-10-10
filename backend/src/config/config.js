

if (!process.env.DB_URI) {
    throw new Error("DB_URI is missing in .env file");
}

if (!process.env.JWT_URI) {
    throw new Error("JWT_URI is missing in .env file");
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is missing in .env file");
}

if (!process.env.IMAGEKIT_PUBLIC_KEY) {
    throw new Error("IMAGEKIT_PUBLIC_KEY is missing in .env file");
}

if (!process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("IMAGEKIT_URL_ENDPOINT is missing in .env file");
}

const config = {
    mongoURI: process.env.DB_URI,

    jwtSecret: process.env.JWT_URI,

    imageKit: {
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    }
};

module.exports = config;