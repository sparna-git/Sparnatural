# How to work in combination with rdf-shacl-commons package ?

1. Update rdf-shacl-commons package
2. Update its version number in package.json
3. Build and Bundle it: `npm run build & npm pack`
4. Update dependency here: `npm install ../rdf-shacl-commons/rdf-shacl-commons-x.y.z.tgz`
5. ... iterate as needed ... e.g. test with `npm run start`
6. Publish rdf-shacl-commons
7. Update dependency here with real version number : `^0.1.2`
