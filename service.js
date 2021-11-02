// Класс является сервером обработки запросов.
// в конструкторе передается транспорт, и настройки кластеризации
// сервер может работать как в одном процессе так и порождать для обработки запросов дочерние процессы.
// Задача дописать недостающие части и отрефакторить существующий код.
// Использовать функционал модуля cluster - не лучшая идея. Предпочтительный вариант - порождение процессов через child_process
// Мы ожидаем увидеть реализацию работы с межпроцессным взаимодействием в том виде, в котором вы сможете. 
// Контроль жизни дочерних процессов должен присутствовать в качестве опции. 
// Должна быть возможность включать\отключать пересоздание процессов в случае падения 
// Предпочтительно увидеть различные режимы балансировки входящих запросов.
//
// Не важно, http/ws/tcp/ или простой сокет это все изолируется в транспорте.
// Единственное что знает сервис обработки запросов это тип подключения транспорта, постоянный или временный
// и исходя из этого создает нужную конфигурацию. ну и еще от того какой режим кластеризации был выставлен
// В итоговом варианте ожидаем увидеть код в какой-либо системе контроля версия (github, gitlab) на ваш выбор
// Примеры использования при том или ином транспорте
// Будет плюсом, если задействуете в этом деле typescript и статическую типизацию.
// Вам не нужна привязка к каким-либо фрэймворкам или нестандартным библиотекам. Все реализуется при помощи встроенных модулей nodejs
// Если вам что-то не понятно, задавайте вопросы.
// Если вы не умеете применять принципы ООП, не начинайте задание
// Если вы не готовы тратить время на задачу, говорите об этом сразу и не приступайте к выполнению.
const cp = require("child_process")

const {
    Worker, isMainThread, parentPort, workerData, BroadcastChannel
} = require('worker_threads');

const bc = new BroadcastChannel('chanel1');

/*const requestListener = function (req, res) {
  res.writeHead(200);
  res.end(`<h1 style="text-align:center;margin-top:40px;">=X..X=<h1>`);
}

const server = http.createServer(requestListener);
server.listen(port, (err) => {
    if (err) {
        console.log(`Server error ${err}`);
    }
    console.log(`Listening port ${port}`)
});
*/
class Service {
    constructor(options) {
        this.transport = options.transport;
        this.isClusterMode = !!options.cluster;
        if (this.isClusterMode) {
            this.clusterOptions = options.cluster;
        }
    }

    async start() {
        if (this.isClusterMode) {
            if (this.isMaster) {
                await this.startCluster();
                if (this.transport.isPermanentConnection) {
                    await this.startTransport();
                }
            }
            else {
                await this.startWorker();
                if (!this.transport.isPermanentConnection) {
                    await this.startTransport();
                }
            }
        }
        else {
            await this.startWorker();
            await this.startTransport();
        }
    }

    async startTransport() {
        //todo: логика запуска транспорта
    }

    async startWorker() {
        //todo: логика запуска обработчика запросов
        if (isMainThread) {
            console.log('I am Main')
            const worker = new Worker(this.startCluster, {
                workerData = 5
            });

            bc.onmessage = (msg) => {
                function execProcess(command) {
                    cp.ChildProcess.exec(command, function(error, stdout, stderr){
                        console.log(`stdout: ${stdout}`);
                        console.log(`stderr: ${stderr}`);

                        if(error !== null) {
                            console.log(`error: ${error}`);
                        }
                    })
                }

                execProcess('node -v');
            }
        }

        console.log('I am Worker', workerData)

        bc.postMessage('Worker 1 ready!')

    }

    async startCluster() {
        //todo: логика запуска дочерних процессов
        console.log('I am Worker', workerData)

        bc.postMessage('Worker 1 ready!')
    }
}
