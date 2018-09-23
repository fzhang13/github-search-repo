//loads check functions
window.onload = function () {
    submit();
    search();
}
//loads onSubmit function when enter is pressed
function submit() {
    document.querySelector('button').onclick = () => {
        makeRequest(document.querySelector('input').value);
    }
}

//clearsData when search field is cleared of entry
function search() {
    document.querySelector('input').oninput = () => {
        if (document.querySelector('input').value.length == 0)
            clearData(document.querySelector('article table'));
    };

    document.querySelector('input').addEventListener('keyup', (event) => {
        if (event.keyCode === 13)
            makeRequest(document.querySelector('input').value);
    });
}

//clear data function to remove all searched data
function clearData(table) {
    let thead = table.querySelector('thead');
    if (thead.firstChild)
        thead.removeChild(thead.firstChild);

    let tbody = table.querySelector('tbody');
    while (tbody.firstChild)
        tbody.removeChild(tbody.firstChild);
}

//searchs for repositories on github and parses back results of valid.
function makeRequest(string) {
    httpRequest = new XMLHttpRequest
    let url = 'https://api.github.com/search/repositories?q=' + string;
    httpRequest.onreadystatechange = Table;
    httpRequest.open('GET', url, true);
    httpRequest.send();
}

//creates a th for both tables upon display
function tHead(thead) {
    let trow = document.createElement('tr');
    let th;

    th = document.createElement('th');
    th.textContent = 'Name';
    trow.appendChild(th);

    th = document.createElement('th');
    th.textContent = 'Language';
    trow.appendChild(th);

    th = document.createElement('th');
    th.textContent = 'Latest tag';
    trow.appendChild(th);

    thead.appendChild(trow);
}

//generate table with size specified
function generateTable(size) {
    let jsData = apiData(JSON.parse(httpRequest.responseText).items,
        size);
    for (let i = 0; i < jsData.length; ++i)
        generateRow(jsData[i]);
}
//generate tables
function Table() {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        tHead(document.querySelector('article thead'));
        generateTable(10);
    }
}

function apiData(jsData, size) {
    jsData = jsData.splice(0, size);
    return jsData;
}

//generates repo names and associate a link with url to repo
function repoName(name, url, tr) {
    let td = document.createElement('td');
    let repoName = document.createElement('a');
    repoName.href = url;
    repoName.textContent = name;
    td.appendChild(repoName);
    tr.appendChild(td);
}

//generates the language the code is written in
function repoLanguage(language, tr) {
    let td = document.createElement('td');
    td.textContent = language;
    tr.appendChild(td);
}

//makes another api request to generate tags_url to the latest tags associate with the repo
function repoTags(url, tr) {
    let td = document.createElement('td');

    let tagsRequest = new XMLHttpRequest;
    tagsRequest.onreadystatechange = () => {
        if (tagsRequest.readyState == 4 && tagsRequest.status == 200) {
            let jsData = JSON.parse(tagsRequest.responseText);
            if (jsData.length == 0)
                td.textContent = '-';
            else
                td.textContent = jsData[0].name;
        }
    };
    tagsRequest.open('GET', url);
    tagsRequest.send();

    tr.appendChild(td);
}

//generates a full row that includes, name, language, tags and add column
function generateRow(dataRow) {
    let tr = document.createElement('tr');

    repoName(dataRow.full_name, dataRow.html_url, tr);
    repoLanguage(dataRow.language, tr);
    repoTags(dataRow.tags_url, tr);
    addFavorite(tr);

    document.querySelector('tbody').appendChild(tr);
}

//stores favorite repos
favorites = [];

//adding repos to favorites
function addFavorite(tr) {
    for (let i = 0; i < favorites.length; ++i)
        if (favorites[i].firstChild.textContent == tr.firstChild.textContent)
            return;

    let td = document.createElement('td');
    td.textContent = 'Add';
    td.classList.add('addfavorites');

    td.onclick = () => {
        tr.removeChild(tr.lastChild);
        let trClone = tr.cloneNode(true);
        removeFavorite(trClone);
        favorites.push(trClone);
        favoriteTable();
    };
    tr.appendChild(td);
}


function favoriteTable() {
    clearData(document.querySelector('aside table'));
    if (favorites.length >= 2) {
        tHead(document.querySelector('aside thead'));
        for (let i = 0; i < favorites.length; ++i)
            document.querySelector('aside tbody').appendChild(
                favorites[i]);
    }
}

//removing repos from favorites
function removeFavorite(tr) {
    let td = document.createElement('td');
    td.textContent = 'Remove';
    td.classList.add('removefavorites');
    td.onclick = () => {
        favorites.splice(favorites.indexOf(tr), 1);
        favoriteTable();
        clearData(document.querySelector('article table'));
        Table();
    };
    tr.appendChild(td);
}






