import local from './local';
import docker from './docker';

export default (process.env.REACT_APP_ENV === 'docker')
  ? docker
  : local;