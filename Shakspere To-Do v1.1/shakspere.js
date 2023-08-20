// Variables
var dailyLabour = 0;
var workDay = true;

function reload()
{
  initData();

  var storageDates = localStorage.multiDates.split(', ');
  for (var i = 0; i < storageDates.length; i++) 
  {
    if ((new Date(storageDates[i])).toLocaleDateString('en-US') == (new Date()).toLocaleDateString('en-US')) 
    {
      workDay = false;
      break;
    }
  }

  loadData();
  refresh();
  
  // --- Labourless days + jQuery ---
  var storageDates = localStorage.multiDates.split(', ');
  var arr = [new Date("4-23-1564")];
  for (var i = 0; i < storageDates.length; i++) {
    if (new Date(storageDates[i]) >= (new Date()).setDate((new Date()).getDate() - 1))
      arr.push(new Date(storageDates[i]));
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

  // Delete closed list elements
  var close = document.getElementsByClassName("close");
  for (var i = 0; i < close.length; i++)
  {
    var div = close[i].parentElement;
    const index = Array.from(div.parentNode.children).indexOf(div);
    var copy = JSON.parse(localStorage.listItems);

    close[i].onclick = function() {
      deleteElement(copy, index); } 
  }
}

function refresh()
{
  calcEfforts();
  updateProgress();

  var myNodeList = document.getElementsByTagName("TABLE");
  var storedList = JSON.parse(localStorage.listItems);

  for (var i = 0; i < storedList.length; i++)
  {
    var div = myNodeList[i];
    var copy = JSON.parse(localStorage.listItems);

    div.classList.toggle('checked', copy[i][4] + copy[i][3] >= Number(copy[i][1]));

    if (dateDiffInDays(new Date(), copy[i][2]) <= 0) 
      deleteElement(copy, index);
  }
}

function initData()
{
  if (typeof (Storage) !== "undefined") 
  {
    if (!localStorage.date)
      localStorage.date = JSON.stringify(new Date());
    if (!localStorage.listItems)
      localStorage.listItems = JSON.stringify([]);
    if (!localStorage.dailyLabour)
      localStorage.dailyLabour = 0;
    if (!localStorage.dailyLabourTime)
      localStorage.dailyLabourTime = 0;
    if (!localStorage.multiDates || localStorage.multiDates == "")
      localStorage.multiDates = JSON.stringify("04/23/1564");
  }
}

function loadData()
{
  var d = JSON.parse(localStorage.date); 
  var storedList = JSON.parse(localStorage.listItems);

  // --- Date ---
  if (dateDiffInDays(new Date(), d) - 1 != 0)
  {        
    localStorage.date = JSON.stringify(new Date());
    localStorage.dailyLabour = JSON.stringify(0);

    for(var i = 0; i < storedList.length; i++)
    {
      storedList[i][3] = storedList[i][3] + storedList[i][4];
      storedList[i][4] = 0;
    }
  }
    
  // --- ListItems ---
  storedList.sort((a,b) => {
      if(a[2] > b[2]) return 1;
      if(a[2] < b[2]) return -1;
      return 0; });

  localStorage.listItems = JSON.stringify(storedList);

  for (var i = 0; i < storedList.length; i++)
  {
    storedList[i][5] = i;        
    addElement(storedList[i]);
  }  
}

function newElement()
{
  var name = document.getElementById("name").value;
  var time = document.getElementById("time").value;
  var date = document.getElementById("date").value;

  if (name === '' || time === '' || date === '')
    alert("Fill out the entire thing, you SAUCY boy!");
  else if (typeof(Storage) !== "undefined")
  {
    const element = [name, time, date, 0, 0, "Text..."];
    var copy;
    if(localStorage.listItems != "")
      copy = JSON.parse(localStorage.listItems);
    else
      copy = []

    copy.push(element);
    localStorage.listItems = JSON.stringify(copy);

    localStorage.dailyLabourTime = JSON.stringify(JSON.parse(localStorage.dailyLabourTime) + calcEffort(element));

    location.reload();
  }
}

function addElement(element)
{
  const name = element[0];  
  var table = document.createElement("table");

  // Create a table row
  var row = table.insertRow();

  // Create a table cell for the content
  var middleCell = row.insertCell();
  middleCell.textContent = name;
  middleCell.style.width = "70%"; // Adjust the percentage as needed

  // Create a table cell for the dates
  var leftCell = row.insertCell();
  
  var dateParts = element[2].split('-'); // Split the date string by "-"
  
  var year  = parseInt(dateParts[0], 10); 
  var month = parseInt(dateParts[1], 10); 
  var day   = parseInt(dateParts[2], 10); 

  leftCell.textContent = day + "/" + month + "/" + year;
  leftCell.style.width = "15%"; 

  // Create a table cell for labour time
  var rightCell = row.insertCell();
  rightCell.textContent = Math.ceil((Number(element[3]) + Number(element[4])) * 100) / 100 + "/" + element[1] + " h";
  rightCell.style.width = "15%";

  // Append cells to the row
  row.appendChild(leftCell);
  row.appendChild(middleCell);
  row.appendChild(rightCell);

  // Append the row to the table
  table.appendChild(row);
  table.classList.toggle("checked");
  
  document.getElementById("myUL").appendChild(table);
 
  // Clear input field
  document.getElementById("name").value = "";
  document.getElementById("time").value = "";
  document.getElementById("date").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);

  table.appendChild(span);

  // --------
}

