scp -r sparnatural-config-core admin@calliope.sparna.fr:~
scp -r sparnatural-config-datasources admin@calliope.sparna.fr:~
ssh -t admin@calliope.sparna.fr 'su -c "\
rm -rf /var/www/html/data.sparna.fr/ontologies/sparnatural-config-core
cp -r /home/admin/sparnatural-config-core /var/www/html/data.sparna.fr/ontologies
rm -rf /var/www/html/data.sparna.fr/ontologies/sparnatural-config-datasources
cp -r /home/admin/sparnatural-config-datasources /var/www/html/data.sparna.fr/ontologies"'