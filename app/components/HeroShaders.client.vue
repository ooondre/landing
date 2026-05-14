<script setup lang="ts">
import { Shader, Pixelate, Plasma, SineWave } from 'shaders/vue'
</script>

<template>
  <Shader>
    <Pixelate
      :gap="{
        type: 'map',
        curve: 0.35,
        source: 'idmmbhthud5inxgebqc',
        channel: 'alphaInverted',
        inputMax: 1,
        inputMin: 0,
        outputMax: 1,
        outputMin: 0.26
      }"
      :roundness="0.9"
      :scale="220"
      :transform="{ rotation: 180 }"
    >
      <Plasma :balance="97" color-a="#9CDCFE" color-b="#888888" :contrast="0.6" :density="1.3" :intensity="61.8" :visible="true" />
    </Pixelate>
    <SineWave
      id="idmmbhthud5inxgebqc"
      :amplitude="0.111"
      :position="{
        x: 0.5,
        y: 0.9
      }"
      :softness="0.8899"
      :thickness="0.87"
      :visible="false"
    />
  </Shader>
</template>
