import SettingsParent from '@/pages/settings/SettingsParent.vue'


export default {
    path:'/settings',
    name: 'SettingsParent',
    component: SettingsParent,
    redirect: { name: 'CustomTradeColor' },
    children: [
      {
        path: '/customtradecolor',
        name: 'CustomTradeColor',
        component: resolve => require(['../pages/settings/CustomTradeColor'], resolve)
      },
      {
        path: '/horizon',
        name: 'Horizon',
        component: resolve => require(['../pages/settings/Horizon'], resolve)
      },
      {
        path: '/federation',
        name: 'Federation',
        component: resolve => require(['../pages/settings/Federation'], resolve)
      },
      {
        path: '/language',
        name: 'Language',
        component: resolve => require(['../pages/settings/Language'], resolve)
      },
      {
        path: '/setpincode',
        name: 'SetPinCode',
        component: resolve => require(['../pages/settings/SetPinCode'], resolve)
      },
      {
        path: '/delpincode',
        name: 'DelPinCode',
        component: resolve => require(['../pages/settings/DelPinCode'], resolve)
      },
      
      {
        path: '/help',
        name: 'Help',
        component: resolve => require(['../pages/settings/Help'], resolve)
      },
      {
        path: '/about',
        name: 'About',
        component: resolve => require(['../pages/settings/About'], resolve)
      },
    ],
    
  }
