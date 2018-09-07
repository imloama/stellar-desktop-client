//左侧菜单
<template>
  <div class="left-menu">
    <div :class="'menu-item ' + (menuIndex === index ? 'active':'')" v-for="(item,index) in menus" :key="index" @click="toPage(item,index)">
      <div class="menu-item-icon"><v-icon class="icons">{{item.icon}}</v-icon></div>
      <div class="menu-item-text">{{$t(item.label)}}</div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      menuIndex: 0,
      menus: [
        {icon: 'account_balance_wallet', label: 'Title.MyAssets', name: 'MyAssets'},
        {icon: 'history', label: 'History.Title', name: 'History'},
        {icon: 'trending_up', label: 'Trade.Trade', name: 'TradeCenter'},
        {icon: 'apps', label: 'Title.ThirdApp', name: 'Apps'},
        {icon: 'import_export', label: 'Menu.Funding', name: 'Funding'},
        {icon: 'account_circle', label: 'Menu.My', name: 'MySettings'},
        {icon: 'settings', label: 'Menu.Settings', name: 'SettingsParent'}
      ],
      menuNames:['MyAssets','History','TradeCenter','Apps','Funding','My','SetPinCode']
    }
  },
  watch:{
    '$route'(data){
      let name = data.name
      let index =  this.menuNames.indexOf(name)
      if(index >= 0){
        this.menuIndex = index
      }
      console.log(`----------index=${index}`)
    }
  },
  methods:{
    toPage(item,index){
      this.menuIndex = index
      this.$router.push({name: item.name})
    }
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.left-menu
  width: 60px
  position: fixed
  top: 62px
  left: 0
  bottom: 0
  background: $secondarycolor.gray
  // z-index:999
  text-align: center
  color: $secondarycolor.font
  padding-top: 1.2rem
  font-size: 14px
  box-shadow: 2px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
  .menu-item
    padding: .6rem 0
    cursor pointer
    .icons
      color: $secondarycolor.font
    &.active
      color:  $primarycolor.green
      .icons
        color:  $primarycolor.green


</style>
