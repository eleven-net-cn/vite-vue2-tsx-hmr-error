import { isWindows } from '@/constants/devices';

let keyWord = '<div class="command"></div>';
if (isWindows) {
  keyWord = 'Ctrl';
}

export const shortCutsDescMap = [{
  key: '复制',
  button: [keyWord, 'C']
},
{
  key: '粘贴',
  button: [keyWord, 'V']
},
{
  key: '撤销',
  button: [keyWord, 'Z']
},
{
  key: '重做',
  button: [keyWord, 'Shift', 'Z']
},
{
  key: '放大',
  button: [keyWord, '+']
},
{
  key: '缩小',
  button: [keyWord, '-']
},
// {
//   key: '重置',
//   button: [keyWord, 'r']
// },
{
  key: '移动画布',
  button: ['Space', '<div class="hand-drag"></div>']
},
];
