var modal = document.getElementById("myModal");
var index = -1;

// Open modal if a task has been clicked
document.querySelector('ul').addEventListener('click', function(ev) 
{
  if (ev.target.tagName == 'TD') 
  {
    showModal(findParentTable(ev.target));
  }
}, false);

// Close the modal, when the close button has been pressed
document.getElementsByClassName("closeModal")[0].onclick = function() 
{ 
    hideModal(); 
}

function findParentTable(element) 
{
    while (element && element.tagName != 'TABLE')
        element = element.parentNode;
    return element;
}

function showModal(table)
{
    modal.style.display = "block";

    index = Array.from(table.parentNode.children).indexOf(table);
    let task = list.get(index);

    document.getElementById("tasktitle").innerHTML   = "<b>" + task.name + "</b>";
    document.getElementById("description").innerHTML = task.description;

    document.getElementById("name_m").value = task.name;
    document.getElementById("time_m").value = task.time;
    document.getElementById("date_m").value = task.date;

    const workInHours = (task.todaysLabour + task.previousLabour) * 60;
    document.getElementById("slider").value = workInHours;
    
    updateModalSlider();
}

function hideModal() 
{
    list.get(index).description = document.getElementById("description").innerHTML;
    list.setLocalStorage();;

    modal.style.display = "none";

    location.reload();
}

function updateModalSlider()
{
    let slider = document.getElementById("slider");
    let task = list.get(index);

    slider.max =  60 * task.time;
    slider.step = minTimeStep;

    let time = slider.value / 60;
    document.getElementById("slider").value = slider.value;

    // Update text
    const workHours = Math.floor(time * 100) / 100;
    const hours = Math.floor(workHours);
    const minutes = Math.ceil((workHours - Math.floor(workHours)) * 60);

    let timeSpent = timeToString(hours, minutes)
    let totalTime = timeToString(Math.floor(task.time), Math.floor((task.time - Math.floor(task.time)) * 60));

    document.getElementById("sliderlabel").innerHTML = "Thou hast spent a sum total of " + timeSpent + " of " + totalTime + " on this undertaking";

    list.get(index).todaysLabour = time - task.previousLabour;
    list.setLocalStorage();

    updateProgress();
}

function updateModalTime()
{
    let time = document.getElementById("time_m").value;
    if (isNaN(time) || time == 0)
    {
        return;
    }

    list.get(index).time = time;
    list.setLocalStorage();

    updateModalSlider();
}

function updateModalTitle()
{
    list.get(index).name = document.getElementById("name_m").value;
    document.getElementById("tasktitle").innerHTML = "<b>" + document.getElementById("name_m").value + "</b>";

    list.setLocalStorage();;
}

function updateModalDate()
{
    list.get(index).date = document.getElementById("date_m").value;
    list.setLocalStorage();;
}

// Convert the time (hour and minute) into a string
function timeToString(h, m)
{
    let res = "no time";
    if (h != 0 || m != 0)
        res=(h != 0 ? h + " hour" + (h == 1 ? " " : "s ") : "") + 
            (m != 0 ? (h != 0 ? "and " : "") + m + " minute" + 
            (m == 1 ? "" : "s") : "");
  return res;
}