"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCloudCredentials = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.googleCloudCredentials = {
    projectId: process.env.GOOGLE_PROJECT_ID,
    location: process.env.GOOGLE_LOCATION || 'us',
    processorId: process.env.GOOGLE_PROCESSOR_ID
};
const credentialsString = process.env.GOOGLE_CLOUD_CREDENTIALS;
if (credentialsString) {
    try {
        JSON.parse(credentialsString);
        console.log("Google Cloud credentials loaded successfully.");
    }
    catch (error) {
        console.error("Error parsing GOOGLE_CLOUD_CREDENTIALS JSON:", error);
    }
}
else {
    console.error("GOOGLE_CLOUD_CREDENTIALS environment variable is not set!");
}
//# sourceMappingURL=google.js.map