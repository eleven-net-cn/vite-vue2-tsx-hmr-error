import FormItem from '../formItem';
import StyleFormItem from './formItem';

export default {
  functional: true,
  props: {
    config: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  render(h, { props, data }) {
    return (<FormItem {...{ props: { ...props, comp: StyleFormItem } }} {...data}></FormItem>);
  }
};
