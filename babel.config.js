module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['./'],
        alias: {
          '^~(.+)': './src/\\1',
          tests: './__tests__',
        },
      },
    ],
  ],
};
