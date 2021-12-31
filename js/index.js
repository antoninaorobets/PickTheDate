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

const mainDiv = () => document.querySelector('#main')

function displayHome() {
    mainDiv().innerHTML = ''
    const header = createHeader("h1", "Pick the Day")
    mainDiv().append(header)
    const paragraph1 = createParagraph('This web app helps friends to pick the best date to meet.')
    const paragraph2 = createParagraph("When did you meet your friends last time? Missing them? Don't waste time.  You can select a day that works for all!")
    const paragraph3 = createParagraph("Check the weather first, not to get wet or cold :)")
    mainDiv().append(paragraph1)
    mainDiv().append(paragraph2)
    mainDiv().append(paragraph3)
    const weatherBtn = createBtn("weather-btn", 'Check Weather', "btn btn-primary")
    weatherBtn.addEventListener('click', displayWeather)
    mainDiv().append(weatherBtn)
    const eventBtn = createBtn("create-btn", 'Create Event', "btn btn-primary")
    eventBtn.addEventListener('click', displayCreateDiv)
    mainDiv().append(eventBtn)
}

//Functions to handle Events List
function displayList() {
    mainDiv().innerHTML = ""
    mainDiv().append(createHeader('h1','Current Event'))

    fetch('http://localhost:3000/events')
        .then((response) => response.json())
        .then(createList)
        .catch((error) => console.error(error.message))
    const list = createDiv("list-group")
    mainDiv().append(list)
    function createList(data) {
        for (let element of data) {
            const div = createDiv("btn-group mb-3")
            const a = createRef(element)
            const span = document.createElement('span')
            //span.classList = "badge  "
            const delBtn = createBtn(element.id, "X","btn-outline-secondary")  
            delBtn.addEventListener('click', (event) => deleteEvent(event,element))
            div.appendChild(a)
            span.appendChild(delBtn)
            div.appendChild(span)
            list.append(div)
        }
    }
}
// Fetch functions
function deleteEvent(event, element) {
    console.log(element.id)
    fetch(`http://localhost:3000/events/${element.id}`, {
        method: "DELETE",
    })
        .then((response) => response.json())
        .then(displayList)
        .catch((error) => console.error(error.message))
}

function getEventData(event) {
    fetch('http://localhost:3000/events' + `/${event.target.dataset.eventId}`,)
        .then((response) => response.json())
        .then(displayCurrentEvent)
        .catch((error) => console.error(error.message))
}

//Functions to handle create Event
function displayCreateDiv(event) {
    mainDiv().innerHTML = ""
    const h1 = createHeader('h1', "Create New Event")
    mainDiv().append(h1)
    const form = createForm ("new-event", "row g-3")
    form.addEventListener('submit', createEvent)
    mainDiv().append(form)
    const formName = createInput("col-md-12", "text", "event-name", 'Event name')
    const formStart = createInput("col-md-6 has-validation", "date", "start-data", "From date")
    const formEnd = createInput("col-md-6", "date", "end-data", "Till date")
    const submit = createSubmitBtn('Create Event')
    form.appendChild(formName)
    form.appendChild(formStart)
    form.appendChild(formEnd)
    form.appendChild(submit)
}

function calculateIntervalDates(start, end){  
    const startDate = new Date(start); // convert data from inputs to Date object
    const endDate = new Date(end);
    const oneDay = 1000 * 60 * 60 * 24; // colculate how many meliseconds in one ay
    const diffInTime = endDate.getTime() - startDate.getTime();
    const interval = Math.round(diffInTime / oneDay);
    // for add data for each day from the interwal
    let variable = start
    //create ampty array to add each day to it
   const dateRange = []
    for (let i = 0; i <= interval; i++) {
        let day = new Date(variable)
        day.setDate(day.getDate() + 1)   
        dateRange.push(day.toString().slice(0,15))
        variable = day
    }
    return dateRange
}

function reternDayOfWeek(day){
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const a = new Date(day);
     return days[a.getDay()]
}

function isValidDates(start,end){
    const today = new Date()
    today.setHours(0,0,0,0)
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (startDate.getTime() - today.getTime() < 0) {
   // if (startDate< today) {
        alert( "Start date can't be elier then today " );
        document.querySelector("input[name='start-data']").focus() 
        return false
    }
     if (endDate.getTime() - startDate.getTime() < 0) {
        alert( "End Date can't be elier then start Date " );
        document.querySelector("input[name='end-data']").focus()
        return false
    }
    return true;
}

