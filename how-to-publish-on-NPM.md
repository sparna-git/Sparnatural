# How to publish on NPM ?

1. Make sure local repository is uptodate and on branch master
2. Increment version number in package.json
3. Set `mode: 'production'` flag in webpack.config.js
4. Compile with `npm run build`
5. Publish with `npm publish`
6. Check at https://www.npmjs.com/package/sparnatural
7. Create release on Github project