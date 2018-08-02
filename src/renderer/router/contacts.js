
export default {
    path: '/mycontacts/',
    name: 'MyContacts',
    component: resolve => require(['../pages/contacts/MyContacts.vue'], resolve),
    redirect: { name: 'ContactsList' },
    children: [
     
    ]
  }