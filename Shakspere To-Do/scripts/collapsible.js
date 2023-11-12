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