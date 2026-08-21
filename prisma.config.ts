import "dotenv/config";

export default {
  datasource: {
    // Yeh directly aapki .env file se DATABASE_URL utha lega
    url: process.env.DATABASE_URL, 
  },
};