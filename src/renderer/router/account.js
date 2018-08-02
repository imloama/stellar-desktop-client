
export default {
    path: '/account/',
    name: 'AccountParent',
    component: resolve => require(['../pages/account/AccountParent.vue'], resolve),
    redirect: { name: 'MyAddressList' },
    children: [
      
    ]
}
