document.getElementById("generate").addEventListener("click", async () => {

  const btn = document.getElementById("generate");
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("spinner");

  // Make button responsive
  btn.classList.add("loading");
  spinner.classList.remove("hidden");
  btnText.textContent = "Uploading...";

  const version = document.getElementById("version").value.trim();
  const fileInput = document.getElementById("binFile");

  if (!version || !fileInput.files.length) {
    alert("Please enter version and select .bin file");
    resetButton();
    return;
  }

  const binFile = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const base64Bin = reader.result.split(",")[1];

      const meta = {
        version,
        filename: `DLFirmware_${version}.bin`,
        uploaded_at: new Date().toISOString()
      };

      // Send to backend
      const response = await fetch("/.netlify/functions/uploadfirmware", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          firmwareFile: base64Bin,
          meta: meta,
        }),
      });

      const data = await response.json();
      const resultBox = document.getElementById("result");
      resultBox.style.display = "block";

      if (data.status === "ok") {
        resultBox.innerHTML = `
          <p><strong>Uploaded Successfully!</strong></p>
          <p>Firmware stored as:<br><code>${data.firmwareKey}</code></p>
          <p>Meta stored as:<br><code>${data.metaKey}</code></p>
        `;
      } else {
        resultBox.innerHTML = `<p style="color:red;">Error: ${data.message}</p>`;
      }

    } catch (err) {
      alert("Upload failed: " + err.message);
    }

    resetButton();
  };

  reader.readAsDataURL(binFile);

  function resetButton() {
    btn.classList.remove("loading");
    spinner.classList.add("hidden");
    btnText.textContent = "🚀 Upload to Database";
  }
});
