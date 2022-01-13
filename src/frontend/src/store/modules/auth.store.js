import users from '@/static/users.json';

export default {
  namespaced: true, // у модуля будет свой префикс
  state: {
    user: users[0]
  }
};
