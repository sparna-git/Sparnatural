rsync -a sparnatural-config-datasources admin@calliope.sparna.fr:~

ssh -t admin@calliope.sparna.fr 'su -c "\
rm -rf /var/www/html/data.sparna.fr/ontologies/sparnatural-config-datasources/
cp -r /home/admin/sparnatural-config-datasources /var/www/html/data.sparna.fr/ontologies"'