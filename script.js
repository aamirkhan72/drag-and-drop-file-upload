// Selecting required elements
const dropArea = document.querySelector(".drag-area"),
    dragText = dropArea.querySelector("header"),
    button = dropArea.querySelector("button"),
    input = dropArea.querySelector("input"),
    progressContainer = dropArea.querySelector(".progress-container"),
    progressBar = dropArea.querySelector(".progress-bar");

let file; // This is a global variable to store the selected file

// When the button is clicked, trigger the file input
button.onclick = () => {
    input.click();
};

// Handling file selection
input.addEventListener("change", function () {
    file = this.files[0];
    dropArea.classList.add("active");
    showFile();
});

// If user drags a file over the drop area
dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("active");
    dragText.textContent = "Release to Upload File";
});

// If user leaves the dragged file from the drop area
dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
});

// If user drops a file into the drop area
dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    file = event.dataTransfer.files[0];
    showFile();
});

// Function to handle file display
function showFile() {
    let fileType = file.type;
    let validExtensions = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

    if (validExtensions.includes(fileType)) {
        let reader = new FileReader();
        reader.onload = () => {
            let fileURL = reader.result;
            if (fileType.startsWith("image/")) {
                let imgTag = `<img src="${fileURL}" alt="Uploaded Image">`;
                dropArea.innerHTML = imgTag;
            } else if (fileType === "application/pdf") {
                let pdfTag = `<iframe src="${fileURL}" width="100%" height="400px" frameborder="0"></iframe>`;
                dropArea.innerHTML = pdfTag;
            }
        };

        // Show progress bar during file loading
        progressContainer.style.display = "block";
        let loadProgress = 0;
        let interval = setInterval(() => {
            if (loadProgress < 100) {
                loadProgress += 10;
                progressBar.style.width = loadProgress + "%";
            } else {
                clearInterval(interval);
                progressBar.style.width = "100%";
                reader.readAsDataURL(file);
            }
        }, 100);
    } else {
        showError("This file type is not supported.");
    }
}

// Show error message
function showError(message) {
    dropArea.innerHTML = `<p style="color: red;">${message}</p>`;
}
