# How to publish on NPM ?

1. Make sure local repository is uptodate and on branch master
2. Increment version number in package.json
3. Commit and push
4. Compile with `npm run build`
5. Login with `npm login` (OTP on Microsoft Authenticator)
6. Publish with `npm publish` (OTP on Microsoft Authenticator)
7. Check at https://www.npmjs.com/package/sparnatural
8. Create release on Github project
9. Write release note by checking the issues that were closed since last release (https://github.com/sparna-git/Sparnatural/issues?q=is%3Aclosed+sort%3Aupdated-desc)

Use template:

```

## Major New Features

_none_

## Other Enhancements

_none_

## Bug fixes

_none_

## Refactoring

_ none_

## Documentation

_none_	
```