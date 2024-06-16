// Declaraciones iniciales
const image_size = 150;
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let currentStream = null;
let facingMode = "user"; // user: front camera, environment: back camera
let modelo = null;

const classNames = ["Cristiano Ronaldo", "Erling Haaland", "Kylian Mbappe"];

// Carga del modelo
(async () => {
    console.log("Cargando modelo...");
    modelo = await tf.loadLayersModel("model_js/model.json");
    console.log("Modelo cargado");
})();

// Mostrar la cámara
window.onload = function () {
    mostrarCamara();
}

function mostrarCamara() {
    const opciones = {
        audio: false,
        video: {
            facingMode: facingMode,
            width: image_size,
            height: image_size
        }
    };

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(opciones)
            .then(function (stream) {
                currentStream = stream;
                video.srcObject = currentStream;
            })
            .catch(function (err) {
                alert("No se pudo utilizar la cámara :(");
                console.log(err);
            });
    } else {
        alert("No existe la función getUserMedia");
    }
}

// Tomar foto y mostrar predicción
function tomarFoto() {
    ctx.drawImage(video, 0, 0, image_size, image_size);
    mostrarFoto();
    predecir();
}

function mostrarFoto() {
    const image_data = ctx.getImageData(0, 0, image_size, image_size);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(image_data, 0, 0);
}

function predecir() {
    if (modelo != null) {
        const image_data = ctx.getImageData(0, 0, image_size, image_size);
        const tensor = tf.browser.fromPixels(image_data).toFloat().div(tf.scalar(255)).expandDims();
        const resultado = modelo.predict(tensor).dataSync();
        const predicted_class_index = resultado.indexOf(Math.max(...resultado));
        const predicted_class_name = classNames[predicted_class_index];

        // Actualiza el texto de la tarjeta con el resultado de la predicción
        document.getElementById("card-text").innerHTML = predicted_class_name;

        // Actualiza la imagen de la tarjeta
        const cardImage = document.getElementById("card-image");
        cardImage.src = canvas.toDataURL();
    }
}

function cambiarCamara() {
    facingMode = facingMode === "user" ? "environment" : "user";
    mostrarCamara();
}