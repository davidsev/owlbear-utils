module.exports = {
    transform: { '^.+\\.[tj]s$': 'ts-jest' },
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.test\\.ts$',
    moduleFileExtensions: ['ts', 'js'],
    transformIgnorePatterns: ['node_modules/(?!@owlbear-rodeo)/'],
};
