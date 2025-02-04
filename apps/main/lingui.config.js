module.exports = {
  locales: ['en', 'zh-Hans', 'zh-Hant', 'pseudo'],
  pseudoLocale: 'pseudo',
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en',
  },
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: [
        'src/components',
        'src/entities',
        'src/features',
        'src/hooks',
        'src/layout',
//        'src/lib',
        'src/pages',
        'src/store',
//        'src/utils',
        'src/widgets',
        '../../packages/curve-ui-kit/src/shared/routes.ts'
      ],
    },
  ],
  format: 'po',
}
