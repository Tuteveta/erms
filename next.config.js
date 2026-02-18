/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress Amplify transpilation warnings
  transpilePackages: ["@aws-amplify/ui-react", "aws-amplify"],
};

module.exports = nextConfig;
