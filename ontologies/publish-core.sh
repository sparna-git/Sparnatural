rsync -e "ssh -i \"~/.ssh/sparna-keypair-francfort.pem\"" -a sparnatural-config-core ubuntu@92.243.27.145:~

ssh -i ~/.ssh/sparna-keypair-francfort.pem -t ubuntu@92.243.27.145 'sudo su -c "\
rm -rf /var/www/html/data.sparna.fr/ontologies/sparnatural-config-core/
cp -r /home/ubuntu/sparnatural-config-core /var/www/html/data.sparna.fr/ontologies"'