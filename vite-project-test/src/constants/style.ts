const editStyles = {
  cursorValues: [
    {
      value: 'auto',
      label: '自动'
    },
    {
      value: 'default',
      label: '默认'
    },
    {
      value: 'pointer',
      label: '可点击'
    },
    {
      value: 'not-allowed',
      label: '不可点'
    }
  ],
  aligns: {
    relative: [
      {
        name: 'l',
        desc: '左对齐',
        icon: 'icon-align-left',
        dir: 'raw',
      },
      {
        name: 'm',
        desc: '左右居中',
        icon: 'icon-align-center',
        dir: 'raw',
        dep: 'width'
      },
      {
        name: 'r',
        desc: '右对齐',
        icon: 'icon-align-right',
        dir: 'raw',
      },
    ],
    all: [
      {
        name: 'l',
        desc: '左对齐',
        icon: 'icon-align-left',
        dir: 'raw',
      },
      {
        name: 'm',
        desc: '左右居中',
        icon: 'icon-align-center',
        dir: 'raw',
        dep: 'width'
      },
      {
        name: 'r',
        desc: '右对齐',
        icon: 'icon-align-right',
        dir: 'raw',
      },
      {
        name: 't',
        desc: '上对齐',
        icon: 'icon-align-top',
        dir: 'col',
      },
      {
        name: 'm',
        desc: '上下居中',
        icon: 'icon-align-middle',
        dir: 'col',
        dep: 'height'
      },
      {
        name: 'b',
        desc: '下对齐',
        icon: 'icon-align-bottom',
        dir: 'col',
      }
    ]
  },
  predefineColors: [
    'rgba(255, 255, 255, 0)',
    '#000000',
    '#ffffff',
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'hsva(120, 40, 94, 0.5)',
    'hsl(181, 100%, 37%)',
    'hsla(209, 100%, 56%, 0.73)',
    '#c7158577'
  ],
  overflow: [{
    value: 'visible',
    label: '内部元素溢出可见',
    desc: '默认值。内容不会被修剪，会呈现在元素框之外。,'
  },
  {
    value: 'hidden',
    label: '隐藏内部元素溢出',
    desc: '内容会被修剪，并且其余内容是不可见的。,'
  },
  {
    value: 'auto',
    label: '容器可进行滚动',
    desc: '如果内容被修剪，则浏览器会显示滚动条以便查看其余的内容。,'
  },
    // {
    //   value: 'inherit',
    //   label: '继承',
    //   desc: '规定应该从父元素继承 overflow 属性的值。,'
    // }
  ],
  display: [{
    value: 'none',
    desc: '此元素不会被显示。'
  },
  {
    value: 'block',
    desc: '此元素将显示为块级元素，此元素前后会带有换行符。'
  },
  {
    value: 'inline',
    desc: '默认。此元素会被显示为内联元素，元素前后没有换行符。'
  },
  {
    value: 'inline-block',
    desc: '行内块元素。（CSS2.1 新增的值）'
  },
  {
    value: 'list-item',
    desc: '此元素会作为列表显示。'
  },
  {
    value: 'table',
    desc: '此元素会作为块级表格来显示（类似 <table>），表格前后带有换行符。'
  },
  {
    value: 'inline-table',
    desc: '此元素会作为内联表格来显示（类似 <table>），表格前后没有换行符。'
  },
  {
    value: 'table-row-group',
    desc: '此元素会作为一个或多个行的分组来显示（类似 <tbody>）。'
  },
  {
    value: 'table-header-group',
    desc: '此元素会作为一个或多个行的分组来显示（类似 <thead>）。'
  },
  {
    value: 'table-footer-group',
    desc: '此元素会作为一个或多个行的分组来显示（类似 <tfoot>）。'
  },
  {
    value: 'table-column-group',
    desc: '此元素会作为一个或多个列的分组来显示（类似 <colgroup>）。'
  },
  {
    value: 'table-row',
    desc: '此元素会作为一个表格行显示（类似 <tr>）。'
  },
  {
    value: 'table-column',
    desc: '此元素会作为一个单元格列显示（类似 <col>）'
  },
  {
    value: 'table-cell',
    desc: '此元素会作为一个表格单元格显示（类似 <td> 和 <th>）'
  },
  {
    value: 'table-caption',
    desc: '此元素会作为一个表格标题显示（类似 <caption>）'
  },
  {
    value: 'inherit',
    desc: '规定应该从父元素继承 display 属性的值。'
  }
  ],
  position: [{
    value: 'absolute',
    label: '父元素',
    desc: '生成绝对定位的元素，相对于 static 定位以外的第一个父元素进行定位。元素的位置通过 "left", "top", "right" 以及 "bottom" 属性进行规定。'
  },
  {
    value: 'fixed',
    label: '屏幕',
    desc: '生成绝对定位的元素，相对于浏览器窗口进行定位。元素的位置通过 "left", "top", "right" 以及 "bottom" 属性进行规定。'
  },
  {
    value: 'relative',
    label: '相对自己',
    desc: '生成相对定位的元素，相对于其正常位置进行定位。因此，"left:20" 会向元素的 LEFT 位置添加 20 像素。'
  }
  ],
  defaultUnit: 'rem',
  unit: [
    {
      value: 'none',
      label: '无',
      desc: '无'
    },
    {
      value: 'rem',
      label: 'px',
      desc: '等于根节点的字体尺寸。',
    },
    {
      value: '%',
      label: '%',
      desc: '百分比'
    },
    {
      value: 'auto',
      label: 'auto',
      desc: '自适应'
    },
    {
      value: 'vw',
      label: 'vw',
      desc: '1/100屏幕宽度'
    },
    {
      value: 'vh',
      label: 'vh',
      desc: '1/100屏幕高度'
    },
    {
      value: 'px',
      label: 'PX',
      desc: '像素 (计算机屏幕上的一个点)'
    },
    {
      value: 'other',
      label: '特殊',
      desc: '特殊'
    },
  ],
  borderStyle: [{
    label: '--无--',
    value: 'none',
    desc: '定义无边框。'
  },
  {
    label: '实线',
    value: 'solid',
    desc: '定义实线。'
  },
  {
    label: '虚线',
    value: 'dashed',
    desc: '定义虚线。在大多数浏览器中呈现为实线。'
  },
  // {
  //   value: 'hidden',
  //   desc: '与 "none" 相同。不过应用于表时除外，对于表，hidden 用于解决边框冲突。'
  // },
  {
    label: '点状线',
    value: 'dotted',
    desc: '定义点状边框。在大多数浏览器中呈现为实线。'
  },
  {
    label: '双划线',
    value: 'double',
    desc: '定义双线。双线的宽度等于 border-width 的值。'
  },
  {
    label: '3D凹槽',
    value: 'groove',
    desc: '定义 3D 凹槽边框。其效果取决于 border-color 的值。'
  },
  {
    label: '3D垄状',
    value: 'ridge',
    desc: '定义 3D 垄状边框。其效果取决于 border-color 的值。'
  },
  {
    label: '3D内嵌',
    value: 'inset',
    desc: '定义 3D inset 边框。其效果取决于 border-color 的值。'
  },
  {
    label: '3D外嵌',
    value: 'outset',
    desc: '定义 3D outset 边框。其效果取决于 border-color 的值。'
  }
    // {
    //   value: 'inherit',
    //   desc: '规定应该从父元素继承边框样式。'
    // }de
  ],
  fontWeight: [{
    value: 'normal',
    desc: '默认值'
  },
  {
    value: 'bold',
    desc: '加粗'
  }
  ],
  textAlign: [{
    value: 'left',
    desc: '把文本排列到左边。默认值：由浏览器决定。'
  },
  {
    value: 'right',
    desc: '把文本排列到右边。'
  },
  {
    value: 'center',
    desc: '把文本排列到中间。'
  },
  {
    value: 'justify',
    desc: '实现两端对齐文本效果。'
  },
  {
    value: 'inherit',
    desc: '规定应该从父元素继承 text-align 属性的值。'
  }
  ],
  backgroundPosition: [{
    value: 'top',
    label: '上',
  }, {
    value: 'bottom',
    label: '下',
  },
  {
    value: 'left',
    label: '左',
  }, {
    value: 'right',
    label: '右',
  },
  {
    value: 'center',
    label: '居中',
  }],
  backgroundFill: [{
    value: 'repeat',
    label: '平铺',
    desc: '默认，图像在背景垂直方向和水平方向重复。'
  },
  {
    value: 'repeat-x',
    label: '横向平铺',
    desc: '图像在背景区域水平方向重复。'
  },
  {
    value: 'repeat-y',
    label: '纵向平铺',
    desc: '图像在背景区域垂直方向重复。'
  },
  {
    value: 'contain',
    label: '适应',
    desc: '图像在背景区域保持比例完整显示。'
  },
  {
    value: 'center',
    label: '居中',
    desc: '图像在背景区域居中显示。'
  },
  {
    value: 'cover',
    label: '填充',
    desc: '图像尽量填充背景区域，可能被裁切'
  },
  {
    value: 'stretch',
    label: '拉伸',
    desc: '图像尽量填充背景区域，不保持原比例'
  }
  ],
  fontFamily: []
};
export const positionStyle = {
  left: {},
  top: {},
  bottom: {},
  right: {},
  marginLeft: {},
  marginRight: {},
  marginTop: {},
  marginBottom: {},
};
// 决定元素宽高的样式
export const sizeStyle = {
  width: {},
  maxWidth: {},
  minWidth: {},
  maxHeight: {},
  minHeight: {},
  height: {},
};
// 外部定位需要的style
export const outerStyles = {
  ...positionStyle,
  ...sizeStyle,
  position: {},
  transform: {},
  zIndex: {},
  display: {},
  verticalAlign: {}
};
export default {
  remPrecise: 2,
  normalPrecise: 1,
  ...editStyles
};
