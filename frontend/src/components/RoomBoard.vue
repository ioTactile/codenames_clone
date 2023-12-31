<script setup lang="ts">
import type { Room, Player, Word } from '@/types/types'
import { computed, ref } from 'vue'
import { apiFetchData } from '@/utils/api'
import { useWebsocketStore } from '@/stores/websocket'

const props = defineProps<{
  room: Room
  user: Player | null
}>()

const websocketStore = useWebsocketStore()
const isCardClicked = ref(Array(props.room.words.length).fill(false))

const isUserTurn = computed((): boolean => {
  return !!props.room.players.find(
    (player) =>
      player.name === props.user?.name &&
      player.playerTeam === props.room.teamTurn &&
      player.playerRole === props.room.roleTurn
  )
})

const toggleCardTransformation = (index: number): void => {
  isCardClicked.value[index] = !isCardClicked.value[index]
}

const isUserSpy = (): boolean => {
  return props.user?.playerRole === 'SPYMASTER'
}

const isWordClicked = (word: Word): boolean => {
  return word.wordState === 'CLICKED'
}

const clickWord = async (word: Word): Promise<void> => {
  if (props.room.status !== 'IN_PROGRESS') return
  if (isUserSpy()) return
  if (!isUserTurn.value) return
  const roomId = props.room.id
  try {
    await apiFetchData(`room/${roomId}`, 'PUT', {
      action: 'click-word',
      username: props.user?.name,
      wordname: word.wordName
    })
    websocketStore.handleUserActivity()
  } catch (error) {
    console.error(error)
  }
}

const selectWord = async (word: Word): Promise<void> => {
  if (props.room.status !== 'IN_PROGRESS') return
  if (isUserSpy()) return
  if (!isUserTurn.value) return
  if (isWordClicked(word)) return
  const roomId = props.room.id
  try {
    await apiFetchData(`room/${roomId}`, 'PUT', {
      action: 'select-word',
      username: props.user?.name,
      wordname: word.wordName
    })
    websocketStore.handleUserActivity()
  } catch (error) {
    console.error(error)
  }
}

const getCharacter = (color: string, wordname: string): string => {
  let number = 0
  const colorWords = props.room.words.filter((word) => word.wordColor === color)
  const wordLocation = colorWords.findIndex((word) => word.wordName === wordname)
  switch (color) {
    case 'RED' || 'BLUE':
      number = (wordLocation / 8) * 100
      return `background-position-y: ${number}%;`
    case 'WHITE':
      number = (wordLocation / 5) * 100
      return `background-position-y: ${number}%;`
    default:
      return ''
  }
}

const getBackground = (color: string): string => {
  switch (color) {
    case 'RED':
      return 'background-position-y: 100%;'
    case 'BLUE':
      return 'background-position-y: 0%;'
    case 'WHITE':
      return 'background-position-y: 33.3333%;'
    default:
      return ''
  }
}
</script>

<template>
  <div class="center">
    <div class="grid grid-cols-5 gap-x-2 gap-y-1">
      <div v-for="(word, i) in room.words" :key="i">
        <div
          class="card-image relative"
          :class="{
            red: word.wordColor === 'RED' && isUserSpy(),
            white: !isUserSpy() || (word.wordColor === 'WHITE' && isUserSpy()),
            blue: word.wordColor === 'BLUE' && isUserSpy(),
            black: word.wordColor === 'BLACK' && isUserSpy()
          }"
          @click="selectWord(word)"
        >
          <div
            class="flex h-full items-end justify-center whitespace-nowrap break-all pb-1.5 font-fira text-sm font-bold uppercase mobile:pb-5 mobile:text-3xl"
            :class="word.wordColor === 'BLACK' && isUserSpy() ? 'text-white' : 'text-black'"
          >
            {{ word.wordName }}
          </div>
          <template v-if="word.wordState !== 'CLICKED'">
            <div v-for="(player, j) in word.selectedBy" :key="j">
              <div class="tips-wrapper absolute flex flex-wrap">
                <div
                  class="text-xxs mb-0.5 mr-0.5 inline-block truncate rounded-sm p-px px-1 leading-none text-white landscape:text-sm"
                  :class="{
                    'bg-blue-team-bg': room.teamTurn === 'BLUE',
                    'bg-red-team-bg': room.teamTurn === 'RED'
                  }"
                >
                  {{ player }}
                </div>
              </div>
            </div>
            <button
              v-if="room.status === 'IN_PROGRESS' && isUserTurn && !isUserSpy()"
              @click.stop="clickWord(word)"
              class="click-button pointer-events-auto absolute z-10 rounded-full bg-yellow shadow-bottom"
            ></button>
          </template>
          <template v-else>
            <div
              class="card absolute top-0 z-10 shadow-card"
              :class="{
                peak: isCardClicked[i]
              }"
              @click="toggleCardTransformation(i)"
            >
              <div
                class="absolute top-0 z-10"
                :class="{
                  'black-background': word.wordColor === 'BLACK',
                  'card-background': word.wordColor !== 'BLACK'
                }"
                :style="getBackground(word.wordColor)"
              >
                <div
                  v-if="word.wordColor !== 'BLACK'"
                  class="card-character absolute bottom-0 left-1/2"
                  :class="{
                    red: word.wordColor === 'RED',
                    gray: word.wordColor === 'WHITE',
                    blue: word.wordColor === 'BLUE'
                  }"
                  :style="getCharacter(word.wordColor, word.wordName)"
                ></div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.center {
  position: absolute;
  top: 150px;
  width: 55%;
  left: 50%;
  transform: translateX(-50%);
}