function createEvent(event) {
    event.preventDefault()
    const input = event.target.querySelector("input[name='event-name']").value
    const start = event.target.querySelector("input[name='start-data']").value.replace(/-/g, '\/')
    const end = event.target.querySelector("input[name='end-data']").value.replace(/-/g, '\/')
    if (!isValidDates(start,end)) {return false}
    const dateRange = calculateIntervalDates(start, end)
    let weather  
       requestWeatherAPI("07030" ,start, end)
       .then((data) => {
        console.log(data.response[0].periods)
        weather=data.response[0].periods
    const formData = {
        "title": `${input}`,
        "start": `${start}`,
        "end": `${end}`,
        "days": dateRange,
        "participants": {},
        "periods": weather
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
        .catch((error) => console.error(error))

    })
}


function displayCurrentEvent(data) {
    console.log('current event data', data)
    mainDiv().innerHTML = ""
    const title = createHeader('h1',data.title)
    mainDiv().append(title)
    if (Object.keys(data.participants).length !== 0) {
        const summaryByDay = summaryParticipantsByDay(data)
        const MaxPtc = summaryByDay.reduce((x, y) => Math.max(x, y), 0)
        const indexDayWithMaxPtc = summaryByDay.indexOf(MaxPtc)
        const dayMaxPtc = data.days[indexDayWithMaxPtc]
        const totalPtc = Object.keys(data.participants).length
        const summaryDiv = document.createElement('div')
        const dayOfWeek = reternDayOfWeek(dayMaxPtc)
        summaryDiv.innerHTML = '<p>The most popular date for this event: ' +
            `<span style="font-weight:bold">${dayOfWeek} ${dayMaxPtc.slice(4, 10)}</span><br> selected by ${MaxPtc} from ${totalPtc} particpants</p>`
        mainDiv().append(summaryDiv)
    } 
    const instruction = document.createParagraph('Press the "Participate" button to select days when you can meet with your friends.')
    const btn = createBtn("participate", "Participate", "btn btn-primary")
    btn.addEventListener('click', (event) => openAvailabilityForm(event, data))
    mainDiv().append(btn)

    const tableSaction = document.createElement('section')
    mainDiv().append(tableSaction)
    if (Object.keys(data.participants).length === 0) {
        tableSaction.textContent = 'Here will be a list of dates when your friends can meet with you. '
    }
    else {
        displayAvailabilityTable(data, tableSaction)
    }
}

function openAvailabilityForm(event, eventData) {
    const ptcBtn = mainDiv().querySelector("#participate")
    mainDiv().removeChild(ptcBtn)
    const tableSaction =mainDiv().querySelector('section')
    mainDiv().removeChild(tableSaction)
   
   const form = createForm('availability-form',"mb-3")
   mainDiv().append(form)
    form.addEventListener('submit', (event) => updateEventSummary(event, eventData))  //doean't work if move to displayCurrentEvent function
  
    const closeBtn = createCloseBtn(eventData)
    form.append(closeBtn)
    const input = createInput("col-md-12","text","user-name", "Name")
    form.append(input)
    const div = document.createElement('div')
    form.append(div)
    for (let day of eventData.days) {
        const check = createCheck(day)
        div.append(check)
    }
    const submit = createSubmitBtn("Submit")
    form.append(submit)
}



function updateEventSummary(event, eventData) {
    event.preventDefault()
    const userName = event.target.querySelector('input[name="user-name"]').value
    const checkList = event.target.querySelectorAll(".form-check")
    const availability = []
    checkList.forEach(check => availability.push(check.querySelector('input').checked))
    const form = mainDiv().querySelector('#availability-form')
    mainDiv().removeChild(form)
    const id = eventData.id

 eventData.participants[userName] = availability
    const data = {
        participants: eventData.participants
    }
    // ? How to ubpage without passin all object
    fetch(`http://localhost:3000/events/${id}`, {
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
    const tableTitle = createHeader('h4', 'Results')
    section.append(tableTitle)
    const table = document.createElement('table')
    table.classList.add("table")
    table.classList.add("table-bordered")
    section.append(table)

    const dates = createTablFooter(eventData.days, 'thead')
    table.append(dates)
      // availability
      const tbody = document.createElement('tbody')
      table.append(tbody)
    //weather

    
    const participants = Object.keys(eventData.participants)
    for (let i = 0; i < participants.length; i++) {
        // for (let i = participants.length-1; i >= 0 ; i--) {
        const tr = document.createElement('tr')
        tbody.append(tr)
        const td = document.createElement('td')
        tr.append(td)
        td.scope = "row"
        td.textContent = participants[i]
        for (let j = 0; j < eventData.days.length; j++) {
            const td = document.createElement('td')
            if (Object.values(eventData.participants)[i][j]) {
                td.style.backgroundColor = "#F9AA33";
            }
            tr.append(td)
        }
    }
    const summaryByDay = summaryParticipantsByDay(eventData)
    const max = summaryByDay.reduce((x, y) => Math.max(x, y), 0)
  //  const sum = createTablFooter(summaryByDay, 'tfoot')
    const sum = document.createElement("tfoot")
    const weather = displayWeatherTable(eventData,sum)
    tbody.append(weather)
   // table.append(sum)
}

function displayWeatherTable(data,tbody){
    const tr = document.createElement('tr')
    
        tbody.append(tr)
        const td = document.createElement('th')
        tr.append(td)
    td.scope = "col"
    td.textContent = "Weather"
    for (let day of data.periods) {
        const td = document.createElement('th')
        td.innerHTML = `${day.maxTempC}C /${day.minTempC}C`
        tr.append(td)
    }
return tr
}

function createTablFooter(arr, param) {
    const numCol = arr.length
    const sum = document.createElement(param)
    const tr = document.createElement('tr')
    sum.append(tr)
    const th = document.createElement('th')
    th.scope = "col"
    th.textContent = ''
    tr.append(th)
    for (let i = 0; i < numCol; i++) {
        const th = document.createElement('th')
        th.scope = "col"
        if (param === 'thead') {
        th.textContent = arr[i].slice(0,10)}
        else{th.textContent = arr[i]}
        tr.append(th)
    }
    return sum
}

function summaryParticipantsByDay(eventData) {
    const avail = Object.values(eventData.participants)
    const numCol = eventData.days.length
    const numRow = Object.keys(eventData.participants).length

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

function editUserRecord(event, participants) {
    console.log(participants)
}
function closeForm(event, eventData){
console.log('close')
const form = document.querySelector('form')
//mainDiv().removeChild(form)
displayCurrentEvent(eventData)
}

// Create DOM Elements functons
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

function createBtn(btnId, text, classArr) {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.id = btnId
  //  btn.classList.add("btn")
    btn.className = classArr
    return btn
}

function createCloseBtn(eventData){
const closeBtn = createBtn('close','',"btn-close ")
closeBtn.ariaLabel = "Close"
closeBtn.addEventListener('click', (event)=> closeForm(event, eventData))
return closeBtn
}

function createRef(element){
    const a = document.createElement('a')
            a.dataset.eventId = element.id
            a.textContent = element.title
            a.href = "#"
            a.classList.add("list-group-item")
            a.classList.add("list-group-item-action")
            a.addEventListener('click', getEventData)
    return a
}

function createForm(id, fClass) {
    const form = document.createElement('form')
    form.id = id
    form.className = fClass
    form.action="#"

    return form
}

function createCheck(text) {
    const checkbox = createDiv("form-check")
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

function createInput(divClass, imputType, inputName, lableText) {
    const div = createDiv(divClass)
    const input = document.createElement('input')
    input.className = "form-control"
    input.type = imputType
    input.name = inputName
    input.required = true
    // input.minLength = '5'
    
    const label = document.createElement('label')
    label.className = "form-label"
    label.id = inputName
    label.textContent = lableText

    div.append(label)
    div.append(input)
    return div
}

function createSubmitBtn(text) {
    const btn = document.createElement('input')
    btn.classList.add("btn")
    btn.classList.add("btn-primary")
    btn.type = "submit"
    btn.value = text
    // style="background-color: #F9AA33;"
    return btn
}

function  createDiv(className){
    const div = document.createElement('div')
    div.className = className;
    return div
}


// Weather forecast 
function displayWeather(event) {
    mainDiv().innerHTML = ''
    const header = createHeader("h1", "Weather Forecast")
    mainDiv().append(header)
    const form =  createForm ('form', "mb-3")   
    form.addEventListener('submit', requestWeatherData)
    mainDiv().append(form)
    const input = createInput("col-md-12", 'text',"zipcode", "City")
    form.append(input)
    input.querySelector('input').pattern="[0-9]{5}"
    const submit = createSubmitBtn("Show Weather")
    form.append(submit)
    function requestWeatherData(event) {
        event.preventDefault()
        mainDiv().removeChild(form)
        const zipcode = event.target.querySelector("input[name='zipcode']").value.toString()
        //convert name to zip??
        const today = new Date()
        const day1 = today.getFullYear().toString()+'-'+(today.getMonth()+1).toString()+"-"+today.getDate().toString()
        const next =  new Date(today.setDate(today.getDate() + 14) )
        const day14 = next.getFullYear().toString()+'-'+(next.getMonth()+1).toString()+"-"+next.getDate().toString()
        console.log(day1, day14)
        requestWeatherAPI(zipcode,day1,day14).then((data) => {
            console.log(data.response[0].periods[0].maxTempC)
            displayForecast(data)
        })
    }
}

function displayForecast(data) {
    // const paragraph3 = createParagraph(``)
    // mainDiv().append(paragraph3)
    const table = document.createElement('table')
    table.className = "table"
    mainDiv().append(table)
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



function requestWeatherAPI(zipcode,start,end) {
    // location, start,end
    const url = `https://aerisweather1.p.rapidapi.com/forecasts/${zipcode}?from=${start}&to=${end}`
    console.log(url)
    return fetch(url, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "aerisweather1.p.rapidapi.com",
            "x-rapidapi-key": "03cbacb2d6msh147d7e91d53a89fp189018jsn4c2e0d1cd811"
        }
    })
        .then((response) => response.json())
        .catch((error) => console.error(error.message))

}


// https://aerisweather1.p.rapidapi.com/forecasts/$07030?from=2022-01-01start&to=2022-01-01