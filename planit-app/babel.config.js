// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // Runtime: point to the RN JS entry
            'firebase/auth/react-native':
              '@firebase/auth/dist/rn/index.js'
          }
        }
      ]
    ]
  };
};