<template>
  <div class="code-mode-container"></div>
</template>

<script>
import { editor } from 'monaco-editor';
import debounce from 'lodash/debounce';

export default {
  props: {
    lang: {
      type: String,
      default: 'javascript'
    },
    value: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      codeEditor: null
    };
  },
  watch: {
    value(newVal) {
      if (this.codeEditor) {
        if (newVal !== this.codeEditor.getValue()) {
          this.codeEditor.setValue(newVal || '');
        }
      }
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const { lang } = this;
      this.codeEditor = editor.create(this.$el, {
        language: lang || 'javascript',
        value: this.value,
        theme: 'vs-dark',
        lineNumbers: lang === 'javascript' ? 'on' : 'off',
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        scrollbar: {
          verticalScrollbarSize: 5,
          horizontalScrollbarSize: 5
        },
        foldingHighlight: true,
        ...this.options,
      });

      // this.codeEditor.addCommand(
      //   monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
      //   this.onSave,
      //   ''
      // );

      this.codeEditor.onDidChangeModelContent(debounce(this.onChange, 1000));
    },
    // onSave() {
    //   this.$emit('save', this.codeEditor.getValue());
    // },
    onChange() {
      this.$emit('change', this.codeEditor.getValue());
    }
  },
};
</script>
