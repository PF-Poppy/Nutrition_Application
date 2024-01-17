export default {
    expiresTime: process.env.EXPIRES_TIME || 604800, //7 days
    issure: process.env.ISSURE || "nutrition-application",
    secret: process.env.SCRET || "nutrition-secret-key"
};