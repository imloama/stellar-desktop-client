/**
 * 我的界面
 */
<template>
<div>
  <toolbar :title="$t('Menu.My')" :showbackicon="false" lockpass menuName="MySettings"  ref="toolbar">
    <v-btn icon @click.native="showAccounts" slot="left-tool">
        <i class="material-icons font28">menu</i>
    </v-btn>
  </toolbar>

<accounts-nav :show="showaccountsview" @close="closeView"/>
<m-layout>
  <v-layout row class="mt-4">

    <v-flex xs3 class="pa-2">
      <v-list class="secondarygray">
        <v-list-tile v-for="(item,index) in items" :key="index" @click="toPage(item,index)" :class="index === selected ? 'mactive':''">
          <v-list-tile-action>
            <v-icon :color="index === selected ? 'primary' : 'grey'">{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title >{{$t(item.title)}}
                <span v-if="item.count>0">({{item.count}})</span></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-flex>
    <v-flex xs9 class="pa-2 22">
      <router-view></router-view>
    </v-flex>
  </v-layout>
  </m-layout>


</div>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import Toolbar from '@/components/Toolbar'
import AccountsNav from '@/components/AccountsNav'
import Card from '@/components/Card'

export default {
  components: {
    Toolbar,
    AccountsNav,
    Card,
  },
  data(){
    return {
      items: [{
          name: 'My',
          title: 'MyAccount',
          icon: 'account_box'
        },
        {
            title: "ManageAccount",
            name: "ManageAccount",
            icon: "account_balance_wallet"
        },
        {
            title: "Menu.Contacts",
            name: "ContactsList",
            icon: "supervisor_account"
        },
        {
            title: "Menu.MyAddress",
            name: "MyAddress",
            icon: "bookmark"
        },
        {
            title: 'kyc',
            name: 'KYC',
            icon: "security"
        },
        //   {
        //     title: "Menu.Funding",
        //     name: "Funding",
        //     icon: "import_export"
        // },
        // {
        //     title: "Menu.Settings",
        //     name: "Settings",
        //     icon: "settings"
        // },
        // {
        //     title: "Title.ThirdApp",
        //     name: "Apps",
        //     icon: "apps"
        // },
        // {
        //     title: "Menu.Help",
        //     name: "Help",
        //     icon: "help"
        // },
        {
        title: "Menu.MessageCenter",
        name: "MessageCenter",
        icon: "message",
        count: 0
      },   
        {
        title: "tickets",
        name: "Tickets",
        icon: "assignment"
      }
      
      ],
      showaccountsview: false,
      selected: 0,//当前选中的菜单

    }
  },
  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.account.data,
      app: state => state.app,
      islogin: state => (state.accounts.accountData.seed ? true : false),
    }),
    ...mapGetters([
      'unReadCount'
    ]),
    names(){
      let d = []
      this.items.forEach(item=>{
        d.push(item.name)
      })
      return d
    }
  },
  watch: {
    '$route'(to,from){
      let i = this.names.indexOf(to.name)
      if(i>=0){
        this.selected = i
      }
    },
    unReadCount(){
      this.items[5].count = this.unReadCount
    }
  },
  mounted(){
    console.log('----------unread count' + this.unReadCount)
    this.items[5].count = this.unReadCount
    let i = this.names.indexOf(this.$route.name)
    if(i>=0){
      this.selected = i
    }
    if(!this.islogin){
      this.$refs.toolbar.showPasswordLogin()
      return
    }
  },
  methods: {
    toPage(item,index){
      this.selected = index
      this.$router.push({name: item.name})
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.mactive
  color: $primarycolor.green
  background: #34353A
</style>
