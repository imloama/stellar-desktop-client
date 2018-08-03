import SettingParent from '@/pages/settings/SettingParent.vue'
import My from '@/pages/settings/My.vue'

// 『我的』路由
export default {
    path:'/mysettings/',
    name: 'MySettings',
    component: SettingParent,
    redirect: { name: 'My' },
    children: [
      {
        path: 'my',
        name: 'My',
        component: My,
        meta: {
          keepAlive: false
        }
      },


      {
        path: '/account/manage',
        name: 'ManageAccount',
        component: resolve => require(['../pages/account/Manage.vue'], resolve),
        meta: {
          keepAlive: false
        }
      },
      {
        path: '/account/info',
        name: 'AccountInfo',
        component: resolve => require(['../pages/account/Info.vue'], resolve),
        meta: {
          keepAlive: false
        }
      },
      {
        path: '/account/namecard',
        name: 'AccountNameCard',
        component: resolve => require(['../pages/account/NameCard.vue'], resolve)
      },
      {
        path: '/account/modify',
        name: 'ModifyAccount',
        component: resolve => require(['../pages/account/ModifyAccount.vue'], resolve)
      },
      
      {
        path:"message",
        name :"MessageCenter",
        component:resolve => require(['../pages/account/MessageCenter.vue'],resolve),
      },
      {
        path: "message-detils",
        name: "MessageDetils",
        component: resolve => require(['../pages/account/message-detils.vue'], resolve),
      },


      {
        path: '/mycontacts/list',
        name: 'ContactsList',
        component: resolve => require(['../pages/contacts/ContactsList.vue'], resolve),
      },
      {
        path: '/mycontacts/add',
        name: 'AddContact',
        component: resolve => require(['../pages/contacts/AddContact.vue'], resolve)
      },
      {
        path: '/mycontacts/modify/:id',
        name: 'ModifyContact',
        component: resolve => require(['../pages/contacts/ModifyContact.vue'], resolve)
      },
      {
        path: '/mycontacts/:id',
        name: 'ContactDetails',
        component: resolve => require(['../pages/contacts/ContactDetails.vue'], resolve)
      },


      {
        path: '/myaddress/list',
        name: 'MyAddressList',
        component: resolve => require(['../pages/myaddress/MyAddressList.vue'], resolve),
      },
      {
        path: '/myaddress/add',
        name: 'MyAddressAdd',
        component: resolve => require(['../pages/myaddress/MyAddressAdd.vue'], resolve)
      },
      {
        path: '/myaddress/edit/:name',
        name: 'MyAddressEdit',
        component: resolve => require(['../pages/myaddress/MyAddressEdit.vue'], resolve)
      },
      {
        path: '/myaddress/:name',
        name: 'MyAddressView',
        component: resolve => require(['../pages/myaddress/MyAddressView.vue'], resolve)
      },


      {
        path: 'settings',
        name: 'Settings',
        component: resolve => require(['../pages/settings/Settings.vue'], resolve)
      },
      {
        path: 'horizon',
        name: 'Horizon',
        component: resolve => require(['../pages/settings/Horizon'], resolve)
      },
      {
        path: 'federation',
        name: 'Federation',
        component: resolve => require(['../pages/settings/Federation'], resolve)
      },
      {
        path: 'language',
        name: 'Language',
        component: resolve => require(['../pages/settings/Language'], resolve)
      },
      {
        path: 'setpincode',
        name: 'SetPinCode',
        component: resolve => require(['../pages/settings/SetPinCode'], resolve)
      },
      {
        path: 'delpincode',
        name: 'DelPinCode',
        component: resolve => require(['../pages/settings/DelPinCode'], resolve)
      },
      {
        path: 'help',
        name: 'Help',
        component: resolve => require(['../pages/settings/Help'], resolve)
      },
      {
        path: 'kyc',
        name: 'KYC',
        component: resolve => require(['../pages/settings/KYC'], resolve)
      },
      {
        path: 'about',
        name: 'About',
        component: resolve => require(['../pages/settings/About'], resolve)
      },
      {
        path: 'tickets',
        name: 'Tickets',
        component: resolve => require(['../pages/settings/Tickets'], resolve)
      },
     
    ]
  }
