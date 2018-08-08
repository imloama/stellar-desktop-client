/**
 * 关于我们界面，显示系统版本等内容
 */
<template>
  <div class="page" >
    <!-- <toolbar :title="$t('About.Title')"
      :showbackicon="false"
      @goback="back"
      ref="toolbar"
      :menuIndex="5"  
      >
      <v-btn icon @click.native="showAccounts" slot="left-tool">
        <i class="material-icons font28">menu</i>
      </v-btn>
    </toolbar>
<accounts-nav :show="showaccountsview" @close="closeView"/> -->

    <v-card class="pa-2">
      <div class="icard">
        <div  class="">
          <div class="logo-wrapper" @click="toDebug">
            <img src="../../assets/img/logox.png" alt="firefly" class="logo-img"/>
          </div>
          <div class="textcenter appname">
            FireFly Desktop
          </div>
          <div class="textcenter appversion">
            {{platform}}
          </div>
          <div class="textcenter appversion">
            {{$t('Version')}}:{{appversion}}<span v-if="isDebug">&nbsp;DEBUG</span>
          </div>
          
        </div>
      </div>
      <div class="detail-card pa-2" >
        <div class="card-content" >
            <!-- <div class="row" @click="toTermOfServices">
                <div class="label">
                    {{$t('TermsOfServiceTitle')}}
                </div>
                <div class="value">
                    <i class="material-icons vcenter f-right">keyboard_arrow_right</i>
                </div>
            </div> -->
            <div class="row">
                <div class="label">
                    {{$t('OfficialSite')}}
                </div>
                <div class="value"> 
                    {{officialSite}}
                    <i class="material-icons icons vcenter f-right">keyboard_arrow_right</i>
                </div>
            </div>
            <div class="row" >
                <div class="label">
                    github
                </div>
                <div class="value">
                    {{fireflyGithub}}
                     <i class="material-icons icons vcenter f-right">keyboard_arrow_right</i>
                </div>
            </div>
            <div class="row" v-if="latestVersion">
              <div class="label">
                {{$t('LatestVersion')}}
              </div>
              <div class="value">
                {{latestVersion}}
                <i class="material-icons icons vcenter f-right">keyboard_arrow_right</i>
              </div>
            </div>

            <!-- <div class="field_btn">
              <v-btn :loading="working" class="error btn_ok" @click.stop="checkForUpdates">{{$t('CheckForUpdates')}}</v-btn>
            </div> -->
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar";
import Card from "@/components/Card";
import {
  APP_VERSION,
  APP_GITHUB,
  OFFICIAL_SITE,
  getPackageJson,
  getVersionInfo,
  DEBUG
} from "@/api/gateways";
const semver = require("semver");
import  debounce  from 'lodash/debounce'
import AccountsNav from '@/components/AccountsNav'
const os = require('os')

export default {
  data() {
    return {
      showmenuicon: false,
      showbackicon: true,
      appversion: APP_VERSION,
      fireflyGithub: APP_GITHUB,
      officialSite: OFFICIAL_SITE,
      latestVersion: null,
      updateURL: null,
      needUpdate: false,
      working: false,
      counter: 0,
      isDebug: DEBUG,
      showaccountsview: false,
      platform:null,

    };
  },
  beforeDestroy () {
    
  },
  mounted() {
  //  console.log('-----------os-----------')
  //  console.log(os.platform())
  // //  操作系统主机名
  //  var hostname=os.hostname()
  // console.log(hostname);
  // //操作系统版本
  // var release=os.release();
  // console.log(release);
  // //操作系统名称，基于linux的返回linux,基于苹果的返回Darwin,基于windows的返回Windows_NT
  // var type=os.type();
  // console.log(type);


  //  console.log(process)

   this.platform = os.type() + ' ' + os.release() + ' ' + process.arch

   this.getReleaseVersion()

   document.addEventListener('chcp_nothingToUpdate',()=>{
     this.$toasted.show(this.$t('NothingToInstall'))
   }, false)
   document.addEventListener('chcp_nothingToInstall',()=>{
     this.$toasted.show(this.$t('NothingToInstall'))
   }, false)
  },
  methods: {
    back() {
      this.$router.back();
    },
    getReleaseVersion(){
      getPackageJson()
        .then(response=>{
          let data = response.data
          this.latestVersion = data.version
          this.needUpdate = semver.gt(data.version, APP_VERSION)
        })
        .catch(err=>{
          console.error(err)
        })
    },
    checkForUpdates(){
      if(!chcp)return
      if(this.working)return
      this.working = true
      chcp.fetchUpdate((err,data)=>{
        if(err){
          this.working = false
          console.error(err.description)
          this.$toasted.error(this.$t('FetchUpdateError'))
          return
        }
        this.$toasted.show(this.$t('UpdateHint'))
        chcp.installUpdate(error=>{
          if(error){
            console.error(error)
            this.$toasted.error(this.$t('FetchUpdateError'))
            return
          }
          this.$toasted.show(this.$t('AfterUpdate'))
        })//end of installUpdate
        this.working = false
      })


    },

    openDownloadURL() {
      window.open(this.updateURL, "_system");
    },
    openURL(url) {
      window.open(url, "_system");
    },
    toTermOfServices() {
      this.$router.push({
        name: "TermsOfService",
        query: {
          active: "back"
        }
      });
    },
    toDebug(){
      //window.location.href = 'http://192.168.2.253:3000'
      // window.open('http://192.168.2.253:3000', "_self");
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
  },
  components: {
    Toolbar,
    Card,
    AccountsNav,
  }
};
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl';
.field_btn
  margin-top: 1rem
  .btn_ok
    padding: 0px 0px
    margin: 0px 0px
    width: 100%
.logo-wrapper {
  height: 120px;
  width: 100%;
  display: block;
  text-align: center;
  vertical-align: middle;

  .logo-img {
    width: 120px;
    height: 120px;
  }
}

.appname {
  font-size: 24px;
  color: $primarycolor.green;
}

.appversion {
  color: $secondarycolor.font;
}

.row {
  display: flex;
  padding-top: 5px;
  padding-bottom: 5px;
  height: 46px;
  line-height: 46px;
  vertical-align: middle;

  &:last-child {
    border-bottom: 0px;
  }

  .label {
    flex: 1;
    white-space: nowrap!important;
  }

  .value {
    flex: 3;
    color: $secondarycolor.font;
    font-size: 14px;
    height: 46px;
    line-height: 46px;
    vertical-align: middle;
    padding-left: .5rem;
    overflow: hidden;
  }
}

.link {
  color: $secondarycolor.font;
}

.icons {
  margin-top: 12px;
}
</style>
