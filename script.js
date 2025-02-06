document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const fileInput = document.getElementById("fileInput");
    const browseFileButton = document.getElementById("browseFile");
    const progressContainer = document.querySelector(".progress-container");
    const progressBar = document.querySelector(".progress-bar");
    const previewContainer = document.getElementById("preview-container");
    const dragArea = document.querySelector(".drag-area");

    // Toggle Dark Mode
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");
        darkModeToggle.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
    });

    // File Upload (Drag & Drop)
    dragArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dragArea.classList.add("dragging");
    });

    dragArea.addEventListener("dragleave", () => {
        dragArea.classList.remove("dragging");
    });

    dragArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dragArea.classList.remove("dragging");
        handleFiles(e.dataTransfer.files);
    });

    browseFileButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
    });

    // Handle files (preview and progress)
    function handleFiles(files) {
        previewContainer.innerHTML = ""; // Clear previous previews
        progressContainer.style.display = "block";
        progressBar.style.width = "0%";

        Array.from(files).forEach((file) => {
            const preview = document.createElement("div");
            preview.classList.add("preview");

            if (file.type.startsWith("image/")) {
                const img = document.createElement("img");
                img.src = URL.createObjectURL(file);
                img.onload = () => URL.revokeObjectURL(img.src); // Clean up after preview
                preview.appendChild(img);
            } else if (file.type.startsWith("video/")) {
                const video = document.createElement("video");
                video.src = URL.createObjectURL(file);
                video.controls = true;
                preview.appendChild(video);
            } else if (file.type === "application/pdf") {
                const object = document.createElement("object");
                object.data = URL.createObjectURL(file);
                object.type = "application/pdf";
                object.width = "100%";
                object.height = "200px";
                preview.appendChild(object);
            }
            previewContainer.appendChild(preview);

            // Simulate progress bar (for demonstration)
            let progress = 0;
            const interval = setInterval(() => {
                if (progress < 100) {
                    progress += 10;
                    progressBar.style.width = progress + "%";
                } else {
                    clearInterval(interval);
                }
            }, 200);
        });
    }

    // Convert to PDF (only works for images)
    document.getElementById("convertToPDF").addEventListener("click", () => {
        const images = previewContainer.querySelectorAll("img");
        if (images.length === 0) {
            alert("Please upload an image to convert to PDF.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        images.forEach((image, index) => {
            if (index > 0) pdf.addPage();
            pdf.addImage(image.src, 'JPEG', 10, 10, 180, 160);
        });
        pdf.save("converted.pdf");
    });

    // Convert PDF to JPEG
    document.getElementById("convertToJPG").addEventListener("click", () => {
        const pdfFiles = previewContainer.querySelectorAll("object");
        if (pdfFiles.length === 0) {
            alert("Please upload a PDF to convert to JPG.");
            return;
        }
        const file = pdfFiles[0].data;
        const loadingTask = pdfjsLib.getDocument(file);
        loadingTask.promise.then((pdf) => {
            const numPages = pdf.numPages;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                pdf.getPage(pageNum).then((page) => {
                    const viewport = page.getViewport({ scale: 1 });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise.then(() => {
                        const img = new Image();
                        img.src = canvas.toDataURL("image/jpeg");
                        previewContainer.appendChild(img);
                    });
                });
            }
        }).catch((error) => {
            alert("Error loading PDF: " + error);
        });
    });
});
