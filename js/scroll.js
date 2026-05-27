
    document.addEventListener("DOMContentLoaded", function () {
        const storymapContainer = document.querySelector(".storymaps"); // Selects the container
        let lastScrollY = window.scrollY;

        setInterval(() => {
            if (window.scrollY !== lastScrollY) {
                // Check if the user is interacting with the StoryMap container
                if (document.activeElement.tagName === "IFRAME" && storymapContainer.contains(document.activeElement)) {
                    window.scrollTo({ top: storymapContainer.offsetTop - 180, behavior: "instant" }); 
                }
                lastScrollY = window.scrollY;
            }
        }, 1); // Runs every 1ms to detect unwanted scrolling
    });

    // Function to stop the interval
    function stopInterval() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Start the interval initially
    startInterval();

    // Add click event listener to detect clicks outside the iframe
    document.addEventListener("click", function (event) {
        if (!storymapContainer.contains(event.target)) {
            stopInterval(); // Stop the interval if the click is outside the iframe
        } else {
            // Restart the interval if the click is inside the iframe
            if (!intervalId) {
                startInterval();
            }
        }
    });