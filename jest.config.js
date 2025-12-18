module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs',
                target: 'ES2020',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                strict: false,
                skipLibCheck: true,
            },
        }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    moduleNameMapper: {
        '^react-native-ble-plx$': '<rootDir>/src/__mocks__/react-native-ble-plx.ts',
        '^expo-constants$': '<rootDir>/src/__mocks__/expo-constants.ts',
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/__tests__/**',
        '!src/**/__mocks__/**',
        '!src/**/*.d.ts',
    ],
    coverageDirectory: 'coverage',
};
