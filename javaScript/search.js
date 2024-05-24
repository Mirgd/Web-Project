document.addEventListener('DOMContentLoaded', function() {
    // Get the search input element
    const searchInput = document.getElementById('search');

    // Ensure the buttons section is available
    const buttonsSection = document.querySelector('.buttons');

    if (!buttonsSection) {
        console.error('Buttons section not found!');
        return;
    }

    // Function to filter buttons
    function filterButtons() {
        const filter = localStorage.getItem('searchTerm') ? localStorage.getItem('searchTerm').toLowerCase() : '';
        const buttons = buttonsSection.getElementsByTagName('a');

        for (let i = 0; i < buttons.length; i++) {
            const text = buttons[i].textContent || buttons[i].innerText;
            if (text.toLowerCase().indexOf(filter) > -1) {
                buttons[i].style.display = '';
            } else {
                buttons[i].style.display = 'none';
            }
        }
    }

    // Apply filter when the page loads
    filterButtons();

    // Also add an event listener to the search input if it's present on the page
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            localStorage.setItem('searchTerm', searchInput.value);
            filterButtons();
        });
    }
});
