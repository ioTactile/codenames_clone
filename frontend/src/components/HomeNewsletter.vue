<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  location: string
}>()

const email = ref<string>('')
const subscribe = () => {
  if (!email.value) {
    alert('Veuillez saisir votre email')
    return
  }
  alert(`Vous êtes inscrit à la newsletter avec l'adresse ${email.value}`)
}
</script>

<template>
  <section
    class="flex flex-col content-between justify-center text-white sm:flex-row"
    :class="{
      'bg-darkPurple': location === 'home',
      'bg-gray-200': location === 'create'
    }"
  >
    <div class="w-full py-4">
      <form class="flex flex-col items-center px-4" @submit.prevent="subscribe">
        <div class="flex flex-col items-center">
          <label
            for="email"
            class="mb-2 text-center font-bold"
            :class="{
              'text-white': location === 'home',
              'text-black': location === 'create'
            }"
          >
            Tenez-moi informé des nouvelles fonctionnalités et des actualités sur Codenames :
          </label>
          <input
            id="email"
            type="email"
            v-model.trim="email"
            placeholder="Saisissez votre email"
            class="w-3/4 rounded-xl border-gray-500 p-2 text-center text-base text-black shadow-inset"
          />
        </div>
        <button
          type="submit"
          class="mt-2 rounded-xl border-2 bg-purple px-6 py-2 text-white hover:bg-darkPurple"
          :class="{
            'border-white': location === 'home'
          }"
        >
          S'inscrire
        </button>
        <p
          class="mt-4 px-2 text-center text-sm"
          :class="{
            'text-white': location === 'home',
            'text-black': location === 'create'
          }"
        >
          En vous inscrivant à cette newsletter Codenames CGE, vous acceptez les conditions
          générales. Vous pouvez vous désinscrire à n'importe quel moment en cliquant sur le lien en
          bas de cet email.
        </p>
      </form>
    </div>
  </section>
</template>
