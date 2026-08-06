document.getElementById("uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);

  //without formData.append("files", fileInput.files[0]); because the input name is "files" and FormData automatically includes it
  // const fileInput = document.getElementById("fileInput");
  // const formData = new FormData();
  // formData.append("files", fileInput.files[0]);
  // console.log("FormData:", formData.get("files"));
  
  try {
    const response = await fetch("/api/avatar", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Upload successful:", result);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
});
