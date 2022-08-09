import mihoyoBrowser from 'mihoyo-browser';

export default {
  mobile: [{
    name: 'Mobile S',
    width: '320px',
    height: '568px'
  },
  {
    name: 'iphone6/7/8',
    width: '375px',
    height: '667px'
  },
  {
    name: 'iphone6/7/8 Plus',
    width: '414px',
    height: '736px'
  },
  // {
  //   name: 'iPhoneX',
  //   width: '375px',
  //   height: '812px'
  // }
  {
    name: 'iPad',
    width: '768px',
    height: '1024px'
  },
  {
    name: 'iPad Pro',
    width: '1024px',
    height: '1366px'
  }
  ],
  desktop: [
    {
      name: 'Desktop S',
      width: '1280px',
      height: '720px'
    },
    {
      name: 'Desktop M',
      width: '1366px',
      height: '768px'
    },
    {
      name: 'Desktop L',
      width: '1920px',
      height: '1080px'
    }
  ]
};
export const isWindows:boolean = mihoyoBrowser.isWindows();
