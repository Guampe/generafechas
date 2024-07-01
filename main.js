document.addEventListener('DOMContentLoaded', () => {
    const inputContainer = document.getElementById('input-container');
    inputContainer.appendChild(createDateInput());

    // Cargar imágenes del carrusel al cargar la página
    loadCarouselImages();

    // Añadir eventos a los botones del carrusel
    document.getElementById('prevButton').addEventListener('click', () => scrollCarousel(-1));
    document.getElementById('nextButton').addEventListener('click', () => scrollCarousel(1));
});

function createDateInput() {
    const newInput = document.createElement('div');
    newInput.className = 'birthday-input';
    newInput.innerHTML = `
        <input type="text" class="username" placeholder="Usuario de Instagram">
        <select class="day">
            ${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
        </select>
        <select class="month">
            ${["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
                .map((month, i) => `<option value="${i + 1}">${month}</option>`).join('')}
        </select>
    `;
    return newInput;
}

function addDateInput() {
    const inputContainer = document.getElementById('input-container');
    inputContainer.appendChild(createDateInput());
}

function calculateCommonBirthday() {
    const dateInputs = document.querySelectorAll('.birthday-input');
    const dates = [];
    const users = [];
    dateInputs.forEach(input => {
        const day = input.querySelector('.day').value;
        const month = input.querySelector('.month').value;
        let username = input.querySelector('.username').value.trim();
        if (day && month) {
            dates.push(`${day}/${month}`);
            if (!username.startsWith('@')) {
                username = '@' + username;
            }
            users.push(username);
        }
    });

    const result = findCommonBirthday(...dates);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const resultText = `${result.day} de ${monthNames[result.month - 1]}`;
    document.getElementById('result').textContent = resultText;

    // Mostrar sección de generación de imagen
    document.getElementById('generate-image-container').style.display = 'block';
    document.getElementById('generate-button').style.display = 'block';

    // Guardar resultado y usuarios globalmente para la generación de la imagen
    window.commonBirthdayResult = resultText;
    window.commonBirthdayUsers = users;
}

function dateToDayOfYear(date) {
    const [day, month] = date.split("/").map(Number);
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
        dayOfYear += daysInMonths[i];
    }
    return dayOfYear;
}

function dayOfYearToDate(dayOfYear) {
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let month = 0;
    while (dayOfYear > daysInMonths[month]) {
        dayOfYear -= daysInMonths[month];
        month++;
    }
    return { day: dayOfYear, month: month + 1 };
}

function findCommonBirthday(...dates) {
    if (dates.length === 0) {
        return "No se proporcionaron fechas";
    }

    const daysOfYear = dates.map(dateToDayOfYear);
    const averageDay = Math.round(daysOfYear.reduce((a, b) => a + b, 0) / daysOfYear.length);
    return dayOfYearToDate(averageDay);
}

function loadCarouselImages() {
    const carousel = document.querySelector('.carousel');
    const imageFiles = [
        'Graffitiwallpaper.jfif',
        'RealHastaLaMuertewallpaper.jfif',
        '8ee957c0-7235-41d2-9461-d97f71deb9c0.jfif',
        'Disney Collection Toddler Unisex Crew Neck Mickey and Friends Mickey Mouse Short Sleeve Graphic T-Shirt _ Blue _ Regular 3t _ Shirts + Tops Graphic T-shirts.jfif',
        'NuestraPandilla.jfif',
        '7bf8e961-d1ac-4222-8791-b95df318c506.jfif',
        '1.jfif',
        '0fe02b02-23fa-478d-90e7-a3e1168d5f7f.jfif'
    ];

    imageFiles.forEach(file => {
        const url = `imagenes/${file}`;
        const img = document.createElement('img');
        img.src = url;
        img.onclick = () => selectImage(url, img);
        img.onload = () => {
            img.width = 108;
            img.height = 108;
        };
        carousel.appendChild(img);
    });
}

