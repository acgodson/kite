/** @type {import('next').NextConfig} */
export const reactStrictMode = false;
export const webpack5 = true;
export function webpack(config) {
  config.resolve.fallback = {
    fs: false,
    net: false,
    dns: false,
    child_process: false,
    tls: false,
  };

  return config;
}