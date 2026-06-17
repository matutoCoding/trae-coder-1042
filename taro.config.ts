import type { UserConfigExport } from '@tarojs/cli';

const config: UserConfigExport = {
  projectName: 'equestrian-club-mini-app',
  date: '2025-1-15',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html'],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: false,
  },
  sass: {
    resource: [
      'src/styles/variables.scss',
      'src/styles/theme.scss',
    ],
    projectDirectory: __dirname,
    data: '$primaryColor: #8B4513;',
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', require('path').resolve(__dirname, '..', 'src'));
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', require('path').resolve(__dirname, '..', 'src'));
    },
  },
  alias: {
    '@': require('path').resolve(__dirname, '..', 'src'),
  },
};

export default function mergeConfig(merge) {
  return merge({}, config, {});
}
