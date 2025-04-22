module.exports = {
  clearMocks: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Load custom matchers like toBeInTheDocument
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest', // Transpile JS/TS/JSX/TSX files
  },
  moduleNameMapper: {
    // Stub static asset imports like images
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/filemocks.js',
    // Stub CSS modules or styles
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Ensure React/Dom are resolved properly if needed
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
  },
  transformIgnorePatterns: ['node_modules/(?!(lucide-react)/)'], // Optional: allow transforming specific modules
};
