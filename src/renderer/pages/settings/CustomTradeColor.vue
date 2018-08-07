<template>
  <v-card class="pa-4">
    <v-radio-group v-model="color" @change="switchColor">
      <v-radio :label="$t('redUpGreenDown')" color="primary" :value="0"></v-radio>
      <v-radio :label="$t('greenUpRedDown')" color="primary"  :value="1"></v-radio>
    </v-radio-group>
  </v-card>
</template>

<script>
import { mapState, mapActions} from 'vuex'
export default {
  data(){
    return {
      color: 0
    }
  },
  computed:{
    ...mapState({
      redUpGreenDown: state => state.app.redUpGreenDown,
    })
  },
  mounted(){
    if(this.redUpGreenDown){
      this.color = 0
    }else{
      this.color = 1
    }
  },
  methods:{
    ...mapActions({
      changeUpDownColor:'changeUpDownColor',
    }),
    switchColor(){
      this.changeUpDownColor(!this.redUpGreenDown)
    },
  }
}
</script>

<style>

</style>