function updateProgress()
{
  // --- Update Progress Bars
  dailyLabour = JSON.parse(localStorage.dailyLabourTime) - JSON.parse(localStorage.dailyLabour);

  var myUL = document.getElementById("myUL");
  var childArray = Array.from(myUL.children);

  for (var i = 0; i < childArray.length; i++) 
  {
    var element = JSON.parse(localStorage.listItems)[i];

    const daysLeft = dateDiffInDays(new Date(), element[2]);
    const progress = parseFloat((element[3] + element[4]) / element[1] * 100);

    var n = 0;
    if (workDay) 
    {
      n = Math.max(Math.min(dailyLabour, element[1] - element[3] - element[4]), 0);
      dailyLabour = Math.max(dailyLabour - n, 0);
      n = parseFloat(n / element[1] * 100);
    }
    
    // Update CSS
    childArray[i].style.background = "linear-gradient(110deg, var(--prog1), var(--prog1) " + progress + "%, rgba(0,0,0,0) " + progress + "%, rgba(0,0,0,0) " + (progress + n) + "%, var(--prog3) " + (progress + n) + "%), repeating-linear-gradient(110deg, var(--prog3), var(--prog3) 0.6%, var(--prog2) 0.6%, var(--prog2) 1.2%)";
  }

  // --- Update text ---
  if (!workDay) 
  {
    document.getElementById("labourTime").innerHTML = "Fare thee well on thy day of leisure";
    return;
  }
  

  var labour = Math.round((JSON.parse(localStorage.dailyLabourTime) - JSON.parse(localStorage.dailyLabour)) * 100) / 100;
  if (labour <= 0)
  {
    document.getElementById("labourTime").innerHTML = ("Thou hast no further labour for this day.");
    return;
  }

  if (labour > 1)
    document.getElementById("labourTime").innerHTML =
      ("Thou shouldst labour for " +
        Math.ceil(labour * 10) / 10 +
        " hours this day to finish thy duties in goodly time.");
  else if (labour > 0)
    document.getElementById("labourTime").innerHTML =
      ("Thou shouldst labour for " +
        Math.ceil(labour * 60) +
        " minutes this day to finish thy duties in goodly time.");
}

function calcEfforts()
{
  var copy = JSON.parse(localStorage.listItems);
  var totalWork = 0;

  for (var i = 0; i < copy.length; ++i)
    totalWork += (calcEffort(copy[i]));

  localStorage.dailyLabourTime = JSON.stringify(totalWork);
}

