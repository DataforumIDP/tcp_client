# TCP Electron App

Простое кастомное приложение Electron для отображения и управлением TCP данными.

## Описание

TCP Electron App - это простое приложение, разработанное с использованием Electron, которое отображает данные TCP. Приложение поддерживает различные размеры окон и включает стиль, созданный с помощью Bootstrap.

## Установка

1. **Клонируйте репозиторий:**

    ```sh
    git clone https://github.com/antonstrobe/tcp-electron-app.git
    cd tcp-electron-app
    ```

2. **Установите зависимости:**

    ```sh
    npm install
    ```

3. **Запустите приложение:**

    ```sh
    npm start
    ```

4. **Соберите портативный exe файл:**

    ```sh
    npm run package
    ```

## Зависимости

- [Bootstrap](https://getbootstrap.com/)
- [Electron](https://www.electronjs.org/)
- [electron-store](https://github.com/sindresorhus/electron-store)
- [jQuery](https://jquery.com/)
- [Popper.js](https://popper.js.org/)

## Сценарии npm
- `npm install` - Установка.
- `npm start` - Запускает приложение.
- `npm run package` - Увеличивает версию и собирает портативный exe файл.

## Структура проекта

```plaintext
/tcp
|-- build/
|   |-- icon.ico
|-- main.js
|-- index.html
|-- renderer.js
|-- style.css
|-- handleKeyUp.js
|-- func.js
|-- package.json


LICENSE:

MIT License

© 2024 Anton Ptrov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

