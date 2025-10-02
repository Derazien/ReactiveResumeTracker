/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Circular dependencies can lead to unresolvable imports and runtime errors',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment:
        'Orphan modules are not used anywhere and can be removed',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '^apps/.*/src/main\\.tsx?$',
          '^apps/.*/src/index\\.tsx?$',
          'jest\\.config\\.ts$',
          'vite\\.config\\.ts$',
          'webpack\\.config\\.js$',
          'tailwind\\.config\\.js$',
          'postcss\\.config\\.js$',
        ],
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      severity: 'warn',
      comment: 'Avoid using deprecated Node.js core modules',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: ['^(punycode|domain|constants|sys|_linklist)$'],
      },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment:
        "Don't allow dependencies that are not in package.json (except type-only imports)",
      from: {},
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
        pathNot: ['\\.d\\.ts$'],
      },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment: 'Modules that cannot be resolved lead to runtime errors',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
  ],
  options: {
    doNotFollow: {
      path: [
        'node_modules',
        '_scratch',
        'dist',
        'build',
        '.next',
        'coverage',
        '\\.test\\.',
        '\\.spec\\.',
        '__tests__',
        '__mocks__',
      ],
    },
    exclude: {
      path: [
        'node_modules',
        '_scratch',
        'dist',
        'build',
        '.next',
        'coverage',
        '\\.test\\.tsx?$',
        '\\.spec\\.tsx?$',
        '__tests__',
        '__mocks__',
      ],
    },
    tsPreCompilationDeps: false,
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^node_modules/[^/]+',
        theme: {
          graph: {
            splines: 'ortho',
          },
          modules: [
            {
              criteria: { source: '^apps/' },
              attributes: { fillcolor: '#ffcccc', style: 'filled' },
            },
            {
              criteria: { source: '^libs/' },
              attributes: { fillcolor: '#ccccff', style: 'filled' },
            },
          ],
        },
      },
    },
  },
};

