# JavaStudy — Simulador de sustentación (Programación II)

Plataforma web estática preparada a partir del proyecto `srcList.zip`, que contiene las clases **Lista.java**, **Nodo.java**, **Empleado.java** y **Main.java**.

## ¿Qué incluye?

- **50 preguntas de estudio** con respuesta modelo, explicación del comportamiento y fragmentos de Java relacionados.
- **Modo examen:** 10, 20 o 50 preguntas aleatorias de opción múltiple, por tema o todas; calificación y revisión de respuestas.
- **Sustentación oral:** 5, 10, 20 o 50 preguntas; permite escribir o decir una respuesta, mostrar la respuesta modelo y autoevaluarse.
- **Mis resultados:** historial de exámenes, autoevaluaciones y progreso por tema.
- **Código fuente:** lectura y descarga de las cuatro clases originales, sin modificaciones.
- **Diseño adaptable:** funciona en celulares y computadores.
- **Sin cuentas ni backend:** el progreso se guarda en el navegador de cada estudiante mediante `localStorage`.

> Los resultados se guardan en **cada dispositivo y navegador**, no se comparten con el resto del grupo y pueden perderse si se borran los datos de navegación. Las prácticas orales son autoevaluadas; no hay reconocimiento ni evaluación automática de voz.

## Probarlo en tu computador

1. Descomprime `JavaStudy_Simulador.zip`.
2. Abre la carpeta `java-study-simulador`.
3. Abre `index.html` haciendo doble clic. No necesita instalar Java, Node ni otros programas.

## Publicarlo GRATIS y compartir un enlace: GitHub Pages

1. Inicia sesión en https://github.com/ y crea un repositorio **público** llamado, por ejemplo, `java-study-simulador`.
2. En la página del repositorio, utiliza **Add file → Upload files** y sube **el contenido de la carpeta `java-study-simulador`**, no el ZIP ni una carpeta envolvente. Al terminar, `index.html` debe aparecer directamente en la raíz del repositorio, junto a `app.js`, `data.js`, `sources.js`, `styles.css`, `.nojekyll` y `fuentes/`.
3. Confirma los archivos mediante el botón **Commit changes**.
4. En el repositorio abre **Settings → Pages**. En *Build and deployment*, selecciona **Source → Deploy from a branch**, **Branch → main**, **Folder → /(root)** y guarda (**Save**).
5. GitHub mostrará la dirección de tu página cuando termine de publicarla. El formato habitual para un repositorio de proyecto es `https://TU-USUARIO.github.io/java-study-simulador/`. **Reemplaza `TU-USUARIO` por tu cuenta real**. Ese será el enlace que compartirás con el grupo.

Documentación oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

**Importante:** este ZIP deja el sitio listo para publicar, pero **no publica la página por sí mismo** ni crea automáticamente un enlace público. Para ello necesitas realizar los pasos en tu cuenta GitHub.

## Estructura

```text
java-study-simulador/
├── index.html        Página principal y navegación
├── styles.css        Diseño responsive
├── data.js           Banco de 50 preguntas, respuestas y opciones
├── app.js            Lógica de los tres modos y progreso
├── sources.js        Copia incorporada de los cuatro archivos Java
├── .nojekyll         Archivo para publicar sin procesamiento Jekyll
├── fuentes/
│   ├── Lista.java
│   ├── Nodo.java
│   ├── Empleado.java
│   └── Main.java
└── README.md         Esta guía
```

## Ajustes futuros

- Cambiar preguntas y respuestas: editar `data.js`.
- Modificar colores y fuentes: editar `styles.css`.
- Modificar navegación y lógica: editar `app.js`.

Los archivos `fuentes/*.java` se incluyen únicamente para consulta y corresponden al contenido original recibido.
