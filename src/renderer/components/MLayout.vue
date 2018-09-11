<template>
  <div :class="'mainlayout ' + (left ? 'hasLeft':'')" >
  <!--
  <v-layout row wrap class="mlayout" v-if="mid">
    <v-flex xs3>&nbsp;</v-flex>
    <v-flex xs6>
      <slot></slot>
    </v-flex>
    <v-flex xs3>&nbsp;</v-flex>

  </v-layout>
  
  <v-layout row wrap class="mlayout" v-else>
    <v-flex xs1>&nbsp;</v-flex>
    <v-flex xs10>
      <slot></slot>
    </v-flex>
    <v-flex xs1>&nbsp;</v-flex>

  </v-layout>
  -->
    <v-container>
      <slot></slot>
    </v-container>
  </div>
</template>

<script>
export default {
  props:{
    left:{
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="stylus">
.hasLeft
  padding-left: 60px
</style>
