// Typescript merges declarations automatically, so this will be added to the definition for `process.env`.
declare namespace NodeJS {
    interface ProcessEnv {
        AWS_BUCKET: string;
        AWS_KEY: string;
        AWS_S3_REGION: string;
        AWS_SECRET: string;
        DB_HOST: string;
        DB_NAME: string;
        DB_PASSWORD: string;
        DB_USER: string;
        /**
         * The API key for Apollo Engine.
         */
        ENGINE_API_KEY: string;
        NODE_ENV: "local" | "development" | "staging" | "production";
        SITE_URL: string;
    }
}
