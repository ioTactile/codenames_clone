<script setup lang="ts">
import type { Player, Room } from '@/types/types'
import { computed, ref, watch } from 'vue'
import { apiFetchData } from '@/utils/api'

const props = defineProps<{
  room: Room
  user: Player | null
}>()

const isClueModalOpen = ref<boolean>(false)
const clueNumber = ref<number>(0)
const clueName = ref<string>('')
const clueOptions = ref<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
const showClue = ref<boolean>(false)

const isUserSpyTurn = computed(() => {
  return !!(
    props.user?.playerRole === 'SPYMASTER' &&
    props.user?.playerTeam === props.room.teamTurn &&
    props.room.roleTurn === 'SPYMASTER' &&
    props.room.status === 'IN_PROGRESS'
  )
})

const isUserOperativeTurn = computed(() => {
  return !!(
    props.user?.playerRole === 'OPERATIVE' &&
    props.user?.playerTeam === props.room.teamTurn &&
    props.room.roleTurn === 'OPERATIVE' &&
    props.room.status === 'IN_PROGRESS'
  )
})

const getLastClue = computed(() => {
  const lastClue = props.room.clues[props.room.clues.length - 1]
  return lastClue
})

const getRoleTurn = () => {
  if (props.room.roleTurn === 'OPERATIVE') {
    showClue.value = true
  } else {
    showClue.value = false
  }
}

watch(
  () => props.room.roleTurn,
  () => {
    getRoleTurn()
  }
)

const sendClue = async () => {
  if (!isUserSpyTurn.value) return
  if (!clueName.value) return
  if (!clueNumber.value) return
  const roomId = props.room.id
  if (!roomId) return

  try {
    await apiFetchData(`room/${roomId}`, 'PUT', {
      action: 'add-clue',
      clue: {
        clueName: clueName.value,
        attempts: clueNumber.value,
        remaining: clueNumber.value + 1,
        spyName: props.user?.name
      },
      username: props.user?.name
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

const teamTurn = async () => {
  if (!isUserOperativeTurn.value) return
  const roomId = props.room.id
  if (!roomId) return

  try {
    await apiFetchData(`room/${roomId}`, 'PUT', {
      action: 'team-turn'
    })
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <template v-if="isUserSpyTurn">
    <div class="z-70 absolute top-[860px] w-full">
      <div class="flex w-full justify-end landscape:justify-center">
        <div
          class="flex w-10/12 max-w-screen-md flex-wrap items-center justify-center landscape:w-full"
        >
          <div class="flex-grow">
            <input
              v-model="clueName"
              name="clue"
              autocomplete="off"
              type="text"
              tabindex="0"
              placeholder="Tapez votre indice ici"
              @input="clueName = clueName.toUpperCase()"
              class="h-10 w-full rounded-xl border-none px-3 text-2xl text-black shadow-bottom focus:outline-none"
            />
          </div>
          <div class="mx-2 flex-none">
            <div class="relative">
              <div
                class="border-ui flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white text-2xl shadow-bottom"
                @click="isClueModalOpen = !isClueModalOpen"
              >
                {{ clueNumber || '–' }}
              </div>
              <div v-if="isClueModalOpen" class="clue-number-modal absolute z-50">
                <div class="border-ui flex rounded-lg bg-white p-2 shadow-bottom">
                  <div v-for="number in clueOptions" :key="number">
                    <div
                      class="clue-number-option inline-block cursor-pointer rounded-lg text-2xl leading-6 hover:bg-yellow"
                      @click="(clueNumber = number), (isClueModalOpen = false)"
                    >
                      {{ number }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="relative flex-initial">
            <button class="button color-green text-2xl shadow-bottom" @click="sendClue">
              Donner un indice
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-if="room.roleTurn === 'OPERATIVE'">
    <div class="bottom">
      <div class="flex w-full flex-col items-center justify-center text-xl landscape:text-3xl">
        <Transition name="slide-fade">
          <div class="flex items-center justify-center">
            <span
              :class="{
                'ring-blue-light': props.room.teamTurn === 'BLUE',
                'ring-red-light': props.room.teamTurn === 'RED'
              }"
              class="ml-1 select-text rounded-lg bg-white px-3 py-1 font-bold uppercase ring-4 landscape:ml-2 landscape:px-4 landscape:py-2 landscape:ring-8"
            >
              {{ getLastClue?.clueName }}
            </span>
            <span
              :class="{
                'ring-blue-light': props.room.teamTurn === 'BLUE',
                'ring-red-light': props.room.teamTurn === 'RED'
              }"
              class="ml-1 select-text rounded-lg bg-white px-3 py-1 font-bold uppercase ring-4 landscape:ml-2 landscape:px-4 landscape:py-2 landscape:ring-8"
            >
              {{ getLastClue?.attempts }}
            </span>
          </div>
        </Transition>
        <div v-if="isUserOperativeTurn" class="mt-2 landscape:mt-3">
          <button class="button shadow-button text-base" @click="teamTurn">Fini de deviner</button>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.bottom {
  z-index: 70;
  position: absolute;
  width: 100%;
  top: 860px;
  transition: top 1s;
}

.clue-number-modal {
  inset: 0px auto auto 0px;
  transform: translateX(-55%) translateY(-4rem) translateZ(0px);
}

.clue-number-option {
  padding: 0.3rem 0.5rem 0.25rem;
  margin: 0.1rem 0.2rem;
  border: 1px solid gray;
  box-shadow: rgba(0, 0, 0, 0.5) 0.1rem 0.1rem 1px 0px;
}

.slide-fade-enter-active {
  animation: appearing-in 1s;
}

.slide-fade-enter-from {
  top: 460px;
}

@keyframes appearing-in {
  0% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
@/stores/userStore @/stores/user