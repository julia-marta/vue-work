// ******************************************
// *** Routes is added automatically      ***
// *** See Nuxt JS routing documentation  ***
// *** https://nuxtjs.org/                ***
// ******************************************

// Определяем константы для текущего файла.
const CARET = '^';
const COLON = ':';
const UNDERSCORE = '_';

// Данная функция преобразует контекст в строки с расположением файла.
// в аргументы мы получаем функцию webpackContext(req)
// в ней есть функция keys, она возвращает массив, состоящий из всех запросов,
// которые могут быть обработаны этим контекстным модулем
// в данном случае это Array(6)
// [ "./Login.vue", "./NotFound.vue",
// "./index/IndexHome.vue", "./index/^_id.vue",
// "./index/tasks/Create.vue", "./index/tasks/edit/_id.vue" ]
// у каждого элемента отрезаем первые 2 знака (путь ./)
// потом отрезаем расширение
// потом разбиваем путь на массив по знаку '/'
const importAll = context =>
  context.keys().map(key =>
    key
      .slice(2)
      .replace('.vue', '')
      .split('/')
  );

// Так как нет возможности обратиться из браузера к файловой системе,
// мы воспользуемся функцией webpack require.context.
// Данная функция позволяет передать:
// - каталог для поиска (в данном случае views)
// - флаг, указывающий, следует ли искать и подкаталоги (в данном случае да)
// - регулярное выражение для сопоставления файлов
// (в данном случае с расширением .vue)
const pages = importAll(require.context('../views', true, /\.vue$/));

// получили здесь массив из 6 массивов Array(6)
// 0: Array [ "Login" ]
// 1: Array [ "NotFound" ]
// 2: Array [ "index", "IndexHome" ]
// 3: Array [ "index", "^_id" ]
// 4: Array(3) [ "index", "tasks", "Create" ]
// 5: Array(4) [ "index", "tasks", "edit", "_id"]

// Это ключевая функция, которая отвечает за создание конкретного маршрута.
const generateRoute = path => {

  // Блок для обработки корневых директорий, которые начинаются с index.
  // Например: файл views/index/*
  // если путь начинается с индекса, удаляем index, остальное оставляем
  if (path[0].toLowerCase().startsWith('index') && path.length > 1) {
    path.shift();
  }

  // Блок обработки корневых файлов.
  // Например: файлы views/Index.vue, views/User.vue
  // Note: handle root routes
  // если начинается не с Index и с подчеркивания, то это динамический маршрут
  // заменяем подчеркивание на двоеточие
  // в противном случае оставляем как есть
  if (path.length === 1) {
    const shortcut = path[0].toLowerCase();
    return shortcut.startsWith('index')
      ? ''
      : shortcut.startsWith(UNDERSCORE)
        ? shortcut.replace(UNDERSCORE, COLON)
        : shortcut;
  }

  // Блок обработки всех остальных маршрутов.
  // Note: handle other routes
  // берём последний элемент массива
  const lastElement = path[path.length - 1];

  // Обработка файлов */Index.vue
  // если он начинаеся с Index, дб исключен из маршрута
  // удаляем последний элемент из пути
  if (lastElement.toLowerCase().startsWith('index')) {
    path.pop();

  // Обработка динамических маршрутов.
  // если начинается с подчеркивания, заменяем его в пути на двоеточие
  } else if (lastElement.startsWith(UNDERSCORE)) {
    path[path.length - 1] = lastElement.replace(UNDERSCORE, COLON);
  }

  // в массиве, который остался. приводим все его элементы к нижнему регистру
  // а потом объединяем в строку через / и получаем финальный путь
  return path.map(p => p.toLowerCase()).join('/');
};

// Определяем правило определения дочерних маршрутов.
const childrenFilter = p => ~p.indexOf(CARET);

// Функция для обработки дочерних маршрутов.
const childrenByPath = pages
  // отбираем только дочерние маршруты с помощью фильтра
  .filter(path => path.some(childrenFilter))
  .map(path => {
    // Note: copy path and remove special char ^
    const copy = [...path];
    // берём последний элемент в массиве и отрезаем у него первый знак (^)
    copy[copy.length - 1] = copy[copy.length - 1].slice(1);
    // генерируем путь родительского маршрута, обрезав последний элемент
    const key = `/${generateRoute(copy.slice(0, copy.length - 1))}`;
    // тут получится key /
    return {
      path,
      route: `/${generateRoute(copy)}`,
      // а тут получится route :id
      key
    };
  })
  .reduce((acc, cur) => {
    // cur = {
    //   "path": ["index", "^_id"],
    //   "route": "/:id",
    //   "key": "/"
    // }
    const key = cur.key;
    delete cur.key;
    if (acc[key]) {
      acc[key].push(cur);
    } else {
      acc[key] = [cur];
    }
    // тут мы получим объект вида
    // {
    //   "/": [
    //   {
    //     path: [ "index", "^_id" ],
    //     route: "/:id"
    //   }]
    // };
    return acc;

  }, {});

// Определение дефолтного лейаута.
const defaultLayout = 'AppLayoutDefault';

// Имя файла страницы 404.
const notFoundPage = 'NotFound';

// Обработка специального случая для страницы 404.
// тут возвращается маршрут на главную с использованием вью NotFound.vue
const handleNotFoundPage = async () => {
  const module = await import(`../views/${notFoundPage}.vue`);
  const component = await module.default;
  return {
    path: '*',
    component
  };
};

// Возвращаем обработанные страницы.
export default pages
// Удаляем дочерние страницы из массива.
// в данном случае это страница таска ['index', '^_id']
  .filter(path => !path.some(childrenFilter))
  // Преобразуем страницы (строки) в маршруты.
  .map(async path => {
    // для страницы 1: Array [ "NotFound" ] вызываем handleNotFoundPage
    if (path.includes(notFoundPage)) {
      return await handleNotFoundPage();
    }
    // Получаем компонент vue.
    const { default: component } = await import(`../views/${path.join('/')}`);
    // Получаем свойства из компонента.
    const { layout, middlewares, name } = component;
    // Создаём маршрут, вызывая ф-цию generateRoute (см. выше)
    // сюда попадают 4 пути (ушли дочерний и not found)

    const route = `/${generateRoute([...path])}`;
    // после этого у нас получилось 4 пути:
    // route /login
    // route /
    // route /tasks/create
    // route /tasks/edit/:id

    let children = [];
    // Добавляем дочерние маршруты.
    if (childrenByPath[route]) {
      const promises = childrenByPath[route].map(async ({ path, route }) => {
        // Получаем компонент vue по пути path
        const { default: childComponent } = await import(
          `../views/${path.join('/')}`
        );
        // Получаем свойства из дочернего компонента.
        const {
          layout: childLayout,
          middlewares: childMiddleware,
          name: childName
        } = childComponent;

        return {
          path: route,
          name: childName,
          component: childComponent,
          meta: {
            layout: childLayout || defaultLayout,
            middlewares: childMiddleware || {}
          }
        };
      });
      children = await Promise.all(promises);
    }
    return {
      path: route,
      name,
      component,
      meta: {
        layout: layout || defaultLayout,
        middlewares: middlewares || {}
      },
      children
    };
  });