@media screen and (max-width: 500px) {
  .center {
    top: 105px;
    width: 100%;
    padding: 0 10px;
  }
}

.card-image {
  width: 208.32px;
  height: 134.4px;
  background-image: url('/images/fronts.png');
  background-size: 100%;
  background-repeat: no-repeat;
}

@media screen and (max-width: 500px) {
  .card-image {
    width: 94.08px;
    height: 60.48px;
  }
}

.card {
  transition: all 400ms ease 0s;
}

.peak {
  transform: rotateX(55deg);
  perspective: 600px;
  transform-style: preserve-3d;
}

.card-background {
  width: 208.32px;
  height: 134.4px;
  background-image: url('/images/backs.png');
  background-size: 100%;
  background-repeat: no-repeat;
}

@media screen and (max-width: 500px) {
  .card-background {
    width: 94.08px;
    height: 60.48px;
  }
}

.black-background {
  width: 208.32px;
  height: 134.4px;
  background-image: url('/images/black-back.png');
  background-size: 100%;
  background-repeat: no-repeat;
}

@media screen and (max-width: 500px) {
  .black-background {
    width: 94.08px;
    height: 60.48px;
  }
}

.card-character.red {
  z-index: 100;
  width: 134px;
  height: 120px;
  transform: translateX(-50%);
  background-image: url('/images/red.png');
  background-size: 100%;
  background-repeat: no-repeat;
}

@media screen and (max-width: 500px) {
  .card-character.red {
    width: 60.48px;
    height: 54.24px;
  }
}

.card-character.blue {
  z-index: 100;
  width: 134px;
  height: 120px;
  transform: translateX(-50%);
  background-image: url('/images/blue.png');
  background-size: 100%;
  background-repeat: no-repeat;
}

@media screen and (max-width: 500px) {
  .card-character.blue {
    width: 60.48px;
    height: 54.24px;
  }
}

.card-character.gray {
  z-index: 100;
  width: 134px;
  height: 120px;
  transform: translateX(-50%);
  background-image: url('/images/gray.png');
  background-size: 100%;
  background-repeat: no-repeat;
}

@media screen and (max-width: 500px) {
  .card-character.gray {
    width: 60.48px;
    height: 54.24px;
  }
}

.click-button {
  right: -4.2px;
  top: -2.1px;
  width: 49px;
  height: 49px;
  background-image: url('/images/icon_tap_card.png');
  background-size: 100%;
}

@media screen and (max-width: 500px) {
  .click-button {
    right: -2.1px;
    top: -1.05px;
    width: 22.12px;
    height: 22.12px;
  }
}

.tips-wrapper {
  top: 11.2px;
  left: 10.85px;
  width: 184.45px;
}

@media screen and (max-width: 500px) {
  .tips-wrapper {
    top: 5.6px;
    left: 4.85px;
    width: 83.2px;
  }
}

.tips-wrapper > div {
  max-width: calc(50% - 0.125rem);
}

.red {
  background-position-y: 100%;
}

.white {
  background-position-y: 50%;
}

.blue {
  background-position-y: 25%;
}

.black {
  background-position-y: 0%;
}
</style>
