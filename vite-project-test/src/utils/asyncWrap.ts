export default function<T> (promise: Promise<T>) {
  return promise
    .then(res => [null, res])
    .catch(err => [err, null]);
}
