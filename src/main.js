async function searchMovies() {
    const apiKey = '2cb50ae2'; 
    const searchQuery = document.getElementById("searchInput").value.trim();
  
    if (searchQuery === "") {
      alert("Please enter a search query.");
      return;
    }
  
    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movie data');
      }
  
      const data = await response.json();
      displayMovieDetails(data);
    } catch (error) {
      console.error('Error fetching movie data:', error.message);
      alert('An error occurred while fetching movie data. Please try again later.');
    }
}
  
function displayMovieDetails(data) {
    document.getElementById("moviename").textContent = data.Title;
    document.getElementById("poster").innerHTML = `<img src="${data.Poster}" class="center"></img>`;
    document.getElementById("year").textContent = data.Year;
    document.getElementById("rating").textContent = data.imdbRating;
    document.getElementById("director").textContent = data.Director;
    document.getElementById("actors").textContent = data.Actors;
    document.getElementById("area").textContent = data.Language;
    document.getElementById("vid").innerHTML = `<a href="https://www.youtube.com/results?search_query=${data.Title} trailer" target="_blank">Watch Trailer</a>`;
    document.getElementById("genre").textContent = data.Genre;
    document.getElementById("plot").textContent = data.Plot;
    document.getElementById("awards").textContent = data.Awards;
    document.getElementById("writer").textContent = data.Writer;

    addtowatchBtn.setAttribute("onclick", `addToWatchList('${data.imdbID}')`);
    movieStatus(data.imdbID);
  }
  
    document.querySelector("form").addEventListener("submit", function(event) {
        event.preventDefault(); 
        searchMovies(); 
    });

async function addToWatchList(imdbID) {
    const URL = `https://omdbapi.com/?i=${imdbID}&apikey=2cb50ae2`;
    try {
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error(`Error Status: ${response.status}`);
        }
        const data = await response.json();

    let watchlist = localStorage.getItem("watchListMovies");
    watchlist = watchlist ? JSON.parse(watchlist): {};

    if (!watchlist[imdbID]) {
        watchlist[imdbID] = data;
        localStorage.setItem("watchListMovies", JSON.stringify(watchlist));
        console.log(`Movie has been added.`)
        alert('Movie has been added to the watch list.')
    }
    else {
        console.log(`Movie is already in list.`);
    }
   }
    catch (error) {
        console.log(`Failed to fetch data.`)
    }
}

function readLocalStorage() {
    const movieTable = document.getElementById("movieTable");
    movieTable.innerHTML = ""; // Clear existing table

    // Check if there are any movies stored in localStorage
    const storedMovies = localStorage.getItem("watchListMovies");
    if (!storedMovies) {
        movieTable.innerHTML = "<p>No movies added to the watchlist yet.</p>";
        console.log("No movies added to the watchlist yet."); // Log to console as well
        return;
    }

    try {
        const movies = JSON.parse(storedMovies);
        // Create table rows for each movie in the localStorage
        Object.keys(movies).forEach((imdbID) => {
            const movie = movies[imdbID];
            // Create a table row to display movie information
            const row = document.createElement("tr");
            
            // Create table data cells for each movie attribute
            const titleCell = document.createElement("td");
            titleCell.textContent = movie.Title;
            row.appendChild(titleCell);

            const yearCell = document.createElement("td");
            yearCell.textContent = movie.Year;
            row.appendChild(yearCell);

            const ratingCell = document.createElement("td");
            ratingCell.textContent = movie.imdbRating;
            row.appendChild(ratingCell);

            const actionCell = document.createElement("td");
            // Create remove button and dropdown menu
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.classList.add("btn", "btn-danger");
            removeButton.addEventListener("click", function () {
                removeFromList(imdbID);
            });
            actionCell.appendChild(removeButton);
            row.appendChild(actionCell);

            // Append the row to the table
            movieTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error parsing movie data from localStorage:", error);
    }
}

function movieStatus(imdbID) {
    // Get the movie element based on imdbID
    const movieElement = document.getElementById(imdbID);
    
    // Check if the movie element exists
    if (!movieElement) {
        console.error(`Movie with imdbID ${imdbID} not found.`);
        return;
    }

    // Create a select element for choosing status
    const statusSelect = document.createElement("select");
    statusSelect.id = `status_${imdbID}`;

    // Define options for the select element
    const statusOptions = ["Watched", "Planned", "Dropped"];

    // Create option elements for each status option
    statusOptions.forEach(optionText => {
        const option = document.createElement("option");
        option.value = optionText.toLowerCase(); // Use lowercase value for consistency
        option.textContent = optionText;
        statusSelect.appendChild(option);
    });

    // Add event listener to handle status change
    statusSelect.addEventListener("change", function() {
        const selectedStatus = this.value; // Get the selected status
        // Update the movie status in localStorage or perform other actions based on the selected status
        updateMovieStatus(imdbID, selectedStatus);
    });

    // Append the select element to the movie element
    movieElement.appendChild(statusSelect);
}

// Function to read all items from local storage and display them in a table
function readWatchList() {
    const movieTable = document.getElementById("movieTable");
    movieTable.innerHTML = ""; // Clear existing table content

    // Check if there are any movies stored in localStorage
    const storedMovies = localStorage.getItem("watchListMovies");
    if (!storedMovies) {
        movieTable.innerHTML = "<tr><td colspan='4'>No movies added to the watchlist yet.</td></tr>";
        console.log("No movies added to the watchlist yet.");
        return;
    }

    try {
        const movies = JSON.parse(storedMovies);
        // Iterate over each movie in the localStorage and create a table row for it
        Object.keys(movies).forEach((imdbID) => {
            const movie = movies[imdbID];
            // Create a table row to display movie information
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${movie.Title}</td>
                <td>${movie.Year}</td>
                <td>${movie.imdbRating}</td>
                <td>
                    <button class="btn btn-danger" onclick="removeFromList('${imdbID}')">Remove</button>
                </td>`;
            // Append the row to the movieTable
            movieTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error parsing movie data from localStorage:", error);
    }
}

function removeFromList(imdbID) {
    const inMovies = localStorage.getItem("watchListMovies");
    if (inMovies) {
        const movies = JSON.parse(inMovies);

        if (movies.hasOwnProperty(imdbID)) {
            delete movies[imdbID];

            localStorage.setItem("watchListMovies", JSON.stringify(movies));
            readLocalStorage(); // Update the table after removing the movie
            showMessage("Movie has been removed.");
        }
        else {
            showMessage("No such movie");
        }
    }
}

readLocalStorage();
readWatchList();
