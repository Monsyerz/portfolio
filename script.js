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


const projects = [

    {
        name: "Expense Tracker",
        language: "Python",
        description: "Tracks expenses",
        github: "https://github.com/Monsyerz/ShopTracker"
    },

    {
        name: "Black Jack Game",
        language: "Python",
        description: "Simple Black Jack game",
        github: "https://github.com/Monsyerz/blackjack_game"
    },

    {
        name: "Budget Application",
        language: "Python, Flask",
        description: "Website for tracking my expenses",
        github: "https://github.com/Monsyerz/tracking_household_app"
    }

];


const projectList = document.getElementById("project-list");

let i = 0;

while (i < projects.length) {

    const currentProject = projects[i];

    const projectItem = document.createElement("li");
    const projectLanguage = document.createElement("p");
    const projectDescription = document.createElement("p");
    const projectLink = document.createElement("a");

    projectItem.className = "project-item";
    projectLanguage.className = "project-language";
    projectDescription.className = "project-description";
    projectLink.className = "project-link";


    projectItem.textContent = currentProject.name;
    projectLanguage.textContent = currentProject.language;
    projectDescription.textContent = currentProject.description;
    projectLink.textContent = "Check it out on GitHub";
    projectLink.href = currentProject.github;
    projectLink.target = "_blank";
    projectLink.rel = "noopener noreferrer";

    projectItem.appendChild(projectLanguage);
    projectItem.appendChild(projectDescription);
    projectItem.appendChild(projectLink);

    projectList.appendChild(projectItem);


    i++;
}