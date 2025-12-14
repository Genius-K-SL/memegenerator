async function generate() {
  const file = document.getElementById("image").files[0];
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(
    "https://us-central1-YOUR_PROJECT.cloudfunctions.net/meme",
    { method: "POST", body: form }
  );

  const { caption } = await res.json();
  draw(file, caption);
}

function draw(file, caption) {
  const img = new Image();
  img.onload = () => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0, 0);
    ctx.font = "bold 42px Impact";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.textAlign = "center";
    ctx.strokeText(caption, c.width / 2, 60);
    ctx.fillText(caption, c.width / 2, 60);
  };
  img.src = URL.createObjectURL(file);
}
