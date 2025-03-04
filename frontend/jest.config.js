export default {
    clearMocks: true,
    testEnvironment: 'jsdom', // Ensure React components work in tests
    transform: {
      '^.+\\.[tj]sx?$': 'babel-jest', // Use babel-jest to transform JS/JSX
    },
    moduleNameMapper: {
      '^react$': '<rootDir>/node_modules/react',
      '^react-dom$': '<rootDir>/node_modules/react-dom',
    },
    transformIgnorePatterns: ['node_modules/(?!(lucide-react)/)'], // llow Jest to transform lucide-react
  };
  