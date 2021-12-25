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
    function createList( data) {
        for (let element of data) {
            const a = document.createElement('a')
            a.dataset.eventId=element.id
            a.textContent=element.title
            a.href="#"
            a.classList.add("list-group-item")
            a.classList.add("list-group-item-action")
            a.addEventListener('click',getEventData)
            list.append(a)
        }
    }
}

function getEventData(event) {
    fetch('http://localhost:3000/events'+ `/${event.target.dataset.eventId}`,)
        .then((response) => response.json())
        .then(displayCurrentDiv)
        .catch((error) => console.error(error.message))
}

//Functions to handle create Event
function displayCreateDiv(event) {
    mainDiv.innerHTML = ""
    mainDiv.innerHTML =
        '<h1>Create New Event</h1>' +
        
        '<form action="#" id="new-event" class="row g-3">' +
     
        '<div class="col-12">'+
        '<label id="event-name"  class="form-label">Event name</label>' +
        ' <input type="text" name="event-name" class="form-control"/> </div>' +
        ' <div class="col-md-6">'+
        ' <label id="start-data"   class="form-label">From date</label>' +
        '<input type="date" name="start-data"  class="form-control"/> </div>' +
        ' <div class="col-md-6">'+
        ' <label id="start-data"  class="form-label">Till date</label>' +
        ' <input type="date" name="end-data" class="form-control" /> </div>' +

        '<input type="submit" value="Submit" class="btn btn-primary" style="background-color: #F9AA33;">' +
      
        ' </form>'
    const form = document.querySelector('form')
    form.addEventListener('submit',createEvent)
}

function createEvent(event) {
    event.preventDefault()
    const input = event.target.querySelector("input[name='event-name']").value
    let start = event.target.querySelector("input[name='start-data']").value
    const end = event.target.querySelector("input[name='end-data']").value
    const interval = getNumberOfDays(start, end) 
    const dateRange =[start]

    for (let i=0;i<interval;i++) {
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
    }
   
    fetch('http://localhost:3000/events',{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then((response) => response.json())
        .then(displayCurrentDiv)
        .catch((error) => console.error(error.message))
}

function displayCurrentDiv(data){
    mainDiv.innerHTML = "" 
    const title = document.createElement('h1')
    title.textContent = data.title
    mainDiv.append(title)
    const summary = document.createElement('div')
    summary.innerHTML =  '<p>The most popular date for this event:' +
           '<span>Wednesday, 1/18/2022</span> selected by 5 particpants from 10</p>'
    mainDiv.append(summary)
    const btn = createBtn("participate", "Participate")
    btn.addEventListener('click', openAvailabilityForm)
    mainDiv.append(btn)
    length
    console.log('data' , data.days)

    function openAvailabilityForm(event) {
        
        const form = document.createElement('form')
        form.id = "availabiloty-form"
        form.addEventListener('submit', updateEventSummary)
        mainDiv.append(form)
        const input = createInput("user-name", "Name")
        form.append(input)
        const div = document.createElement('div')
        form.append(div)
        for (let day of data.days) {
            const a = new Date(day);

            const check  = createCheck(a.toString().slice(0,15))
        div.append(check)
        }

        const submit = createSubmitBtn()
        form.append(submit)
    }
}

function updateEventSummary(event){
    event.preventDefault()

    const userName = event.target.querySelector('input[name="user-name"]').value
    console.log(userName)



    const form = mainDiv.querySelector('#availabiloty-form')
    mainDiv.removeChild(form)
    console.log('data saved')
}


// Create Elements functons
function createHeader(type,text){
    const header = document.createElement(`${type}`)
    header.textContent = text
    return header
}
function createParagraph(text){
    const paragraph = document.createElement(`p`)
    paragraph.textContent = text
    return paragraph
}

function createBtn(btnId, text){
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

function createSubmitBtn(){
        const btn =  document.createElement('input')
        btn.classList.add("btn")
        btn.classList.add("btn-primary")
        btn.type = "submit"
        btn.value="Submit"   
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
    form.className ="mb-3"
    form.addEventListener('submit',requestWeatherData)
    mainDiv.append(form)
    const input = createInput("zipcode", "City")
    form.append(input)
    const submit  = createSubmitBtn()
    form.append(submit)

    // code to ask for location and dates befor request API  
    // topick for my blog
    // requestWeatherAPI().then((data)=> {
    //         console.log(data.response[0].periods[0].maxTempC)
    //     })
    function requestWeatherData(event) {
        event.preventDefault()
        mainDiv.removeChild(form)
        const zipcode =event.target.querySelector("input[name='zipcode']").value.toString()
        //convert name to zip??
        requestWeatherAPI(zipcode).then((data)=> {
             console.log(data.response[0].periods[0].maxTempC)
             displayForecast(data)
        })
    
    }
}


function displayForecast(data){
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
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    for (let day of data.response[0].periods){
        const tr = document.createElement('tr')
        tbody.append(tr)
        const a = new Date(day.timestamp*1000);
        const dayOfWeek = days[a.getDay()]

        tr.innerHTML = `<td>${dayOfWeek}<br>${a.toString().slice(4,15)}</td><td>${day.weather}</td><td>${day.maxTempC} C</td><td>${day.minTempC} C</td>`
        // <th scope="row">1</th>
   
  
        console.log(day.maxTempC)
    }
}


function requestWeatherAPI(zipcode) {
    // location, start,end
  
  return  fetch(`https://aerisweather1.p.rapidapi.com/forecasts/${zipcode}?from=2021-12-30&to=2022-01-19`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "aerisweather1.p.rapidapi.com",
            "x-rapidapi-key": "03cbacb2d6msh147d7e91d53a89fp189018jsn4c2e0d1cd811"
        }
    })
        .then((response) => response.json())
        .catch((error) => console.error(error.message))

}
