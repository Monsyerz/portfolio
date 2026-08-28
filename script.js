window.addEventListener("scroll", function() {

    const scrollPosition = window.scrollY;

    const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

    const scrollProgress = scrollPosition / maxScroll;

    const green = Math.floor(5 + scrollProgress * 26);

    const backgroundColor = `rgb(5, ${green}, 20)`;

    document.body.style.backgroundColor = backgroundColor;
    document.querySelector("header").style.backgroundColor = backgroundColor;

});


const projects=[

    {   
        name:"Expense Tracker",
        language:"Python",
        description: "Tracks expenses ",

    },

        {
        name: "Black Jack Game",
        language: "Python",
        description: "Simple Black Jack game"
    },

    {
        name: "Budget Application",
        language: "Python, Flask",
        description: "Website for tracking my expenses"
    }

];



const projectList = document.getElementById("project-list");

let i = 0;

while (i < projects.length) {

    const projectItem = document.createElement("li");

    projectItem.textContent = projects[i].name;

    projectList.appendChild(projectItem);

    i++;
}
