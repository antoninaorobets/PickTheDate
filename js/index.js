document.addEventListener('DOMContentLoaded', init)
function init(event) {
    displayHome()
    const home = document.querySelector('#home')
    home.addEventListener('click', displayHome)
    const weather = document.querySelector('#weather')
    weather.addEventListener('click', displayWeather)
    const list = document.querySelector('#event-list')
    list.addEventListener('click', displayList)
    const create = document.querySelector('#create-event')
    create.addEventListener('click', displayCreateDiv)
}

const mainDiv = document.querySelector('#main')

function displayHome() {
    mainDiv.innerHTML = ''
    const header = createHeader("h1", "Pick the Day")
    mainDiv.append(header)
    const paragraph1 = createParagraph('This web app helps friends to pick the best date to meet.')
    const paragraph2 = createParagraph("When did you meet your friends last time? Missing them? Don't waste time.  You can select a day that works for all!")
    const paragraph3 = createParagraph("Check the weather first, not to get wet or cold :)")
    mainDiv.append(paragraph1)
    mainDiv.append(paragraph2)
    mainDiv.append(paragraph3)
    const weatherBtn = createBtn("weather-btn", 'Check Weather')
    weatherBtn.addEventListener('click', displayWeather)
    mainDiv.append(weatherBtn)
    const eventBtn = createBtn("create-btn", 'Create Event')
    eventBtn.addEventListener('click', displayCreateDiv)
    mainDiv.append(eventBtn)
}

//Functions to handle Events List
function displayList(event) {
    mainDiv.innerHTML = ""
    mainDiv.innerHTML =
        '<h1>Current Events</h1>'

    fetch('http://localhost:3000/events')
        .then((response) => response.json())
        .then(createList)
        .catch((error) => console.error(error.message))
    const list = document.createElement('div')
    list.classList.add("list-group")
    mainDiv.append(list)
    function createList(data) {
        for (let element of data) {
            const a = document.createElement('a')
            a.dataset.eventId = element.id
            a.textContent = element.title
            a.href = "#"
            a.classList.add("list-group-item")
            a.classList.add("list-group-item-action")
            a.addEventListener('click', getEventData)
            list.append(a)
        }
    }
}

function getEventData(event) {
    fetch('http://localhost:3000/events' + `/${event.target.dataset.eventId}`,)
        .then((response) => response.json())
        .then(displayCurrentEvent)
        .catch((error) => console.error(error.message))
}

//Functions to handle create Event
function displayCreateDiv(event) {
    mainDiv.innerHTML = ""
    mainDiv.innerHTML =
        '<h1>Create New Event</h1>' +

        '<form action="#" id="new-event" class="row g-3">' +

        '<div class="col-12">' +
        '<label id="event-name"  class="form-label">Event name</label>' +
        ' <input type="text" name="event-name" class="form-control"/> </div>' +
        ' <div class="col-md-6">' +
        ' <label id="start-data"   class="form-label">From date</label>' +
        '<input type="date" name="start-data"  class="form-control"/> </div>' +
        ' <div class="col-md-6">' +
        ' <label id="start-data"  class="form-label">Till date</label>' +
        ' <input type="date" name="end-data" class="form-control" /> </div>' +

        '<input type="submit" value="Submit" class="btn btn-primary" style="background-color: #F9AA33;">' +

        ' </form>'
    const form = document.querySelector('form')
    form.addEventListener('submit', createEvent)
}

