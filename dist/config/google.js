"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let googleCloudCredentials = null;
const credentialsString = process.env.GOOGLE_CLOUD_CREDENTIALS;
if (credentialsString) {
    try {
        googleCloudCredentials = JSON.parse(credentialsString);
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