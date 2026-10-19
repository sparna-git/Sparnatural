rsync -e "ssh -i \"~/.ssh/sparna-keypair-francfort.pem\"" -a sparnatural-config-datasources ubuntu@92.243.27.145:~

ssh -i ~/.ssh/sparna-keypair-francfort.pem -t ubuntu@92.243.27.145 'sudo su -c "\
rm -rf /var/www/html/data.sparna.fr/ontologies/sparnatural-config-datasources/
cp -r /home/ubuntu/sparnatural-config-datasources /var/www/html/data.sparna.fr/ontologies"'