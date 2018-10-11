import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  currentGroup: 'GJ-496',
  RongIMmsg: [],
  memberInfo: [],
  connectStatus: false
}
const mutations = {
  SET_RONGIM(state, RongIMmsg) {
    state.RongIMmsg = RongIMmsg
  },
  SET_GROUP(state, currentGroup) {
    state.currentGroup = currentGroup
  },
  SET_MEMBER(state, memberInfo) {
    state.memberInfo = memberInfo
  },
  SET_CONNECTSTATUS(state, status) {
    state.connectStatus = status
  }
};
const actions = {
  RongIMmsgAsyn({commit}, {currentGroup, RongIMmsg}) {
    commit(SET_RONGIM, RongIMmsg)
    commit(SET_GROUP, currentGroup)
    commit(SET_MEMBER, memberInfo)
    commit(SET_CONNECTSTATUS, status)
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions
});
