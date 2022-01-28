// context - это объект с параметрами маршрутизатора: to, from, next, store.
// middlewares - цепочка проверок, которые нужно пройти.
// index - индекс следующей проверки в цепочке.
function middlewarePipeline (context, middlewares, index) {
  const nextMiddleware = middlewares[index];
  // Если это последний элемент в цепочке - вернуть next метод маршрутизатора.
  if (!nextMiddleware) {
    return context.next;
  }
  // иначе возвращаем функцию, результатом вызова которой будет
  // вызов следующей проверки и подготовка следующей за ней.
  return () => {
    const nextPipeline = middlewarePipeline(context, middlewares, index + 1);
    nextMiddleware({ ...context, nextMiddleware: nextPipeline });
  };
}

export default middlewarePipeline;
