export default {
    expiresTime: process.env.EXPIRES_TIME || 86400, //24 hours
    issure: process.env.ISSURE || "nutrition-application",
    secret: process.env.SCRET || "nutrition-secret-key"
};