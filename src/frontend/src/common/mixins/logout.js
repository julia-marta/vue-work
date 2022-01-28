export default {
  methods: {
    async $logout() {
      // Вызываем действие логаута в хранилище.
      await this.$store.dispatch('Auth/logout');
      // Показываем уведомление об успешном выходе.
      this.$notifier.success('Вы успешно вышли');
      // Переводим пользователя на страницу логина.
      await this.$router.push('/login');
    }
  }
};
