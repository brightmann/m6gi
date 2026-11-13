const dayjs = require('dayjs')
/**
 * GitHub Pages build config. The Pages workflow copies this over
 * next.config.js before building. Same options, plus the /m6gi base path
 * the site is served under at https://brightmann.github.io/m6gi/.
 */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: '/m6gi',
  assetPrefix: '/m6gi',
  env: {
    UPDATED_DATE: dayjs().format('YYYY-MM-DDTHH:mm:ssZZ'),
    _DEV_: process.env.NODE_ENV !== 'production',
    BLOG: {
      title: 'Hea的web博客',
      site: 'https://brightmann.github.io/m6gi',
    },
  },
}
module.exports = nextConfig
