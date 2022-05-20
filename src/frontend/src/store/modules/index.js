// Используем функцию require.context webpack
// для получения списка файлов системы
const requireContext = require.context('./', true, /store\.js$/);

// Преобразуем каждый файл в модуль vuex
export default requireContext.keys().reduce((modules, filename) => {
  const moduleName = filename
    .split('/')[1]
    .replace(/^\w/, c => c.toUpperCase());
  modules[moduleName] =
    requireContext(filename).default || requireContext(filename);
  return modules;
}, {});