function scrollCarousel(direction) {
    const carousel = document.querySelector('.carousel');
    const scrollAmount = direction * 200; // Cantidad de desplazamiento en píxeles
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function selectImage(url, imgElement) {
    const images = document.querySelectorAll('.carousel img');
    images.forEach(img => img.classList.remove('selected'));
    imgElement.classList.add('selected');

    // Guardar URL de la imagen seleccionada
    window.selectedImageUrl = url;
}

function generateImageWithMessage() {
    const resultText = window.commonBirthdayResult;
    const users = window.commonBirthdayUsers;
    const imageUrl = window.selectedImageUrl || window.customImageUrl;
    const specialTitle = document.getElementById('specialTitle').value.trim();

    if (!imageUrl) {
        alert('Por favor, selecciona una imagen del carrusel o carga una personalizada.');
        return;
    }

    if (!specialTitle) {
        alert('Por favor, ingresa un título o nombre para tu fecha especial.');
        return;
    }

    // Crear contenedor para la imagen y el botón de descarga
    const resultImage = document.getElementById('resultImage');
    resultImage.innerHTML = ''; // Limpiar contenido previo

    // Crear enlace de descarga
    const downloadLink = document.createElement('a');
    downloadLink.href = '#'; // Enlace temporal, se actualizará luego
    downloadLink.download = 'cumpleanos_comun.png';
    downloadLink.textContent = 'Descargar imagen';
    downloadLink.className = 'download-button';
    resultImage.appendChild(downloadLink);

    // Crear imagen base
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
        // Ajustar el tamaño del canvas basado en el tamaño de la pantalla
        const maxCanvasWidth = Math.min(1080, window.innerWidth * 0.9);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = maxCanvasWidth;
        canvas.height = maxCanvasWidth;

        // Dibujar la imagen seleccionada redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Dibujar el recuadro blanco con el texto en la imagen
        const rectWidth = canvas.width * 0.85;
        const rectHeight = 240 + (users.length - 1) * 35 + 50;
        const rectX = (canvas.width - rectWidth) / 2;
        const rectY = (canvas.height - rectHeight) / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

        // Función para ajustar el texto a líneas múltiples y calcular altura
        function wrapText(context, text, x, y, maxWidth, lineHeight) {
            const words = text.split(' ');
            let line = '';
            const lines = [];

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            for (let k = 0; k < lines.length; k++) {
                context.fillText(lines[k], x, y + k * lineHeight);
            }
            return lines.length * lineHeight; // Devolver la altura total del texto
        }

        // Dibujar el texto en la imagen
        const titleFontSize = 48;
        const fontSize = 32;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = canvas.width / 2;
        let currentY = rectY + titleFontSize;

        // Dibujar la primera línea de texto como título
        const titleText = `"${specialTitle}" se celebra el ${resultText}`;
        ctx.font = `${titleFontSize}px Arial`;
        const titleHeight = wrapText(ctx, titleText, textX, currentY, rectWidth - 20, titleFontSize + 10);

        // Ajustar la posición Y después del título
        currentY += titleHeight + 30; // Espacio entre el título y la siguiente línea

        // Dibujar la frase "y celebras con " antes de los usuarios
        const celebrateWithText = "y celebras con ";
        ctx.font = `${fontSize}px Arial`;
        const celebrateWithHeight = wrapText(ctx, celebrateWithText, textX, currentY, rectWidth - 20, fontSize + 10);

        // Ajustar la posición Y después de la frase "y celebras con "
        currentY += celebrateWithHeight + 30;

        // Dibujar las líneas de usuarios con espacio adicional
        ctx.font = `${fontSize}px Arial`;
        for (let i = 0; i < users.length; i += 5) {
            ctx.fillText(users.slice(i, i + 5).join(', '), textX, currentY);
            currentY += fontSize + 10;
        }

        // Actualizar el enlace de descarga con la imagen generada
        downloadLink.href = canvas.toDataURL();
        resultImage.appendChild(downloadLink);

        // Mostrar la imagen generada
        const imgElement = new Image();
        imgElement.src = canvas.toDataURL();
        imgElement.style.maxWidth = '100%';
        imgElement.style.height = 'auto';
        resultImage.appendChild(imgElement);
    };
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';

    words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && line.length > 0) {
            lines.push(line);
            line = word + ' ';
        } else {
            line = testLine;
        }
    });
    lines.push(line.trim());
    return lines;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.customImageUrl = e.target.result;
            // Añadir la imagen cargada al carrusel
            const carousel = document.querySelector('.carousel');
            const img = document.createElement('img');
            img.src = e.target.result;
            img.onclick = () => selectImage(e.target.result, img);
            img.onload = () => {
                img.width = 108;
                img.height = 108;
            };
            carousel.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}
