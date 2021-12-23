document.addEventListener('DOMContentLoaded', init)
function init(event) {
    const home = document.querySelector('#home')
    home.addEventListener('click', displayHomeDiv)
    const list = document.querySelector('#event-list')
    list.addEventListener('click', displayListDiv)
    const create = document.querySelector('#create-event')
    create.addEventListener('click', displayCreateDiv)


}
const mainDiv = document.querySelector('#main')

function displayHomeDiv(event) {
    mainDiv.innerHTML = ''
    mainDiv.innerHTML =
        '<h1>Pick the Dates</h1>' +
        '<p>This web app helps friends to pick the best date to meet.</p>' +
        '<button>Create event</button>'
}

//Functions to handle Events List
function displayListDiv(event) {
    mainDiv.innerHTML = ""
    
    mainDiv.innerHTML =
        '<h1>Current Events</h1>'
    console.log(event)

    fetch('http://localhost:3000/events')
        .then((response) => response.json())
        .then(createList)
        .catch((error) => console.error(error.message))
        const list = document.createElement('ul')
        list.classList.add("list-group")
        mainDiv.append(list)
    function createList( data) {
        for (let element of data) {
            const li = document.createElement('li')
            li.dataset.eventId=element.id
            li.textContent=element.title
            li.classList.add("list-group-item")
            list.append(li)
        }
    }
}

//Functions to handle create Event
function displayCreateDiv(event) {
    mainDiv.innerHTML = ""
    mainDiv.innerHTML =
        '<h1>Create New Event</h1>' +
        '<form action="#" id="new-event">' +
        '<label id="event-name">Event name</label>' +
        ' <input type="text" name="event-name" />' +
        ' <label id="start-data">From</label>' +
        '<input type="date" name="start-data" />' +
        ' <label id="start-data">Till</label>' +
        ' <input type="date" name="end-data" />' +
        '<input type="submit" value="Submit" style="background-color: #F9AA33;">' +
        ' </form>'
    const form = document.querySelector('form')
    form.addEventListener('submit',createEvent)
}

function createEvent(event) {
    event.preventDefault()
    const input = event.target.querySelector("input[name='event-name']").value
    const start = event.target.querySelector("input[name='start-data']").value
    const end = event.target.querySelector("input[name='end-data']").value

    const formData = {
    
        "title": `${input}`,
        "start": `${start}`,
        "end": `${end}`,
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
        .then((data) => console.log(data))
        .catch((error) => console.error(error.message))
}
