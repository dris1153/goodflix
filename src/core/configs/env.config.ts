export const envConfig = {
    isProduction: process.env.NODE_ENV === 'production',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:8080',
    API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
}
