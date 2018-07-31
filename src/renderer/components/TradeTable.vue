<template>
  <div class="trade--table">
    <div class="headline mt-5 textcenter primarycolor">{{label}}</div>
    <v-data-table
      :headers="headers"
      :items="items"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.asset }}</td>
        <td class="text-xs-right">{{ props.item.open }}</td>
        <td class="text-xs-right">{{ props.item.close }}</td>
        <td class="text-xs-right">{{ props.item.high }}</td>
        <td class="text-xs-right">{{ props.item.low }}</td>
        <td class="text-xs-right">{{ props.item.volumes }}</td>
        <td class="text-xs-right">{{ props.item.price }}</td>
        <td class="text-xs-right">{{ props.item.change }}</td>
      </template>
    </v-data-table>
</template>
  </div>
</template>

<script>
export default {
  data(){
    return {
      headers:[
          {
            text: this.$t('Asset'),
            align: 'left',
            sortable: false,
            value: 'asset'
          },
          {
            text: this.$t('open_price'),
            value: 'open'
          },
          {
            text: this.$t('close_price'),
            value: 'close'
          },
          {
            text: this.$t('high_price'),
            value: 'high'
          },
          {
            text: this.$t('low_price'),
            value: 'low'
          },
          {
            text: this.$t('volumes'),
            value: 'volumes'
          },
          {
            text: this.$t('Trade.Price'),
            value: 'price'
          },
          {
            text: this.$t('change_price'),
            value: 'change'
          },
        ]
    }
  },
  props:{
    label:{
      type: String,
      required: true
    },
    data:{
      type: Array,
      default: []
    }
  },
  computed:{
    items(){
      return []
    }
  }
}
</script>

<style>

</style>
