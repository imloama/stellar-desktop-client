
export default {
    path: '/myaddress/',
    name: 'MyAddress',
    component: resolve => require(['../pages/myaddress/MyAddress.vue'], resolve),
    redirect: { name: 'MyAddressList' },
    children: [
     
    ]
  }