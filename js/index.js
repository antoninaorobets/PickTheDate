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


function displayListDiv(event) {
    mainDiv.innerHTML = ""
    
    mainDiv.innerHTML =
        '<h1>Current Events</h1>'
        // '<ul>' +
        // `    <li data-id="1">Steph's party </li>` +
        // '  <li data-id="2">Vacation planing meating</li>' +
        // ' </ul>'
    console.log(event)

    fetch('http://localhost:3000/events')
        .then((response) => response.json())
        .then(createList)
        .catch((error) => console.error(error.message))
        const ul = document.createElement('ul')
        mainDiv.append(ul)
    function createList( data) {
        for (let element of data) {
            const li = document.createElement('li')
            li.dataset.eventId=element.id
            li.textContent=element.title
            ul.append(li)
        }
    }

}


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

    console.log(event)
}
function displayHomeDiv(event) {
    mainDiv.innerHTML = ''
    mainDiv.innerHTML =
        '<h1>Pick the Dates</h1>' +
        '<p>This web app helps friends to pick the best date to meet.</p>' +
        '<button>Create event</button>'
}
