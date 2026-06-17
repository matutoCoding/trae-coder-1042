export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/health/index',
    'pages/course/index',
    'pages/stable/index',
    'pages/member/index',
    'pages/horse-detail/index',
    'pages/health-detail/index',
    'pages/course-detail/index',
    'pages/member-detail/index',
    'pages/event-detail/index',
    'pages/expense-detail/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#8B4513',
    navigationBarTitleText: '马术俱乐部',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FDF5E6',
  },
  tabBar: {
    color: '#8D6E63',
    selectedColor: '#8B4513',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '马匹档案',
      },
      {
        pagePath: 'pages/health/index',
        text: '健康管理',
      },
      {
        pagePath: 'pages/course/index',
        text: '课程管理',
      },
      {
        pagePath: 'pages/stable/index',
        text: '马房管理',
      },
      {
        pagePath: 'pages/member/index',
        text: '会员中心',
      },
    ],
  },
});
