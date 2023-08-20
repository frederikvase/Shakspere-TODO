// --- List Items ---
// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("TABLE");
for (var i = 0; i < myNodelist.length; i++)
{
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Check if list item has been clicked
var list = document.querySelector('ul');
var index = -1;
list.addEventListener('click', function(ev) 
{
  if (ev.target.tagName === 'TD') 
  {
    modal.style.display = "block";

    var table = findParentTable(ev.target)

    // Get list item and index
    index = Array.from(table.parentNode.children).indexOf(table);
    var lsElement = JSON.parse(localStorage.listItems)[index];

    // Set title and values
    document.getElementById("tasktitle").innerHTML = "<b>" + lsElement[0] + "</b>";

    document.getElementById("name_m").value = lsElement[0];
    document.getElementById("time_m").value = lsElement[1];
    document.getElementById("date_m").value = lsElement[2];
    document.getElementById("description").innerHTML = lsElement[5];

    // Set the progress of the slider
    const sliderValue = (lsElement[3] + lsElement[4]) / lsElement[1] * 100
    document.getElementById("my-slider").value = sliderValue;
    updateSlider(sliderValue);
  }
}, false);

// Function to find the parent table element of a given element
function findParentTable(element) {
  while (element && element.tagName !== 'TABLE') {
    element = element.parentNode;
  }
  return element;
}

// --- Modal Stuff --- 
var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var span2 = document.getElementsByClassName("close2")[0];
var workInHours = 0, startWorkInHours = 0;

// Close the modal
span2.onclick = function() { hideModal(); }
window.onclick = function(event) { if (event.target == modal)  hideModal(); }

function hideModal() 
{
  var copy = JSON.parse(localStorage.listItems);
  copy[index][5] = document.getElementById("description").innerHTML;
  localStorage.listItems = JSON.stringify(copy);

  modal.style.display = "none";

  location.reload();
}

// Add time to the slider
function addTime(m)
{
  const t = 100 * (m / 60) / JSON.parse(localStorage.listItems)[index][1];
  var sliderValue = Math.min(100, parseFloat(document.getElementById("my-slider").value) + t);
  document.getElementById("my-slider").value = sliderValue;
  refresh();
  updateSlider(sliderValue);
}

// Update the slider
function updateSlider(value)
{
  var copy = JSON.parse(localStorage.listItems);
  workInHours = value * copy[index][1] / 100;

  if (copy[index][i] != document.getElementById("time_m").value && document.getElementById("time_m").value != "") 
  {
    value = workInHours / document.getElementById("time_m").value * 100;
    document.getElementById("my-slider").value = value;
    copy[index][1] = document.getElementById("time_m").value;
  }
  var modalListItem = copy[index];

  // Update text
  const workHours = Math.floor(workInHours * 100) / 100;
  const hours = Math.floor(workHours);
  const minutes = Math.ceil((workHours - Math.floor(workHours)) * 60);

  var timeSpent = timeToString(hours, minutes)
  var totalTime = timeToString(Math.floor(modalListItem[1]), Math.floor((modalListItem[1] - Math.floor(modalListItem[1])) * 60));

  document.getElementById("sliderlabel").innerHTML = "Thou hast spent a sum total of " + timeSpent + " of " + totalTime + " on this undertaking";
  localStorage.dailyLabour = JSON.stringify(JSON.parse(localStorage.dailyLabour) + workInHours - copy[index][3] - copy[index][4]);

  document.getElementById("tasktitle").innerHTML = "<b>" + document.getElementById("name_m").value + "</b>";

  // Update LocalStorage Data
  copy[index] = [
    document.getElementById("name_m").value,  // Task Name
    modalListItem[1],                         // Task Time
    document.getElementById("date_m").value,  // Due Date
    copy[index][3],                           // Time worked on previous days
    workInHours - copy[index][3]];            // Time worked today

  localStorage.listItems = JSON.stringify(copy);
  
  refresh();
}

// Convert the time (hour and minute) into a string
function timeToString(h, m)
{
  var res="no time";
  if (h!=0||m!=0)
    res = (h != 0 ? h + " hour" + (h == 1 ? " " : "s ") : "") + (m != 0 ? (h != 0 ? "and " : "") + m + " minute"+(m == 1 ? "" : "s") : "");
  return res;
}