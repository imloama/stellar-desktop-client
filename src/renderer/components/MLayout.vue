<template>

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
</template>

<script>
export default {
  props:{
    mid:{
      type: Boolean,
      default: false
    }
  }
}
</script>

<style>

</style>
