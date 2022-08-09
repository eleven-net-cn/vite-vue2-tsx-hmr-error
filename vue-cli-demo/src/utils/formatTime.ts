import moment from 'moment';

export default function (date) {
  return moment(date).format('YYYY-MM-DD hh:mm:ss');
}
