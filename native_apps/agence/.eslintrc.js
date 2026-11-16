module.exports = {
  extends: ['expo'],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [
        { 
          name: 'react-native', 
          importNames: ['KeyboardAvoidingView'],
          message: 'IC-02 : utiliser FormScreen ou FormModal.' 
        },
        { 
          name: 'react-native-keyboard-aware-scroll-view',
          message: 'IC-02 : bibliothèque retirée, utiliser FormScreen.' 
        },
      ],
    }],
  },
  overrides: [
    { 
      files: ['components/forms/**', 'src/components/forms/**'], 
      rules: { 'no-restricted-imports': 'off' } 
    },
  ],
};
