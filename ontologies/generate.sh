java -jar java-11-widoco-1.4.17-jar-with-dependencies.jar \
-ontFile sparnatural-config-core.owl \
-outFolder sparnatural-config-core \
-confFile sparnatural-config-core.properties \
-rewriteAll \
-lang en-fr \
-htaccess \
-rewriteBase /ontologies \
-includeAnnotationProperties \
-excludeIntroduction \
-uniteSections \
-noPlaceHolderText

java -jar java-11-widoco-1.4.17-jar-with-dependencies.jar \
-ontFile sparnatural-config-datasources.owl \
-outFolder sparnatural-config-datasources \
-confFile sparnatural-config-datasources.properties \
-rewriteAll \
-lang en-fr \
-htaccess \
-rewriteBase /ontologies \
-includeAnnotationProperties \
-excludeIntroduction \
-uniteSections \
-noPlaceHolderText