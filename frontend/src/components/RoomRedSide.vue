<script setup lang="ts">
import type { Room, Player } from '@/types/types'
import { apiFetchData } from '@/utils/api'
import { computed } from 'vue'

const props = defineProps<{
  room: Room
  user: Player | null
}>()

const redAgents = computed(() => {
  if (!props.room) return []
  return props.room.players.filter(
    (player) => player.playerTeam === 'RED' && player.playerRole === 'OPERATIVE'
  )
})

const redSpymaster = computed(() => {
  if (!props.room) return []
  return props.room.players.filter(
    (player) => player.playerTeam === 'RED' && player.playerRole === 'SPYMASTER'
  )
})

const nonePlayers = computed(() => {
  if (!props.room) return []
  return props.room.players.filter((player) => player.playerTeam === 'NONE')
})

const joinRole = async (role: string) => {
  if (props.user?.playerTeam === 'BLUE') return
  try {
    const roomId = props.room.id
    await apiFetchData(`room/${roomId}`, 'PUT', {
      action: 'select-role',
      username: props.user?.name,
      role,
      team: 'RED'
    })
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <div class="left flex flex-col">
    <div
      class="landscape:border-ui flex-1 bg-red-team-bg landscape:flex-none landscape:rounded-xl landscape:shadow-bottom"
    >
      <div class="box-border w-full p-2">
        <section class="relative h-12 landscape:h-28">
          <span
            class="score absolute right-[20px] top-6 w-12 text-center text-white landscape:top-14"
            >{{ room.redRemainingWords || '-' }}</span
          >
        </section>
        <section>
          <span class="relative mt-1 w-full text-base text-red-light">Agents</span>
          <div v-if="redAgents.length" class="flex flex-wrap items-start justify-start">
            <div
              v-for="(user, i) in redAgents"
              :key="i"
              class="user-wrapper mb-1 mr-1 inline-block truncate rounded border border-white/40 px-1 py-1 font-bold leading-none text-white"
            >
              {{ user.name }}
            </div>
          </div>
          <div v-else class="pl-2 text-white">–</div>
          <button
            v-if="
              nonePlayers.length && (user?.playerTeam === 'RED' || user?.playerRole === 'OPERATIVE')
            "
            class="button text-base shadow-bottom"
            @click="joinRole('OPERATIVE')"
          >
            Rejoindre en tant qu'agent
          </button>
        </section>
        <section>
          <span class="relative mt-1 w-full text-base text-red-light">Espions</span>
          <div v-if="redSpymaster.length" class="flex flex-wrap items-start justify-start">
            <div
              v-for="(user, i) in redSpymaster"
              :key="i"
              class="user-wrapper mb-1 mr-1 inline-block truncate rounded border border-white/40 px-1 py-1 font-bold leading-none text-white"
            >
              {{ user.name }}
            </div>
          </div>
          <div v-else class="pl-2 text-white">–</div>
          <button
            v-if="
              !redSpymaster.length && (user?.playerTeam === 'RED' || user?.playerTeam === 'NONE')
            "
            class="button text-base shadow-bottom"
            @click="joinRole('SPYMASTER')"
          >
            Rejoindre en tant qu'espion
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.left {
  position: absolute;
  top: 150px;
  left: 20px;
  width: 340px;
  height: 900px;
}

.score {
  font-size: 50px;
  font-weight: bold;
  transform: translateY(-50%);
  z-index: 10;
  text-shadow: rgba(0, 0, 0, 0.8) 0px 0px 0.8rem;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
}

.user-wrapper {
  scale: 1;
  transform: translate3d(0, 0, 0);
  transform-origin: 50% 50% 0px;
}
</style>
@/stores/userStore