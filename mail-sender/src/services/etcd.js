const { Etcd3 } = require('etcd3');
const config = require('../../config');

const etcd = new Etcd3({ hosts: config.etcdUrl });

module.exports = etcd;