function calcEffort(element)
{
  b = element[2];
  var   daysLeft = dateDiffInDays(new Date(), element[2]);
  const timeLeft = element[1] - element[3];

  var dates = localStorage.multiDates.split(', ');

  for (var i = 1; i < dates.length; i++) 
  {
    if (new Date(dates[i]) < new Date(b[0] * 1000 + b[1] * 100 + b[2] * 10 + b[3] * 1, b[5] * 10 + b[6] * 1 - 1, b[8] * 10 + b[9] * 1 + 1))
      daysLeft--;
  }
  
  if (daysLeft > 0 && timeLeft > 0)
    return timeLeft / (daysLeft + 1.61803 - Math.sqrt(daysLeft + 1.61803));

  return 0;
}

function dateDiffInDays(a, b) 
{
  const msPerDay = 1000 * 60 * 60 * 24;

  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const d2 = new Date(b[0]*1000 + b[1]*100 + b[2]*10 + b[3]*1, b[5]*10 + b[6]*1 - 1, b[8]*10 + b[9]*1 + 1);

  return Math.floor((d2 - d1) / msPerDay);
}

var coll = document.getElementsByClassName("collapsible");
coll[1].nextElementSibling.style.display = "block";

for (var i = 0; i < coll.length; i++)
{
  coll[i].addEventListener("click", function() 
  {
    this.classList.toggle("active");
    var content = this.nextElementSibling;

    if (content.style.display == "block")
      content.style.display = "none";
    else
      content.style.display = "block";
  });
}

function deleteElement(copy, index)
{
  localStorage.dailyLabour = JSON.stringify(JSON.parse(localStorage.dailyLabour) - copy[index][4]);
  localStorage.dailyLabourTime = JSON.stringify(JSON.parse(localStorage.dailyLabourTime) - calcEffort(copy[index]));

  copy.splice(index, 1);
  localStorage.listItems = JSON.stringify(copy);

  location.reload();
}

switch (new Date().getDay()) {
  case 0: // Sunday
    document.getElementById("dailySonnet").innerHTML =
      "A list of tasks, a daily need,\nTo keep our thoughts in order;\nWith every box that's ticked indeed,\nWe march towards life's border.";
    break;
  case 1: // Monday
    document.getElementById("dailySonnet").innerHTML =
      "A task undone is a tale not told,\nA story not yet spun,\nBut make a list, and cross them off,\nAnd the tale shall be well begun.";
    break;
  case 2: // Tuesday
    document.getElementById("dailySonnet").innerHTML =
      "A bounty of beauty doth it bring,\nThis list of tasks, a wondrous thing,\nA guide to guide us, day by day,\nTowards a life of peace and play.";
    break;
  case 3: // Wednesday
    document.getElementById("dailySonnet").innerHTML =
      "A task unfinished doth sit upon my mind,\nA nagging thought that will not let me be,\nA list of duties I must daily find,\nThat I may take and set my spirit free."/*\n\nTo-do lists, thou art a wondrous thing,\nA means to order thoughts and clear the brain,\nA way to keep my thoughts from aimlessly wandering,\nAnd focus on the goals I must attain.\n\nYet sometimes thou dost bring me such disdain,\nA constant reminder of what must be done,\nA source of stress and endless frustration,\nAnd endless duties to be won.\n\nYet still I write thee, oh To-Do lists,\nFor thou art key to my success persists."*/;
    break;
  case 4: // Thursday
    document.getElementById("dailySonnet").innerHTML =
      "An inventory of our intent\nTo conquer all before the morn\nA record that we must prevent\nFrom turning into a forlorn.";
    break;
  case 5: // Friday
    document.getElementById("dailySonnet").innerHTML =
      "When worries weigh and troubles grow,\nA To-Do list is all I need to know.\nIt brings a sense of calm and ease,\nAnd helps me tackle tasks with glee.";
    break;
  case 6: // Saturday
    document.getElementById("dailySonnet").innerHTML =
      "Oh To-Do lists, so full of might\nThy power to bring order and delight!\nThou art the guide to tasks untold,\nBringing joy to all, young and old.";
    break;
}