function createEvent(event) {
    event.preventDefault()
    const input = event.target.querySelector("input[name='event-name']").value
    let start = event.target.querySelector("input[name='start-data']").value
    const end = event.target.querySelector("input[name='end-data']").value
    const interval = getNumberOfDays(start, end)
    const dateRange = [start]

    for (let i = 0; i < interval; i++) {
        let d = new Date(start)
        d.setDate(d.getDate() + 1)
        dateRange.push(d)
        start = d
        console.log(d)
    }
    console.log(dateRange)
    const formData = {
        "title": `${input}`,
        "start": `${start}`,
        "end": `${end}`,
        "days": dateRange,
        "participants": {}
    }

    fetch('http://localhost:3000/events', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then((response) => response.json())
        .then(displayCurrentEvent)
        .catch((error) => console.error(error.message))
}

function displayCurrentEvent(data) {
    console.log('current event data', data)
    mainDiv.innerHTML = ""
    const title = document.createElement('h1')
    title.textContent = data.title
    mainDiv.append(title)
    const summaryByDay = resulrsForEvent(data)
    const max =  summaryByDay.reduce((x,y) => Math.max(x,y),0)
    const maxIndex = summaryByDay.indexOf(max)
    const maxDay = data.days[maxIndex]
    const total = Object.keys(data.particitants).length
    const summary = document.createElement('div')
    const day = reternDay(maxDay)
    summary.innerHTML = '<p>The most popular date for this event:' +
        `<span style="font-weight:bold"> ${day} ${maxDay.slice(5,10)} </span> selected by ${max} from ${total} particpants</p>`
    mainDiv.append(summary)
    const btn = createBtn("participate", "Participate")
    btn.addEventListener('click', (event) => openAvailabilityForm(event, data))
    mainDiv.append(btn)

    const form = document.createElement('form')
    form.id = "availabiloty-form"
    mainDiv.append(form)

    const visualSection = document.createElement('section')
    mainDiv.append(visualSection)
    if (Object.keys(data.particitants).length === 0) {
        visualSection.textContent = 'Tut budet tablichka'
    }
    else {
        displayAvailabilityTable(data, visualSection)
    }
}

function openAvailabilityForm(event, eventData) {
    const form = mainDiv.querySelector('#availabiloty-form')
    form.addEventListener('submit', (event) => updateEventSummary(event, eventData))  //doean't work if move to displayCurrentEvent function
    const input = createInput("user-name", "Name")
    form.append(input)
    const div = document.createElement('div')
    form.append(div)
    for (let day of eventData.days) {
        const a = new Date(day);
        const check = createCheck(a.toString().slice(0, 15))
        div.append(check)
    }
    const submit = createSubmitBtn()
    form.append(submit)
}

function updateEventSummary(event, eventData) {
    event.preventDefault()
    const userName = event.target.querySelector('input[name="user-name"]').value
    const checkList = event.target.querySelectorAll(".form-check")
    const availability = []
    checkList.forEach(check => availability.push(check.querySelector('input').checked))
    const form = mainDiv.querySelector('#availabiloty-form')
    mainDiv.removeChild(form)
    const id = eventData.id

    eventData.particitants[userName] = availability
    console.log(eventData.particitants)
    const data = {
        particitants: eventData.particitants
    }
    // ?????????? How to ubpage without passin all object
    fetch('http://localhost:3000/events' + `/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(displayCurrentEvent)
        .catch((error) => console.error(error.message))
}

function displayAvailabilityTable(eventData, section) {
    console.log('displayAvailabilityTable')
    const tableTitle = createHeader('h4', 'Results')
    section.append(tableTitle)
    const table = document.createElement('table')
    table.classList.add("table")
    table.classList.add("table-bordered")
    section.append(table)

    // dates
    const dates = document.createElement('tfoot')
    table.append(dates)
    const tr = document.createElement('tr')
    dates.append(tr)
    const numCol = eventData.days.length
    const th = document.createElement('th')
    th.scope = "col"
    th.textContent = ''
    tr.append(th)
    for (let i = 1; i < numCol + 1; i++) {
        const day = reternDay(eventData.days[i - 1])
        const d = eventData.days[i - 1]
        const th = document.createElement('th')
        th.scope = "col"
        th.textContent = `${day} \n `   +   d.toString().slice(5, 10).replace(' ', '/')
        tr.append(th)
    }
    const thBtn = document.createElement('th')
    thBtn.scope = "col"
    thBtn.textContent = ''
    tr.append(thBtn)


    // availability
    const tbody = document.createElement('tbody')
    table.append(tbody)
    const particitants = Object.keys(eventData.particitants)
    const numRow = particitants.length
    const avail = Object.values(eventData.particitants)

    for (let i = 0; i < numRow; i++) {
        // for (let i = numRow-1; i >= 0 ; i--) {
        const tr = document.createElement('tr')
        tbody.append(tr)
        const td = document.createElement('td')
        tr.append(td)
        td.scope = "row"
        td.textContent = particitants[i]

        for (let j = 0; j < numCol; j++) {
            const td = document.createElement('td')
            if (avail[i][j]) {
                td.style.backgroundColor = "#F9AA33";
            }
            // td.textContent = avail[i][j]
            tr.append(td)
        }
        const tdBtn = document.createElement('td')
        tdBtn.append(document.createElement('button'))
        tdBtn.innerText = "Edit"
        tdBtn.addEventListener('click', (event) => editUserRecord(event, particitants[i]))
        tr.append(tdBtn)
    }

    // summry
    
}

function resulrsForEvent(eventData) {
    const avail = Object.values(eventData.particitants)
    const numCol = eventData.days.length
    const numRow = Object.keys(eventData.particitants).length

    const resArr = []
    for (let j = 0; j < numCol; j++) {
        let count = 0
        for (let i = 0; i < numRow; i++) {
            const td = document.createElement('td')
            if (avail[i][j]) { count++ }
        }
        resArr.push(count)
    }
    return resArr
}

function editUserRecord(event, particitants) {
    console.log(particitants)
}

// Create Elements functons
function createHeader(type, text) {
    const header = document.createElement(`${type}`)
    header.textContent = text
    return header
}
function createParagraph(text) {
    const paragraph = document.createElement(`p`)
    paragraph.textContent = text
    return paragraph
}

function createBtn(btnId, text) {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.id = btnId
    btn.classList.add("btn")
    btn.classList.add("btn-primary")
    return btn
}

function createCheck(text) {
    const checkbox = document.createElement('div')
    checkbox.className = 'form-check'
    const input = document.createElement('input')
    input.className = "form-check-input"
    input.type = "checkbox"
    input.value = ""
    input.id = "flexCheckChecked"
    checkbox.append(input)

    const label = document.createElement('label')
    label.className = "form-check-label"
    label.for = "flexCheckChecked"
    label.textContent = text
    checkbox.append(label)
    return checkbox
}

function createInput(inputName, lableText) {
    const div = document.createElement('div')
    div.className = "col-12"

    const label = document.createElement('label')
    label.className = "form-label"
    label.id = inputName
    label.textContent = lableText
    div.append(label)

    const input = document.createElement('input')
    input.className = "form-control"
    input.type = "text"
    input.name = inputName
    div.append(input)
    return div
}

function createSubmitBtn() {
    const btn = document.createElement('input')
    btn.classList.add("btn")
    btn.classList.add("btn-primary")
    btn.type = "submit"
    btn.value = "Submit"
    // style="background-color: #F9AA33;"
    return btn
}

//Aditinal calculations functions
function getNumberOfDays(start, end) {
    const date1 = new Date(start);
    const date2 = new Date(end);
    const oneDay = 1000 * 60 * 60 * 24;
    const diffInTime = date2.getTime() - date1.getTime();
    const diffInDays = Math.round(diffInTime / oneDay);
    return diffInDays;
}

// Weather forecast 
function displayWeather(event) {
    mainDiv.innerHTML = ''
    const header = createHeader("h1", "Weather Forecast")
    mainDiv.append(header)
    const form = document.createElement('form')
    form.className = "mb-3"
    form.addEventListener('submit', requestWeatherData)
    mainDiv.append(form)
    const input = createInput("zipcode", "City")
    form.append(input)
    const submit = createSubmitBtn()
    form.append(submit)

    // code to ask for location and dates befor request API  
    // topick for my blog
    // requestWeatherAPI().then((data)=> {
    //         console.log(data.response[0].periods[0].maxTempC)
    //     })
    function requestWeatherData(event) {
        event.preventDefault()
        mainDiv.removeChild(form)
        const zipcode = event.target.querySelector("input[name='zipcode']").value.toString()
        //convert name to zip??
        requestWeatherAPI(zipcode).then((data) => {
            console.log(data.response[0].periods[0].maxTempC)
            displayForecast(data)
        })

    }
}


function displayForecast(data) {
    // const paragraph3 = createParagraph(``)
    // mainDiv.append(paragraph3)
    const table = document.createElement('table')
    table.className = "table"
    mainDiv.append(table)
    const thead = document.createElement('thead')
    table.append(thead)
    const tbody = document.createElement('tbody')
    table.append(tbody)
    const tr = document.createElement('tr')
    thead.append(tr)
    tr.innerHTML = '<th scope="col">Day</th><th scope="col">Img</th><th scope="col">Max</th> <th scope="col">Min</th>'
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let day of data.response[0].periods) {
        const tr = document.createElement('tr')
        tbody.append(tr)
        const a = new Date(day.timestamp * 1000);
        const dayOfWeek = days[a.getDay()]

        tr.innerHTML = `<td>${dayOfWeek}<br>${a.toString().slice(4, 15)}</td><td>${day.weather}</td><td>${day.maxTempC} C</td><td>${day.minTempC} C</td>`
       console.log(day.maxTempC)
    }
}

function reternDay(day){
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const a = new Date(day);
     return days[a.getDay()]
}


function requestWeatherAPI(zipcode) {
    // location, start,end

    return fetch(`https://aerisweather1.p.rapidapi.com/forecasts/${zipcode}?from=2021-12-30&to=2022-01-19`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "aerisweather1.p.rapidapi.com",
            "x-rapidapi-key": "03cbacb2d6msh147d7e91d53a89fp189018jsn4c2e0d1cd811"
        }
    })
        .then((response) => response.json())
        .catch((error) => console.error(error.message))

}
