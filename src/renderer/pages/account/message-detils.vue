<template>
  <div class="detail-bg">
    <!-- <tool-bar :title="item.title"
              :showmenuicon="false"
              :showbackicon="true"
              @goback="back"></tool-bar> -->
     <v-breadcrumbs divider="/">
        <v-breadcrumbs-item to="/mysettings/message">{{ $t('MessageCenter') }}</v-breadcrumbs-item>
        <v-breadcrumbs-item disabled>{{item.title}}</v-breadcrumbs-item>
      </v-breadcrumbs>

    <div class="message-detils">
      <div class="message-content" v-image-wrapper v-html="item.content"> </div>
    </div>
  </div>
</template>

<script>
  import {mapState,mapActions,mapGetters} from "vuex"
  import ToolBar from "@/components/Toolbar"
    export default {
        name: "message-detils",
      data(){
          return{
          }
      },
      methods:{
        back(){
          this.$router.back();
        }
      },
      components:{
          ToolBar
      },
      computed:{
        ...mapState({
          item: state => state.message.currItem
        })
      }
    }
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
  .message-detils
    padding 10px
    background: $secondarycolor.gray
    .message-content
      width: 100%
      height: 100%
      overflow: auto
  
</style>
