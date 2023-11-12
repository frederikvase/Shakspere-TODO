var list;
var itemCount;
var workDay;

class List
{
    constructor()
    {
        this.list = []; 

        itemCount = JSON.parse(localStorage.listItems).length;

        // Sort list items from localStorage by due-date
        let storedList = JSON.parse(localStorage.listItems);
        storedList.sort((a,b) => {
            if(a.date > b.date) return 1;
            if(a.date < b.date) return -1;
            return 0; });
        localStorage.listItems = JSON.stringify(storedList);

        for (let i = 0; i < itemCount; i++)
        {
            this.list.push(JSON.parse(localStorage.listItems)[i]);
            showItem(this.list[i]);
        }
    }

    get(index)
    {
        return this.list[index];
    }

    setLocalStorage()
    {
        localStorage.listItems = JSON.stringify(this.list);
    }

    add(item) 
    {
        this.list.push(item);
    }

    remove (index)
    {
        this.list.splice(index, 1);
        localStorage.listItems = JSON.stringify(this.list);
        location.reload();
    }
}

class Item
{
    constructor(arr)
    {
        this.name = arr[0];
        this.time = parseFloat(arr[1]);
        this.date = arr[2];

        this.todaysLabour = 0;
        this.previousLabour = 0;
        this.description = "Text...";
    }
}

function reload()
{
    workDay = true;

    // Initialize undefined localStorage data
    if (typeof (Storage) !== "undefined") 
    {
        if (!localStorage.date)
            localStorage.date = JSON.stringify(new Date().toLocaleDateString("ne"));
        if (!localStorage.listItems)
            localStorage.listItems = JSON.stringify([]);
        if (!localStorage.multiDates || localStorage.multiDates == "")
            localStorage.multiDates = JSON.stringify("04-23-1564");
    }
    list = new List();

    if (JSON.stringify(new Date().toLocaleDateString("ne")) != localStorage.date)
    {
        localStorage.date = JSON.stringify(new Date().toLocaleDateString("ne"));

        for(let i = 0; i < itemCount; i++)
        {
            list.get(i).previousLabour += list.get(i).todaysLabour;
            list.get(i).todaysLabour = 0;
        }

        list.setLocalStorage();
    }

    // --- Labourless days + jQuery ---
    let storageDates = localStorage.multiDates.split(', ');
    let arr = [new Date("04-23-1564")];
    for (let i = 0; i < storageDates.length; i++) 
    {
        if (new Date(storageDates[i]).getTime() >= new Date(localStorage.date).getTime())
        {
            arr.push(new Date(storageDates[i]).toLocaleDateString("ne"));
        }


        if (new Date(storageDates[i]).toLocaleDateString("ne") == JSON.parse(localStorage.date))
        {
            workDay = false;
        }
    }

    $("#datePick").multiDatesPicker(
    {
    minDate: 0,
    addDates: arr,
    onSelect: function () 
    {
        localStorage.multiDates = JSON.stringify(document.getElementById("datePick").value);
        location.reload();
    }
    });

    updateProgress();
    
    // Delete closed list items
    let close = document.getElementsByClassName("close");
    for (let i = 0; i < close.length; i++)
    {
        let div = close[i].parentElement;
        const index = Array.from(div.parentNode.children).indexOf(div);

        close[i].onclick = function() 
        {
            list.remove(index); 
        } 
    }
}

function createItem()
{
    let name = document.getElementById("name").value;
    let time = document.getElementById("time").value;
    let date = new Date(document.getElementById("date").value).toLocaleDateString("ne");

    if (name == '' || time == '' || date == '')
    {
        alert("Fill out the entire thing, you SAUCY boy!");
    }
    else if (typeof(Storage) !== "undefined")
    {
        const element = new Item([name, time, date]);

        // Add the new item to list of items
        list.add(element, itemCount);
        itemCount++;

        // Add new list item to localStorage data
        let copy = localStorage.listItems != "" ? JSON.parse(localStorage.listItems) : [];
        copy.push(element);
        localStorage.listItems = JSON.stringify(copy);

        location.reload();
    }
}

