import _ from 'lodash';

export default (namespace, suffix) => {
  namespace = namespace.toLowerCase();
  namespace = suffix ? `${namespace}:${suffix}` : namespace;

  return _.snakeCase(namespace).toUpperCase();
};
