/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          // Matching all routes
          source: "/(.*)",
          headers: [
            {
              key: "Access-Control-Allow-Credentials",
              value: "true",
            },
            {
              key: "Access-Control-Allow-Origin",
              value: "*", // You can specify a specific origin instead of "*"
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
            },
            {
              key: "Access-Control-Allow-Headers",
              value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  