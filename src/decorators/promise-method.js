import Promise from 'bluebird';

export default function(Target, name, descriptor) {
  descriptor.value = Promise.method(descriptor.value);

  return descriptor;
}
