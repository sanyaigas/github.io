let totalPassengers = 0;
let currentStation = 'Константиновка';
let passengersOnTrain = 0;
const MAX_TRAIN_CAPACITY = 20;
const MAX_STATION_CAPACITY = 50;
let gameOver = false;
let stationPassengers = {
    'Константиновка': 0,
    'Дружковка': 0,
    'Краматорск': 0,
    'Славянск': 0
};

const stations = {
    'Константиновка': '0%',
    'Дружковка': '33%',
    'Краматорск': '66%',
    'Славянск': '100%'
};

function updateTable() {
    const rows = document.querySelectorAll('table tr:not(:first-child)');
    rows.forEach(row => {
        const station = row.cells[1].textContent;
        const passengers = stationPassengers[station];
        row.cells[2].textContent = passengers;

        let status, statusClass;
        if (passengers < 15) {
            status = 'Низкая';
            statusClass = 'status-low';
        } else if (passengers < 35) {
            status = 'Средняя';
            statusClass = 'status-medium';
        } else {
            status = 'Высокая';
            statusClass = 'status-high';
        }

        row.cells[3].textContent = status;
        row.cells[3].className = statusClass;
    });
}

function checkGameOver() {
    for (let station in stationPassengers) {
        if (stationPassengers[station] >= MAX_STATION_CAPACITY) {
            gameOver = true;
            alert(`Игра окончена! На станции ${station} скопилось слишком много пассажиров (${stationPassengers[station]}).\nВсего перевезено пассажиров: ${totalPassengers}`);
            document.getElementById('sendBtn').disabled = true;
            // Останавливаем обновление пассажиров
            for (let interval of intervals) {
                clearInterval(interval);
            }
            return true;
        }
    }
    return false;
}

function updateStationPassengers() {
    if (gameOver) return;

    for (let station in stationPassengers) {
        if (stationPassengers[station] < MAX_STATION_CAPACITY) {
            stationPassengers[station] += Math.floor(Math.random() * 3);
            if (stationPassengers[station] > MAX_STATION_CAPACITY) {
                stationPassengers[station] = MAX_STATION_CAPACITY;
            }
        }

        const stationElement = document.querySelector(`.station[data-name="${station}"]`);
        let waitingElement = stationElement.querySelector('.waiting-passengers');
        if (!waitingElement) {
            waitingElement = document.createElement('div');
            waitingElement.className = 'waiting-passengers';
            stationElement.appendChild(waitingElement);
        }
        waitingElement.textContent = `👥 ${stationPassengers[station]}`;
    }

    updateTable();
    checkGameOver();
}

// Сохраняем все интервалы для возможности их остановки
let intervals = [];

// Запускаем периодическое обновление пассажиров на станциях
intervals.push(setInterval(updateStationPassengers, 5000));

// Инициализируем начальное количество пассажиров на станциях
updateStationPassengers();

function playTrainHorn() {
    const horn = document.getElementById('hornSound');
    horn.currentTime = 0;
    horn.play();

    // Добавляем анимацию пара
    const train = document.getElementById('train');
    const steam = document.createElement('div');
    steam.textContent = '💨';
    steam.className = 'steam';
    steam.style.left = '40px';
    steam.style.top = '-20px';
    train.appendChild(steam);

    setTimeout(() => {
        horn.pause();
        horn.currentTime = 0;
        steam.remove();
    }, 2000);
}

function selectRow(row) {
    document.querySelectorAll('tr').forEach(tr => tr.classList.remove('selected'));
    row.classList.add('selected');
}

function sendTrain() {
    if (gameOver) return;

    const selectedRow = document.querySelector('.selected td:nth-child(2)');
    if (!selectedRow) {
        alert('Выберите станцию!');
        return;
    }

    const destination = selectedRow.innerText;
    if (destination === currentStation) {
        alert('Поезд уже находится на этой станции!');
        return;
    }

    const train = document.getElementById('train');
    const trainSound = document.getElementById('trainSound');
    const sendBtn = document.getElementById('sendBtn');

    // Проверяем, сколько пассажиров можем забрать
    const availablePassengers = Math.min(stationPassengers[currentStation], MAX_TRAIN_CAPACITY);

    sendBtn.disabled = true;

    // Забираем пассажиров с текущей станции
    passengersOnTrain = availablePassengers;
    stationPassengers[currentStation] -= availablePassengers;
    updateStationPassengers();

    // Обновляем количество пассажиров в поезде
    train.querySelector('.train-passengers').textContent = passengersOnTrain;

    train.style.transition = "left 16s linear";
    train.style.left = stations[destination];
    trainSound.play();

    setTimeout(() => {
        train.style.transition = "left 6s ease-out";
        trainSound.src = "poezd-ostanavlivaetsya.mp3";
        trainSound.play();
    }, 9000);

    setTimeout(() => {
        // Добавляем пассажиров к общему числу перевезенных
        if (passengersOnTrain > 0) {
            totalPassengers += passengersOnTrain;
            document.getElementById('totalPassengers').textContent = totalPassengers;
            alert(`Поезд прибыл в ${destination}\nПеревезено пассажиров: ${passengersOnTrain}`);
        } else {
            alert(`Поезд прибыл в ${destination}`);
        }

        currentStation = destination;
        passengersOnTrain = 0;
        train.querySelector('.train-passengers').textContent = '0';
        sendBtn.disabled = false;
        trainSound.src = "v-poezde.mp3";
    }, 18000);
}