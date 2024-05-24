function showContent(id) {
    var content = document.getElementById(id + "Content");
    if (content.style.display === "none") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
}