function showItem(task)
{
    let table = document.createElement("table");
    let row = table.insertRow();
    document.getElementById("myUL").appendChild(table);

    // Display date in leftmost cell
    let leftCell = row.insertCell();
    leftCell.textContent = new Date(task.date).toLocaleDateString("en-GB");
    leftCell.style.width = "15%"; 
    row.appendChild(leftCell);

    // Display name in middle cell
    let middleCell = row.insertCell();
    middleCell.textContent = task.name;
    middleCell.style.width = "70%";
    row.appendChild(middleCell);

    // Create a table cell for labour time
    let rightCell = row.insertCell();
    rightCell.textContent = Math.ceil((task.todaysLabour + task.previousLabour) * 100) / 100 + "/" + task.time + " h";
    rightCell.style.width = "15%";
    row.appendChild(rightCell);

    // Append the row to the table
    table.appendChild(row);
    
    // Create 'close' button
    let span = document.createElement("SPAN");
    span.className = "close";
    span.appendChild(document.createTextNode("\u00D7"));
    table.appendChild(span);
}

function updateProgress()
{
    let dailyLabour = 0;
    let timeWorkedToday = 0;

    for (let i = 0; i < itemCount; i++)
    {
        dailyLabour += getTodaysLabour(list.get(i));
        timeWorkedToday += list.get(i).todaysLabour;
    }

    dailyLabour = Math.ceil(dailyLabour * 60 / minTimeStep) / 60 * minTimeStep ;

    console.log("Daily labour: " + dailyLabour);
    console.log("Time worked today: " + timeWorkedToday);


    let myUL = document.getElementById("myUL");
    let childArray = Array.from(myUL.children);

    let unresolvedDailyLabour = dailyLabour;
    
    for (let i = 0; i < itemCount; i++)
    {
        let task = list.get(i);

        let gradientStart = (task.previousLabour + task.todaysLabour) / task.time * 100;
        let gradientLength = 0;

        if (workDay)
        {
            let todo = Math.min(unresolvedDailyLabour, task.time - task.previousLabour);;
            unresolvedDailyLabour -= todo;

            gradientLength = (todo + task.previousLabour) / task.time * 100;
        }
        
        childArray[i].style.background = 
            "linear-gradient(110deg, var(--prog1), var(--prog1) " + gradientStart + "%, rgba(0,0,0,0) " + gradientStart + "%, rgba(0,0,0,0) " + (gradientLength) + "%, var(--prog3) " + (gradientLength) + "%)," + 
            "repeating-linear-gradient(110deg, var(--prog3), var(--prog3) 0.6%, var(--prog2) 0.6%, var(--prog2) 1.2%)";
    } 

    let remainingLabour = Math.round((dailyLabour - timeWorkedToday) * 60);
    
    if (!workDay)
    {
        const shakespeareanPhrases = [
            "Hark! Pray, relish thy day of toillessness.",
            "Rejoice, and find delight in this day free from labour.",
            "May thy day be one of leisure and unburdened toil.",
            "Take pleasure in this day devoid of laborious strife.",
            "Enjoy, as this day unfolds without the weight of labour.",
            "Delight in a day where toil takes its leave, and ease prevails."
        ];
        const randomIndex = Math.floor(Math.random() * shakespeareanPhrases.length);
        document.getElementById("labourTime").innerHTML = shakespeareanPhrases[randomIndex];
    }
    else if (remainingLabour > 0)
    {
        document.getElementById("labourTime").innerHTML = 
            "Thou shouldst labour for " + remainingLabour +
            " minutes this day to finish thy duties in goodly time.";
    }
    else
    {
        const shakespeareanPhrases = [
            "Hail! Thou hast performed well in completing all of thy daily toil.",
            "Well done! Thou hast fulfilled thy daily labour with skill.",
            "Bravo! Thou hast accomplished thy daily toil with excellence.",
            "Thou art praised! Completing all of thy daily toil is a worthy accomplishment.",
            "Aye! Well executed in the fulfillment of thy daily labour."
        ];
        const randomIndex = Math.floor(Math.random() * shakespeareanPhrases.length);
        document.getElementById("labourTime").innerHTML = shakespeareanPhrases[randomIndex];
    }
}

function daysUntil(dateString)
{
    let today = new Date(new Date().toLocaleDateString("ne"));
    let daysToDate = (new Date(dateString).getTime() - today.getTime()) / (1000 * 3600 * 24)

    let labourlessDateArray = localStorage.multiDates.split(', ');
    for (let i = 1; i < labourlessDateArray.length; i++)
    {
        if (new Date(labourlessDateArray[i]).getTime() <= new Date(dateString).getTime())
        {
            daysToDate--;
        }
    }

    return daysToDate; 
}

function getTodaysLabour(task)
{
    let daysLeft = daysUntil(task.date);

    let labourPerDay = (task.time - task.previousLabour) / (daysLeft + 1);

    return labourPerDay + Math.sqrt(daysLeft) * labourPerDay / 6;
}