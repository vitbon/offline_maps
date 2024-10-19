### Запуск програми скачування тайлів

1. **Встановлюємо всі пакети**

   `npm install`

2. **7 параметрів для налаштування скачування (порядок має значення)**

   `type` string (satellite || landscape || street)

   `minimal zoom` integer

   `maximum zoom` integer

   `topLeft latitude` float

   `topLeft longtitude` float

   `bottomRight latitude` float

   `bottomRight longtitude` float

3. **Завантажуємо tiles із вищенаведеними параметрами у папку /tiles**

   `node downloadGoogleTiles.js satellite 0 3 50.51518 31.13224 52.98322 32.53091`
