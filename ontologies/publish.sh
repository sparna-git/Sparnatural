rsync -a sparnatural-config-core admin@calliope.sparna.fr:~

ssh -t admin@calliope.sparna.fr 'su -c "\
rm -rf /var/www/html/data.sparna.fr/ontologies/sparnatural-config-core/
cp -r /home/admin/sparnatural-config-core /var/www/html/data.sparna.fr/ontologies"'