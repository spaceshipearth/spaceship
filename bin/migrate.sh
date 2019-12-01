# prod migration script
export RDS_CONNECTION_URL=`sudo /opt/elasticbeanstalk/bin/get-config environment -k RDS_CONNECTION_URL`
pushd /var/app/current
node node_modules/sequelize-cli/lib/sequelize db:migrate --env=production
node node_modules/sequelize-cli/lib/sequelize db:seed:all --env=production
popd