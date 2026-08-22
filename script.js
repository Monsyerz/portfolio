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